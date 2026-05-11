/**
 * Instrument registry.
 * Maps instrument IDs to their synth class constructors.
 *
 * To add a new instrument:
 * 1. Create a new class in this folder (e.g., Santoor.js)
 * 2. Import and register it here
 */

import HarmoniumSynth from './Harmonium.js';

const INSTRUMENT_REGISTRY = {
  harmonium: HarmoniumSynth,
  // santoor: SantoorSynth,
};

export function createInstrument(instrumentId) {
  const Ctor = INSTRUMENT_REGISTRY[instrumentId];
  if (!Ctor) {
    throw new Error(`Unknown instrument: ${instrumentId}`);
  }
  return new Ctor();
}

export default INSTRUMENT_REGISTRY;
