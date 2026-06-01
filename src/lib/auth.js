/**
 * Auth helpers — thin wrappers over Supabase auth.
 *
 * Google OAuth only. When Supabase isn't configured (local dev without
 * env vars), these are inert and the app runs in unauthenticated local mode.
 */
import { supabase, isSupabaseEnabled } from './supabase.js';

/**
 * The URL Supabase redirects back to after Google sign-in.
 * Includes the Vite base path so it works on GitHub Pages
 * (https://…/swar-pehchaan/) as well as local dev.
 */
function redirectTo() {
  const base = import.meta.env.BASE_URL || '/';
  return `${window.location.origin}${base}`;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectTo() },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

/**
 * Subscribe to auth changes. Returns an unsubscribe function.
 */
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}

export { isSupabaseEnabled };
