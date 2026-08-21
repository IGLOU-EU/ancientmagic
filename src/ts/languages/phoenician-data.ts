// Phoenician genome data, transcribed from docs/genomes.md section 4. Every
// root, gloss, idiom, divine name and codepoint comes from the spec. The noun,
// plural, verb, pp and adj fields are the generator's English gloss forms for
// the roles a root can fill. A root without a form for a role is never drawn
// for that role.

import type { SemanticField } from '../generator/types.js';

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

export const SEAL_GLOSS: Readonly<Record<SealCount, string>> = {
  3: 'Three times over.',
  7: 'Seven times over.',
  9: 'Nine times over.',
  12: 'Twelve times over.',
};

export interface PhoenicianRoot {
  // Consonant skeleton in the tokens of 4.1.
  root: string;
  gloss: string;
  noun?: string;
  plural?: string;
  verb?: string;
  pp?: string;
  adj?: string;
  // Spec 4.3: never fills a slot that takes a direct object or an 'yt phrase.
  intransitive?: boolean;
}

// Coined roots by semantic field (spec 4.3). Skeleton and gloss are the
// spec's, the part-of-speech forms are the generator's gloss data. The seven
// biconsonantal roots the spec allows carry noun forms only, because 4.4
// states no verb pattern below three radicals.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<PhoenicianRoot>>> = {
  warding: [
    { root: 'mgn', gloss: 'shield', noun: 'shield', plural: 'shields', verb: 'shield', pp: 'shielded' },
    { root: 'ntsr', gloss: 'guard', noun: 'guard', plural: 'guards', verb: 'guard', pp: 'guarded' },
    { root: 'shmr', gloss: 'watch over', noun: 'watcher', plural: 'watchers', verb: 'watch over', pp: 'watched over' },
    { root: 'gdr', gloss: 'wall in', noun: 'wall', plural: 'walls', verb: 'wall in', pp: 'walled in' },
    { root: 'skk', gloss: 'screen, overshadow', noun: 'screen', plural: 'screens', verb: 'overshadow', pp: 'overshadowed' },
    { root: 'smk', gloss: 'uphold', noun: 'support', plural: 'supports', verb: 'uphold', pp: 'upheld' },
    { root: 'ghzr', gloss: 'gird round', noun: 'girdle', plural: 'girdles', verb: 'gird round', pp: 'girded round' },
    { root: 'khsn', gloss: 'make strong', noun: 'stronghold', plural: 'strongholds', verb: 'make strong', pp: 'made strong' },
    { root: 'khpp', gloss: 'canopy over', noun: 'canopy', plural: 'canopies', verb: 'canopy over', pp: 'canopied' },
    { root: 'swg', gloss: 'fence about', noun: 'fence', plural: 'fences', verb: 'fence about', pp: 'fenced about' },
  ],
  harm: [
    { root: "'rr", gloss: 'curse', noun: 'curse', plural: 'curses', verb: 'curse', pp: 'cursed' },
    { root: 'qll', gloss: 'revile', verb: 'revile', pp: 'reviled', adj: 'reviled' },
    { root: 'ngp', gloss: 'strike with plague', noun: 'plague', plural: 'plagues', verb: 'strike with plague', pp: 'plague-struck' },
    { root: 'shbr', gloss: 'shatter', noun: 'shattering', plural: 'shatterings', verb: 'shatter', pp: 'shattered' },
    { root: 'mkhts', gloss: 'smite', verb: 'smite', pp: 'smitten' },
    { root: 'khbl', gloss: 'ruin', noun: 'ruin', plural: 'ruins', verb: 'ruin', pp: 'ruined' },
    { root: 'hdp', gloss: 'thrust down', verb: 'thrust down', pp: 'thrust down' },
    { root: "'bd", gloss: 'destroy', noun: 'destruction', plural: 'destructions', verb: 'destroy', pp: 'destroyed' },
    { root: 'khrb', gloss: 'lay waste', verb: 'lay waste', pp: 'laid waste', adj: 'wasted' },
    { root: 'rtsts', gloss: 'crush', verb: 'crush', pp: 'crushed', adj: 'crushed' },
  ],
  summoning: [
    { root: "qr'", gloss: 'call', noun: 'call', plural: 'calls', verb: 'call', pp: 'called' },
    { root: 'zghq', gloss: 'cry out', noun: 'outcry', plural: 'outcries', verb: 'cry out', pp: 'cried out to' },
    { root: 'shlkh', gloss: 'send for', verb: 'send for', pp: 'sent for' },
    { root: "bw'", gloss: 'bring in', noun: 'coming', plural: 'comings', verb: 'come in', pp: 'brought in' },
    { root: 'ngd', gloss: 'announce', verb: 'announce', pp: 'announced' },
    { root: 'pqd', gloss: 'muster', verb: 'muster', pp: 'mustered' },
    { root: "'sp", gloss: 'gather', verb: 'gather', pp: 'gathered' },
    { root: 'ghny', gloss: 'answer', verb: 'answer', pp: 'answered' },
    { root: 'drsh', gloss: 'seek out', verb: 'seek out', pp: 'sought out' },
    { root: 'qbts', gloss: 'assemble', verb: 'assemble', pp: 'assembled' },
  ],
  hidden: [
    { root: 'str', gloss: 'hide', noun: 'hiding place', plural: 'hiding places', verb: 'hide', pp: 'hidden' },
    { root: 'ghlm', gloss: 'conceal', noun: 'concealment', plural: 'concealments', verb: 'conceal', pp: 'concealed' },
    { root: "khb'", gloss: 'shelter in secret', noun: 'shelter', plural: 'shelters', verb: 'shelter', pp: 'sheltered' },
    { root: 'tspn', gloss: 'treasure away', noun: 'hoard', plural: 'hoards', verb: 'treasure away', pp: 'treasured away' },
    { root: 'khshk', gloss: 'obscure', noun: 'obscurity', plural: 'obscurities', verb: 'obscure', pp: 'obscured', adj: 'obscured' },
    { root: 'lkhsh', gloss: 'whisper a charm', noun: 'whispered charm', plural: 'whispered charms', verb: 'whisper a charm', pp: 'whispered over' },
    { root: 'ghmq', gloss: 'be unfathomed', noun: 'unfathomed deep', plural: 'unfathomed deeps', adj: 'unfathomed' },
    { root: 'ttmn', gloss: 'bury from sight', verb: 'bury from sight', pp: 'buried from sight' },
    { root: 'khdr', gloss: 'inner chamber', noun: 'inner chamber', plural: 'inner chambers' },
    { root: 'swd', gloss: 'secret council', noun: 'secret council', plural: 'secret councils' },
  ],
  binding: [
    { root: "'sr", gloss: 'bind', noun: 'bond', plural: 'bonds', verb: 'bind', pp: 'bound' },
    { root: 'khtm', gloss: 'seal', noun: 'seal', plural: 'seals', verb: 'seal', pp: 'sealed' },
    { root: 'qshr', gloss: 'knot', noun: 'knot', plural: 'knots', verb: 'knot', pp: 'knotted' },
    { root: 'kbl', gloss: 'fetter', noun: 'fetter', plural: 'fetters', verb: 'fetter', pp: 'fettered' },
    { root: 'rtq', gloss: 'chain fast', noun: 'chain', plural: 'chains', verb: 'chain fast', pp: 'chained fast' },
    { root: 'ghqd', gloss: 'bind for offering', verb: 'bind for offering', pp: 'bound for offering' },
    { root: 'khnq', gloss: 'constrict', verb: 'constrict', pp: 'constricted' },
    { root: 'tsrr', gloss: 'wrap tight', verb: 'wrap tight', pp: 'wrapped tight' },
    { root: 'khgr', gloss: 'gird', noun: 'girding', plural: 'girdings', verb: 'gird', pp: 'girded' },
    { root: 'zmm', gloss: 'muzzle', noun: 'muzzle', plural: 'muzzles', verb: 'muzzle', pp: 'muzzled' },
  ],
  fire: [
    { root: "'sh", gloss: 'fire', noun: 'fire', plural: 'fires' },
    { root: 'lhb', gloss: 'flame', noun: 'flame', plural: 'flames' },
    { root: 'bghr', gloss: 'burn', noun: 'burning', plural: 'burnings', verb: 'burn', pp: 'burned' },
    { root: 'srp', gloss: 'burn up', verb: 'burn up', pp: 'burned up' },
    { root: 'qdkh', gloss: 'kindle', noun: 'kindling', plural: 'kindlings', verb: 'kindle', pp: 'kindled' },
    { root: 'zrkh', gloss: 'blaze forth', noun: 'blaze', plural: 'blazes', verb: 'blaze forth', pp: 'blazed forth' },
    { root: 'rshp', gloss: 'plague-fire', noun: 'plague-fire', plural: 'plague-fires' },
    { root: 'gkhl', gloss: 'ember', noun: 'ember', plural: 'embers' },
    { root: 'khrr', gloss: 'scorch', verb: 'scorch', pp: 'scorched', adj: 'scorched' },
    { root: 'tnr', gloss: 'furnace', noun: 'furnace', plural: 'furnaces' },
  ],
  night: [
    { root: 'lyl', gloss: 'night', noun: 'night', plural: 'nights' },
    { root: 'ghrb', gloss: 'evening', noun: 'evening', plural: 'evenings' },
    { root: "'pl", gloss: 'thick darkness', noun: 'thick darkness', plural: 'thick darknesses', adj: 'pitch-dark' },
    { root: 'nshp', gloss: 'twilight', noun: 'twilight', plural: 'twilights' },
    { root: 'tslm', gloss: 'deep shadow', noun: 'deep shadow', plural: 'deep shadows', adj: 'shadowed' },
    { root: 'shkhr', gloss: 'the black hour', noun: 'black hour', plural: 'black hours', adj: 'black' },
    { root: 'dmm', gloss: 'stillness', noun: 'stillness', plural: 'stillnesses', adj: 'still' },
    { root: 'nwm', gloss: 'slumber', noun: 'slumber', plural: 'slumbers', verb: 'slumber', pp: 'slumbering', intransitive: true },
    { root: 'khlm', gloss: 'dream', noun: 'dream', plural: 'dreams' },
    { root: 'qdr', gloss: 'grow dark', verb: 'grow dark', pp: 'grown dark', adj: 'darkened' },
  ],
  death: [
    { root: 'mwt', gloss: 'death', noun: 'death', plural: 'deaths' },
    { root: 'qbr', gloss: 'grave', noun: 'grave', plural: 'graves' },
    { root: "rp'", gloss: 'shade of the dead', noun: 'shade of the dead', plural: 'shades' },
    { root: 'shkhb', gloss: 'lie in death', verb: 'lie in death', pp: 'laid in death', intransitive: true },
    { root: 'krt', gloss: 'cut off', noun: 'cutting off', plural: 'cuttings off', verb: 'cut off', pp: 'cut off' },
    { root: 'shkht', gloss: 'pit of ruin', noun: 'pit of ruin', plural: 'pits of ruin' },
    { root: 'dwy', gloss: 'waste away', verb: 'waste away', pp: 'wasted away', adj: 'wasted', intransitive: true },
    { root: 'blgh', gloss: 'swallow up', verb: 'swallow up', pp: 'swallowed up' },
    { root: 'khdl', gloss: 'cease', verb: 'cease', pp: 'ceased', intransitive: true },
    { root: 'nbl', gloss: 'wither', verb: 'wither', pp: 'withered', adj: 'withered', intransitive: true },
  ],
  gates: [
    { root: 'shghr', gloss: 'gate', noun: 'gate', plural: 'gates' },
    { root: 'dl', gloss: 'door', noun: 'door', plural: 'doors' },
    { root: 'ptkh', gloss: 'opening', noun: 'opening', plural: 'openings', verb: 'open', pp: 'opened' },
    { root: 'sp', gloss: 'threshold', noun: 'threshold', plural: 'thresholds' },
    { root: 'shqp', gloss: 'lintel', noun: 'lintel', plural: 'lintels' },
    { root: 'khln', gloss: 'window', noun: 'window', plural: 'windows' },
    { root: 'shbl', gloss: 'path', noun: 'path', plural: 'paths' },
    { root: 'drk', gloss: 'road', noun: 'road', plural: 'roads' },
    { root: 'ghbr', gloss: 'cross over', noun: 'crossing', plural: 'crossings', verb: 'cross over', pp: 'crossed over' },
    { root: 'bqgh', gloss: 'breach open', noun: 'breach', plural: 'breaches', verb: 'breach open', pp: 'breached open' },
  ],
  time: [
    { root: 'ghd', gloss: 'perpetuity', noun: 'perpetuity', plural: 'perpetuities' },
    { root: 'zmn', gloss: 'appointed time', noun: 'appointed time', plural: 'appointed times' },
    { root: 'ght', gloss: 'moment', noun: 'moment', plural: 'moments' },
    { root: 'ym', gloss: 'day', noun: 'day', plural: 'days' },
    { root: 'shnt', gloss: 'year', noun: 'year', plural: 'years' },
    { root: 'khdsh', gloss: 'new moon', noun: 'new moon', plural: 'new moons' },
    { root: 'bqr', gloss: 'morning', noun: 'morning', plural: 'mornings' },
    { root: 'qdm', gloss: 'ancient time', noun: 'ancient time', plural: 'ancient times' },
    { root: "'khr", gloss: 'the after-time', noun: 'after-time', plural: 'after-times' },
    { root: 'dr', gloss: 'generation, age', noun: 'age', plural: 'ages' },
  ],
};

export interface DivineName {
  skeleton: string;
  // Written letter for letter, exempt from the collapse rule (spec 4.7).
  glyphs: string;
  spoken: string;
  // Capitalized form used in the gloss line.
  name: string;
  gloss: string;
  // Goddess agents take the 3fs jussive prefix (spec 4.4).
  feminine: boolean;
}

// Attested divine names (spec 4.7), in table order.
export const ALL_NAMES: ReadonlyArray<DivineName> = [
  {
    skeleton: 'bghl',
    glyphs: '\u{10901}\u{1090F}\u{1090B}',
    spoken: 'baal',
    name: 'Baal',
    gloss: 'Baal, lord of the storm.',
    feminine: false,
  },
  {
    skeleton: 'ghshtrt',
    glyphs: '\u{1090F}\u{10914}\u{10915}\u{10913}\u{10915}',
    spoken: 'ashtart',
    name: 'Ashtart',
    gloss: 'Ashtart, lady of Sidon.',
    feminine: true,
  },
  {
    skeleton: "'shmn",
    glyphs: '\u{10900}\u{10914}\u{1090C}\u{1090D}',
    spoken: 'eshmun',
    name: 'Eshmun',
    gloss: 'Eshmun, healer of Sidon.',
    feminine: false,
  },
  {
    skeleton: 'mlqrt',
    glyphs: '\u{1090C}\u{1090B}\u{10912}\u{10913}\u{10915}',
    spoken: 'milqart',
    name: 'Milqart',
    gloss: 'Milqart, lord of Tyre.',
    feminine: false,
  },
  {
    skeleton: 'tnt',
    glyphs: '\u{10915}\u{1090D}\u{10915}',
    spoken: 'tinnit',
    name: 'Tinnit',
    gloss: 'Tinnit, the face of Baal.',
    feminine: true,
  },
  {
    skeleton: 'rshp',
    glyphs: '\u{10913}\u{10914}\u{10910}',
    spoken: 'reshep',
    name: 'Reshep',
    gloss: 'Reshep, lord of the plague-fire.',
    feminine: false,
  },
  {
    skeleton: 'khrn',
    glyphs: '\u{10907}\u{10913}\u{1090D}',
    spoken: 'horon',
    name: 'Horon',
    gloss: 'Horon, of the world below.',
    feminine: false,
  },
  {
    skeleton: 'ssm',
    glyphs: '\u{1090E}\u{1090E}\u{1090C}',
    spoken: 'sasam',
    name: 'Sasam',
    gloss: 'Sasam, named in the demon oath.',
    feminine: false,
  },
];

// Spec 4.7 splits the pool by school: the protective powers on one side, the
// plague and underworld powers on the other.
export const BRIGHT_NAMES: ReadonlyArray<DivineName> = ALL_NAMES.filter((n) =>
  ['bghl', 'ghshtrt', "'shmn", 'mlqrt', 'tnt'].includes(n.skeleton),
);

export const DARK_NAMES: ReadonlyArray<DivineName> = ALL_NAMES.filter((n) =>
  ['rshp', 'khrn', 'ssm'].includes(n.skeleton),
);

export interface DreadEpithet {
  skeleton: string;
  spoken: string;
  gloss: string;
}

// Dread epithet pool of the Eldritch register (spec 4.10), quadriliteral coins.
export const DREAD_POWER: ReadonlyArray<DreadEpithet> = [
  { skeleton: 'ttkhmr', spoken: 'tokhmur', gloss: 'the churner of the deep' },
  { skeleton: 'qlghsh', spoken: 'qolghush', gloss: 'the whisper that unmakes' },
  { skeleton: 'tsrghn', spoken: 'tsorghun', gloss: 'the sprawling root below' },
  { skeleton: 'mqdgh', spoken: 'moqdugh', gloss: 'the profaned holy place' },
  { skeleton: 'shqmts', spoken: 'shoqmuts', gloss: 'the sunken devourer' },
  { skeleton: 'ghqbr', spoken: 'ghoqbur', gloss: 'the grave that walks' },
  { skeleton: 'ntpl', spoken: 'notpul', gloss: 'the fallen watcher' },
  { skeleton: 'bghshm', spoken: 'boghshum', gloss: 'the nameless flesh' },
  { skeleton: 'dlqts', spoken: 'dolquts', gloss: 'the gnawing flame below' },
  { skeleton: 'khnqsh', spoken: 'khonqush', gloss: 'the strangling serpent' },
];

export interface FixedWord {
  glyphs: string;
  spoken: string;
}

export interface Idiom {
  words: ReadonlyArray<FixedWord>;
  gloss: string;
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

// The theophoric element of the PO2 caster name (spec 4.6).
export const THEOPHORIC_SKELETON = 'bghl';
export const THEOPHORIC_SPOKEN = 'baal';

export const PC1: Idiom = {
  words: [
    { glyphs: '\u{1090A}', spoken: 'ki' },
    { glyphs: '\u{10914}\u{1090C}\u{1090F}', spoken: 'shama' },
    { glyphs: '\u{10912}\u{1090B}', spoken: 'qol' },
    { glyphs: '\u{10909}\u{10901}\u{10913}\u{1090A}', spoken: 'yebarek' },
  ],
  gloss: 'For he has heard the voice, may he bless.',
};

export const PC2: Idiom = {
  words: [
    { glyphs: '\u{10900}\u{1090B}', spoken: 'al' },
    { glyphs: '\u{10909}\u{1090A}\u{1090D}', spoken: 'yakon' },
    { glyphs: '\u{1090B}\u{1090C}', spoken: 'lamo' },
    { glyphs: '\u{10914}\u{10913}\u{10914}', spoken: 'shoresh' },
  ],
  gloss: 'May they have no root below.',
};

export const PC3: Idiom = {
  words: [{ glyphs: '\u{1090B}\u{1090F}\u{1090B}\u{1090C}', spoken: 'leolam' }],
  gloss: 'Forever.',
};

// The fixed dread closing of spec 4.10, built from lexicon words carrying the
// register's own vocalization.
export const ELDRITCH_CLOSE: Idiom = {
  words: [
    { glyphs: '\u{10910}\u{10915}\u{10907}', spoken: 'petokh' },
    { glyphs: '\u{10914}\u{1090F}\u{10913}', spoken: 'shoghur' },
    { glyphs: '\u{1090B}\u{1090F}\u{1090B}\u{1090C}', spoken: 'leolam' },
  ],
  gloss: 'The gate stands open forever.',
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

export const PLURAL_SPOKEN = 'im';
export const FEMININE_SPOKEN = 'at';

// The invocation imperative addresses the invoked power itself, so it draws
// from the summoning roots that a power can be told to do.
export const INVOCATION_COME: ReadonlyArray<string> = ["bw'", 'ghny'];
