import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize System State
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Auth Functions ---

  const login = useCallback(async (email, password) => {
    // 1. Try Signing In
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // 2. Fallback: If Admin and "Invalid login credentials", try Creating the Account automatically
    // This helps if the user skipped the registration step.
    if (error && (email === 'md@edienviro.com' || email === 'admin@demo.com') && error.message.includes('Invalid login credentials')) {
      console.log("Admin account not found (or wrong pass). Attempting auto-registration for Admin...");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'admin', full_name: 'Master Admin' } }
      });

      if (!signUpError && signUpData.user) {
        // Auto-registration successful.
        // Profile creation is now handled by the DB Trigger 'on_auth_user_created'.

        // If Supabase allows sign-in immediately (confirm email off), we are good.
        // If it requires confirmation, we must warn user.
        if (signUpData.session) {
          return { success: true, user: signUpData.user };
        } else {
          return { success: false, error: "Admin Account Created! Please check your email to confirm registration." };
        }
      }
    }

    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  }, []);

  const logout = useCallback(async () => {
    // Attempt sign out, but always clear local user state to ensure UI updates
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // --- Client Request Functions ---



  const submitSignupRequest = useCallback(async (requestData) => {
    // requestData: { name, email, password, paymentProof (File or ID), transactionId }
    let paymentProofUrl = null;

    try {
      // 1. Upload Payment Proof (if File object provided)
      if (requestData.paymentProof && typeof requestData.paymentProof === 'object') {
        const file = requestData.paymentProof;
        const fileExt = file.name.split('.').pop();
        const fileName = `proofs/${Date.now()}_${requestData.email.replace(/[^a-z0-9]/gi, '_').substring(0, 10)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Proof upload failed:", uploadError);
          throw new Error("Failed to upload payment proof. Please try again.");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(fileName);
          paymentProofUrl = publicUrl;
        }
      }
    } catch (err) {
      console.error("Upload Logic Error:", err);
      return { success: false, error: err.message || "Upload failed." };
    }

    // 2. Sign Up User in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: requestData.email,
      password: requestData.password,
      options: {
        data: {
          full_name: requestData.name,
          transaction_id: requestData.transactionId,
          role: (requestData.email === 'md@edienviro.com' || requestData.email === 'admin@demo.com') ? 'admin' : 'client',
          payment_proof_id: requestData.paymentProofId || 'uploaded', // Legacy or fallback
          payment_proof_url: paymentProofUrl, // New URL field
          subscription_status: 'pending',
          /* Company / Billing Details Map */
          account_type: requestData.accountType,
          company_name: requestData.accountType === 'company' ? (requestData.companyName || '') : '',
          company_gst: requestData.accountType === 'company' ? (requestData.companyGst || '') : '',

          // Address Details
          billing_address: requestData.address || '',
          city: requestData.city || '',
          state: requestData.state || '',
          zip: requestData.zip || '',
          phone: requestData.phone || '',
          country: 'India', // Default as per UI

          // Legacy composite fields (kept for safety)
          company_address: `${requestData.address || ''}, ${requestData.city || ''}, ${requestData.state || ''} - ${requestData.zip || ''}`,
          company_phone: requestData.phone || '',
          company_email: requestData.companyEmail || requestData.email
        }
      }
    });

    if (authError) return { success: false, error: authError.message };

    return { success: true, user: authData.user };
  }, []);

  // --- Admin Functions ---



  const getRequests = useCallback(async () => {
    // Fetch from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
    return data;
  }, []);

  const handleRequest = useCallback(async (userId, action, durationMonths = 12) => { // action: 'approve' | 'reject' | 'enable' | 'disable'
    // Update profile status
    let updates = {};
    let emailTrigger = null;

    if (action === 'approve' || action === 'enable') {
      const now = new Date();
      const expirationDate = new Date();
      expirationDate.setMonth(now.getMonth() + parseInt(durationMonths));

      // Generate Random Token (e.g., EDI-AB12CD)
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newToken = `EDI-${randomString}`;

      updates = {
        subscription_status: 'active',
        subscription_start: now.toISOString(),
        subscription_end: expirationDate.toISOString(),
        // Only set token if it doesn't exist? Or always refresh?
        // Let's set it if we are approving (so enable keeps old one if we want, but simpler to just set updates)
        // If action is distinct 'approve', generate new. If 'enable', maybe keep?
        // The prompt says "generate a token... once approved".
        // Let's generate it on 'approve'.
      };

      if (action === 'approve') {
        updates.access_token = newToken;

        // Prepare Email Trigger (Fetch user details first)
        emailTrigger = {
          type: 'verify',
          token: newToken,
          expiry: expirationDate.toISOString()
        };
      }
    } else if (action === 'disable') {
      updates = {
        subscription_status: 'disabled'
      };
    } else {
      updates = {
        subscription_status: 'rejected'
      };

      // Prepare Email Trigger for Rejection
      emailTrigger = {
        type: 'reject'
      };
    }

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select() // Select back to get email and name
      .single();

    if (error) return { success: false, error: error.message };

    // --- TRIGGER EMAIL ---
    if (emailTrigger && updatedUser) {
      try {
        const { sendVerificationEmail, sendRejectionEmail } = await import('@/lib/emailService');

        if (emailTrigger.type === 'verify') {
          await sendVerificationEmail(updatedUser.email, updatedUser.full_name, emailTrigger.token, emailTrigger.expiry);
          console.log("Verification Email Sent to", updatedUser.email);
        } else if (emailTrigger.type === 'reject') {
          await sendRejectionEmail(updatedUser.email, updatedUser.full_name);
          console.log("Rejection Email Sent to", updatedUser.email);
        }
      } catch (err) {
        console.error("Failed to send email", err);
      }
    }

    return { success: true };
  }, []);




  // New Helper: Resend Verification
  async function resendVerification(email) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // New Helper: Reset Password
  const resetPassword = useCallback(async (email) => {
    // Determine redirect URL (e.g., to a dedicated reset page or just back to login)
    // For now, let's redirect to the auth page with mode=reset-password if supported, 
    // or just the root. Supabase handles the link.
    const redirectTo = window.location.origin + '/auth?mode=update-password';

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  // New Helper: Update Password
  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    submitSignupRequest,
    getRequests,
    handleRequest,
    resendVerification,
    resetPassword,
    updatePassword
  }), [user, loading, login, logout, submitSignupRequest, getRequests, handleRequest, resetPassword, updatePassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);