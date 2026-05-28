/**
 * Schema constants for the progress store.
 *
 * The data model is an append-only event log of swara attempts.
 * Every aggregate (per-swara mastery, sessions, intervals, presets, etc.)
 * is derived from this single source of truth at query time.
 *
 * This shape maps 1:1 to a relational table — see SUPABASE_SETUP.md.
 */

export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = 'swar-sadhana-progress-v2';
export const LEGACY_STORAGE_KEY = 'ear-training-progress';
export const LEGACY_MIGRATED_FLAG = 'swar-sadhana-legacy-migrated';

/**
 * Semitone offset relative to Sa (Sa = 0, Sa' = 12).
 * Used to compute intervals between consecutive notes in a sequence.
 */
export const SWARA_SEMITONES = {
  Sa: 0,
  re: 1,
  Re: 2,
  ga: 3,
  Ga: 4,
  Ma: 5,
  ma: 6,
  Pa: 7,
  dha: 8,
  Dha: 9,
  ni: 10,
  Ni: 11,
  "Sa'": 12,
};

/**
 * @typedef {Object} Attempt
 * @property {string}  id           Stable string ID (ULID).
 * @property {string}  userId       'local' if anonymous; auth UID when synced.
 * @property {number}  ts           Epoch ms.
 * @property {string}  sessionId    Groups attempts into a quiz session.
 * @property {string}  questionId   Groups attempts into a single question.
 * @property {number}  position     0-indexed position within the question.
 * @property {string}  played       Swara id that was played (e.g. 'Ga', 're').
 * @property {?string} answered     Swara id the user picked, or null.
 * @property {boolean} correct      Whether the answer matched the played note.
 * @property {?number} responseMs   Time taken (approximate, per-note share).
 * @property {Object}  ctx          Extensible context bag (mode, preset, ...).
 */
