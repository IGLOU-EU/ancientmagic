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

// Coined roots by semantic field (spec 2.3), rune-name roots appended to
// the field they fit best. The spec lets a rune name fill any gene, this
// data commits each one to a single field to keep the pools coherent.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<RunicRoot>>> = {
  warding: [
    { root: 'ward', gloss: 'watch, guard', noun: 'warder', verb: 'ward' },
    { root: 'skild', gloss: 'shield', noun: 'shield' },
    { root: 'burg', gloss: 'stronghold', noun: 'stronghold' },
    { root: 'helm', gloss: 'covering', noun: 'covering' },
    { root: 'gard', gloss: 'enclosure', noun: 'enclosure' },
    { root: 'frith', gloss: 'peace-bond', noun: 'peace-bond' },
    { root: 'mund', gloss: 'protecting hand', noun: 'protecting hand' },
    { root: 'wern', gloss: 'fend off', verb: 'fend' },
    { root: 'halg', gloss: 'hallow' },
    { root: 'skerm', gloss: 'screen' },
    { root: 'alg', gloss: 'elk-guard', noun: 'elk-guard' },
    { root: 'tiw', gloss: 'the sky god', noun: 'sky god' },
    { root: 'berk', gloss: 'birch' },
    { root: 'wunj', gloss: 'joy' },
    { root: 'lauk', gloss: 'leek' },
  ],
  harm: [
    { root: 'skath', gloss: 'scathe', verb: 'scathe', pp: 'scathed' },
    { root: 'bal', gloss: 'bale, evil', noun: 'bale' },
    { root: 'sair', gloss: 'wound', noun: 'wound' },
    { root: 'agl', gloss: 'affliction', noun: 'affliction' },
    { root: 'wund', gloss: 'gash', noun: 'gash' },
    { root: 'slah', gloss: 'strike', verb: 'strike', pp: 'struck' },
    { root: 'brek', gloss: 'break', verb: 'break', pp: 'broken' },
    { root: 'ait', gloss: 'poison', noun: 'poison' },
    { root: 'grim', gloss: 'fierce, cruel', adj: 'cruel', adv: 'grimly' },
    { root: 'harm', gloss: 'grief, hurt', noun: 'grief' },
    { root: 'ur', gloss: 'primal beast', noun: 'primal beast' },
    { root: 'kaun', gloss: 'sore', noun: 'sore' },
    { root: 'hagl', gloss: 'hail', noun: 'hail' },
  ],
  summoning: [
    { root: 'lath', gloss: 'summon, invite' },
    { root: 'kall', gloss: 'call', verb: 'call' },
    { root: 'bud', gloss: 'bid' },
    { root: 'hait', gloss: 'command by name' },
    { root: 'wek', gloss: 'wake', verb: 'wake' },
    { root: 'gal', gloss: 'chant, crow' },
    { root: 'sok', gloss: 'seek' },
    { root: 'kum', gloss: 'come', verb: 'come' },
    { root: 'lok', gloss: 'lure' },
    { root: 'stefn', gloss: 'voice-summons', noun: 'voice-summons' },
    { root: 'ans', gloss: 'god', noun: 'god' },
    { root: 'geb', gloss: 'gift' },
    { root: 'ingw', gloss: 'the god Ing' },
    { root: 'mann', gloss: 'man' },
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
    { root: 'feh', gloss: 'wealth' },
    { root: 'perth', gloss: 'lot-cup' },
  ],
  binding: [
    { root: 'bind', gloss: 'bind', verb: 'bind', pp: 'bound' },
    { root: 'band', gloss: 'bond', noun: 'bond' },
    { root: 'haft', gloss: 'fetter-hold', noun: 'fetter-hold' },
    { root: 'fetur', gloss: 'shackle', noun: 'shackle' },
    { root: 'knut', gloss: 'knot', noun: 'knot' },
    { root: 'wrid', gloss: 'twist, writhe' },
    { root: 'spann', gloss: 'clasp' },
    { root: 'tug', gloss: 'rope', noun: 'rope' },
    { root: 'hald', gloss: 'hold', verb: 'hold', pp: 'held' },
    { root: 'luk', gloss: 'lock shut', verb: 'lock', pp: 'locked' },
    { root: 'naud', gloss: 'need' },
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
    { root: 'sowil', gloss: 'sun', noun: 'sun' },
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
    { root: 'is', gloss: 'ice', noun: 'ice' },
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
    { root: 'swelt', gloss: 'die' },
    { root: 'naw', gloss: 'the dead', noun: 'dead one' },
    { root: 'thurs', gloss: 'hostile wight', noun: 'hostile wight' },
    { root: 'iw', gloss: 'yew', noun: 'yew' },
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
    { root: 'raid', gloss: 'ride' },
    { root: 'ehw', gloss: 'horse' },
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
    { root: 'dag', gloss: 'day', noun: 'day' },
    { root: 'jer', gloss: 'harvest-year' },
    { root: 'othal', gloss: 'heritage' },
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

// Curated verb subsets where a flavor needs a narrower pool than the field:
// the clause imperative addresses the invoked power, the tier 2 imperative
// commands the caster's world.
export const INVOCATION_COME: ReadonlyArray<string> = ['kum', 'wek'];
export const INVOCATION_T2: ReadonlyArray<string> = ['wek', 'kall'];
