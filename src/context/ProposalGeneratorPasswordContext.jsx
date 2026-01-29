import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ProposalGeneratorPasswordContext = createContext();

export const useProposalAuth = () => {
  const context = useContext(ProposalGeneratorPasswordContext);
  if (!context) {
    throw new Error('useProposalAuth must be used within a ProposalGeneratorPasswordProvider');
  }
  return context;
};

export const ProposalGeneratorPasswordProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session storage for temporary session
    const storedAuth = sessionStorage.getItem('proposal_auth_session');

    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const authenticate = async (password) => {
    console.log("Authenticating Proposal Access (Strict User-Based)...");

    // 1. Check if user is logged in
    if (!user) {
      console.warn("Authentication Failed: User not logged in.");
      return { success: false, message: "Please log in to your account first." };
    }

    // 2. Check Subscription Status (Must be 'active')
    // We check the 'profiles' table directly because user_metadata might be stale.
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Profile Fetch Error:", profileError);
      return { success: false, message: "Could not verify account status. Please contact support." };
    }

    const status = profileData?.subscription_status;
    const role = profileData?.role;

    console.log(`Live Profile Check -> User: ${user.email}, Role: ${role}, Status: ${status}`);

    if (role !== 'admin' && status !== 'active') {
      console.warn(`Authentication Failed: Status is '${status}'.`);
      return { success: false, message: "Your account is not approved by the Admin yet." };
    }

    // 3. Check against User's Transaction ID OR Access Token (Convenience Fallback)
    // The user might prefer entering their unique ID instead of their full login password again.
    const transactionId = user?.user_metadata?.transaction_id;
    const accessToken = user?.user_metadata?.access_token;

    if ((transactionId && password === transactionId) || (accessToken && password === accessToken)) {
      console.log("Success: Matched User's Transaction ID / Token");
      setIsAuthenticated(true);
      sessionStorage.setItem('proposal_auth_session', 'true');
      return { success: true };
    }

    // 4. Verify Account Password (Strict Re-Authentication)
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    });

    if (!error) {
      console.log("Success: Valid Account Password");
      setIsAuthenticated(true);
      sessionStorage.setItem('proposal_auth_session', 'true');
      return { success: true };
    } else {
      console.warn("Re-auth failed:", error.message);
      // Distinguish between wrong password and other errors
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, message: "Incorrect login password. (You can also use your Transaction ID)" };
      }
      return { success: false, message: error.message };
    }
  };
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('proposal_auth_session');
  };

  return (
    <ProposalGeneratorPasswordContext.Provider value={{ isAuthenticated, isLoading, authenticate, logout, user }}>
      {children}
    </ProposalGeneratorPasswordContext.Provider>
  );
};