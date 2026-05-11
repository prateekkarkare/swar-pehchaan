/**
 * Instrument configuration registry.
 *
 * Each instrument defines synthesis parameters used by the AudioEngine.
 * To add a new instrument, add an entry here and implement its
 * synthesis in engine/instruments/.
 */

const INSTRUMENTS = [
  {
    id: 'harmonium',
    name: 'Harmonium',
    icon: '🎹',
    // Synthesis params for additive synthesis
    synth: {
      oscillator: { type: 'custom' },
      envelope: {
        attack: 0.08,
        decay: 0.3,
        sustain: 0.7,
        release: 0.4,
      },
      // Harmonics weighting (fundamental + overtones)
      harmonics: [1, 0.5, 0.33, 0.25, 0.15, 0.1, 0.06],
    },
  },
  // ─── Add new instruments here ──────────────────
  // {
  //   id: 'santoor',
  //   name: 'Santoor',
  //   icon: '🎵',
  //   synth: { ... },
  // },
];

export default INSTRUMENTS;

export const DEFAULT_INSTRUMENT_ID = 'harmonium';

export function getInstrumentById(id) {
  return INSTRUMENTS.find((i) => i.id === id);
}
