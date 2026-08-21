// Runic genome data, transcribed from docs/genomes.md section 2. Every
// root, gloss, idiom, power word and codepoint comes from the spec. The
// noun, verb, pp, adj and adv fields are the generator's English gloss
// forms for the roles a root can fill. A root without a form for a role
// is never drawn for that role.

import type { SemanticField } from '../generator/types.js';

export interface RunicRoot {
  root: string;
  gloss: string;
  noun?: string;
  verb?: string;
  pp?: string;
  adj?: string;
  adv?: string;
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

export const SEAL_GLOSS: Readonly<Record<SealCount, string>> = {
  3: 'Sealed three times.',
  7: 'Sealed seven times.',
  9: 'Sealed nine times.',
  12: 'Sealed twelve times.',
};

// Coined roots by semantic field (spec 2.3), each field followed by its
// rune-name roots per the normative assignment table. Rune names are noun
// roots only. Verb forms exist on every root a school can draw as a verb,
// kum and swelt carry the spec's intransitive flag.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<RunicRoot>>> = {
  warding: [
    { root: 'ward', gloss: 'watch, guard', noun: 'warder', verb: 'ward' },
    { root: 'skild', gloss: 'shield', noun: 'shield', verb: 'shield' },
    { root: 'burg', gloss: 'stronghold', noun: 'stronghold' },
    { root: 'helm', gloss: 'covering', noun: 'covering', verb: 'cover' },
    { root: 'gard', gloss: 'enclosure', noun: 'enclosure', verb: 'enclose' },
    { root: 'frith', gloss: 'peace-bond', noun: 'peace-bond' },
    { root: 'mund', gloss: 'protecting hand', noun: 'protecting hand' },
    { root: 'wern', gloss: 'fend off', verb: 'fend' },
    { root: 'halg', gloss: 'hallow', verb: 'hallow' },
    { root: 'skerm', gloss: 'screen', verb: 'screen' },
    { root: 'wunj', gloss: 'joy', noun: 'joy', runeName: true },
    { root: 'lauk', gloss: 'leek', noun: 'leek', runeName: true },
    { root: 'alg', gloss: 'elk-guard', noun: 'elk-guard', runeName: true },
    { root: 'tiw', gloss: 'the sky god', noun: 'sky god', runeName: true },
    { root: 'berk', gloss: 'birch', noun: 'birch', runeName: true },
    { root: 'othal', gloss: 'heritage', noun: 'heritage', runeName: true },
  ],
  harm: [
    { root: 'skath', gloss: 'scathe', verb: 'scathe', pp: 'scathed' },
    { root: 'bal', gloss: 'bale, evil', noun: 'bale' },
    { root: 'sair', gloss: 'wound', noun: 'wound', verb: 'wound', pp: 'wounded' },
    { root: 'agl', gloss: 'affliction', noun: 'affliction' },
    { root: 'wund', gloss: 'gash', noun: 'gash', verb: 'gash', pp: 'gashed' },
    { root: 'slah', gloss: 'strike', verb: 'strike', pp: 'struck' },
    { root: 'brek', gloss: 'break', verb: 'break', pp: 'broken' },
    { root: 'ait', gloss: 'poison', noun: 'poison', verb: 'poison', pp: 'poisoned' },
    { root: 'grim', gloss: 'fierce, cruel', adj: 'cruel', adv: 'grimly' },
    { root: 'harm', gloss: 'grief, hurt', noun: 'grief', verb: 'harm', pp: 'harmed' },
    { root: 'kaun', gloss: 'sore', noun: 'sore', runeName: true },
    { root: 'hagl', gloss: 'hail', noun: 'hail', runeName: true },
  ],
  summoning: [
    { root: 'lath', gloss: 'summon, invite', verb: 'summon' },
    { root: 'kall', gloss: 'call', verb: 'call' },
    { root: 'bud', gloss: 'bid', verb: 'bid' },
    { root: 'hait', gloss: 'command by name', verb: 'command' },
    { root: 'wek', gloss: 'wake', verb: 'wake' },
    { root: 'gal', gloss: 'chant, crow', verb: 'chant' },
    { root: 'sok', gloss: 'seek', verb: 'seek' },
    { root: 'kum', gloss: 'come', verb: 'come', intransitive: true },
    { root: 'lok', gloss: 'lure', verb: 'lure' },
    { root: 'stefn', gloss: 'voice-summons', noun: 'voice-summons', verb: 'call forth' },
    { root: 'ur', gloss: 'primal beast', noun: 'primal beast', runeName: true },
    { root: 'ans', gloss: 'god', noun: 'god', runeName: true },
    { root: 'ehw', gloss: 'horse', noun: 'horse', runeName: true },
    { root: 'ingw', gloss: 'the god Ing', noun: 'god Ing', runeName: true },
  ],
  hidden: [
    { root: 'run', gloss: 'secret', noun: 'secret' },
    { root: 'laun', gloss: 'concealment', noun: 'concealment' },
    { root: 'hel', gloss: 'hide' },
    { root: 'hul', gloss: 'cover' },
    { root: 'dul', gloss: 'veiled thing', noun: 'veiled thing' },
    { root: 'mirk', gloss: 'murk', noun: 'murk', adv: 'darkly' },
    { root: 'felh', gloss: 'commit to hiding' },
    { root: 'grub', gloss: 'dig hidden' },
    { root: 'huld', gloss: 'the hidden one', noun: 'hidden one' },
    { root: 'swik', gloss: 'deceit', noun: 'deceit' },
    { root: 'feh', gloss: 'hoarded wealth', noun: 'hoarded wealth', runeName: true },
    { root: 'perth', gloss: 'lot-cup', noun: 'lot-cup', runeName: true },
  ],
  binding: [
    { root: 'bind', gloss: 'bind', verb: 'bind', pp: 'bound' },
    { root: 'band', gloss: 'bond', noun: 'bond' },
    { root: 'haft', gloss: 'fetter-hold', noun: 'fetter-hold', verb: 'fetter' },
    { root: 'fetur', gloss: 'shackle', noun: 'shackle', verb: 'shackle' },
    { root: 'knut', gloss: 'knot', noun: 'knot', verb: 'knot' },
    { root: 'wrid', gloss: 'twist, writhe', verb: 'twist' },
    { root: 'spann', gloss: 'clasp', verb: 'clasp' },
    { root: 'tug', gloss: 'rope', noun: 'rope' },
    { root: 'hald', gloss: 'hold', verb: 'hold', pp: 'held' },
    { root: 'luk', gloss: 'lock shut', verb: 'lock', pp: 'locked' },
    { root: 'geb', gloss: 'binding gift', noun: 'binding gift', runeName: true },
    { root: 'naud', gloss: 'need-fetter', noun: 'need-fetter', runeName: true },
    { root: 'is', gloss: 'ice', noun: 'ice', runeName: true },
  ],
  fire: [
    { root: 'fur', gloss: 'fire', noun: 'fire' },
    { root: 'brand', gloss: 'burning brand', noun: 'burning brand' },
    { root: 'log', gloss: 'flame', noun: 'flame' },
    { root: 'eim', gloss: 'fire-reek', noun: 'fire-reek' },
    { root: 'glod', gloss: 'ember', noun: 'ember' },
    { root: 'brin', gloss: 'burn' },
    { root: 'tand', gloss: 'kindled fire', noun: 'kindled fire' },
    { root: 'swid', gloss: 'singe' },
    { root: 'funk', gloss: 'spark', noun: 'spark' },
    { root: 'bael', gloss: 'pyre', noun: 'pyre' },
    { root: 'sowil', gloss: 'sun', noun: 'sun', runeName: true },
  ],
  night: [
    { root: 'naht', gloss: 'night', noun: 'night' },
    { root: 'derk', gloss: 'dark', adj: 'dark' },
    { root: 'skad', gloss: 'shadow', noun: 'shadow' },
    { root: 'kweld', gloss: 'evening', noun: 'evening' },
    { root: 'swart', gloss: 'black', adj: 'black' },
    { root: 'dim', gloss: 'dim', adj: 'dim', adv: 'dimly' },
    { root: 'mena', gloss: 'moon', noun: 'moon' },
    { root: 'rok', gloss: 'twilight', noun: 'twilight' },
    { root: 'hrim', gloss: 'hoarfrost', noun: 'hoarfrost' },
    { root: 'draum', gloss: 'dream', noun: 'dream' },
  ],
  death: [
    { root: 'dauth', gloss: 'death', noun: 'death' },
    { root: 'wal', gloss: 'the slain', noun: 'slain' },
    { root: 'faig', gloss: 'doomed', adj: 'doomed' },
    { root: 'grab', gloss: 'grave', noun: 'grave' },
    { root: 'ban', gloss: 'bane, slayer', noun: 'bane' },
    { root: 'lik', gloss: 'corpse', noun: 'corpse' },
    { root: 'mold', gloss: 'grave-earth', noun: 'grave-earth' },
    { root: 'draug', gloss: 'walker-again', noun: 'walker-again' },
    { root: 'swelt', gloss: 'die', verb: 'die', intransitive: true },
    { root: 'naw', gloss: 'the dead', noun: 'dead one' },
    { root: 'thurs', gloss: 'hostile wight', noun: 'hostile wight', runeName: true },
    { root: 'iw', gloss: 'yew', noun: 'yew', runeName: true },
    { root: 'mann', gloss: 'mortal man', noun: 'mortal man', runeName: true },
  ],
  gates: [
    { root: 'dur', gloss: 'door', noun: 'door' },
    { root: 'gat', gloss: 'opening', noun: 'opening' },
    { root: 'hlid', gloss: 'gate', noun: 'gate' },
    { root: 'grind', gloss: 'gate-lattice', noun: 'gate-lattice' },
    { root: 'brug', gloss: 'bridge', noun: 'bridge' },
    { root: 'munth', gloss: 'mouth, entry', noun: 'mouth' },
    { root: 'stig', gloss: 'path', noun: 'path' },
    { root: 'weg', gloss: 'way', noun: 'way' },
    { root: 'bor', gloss: 'bored passage', noun: 'bored passage' },
    { root: 'gap', gloss: 'gap, chasm', noun: 'chasm' },
    { root: 'raid', gloss: 'ride, journey', noun: 'journey', runeName: true },
  ],
  time: [
    { root: 'tid', gloss: 'time, tide', noun: 'tide of time' },
    { root: 'stund', gloss: 'hour, while', noun: 'hour' },
    { root: 'sumar', gloss: 'summer, bright season', noun: 'summer' },
    { root: 'ald', gloss: 'age', noun: 'age' },
    { root: 'wurd', gloss: 'woven fate', noun: 'woven fate' },
    { root: 'skap', gloss: 'shaped destiny', noun: 'shaped destiny' },
    { root: 'morgan', gloss: 'morrow', noun: 'morrow' },
    { root: 'aband', gloss: 'evening of days', noun: 'evening of days' },
    { root: 'aiw', gloss: 'eternity', noun: 'eternity' },
    { root: 'forn', gloss: 'ancient time', noun: 'ancient time' },
    { root: 'dag', gloss: 'day', noun: 'day', runeName: true },
    { root: 'jer', gloss: 'harvest-year', noun: 'harvest-year', runeName: true },
  ],
};

export interface PowerWord {
  word: string;
  gloss: string;
}

// Attested bright power words (spec 2.7). The rune row itself lives in the
// opening idioms instead.
export const BRIGHT_POWER: ReadonlyArray<PowerWord> = [
  { word: 'alu', gloss: 'Alu, the warding cry.' },
  { word: 'laukaz', gloss: 'Laukaz, the leek of vitality.' },
  { word: 'lathu', gloss: 'Lathu, the summons.' },
  { word: 'auja', gloss: 'Auja, the luck word.' },
  { word: 'ota', gloss: 'Ota, the companion cry.' },
  { word: 'gagaga', gloss: 'Gagaga, the spear chant.' },
  { word: 'tuwatuwa', gloss: 'Tuwatuwa, the chant of the bracteates.' },
];

// The shrinking triangle needs at least four runes to allow three steps.
export const TRIANGLE_BRIGHT: ReadonlyArray<PowerWord> = BRIGHT_POWER.filter(
  ({ word }) => word !== 'alu' && word !== 'ota',
);

// Dread epithet pool of the Eldritch register (spec 2.10).
export const DREAD_POWER: ReadonlyArray<PowerWord> = [
  { word: 'thruznaz', gloss: 'the gnawer beneath' },
  { word: 'gulzoth', gloss: 'the maw of the dark' },
  { word: 'wuzgrim', gloss: 'the cold that creeps' },
  { word: 'skulthogn', gloss: 'the shadow that waits' },
  { word: 'hruzbanaz', gloss: 'the bane from below' },
  { word: 'nuthkolaz', gloss: 'the cold beyond the stars' },
  { word: 'zguwald', gloss: 'the wielder in the void' },
  { word: 'muznaht', gloss: 'the night that hungers' },
  { word: 'thulgzar', gloss: 'the sleeper under the gates' },
  { word: 'kruthmol', gloss: 'the grinder of ages' },
];

export interface Idiom {
  words: ReadonlyArray<string>;
  gloss: string;
}

export const RO1: Idiom = { words: ['alu'], gloss: 'Alu!' };
export const RO2: Idiom = { words: ['ek', 'erilaz'], gloss: 'I, the rune-master!' };
export const RO3_FIRST_AETT: Idiom = {
  words: ['futharkgw'],
  gloss: 'The first aett of the futhark!',
};
export const RO3_FULL_ROW: Idiom = {
  words: ['futharkgwhnijeipzstbemlngdo'],
  gloss: 'The full row of the futhark!',
};

export const RC1: Idiom = { words: ['runoz', 'faihido'], gloss: 'I painted these runes.' };
export const RC2: Idiom = { words: ['runoz', 'tawido'], gloss: 'I made these runes.' };
export const RC3: Idiom = { words: ['alu'], gloss: 'Alu!' };

export const ELDRITCH_OPEN_SHORT: Idiom = {
  words: ['wgkrathuf'],
  gloss: 'The first aett, spoken against its order!',
};
export const ELDRITCH_OPEN_FULL: Idiom = {
  words: ['odnglmebtszpeijinhwgkrathuf'],
  gloss: 'The rune row, spoken against its order!',
};
export const ELDRITCH_CLOSE: Idiom = {
  words: ['runoz', 'gnagido'],
  gloss: 'It gnawed the runes.',
};

// The clause imperative addresses the invoked power itself, so it keeps
// the come flavor of the school skeleton. Tier 2 draws instead from every
// transitive verb of the planned field (spec 2.9).
export const INVOCATION_COME: ReadonlyArray<string> = ['kum', 'wek'];
