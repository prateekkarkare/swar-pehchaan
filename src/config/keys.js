/**
 * Musical key definitions.
 * Maps Western key names to the base Sa frequency (Hz).
 * The user selects their preferred key (pitch of Sa).
 */

export const KEYS = [
  { id: 'C3',  label: 'C',         hz: 130.81 },
  { id: 'C#3', label: 'C# / Db',   hz: 138.59 },
  { id: 'D3',  label: 'D',         hz: 146.83 },
];

export const DEFAULT_KEY_ID = 'C3';

export function getKeyById(id) {
  return KEYS.find((k) => k.id === id);
}
