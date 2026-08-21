// Phoenician spec constants transcribed from docs/genomes.md section 4 so the
// contract tests stand independent of the implementation's own data tables.
// Every glyph is written as a codepoint escape, never as a literal, because
// the block renders as tofu in most terminals.

export const LETTER_TABLE: ReadonlyArray<readonly [token: string, glyph: string]> = [
  ["'", '\u{10900}'],
  ['b', '\u{10901}'],
  ['g', '\u{10902}'],
  ['d', '\u{10903}'],
  ['h', '\u{10904}'],
  ['w', '\u{10905}'],
  ['z', '\u{10906}'],
  ['kh', '\u{10907}'],
  ['tt', '\u{10908}'],
  ['y', '\u{10909}'],
  ['k', '\u{1090A}'],
  ['l', '\u{1090B}'],
  ['m', '\u{1090C}'],
  ['n', '\u{1090D}'],
  ['s', '\u{1090E}'],
  ['gh', '\u{1090F}'],
  ['p', '\u{10910}'],
  ['ts', '\u{10911}'],
  ['q', '\u{10912}'],
  ['r', '\u{10913}'],
  ['sh', '\u{10914}'],
  ['t', '\u{10915}'],
];

export const ALF = '\u{10900}';
export const WORD_SEP = '\u{1091F}';
export const NUM_1 = '\u{10916}';
export const NUM_2 = '\u{1091A}';
export const NUM_3 = '\u{1091B}';
export const NUM_10 = '\u{10917}';

export const LETTERS: ReadonlySet<string> = new Set(LETTER_TABLE.map(([, glyph]) => glyph));

export const ALLOWED_CODEPOINTS: ReadonlySet<string> = new Set([
  ...LETTER_TABLE.map(([, glyph]) => glyph),
  WORD_SEP,
  NUM_1,
  NUM_2,
  NUM_3,
  NUM_10,
]);

export const DIGRAPHS: ReadonlyArray<string> = ['kh', 'tt', 'ts', 'sh', 'gh'];

// Coined roots of spec 4.3: skeleton and gloss, in table order.
export const LEXICON: Readonly<
  Record<string, ReadonlyArray<readonly [skeleton: string, gloss: string]>>
> = {
  warding: [
    ['mgn', 'shield'],
    ['ntsr', 'guard'],
    ['shmr', 'watch over'],
    ['gdr', 'wall in'],
    ['skk', 'screen, overshadow'],
    ['smk', 'uphold'],
    ['ghzr', 'gird round'],
    ['khsn', 'make strong'],
    ['khpp', 'canopy over'],
    ['swg', 'fence about'],
  ],
  harm: [
    ["'rr", 'curse'],
    ['qll', 'revile'],
    ['ngp', 'strike with plague'],
    ['shbr', 'shatter'],
    ['mkhts', 'smite'],
    ['khbl', 'ruin'],
    ['hdp', 'thrust down'],
    ["'bd", 'destroy'],
    ['khrb', 'lay waste'],
    ['rtsts', 'crush'],
  ],
  summoning: [
    ["qr'", 'call'],
    ['zghq', 'cry out'],
    ['shlkh', 'send for'],
    ["bw'", 'bring in'],
    ['ngd', 'announce'],
    ['pqd', 'muster'],
    ["'sp", 'gather'],
    ['ghny', 'answer'],
    ['drsh', 'seek out'],
    ['qbts', 'assemble'],
  ],
  hidden: [
    ['str', 'hide'],
    ['ghlm', 'conceal'],
    ["khb'", 'shelter in secret'],
    ['tspn', 'treasure away'],
    ['khshk', 'obscure'],
    ['lkhsh', 'whisper a charm'],
    ['ghmq', 'be unfathomed'],
    ['ttmn', 'bury from sight'],
    ['khdr', 'inner chamber'],
    ['swd', 'secret council'],
  ],
  binding: [
    ["'sr", 'bind'],
    ['khtm', 'seal'],
    ['qshr', 'knot'],
    ['kbl', 'fetter'],
    ['rtq', 'chain fast'],
    ['ghqd', 'bind for offering'],
    ['khnq', 'constrict'],
    ['tsrr', 'wrap tight'],
    ['khgr', 'gird'],
    ['zmm', 'muzzle'],
  ],
  fire: [
    ["'sh", 'fire'],
    ['lhb', 'flame'],
    ['bghr', 'burn'],
    ['srp', 'burn up'],
    ['qdkh', 'kindle'],
    ['zrkh', 'blaze forth'],
    ['rshp', 'plague-fire'],
    ['gkhl', 'ember'],
    ['khrr', 'scorch'],
    ['tnr', 'furnace'],
  ],
  night: [
    ['lyl', 'night'],
    ['ghrb', 'evening'],
    ["'pl", 'thick darkness'],
    ['nshp', 'twilight'],
    ['tslm', 'deep shadow'],
    ['shkhr', 'the black hour'],
    ['dmm', 'stillness'],
    ['nwm', 'slumber'],
    ['khlm', 'dream'],
    ['qdr', 'grow dark'],
  ],
  death: [
    ['mwt', 'death'],
    ['qbr', 'grave'],
    ["rp'", 'shade of the dead'],
    ['shkhb', 'lie in death'],
    ['krt', 'cut off'],
    ['shkht', 'pit of ruin'],
    ['dwy', 'waste away'],
    ['blgh', 'swallow up'],
    ['khdl', 'cease'],
    ['nbl', 'wither'],
  ],
  gates: [
    ['shghr', 'gate'],
    ['dl', 'door'],
    ['ptkh', 'opening'],
    ['sp', 'threshold'],
    ['shqp', 'lintel'],
    ['khln', 'window'],
    ['shbl', 'path'],
    ['drk', 'road'],
    ['ghbr', 'cross over'],
    ["bqgh", 'breach open'],
  ],
  time: [
    ['ghd', 'perpetuity'],
    ['zmn', 'appointed time'],
    ['ght', 'moment'],
    ['ym', 'day'],
    ['shnt', 'year'],
    ['khdsh', 'new moon'],
    ['bqr', 'morning'],
    ['qdm', 'ancient time'],
    ["'khr", 'the after-time'],
    ['dr', 'generation, age'],
  ],
};

// Spec 4.3: the five roots that never fill a slot taking a direct object.
export const INTRANSITIVE: ReadonlyArray<string> = ['nwm', 'shkhb', 'dwy', 'khdl', 'nbl'];

// Spec 4.3: the biconsonantal roots the table allows, all noun material.
export const BICONSONANTAL: ReadonlyArray<string> = ["'sh", 'dl', 'sp', 'ghd', 'ght', 'ym', 'dr'];

// Attested divine names of spec 4.7: skeleton, glyph string, spoken form.
export const NAME_TABLE: ReadonlyArray<
  readonly [skeleton: string, glyphs: string, spoken: string]
> = [
  ['bghl', '\u{10901}\u{1090F}\u{1090B}', 'baal'],
  ['ghshtrt', '\u{1090F}\u{10914}\u{10915}\u{10913}\u{10915}', 'ashtart'],
  ["'shmn", '\u{10900}\u{10914}\u{1090C}\u{1090D}', 'eshmun'],
  ['mlqrt', '\u{1090C}\u{1090B}\u{10912}\u{10913}\u{10915}', 'milqart'],
  ['tnt', '\u{10915}\u{1090D}\u{10915}', 'tinnit'],
  ['rshp', '\u{10913}\u{10914}\u{10910}', 'reshep'],
  ['khrn', '\u{10907}\u{10913}\u{1090D}', 'horon'],
  ['ssm', '\u{1090E}\u{1090E}\u{1090C}', 'sasam'],
];

export const BRIGHT_SPOKEN: ReadonlyArray<string> = ['baal', 'ashtart', 'eshmun', 'milqart', 'tinnit'];
export const DARK_SPOKEN: ReadonlyArray<string> = ['reshep', 'horon', 'sasam'];
export const ALL_NAME_SPOKEN: ReadonlyArray<string> = NAME_TABLE.map(([, , spoken]) => spoken);

// Dread epithet pool of spec 4.10: skeleton, spoken form, gloss.
export const DREAD_TABLE: ReadonlyArray<
  readonly [skeleton: string, spoken: string, gloss: string]
> = [
  ['ttkhmr', 'tokhmur', 'the churner of the deep'],
  ['qlghsh', 'qolghush', 'the whisper that unmakes'],
  ['tsrghn', 'tsorghun', 'the sprawling root below'],
  ['mqdgh', 'moqdugh', 'the profaned holy place'],
  ['shqmts', 'shoqmuts', 'the sunken devourer'],
  ['ghqbr', 'ghoqbur', 'the grave that walks'],
  ['ntpl', 'notpul', 'the fallen watcher'],
  ['bghshm', 'boghshum', 'the nameless flesh'],
  ['dlqts', 'dolquts', 'the gnawing flame below'],
  ['khnqsh', 'khonqush', 'the strangling serpent'],
];

export const DREAD_SPOKEN: ReadonlyArray<string> = DREAD_TABLE.map(([, spoken]) => spoken);

// Idiom templates of spec 4.6, glyphs in logical order.
export const PO1_HEAD_GLYPHS = '\u{1090B}\u{10907}\u{10914}\u{10915}';
export const PO1_HEAD_SPOKEN = 'lakhashat';
export const PO2_HEAD_GLYPHS = '\u{10900}\u{1090D}\u{1090A}';
export const PO2_HEAD_SPOKEN = 'anok';
export const PO3_HEAD_GLYPHS = '\u{1090B}\u{10900}\u{10903}\u{1090D}';
export const PO3_HEAD_SPOKEN = 'ladon';

export const PC1_SPOKEN: ReadonlyArray<string> = ['ki', 'shama', 'qol', 'yebarek'];
export const PC1_GLYPHS: ReadonlyArray<string> = [
  '\u{1090A}',
  '\u{10914}\u{1090C}\u{1090F}',
  '\u{10912}\u{1090B}',
  '\u{10909}\u{10901}\u{10913}\u{1090A}',
];

export const PC2_SPOKEN: ReadonlyArray<string> = ['al', 'yakon', 'lamo', 'shoresh'];
export const PC2_GLYPHS: ReadonlyArray<string> = [
  '\u{10900}\u{1090B}',
  '\u{10909}\u{1090A}\u{1090D}',
  '\u{1090B}\u{1090C}',
  '\u{10914}\u{10913}\u{10914}',
];

export const PC3_SPOKEN: ReadonlyArray<string> = ['leolam'];
export const PC3_GLYPHS: ReadonlyArray<string> = ['\u{1090B}\u{1090F}\u{1090B}\u{1090C}'];

export const ELDRITCH_CLOSE_SPOKEN: ReadonlyArray<string> = ['petokh', 'shoghur', 'leolam'];
export const ELDRITCH_CLOSE_GLYPHS: ReadonlyArray<string> = [
  '\u{10910}\u{10915}\u{10907}',
  '\u{10914}\u{1090F}\u{10913}',
  '\u{1090B}\u{1090F}\u{1090B}\u{1090C}',
];

// The object marker and the affixes of spec 4.4.
export const YT_GLYPHS = '\u{10900}\u{10909}\u{10915}';
export const YT_SPOKEN = 'et';
export const ARTICLE = { glyph: '\u{10904}', spoken: 'ha' } as const;
export const PROCLITIC_L = { glyph: '\u{1090B}', spoken: 'le' } as const;
export const PROCLITIC_B = { glyph: '\u{10901}', spoken: 'be' } as const;
export const PROCLITIC_W = { glyph: '\u{10905}', spoken: 'we' } as const;
export const PLURAL_SPOKEN = 'im';
export const FEMININE_SPOKEN = 'at';

// Numerals and seal of spec 4.8. They compose additively and follow the word
// pghm, which sits at the absolute end of the formula.
export const SEAL_HEAD_GLYPHS = '\u{10910}\u{1090F}\u{1090C}';
export const SEAL_HEAD_SPOKEN = 'paghom';

export const NUMERALS: Readonly<Record<number, readonly [glyphs: string, spoken: string]>> = {
  3: [NUM_3, 'shalosh'],
  7: [`${NUM_3}${NUM_3}${NUM_1}`, 'sheba'],
  9: [`${NUM_3}${NUM_3}${NUM_3}`, 'tesha'],
  12: [`${NUM_10}${NUM_2}`, 'shenem asar'],
};

export function codePoints(text: string): string[] {
  return Array.from(text);
}

// The glyph line is stored in logical (reading) order, so splitting on the
// separator yields the words in the order the transliteration lists them.
export function splitWords(glyphs: string): string[] {
  return glyphs.split(WORD_SEP);
}
