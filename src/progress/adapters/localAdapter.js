/**
 * localStorage adapter — stores attempts as a single JSON blob.
 *
 * Append-only event log. ~200 bytes per attempt; well within
 * the 5 MB localStorage limit for years of practice.
 */
import { STORAGE_KEY, SCHEMA_VERSION } from '../schema.js';

function loadBlob() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { schemaVersion: SCHEMA_VERSION, attempts: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { schemaVersion: SCHEMA_VERSION, attempts: [] };
    }
    return {
      schemaVersion: parsed.schemaVersion ?? SCHEMA_VERSION,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    };
  } catch {
    return { schemaVersion: SCHEMA_VERSION, attempts: [] };
  }
}

function saveBlob(blob) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch (e) {
    console.warn('Failed to save progress to localStorage', e);
  }
}

export const localAdapter = {
  name: 'local',

  async getAllAttempts() {
    return loadBlob().attempts;
  },

  async addAttempts(newAttempts) {
    if (!newAttempts?.length) return;
    const blob = loadBlob();
    blob.attempts.push(...newAttempts);
    saveBlob(blob);
  },

  async clearAll() {
    saveBlob({ schemaVersion: SCHEMA_VERSION, attempts: [] });
  },

  async exportAll() {
    return loadBlob();
  },

  async importAll(blob) {
    saveBlob({
      schemaVersion: SCHEMA_VERSION,
      attempts: Array.isArray(blob?.attempts) ? blob.attempts : [],
    });
  },
};
