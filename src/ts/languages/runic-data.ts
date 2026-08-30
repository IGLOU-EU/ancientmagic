// Runic genome data, transcribed from docs/genomes.md section 2. Every root,
// idiom word, power word and codepoint comes from the spec.
//
// What a root MEANS is not here. This file says which roles a root can fill,
// the gloss pack of the displayed language says how each role reads. The pack
// must cover exactly the forms declared here, no more and no less, which the
// pack completeness tests check.

import type { SemanticField, TimeDirection } from '../generator/types.js';
import type { RootForm } from '../glosses/types.js';

export interface RunicRoot {
  root: string;
  // Roles this root can fill. A role it does not declare is never drawn.
  forms: ReadonlyArray<RootForm>;
  // Spec 2.3: kum and swelt never fill a slot that takes a direct object.
  intransitive?: boolean;
  // Spec 2.3: rune-name roots are noun roots only.
  runeName?: boolean;
}

export const RUNE_MAP: Readonly<Record<string, string>> = {
  f: '\u{16A0}',
  u: '\u{16A2}',
  th: '\u{16A6}',
  a: '\u{16A8}',
  r: '\u{16B1}',
  k: '\u{16B2}',
  g: '\u{16B7}',
  w: '\u{16B9}',
  h: '\u{16BA}',
  n: '\u{16BE}',
  i: '\u{16C1}',
  j: '\u{16C3}',
  ei: '\u{16C7}',
  p: '\u{16C8}',
  z: '\u{16C9}',
  s: '\u{16CA}',
  t: '\u{16CF}',
  b: '\u{16D2}',
  e: '\u{16D6}',
  m: '\u{16D7}',
  l: '\u{16DA}',
  ng: '\u{16DC}',
  d: '\u{16DE}',
  o: '\u{16DF}',
};

export const WORD_SEP = '\u{16EB}';
export const CLAUSE_SEP = '\u{16EC}';
export const CROSS_SEP = '\u{16ED}';

export type SealCount = 3 | 7 | 9 | 12;

export const SEAL_COUNTS: ReadonlyArray<SealCount> = [3, 7, 9, 12];

export const SEAL_GLYPHS: Readonly<Record<SealCount, string>> = {
  3: '\u{10109}',
  7: '\u{1010D}',
  9: '\u{1010F}',
  12: '\u{10110}\u{10108}',
};

export const SEAL_WORDS: Readonly<Record<SealCount, string>> = {
  3: 'thri',
  7: 'sebun',
  9: 'niun',
  12: 'twalif',
};

// Coined roots by semantic field (spec 2.3), each field followed by its
// rune-name roots per the normative assignment table. The beings field is the
// one the Invocation widening added (spec 1.3), and four rune names sit in it:
// the row's gods and beasts were parked in summoning while the model had
// nowhere to address anybody, and summoning is drawn for verbs alone. Rune
// names are noun roots only. Verb forms exist on every root a school can draw
// as a verb, kum and swelt carry the spec's intransitive flag. A root declares
// only the roles some school draws from its field: a field drawn for verbs
// alone carries no noun.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<RunicRoot>>> = {
  warding: [
    { root: 'ward', forms: ['noun', 'verb'] },
    { root: 'skild', forms: ['noun', 'verb'] },
    { root: 'burg', forms: ['noun'] },
    { root: 'helm', forms: ['noun', 'verb'] },
    { root: 'gard', forms: ['noun', 'verb'] },
    { root: 'frith', forms: ['noun'] },
    { root: 'mund', forms: ['noun'] },
    { root: 'wern', forms: ['verb'] },
    { root: 'halg', forms: ['verb'] },
    { root: 'skerm', forms: ['verb'] },
    { root: 'wunj', forms: ['noun'], runeName: true },
    { root: 'lauk', forms: ['noun'], runeName: true },
    { root: 'alg', forms: ['noun'], runeName: true },
    { root: 'tiw', forms: ['noun'], runeName: true },
    { root: 'berk', forms: ['noun'], runeName: true },
    { root: 'othal', forms: ['noun'], runeName: true },
    { root: 'geb', forms: ['noun'], runeName: true },
    { root: 'is', forms: ['noun'], runeName: true },
  ],
  harm: [
    { root: 'skath', forms: ['verb', 'pp'] },
    { root: 'bal', forms: ['noun'] },
    { root: 'sair', forms: ['noun', 'verb', 'pp'] },
    { root: 'agl', forms: ['noun'] },
    { root: 'wund', forms: ['noun', 'verb', 'pp'] },
    { root: 'slah', forms: ['verb', 'pp'] },
    { root: 'brek', forms: ['verb', 'pp'] },
    { root: 'ait', forms: ['noun', 'verb', 'pp'] },
    { root: 'grim', forms: ['adj', 'adv'] },
    { root: 'harm', forms: ['noun', 'verb', 'pp'] },
    { root: 'kaun', forms: ['noun'], runeName: true },
    { root: 'hagl', forms: ['noun'], runeName: true },
    { root: 'naud', forms: ['noun'], runeName: true },
  ],
  summoning: [
    { root: 'lath', forms: ['verb'] },
    { root: 'kall', forms: ['verb'] },
    { root: 'bud', forms: ['verb'] },
    { root: 'hait', forms: ['verb'] },
    { root: 'wek', forms: ['verb'] },
    { root: 'gal', forms: ['verb'] },
    { root: 'sok', forms: ['verb'] },
    { root: 'kum', forms: ['verb'], intransitive: true },
    { root: 'lok', forms: ['verb'] },
    { root: 'stefn', forms: ['verb'] },
  ],
  hidden: [
    { root: 'run', forms: ['noun'] },
    { root: 'laun', forms: ['noun'] },
    { root: 'dul', forms: ['noun'] },
    { root: 'mirk', forms: ['noun', 'adv'] },
    { root: 'huld', forms: ['noun'] },
    { root: 'swik', forms: ['noun'] },
    { root: 'feh', forms: ['noun'], runeName: true },
    { root: 'perth', forms: ['noun'], runeName: true },
  ],
  binding: [
    { root: 'bind', forms: ['verb', 'pp'] },
    { root: 'haft', forms: ['verb'] },
    { root: 'fetur', forms: ['verb'] },
    { root: 'knut', forms: ['verb'] },
    { root: 'wrid', forms: ['verb'] },
    { root: 'spann', forms: ['verb'] },
    { root: 'hald', forms: ['verb', 'pp'] },
    { root: 'luk', forms: ['verb', 'pp'] },
  ],
  fire: [
    { root: 'fur', forms: ['noun'] },
    { root: 'brand', forms: ['noun'] },
    { root: 'log', forms: ['noun'] },
    { root: 'eim', forms: ['noun'] },
    { root: 'glod', forms: ['noun'] },
    { root: 'tand', forms: ['noun', 'verb', 'pp'] },
    { root: 'brin', forms: ['verb', 'pp'] },
    { root: 'swid', forms: ['verb', 'pp'] },
    { root: 'funk', forms: ['noun'] },
    { root: 'bael', forms: ['noun'] },
    { root: 'sowil', forms: ['noun'], runeName: true },
  ],
  night: [
    { root: 'naht', forms: ['noun'] },
    { root: 'derk', forms: ['adj'] },
    { root: 'skad', forms: ['noun'] },
    { root: 'kweld', forms: ['noun'] },
    { root: 'swart', forms: ['adj'] },
    { root: 'dim', forms: ['adj', 'adv'] },
    { root: 'mena', forms: ['noun'] },
    { root: 'rok', forms: ['noun'] },
    { root: 'hrim', forms: ['noun'] },
    { root: 'draum', forms: ['noun'] },
  ],
  death: [
    { root: 'dauth', forms: ['noun'] },
    { root: 'wal', forms: ['noun'] },
    { root: 'faig', forms: ['adj'] },
    { root: 'grab', forms: ['noun'] },
    { root: 'ban', forms: ['noun'] },
    { root: 'lik', forms: ['noun'] },
    { root: 'mold', forms: ['noun'] },
    { root: 'draug', forms: ['noun'] },
    { root: 'naw', forms: ['noun'] },
    { root: 'thurs', forms: ['noun'], runeName: true },
    { root: 'iw', forms: ['noun'], runeName: true },
    { root: 'mann', forms: ['noun'], runeName: true },
  ],
  gates: [
    { root: 'dur', forms: ['noun'] },
    { root: 'gat', forms: ['noun'] },
    { root: 'hlid', forms: ['noun'] },
    { root: 'grind', forms: ['noun'] },
    { root: 'brug', forms: ['noun'] },
    { root: 'munth', forms: ['noun'] },
    { root: 'stig', forms: ['noun'] },
    { root: 'weg', forms: ['noun'] },
    { root: 'bor', forms: ['noun'] },
    { root: 'gap', forms: ['noun'] },
    { root: 'raid', forms: ['noun'], runeName: true },
  ],
  time: [
    { root: 'tid', forms: ['noun'] },
    { root: 'stund', forms: ['noun'] },
    { root: 'sumar', forms: ['noun'] },
    { root: 'ald', forms: ['noun'] },
    { root: 'wurd', forms: ['noun'] },
    { root: 'skap', forms: ['noun'] },
    { root: 'morgan', forms: ['noun'] },
    { root: 'aband', forms: ['noun'] },
    { root: 'aiw', forms: ['noun'] },
    { root: 'forn', forms: ['noun'] },
    { root: 'dag', forms: ['noun'], runeName: true },
    { root: 'jer', forms: ['noun'], runeName: true },
  ],
  // The three Divination fields (spec 2.3 and 2.11). Every verb here is
  // transitive, because both divination clause kinds take an object, and a
  // signs root is a noun alone: the school reads a sign, it never conjugates
  // one. No root declares a past participle, no divination clause uses one.
  sight: [
    { root: 'seh', forms: ['verb'] },
    { root: 'spah', forms: ['noun', 'verb'] },
    { root: 'skaw', forms: ['noun', 'verb'] },
    { root: 'wit', forms: ['noun', 'verb'] },
    { root: 'witag', forms: ['noun'] },
    { root: 'aug', forms: ['noun'] },
    { root: 'birt', forms: ['verb', 'adj'] },
    { root: 'bar', forms: ['verb', 'adj'] },
    { root: 'kuth', forms: ['verb', 'adj'] },
    { root: 'glog', forms: ['adj', 'adv'] },
  ],
  fate: [
    { root: 'urlag', forms: ['noun'] },
    { root: 'hlaut', forms: ['noun'] },
    { root: 'dom', forms: ['noun'] },
    { root: 'skuld', forms: ['noun'] },
    { root: 'norn', forms: ['noun'] },
    { root: 'metud', forms: ['noun'] },
    { root: 'hail', forms: ['noun', 'adj'] },
    { root: 'end', forms: ['noun'] },
    { root: 'thrad', forms: ['noun'] },
    { root: 'wis', forms: ['adj'] },
  ],
  // The Chronomancy field (spec 2.3 and 2.12): the verbs and nouns of moving
  // through time. No pp, every verb transitive, every noun able to sit behind
  // an article.
  course: [
    { root: 'far', forms: ['verb'] },
    { root: 'wend', forms: ['verb'] },
    { root: 'skund', forms: ['verb'] },
    { root: 'lat', forms: ['verb', 'adj'] },
    { root: 'stand', forms: ['verb'] },
    { root: 'hef', forms: ['verb'] },
    { root: 'rath', forms: ['adj', 'adv'] },
    { root: 'niw', forms: ['verb', 'adj'] },
  ],
  signs: [
    { root: 'tein', forms: ['noun'] },
    { root: 'taik', forms: ['noun'] },
    { root: 'mark', forms: ['noun'] },
    { root: 'bauk', forms: ['noun'] },
    { root: 'fugl', forms: ['noun'] },
    { root: 'hraf', forms: ['noun'] },
    { root: 'spor', forms: ['noun'] },
    { root: 'frag', forms: ['noun'] },
    { root: 'andswar', forms: ['noun'] },
    { root: 'rist', forms: ['noun'] },
  ],
  beings: [
    { root: 'dis', forms: ['noun'] },
    { root: 'walkur', forms: ['noun'] },
    { root: 'haugsit', forms: ['noun'] },
    { root: 'drohtin', forms: ['noun'] },
    { root: 'helith', forms: ['noun'] },
    { root: 'thul', forms: ['noun'] },
    { root: 'nith', forms: ['noun'] },
    { root: 'landwiht', forms: ['noun'] },
    { root: 'etun', forms: ['noun'] },
    { root: 'alba', forms: ['noun'] },
    { root: 'ur', forms: ['noun'], runeName: true },
    { root: 'ans', forms: ['noun'], runeName: true },
    { root: 'ehw', forms: ['noun'], runeName: true },
    { root: 'ingw', forms: ['noun'], runeName: true },
  ],
};

// Attested bright power words (spec 2.7). The rune row itself lives in the
// opening idioms instead. A power word is an attested romanized word, not
// English, so it stays here; only its gloss moved to the packs.
export const BRIGHT_POWER: ReadonlyArray<string> = [
  'alu',
  'laukaz',
  'lathu',
  'auja',
  'ota',
  'gagaga',
  'tuwatuwa',
];

// The shrinking triangle needs at least four runes to allow three steps.
export const TRIANGLE_BRIGHT: ReadonlyArray<string> = BRIGHT_POWER.filter(
  (word) => word !== 'alu' && word !== 'ota',
);

// The Norse layer of spec 2.7. Eleven words the Invocation school may release
// in place of a bracteate cry, so the genome can name the world-picture its
// culture carries without dating itself to the Icelandic manuscripts. Four are
// cut in the Elder Futhark or in a continental record, the rest are compounds
// of words the comparative record attests outside Old Norse. Held apart from
// BRIGHT_POWER because only a clause with a free POWER-WORD slot may draw one:
// tier 1, tier 2 and the repetition segments take a cry and nothing else.
export const NORSE_VOX: ReadonlyArray<string> = [
  'wodanaz',
  'thunraz',
  'frijjo',
  'wulthuz',
  'ginarunaz',
  'erminasul',
  'ansugardaz',
  'midjagardaz',
  'nibulahaimaz',
  'muspellaz',
  'halja',
];

// Dread epithet pool of the Eldritch register (spec 2.10).
export const DREAD_POWER: ReadonlyArray<string> = [
  'thruznaz',
  'gulzoth',
  'wuzgrim',
  'skulthogn',
  'hruzbanaz',
  'nuthkolaz',
  'zguwald',
  'muznaht',
  'thulgzar',
  'kruthmol',
];

// Four uninflected adverbs, Chronomancy only (spec 2.4). They are function
// words, never lexicon roots, and are never drawn as a MODIFIER. Backward is
// written with the word for in front, the orientation the culture held.
export const DIRECTION_WORDS: Readonly<Record<TimeDirection, string>> = {
  back: 'aftar',
  forth: 'fram',
  again: 'eft',
  still: 'stil',
};

// The fixed tail of RC5 (spec 2.6), the one Runic idiom that takes an
// argument: the anchor stands in front of it, in the accusative.
export const RC5_TAIL: ReadonlyArray<string> = ['aftar', 'wendo'];

export type RunicIdiomId =
  | 'RO1'
  | 'RO2'
  | 'RO3_FIRST_AETT'
  | 'RO3_FULL_ROW'
  | 'RO4'
  | 'RO5'
  | 'RC1'
  | 'RC2'
  | 'RC3'
  | 'RC4'
  | 'ELDRITCH_OPEN_SHORT'
  | 'ELDRITCH_OPEN_FULL'
  | 'ELDRITCH_CLOSE';

// Idiom word lists of spec 2.6 and 2.10. What each idiom says is in the packs,
// under the same id.
export const IDIOM_WORDS: Readonly<Record<RunicIdiomId, ReadonlyArray<string>>> = {
  RO1: ['alu'],
  RO2: ['ek', 'erilaz'],
  RO3_FIRST_AETT: ['futharkgw'],
  RO3_FULL_ROW: ['futharkgwhnijeipzstbemlngdo'],
  // Divination only (spec 2.6): the diviner lifts three marked strips, then
  // reads the runes. nemido and radido are fixed idiom verbs, never drawn.
  RO4: ['thri', 'teinoz', 'nemido'],
  // Invocation only (spec 2.6 and 2.7): the count of the worlds, named at the
  // head of the galdr. haim lives here rather than in a semantic field, so a
  // school that never asked for the Norse layer keeps its draws.
  RO5: ['niun', 'haimoz'],
  RC1: ['runoz', 'faihido'],
  RC2: ['runoz', 'tawido'],
  RC3: ['alu'],
  RC4: ['runoz', 'radido'],
  ELDRITCH_OPEN_SHORT: ['wgkrathuf'],
  ELDRITCH_OPEN_FULL: ['odnglmebtszpeijinhwgkrathuf'],
  ELDRITCH_CLOSE: ['runoz', 'gnagido'],
};

// The clause imperative addresses the invoked power itself, so it keeps
// the come flavor of the school skeleton. Tier 2 draws instead from every
// transitive verb of the planned field (spec 2.9).
export const INVOCATION_COME: ReadonlyArray<string> = ['kum', 'wek'];
