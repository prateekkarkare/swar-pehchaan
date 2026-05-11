/**
 * Musical key definitions.
 * Maps Western key names to the base Sa frequency (Hz).
 * The user selects their preferred key (pitch of Sa).
 */

export const KEYS = [
  { id: 'B2',  label: 'B (Low)',   hz: 130.81 },
  { id: 'C3',  label: 'C',         hz: 130.81 },
  { id: 'C#3', label: 'C# / Db',   hz: 138.59 },
  { id: 'D3',  label: 'D',         hz: 146.83 },
  { id: 'D#3', label: 'D# / Eb',   hz: 155.56 },
  { id: 'E3',  label: 'E',         hz: 164.81 },
  { id: 'F3',  label: 'F',         hz: 174.61 },
  { id: 'F#3', label: 'F# / Gb',   hz: 185.00 },
  { id: 'G3',  label: 'G',         hz: 196.00 },
  { id: 'G#3', label: 'G# / Ab',   hz: 207.65 },
  { id: 'A3',  label: 'A',         hz: 220.00 },
  { id: 'A#3', label: 'A# / Bb',   hz: 233.08 },
  { id: 'B3',  label: 'B',         hz: 246.94 },
  { id: 'C4',  label: 'C (Middle)', hz: 261.63 },
];

export const DEFAULT_KEY_ID = 'C3';

export function getKeyById(id) {
  return KEYS.find((k) => k.id === id);
}
