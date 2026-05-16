/**
 * HarmoniumSynth — Realistic Indian harmonium sound.
 *
 * Models a pump harmonium with:
 * - Multiple reed banks (2-3 reeds per note, slightly detuned)
 * - Custom harmonic spectrum via additive synthesis (partials)
 * - Bellows pressure LFO for breathing quality
 * - Breathy noise layer on attack
 * - Bandpass filtering for mid-range warmth/body
 */

import * as Tone from 'tone';

export default class HarmoniumSynth {
  constructor() {
    this._synth = null;
    this._noiseSynth = null;
    this._gain = null;
    this._filter = null;
    this._bellowsLfo = null;
    this._volume = -6; // dB
  }

  /**
   * Initialize the synth. Call after Tone.start().
   */
  init() {
    this._gain = new Tone.Gain(Tone.dbToGain(this._volume)).toDestination();

    // Bandpass filter to emphasize harmonium's mid-range body (200-3000 Hz)
    this._filter = new Tone.Filter({
      type: 'bandpass',
      frequency: 1200,
      Q: 0.5,
    }).connect(this._gain);

    // A second wider low-pass to tame harsh highs
    const lpf = new Tone.Filter({
      type: 'lowpass',
      frequency: 3500,
      rolloff: -12,
    }).connect(this._gain);

    // Main reed synth — uses custom partials to model harmonium harmonic series
    // Indian harmonium reeds emphasize fundamental, 2nd, 3rd, 4th harmonics
    // with a characteristic nasal quality from odd harmonics
    this._synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'custom',
        partials: [1, 0.6, 0.4, 0.25, 0.15, 0.08, 0.12, 0.05, 0.03, 0.02],
      },
      envelope: {
        attack: 0.1,
        decay: 0.15,
        sustain: 0.85,
        release: 0.25,
      },
    });

    // Second reed bank — slightly detuned for natural beating
    const reedBank2 = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'custom',
        partials: [1, 0.55, 0.35, 0.2, 0.12, 0.06, 0.09, 0.04],
      },
      envelope: {
        attack: 0.12,
        decay: 0.15,
        sustain: 0.8,
        release: 0.28,
      },
    });

    // Detune second bank slightly (cents) for natural chorus/beating
    reedBank2.set({ detune: 6 });

    // Third reed bank — octave coupler (subtle, adds fullness)
    const reedBank3 = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'custom',
        partials: [1, 0.4, 0.2, 0.1],
      },
      envelope: {
        attack: 0.14,
        decay: 0.2,
        sustain: 0.6,
        release: 0.3,
      },
    });
    reedBank3.set({ detune: -4 });

    // Mix reed banks at different levels
    const bank1Gain = new Tone.Gain(0.5).connect(this._filter);
    const bank2Gain = new Tone.Gain(0.35).connect(this._filter);
    const bank3Gain = new Tone.Gain(0.15).connect(lpf);

    this._synth.connect(bank1Gain);
    reedBank2.connect(bank2Gain);
    reedBank3.connect(bank3Gain);

    this._reedBank2 = reedBank2;
    this._reedBank3 = reedBank3;

    // Breathy noise layer — simulates air rushing through reeds on attack
    this._noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.02,
        decay: 0.12,
        sustain: 0.0,
        release: 0.05,
      },
    });
    const noiseFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 2000,
      Q: 2,
    }).connect(this._gain);
    const noiseGain = new Tone.Gain(0.06).connect(noiseFilter);
    this._noiseSynth.connect(noiseGain);

    // Bellows pressure LFO — subtle amplitude variation
    this._bellowsLfo = new Tone.LFO({
      frequency: 0.4,
      min: 0.88,
      max: 1.0,
      type: 'sine',
    });
    const bellowsGain = new Tone.Gain(1).connect(this._gain);
    this._bellowsLfo.connect(bellowsGain.gain);
    this._bellowsLfo.start();

    // Re-route filter output through bellows
    this._filter.disconnect();
    this._filter.connect(bellowsGain);
    lpf.disconnect();
    lpf.connect(bellowsGain);
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
    this._reedBank2.triggerAttackRelease(frequency, duration, t);
    this._reedBank3.triggerAttackRelease(frequency, duration, t);
    // Trigger breathy attack noise
    this._noiseSynth.triggerAttackRelease('16n', t);
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
    notes.forEach((note) => {
      this._synth.triggerAttackRelease(note.freq, note.dur, t);
      this._reedBank2.triggerAttackRelease(note.freq, note.dur, t);
      this._reedBank3.triggerAttackRelease(note.freq, note.dur, t);
      this._noiseSynth.triggerAttackRelease('16n', t);
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
    this._reedBank2?.dispose();
    this._reedBank3?.dispose();
    this._noiseSynth?.dispose();
    this._filter?.dispose();
    this._bellowsLfo?.dispose();
    this._gain?.dispose();
    this._synth = null;
    this._gain = null;
  }
}
