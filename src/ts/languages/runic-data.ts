// Runic genome data, transcribed from docs/genomes.md section 2. Every root,
// idiom word, power word and codepoint comes from the spec.
//
// What a root MEANS is not here. This file says which roles a root can fill,
// the gloss pack of the displayed language says how each role reads. The pack
// must cover exactly the forms declared here, no more and no less, which the
// pack completeness tests check.

import type { SemanticField } from '../generator/types.js';
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
// rune-name roots per the normative assignment table. Rune names are noun
// roots only. Verb forms exist on every root a school can draw as a verb,
// kum and swelt carry the spec's intransitive flag.
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
    { root: 'stefn', forms: ['noun', 'verb'] },
    { root: 'ur', forms: ['noun'], runeName: true },
    { root: 'ans', forms: ['noun'], runeName: true },
    { root: 'ehw', forms: ['noun'], runeName: true },
    { root: 'ingw', forms: ['noun'], runeName: true },
  ],
  hidden: [
    { root: 'run', forms: ['noun'] },
    { root: 'laun', forms: ['noun'] },
    { root: 'hel', forms: [] },
    { root: 'hul', forms: [] },
    { root: 'dul', forms: ['noun'] },
    { root: 'mirk', forms: ['noun', 'adv'] },
    { root: 'felh', forms: [] },
    { root: 'grub', forms: [] },
    { root: 'huld', forms: ['noun'] },
    { root: 'swik', forms: ['noun'] },
    { root: 'feh', forms: ['noun'], runeName: true },
    { root: 'perth', forms: ['noun'], runeName: true },
  ],
  binding: [
    { root: 'bind', forms: ['verb', 'pp'] },
    { root: 'band', forms: ['noun'] },
    { root: 'haft', forms: ['noun', 'verb'] },
    { root: 'fetur', forms: ['noun', 'verb'] },
    { root: 'knut', forms: ['noun', 'verb'] },
    { root: 'wrid', forms: ['verb'] },
    { root: 'spann', forms: ['verb'] },
    { root: 'tug', forms: ['noun'] },
    { root: 'hald', forms: ['verb', 'pp'] },
    { root: 'luk', forms: ['verb', 'pp'] },
    { root: 'geb', forms: ['noun'], runeName: true },
    { root: 'naud', forms: ['noun'], runeName: true },
    { root: 'is', forms: ['noun'], runeName: true },
  ],
  fire: [
    { root: 'fur', forms: ['noun'] },
    { root: 'brand', forms: ['noun'] },
    { root: 'log', forms: ['noun'] },
    { root: 'eim', forms: ['noun'] },
    { root: 'glod', forms: ['noun'] },
    { root: 'brin', forms: [] },
    { root: 'tand', forms: ['noun'] },
    { root: 'swid', forms: [] },
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
    { root: 'swelt', forms: ['verb'], intransitive: true },
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

export type RunicIdiomId =
  | 'RO1'
  | 'RO2'
  | 'RO3_FIRST_AETT'
  | 'RO3_FULL_ROW'
  | 'RC1'
  | 'RC2'
  | 'RC3'
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
  RC1: ['runoz', 'faihido'],
  RC2: ['runoz', 'tawido'],
  RC3: ['alu'],
  ELDRITCH_OPEN_SHORT: ['wgkrathuf'],
  ELDRITCH_OPEN_FULL: ['odnglmebtszpeijinhwgkrathuf'],
  ELDRITCH_CLOSE: ['runoz', 'gnagido'],
};

// The clause imperative addresses the invoked power itself, so it keeps
// the come flavor of the school skeleton. Tier 2 draws instead from every
// transitive verb of the planned field (spec 2.9).
export const INVOCATION_COME: ReadonlyArray<string> = ['kum', 'wek'];
