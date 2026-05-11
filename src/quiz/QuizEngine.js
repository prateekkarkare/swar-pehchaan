/**
 * QuizEngine — Pure logic for generating and evaluating quiz questions.
 *
 * Framework-agnostic: works with any UI layer.
 */

import { getSwaraById } from '../config/swaras.js';

/**
 * Generate a random question for a given level config.
 * @param {Object} level — level config from levels.js
 * @returns {{ swaras: string[], questionNumber: number }}
 */
export function generateQuestion(level) {
  const pool = level.swaraPool;
  const count = level.questionCount;
  const picked = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
  }

  return { swaras: picked };
}

/**
 * Check if the user's answer matches the question.
 * @param {string[]} expected — correct swara IDs
 * @param {string[]} answered — user's swara IDs
 * @returns {{ correct: boolean, details: Array<{ expected: string, answered: string, match: boolean }> }}
 */
export function checkAnswer(expected, answered) {
  const details = expected.map((exp, i) => ({
    expected: exp,
    answered: answered[i] || null,
    match: exp === answered[i],
  }));

  const correct = details.every((d) => d.match);
  return { correct, details };
}

/**
 * Compute timing for note playback considering randomTiming.
 * @param {Object} level
 * @returns {{ noteDuration: number, gapDuration: number }}
 */
export function getPlaybackTiming(level) {
  let gap = level.gapDuration;
  if (level.randomTiming) {
    // Random gap between 0.2 and gapDuration * 3
    gap = 0.2 + Math.random() * (level.gapDuration * 3 - 0.2);
  }
  return {
    noteDuration: level.noteDuration,
    gapDuration: gap,
  };
}
