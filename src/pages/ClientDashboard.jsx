import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '../lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, User, Building2, MapPin, Phone, CreditCard } from 'lucide-react';

const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <p>Profile not found.</p>
                <Button onClick={handleLogout} variant="destructive" className="mt-4">Logout</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-none">Client Portal</h1>
                            <p className="text-xs text-slate-500 mt-0.5">EDI Enviro Dashboard</p>
                        </div>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <User className="w-12 h-12 text-slate-400" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{profile.full_name || 'Client Name'}</h2>
                                <p className="text-slate-500 text-sm">{profile.email}</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-3 capitalize">
                                    {profile.role || 'Client'} Account
                                </span>
                            </div>

                            <div className="space-y-4 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600">{profile.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <span className="text-slate-600">
                                        {[profile.address, profile.city, profile.state, profile.zip].filter(Boolean).join(', ') || 'No address provided'}
                                    </span>
                                </div>
                                {profile.company_name && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600">{profile.company_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Subscription Status */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-emerald-400 mb-1 uppercase tracking-wider">Active Subscription</h3>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <h2 className="text-4xl font-bold">Standard Plan</h2>
                                    <span className="text-slate-400">/ Monthly</span>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Status</p>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            Active
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Next Billing</p>
                                        <p className="font-mono text-lg">Oct 24, 2026</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Placeholder */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activities</h3>
                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <CreditCard className="w-8 h-8 text-slate-400" />
                                </div>
                                <h4 className="text-slate-900 font-medium mb-1">No recent transactions</h4>
                                <p className="text-sm max-w-xs mx-auto">Your recent payments and account activities will appear here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;
