/**
 * Mode registry.
 * Each mode (swara, custom, raag, ...) registers its config here.
 */

const MODES = [
  {
    id: 'swara',
    name: 'Swara Identification',
    description: 'Progressive levels — single, then multiple swaras',
    icon: '🎵',
    available: true,
  },
  {
    id: 'custom',
    name: 'Custom Practice',
    description: 'Pick a raag preset (Yaman, Bhairavi, …) or your own swaras',
    icon: '🎼',
    available: true,
  },
];

export default MODES;

export function getModeById(id) {
  return MODES.find((m) => m.id === id);
}
