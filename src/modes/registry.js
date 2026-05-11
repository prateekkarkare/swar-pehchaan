/**
 * Mode registry.
 * Each mode (swara, raag, etc.) registers its config here.
 *
 * To add a new mode, import it and add to MODES.
 */

const MODES = [
  {
    id: 'swara',
    name: 'Swara Identification',
    description: 'Identify individual swaras played after the aaroh',
    icon: '🎵',
  },
  // {
  //   id: 'raag',
  //   name: 'Raag Identification',
  //   description: 'Identify the raag from a short phrase',
  //   icon: '🎶',
  // },
];

export default MODES;

export function getModeById(id) {
  return MODES.find((m) => m.id === id);
}
