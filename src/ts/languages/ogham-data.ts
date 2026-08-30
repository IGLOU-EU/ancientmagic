// Ogham genome data, transcribed from docs/genomes.md section 10. Every root,
// idiom word, power word and codepoint comes from the spec.
//
// This genome coins rather than selects, because almost nothing survives to
// select from, so a root here is built to the reconstructed sound of
// pre-apocope Primitive Irish and is never presented as an attested word.
//
// What a root MEANS is not here. This file says which roles a root can fill,
// the gloss pack of the displayed language says how each role reads. The pack
// must cover exactly the forms declared here, no more and no less, which the
// pack completeness tests check.

import type { SemanticField, TimeDirection } from '../generator/types.js';
import type { RootForm } from '../glosses/types.js';

// The 26 letters of spec 10.1, four aicmí of five and the supplement. The
// token column is the ASCII romanization the generator maps from, greedy
// longest match, and the seven digraphs are the rows that make it greedy.
export const LETTER_MAP: Readonly<Record<string, string>> = {
  b: 'ᚁ',
  l: 'ᚂ',
  v: 'ᚃ',
  s: 'ᚄ',
  n: 'ᚅ',
  h: 'ᚆ',
  d: 'ᚇ',
  t: 'ᚈ',
  c: 'ᚉ',
  q: 'ᚊ',
  m: 'ᚋ',
  g: 'ᚌ',
  ng: 'ᚍ',
  st: 'ᚎ',
  r: 'ᚏ',
  a: 'ᚐ',
  o: 'ᚑ',
  u: 'ᚒ',
  e: 'ᚓ',
  i: 'ᚔ',
  ea: 'ᚕ',
  oi: 'ᚖ',
  ui: 'ᚗ',
  io: 'ᚘ',
  ae: 'ᚙ',
  p: 'ᚚ',
};

// The five forfeda, the scholastic supplement for the diphthongs. They are
// reachable only through the six roots flagged scholastic, at the tiers 10.9
// licenses, so they are named here rather than recomputed from the map.
export const FORFEDA_TOKENS: ReadonlyArray<string> = ['ea', 'oi', 'ui', 'io', 'ae'];

// U+1680 OGHAM SPACE MARK, the word separator: a bare length of stem over
// which the line does not break, and Unicode whitespace, which is the trap of
// spec 10.1. Written as an escape and never typed inline, because anything
// that trims or splits on whitespace eats it and leaves a plausible string
// behind.
export const SPACE_MARK = '\u1680';

// The frame of spec 10.2. The two feathers are mirror twins, so a character
// copied by eye lands backwards: both are escapes and both are asserted by
// number.
export const FEATHER = '\u169B';
export const REVERSED_FEATHER = '\u169C';

// The joint between two rods: the closing feather of one cut against the
// opening feather of the next, with nothing between them (spec 10.2).
export const ROD_JOINT = `${REVERSED_FEATHER}${FEATHER}`;

// A word this genome does not build but quotes. The letters are named rather
// than parsed, because the greedy map of 10.1 would weld coi into the forfid
// ᚖ and ogmios into ᚘ: listed data is held as a codepoint sequence and
// rendered from it, never re-derived (spec 10.13).
export interface Listed {
  readonly spoken: string;
  // The letters, kept beside the string they spell, because the tally triangle
  // of 10.9 cuts a listed word down one letter at a time and a truncation must
  // stay a sequence of codepoints rather than a re-parsed romanization.
  readonly letters: ReadonlyArray<string>;
  readonly glyphs: string;
}

export function glyphOf(token: string): string {
  const glyph = LETTER_MAP[token];
  if (glyph === undefined) throw new Error(`no ogham letter for ${token}`);
  return glyph;
}

// The letters are given as a space-parted list, and the helper checks that
// they spell the romanization beside them: a typo in either column is a throw
// at load rather than a wrong stem on the page.
function listed(spoken: string, letters: string): Listed {
  const tokens = letters.split(' ');
  if (tokens.join('') !== spoken) {
    throw new Error(`listed word ${spoken} is not spelled by ${letters}`);
  }
  return { spoken, letters: tokens, glyphs: tokens.map(glyphOf).join('') };
}

// A single letter standing as its own word, spoken by its attested name rather
// than by its sound. The row of OO3 is recited that way, twenty names for
// twenty letters, and so is the kenning vox of 10.7, so these rows are the one
// place where the reading line is not a spelling of the glyphs.
function letterWord(spoken: string, token: string): Listed {
  return { spoken, letters: [token], glyphs: glyphOf(token) };
}

export type SealCount = 3 | 4 | 5 | 7 | 9 | 27;

export const SEAL_COUNTS: ReadonlyArray<SealCount> = [3, 4, 5, 7, 9, 27];

// The numeral words of spec 10.8. Ogham has no numerals, so every count this
// genome seals is spoken, in the script's own letters, and twenty-seven is two
// words on both lines: a seal spoken in words is words all the way down.
export const SEAL_NUMERALS: Readonly<Record<SealCount, ReadonlyArray<Listed>>> = {
  3: [listed('tri', 't r i')],
  4: [listed('cetri', 'c e t r i')],
  5: [listed('qenqe', 'q e n q e')],
  7: [listed('sect', 's e c t')],
  9: [listed('novan', 'n o v a n')],
  27: [listed('tri', 't r i'), listed('novan', 'n o v a n')],
};

// The instruction the count is sealed with, and it comes first: verb first, as
// every command in this genome is (spec 10.8).
export const SEAL_HEAD = listed('snad', 's n a d');

export interface OghamRoot {
  root: string;
  // Roles this root can fill. A role it does not declare is never drawn.
  forms: ReadonlyArray<RootForm>;
  // Spec 10.3: tic, ling and crin never fill a slot that takes an object.
  intransitive?: boolean;
  // A root carrying a forfid diphthong, drawn only at the tiers 10.9 licenses.
  // Data on the root exactly as intransitive is, so the draw filter is the
  // same shape as the transitivity filter every genome already runs.
  scholastic?: true;
}

// Coined roots by semantic field (spec 10.3). This genome populates all
// fifteen fields, because it arrives with all six schools. Past participles
// are declared in the harm field alone, because the Curse gloss is the only
// clause template here that reaches for one.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<OghamRoot>>> = {
  warding: [
    { root: 'dit', forms: ['verb'] },
    { root: 'anect', forms: ['verb'] },
    { root: 'dun', forms: ['noun'] },
    { root: 'rat', forms: ['noun'] },
    { root: 'scet', forms: ['noun'] },
    { root: 'cur', forms: ['noun'] },
    { root: 'les', forms: ['noun'] },
    { root: 'imdit', forms: ['verb'] },
    { root: 'nert', forms: ['noun'] },
    { root: 'cing', forms: ['noun'] },
  ],
  harm: [
    { root: 'bris', forms: ['verb', 'pp'] },
    { root: 'lot', forms: ['noun', 'verb', 'pp'] },
    { root: 'gon', forms: ['verb', 'pp'] },
    { root: 'mill', forms: ['verb', 'pp'] },
    { root: 'crad', forms: ['verb', 'pp'] },
    { root: 'galar', forms: ['noun'] },
    { root: 'serb', forms: ['adj', 'adv'] },
    { root: 'bron', forms: ['noun'] },
    { root: 'coll', forms: ['noun', 'verb', 'pp'] },
    { root: 'amnas', forms: ['adj'] },
  ],
  summoning: [
    { root: 'gar', forms: ['verb'] },
    { root: 'toc', forms: ['verb'] },
    { root: 'congar', forms: ['verb'] },
    { root: 'tic', forms: ['verb'], intransitive: true },
    { root: 'ling', forms: ['verb'], intransitive: true },
    { root: 'guid', forms: ['verb'], scholastic: true },
  ],
  hidden: [
    { root: 'run', forms: ['noun'] },
    { root: 'ruin', forms: ['noun'], scholastic: true },
    { root: 'clet', forms: ['noun', 'adv'] },
    { root: 'tost', forms: ['noun'] },
    { root: 'sanas', forms: ['noun'] },
    { root: 'celt', forms: ['noun'] },
    { root: 'elad', forms: ['noun'] },
    { root: 'ogom', forms: ['noun'] },
  ],
  binding: [
    { root: 'nasc', forms: ['verb'] },
    { root: 'cengal', forms: ['verb'] },
    { root: 'glas', forms: ['verb'] },
    { root: 'drut', forms: ['verb'] },
    { root: 'snim', forms: ['verb'] },
    { root: 'timarc', forms: ['verb'] },
  ],
  fire: [
    { root: 'ten', forms: ['noun'] },
    { root: 'adand', forms: ['verb', 'pp'] },
    { root: 'brut', forms: ['noun'] },
    { root: 'losc', forms: ['verb', 'pp'] },
    { root: 'gris', forms: ['noun'] },
    { root: 'grisc', forms: ['noun'] },
    { root: 'deg', forms: ['noun'] },
    { root: 'gred', forms: ['verb', 'pp'] },
    { root: 'tellac', forms: ['noun'] },
    { root: 'lasar', forms: ['noun', 'verb', 'pp'] },
  ],
  night: [
    { root: 'adag', forms: ['noun'] },
    { root: 'dorc', forms: ['adj', 'adv'] },
    { root: 'dub', forms: ['adj'] },
    { root: 'esc', forms: ['noun'] },
    { root: 'reann', forms: ['noun'], scholastic: true },
    { root: 'temel', forms: ['noun'] },
    { root: 'cotlud', forms: ['noun'] },
    { root: 'brat', forms: ['noun'] },
    { root: 'gorm', forms: ['adj'] },
    { root: 'noct', forms: ['noun'] },
  ],
  death: [
    { root: 'bas', forms: ['noun'] },
    { root: 'marb', forms: ['adj'] },
    { root: 'lig', forms: ['noun'] },
    { root: 'vert', forms: ['noun'] },
    { root: 'scal', forms: ['noun'] },
    { root: 'ec', forms: ['noun'] },
    { root: 'cnam', forms: ['noun'] },
    { root: 'tam', forms: ['noun'] },
  ],
  gates: [
    { root: 'dor', forms: ['noun'] },
    { root: 'bel', forms: ['noun'] },
    { root: 'set', forms: ['noun'] },
    { root: 'sid', forms: ['noun'] },
    { root: 'comlad', forms: ['noun'] },
    { root: 'tarsec', forms: ['noun'] },
    { root: 'bern', forms: ['noun'] },
    { root: 'rod', forms: ['noun'] },
    { root: 'glenn', forms: ['noun'] },
  ],
  time: [
    { root: 'tan', forms: ['noun'] },
    { root: 'trat', forms: ['noun'] },
    { root: 'matan', forms: ['noun'] },
    { root: 'bledan', forms: ['noun'] },
    { root: 'amser', forms: ['noun'] },
    { root: 'gam', forms: ['noun'] },
    { root: 'vescor', forms: ['noun'] },
    { root: 'cet', forms: ['noun'] },
    { root: 'vorcenn', forms: ['noun'] },
    { root: 'sior', forms: ['noun'], scholastic: true },
  ],
  sight: [
    { root: 'derc', forms: ['noun', 'verb'] },
    { root: 'sell', forms: ['verb'] },
    { root: 'dec', forms: ['verb'] },
    { root: 'adbat', forms: ['verb'] },
    { root: 'glan', forms: ['adj', 'adv'] },
    { root: 'vat', forms: ['noun'] },
    { root: 'druid', forms: ['noun'], scholastic: true },
    { root: 'rosc', forms: ['noun'] },
    { root: 'mes', forms: ['verb'] },
    { root: 'amarc', forms: ['noun'] },
  ],
  fate: [
    { root: 'toic', forms: ['noun'], scholastic: true },
    { root: 'dan', forms: ['noun'] },
    { root: 'cinned', forms: ['noun'] },
    { root: 'tocad', forms: ['noun'] },
    { root: 'dal', forms: ['noun'] },
    { root: 'derb', forms: ['adj'] },
    { root: 'rand', forms: ['noun'] },
    { root: 'crandcor', forms: ['noun'] },
    { root: 'bret', forms: ['noun'] },
    { root: 'ges', forms: ['noun'] },
  ],
  signs: [
    { root: 'sen', forms: ['noun'] },
    { root: 'comard', forms: ['noun'] },
    { root: 'man', forms: ['noun'] },
    { root: 'bran', forms: ['noun'] },
    { root: 'irar', forms: ['noun'] },
    { root: 'en', forms: ['noun'] },
    { root: 'vis', forms: ['noun'] },
    { root: 'celman', forms: ['noun'] },
    { root: 'tarngir', forms: ['noun'] },
    { root: 'brig', forms: ['noun'] },
  ],
  course: [
    { root: 'tect', forms: ['verb'] },
    { root: 'cor', forms: ['verb'] },
    { root: 'brost', forms: ['verb'] },
    { root: 'cosc', forms: ['verb'] },
    { root: 'mall', forms: ['adj', 'verb'] },
    { root: 'grib', forms: ['adj', 'adv'] },
    { root: 'gen', forms: ['verb'] },
  ],
  beings: [
    { root: 'dev', forms: ['noun'] },
    { root: 'rig', forms: ['noun'] },
    { root: 'tigern', forms: ['noun'] },
    { root: 'tren', forms: ['noun'] },
    { root: 'sinser', forms: ['noun'] },
    { root: 'bard', forms: ['noun'] },
    { root: 'goban', forms: ['noun'] },
    { root: 'bansid', forms: ['noun'] },
    { root: 'luct', forms: ['noun'] },
    { root: 'mordev', forms: ['noun'] },
  ],
};

// An attested power word of spec 10.7. The record keeps no vox corpus, so the
// table is the divine names the record and the mythology carry, two of them
// cut in ogham on the stones themselves. Every row is listed data: ogmios
// writes i then o as two letters, which the greedy map would weld into ᚘ.
export interface OghamPower extends Listed {
  readonly id: string;
}

function power(id: string, letters: string): OghamPower {
  return { id, ...listed(id, letters) };
}

export const BRIGHT_POWER: ReadonlyArray<OghamPower> = [
  power('lugus', 'l u g u s'),
  power('dovvinias', 'd o v v i n i a s'),
  power('lugudeccas', 'l u g u d e c c a s'),
  power('ogmios', 'o g m i o s'),
  power('brigantia', 'b r i g a n t i a'),
  power('dagodevos', 'd a g o d e v o s'),
  power('manannan', 'm a n a n n a n'),
  power('danu', 'd a n u'),
];

export const DARK_POWER: ReadonlyArray<OghamPower> = [
  power('morrigan', 'm o r r i g a n'),
  power('donn', 'd o n n'),
];

// The triangle word of the clear register, fixed per school by the three-case
// rule of spec 10.9. The bright four cut down the birch warning of OO1, which
// is a count shrinking by its own strokes rather than a name shrinking by its
// letters, so it is named by its idiom. Curse cuts down the queen it calls.
export const DARK_SHRINKING_WORD = 'morrigan';

// The letter as vox magica (spec 10.7): a single letter standing as its own
// word, spoken by its attested name and glossed by its kenning. The closed
// pool is these five, one kenning each.
export interface OghamKenning extends Listed {
  readonly id: string;
}

function kenning(id: string, spoken: string, letter: string): OghamKenning {
  return { id, ...letterWord(spoken, letter) };
}

export const KENNING_VOX: ReadonlyArray<OghamKenning> = [
  kenning('beith', 'beithe', 'b'),
  kenning('sail', 'sail', 's'),
  kenning('dair', 'dair', 'd'),
  kenning('coll', 'coll', 'c'),
  kenning('ruis', 'ruis', 'r'),
];

// Dread epithets of the Eldritch register (spec 10.10), indeclinable listed
// forms the two transformation rules never touch. Every one carries the letter
// p, the sound Primitive Irish lost and no native root may hold, so a formula
// of this school always writes what the language cannot own.
export interface OghamEpithet extends Listed {
  readonly id: string;
}

function epithet(id: string, letters: string): OghamEpithet {
  return { id, ...listed(id, letters) };
}

export const DREAD_POWER: ReadonlyArray<OghamEpithet> = [
  epithet('pethagg', 'p e t h a g g'),
  epithet('prusc', 'p r u s c'),
  epithet('moppad', 'm o p p a d'),
  epithet('dolp', 'd o l p'),
  epithet('prugg', 'p r u g g'),
  epithet('hnapp', 'h n a p p'),
  epithet('scradap', 's c r a d a p'),
  epithet('golp', 'g o l p'),
  epithet('thulp', 't h u l p'),
  epithet('pemnag', 'p e m n a g'),
];

// Function words (spec 10.4). vrit and do govern the accusative, in opens a
// Divination asking clause, and the two prefixes fuse to the front of a drawn
// word rather than standing on their own.
export const FN_VRIT = listed('vrit', 'v r i t');
export const FN_DO = listed('do', 'd o');
export const FN_IN = listed('in', 'i n');
export const PREFIX_RO = 'ro';
export const PREFIX_CO = 'co';

// The verb the return anchor closes on, frozen idiom data: a perfect this
// genome does not conjugate, arriving whole. It carries no ro and no -us, so a
// binding-clause verb can never be mistaken for it (spec 10.6).
export const OC5_TAIL = listed('tanac', 't a n a c');

// Four adverbs, Chronomancy only, one per value of the plan's direction, all
// four listed data (spec 10.4). beos writes its e and o as two plain letters,
// no forfid, which is the listed-data rule doing its work in the smallest row.
export const DIRECTION_WORDS: Readonly<Record<TimeDirection, Listed>> = {
  back: listed('cul', 'c u l'),
  forth: listed('rem', 'r e m'),
  again: listed('atir', 'a t i r'),
  still: listed('beos', 'b e o s'),
};

export type OghamIdiomId =
  | 'OO1'
  | 'OO2'
  | 'OO3_SHORT'
  | 'OO3_FULL'
  | 'OO4'
  | 'OO5'
  | 'OO6'
  | 'OC1'
  | 'OC2'
  | 'OC3'
  | 'OC4'
  | 'ELDRITCH_OPEN_SHORT'
  | 'ELDRITCH_OPEN_FULL'
  | 'ELDRITCH_CLOSE';

// The twenty letter names of the manuscript tradition, in the medieval
// spellings with the accents dropped for the reading line (spec 10.6). OO3 is
// recited parted, one name per letter, so each is a word of its own: fern
// names the letter this genome sounds v, because the name lived long enough
// for the language to turn its w into f, and the mismatch is kept.
const ROW: ReadonlyArray<Listed> = [
  letterWord('beithe', 'b'),
  letterWord('luis', 'l'),
  letterWord('fern', 'v'),
  letterWord('sail', 's'),
  letterWord('nin', 'n'),
  letterWord('uath', 'h'),
  letterWord('dair', 'd'),
  letterWord('tinne', 't'),
  letterWord('coll', 'c'),
  letterWord('cert', 'q'),
  letterWord('muin', 'm'),
  letterWord('gort', 'g'),
  letterWord('getal', 'ng'),
  letterWord('straif', 'st'),
  letterWord('ruis', 'r'),
  letterWord('ailm', 'a'),
  letterWord('onn', 'o'),
  letterWord('ur', 'u'),
  letterWord('edad', 'e'),
  letterWord('idad', 'i'),
];

// Idiom word lists of spec 10.6 and 10.10. OC5 takes an argument and is built
// at realization, so only the idioms with a fixed shape live here. What each
// one says is in the packs, under the same id.
export const IDIOM_WORDS: Readonly<Record<OghamIdiomId, ReadonlyArray<Listed>>> = {
  // Seven strokes of beith on a birch rod, the first ogham In Lebor Ogaim
  // records. One word, run together, as the futhark row is.
  OO1: [listed('bbbbbbb', 'b b b b b b b')],
  OO2: [listed('celi', 'c e l i')],
  OO3_SHORT: ROW.slice(0, 5),
  OO3_FULL: ROW,
  OO4: [listed('anm', 'a n m')],
  OO5: [listed('cetri', 'c e t r i'), listed('vlesca', 'v l e s c a'), listed('ibari', 'i b a r i')],
  OO6: [listed('dore', 'd o r e'), listed('sidi', 's i d i')],
  // The attested KOI of the stones, written coi because this romanization has
  // no k. Its glyphs are the listed letters ᚑᚔ and never the forfid: the
  // specification's own first draft wrote it with ᚖ before its audit caught it.
  OC1: [listed('coi', 'c o i')],
  OC2: [listed('slan', 's l a n')],
  OC3: [listed('ogom', 'o g o m'), listed('ogmi', 'o g m i')],
  OC4: [listed('derb', 'd e r b')],
  // The row is the schools' proudest recitation, so the register says it
  // backward: the last aicme alone below difficulty 6, the whole alphabet at 6
  // and above (spec 10.10).
  ELDRITCH_OPEN_SHORT: ROW.slice(15).slice().reverse(),
  ELDRITCH_OPEN_FULL: ROW.slice().reverse(),
  // Built from the harm root coll, whose final is already double and stays,
  // and the night root temel with the stutter rule applied. Listed data, so
  // the rules do not run on it again.
  ELDRITCH_CLOSE: [listed('coll', 'c o l l'), listed('temell', 't e m e l l')],
};

// The Invocation order provides no object, which is the one exemption spec
// 10.3 states for the two intransitive summoning verbs, and the summons is
// addressed to the power itself: what it is told to do is come.
export const INVOCATION_COME: ReadonlyArray<string> = ['tic', 'ling'];

// The six adverbs of spec 10.4, asserted as a closed set and never as a co-
// prefix, since coined roots may begin with those letters. Held here so the
// genome and its tests read the same list.
export const ADVERBS: ReadonlyArray<string> = [
  'coserb',
  'codorc',
  'coclet',
  'coglan',
  'cogrib',
];
