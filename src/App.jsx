import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import AdminDashboard from '@/pages/AdminDashboard';
import ClientDashboard from '@/pages/ClientDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;