/**
 * Raag and scale presets for the Custom practice mode.
 *
 * Each preset is just a curated list of swara IDs. The `id` and `name`
 * are stored in attempt ctx so progress can be filtered by raag.
 */
import { SHUDDHA_SWARAS_WITH_HIGH_SA } from './swaras.js';

export const PRESETS = [
  {
    id: 'shuddha',
    name: 'Shuddha Sargam',
    description: 'All 7 shuddha swaras + high Sa',
    swaras: SHUDDHA_SWARAS_WITH_HIGH_SA.map((s) => s.id),
    raag: false,
  },
  {
    id: 'yaman',
    name: 'Yaman',
    description: 'Sa Re Ga Ma̍ Pa Dha Ni Sa̍',
    swaras: ['Sa', 'Re', 'Ga', 'ma', 'Pa', 'Dha', 'Ni', "Sa'"],
    raag: true,
  },
  {
    id: 'bhupali',
    name: 'Bhupali',
    description: 'Sa Re Ga Pa Dha Sa̍',
    swaras: ['Sa', 'Re', 'Ga', 'Pa', 'Dha', "Sa'"],
    raag: true,
  },
  {
    id: 'hamsadhwani',
    name: 'Hamsadhwani',
    description: 'Sa Re Ga Pa Ni Sa̍',
    swaras: ['Sa', 'Re', 'Ga', 'Pa', 'Ni', "Sa'"],
    raag: true,
  },
  {
    id: 'bhairavi',
    name: 'Bhairavi',
    description: 'Sa re̱ ga̱ Ma Pa dha̱ ni̱ Sa̍',
    swaras: ['Sa', 're', 'ga', 'Ma', 'Pa', 'dha', 'ni', "Sa'"],
    raag: true,
  },
  {
    id: 'malkauns',
    name: 'Malkauns',
    description: 'Sa ga̱ Ma dha̱ ni̱ Sa̍',
    swaras: ['Sa', 'ga', 'Ma', 'dha', 'ni', "Sa'"],
    raag: true,
  },
  {
    id: 'durga',
    name: 'Durga',
    description: 'Sa Re Ma Pa Dha Sa̍',
    swaras: ['Sa', 'Re', 'Ma', 'Pa', 'Dha', "Sa'"],
    raag: true,
  },
  {
    id: 'chromatic',
    name: 'All 12 Notes',
    description: 'Full chromatic: komal, shuddha, tivra',
    swaras: [
      'Sa',
      're',
      'Re',
      'ga',
      'Ga',
      'Ma',
      'ma',
      'Pa',
      'dha',
      'Dha',
      'ni',
      'Ni',
      "Sa'",
    ],
    raag: false,
  },
];

export const CUSTOM_PRESET_ID = 'custom';

export function getPresetById(id) {
  return PRESETS.find((p) => p.id === id);
}

/**
 * Stable hash of a swara pool. Same swaras → same hash regardless of order.
 * Not cryptographic — used only for grouping/equality.
 */
export function poolHash(swaras) {
  const sorted = [...swaras].sort().join(',');
  let h = 0;
  for (let i = 0; i < sorted.length; i++) {
    h = (h << 5) - h + sorted.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(36);
}
