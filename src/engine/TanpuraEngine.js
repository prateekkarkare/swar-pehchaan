/**
 * TanpuraEngine — Sample-based tanpura drone.
 *
 * Uses pre-recorded tanpura loops (Freesound pack 9600 by sankalp,
 * CC BY 4.0). Picks the closest available sample and adjusts
 * playbackRate for pitch-shifting (max ±1 semitone).
 *
 * OGG format is used for gapless looping (mp3 adds codec padding).
 */

import * as Tone from 'tone';

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

const SAMPLES = [
  { note: 'C', baseSaHz: 130.81, url: assetUrl('audio/tanpura/C.ogg') },
  { note: 'D', baseSaHz: 146.83, url: assetUrl('audio/tanpura/D.ogg') },
];

function pickSample(targetHz) {
  let best = SAMPLES[0];
  let bestDist = Infinity;
  for (const s of SAMPLES) {
    const dist = Math.abs(12 * Math.log2(targetHz / s.baseSaHz));
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  return {
    url: best.url,
    playbackRate: targetHz / best.baseSaHz,
  };
}

export default class TanpuraEngine {
  constructor() {
    this.isPlaying = false;
    this._volume = -12;
    this._baseSaHz = null;
    this._player = null;
    this._gainNode = null;
  }

  async start(baseSaHz) {
    if (this.isPlaying) this.stop();
    this._baseSaHz = baseSaHz;

    const { url, playbackRate } = pickSample(baseSaHz);

    this._gainNode = new Tone.Gain(Tone.dbToGain(this._volume));
    this._gainNode.toDestination();

    this._player = new Tone.Player({
      url,
      loop: true,
      playbackRate,
    });
    this._player.connect(this._gainNode);

    // Wait for buffer to load, then start
    await Tone.loaded();
    if (this._player) {
      this._player.start();
      this.isPlaying = true;
    }
  }

  stop() {
    this.isPlaying = false;
    if (this._player) {
      try { this._player.stop(); } catch {}
      this._player.dispose();
      this._player = null;
    }
    if (this._gainNode) {
      this._gainNode.dispose();
      this._gainNode = null;
    }
  }

  setVolume(db) {
    this._volume = db;
    if (this._gainNode) {
      this._gainNode.gain.value = Tone.dbToGain(db);
    }
  }

  updateKey(baseSaHz) {
    if (this.isPlaying) {
      this.stop();
      setTimeout(() => this.start(baseSaHz), 100);
    } else {
      this._baseSaHz = baseSaHz;
    }
  }
}
