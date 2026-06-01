import React from 'react';
import { useAuth } from './AuthContext.jsx';
import Login from './Login.jsx';

/**
 * Gates the app behind Google sign-in when Supabase is configured.
 * In local dev without Supabase, renders children directly.
 */
export default function AuthGate({ children }) {
  const { user, loading, authEnabled } = useAuth();

  if (!authEnabled) return children;

  if (loading) {
    return (
      <div className="auth-splash">
        <div className="pulse-dot active" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  return children;
}
