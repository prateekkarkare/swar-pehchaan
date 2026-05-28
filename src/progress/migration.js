/**
 * One-time migration: legacy v1 sessions → v2 attempts.
 *
 * v1 stored full sessions with batched questions. v2 stores
 * one row per swara attempt. We explode each legacy question
 * into N attempts (one per played note).
 */
import {
  LEGACY_STORAGE_KEY,
  LEGACY_MIGRATED_FLAG,
  SWARA_SEMITONES,
} from './schema.js';
import { ulid } from '../lib/ulid.js';

export function isLegacyMigrated() {
  return localStorage.getItem(LEGACY_MIGRATED_FLAG) === '1';
}

export function markLegacyMigrated() {
  localStorage.setItem(LEGACY_MIGRATED_FLAG, '1');
}

export function migrateLegacySessions() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    if (!Array.isArray(sessions)) return [];

    const attempts = [];
    for (const s of sessions) {
      const baseTs = new Date(s.timestamp || Date.now()).getTime();
      const sessionId = s.id || `sess_legacy_${ulid()}`;
      for (let qi = 0; qi < (s.questions?.length ?? 0); qi++) {
        const q = s.questions[qi];
        if (!q?.played?.length) continue;
        const questionId = `q_legacy_${sessionId}_${qi}`;
        const perNoteMs = Math.round((q.timeMs || 0) / q.played.length);
        for (let pi = 0; pi < q.played.length; pi++) {
          const played = q.played[pi];
          const answered = q.answered?.[pi] ?? null;
          const prev = pi > 0 ? q.played[pi - 1] : null;
          const interval =
            prev != null
              ? (SWARA_SEMITONES[played] ?? 0) - (SWARA_SEMITONES[prev] ?? 0)
              : null;
          attempts.push({
            id: ulid(),
            userId: 'local',
            ts: baseTs + qi * 1000 + pi * 100,
            sessionId,
            questionId,
            position: pi,
            played,
            answered,
            correct: played === answered,
            responseMs: perNoteMs,
            ctx: {
              mode: s.mode || 'swara',
              levelId: s.levelId,
              levelNumber: s.levelNumber,
              questionLength: q.played.length,
              prevPlayed: prev,
              intervalSemitones: interval,
              direction:
                interval == null
                  ? null
                  : interval > 0
                    ? 'up'
                    : interval < 0
                      ? 'down'
                      : 'same',
              key: s.key,
              instrument: s.instrument,
              source: 'legacy_v1',
            },
          });
        }
      }
    }
    return attempts;
  } catch (e) {
    console.warn('Legacy migration failed', e);
    return [];
  }
}
