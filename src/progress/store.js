/**
 * Progress store — public async API.
 *
 * Picks adapter automatically:
 *   - Supabase if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
 *   - localStorage otherwise
 *
 * All UI code should go through this module (writes) and `queries.js` (reads).
 * Never touch localStorage / supabase directly from UI components.
 *
 * The API is fully Promise-based even when running locally, so the
 * cloud migration is a no-op at every call site.
 */
import { localAdapter } from './adapters/localAdapter.js';
import { supabaseAdapter } from './adapters/supabaseAdapter.js';
import { isSupabaseEnabled } from '../lib/supabase.js';
import {
  migrateLegacySessions,
  isLegacyMigrated,
  markLegacyMigrated,
} from './migration.js';
import { ulid } from '../lib/ulid.js';

const adapter = isSupabaseEnabled() ? supabaseAdapter : localAdapter;

let migrationPromise = null;
let cache = null;

async function ensureMigrated() {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    if (isLegacyMigrated()) return;
    const legacy = migrateLegacySessions();
    if (legacy.length > 0) {
      try {
        await adapter.addAttempts(legacy);
      } catch (e) {
        console.warn('Failed to import legacy attempts', e);
      }
    }
    markLegacyMigrated();
  })();
  return migrationPromise;
}

/**
 * Append attempts to the log. Caller may omit `id`, `ts`, `userId`
 * and they will be filled in.
 */
export async function addAttempts(attempts) {
  if (!attempts?.length) return;
  await ensureMigrated();
  const now = Date.now();
  const enriched = attempts.map((a) => ({
    ...a,
    id: a.id || ulid(),
    userId: a.userId || 'local',
    ts: a.ts ?? now,
  }));
  await adapter.addAttempts(enriched);
  cache = null;
}

/**
 * Return all attempts. Cached in-memory until next mutation.
 */
export async function getAllAttempts() {
  await ensureMigrated();
  if (cache) return cache;
  cache = await adapter.getAllAttempts();
  return cache;
}

export async function clearAll() {
  await adapter.clearAll();
  cache = null;
  // Also clear legacy data so a fresh migration won't re-import.
  try {
    localStorage.removeItem('ear-training-progress');
  } catch {}
}

export async function exportAll() {
  await ensureMigrated();
  return adapter.exportAll();
}

export async function importAll(blob) {
  await adapter.importAll(blob);
  cache = null;
}

export function invalidateCache() {
  cache = null;
}

export function makeSessionId() {
  return `sess_${ulid()}`;
}

export function makeQuestionId() {
  return `q_${ulid()}`;
}

export function activeAdapterName() {
  return adapter.name;
}

export { isSupabaseEnabled };
