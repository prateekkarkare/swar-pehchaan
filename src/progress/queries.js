/**
 * Derived views over the attempts event log.
 *
 * Every UI insight is a pure function of (attempts, filter). Nothing
 * is precomputed or persisted — the event log is the single source of truth.
 */
import { getAllAttempts } from './store.js';

function groupBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    if (k == null) continue;
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return m;
}

const ratio = (n, d) => (d === 0 ? 0 : n / d);
const mean = (arr) =>
  arr.length === 0 ? 0 : arr.reduce((s, x) => s + x, 0) / arr.length;

function applyFilter(attempts, { mode, levelId, preset, after } = {}) {
  return attempts.filter((a) => {
    if (mode && a.ctx?.mode !== mode) return false;
    if (levelId && a.ctx?.levelId !== levelId) return false;
    if (preset && a.ctx?.preset !== preset) return false;
    if (after && a.ts < after) return false;
    return true;
  });
}

/**
 * Overall summary (counts, accuracy, response time).
 */
export async function getOverallStats(filter = {}) {
  const all = await getAllAttempts();
  const xs = applyFilter(all, filter);
  if (xs.length === 0) {
    return {
      totalAttempts: 0,
      totalSessions: 0,
      totalQuestions: 0,
      avgAccuracy: 0,
      avgResponseMs: 0,
      bestAccuracy: 0,
    };
  }
  const sessionIds = new Set(xs.map((a) => a.sessionId));
  const questionIds = new Set(xs.map((a) => a.questionId));
  const correct = xs.filter((a) => a.correct).length;
  return {
    totalAttempts: xs.length,
    totalSessions: sessionIds.size,
    totalQuestions: questionIds.size,
    avgAccuracy: ratio(correct, xs.length),
    avgResponseMs: Math.round(mean(xs.map((a) => a.responseMs || 0))),
    bestAccuracy: bestSessionAccuracy(xs),
  };
}

function bestSessionAccuracy(attempts) {
  const bySession = groupBy(attempts, (a) => a.sessionId);
  let best = 0;
  for (const [, arr] of bySession) {
    const acc = ratio(arr.filter((a) => a.correct).length, arr.length);
    if (acc > best) best = acc;
  }
  return best;
}

/**
 * Per-swara mastery, sorted alphabetically.
 */
export async function getSwaraStats(filter = {}) {
  const all = await getAllAttempts();
  const xs = applyFilter(all, filter);
  const byPlayed = groupBy(xs, (a) => a.played);
  const out = [];
  for (const [played, atts] of byPlayed) {
    const sorted = [...atts].sort((a, b) => a.ts - b.ts);
    const recent = sorted.slice(-10);
    const correct = sorted.filter((a) => a.correct).length;
    const confusion = {};
    for (const a of sorted) {
      if (!a.correct && a.answered) {
        confusion[a.answered] = (confusion[a.answered] || 0) + 1;
      }
    }
    out.push({
      swara: played,
      played: sorted.length,
      correct,
      accuracy: ratio(correct, sorted.length),
      avgResponseMs: Math.round(mean(sorted.map((a) => a.responseMs || 0))),
      recentAccuracy: ratio(
        recent.filter((a) => a.correct).length,
        recent.length,
      ),
      confusedWith: confusion,
    });
  }
  out.sort((a, b) => b.played - a.played);
  return out;
}

/**
 * Sessions list with derived stats. Newest first.
 */
export async function getSessionsList(filter = {}) {
  const all = await getAllAttempts();
  const xs = applyFilter(all, filter);
  const bySession = groupBy(xs, (a) => a.sessionId);
  const sessions = [];
  for (const [sid, atts] of bySession) {
    const sorted = [...atts].sort((a, b) => a.ts - b.ts);
    const first = sorted[0];
    const correctNotes = sorted.filter((a) => a.correct).length;
    const byQ = groupBy(sorted, (a) => a.questionId);
    let correctQs = 0;
    for (const [, qatts] of byQ) {
      if (qatts.length > 0 && qatts.every((a) => a.correct)) correctQs++;
    }
    sessions.push({
      id: sid,
      ts: first.ts,
      timestamp: new Date(first.ts).toISOString(),
      mode: first.ctx?.mode,
      levelId: first.ctx?.levelId,
      levelNumber: first.ctx?.levelNumber,
      levelName: first.ctx?.levelName,
      preset: first.ctx?.preset,
      presetName: first.ctx?.presetName,
      key: first.ctx?.key,
      instrument: first.ctx?.instrument,
      totalQuestions: byQ.size,
      correctQuestions: correctQs,
      questionAccuracy: ratio(correctQs, byQ.size),
      noteAccuracy: ratio(correctNotes, sorted.length),
      avgResponseMs: Math.round(mean(sorted.map((a) => a.responseMs || 0))),
    });
  }
  return sessions.sort((a, b) => b.ts - a.ts);
}

/**
 * Interval mastery: grouped by absolute semitone distance and direction.
 */
export async function getIntervalStats(filter = {}) {
  const all = await getAllAttempts();
  const xs = applyFilter(all, filter).filter(
    (a) => a.ctx?.intervalSemitones != null,
  );
  const byInterval = groupBy(
    xs,
    (a) => `${a.ctx.direction}_${Math.abs(a.ctx.intervalSemitones)}`,
  );
  const out = [];
  for (const [key, atts] of byInterval) {
    const [dir, semis] = key.split('_');
    const correct = atts.filter((a) => a.correct).length;
    out.push({
      direction: dir,
      semitones: Number(semis),
      played: atts.length,
      correct,
      accuracy: ratio(correct, atts.length),
    });
  }
  return out.sort(
    (a, b) => a.semitones - b.semitones || a.direction.localeCompare(b.direction),
  );
}

/**
 * Per-level summary (sessions, accuracy) for the level cards.
 * Convenience wrapper around getOverallStats with a level filter.
 */
export async function getLevelStats(levelId) {
  return getOverallStats({ levelId });
}
