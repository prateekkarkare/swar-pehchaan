import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getCurrentUser,
  onAuthChange,
  isSupabaseEnabled,
} from '../lib/auth.js';

const AuthContext = createContext({
  user: null,
  loading: true,
  authEnabled: false,
});

export function AuthProvider({ children }) {
  const authEnabled = isSupabaseEnabled();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(authEnabled);

  useEffect(() => {
    if (!authEnabled) {
      // Local dev without Supabase — no auth gate.
      setLoading(false);
      return;
    }
    let active = true;
    getCurrentUser()
      .then((u) => {
        if (active) {
          setUser(u);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => {
      active = false;
      unsub();
    };
  }, [authEnabled]);

  return (
    <AuthContext.Provider value={{ user, loading, authEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
