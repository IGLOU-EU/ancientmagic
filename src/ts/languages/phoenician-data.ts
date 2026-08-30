// Phoenician genome data, transcribed from docs/genomes.md section 4. Every
// root, idiom, divine name and codepoint comes from the spec.
//
// What a root MEANS is not here. This file says which roles a root can fill,
// the gloss pack of the displayed language says how each role reads. The pack
// must cover exactly the forms declared here, no more and no less, which the
// pack completeness tests check.

import type { SemanticField, TimeDirection } from '../generator/types.js';
import type { RootForm } from '../glosses/types.js';

// The 22 letters of the abjad (spec 4.1). Tokens are the ASCII romanization
// the generator maps from, greedy longest match. The five digraphs kh, tt, ts,
// sh and gh each stand for one letter.
export const LETTER_MAP: Readonly<Record<string, string>> = {
  "'": '\u{10900}',
  b: '\u{10901}',
  g: '\u{10902}',
  d: '\u{10903}',
  h: '\u{10904}',
  w: '\u{10905}',
  z: '\u{10906}',
  kh: '\u{10907}',
  tt: '\u{10908}',
  y: '\u{10909}',
  k: '\u{1090A}',
  l: '\u{1090B}',
  m: '\u{1090C}',
  n: '\u{1090D}',
  s: '\u{1090E}',
  gh: '\u{1090F}',
  p: '\u{10910}',
  ts: '\u{10911}',
  q: '\u{10912}',
  r: '\u{10913}',
  sh: '\u{10914}',
  t: '\u{10915}',
};

export const ALF = '\u{10900}';
export const WORD_SEP = '\u{1091F}';

// Native numerals (spec 4.8). The block only carries these because the script
// composed larger numbers by stacking them.
export const NUM_1 = '\u{10916}';
export const NUM_2 = '\u{1091A}';
export const NUM_3 = '\u{1091B}';
export const NUM_10 = '\u{10917}';

export type SealCount = 3 | 7 | 9 | 12;

export const NUMERAL_GLYPHS: Readonly<Record<SealCount, string>> = {
  3: NUM_3,
  7: `${NUM_3}${NUM_3}${NUM_1}`,
  9: `${NUM_3}${NUM_3}${NUM_3}`,
  12: `${NUM_10}${NUM_2}`,
};

export const NUMERAL_WORDS: Readonly<Record<SealCount, string>> = {
  3: 'shalosh',
  7: 'sheba',
  9: 'tesha',
  12: 'shenem asar',
};

export const SEAL_COUNTS: ReadonlyArray<SealCount> = [3, 7, 9, 12];

export interface PhoenicianRoot {
  // Consonant skeleton in the tokens of 4.1.
  root: string;
  // Roles this root can fill. A role it does not declare is never drawn.
  forms: ReadonlyArray<RootForm>;
  // Spec 4.3: never fills a slot that takes a direct object or an 'yt phrase.
  intransitive?: boolean;
}

// Coined roots by semantic field (spec 4.3). The seven biconsonantal roots the
// spec allows carry noun forms only, because 4.4 states no verb pattern below
// three radicals.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<PhoenicianRoot>>> = {
  warding: [
    { root: 'mgn', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'ntsr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'shmr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'gdr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'skk', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'smk', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'ghzr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'khsn', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'khpp', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'swg', forms: ['noun', 'plural', 'verb', 'pp'] },
  ],
  harm: [
    { root: '\'rr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'qll', forms: ['verb', 'pp', 'adj'] },
    { root: 'ngp', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'shbr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'mkhts', forms: ['verb', 'pp'] },
    { root: 'khbl', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'hdp', forms: ['verb', 'pp'] },
    { root: '\'bd', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'khrb', forms: ['verb', 'pp', 'adj'] },
    { root: 'rtsts', forms: ['verb', 'pp', 'adj'] },
  ],
  summoning: [
    { root: 'qr\'', forms: ['verb', 'pp'] },
    { root: 'zghq', forms: ['verb', 'pp'] },
    { root: 'shlkh', forms: ['verb', 'pp'] },
    { root: 'bw\'', forms: ['verb', 'pp'] },
    { root: 'ngd', forms: ['verb', 'pp'] },
    { root: 'pqd', forms: ['verb', 'pp'] },
    { root: '\'sp', forms: ['verb', 'pp'] },
    { root: 'ghny', forms: ['verb', 'pp'] },
    { root: 'drsh', forms: ['verb', 'pp'] },
    { root: 'qbts', forms: ['verb', 'pp'] },
  ],
  hidden: [
    { root: 'str', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'ghlm', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'khb\'', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'tspn', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'khshk', forms: ['noun', 'plural', 'verb', 'pp', 'adj'] },
    { root: 'lkhsh', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'ghmq', forms: ['noun', 'plural', 'adj'] },
    { root: 'ttmn', forms: ['verb', 'pp'] },
    { root: 'khdr', forms: ['noun', 'plural'] },
    { root: 'swd', forms: ['noun', 'plural'] },
  ],
  binding: [
    { root: '\'sr', forms: ['verb', 'pp'] },
    { root: 'khtm', forms: ['verb', 'pp'] },
    { root: 'qshr', forms: ['verb', 'pp'] },
    { root: 'kbl', forms: ['verb', 'pp'] },
    { root: 'rtq', forms: ['verb', 'pp'] },
    { root: 'ghqd', forms: ['verb', 'pp'] },
    { root: 'khnq', forms: ['verb', 'pp'] },
    { root: 'tsrr', forms: ['verb', 'pp'] },
    { root: 'khgr', forms: ['verb', 'pp'] },
    { root: 'zmm', forms: ['verb', 'pp'] },
  ],
  fire: [
    { root: '\'sh', forms: ['noun', 'plural'] },
    { root: 'lhb', forms: ['noun', 'plural'] },
    { root: 'bghr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'srp', forms: ['verb', 'pp'] },
    { root: 'qdkh', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'zrkh', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'rshp', forms: ['noun', 'plural'] },
    { root: 'gkhl', forms: ['noun', 'plural'] },
    { root: 'khrr', forms: ['verb', 'pp', 'adj'] },
    { root: 'tnr', forms: ['noun', 'plural'] },
  ],
  night: [
    { root: 'lyl', forms: ['noun', 'plural'] },
    { root: 'ghrb', forms: ['noun', 'plural'] },
    { root: '\'pl', forms: ['noun', 'plural', 'adj'] },
    { root: 'nshp', forms: ['noun', 'plural'] },
    { root: 'tslm', forms: ['noun', 'plural', 'adj'] },
    { root: 'shkhr', forms: ['noun', 'plural', 'adj'] },
    { root: 'dmm', forms: ['noun', 'plural', 'adj'] },
    { root: 'nwm', forms: ['noun', 'plural', 'verb', 'pp'], intransitive: true },
    { root: 'khlm', forms: ['noun', 'plural'] },
    { root: 'qdr', forms: ['verb', 'pp', 'adj'] },
  ],
  death: [
    { root: 'mwt', forms: ['noun', 'plural'] },
    { root: 'qbr', forms: ['noun', 'plural'] },
    { root: 'rp\'', forms: ['noun', 'plural'] },
    { root: 'shkhb', forms: ['verb', 'pp'], intransitive: true },
    { root: 'krt', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'shkht', forms: ['noun', 'plural'] },
    { root: 'dwy', forms: ['verb', 'pp', 'adj'], intransitive: true },
    { root: 'blgh', forms: ['verb', 'pp'] },
    { root: 'khdl', forms: ['verb', 'pp'], intransitive: true },
    { root: 'nbl', forms: ['verb', 'pp', 'adj'], intransitive: true },
  ],
  gates: [
    { root: 'shghr', forms: ['noun', 'plural'] },
    { root: 'dl', forms: ['noun', 'plural'] },
    { root: 'ptkh', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'sp', forms: ['noun', 'plural'] },
    { root: 'shqp', forms: ['noun', 'plural'] },
    { root: 'khln', forms: ['noun', 'plural'] },
    { root: 'shbl', forms: ['noun', 'plural'] },
    { root: 'drk', forms: ['noun', 'plural'] },
    { root: 'ghbr', forms: ['noun', 'plural', 'verb', 'pp'] },
    { root: 'bqgh', forms: ['noun', 'plural', 'verb', 'pp'] },
  ],
  time: [
    { root: 'ghd', forms: ['noun', 'plural'] },
    { root: 'zmn', forms: ['noun', 'plural'] },
    { root: 'ght', forms: ['noun', 'plural'] },
    { root: 'ym', forms: ['noun', 'plural'] },
    { root: 'shnt', forms: ['noun', 'plural'] },
    { root: 'khdsh', forms: ['noun', 'plural'] },
    { root: 'bqr', forms: ['noun', 'plural'] },
    { root: 'qdm', forms: ['noun', 'plural'] },
    { root: '\'khr', forms: ['noun', 'plural'] },
    { root: 'dr', forms: ['noun', 'plural'] },
  ],
  // The three Divination fields (spec 4.3 and 4.11). No root declares a past
  // participle, since no divination clause uses one, and a plural is declared
  // only in the signs field, the one a construct chain draws from.
  sight: [
    { root: 'khzh', forms: ['noun', 'verb'] },
    { root: 'nbtt', forms: ['verb'] },
    { root: 'glh', forms: ['verb'] },
    { root: '\'wr', forms: ['noun'] },
    { root: 'ngh', forms: ['noun'] },
    { root: 'tsph', forms: ['noun', 'verb'] },
    { root: 'sh\'l', forms: ['verb'] },
    { root: 'ghyn', forms: ['noun'] },
    { root: 'pqkh', forms: ['verb'] },
    { root: 'brr', forms: ['adj'] },
  ],
  fate: [
    { root: 'grl', forms: ['noun'] },
    { root: 'khlq', forms: ['noun'] },
    { root: 'gzr', forms: ['noun'] },
    { root: 'dyn', forms: ['noun'] },
    { root: 'mny', forms: ['noun'] },
    { root: 'ghqb', forms: ['noun'] },
    { root: 'gdd', forms: ['noun'] },
    { root: 'ntsb', forms: ['adj'] },
    { root: 'khrts', forms: ['noun'] },
    { root: 'nkhl', forms: ['noun'] },
  ],
  // The Chronomancy field (spec 4.3 and 4.12). No pp and no plural: this
  // school builds no construct chain, the only place a plural was drawn.
  course: [
    { root: 'khlp', forms: ['verb'] },
    { root: 'shwb', forms: ['verb'] },
    { root: 'mhr', forms: ['verb'] },
    { root: 'mshk', forms: ['verb'] },
    { root: 'ghmd', forms: ['verb'] },
    { root: 'nsgh', forms: ['verb'] },
    { root: 'tsghd', forms: ['noun'] },
    { root: 'hlk', forms: ['noun'] },
    { root: 'khpz', forms: ['adj'] },
    { root: 'shny', forms: ['verb'] },
  ],
  signs: [
    { root: '\'t', forms: ['noun', 'plural'] },
    { root: 'spr', forms: ['noun', 'plural'] },
    { root: 'nkhsh', forms: ['noun', 'plural'] },
    { root: 'qsm', forms: ['noun', 'plural'] },
    { root: 'hll', forms: ['noun', 'plural'] },
    { root: 'rmz', forms: ['noun', 'plural'] },
    { root: 'bshr', forms: ['noun', 'plural'] },
    { root: 'khqq', forms: ['noun', 'plural'] },
    { root: 'ghwp', forms: ['noun', 'plural'] },
    { root: 'smn', forms: ['noun', 'plural'] },
  ],
  beings: [
    { root: 'mlk', forms: ['noun', 'plural'] },
    { root: 'rbt', forms: ['noun', 'plural'] },
    { root: 'qdsh', forms: ['noun', 'plural'] },
    { root: 'ghbd', forms: ['noun', 'plural'] },
    { root: 'l\'k', forms: ['noun', 'plural'] },
    { root: 'zkr', forms: ['noun', 'plural'] },
    { root: 'tsb\'', forms: ['noun', 'plural'] },
    { root: 'gbr', forms: ['noun', 'plural'] },
    { root: 'kmr', forms: ['noun', 'plural'] },
    { root: 'ghtq', forms: ['noun', 'plural'] },
  ],
};

export interface DivineName {
  skeleton: string;
  // Written letter for letter, exempt from the collapse rule (spec 4.7).
  glyphs: string;
  spoken: string;
  // Goddess agents take the 3fs jussive prefix (spec 4.4).
  feminine: boolean;
}

// Attested divine names (spec 4.7), in table order.
export const ALL_NAMES: ReadonlyArray<DivineName> = [
  { skeleton: 'bghl', glyphs: '\u{10901}\u{1090F}\u{1090B}', spoken: 'baal', feminine: false },
  { skeleton: 'ghshtrt', glyphs: '\u{1090F}\u{10914}\u{10915}\u{10913}\u{10915}', spoken: 'ashtart', feminine: true },
  { skeleton: "'shmn", glyphs: '\u{10900}\u{10914}\u{1090C}\u{1090D}', spoken: 'eshmun', feminine: false },
  { skeleton: 'mlqrt', glyphs: '\u{1090C}\u{1090B}\u{10912}\u{10913}\u{10915}', spoken: 'milqart', feminine: false },
  { skeleton: 'tnt', glyphs: '\u{10915}\u{1090D}\u{10915}', spoken: 'tinnit', feminine: true },
  { skeleton: 'rshp', glyphs: '\u{10913}\u{10914}\u{10910}', spoken: 'reshep', feminine: false },
  { skeleton: 'khrn', glyphs: '\u{10907}\u{10913}\u{1090D}', spoken: 'horon', feminine: false },
  { skeleton: 'ssm', glyphs: '\u{1090E}\u{1090E}\u{1090C}', spoken: 'sasam', feminine: false },
];

// Spec 4.7 splits the pool by school: the protective powers on one side, the
// plague and underworld powers on the other.
export const BRIGHT_NAMES: ReadonlyArray<DivineName> = ALL_NAMES.filter((n) =>
  ['bghl', 'ghshtrt', "'shmn", 'mlqrt', 'tnt'].includes(n.skeleton),
);

export const DARK_NAMES: ReadonlyArray<DivineName> = ALL_NAMES.filter((n) =>
  ['rshp', 'khrn', 'ssm'].includes(n.skeleton),
);

// Spec 4.7: the pair the votive steles name together under a carved crescent
// and disc, and the goddess the tradition ties to the evening star. The two
// goddesses take the t- prefix wherever the asking clause resumes them.
export const DIVINATION_NAMES: ReadonlyArray<DivineName> = ALL_NAMES.filter((n) =>
  ['bghl', 'tnt', 'ghshtrt'].includes(n.skeleton),
);

export interface DreadEpithet {
  skeleton: string;
  spoken: string;
}

// Dread epithet pool of the Eldritch register (spec 4.10), quadriliteral coins.
export const DREAD_POWER: ReadonlyArray<DreadEpithet> = [
  { skeleton: 'ttkhmr', spoken: 'tokhmur' },
  { skeleton: 'qlghsh', spoken: 'qolghush' },
  { skeleton: 'tsrghn', spoken: 'tsorghun' },
  { skeleton: 'mqdgh', spoken: 'moqdugh' },
  { skeleton: 'shqmts', spoken: 'shoqmuts' },
  { skeleton: 'ghqbr', spoken: 'ghoqbur' },
  { skeleton: 'ntpl', spoken: 'notpul' },
  { skeleton: 'bghshm', spoken: 'boghshum' },
  { skeleton: 'dlqts', spoken: 'dolquts' },
  { skeleton: 'khnqsh', spoken: 'khonqush' },
];

export interface FixedWord {
  glyphs: string;
  spoken: string;
}

// Idiom heads of spec 4.6. Each opener takes a slot filled at realization, so
// only its fixed part lives here.
export const PO1_HEAD: FixedWord = {
  glyphs: '\u{1090B}\u{10907}\u{10914}\u{10915}',
  spoken: 'lakhashat',
};
export const PO2_HEAD: FixedWord = { glyphs: '\u{10900}\u{1090D}\u{1090A}', spoken: 'anok' };
export const PO3_HEAD: FixedWord = {
  glyphs: '\u{1090B}\u{10900}\u{10903}\u{1090D}',
  spoken: 'ladon',
};
// The inquiry put to a god (spec 4.6), cast in the dedication shape of PO3.
// Divination only.
export const PO4_HEAD: FixedWord = {
  glyphs: '\u{10914}\u{10900}\u{1090B}\u{10915}',
  spoken: 'shaolat',
};

// The theophoric element of the PO2 caster name (spec 4.6).
export const THEOPHORIC_SKELETON = 'bghl';
export const THEOPHORIC_SPOKEN = 'baal';

export type PhoenicianIdiomId = 'PC1' | 'PC2' | 'PC3' | 'PC4' | 'ELDRITCH_CLOSE';

// Closing idiom word lists of spec 4.6 and 4.10. What each idiom says is in the
// packs, under the same id.
export const IDIOM_WORDS: Readonly<Record<PhoenicianIdiomId, ReadonlyArray<FixedWord>>> = {
  PC1: [
    { glyphs: '\u{1090A}', spoken: 'ki' },
    { glyphs: '\u{10914}\u{1090C}\u{1090F}', spoken: 'shama' },
    { glyphs: '\u{10912}\u{1090B}', spoken: 'qol' },
    { glyphs: '\u{10909}\u{10901}\u{10913}\u{1090A}', spoken: 'yebarek' },
  ],
  PC2: [
    { glyphs: '\u{10900}\u{1090B}', spoken: 'al' },
    { glyphs: '\u{10909}\u{1090A}\u{1090D}', spoken: 'yakon' },
    { glyphs: '\u{1090B}\u{1090C}', spoken: 'lamo' },
    { glyphs: '\u{10914}\u{10913}\u{10914}', spoken: 'shoresh' },
  ],
  PC3: [{ glyphs: '\u{1090B}\u{1090F}\u{1090B}\u{1090C}', spoken: 'leolam' }],
  // The reason clause of the votive closing, standing alone (spec 4.6): a
  // divination ends when the voice has been heard, and the blessing belongs to
  // the schools that ask for one. Divination only.
  PC4: [
    { glyphs: '\u{1090A}', spoken: 'ki' },
    { glyphs: '\u{10914}\u{1090C}\u{1090F}', spoken: 'shama' },
    { glyphs: '\u{10912}\u{1090B}', spoken: 'qol' },
  ],
  // The fixed dread closing of spec 4.10, built from lexicon words carrying the
  // register's own vocalization.
  ELDRITCH_CLOSE: [
    { glyphs: '\u{10910}\u{10915}\u{10907}', spoken: 'petokh' },
    { glyphs: '\u{10914}\u{1090F}\u{10913}', spoken: 'shoghur' },
    { glyphs: '\u{1090B}\u{1090F}\u{1090B}\u{1090C}', spoken: 'leolam' },
  ],
};

// Four adverbials, Chronomancy only (spec 4.4). Three are built the way
// Semitic builds an adverbial, a proclitic on a noun the lexicon already
// holds, so they coin nothing. Backward is toward qdm, the front and the
// ancient time at once, exactly as Egyptian does it with xnt.
export const DIRECTION_WORDS: Readonly<Record<TimeDirection, FixedWord>> = {
  back: { glyphs: '\u{1090B}\u{10912}\u{10903}\u{1090C}', spoken: 'leqadom' },
  forth: { glyphs: '\u{1090B}\u{10900}\u{10907}\u{10913}', spoken: 'leakhor' },
  again: { glyphs: '\u{1090F}\u{10905}\u{10903}', spoken: 'ghod' },
  // The two mems of bdmm collapse to one glyph while the transliteration
  // keeps both, which is the doubling rule of 4.2.
  still: { glyphs: '\u{10901}\u{10903}\u{1090C}', spoken: 'bedamom' },
};

// PO5, the dating formula, and PC5, the return anchor (spec 4.6). Both take
// an argument: the year the formula is stamped with, and the time the caster
// came back to. PC5 is the summoning root bw' in the perfect 1sg.
export const PO5_HEAD: FixedWord = {
  glyphs: '\u{10901}\u{10914}\u{1090D}\u{10915}',
  spoken: 'beshanot',
};
export const PC5_HEAD: FixedWord = {
  glyphs: '\u{10901}\u{10905}\u{10900}\u{10915}',
  spoken: 'bawati',
};

// The direct object marker of spec 4.4, a separate word before definite
// objects.
export const YT: FixedWord = { glyphs: '\u{10900}\u{10909}\u{10915}', spoken: 'et' };

// The seal word of spec 4.8, the attested pʿm, directly before its numeral.
export const SEAL_HEAD: FixedWord = { glyphs: '\u{10910}\u{1090F}\u{1090C}', spoken: 'paghom' };

export type ProcliticId = 'l' | 'b' | 'w' | 'h';

// Spoken values of the affixes and proclitics (spec 4.4). These are the only
// source of affix vowels, nothing else is inferred.
export const PROCLITIC_SPOKEN: Readonly<Record<ProcliticId, string>> = {
  l: 'le',
  b: 'be',
  w: 'we',
  h: 'ha',
};

// The interrogative proclitic of the Divination asking clause (spec 4.4). It
// is the same letter as the article and never the same vowel: the article is
// spoken ha, the question hi, and only the transliteration tells them apart.
export const INTERROGATIVE_SPOKEN = 'hi';

export const PLURAL_SPOKEN = 'im';
export const FEMININE_SPOKEN = 'at';

// The invocation imperative addresses the invoked power itself, so it draws
// from the summoning roots that a power can be told to do.
export const INVOCATION_COME: ReadonlyArray<string> = ["bw'", 'ghny'];
