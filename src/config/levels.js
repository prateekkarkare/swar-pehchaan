/**
 * Level definitions for Swara mode.
 *
 * Each level is a plain config object. To add a new level,
 * just append an entry — no code changes required elsewhere.
 */

import { SHUDDHA_SWARAS, SHUDDHA_SWARAS_WITH_HIGH_SA, SWARAS, SWARA_TYPES } from './swaras.js';

/**
 * @typedef {Object} LevelConfig
 * @property {string}   id          - Unique level identifier
 * @property {number}   number      - Display order
 * @property {string}   name        - Human-readable name
 * @property {string}   description - What this level tests
 * @property {string[]} swaraPool   - Array of swara IDs available for questions
 * @property {number}   questionCount - How many swaras are played per question
 * @property {number}   totalQuestions - Questions per round
 * @property {boolean}  randomTiming  - Whether gaps between swaras vary
 * @property {number}   noteDuration  - Seconds each note is held
 * @property {number}   gapDuration   - Seconds between notes (base)
 * @property {boolean}  playAaroh     - Whether to play aaroh before each question
 */

const LEVELS = [
  {
    id: 'swara-l1',
    number: 1,
    name: 'Single Swara',
    description: 'Identify one shuddha swara at a time (Sa to high Sa)',
    swaraPool: SHUDDHA_SWARAS_WITH_HIGH_SA.map((s) => s.id),
    questionCount: 1,
    totalQuestions: 10,
    randomTiming: false,
    noteDuration: 1.5,
    gapDuration: 0.5,
    playAaroh: true,
  },
  {
    id: 'swara-l2',
    number: 2,
    name: 'Two Swaras',
    description: 'Identify a pair of shuddha swaras played in sequence',
    swaraPool: SHUDDHA_SWARAS_WITH_HIGH_SA.map((s) => s.id),
    questionCount: 2,
    totalQuestions: 10,
    randomTiming: false,
    noteDuration: 1.2,
    gapDuration: 0.4,
    playAaroh: true,
  },
  // ─── Add new levels below ─────────────────────────────────
  // {
  //   id: 'swara-l3',
  //   number: 3,
  //   name: 'Three Swaras',
  //   description: 'Identify three shuddha swaras',
  //   swaraPool: SHUDDHA_SWARAS.map((s) => s.id),
  //   questionCount: 3,
  //   totalQuestions: 10,
  //   randomTiming: false,
  //   noteDuration: 1.0,
  //   gapDuration: 0.3,
  //   playAaroh: true,
  // },
  // {
  //   id: 'swara-l4',
  //   number: 4,
  //   name: 'Three Swaras (Random Gaps)',
  //   description: 'Three swaras with unpredictable timing',
  //   swaraPool: SHUDDHA_SWARAS.map((s) => s.id),
  //   questionCount: 3,
  //   totalQuestions: 10,
  //   randomTiming: true,
  //   noteDuration: 1.0,
  //   gapDuration: 0.3,
  //   playAaroh: true,
  // },
];

export default LEVELS;

export function getLevelById(id) {
  return LEVELS.find((l) => l.id === id);
}
