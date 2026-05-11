/**
 * Hindustani Swara Definitions
 *
 * All 12 swaras with their frequency ratios relative to Sa.
 * Using just-intonation ratios traditional to Hindustani music.
 */

export const SWARA_TYPES = {
  SHUDDHA: 'shuddha',
  KOMAL: 'komal',
  TIVRA: 'tivra',
};

/**
 * Complete swara catalog.
 * `ratio` is the frequency multiplier relative to the base Sa.
 */
export const SWARAS = [
  { id: 'Sa',  name: 'Sa',  devanagari: 'सा', type: SWARA_TYPES.SHUDDHA, ratio: 1,         octave: 0 },
  { id: 're',  name: 're',  devanagari: 'रे॒', type: SWARA_TYPES.KOMAL,   ratio: 256 / 243, octave: 0 },
  { id: 'Re',  name: 'Re',  devanagari: 'रे', type: SWARA_TYPES.SHUDDHA, ratio: 9 / 8,     octave: 0 },
  { id: 'ga',  name: 'ga',  devanagari: 'ग॒',  type: SWARA_TYPES.KOMAL,   ratio: 32 / 27,   octave: 0 },
  { id: 'Ga',  name: 'Ga',  devanagari: 'ग',  type: SWARA_TYPES.SHUDDHA, ratio: 81 / 64,   octave: 0 },
  { id: 'Ma',  name: 'Ma',  devanagari: 'म',  type: SWARA_TYPES.SHUDDHA, ratio: 4 / 3,     octave: 0 },
  { id: 'ma',  name: 'ma',  devanagari: 'म॑',  type: SWARA_TYPES.TIVRA,   ratio: 729 / 512, octave: 0 },
  { id: 'Pa',  name: 'Pa',  devanagari: 'प',  type: SWARA_TYPES.SHUDDHA, ratio: 3 / 2,     octave: 0 },
  { id: 'dha', name: 'dha', devanagari: 'ध॒', type: SWARA_TYPES.KOMAL,   ratio: 128 / 81,  octave: 0 },
  { id: 'Dha', name: 'Dha', devanagari: 'ध', type: SWARA_TYPES.SHUDDHA, ratio: 27 / 16,   octave: 0 },
  { id: 'ni',  name: 'ni',  devanagari: 'नि॒', type: SWARA_TYPES.KOMAL,   ratio: 16 / 9,    octave: 0 },
  { id: 'Ni',  name: 'Ni',  devanagari: 'नि', type: SWARA_TYPES.SHUDDHA, ratio: 243 / 128, octave: 0 },
  { id: "Sa'", name: "Sa'", devanagari: 'सां', type: SWARA_TYPES.SHUDDHA, ratio: 2,         octave: 1 },
];

/** Only the 7 shuddha swaras (Sa Re Ga Ma Pa Dha Ni) */
export const SHUDDHA_SWARAS = SWARAS.filter(
  (s) => s.type === SWARA_TYPES.SHUDDHA && s.octave === 0,
);

/** The ascending aaroh scale using shuddha swaras + upper Sa */
export const AAROH = [
  ...SHUDDHA_SWARAS,
  SWARAS.find((s) => s.id === "Sa'"),
];

/**
 * Get swara by id
 */
export function getSwaraById(id) {
  return SWARAS.find((s) => s.id === id);
}

/**
 * Calculate the frequency of a swara given a base Sa frequency.
 */
export function swaraFrequency(swara, baseSaHz) {
  return baseSaHz * swara.ratio;
}
