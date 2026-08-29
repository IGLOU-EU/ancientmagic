// Latin genome data, transcribed from docs/genomes.md section 9. Every root,
// idiom word, power word and codepoint comes from the spec.
//
// This genome selects rather than coins: every root below is a real Latin
// word in its real class, so the class column is data and not decoration. The
// generator conjugates and declines only the regular half of the language,
// which is why no principal parts are stored.
//
// What a root MEANS is not here. This file says which roles a root can fill,
// the gloss pack of the displayed language says how each role reads. The pack
// must cover exactly the forms declared here, no more and no less, which the
// pack completeness tests check.

import type { SemanticField, TimeDirection } from '../generator/types.js';
import type { RootForm } from '../glosses/types.js';

// The 20 capitals of spec 9.1, and the one row that runs the other way from
// every digraph in this project: two tokens land on V, so the reading line can
// speak the sound the capital does not write. I likewise carries both its
// values, and the greedy tokenizer has nothing to parse here.
export const LETTER_MAP: Readonly<Record<string, string>> = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  e: 'E',
  f: 'F',
  g: 'G',
  h: 'H',
  i: 'I',
  l: 'L',
  m: 'M',
  n: 'N',
  o: 'O',
  p: 'P',
  q: 'Q',
  r: 'R',
  s: 'S',
  t: 'T',
  u: 'V',
  v: 'V',
  x: 'X',
};

// U+00B7 MIDDLE DOT, the interpunct. Written as an escape because U+0387 GREEK
// ANO TELEIA draws the same picture and this project emits both, one per
// genome: a separator copied off a rendered page would pass every proof by eye
// (spec 9.1).
export const WORD_SEP = '·';

export type SealCount = 3 | 7 | 9 | 12 | 27;

export const SEAL_COUNTS: ReadonlyArray<SealCount> = [3, 7, 9, 12, 27];

// The Roman numerals of spec 9.8, additive and never subtractive, built from
// letters the alphabet already carries.
export const SEAL_GLYPHS: Readonly<Record<SealCount, string>> = {
  3: 'III',
  7: 'VII',
  9: 'VIIII',
  12: 'XII',
  27: 'XXVII',
};

// The numeral adverb, not the cardinal: a recitation count means "N times".
export const SEAL_WORDS: Readonly<Record<SealCount, string>> = {
  3: 'ter',
  7: 'septies',
  9: 'novies',
  12: 'duodecies',
  27: 'ter novies',
};

// The instruction the count is sealed with, which follows it (spec 9.8).
export const SEAL_TAIL = 'dicito';

export type NounClass = 'a' | 'us' | 'um';

export interface LatinRoot {
  root: string;
  // Roles this root can fill. A role it does not declare is never drawn.
  forms: ReadonlyArray<RootForm>;
  // The declension of the noun this stem is cut from, read off the citation
  // form of spec 9.3. Carried by every root that heads a noun, and by no
  // other: an adjective takes the class of the noun it agrees with.
  nounClass?: NounClass;
  // Spec 9.3: proper, advol and flagr never fill a slot that takes an object.
  intransitive?: boolean;
}

// Selected roots by semantic field (spec 9.3). This genome populates all
// fifteen fields, because it arrives with all six schools. Past participles
// are declared in the harm field alone, because the Curse gloss is the only
// clause template here that reaches for one.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<LatinRoot>>> = {
  warding: [
    { root: 'serv', forms: ['verb'] },
    { root: 'tutel', forms: ['noun'], nounClass: 'a' },
    { root: 'geni', forms: ['noun'], nounClass: 'us' },
    { root: 'mur', forms: ['noun'], nounClass: 'us' },
    { root: 'clipe', forms: ['noun'], nounClass: 'us' },
    { root: 'vall', forms: ['noun'], nounClass: 'us' },
    { root: 'praesidi', forms: ['noun'], nounClass: 'um' },
    { root: 'firm', forms: ['verb'] },
    { root: 'arm', forms: ['verb'] },
    { root: 'obser', forms: ['verb'] },
  ],
  harm: [
    { root: 'vex', forms: ['verb', 'pp'] },
    { root: 'damn', forms: ['verb', 'pp'] },
    { root: 'vulner', forms: ['verb', 'pp'] },
    { root: 'nec', forms: ['verb', 'pp'] },
    { root: 'flagell', forms: ['verb', 'pp'] },
    { root: 'morb', forms: ['noun'], nounClass: 'us' },
    { root: 'ruin', forms: ['noun'], nounClass: 'a' },
    { root: 'nox', forms: ['noun'], nounClass: 'a' },
    { root: 'amar', forms: ['adj', 'adv'] },
    { root: 'dir', forms: ['adj'] },
  ],
  summoning: [
    { root: 'voc', forms: ['verb'] },
    { root: 'evoc', forms: ['verb'] },
    { root: 'clam', forms: ['verb'] },
    { root: 'invit', forms: ['verb'] },
    { root: 'rog', forms: ['verb'] },
    { root: 'flagit', forms: ['verb'] },
    { root: 'incant', forms: ['verb'] },
    { root: 'nunti', forms: ['noun', 'verb'], nounClass: 'us' },
    { root: 'proper', forms: ['verb'], intransitive: true },
    { root: 'advol', forms: ['verb'], intransitive: true },
  ],
  hidden: [
    { root: 'cel', forms: ['verb'] },
    { root: 'occult', forms: ['verb', 'adv'] },
    { root: 'vel', forms: ['noun', 'verb'], nounClass: 'um' },
    { root: 'latebr', forms: ['noun'], nounClass: 'a' },
    { root: 'cavern', forms: ['noun'], nounClass: 'a' },
    { root: 'susurr', forms: ['noun', 'verb'], nounClass: 'us' },
    { root: 'secret', forms: ['noun'], nounClass: 'um' },
    { root: 'arcan', forms: ['noun'], nounClass: 'um' },
    { root: 'silenti', forms: ['noun'], nounClass: 'um' },
    { root: 'profund', forms: ['noun'], nounClass: 'um' },
  ],
  binding: [
    { root: 'lig', forms: ['verb'] },
    { root: 'oblig', forms: ['verb'] },
    { root: 'nod', forms: ['noun', 'verb'], nounClass: 'us' },
    { root: 'vincul', forms: ['noun'], nounClass: 'um' },
    { root: 'caten', forms: ['noun'], nounClass: 'a' },
    { root: 'obsign', forms: ['verb'] },
    { root: 'sigill', forms: ['noun'], nounClass: 'um' },
    { root: 'fren', forms: ['noun', 'verb'], nounClass: 'um' },
    { root: 'ser', forms: ['noun'], nounClass: 'a' },
    { root: 'clav', forms: ['noun'], nounClass: 'us' },
  ],
  fire: [
    { root: 'flamm', forms: ['noun', 'verb'], nounClass: 'a' },
    { root: 'crem', forms: ['verb'] },
    { root: 'ustul', forms: ['verb'] },
    { root: 'flagr', forms: ['verb'], intransitive: true },
    { root: 'favill', forms: ['noun'], nounClass: 'a' },
    { root: 'scintill', forms: ['noun'], nounClass: 'a' },
    { root: 'prun', forms: ['noun'], nounClass: 'a' },
    { root: 'fum', forms: ['noun'], nounClass: 'us' },
    { root: 'lucern', forms: ['noun'], nounClass: 'a' },
    { root: 'bust', forms: ['noun'], nounClass: 'um' },
  ],
  night: [
    { root: 'lun', forms: ['noun'], nounClass: 'a' },
    { root: 'stell', forms: ['noun'], nounClass: 'a' },
    { root: 'umbr', forms: ['noun'], nounClass: 'a' },
    { root: 'nebul', forms: ['noun'], nounClass: 'a' },
    { root: 'somn', forms: ['noun'], nounClass: 'us' },
    { root: 'crepuscul', forms: ['noun'], nounClass: 'um' },
    { root: 'brum', forms: ['noun'], nounClass: 'a' },
    { root: 'obscur', forms: ['adj', 'adv'] },
    { root: 'furv', forms: ['adj'] },
    { root: 'nocturn', forms: ['adj'] },
  ],
  death: [
    { root: 'let', forms: ['noun'], nounClass: 'um' },
    { root: 'sepulcr', forms: ['noun'], nounClass: 'um' },
    { root: 'larv', forms: ['noun'], nounClass: 'a' },
    { root: 'tumul', forms: ['noun'], nounClass: 'us' },
    { root: 'simulacr', forms: ['noun'], nounClass: 'um' },
    { root: 'urn', forms: ['noun'], nounClass: 'a' },
    { root: 'defunct', forms: ['adj'] },
    { root: 'funest', forms: ['adj'] },
    { root: 'trucid', forms: ['verb'] },
    { root: 'immol', forms: ['verb'] },
  ],
  gates: [
    { root: 'port', forms: ['noun'], nounClass: 'a' },
    { root: 'ianu', forms: ['noun'], nounClass: 'a' },
    { root: 'osti', forms: ['noun'], nounClass: 'um' },
    { root: 'vi', forms: ['noun'], nounClass: 'a' },
    { root: 'semit', forms: ['noun'], nounClass: 'a' },
    { root: 'fenestr', forms: ['noun'], nounClass: 'a' },
    { root: 'claustr', forms: ['noun'], nounClass: 'um' },
    { root: 'vestibul', forms: ['noun'], nounClass: 'um' },
    { root: 'postic', forms: ['noun'], nounClass: 'um' },
    { root: 'reser', forms: ['verb'] },
  ],
  time: [
    { root: 'hor', forms: ['noun'], nounClass: 'a' },
    { root: 'auror', forms: ['noun'], nounClass: 'a' },
    { root: 'ann', forms: ['noun'], nounClass: 'us' },
    { root: 'saecul', forms: ['noun'], nounClass: 'um' },
    { root: 'aev', forms: ['noun'], nounClass: 'um' },
    { root: 'moment', forms: ['noun'], nounClass: 'um' },
    { root: 'crastin', forms: ['noun'], nounClass: 'um' },
    { root: 'initi', forms: ['noun'], nounClass: 'um' },
    { root: 'termin', forms: ['noun'], nounClass: 'us' },
    { root: 'aetern', forms: ['noun'], nounClass: 'um' },
  ],
  sight: [
    { root: 'spect', forms: ['verb'] },
    { root: 'observ', forms: ['verb'] },
    { root: 'monstr', forms: ['verb'] },
    { root: 'revel', forms: ['verb'] },
    { root: 'lustr', forms: ['verb'] },
    { root: 'explor', forms: ['verb'] },
    { root: 'divin', forms: ['noun', 'verb'], nounClass: 'us' },
    { root: 'sortileg', forms: ['noun'], nounClass: 'us' },
    { root: 'ocul', forms: ['noun'], nounClass: 'us' },
    { root: 'hariol', forms: ['noun'], nounClass: 'us' },
    { root: 'clar', forms: ['adj', 'adv'] },
    { root: 'laev', forms: ['adj'] },
    { root: 'faust', forms: ['adj', 'adv'] },
  ],
  fate: [
    { root: 'fat', forms: ['noun'], nounClass: 'um' },
    { root: 'fortun', forms: ['noun'], nounClass: 'a' },
    { root: 'fil', forms: ['noun'], nounClass: 'um' },
    { root: 'pens', forms: ['noun'], nounClass: 'um' },
    { root: 'decret', forms: ['noun'], nounClass: 'um' },
    { root: 'iudici', forms: ['noun'], nounClass: 'um' },
    { root: 'genitur', forms: ['noun'], nounClass: 'a' },
    { root: 'destin', forms: ['adj'] },
    { root: 'cert', forms: ['adj', 'adv'] },
    { root: 'fatidic', forms: ['adj'] },
  ],
  signs: [
    { root: 'sign', forms: ['noun', 'verb'], nounClass: 'um' },
    { root: 'portent', forms: ['noun'], nounClass: 'um' },
    { root: 'oracul', forms: ['noun'], nounClass: 'um' },
    { root: 'auguri', forms: ['noun'], nounClass: 'um' },
    { root: 'praesagi', forms: ['noun'], nounClass: 'um' },
    { root: 'respons', forms: ['noun'], nounClass: 'um' },
    { root: 'aquil', forms: ['noun'], nounClass: 'a' },
    { root: 'corv', forms: ['noun'], nounClass: 'us' },
    { root: 'fibr', forms: ['noun'], nounClass: 'a' },
    { root: 'fiss', forms: ['noun'], nounClass: 'um' },
    { root: 'hosti', forms: ['noun'], nounClass: 'a' },
    { root: 'astr', forms: ['noun'], nounClass: 'um' },
    { root: 'cael', forms: ['noun'], nounClass: 'um' },
  ],
  course: [
    { root: 'super', forms: ['verb'] },
    { root: 'revoc', forms: ['verb'] },
    { root: 'festin', forms: ['verb'] },
    { root: 'tard', forms: ['verb', 'adj'] },
    { root: 'retent', forms: ['verb'] },
    { root: 'nov', forms: ['verb', 'adj'] },
    { root: 'rapid', forms: ['adj', 'adv'] },
    { root: 'curricul', forms: ['noun'], nounClass: 'um' },
    { root: 'vestigi', forms: ['noun'], nounClass: 'um' },
    { root: 'orbit', forms: ['noun'], nounClass: 'a' },
  ],
  beings: [
    { root: 'div', forms: ['noun'], nounClass: 'us' },
    { root: 'domin', forms: ['noun'], nounClass: 'us' },
    { root: 'regin', forms: ['noun'], nounClass: 'a' },
    { root: 'patron', forms: ['noun'], nounClass: 'us' },
    { root: 'atav', forms: ['noun'], nounClass: 'us' },
    { root: 'anim', forms: ['noun'], nounClass: 'a' },
    { root: 'antistit', forms: ['noun'], nounClass: 'a' },
    { root: 'mag', forms: ['noun'], nounClass: 'us' },
    { root: 'famul', forms: ['noun'], nounClass: 'us' },
    { root: 'soci', forms: ['noun'], nounClass: 'us' },
  ],
};

// An attested power word of spec 9.7. Two of the rows the Latin record keeps
// are whole chants, so a power is a word list here rather than a word: what
// the tiers restrict is how many words a slot can take.
export interface LatinPower {
  readonly id: string;
  readonly words: ReadonlyArray<string>;
  // A chant row fills only the free power word of a school clause: tripling
  // eight words would flood the line, and tier 1 writes no separator at all
  // (spec 9.7).
  readonly chant?: true;
}

export const BRIGHT_POWER: ReadonlyArray<LatinPower> = [
  { id: 'abracadabra', words: ['abracadabra'] },
  {
    id: 'motas',
    chant: true,
    words: ['motas', 'vaeta', 'daries', 'dardares', 'astataries', 'dissunapiter'],
  },
  {
    id: 'huat',
    chant: true,
    words: ['huat', 'hauat', 'huat', 'ista', 'pista', 'sista', 'dannabo', 'dannaustra'],
  },
  { id: 'fascinus', words: ['fascinus'] },
  { id: 'angitia', words: ['angitia'] },
  { id: 'carmenta', words: ['carmenta'] },
  { id: 'egeria', words: ['egeria'] },
];

export const DARK_POWER: ReadonlyArray<LatinPower> = [
  { id: 'proserpina', words: ['proserpina'] },
  { id: 'dispater', words: ['dis', 'pater'] },
];

// The triangle word of the clear register, fixed per school by the three-case
// rule of spec 9.9. Sammonicus prescribes the shrinking of the first, so the
// one letter-triangle in this project that is attested rather than borrowed
// belongs to Latin. The second is this document's own extension of the device
// to the chthonic register: a bright fever amulet has no place under a
// nailing, and a name's fragments are not broken Latin because a name is not a
// sentence. The register's third case draws its word and is not fixed (9.10).
export const SHRINKING_WORD = 'abracadabra';
export const DARK_SHRINKING_WORD = 'proserpina';

// Dread epithets of the Eldritch register (spec 9.10), indeclinable listed
// forms built to fail the phonotactics of 9.3 on sight. The register
// transforms nothing, so these arrive whole or not at all.
export const DREAD_POWER: ReadonlyArray<string> = [
  'xulgoth',
  'sthulvorn',
  'gnorvath',
  'throxul',
  'mroguth',
  'gvortha',
  'sthanox',
  'thulcron',
  'vrixoth',
  'ulthrax',
];

// Function words (spec 9.4). CONTRA and AD govern the accusative, ET joins
// clauses from difficulty 6, and NE is the one affix that hangs on a word.
export const FN_CONTRA = 'contra';
export const FN_AD = 'ad';
export const FN_ET = 'et';
export const ENCLITIC_NE = 'ne';

// The verb the return anchor closes on, frozen idiom data and never a drawn
// perfect (spec 9.12).
export const LC5_TAIL = 'veni';

// Four attested adverbs, Chronomancy only, one per value of the plan's
// direction (spec 9.4).
export const DIRECTION_WORDS: Readonly<Record<TimeDirection, string>> = {
  back: 'retro',
  forth: 'porro',
  again: 'iterum',
  still: 'quiete',
};

export type LatinIdiomId =
  | 'LO1'
  | 'LO2'
  | 'LO3_SHORT'
  | 'LO3_FULL'
  | 'LO4'
  | 'LO5'
  | 'LO6'
  | 'LO7'
  | 'LC1'
  | 'LC2'
  | 'LC3'
  | 'LC4'
  | 'ELDRITCH_OPEN_SHORT'
  | 'ELDRITCH_OPEN_FULL'
  | 'ELDRITCH_CLOSE';

// Idiom word lists of spec 9.6 and 9.10. LC5 takes an argument and is built at
// realization, so only the idioms with a fixed shape live here. What each one
// says is in the packs, under the same id.
export const IDIOM_WORDS: Readonly<Record<LatinIdiomId, ReadonlyArray<string>>> = {
  LO1: ['amuletum'],
  LO2: ['te', 'precor', 'quaesoque'],
  LO3_SHORT: ['sator', 'arepo'],
  LO3_FULL: ['sator', 'arepo', 'tenet', 'opera', 'rotas'],
  LO4: ['defigo'],
  LO5: ['sortem', 'duco'],
  LO6: ['iane', 'pater'],
  LO7: ['exta', 'inspicio'],
  LC1: ['iam', 'iam', 'cito', 'cito'],
  LC2: ['esto'],
  LC3: ['votum', 'solvi'],
  LC4: ['ita', 'est'],
  // The square is a palindrome in two directions, so the register turns it
  // rather than wounding it, and the order it reads is the one the oldest
  // finds carry (spec 9.10).
  ELDRITCH_OPEN_SHORT: ['rotas', 'opera'],
  ELDRITCH_OPEN_FULL: ['rotas', 'opera', 'tenet', 'arepo', 'sator'],
  ELDRITCH_CLOSE: ['ruina', 'aeterna'],
};

// The Invocation order provides no object, which is the one exemption spec 9.3
// states for the two intransitive summoning verbs, and the summons is
// addressed to the power itself: what it is told to do is come near.
export const INVOCATION_COME: ReadonlyArray<string> = ['proper', 'advol'];
