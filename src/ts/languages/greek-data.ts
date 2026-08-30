// Greek genome data, transcribed from docs/genomes.md section 8. Every root,
// idiom word, vox magica and codepoint comes from the spec.
//
// What a root MEANS is not here. This file says which roles a root can fill,
// the gloss pack of the displayed language says how each role reads. The pack
// must cover exactly the forms declared here, no more and no less, which the
// pack completeness tests check.

import type { SemanticField, TimeDirection } from '../generator/types.js';
import type { RootForm } from '../glosses/types.js';

// The 24 letters of spec 8.1, uppercase always: the papyri and the tablets are
// majuscule, so a word has exactly one written shape. The token column is the
// ASCII romanization the generator maps from, greedy longest match.
export const LETTER_MAP: Readonly<Record<string, string>> = {
  a: 'Α',
  b: 'Β',
  g: 'Γ',
  d: 'Δ',
  e: 'Ε',
  z: 'Ζ',
  ee: 'Η',
  th: 'Θ',
  i: 'Ι',
  k: 'Κ',
  l: 'Λ',
  m: 'Μ',
  n: 'Ν',
  ks: 'Ξ',
  o: 'Ο',
  p: 'Π',
  r: 'Ρ',
  s: 'Σ',
  t: 'Τ',
  u: 'Υ',
  ph: 'Φ',
  kh: 'Χ',
  ps: 'Ψ',
  oo: 'Ω',
};

// The three non-letters. U+03A2 sits unassigned where a second capital sigma
// would have gone, and nothing in this genome ever reaches for it.
export const WORD_SEP = '·';
export const NUMERAL_SIGN = 'ʹ';
export const KOPPA = 'Ϟ';

export type SealCount = 3 | 7 | 9 | 12 | 99;

export const SEAL_COUNTS: ReadonlyArray<SealCount> = [3, 7, 9, 12, 99];

// The alphabetic numerals of spec 8.8, each closed by the numeral sign. Koppa
// stands for 90 inside 99 and appears nowhere else.
export const SEAL_GLYPHS: Readonly<Record<SealCount, string>> = {
  3: `Γ${NUMERAL_SIGN}`,
  7: `Ζ${NUMERAL_SIGN}`,
  9: `Θ${NUMERAL_SIGN}`,
  12: `ΙΒ${NUMERAL_SIGN}`,
  99: `${KOPPA}Θ${NUMERAL_SIGN}`,
};

export const SEAL_WORDS: Readonly<Record<SealCount, string>> = {
  3: 'treis',
  7: 'epta',
  9: 'ennea',
  12: 'doodeka',
  99: 'eneneekonta ennea',
};

// The attested recitation instruction the seal is built on (spec 8.8).
export const SEAL_HEAD = 'lege';

export interface GreekRoot {
  root: string;
  // Roles this root can fill. A role it does not declare is never drawn.
  forms: ReadonlyArray<RootForm>;
  // Spec 8.3: elth, ik and phthin never fill a slot that takes an object.
  intransitive?: boolean;
}

// Coined roots by semantic field (spec 8.3). This genome populates all
// fifteen fields, because it arrives with all six schools. Past participles
// are declared in the harm field alone, because the Curse gloss is the only
// clause template here that reaches for one.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<GreekRoot>>> = {
  warding: [
    { root: 'phulak', forms: ['noun', 'verb'] },
    { root: 'alek', forms: ['verb'] },
    { root: 'skep', forms: ['noun', 'verb'] },
    { root: 'teikh', forms: ['noun'] },
    { root: 'thoorak', forms: ['noun'] },
    { root: 'erk', forms: ['noun'] },
    { root: 'sooteer', forms: ['noun'] },
    { root: 'amun', forms: ['verb'] },
    { root: 'steph', forms: ['noun', 'verb'] },
    { root: 'alk', forms: ['noun'] },
  ],
  harm: [
    { root: 'blab', forms: ['noun', 'verb', 'pp'] },
    { root: 'pleeg', forms: ['noun', 'verb', 'pp'] },
    { root: 'nos', forms: ['noun'] },
    { root: 'alg', forms: ['noun'] },
    { root: 'phthor', forms: ['noun', 'verb', 'pp'] },
    { root: 'traumat', forms: ['noun', 'verb', 'pp'] },
    { root: 'lup', forms: ['noun', 'verb', 'pp'] },
    { root: 'olethr', forms: ['noun'] },
    { root: 'mastig', forms: ['noun', 'verb', 'pp'] },
    { root: 'pikr', forms: ['adj', 'adv'] },
  ],
  summoning: [
    { root: 'kal', forms: ['verb'] },
    { root: 'kleez', forms: ['verb'] },
    { root: 'kraug', forms: ['verb'] },
    { root: 'elth', forms: ['verb'], intransitive: true },
    { root: 'ik', forms: ['verb'], intransitive: true },
    { root: 'zeet', forms: ['verb'] },
    { root: 'eukh', forms: ['verb'] },
    { root: 'orm', forms: ['verb'] },
    { root: 'aggel', forms: ['verb'] },
  ],
  hidden: [
    { root: 'lathr', forms: ['adv'] },
    { root: 'musteer', forms: ['noun'] },
    { root: 'aporreet', forms: ['noun'] },
    { root: 'kruph', forms: ['noun', 'adv'] },
    { root: 'kalupt', forms: ['noun'] },
    { root: 'sioop', forms: ['noun'] },
    { root: 'ainigm', forms: ['noun'] },
    { root: 'buth', forms: ['noun'] },
  ],
  binding: [
    { root: 'desm', forms: ['verb'] },
    { root: 'sphrag', forms: ['verb'] },
    { root: 'plek', forms: ['verb'] },
    { root: 'zug', forms: ['verb'] },
    { root: 'sphigg', forms: ['verb'] },
    { root: 'ped', forms: ['verb'] },
    { root: 'katokh', forms: ['verb'] },
    { root: 'kleithr', forms: ['verb'] },
    { root: 'sunekh', forms: ['verb'] },
  ],
  fire: [
    { root: 'pur', forms: ['noun'] },
    { root: 'phlog', forms: ['noun'] },
    { root: 'kaus', forms: ['verb', 'pp'] },
    { root: 'anthrak', forms: ['noun'] },
    { root: 'lamp', forms: ['noun'] },
    { root: 'aithal', forms: ['noun'] },
    { root: 'phleg', forms: ['verb', 'pp'] },
    { root: 'therm', forms: ['noun'] },
    { root: 'spintheer', forms: ['noun'] },
    { root: 'keraun', forms: ['noun', 'verb', 'pp'] },
  ],
  night: [
    { root: 'nukt', forms: ['noun'] },
    { root: 'skot', forms: ['noun', 'adj', 'adv'] },
    { root: 'seleen', forms: ['noun'] },
    { root: 'zoph', forms: ['noun', 'adj'] },
    { root: 'oneir', forms: ['noun'] },
    { root: 'melan', forms: ['adj'] },
    { root: 'esper', forms: ['noun'] },
    { root: 'kneph', forms: ['noun'] },
    { root: 'astr', forms: ['noun'] },
    { root: 'upn', forms: ['noun'] },
  ],
  death: [
    { root: 'thanat', forms: ['noun'] },
    { root: 'nekr', forms: ['noun', 'adj'] },
    { root: 'taph', forms: ['noun'] },
    { root: 'aid', forms: ['noun'] },
    { root: 'keer', forms: ['noun'] },
    { root: 'psukh', forms: ['noun'] },
    { root: 'sphag', forms: ['noun'] },
    { root: 'tumb', forms: ['noun'] },
    { root: 'leipsan', forms: ['noun'] },
  ],
  gates: [
    { root: 'pul', forms: ['noun'] },
    { root: 'thur', forms: ['noun'] },
    { root: 'od', forms: ['noun'] },
    { root: 'por', forms: ['noun'] },
    { root: 'katabas', forms: ['noun'] },
    { root: 'stom', forms: ['noun'] },
    { root: 'khasm', forms: ['noun'] },
    { root: 'gephur', forms: ['noun'] },
    { root: 'oud', forms: ['noun'] },
  ],
  time: [
    { root: 'khron', forms: ['noun'] },
    { root: 'oor', forms: ['noun'] },
    { root: 'aioon', forms: ['noun'] },
    { root: 'et', forms: ['noun'] },
    { root: 'eemer', forms: ['noun'] },
    { root: 'kair', forms: ['noun'] },
    { root: 'arkh', forms: ['noun'] },
    { root: 'tel', forms: ['noun'] },
    { root: 'meen', forms: ['noun'] },
    { root: 'eeoos', forms: ['noun'] },
  ],
  sight: [
    { root: 'or', forms: ['verb'] },
    { root: 'blep', forms: ['verb'] },
    { root: 'opt', forms: ['noun'] },
    { root: 'skop', forms: ['noun', 'verb'] },
    { root: 'mant', forms: ['noun'] },
    { root: 'deik', forms: ['verb'] },
    { root: 'phain', forms: ['verb'] },
    { root: 'saph', forms: ['adj', 'adv'] },
    { root: 'gnoos', forms: ['noun'] },
    { root: 'propheet', forms: ['noun'] },
  ],
  fate: [
    { root: 'moir', forms: ['noun'] },
    { root: 'eimarmen', forms: ['noun'] },
    { root: 'anagk', forms: ['noun'] },
    { root: 'kleer', forms: ['noun'] },
    { root: 'tukh', forms: ['noun'] },
    { root: 'aisim', forms: ['adj'] },
    { root: 'nemes', forms: ['noun'] },
    { root: 'asphal', forms: ['adj'] },
    { root: 'klooth', forms: ['noun'] },
    { root: 'orism', forms: ['noun'] },
  ],
  signs: [
    { root: 'seem', forms: ['noun'] },
    { root: 'terat', forms: ['noun'] },
    { root: 'khreesm', forms: ['noun'] },
    { root: 'sumbol', forms: ['noun'] },
    { root: 'ornith', forms: ['noun'] },
    { root: 'splagkhn', forms: ['noun'] },
    { root: 'graph', forms: ['noun'] },
    { root: 'pheem', forms: ['noun'] },
    { root: 'kleedon', forms: ['noun'] },
    { root: 'tekmeer', forms: ['noun'] },
  ],
  course: [
    { root: 'diabain', forms: ['verb'] },
    { root: 'streph', forms: ['verb'] },
    { root: 'speud', forms: ['verb'] },
    { root: 'brad', forms: ['verb', 'adj'] },
    { root: 'paus', forms: ['verb'] },
    { root: 'air', forms: ['verb'] },
    { root: 'takh', forms: ['adj', 'adv'] },
    { root: 'kain', forms: ['verb', 'adj'] },
  ],
  beings: [
    { root: 'daimon', forms: ['noun'] },
    { root: 'anakt', forms: ['noun'] },
    { root: 'koiran', forms: ['noun'] },
    { root: 'promakh', forms: ['noun'] },
    { root: 'progon', forms: ['noun'] },
    { root: 'paredr', forms: ['noun'] },
    { root: 'alastor', forms: ['noun'] },
    { root: 'troph', forms: ['noun'] },
    { root: 'paid', forms: ['noun'] },
    { root: 'makar', forms: ['noun'] },
  ],
};

// Voces magicae of the papyri and the tablets (spec 8.7), written letter for
// letter through the ordinary romanization.
export const BRIGHT_POWER: ReadonlyArray<string> = [
  'iaoo',
  'abrasaks',
  'sabaooth',
  'adoonai',
  'ablanathanalba',
  'semeseilam',
  'akrammakhamarei',
  'damnameneus',
];

// The chthonic five of spec 8.7. Two of them are the second and third words of
// the triad the papyri speak at the crossroads, so the first word and the
// goddess it addresses joined them rather than a list being extended, and the
// Maskelli formula is cited by its head word the way the papyri cite it.
export const DARK_POWER: ReadonlyArray<string> = [
  'ereskhigal',
  'neboutosoualeeth',
  'aktioophi',
  'ekatee',
  'maskelli',
];

// The shrinking sequence drops a letter at a time down to a single one, which
// iaoo does exactly: ΙΑΩ, ΑΩ, Ω (spec 8.7).
export const SHRINKING_WORD = 'iaoo';

// Dread epithets of the Eldritch register (spec 8.10), indeclinable listed
// forms in -ΩΘ that the register's own two rules never touch.
export const DREAD_POWER: ReadonlyArray<string> = [
  'ksargooth',
  'thrugksooth',
  'borgmooth',
  'psalkhooth',
  'khthonksooth',
  'murksathooth',
  'gorguthooth',
  'sphigksooth',
  'nuktrapsooth',
  'zophragksooth',
];

// Function words (spec 8.4), which the register never touches.
export const FN_KATA = 'kata';
export const FN_EIS = 'eis';
export const FN_KAI = 'kai';
export const FN_ARA = 'ara';
export const GC5_TAIL = 'eekoo';

// Four attested adverbs, Chronomancy only, one per value of the plan's
// direction (spec 8.4).
export const DIRECTION_WORDS: Readonly<Record<TimeDirection, string>> = {
  back: 'opisoo',
  forth: 'prosoo',
  again: 'palin',
  still: 'atrema',
};

export type GreekIdiomId =
  | 'GO1'
  | 'GO2'
  | 'GO3_SHORT'
  | 'GO3_FULL'
  | 'GO4'
  | 'GO5'
  | 'GO6'
  | 'GC1'
  | 'GC2'
  | 'GC3'
  | 'GC4'
  | 'ELDRITCH_OPEN_SHORT'
  | 'ELDRITCH_OPEN_FULL'
  | 'ELDRITCH_CLOSE';

// Idiom word lists of spec 8.6 and 8.10. GC5 takes an argument and is built at
// realization, so only the idioms with a fixed shape live here. What each one
// says is in the packs, under the same id.
export const IDIOM_WORDS: Readonly<Record<GreekIdiomId, ReadonlyArray<string>>> = {
  GO1: ['phulakteerion'],
  GO2: ['epikaloumai', 'se'],
  GO3_SHORT: ['aski', 'kataski'],
  GO3_FULL: ['aski', 'kataski', 'liks', 'tetraks', 'damnameneus', 'aisia'],
  GO4: ['orkizoo', 'se'],
  GO5: ['khreeson', 'moi'],
  GO6: ['aioon', 'aioonos'],
  GC1: ['eedee', 'eedee', 'takhu', 'takhu'],
  GC2: ['genesthoo'],
  GC3: ['ameen'],
  GC4: ['outoos', 'ekhei'],
  // The Ephesian words are this genome's row, so the register reads them
  // against their order, as it reads the futhark backwards (spec 8.10).
  ELDRITCH_OPEN_SHORT: ['kataski', 'aski'],
  ELDRITCH_OPEN_FULL: ['aisia', 'damnameneus', 'tetraks', 'liks', 'kataski', 'aski'],
  ELDRITCH_CLOSE: ['phthorooth', 'aioonooth'],
};

// The invocation imperative addresses the invoked power itself, so it draws
// from the two summoning roots a power can be told to do. Both are flagged
// intransitive, which is exactly the exemption spec 8.3 states.
export const INVOCATION_COME: ReadonlyArray<string> = ['elth', 'ik'];
