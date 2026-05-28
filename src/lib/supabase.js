/**
 * Supabase client (lazy-init).
 *
 * Returns `null` if env vars are not configured — the app
 * gracefully falls back to localStorage in that case.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'swar-sadhana-auth',
        },
      })
    : null;

export function isSupabaseEnabled() {
  return supabase !== null;
}
