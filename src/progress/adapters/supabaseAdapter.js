/**
 * Supabase adapter — stores attempts in a `attempts` Postgres table.
 *
 * Uses Supabase anonymous auth so each browser gets a stable user id
 * without forcing the user to sign up. Row-level security keys all data
 * to that user id (see SUPABASE_SETUP.md).
 */
import { supabase } from '../../lib/supabase.js';
import { SCHEMA_VERSION } from '../schema.js';

async function ensureSession() {
  if (!supabase) throw new Error('Supabase not configured');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user.id;
}

function attemptToRow(a, userId) {
  return {
    id: a.id,
    user_id: userId,
    ts: new Date(a.ts).toISOString(),
    session_id: a.sessionId,
    question_id: a.questionId,
    position: a.position,
    played: a.played,
    answered: a.answered,
    correct: a.correct,
    response_ms: a.responseMs,
    ctx: a.ctx ?? {},
  };
}

function rowToAttempt(r) {
  return {
    id: r.id,
    userId: r.user_id,
    ts: new Date(r.ts).getTime(),
    sessionId: r.session_id,
    questionId: r.question_id,
    position: r.position,
    played: r.played,
    answered: r.answered,
    correct: r.correct,
    responseMs: r.response_ms,
    ctx: r.ctx || {},
  };
}

export const supabaseAdapter = {
  name: 'supabase',

  async getAllAttempts() {
    const userId = await ensureSession();
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .order('ts', { ascending: true });
    if (error) throw error;
    return (data || []).map(rowToAttempt);
  },

  async addAttempts(newAttempts) {
    if (!newAttempts?.length) return;
    const userId = await ensureSession();
    const rows = newAttempts.map((a) => attemptToRow(a, userId));
    // Use upsert by id to make inserts idempotent (safe to replay).
    const { error } = await supabase
      .from('attempts')
      .upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },

  async clearAll() {
    const userId = await ensureSession();
    const { error } = await supabase
      .from('attempts')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  },

  async exportAll() {
    const attempts = await this.getAllAttempts();
    return { schemaVersion: SCHEMA_VERSION, attempts };
  },

  async importAll(blob) {
    await this.clearAll();
    if (blob?.attempts?.length) await this.addAttempts(blob.attempts);
  },
};
