/**
 * HarmoniumSynth — Synthesized harmonium sound.
 *
 * Uses Tone.js PolySynth with custom settings to approximate
 * harmonium timbre (reed organ with bellows).
 */

import * as Tone from 'tone';

export default class HarmoniumSynth {
  constructor() {
    this._synth = null;
    this._gain = null;
    this._volume = -6; // dB
  }

  /**
   * Initialize the synth. Call after Tone.start().
   */
  init() {
    this._gain = new Tone.Gain(Tone.dbToGain(this._volume)).toDestination();

    this._synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'fatsquare',
        count: 3,
        spread: 8,
      },
      envelope: {
        attack: 0.06,
        decay: 0.2,
        sustain: 0.8,
        release: 0.3,
      },
    }).connect(this._gain);

    // Slight chorus effect for warmth
    const chorus = new Tone.Chorus({
      frequency: 2.5,
      delayTime: 3.5,
      depth: 0.3,
      wet: 0.2,
    }).connect(this._gain);
    this._synth.connect(chorus);
  }

  /**
   * Play a single note.
   * @param {number} frequency — Hz
   * @param {number} duration — seconds
   * @param {number} [time] — Tone.js time to schedule
   * @returns {number} — scheduled end time
   */
  playNote(frequency, duration, time) {
    if (!this._synth) this.init();
    const t = time ?? Tone.now();
    this._synth.triggerAttackRelease(frequency, duration, t);
    return t + duration;
  }

  /**
   * Play a sequence of frequencies.
   * @param {Array<{freq: number, dur: number}>} notes
   * @param {number} gap — seconds between notes
   * @param {number} [startTime]
   * @returns {number} — total duration in seconds
   */
  playSequence(notes, gap, startTime) {
    if (!this._synth) this.init();
    let t = startTime ?? Tone.now();
    notes.forEach((note, i) => {
      this._synth.triggerAttackRelease(note.freq, note.dur, t);
      t += note.dur + gap;
    });
    return t - (startTime ?? Tone.now());
  }

  setVolume(db) {
    this._volume = db;
    if (this._gain) {
      this._gain.gain.value = Tone.dbToGain(db);
    }
  }

  dispose() {
    this._synth?.dispose();
    this._gain?.dispose();
    this._synth = null;
    this._gain = null;
  }
}
