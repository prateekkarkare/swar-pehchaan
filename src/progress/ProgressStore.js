/**
 * ProgressStore — localStorage-backed progress tracking.
 *
 * Stores session results with accuracy, timing, and metadata.
 */

const STORAGE_KEY = 'ear-training-progress';

/**
 * @typedef {Object} QuestionResult
 * @property {string[]} played    — swara IDs that were played
 * @property {string[]} answered  — swara IDs the user selected
 * @property {boolean}  correct   — whether the answer was correct
 * @property {number}   timeMs    — milliseconds to answer
 */

/**
 * @typedef {Object} SessionResult
 * @property {string}   id            — unique session ID
 * @property {string}   timestamp     — ISO date string
 * @property {string}   mode          — e.g. 'swara'
 * @property {string}   levelId       — level config ID
 * @property {number}   levelNumber   — display number
 * @property {string}   instrument    — instrument ID used
 * @property {string}   key           — key ID used
 * @property {QuestionResult[]} questions
 * @property {number}   accuracy      — 0-1
 * @property {number}   avgTimeMs     — average response time
 * @property {number}   totalQuestions
 * @property {number}   correctCount
 */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    console.warn('Failed to save progress to localStorage');
  }
}

/**
 * Save a completed session.
 */
export function saveSession(sessionData) {
  const {
    mode,
    levelId,
    levelNumber,
    instrument,
    key,
    questions,
  } = sessionData;

  const correctCount = questions.filter((q) => q.correct).length;
  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
  const totalTime = questions.reduce((sum, q) => sum + q.timeMs, 0);
  const avgTimeMs = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

  const session = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    mode,
    levelId,
    levelNumber,
    instrument,
    key,
    questions,
    accuracy,
    avgTimeMs,
    totalQuestions,
    correctCount,
  };

  const all = loadAll();
  all.push(session);
  saveAll(all);

  return session;
}

/**
 * Get all sessions, optionally filtered.
 */
export function getSessions({ mode, levelId } = {}) {
  let sessions = loadAll();
  if (mode) sessions = sessions.filter((s) => s.mode === mode);
  if (levelId) sessions = sessions.filter((s) => s.levelId === levelId);
  return sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get aggregate stats for a mode/level combination.
 */
export function getStats({ mode, levelId } = {}) {
  const sessions = getSessions({ mode, levelId });
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      avgAccuracy: 0,
      avgTimeMs: 0,
      bestAccuracy: 0,
      bestTimeMs: 0,
      recentTrend: [],
    };
  }

  const totalSessions = sessions.length;
  const avgAccuracy = sessions.reduce((s, r) => s + r.accuracy, 0) / totalSessions;
  const avgTimeMs = Math.round(sessions.reduce((s, r) => s + r.avgTimeMs, 0) / totalSessions);
  const bestAccuracy = Math.max(...sessions.map((s) => s.accuracy));
  const bestTimeMs = Math.min(...sessions.map((s) => s.avgTimeMs));

  // Last 10 sessions for trend
  const recentTrend = sessions.slice(0, 10).reverse().map((s) => ({
    accuracy: s.accuracy,
    avgTimeMs: s.avgTimeMs,
    date: s.timestamp,
  }));

  return { totalSessions, avgAccuracy, avgTimeMs, bestAccuracy, bestTimeMs, recentTrend };
}

/**
 * Clear all progress data.
 */
export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
