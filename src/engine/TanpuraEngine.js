/**
 * TanpuraEngine — Continuous Sa-Pa drone using Web Audio API.
 *
 * Creates a rich, buzzing tanpura-like drone with:
 * - Sa (base) and Pa strings
 * - Rich harmonics simulating jawari (bridge buzz)
 * - Slow amplitude cycling to mimic string plucking pattern
 */

import * as Tone from 'tone';

export default class TanpuraEngine {
  constructor() {
    this.isPlaying = false;
    this.nodes = [];
    this._baseSaHz = null;
    this._volume = -12; // dB
    this._masterGain = null;
  }

  /**
   * Start the tanpura drone.
   * @param {number} baseSaHz — frequency of Sa
   */
  start(baseSaHz) {
    if (this.isPlaying) this.stop();
    this._baseSaHz = baseSaHz;

    const paHz = baseSaHz * 1.5; // Pa = 3/2 ratio
    const saLowHz = baseSaHz * 0.5; // Lower octave Sa

    this._masterGain = new Tone.Gain(Tone.dbToGain(this._volume)).toDestination();

    // String definitions: [frequency, relative volume, pan]
    const strings = [
      { freq: paHz, vol: 0.25, pan: -0.3 },
      { freq: baseSaHz, vol: 0.35, pan: 0.0 },
      { freq: baseSaHz, vol: 0.35, pan: 0.1 },
      { freq: saLowHz, vol: 0.3, pan: 0.3 },
    ];

    const cycleDuration = 4; // seconds for full Sa-Pa-Sa-Sa cycle

    strings.forEach((s, i) => {
      const panner = new Tone.Panner(s.pan).connect(this._masterGain);

      // Main tone with harmonics (simulating jawari buzz)
      const synth = new Tone.Synth({
        oscillator: {
          type: 'fatsawtooth',
          count: 3,
          spread: 2,
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 1,
          release: 0.5,
        },
      }).connect(panner);

      // LFO for amplitude cycling (mimics pluck pattern)
      const lfo = new Tone.LFO({
        frequency: 1 / cycleDuration,
        min: s.vol * 0.4,
        max: s.vol,
        phase: (i / strings.length) * 360,
        type: 'sine',
      });
      lfo.connect(synth.volume);
      lfo.start();

      // Start the tone
      synth.triggerAttack(s.freq, Tone.now());

      this.nodes.push({ synth, panner, lfo });
    });

    this.isPlaying = true;
  }

  /**
   * Stop the tanpura drone.
   */
  stop() {
    this.nodes.forEach(({ synth, panner, lfo }) => {
      try {
        synth.triggerRelease();
        setTimeout(() => {
          synth.dispose();
          panner.dispose();
          lfo.dispose();
        }, 600);
      } catch {
        // already disposed
      }
    });
    if (this._masterGain) {
      setTimeout(() => this._masterGain?.dispose(), 700);
    }
    this.nodes = [];
    this.isPlaying = false;
  }

  /**
   * Set volume in dB.
   */
  setVolume(db) {
    this._volume = db;
    if (this._masterGain) {
      this._masterGain.gain.value = Tone.dbToGain(db);
    }
  }

  /**
   * Update the base frequency (key change).
   */
  updateKey(baseSaHz) {
    if (this.isPlaying) {
      this.stop();
      this.start(baseSaHz);
    }
    this._baseSaHz = baseSaHz;
  }
}
