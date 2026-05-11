/**
 * AudioEngine — Central audio coordinator.
 *
 * Manages:
 * - Tone.js context initialization (user gesture required)
 * - Tanpura drone lifecycle
 * - Active instrument for playing swaras
 * - Aaroh playback
 * - Quiz note playback
 */

import * as Tone from 'tone';
import TanpuraEngine from './TanpuraEngine.js';
import { createInstrument } from './instruments/index.js';
import { AAROH, swaraFrequency, getSwaraById } from '../config/swaras.js';

class AudioEngine {
  constructor() {
    this.initialized = false;
    this.tanpura = new TanpuraEngine();
    this.instrument = null;
    this.instrumentId = null;
    this._baseSaHz = 130.81; // Default C3
  }

  /**
   * Must be called from a user gesture (click/tap).
   */
  async init() {
    if (this.initialized) return;
    await Tone.start();
    this.initialized = true;
  }

  /**
   * Set the base key.
   */
  setKey(baseSaHz) {
    this._baseSaHz = baseSaHz;
    if (this.tanpura.isPlaying) {
      this.tanpura.updateKey(baseSaHz);
    }
  }

  /**
   * Set the active instrument.
   */
  setInstrument(instrumentId) {
    if (this.instrumentId === instrumentId && this.instrument) return;
    this.instrument?.dispose();
    this.instrument = createInstrument(instrumentId);
    this.instrument.init();
    this.instrumentId = instrumentId;
  }

  /**
   * Start tanpura drone.
   */
  startTanpura() {
    if (!this.initialized) return;
    this.tanpura.start(this._baseSaHz);
  }

  /**
   * Stop tanpura drone.
   */
  stopTanpura() {
    this.tanpura.stop();
  }

  /**
   * Play the ascending aaroh (Sa Re Ga Ma Pa Dha Ni Sa').
   * @param {number} noteDur — seconds per note
   * @param {number} gap — gap between notes
   * @returns {Promise} resolves when aaroh finishes
   */
  playAaroh(noteDur = 0.6, gap = 0.15) {
    if (!this.instrument) return Promise.resolve();

    const notes = AAROH.map((s) => ({
      freq: swaraFrequency(s, this._baseSaHz),
      dur: noteDur,
    }));

    const totalDuration = this.instrument.playSequence(notes, gap);
    return new Promise((resolve) => setTimeout(resolve, totalDuration * 1000 + 200));
  }

  /**
   * Play specific swaras for a quiz question.
   * @param {string[]} swaraIds — e.g. ['Ga'] or ['Re', 'Pa']
   * @param {number} noteDur
   * @param {number} gap
   * @returns {Promise} resolves when done
   */
  playSwaras(swaraIds, noteDur = 1.5, gap = 0.5) {
    if (!this.instrument) return Promise.resolve();

    const notes = swaraIds.map((id) => {
      const swara = getSwaraById(id);
      return {
        freq: swaraFrequency(swara, this._baseSaHz),
        dur: noteDur,
      };
    });

    const totalDuration = this.instrument.playSequence(notes, gap);
    return new Promise((resolve) => setTimeout(resolve, totalDuration * 1000 + 100));
  }

  /**
   * Play a single swara (e.g., when user clicks a button to preview).
   */
  playOneSwara(swaraId, duration = 0.8) {
    if (!this.instrument) return;
    const swara = getSwaraById(swaraId);
    this.instrument.playNote(swaraFrequency(swara, this._baseSaHz), duration);
  }

  setTanpuraVolume(db) {
    this.tanpura.setVolume(db);
  }

  setInstrumentVolume(db) {
    this.instrument?.setVolume(db);
  }

  dispose() {
    this.tanpura.stop();
    this.instrument?.dispose();
    this.initialized = false;
  }
}

// Singleton
const audioEngine = new AudioEngine();
export default audioEngine;
