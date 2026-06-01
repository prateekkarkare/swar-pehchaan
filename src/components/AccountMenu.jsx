import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { signOut } from '../lib/auth.js';

/**
 * Account button + dropdown for the top nav. Renders nothing when auth
 * is disabled (local dev without Supabase).
 */
export default function AccountMenu() {
  const { user, authEnabled } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!authEnabled || !user) return null;

  const meta = user.user_metadata || {};
  const name = meta.full_name || meta.name || user.email || 'Account';
  const email = user.email || '';
  const avatarUrl = meta.avatar_url || meta.picture || null;
  const initial = (name || email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="account-menu" ref={ref}>
      <button
        className="btn-account"
        onClick={() => setOpen((o) => !o)}
        title={email}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="account-avatar" referrerPolicy="no-referrer" />
        ) : (
          <span className="account-initial">{initial}</span>
        )}
      </button>
      {open && (
        <div className="account-dropdown">
          <div className="account-info">
            <div className="account-name">{name}</div>
            {email && <div className="account-email">{email}</div>}
          </div>
          <button className="account-signout" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
