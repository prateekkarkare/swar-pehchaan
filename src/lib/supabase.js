/**
 * Supabase client (lazy-init).
 *
 * Returns `null` if env vars are not configured — the app
 * gracefully falls back to localStorage in that case.
 */
import { createClient } from '@supabase/supabase-js';

function cleanUrl(raw) {
  if (!raw) return '';
  // Strip whitespace, surrounding quotes, and any trailing slashes / paths.
  let u = String(raw).trim().replace(/^["']|["']$/g, '');
  // Drop anything after the host (e.g. accidental /rest/v1 or trailing /).
  try {
    const parsed = new URL(u);
    u = `${parsed.protocol}//${parsed.host}`;
  } catch {
    u = u.replace(/\/+$/, '');
  }
  return u;
}

function cleanKey(raw) {
  if (!raw) return '';
  return String(raw).trim().replace(/^["']|["']$/g, '');
}

const url = cleanUrl(import.meta.env.VITE_SUPABASE_URL);
const anonKey = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (import.meta.env.DEV && url && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL looks unusual:',
    url,
    '— expected https://<project-ref>.supabase.co',
  );
}
if (import.meta.env.DEV && anonKey && !anonKey.startsWith('eyJ')) {
  console.warn(
    '[supabase] VITE_SUPABASE_ANON_KEY does not look like a JWT (should start with "eyJ").',
  );
}

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
