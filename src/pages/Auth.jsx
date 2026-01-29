import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2, Upload, QrCode, ChevronRight, CheckCircle, ShieldCheck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getRegistrationFee } from '@/lib/settingsService';

const Auth = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, submitSignupRequest, getQRCode, resendVerification } = useAuth();
    const { toast } = useToast();

    // Initialize mode based on URL param 'mode' or default to 'welcome'
    // url?mode=login -> 'client-login'
    // url?mode=admin -> 'admin-login'
    const initialModeParam = searchParams.get('mode');
    const getInitialMode = () => {
        if (initialModeParam === 'login') return 'client-login';
        if (initialModeParam === 'admin') return 'admin-login';
        return 'welcome';
    };

    const [mode, setMode] = useState(getInitialMode()); // 'welcome' | 'signup-step-1' | 'billing-summary' | 'signup-step-2' | 'signup-success' | 'admin-login' | 'client-login'
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [fee, setFee] = useState('69');

    useEffect(() => {
        getRegistrationFee().then(setFee);
    }, []);

    // Form Data
    const [data, setData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        transactionId: '', paymentProof: null,
        // Billing / Company Details
        accountType: 'individual', // 'individual' | 'company'
        companyName: '', companyGst: '',
        address: '', city: '', state: '', zip: '', phone: ''
    });

    // Remove showCompanyDetails state as we use accountType now
    // const [showCompanyDetails, setShowCompanyDetails] = useState(false);

    useEffect(() => {
        setQrCodeUrl(getQRCode());
    }, [getQRCode]);

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setData({ ...data, paymentProof: e.target.files[0] });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(data.email, data.password);
        if (result.success) {
            toast({ title: "Authenticated", description: "Accessing secure environment..." });
            // Check if user is admin explicitly via metadata or fallback email check
            const isRoleAdmin = result.user?.user_metadata?.role === 'admin';
            const isEmailAdmin = data.email.includes('admin') || data.email.includes('edienviro');

            if (isRoleAdmin || isEmailAdmin) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            console.error("Login Error:", result.error);
            if (result.error && (result.error.includes('email_not_confirmed') || result.error.includes('Email not confirmed'))) {
                toast({
                    title: "Email Verification Required",
                    description: "Account exists but is not verified.",
                    variant: "destructive",
                    action: (
                        <div className="flex flex-col gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    const res = await resendVerification(data.email);
                                    if (res.success) {
                                        toast({ title: "Email Sent", description: "Check your inbox for the verification link." });
                                    } else {
                                        toast({ title: "Error", description: res.error, variant: "destructive" });
                                    }
                                }}
                                className="bg-white text-black hover:bg-slate-200"
                            >
                                Resend Verification Email
                            </Button>
                        </div>
                    ),
                    duration: 10000,
                });
            } else {
                toast({ title: "Access Denied", description: result.error, variant: "destructive" });
            }
        }
        setIsLoading(false);
    };

    const handleInitialSignup = async (e) => {
        e.preventDefault();
        if (data.password !== data.confirmPassword) {
            toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
            return;
        }
        if (data.password.length < 6) {
            toast({ title: "Weak Password", description: "Must be at least 6 characters.", variant: "destructive" });
            return;
        }
        setMode('billing-summary');
    };

    const handleFinalSignup = async (e) => {
        e.preventDefault();

        if (!data.transactionId) {
            toast({ title: "Payment Required", description: "Please enter the Transaction ID.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        // Simulate upload delay
        await new Promise(r => setTimeout(r, 1000));

        const cleanEmail = data.email.trim();

        const result = await submitSignupRequest({
            name: data.name,
            email: cleanEmail,
            password: data.password,
            transactionId: data.transactionId,
            paymentProof: data.paymentProof, // Pass the File object directly
            // Consolidated Data
            accountType: data.accountType,
            companyName: data.accountType === 'company' ? data.companyName : '',
            companyGst: data.accountType === 'company' ? data.companyGst : '',
            // Address is used for both (Billing or Company)
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            phone: data.phone
        });

        if (result.success) {
            setMode('signup-success');
        } else {
            toast({ title: "Registration Failed", description: result.error, variant: "destructive" });
        }
        setIsLoading(false);
    };


    // Animations
    const backdropVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black text-white font-sans overflow-hidden relative selection:bg-emerald-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                {/* Image Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614195975309-a3baf592274f?q=80&w=2000&auto=format&fit=crop')" }}
                />
                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />

                {/* Subtle Gradient Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-transparent to-blue-900/40 opacity-60" />
            </div>

            {/* Back to Home Button */}
            <button
                onClick={() => navigate('/')}
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/40 hover:text-white transition-all duration-300 group hover:border-white/20"
            >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Back to Home</span>
            </button>

            {/* Main Container */}
            <div className={`relative z-10 w-full px-6 transition-all duration-500 ease-in-out ${mode === 'billing-summary' ? 'max-w-[1400px]' : 'max-w-md'}`}>
                <AnimatePresence mode="wait">

                    {/* MODE: WELCOME */}
                    {mode === 'welcome' && (
                        <motion.div
                            key="welcome"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <div className="relative z-10 text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mx-auto w-20 h-20 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-8 border border-white/10"
                                >
                                    <ShieldCheck className="text-white w-10 h-10" />
                                </motion.div>

                                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3 tracking-tight">
                                    Secure Portal
                                </h1>
                                <p className="text-slate-400 text-base font-light mb-10">
                                    Select your access pathway.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setMode('signup-step-1')}
                                        className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-900/20 border border-white/10"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Client Registration</span>
                                            <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>

                                    {/* Client Login Button Removed as per request */}

                                    <button
                                        onClick={() => setMode('admin-login')}
                                        className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-4 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        Admin Authentication
                                    </button>
                                </div>

                                <div className="mt-10 flex items-center justify-center space-x-2 opacity-50">
                                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500">EDI Enviro System v2.0</p>
                                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* MODE: CLIENT LOGIN */}
                    {mode === 'client-login' && (
                        <motion.div
                            key="client-login"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <button onClick={() => setMode('welcome')} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="text-center mt-8 mb-8">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Client Access</h2>
                                <p className="text-slate-400 text-sm mt-1">Log in to view your proposals.</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <input name="email" type="email" value={data.email} onChange={handleChange} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
                                            placeholder="client@company.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Password</label>
                                    <input name="password" type="password" value={data.password} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-6 text-lg font-bold shadow-lg shadow-emerald-900/20 mt-4 border border-white/10" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* MODE: ADMIN LOGIN */}
                    {mode === 'admin-login' && (
                        <motion.div
                            key="admin"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <button onClick={() => setMode('welcome')} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="text-center mt-8 mb-8">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Admin Access</h2>
                                <p className="text-slate-400 text-sm mt-1">Authorized personnel only.</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Email Identity</label>
                                    <div className="relative group">
                                        <input name="email" type="email" value={data.email} onChange={handleChange} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
                                            placeholder="admin@edi.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Secure Key</label>
                                    <input name="password" type="password" value={data.password} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 py-6 text-lg font-bold shadow-lg shadow-emerald-900/20 mt-4 border border-white/10" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Authenticate Session"}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* MODE: SIGNUP STEP 1 */}
                    {mode === 'signup-step-1' && (
                        <motion.div
                            key="step1"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={() => setMode('welcome')} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider">STEP 1 / 2</span>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">Create Identity</h2>
                                <p className="text-slate-400 text-sm">Initialize your client profile.</p>
                            </div>

                            <form onSubmit={handleInitialSignup} className="space-y-4">
                                <input name="name" placeholder="Full Organization / User Name" value={data.name} onChange={handleChange} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                />
                                <input name="email" type="email" placeholder="Official Email Address" value={data.email} onChange={handleChange} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="password" type="password" placeholder="Password" value={data.password} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                    />
                                    <input name="confirmPassword" type="password" placeholder="Confirm" value={data.confirmPassword} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                <Button className="w-full bg-white text-black hover:bg-slate-200 py-6 text-base font-bold mt-6 shadow-lg shadow-white/10 transition-transform active:scale-[0.98]">
                                    Proceed to Verification <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* MODE: BILLING SUMMARY (New Step 1.5) */}
                    {mode === 'billing-summary' && (
                        <motion.div
                            key="billing"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative w-full"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={() => setMode('signup-step-1')} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">STEP 2 / 3</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Left Side: Billing Details Form (8 cols) */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="border-b border-white/10 pb-6 mb-6">
                                        <h2 className="text-3xl font-bold text-white mb-2">Registration Details</h2>
                                        <p className="text-slate-400">Please provide your contact information.</p>
                                    </div>

                                    {/* Account Type Toggle */}
                                    <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/10">
                                        <button
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.accountType === 'individual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                            onClick={() => setData({ ...data, accountType: 'individual' })}
                                        >
                                            Individual
                                        </button>
                                        <button
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.accountType === 'company' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                            onClick={() => setData({ ...data, accountType: 'company' })}
                                        >
                                            Company / Business
                                        </button>
                                    </div>

                                    {/* Company Specific Fields */}
                                    <div className={`space-y-6 overflow-hidden transition-all duration-500 ease-in-out ${data.accountType === 'company' ? 'max-h-[200px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs text-purple-400 uppercase font-bold tracking-wider">Company Name</label>
                                                <input
                                                    name="companyName"
                                                    value={data.companyName}
                                                    onChange={handleChange}
                                                    placeholder="Business Name"
                                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-5 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-purple-400 uppercase font-bold tracking-wider">GSTIN</label>
                                                <input
                                                    name="companyGst"
                                                    value={data.companyGst}
                                                    onChange={handleChange}
                                                    placeholder="GST Number"
                                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-5 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Common Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Contact Phone</label>
                                            <input
                                                name="phone"
                                                type="number"
                                                value={data.phone}
                                                onChange={handleChange}
                                                placeholder="Mobile Number"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Country</label>
                                            <input placeholder="Country" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all" defaultValue="India" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">{data.accountType === 'company' ? 'Company Address' : 'Billing Address'}</label>
                                        <input
                                            name="address"
                                            value={data.address}
                                            onChange={handleChange}
                                            placeholder="Street Address"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">City</label>
                                            <input
                                                name="city"
                                                value={data.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">State</label>
                                            <input
                                                name="state"
                                                value={data.state}
                                                onChange={handleChange}
                                                placeholder="State"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">ZIP</label>
                                            <input
                                                name="zip"
                                                value={data.zip}
                                                onChange={handleChange}
                                                placeholder="ZIP Code"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>


                                {/* Right Side: Summary Card (4 cols) */}
                                < div className="lg:col-span-4 space-y-6" >
                                    <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-fit sticky top-6">
                                        {/* Decorative Circles */}
                                        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-purple-200 rounded-full blur-2xl opacity-60" />
                                        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-emerald-200 rounded-full blur-2xl opacity-60" />

                                        <h3 className="font-bold text-2xl mb-6 relative z-10 tracking-tight">Order Summary</h3>

                                        <div className="space-y-4 mb-8 relative z-10">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-slate-600">Enterprise Plan</span>
                                                <span className="font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">Standard</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Registration Fee</span>
                                                <span className="font-bold font-mono text-base">₹{fee}.00</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Service Tax</span>
                                                <span className="text-slate-400 italic">--</span>
                                            </div>
                                            <div className="h-px bg-slate-200 my-2" />
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-xl">Total</span>
                                                <span className="font-extrabold text-3xl font-mono text-purple-600">₹{fee}.00</span>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 text-emerald-800 text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center mb-8 border border-emerald-100 gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>SSL Secure Payment</span>
                                        </div>

                                        <Button
                                            onClick={() => setMode('signup-step-2')}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 text-lg rounded-xl shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Continue to Payment
                                        </Button>

                                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>30-day money-back guarantee</span>
                                        </div>
                                    </div>
                                </div >
                            </div >
                        </motion.div >
                    )}

                    {/* MODE: SIGNUP STEP 2 (Payment) */}
                    {
                        mode === 'signup-step-2' && (
                            <motion.div
                                key="step2"
                                variants={backdropVariants}
                                initial="hidden" animate="visible" exit="exit"
                                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={() => setMode('billing-summary')} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider">STEP 3 / 3</span>
                                </div>

                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Final Verification</h2>
                                    <p className="text-slate-400 text-sm">Scan QR & Upload Proof.</p>
                                </div>

                                <div className="bg-white p-4 rounded-3xl w-56 h-56 mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-emerald-900/20 relative">
                                    <div className="absolute inset-0 border-4 border-white/20 rounded-3xl pointer-events-none" />
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="Payment QR" className="w-full h-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <Loader2 className="animate-spin text-slate-400 w-10 h-10" />
                                    )}
                                </div>

                                <form onSubmit={handleFinalSignup} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Transaction Ref / UTR</label>
                                        <input name="transactionId" placeholder="e.g. UPI-1234567890" value={data.transactionId} onChange={handleChange} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-emerald-400 font-mono tracking-wide focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <input type="file" id="file_upload" className="hidden" onChange={handleFileChange} accept="image/*" />
                                        <label htmlFor="file_upload" className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl cursor-pointer bg-black/20 hover:bg-black/40 transition-all group-hover:text-emerald-400 text-slate-400 text-sm font-medium">
                                            <Upload className="w-6 h-6 mb-2 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                            {data.paymentProof ? (
                                                <span className="text-emerald-400 flex items-center bg-emerald-500/10 px-3 py-1 rounded-full text-xs border border-emerald-500/20">
                                                    <CheckCircle className="w-3 h-3 mr-1.5" />
                                                    {data.paymentProof.name.substring(0, 20)}...
                                                </span>
                                            ) : (
                                                <span className="group-hover:translate-y-[-2px] transition-transform">Tap to Upload Screenshot</span>
                                            )}
                                        </label>
                                    </div>

                                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-6 text-lg font-bold shadow-lg shadow-emerald-900/20 mt-4 border border-white/10" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                                    </Button>
                                </form>
                            </motion.div>
                        )
                    }

                    {/* MODE: SIGNUP SUCCESS */}
                    {
                        mode === 'signup-success' && (
                            <motion.div
                                key="success"
                                variants={backdropVariants}
                                initial="hidden" animate="visible" exit="exit"
                                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-cyan-500" />

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/40"
                                >
                                    <CheckCircle className="text-white w-12 h-12" />
                                </motion.div>

                                <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Access Requested</h2>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed font-light">
                                    Your profile is actively <span className="text-emerald-400 font-semibold border-b border-emerald-500/30 pb-0.5">pending validation</span>.
                                    <br /><span className="text-sm text-slate-500 mt-2 block">We will notify you upon administrative approval.</span>
                                </p>

                                <Button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-white text-slate-900 hover:bg-slate-200 py-6 text-base font-bold shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Return to Homepage
                                </Button>
                            </motion.div>
                        )
                    }

                </AnimatePresence >
            </div >
        </div >
    );
};

export default Auth;
