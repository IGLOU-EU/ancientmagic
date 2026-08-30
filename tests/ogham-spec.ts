// Ogham spec constants transcribed from docs/genomes.md section 10 so the
// contract tests stand independent of the implementation's own data tables.
//
// Every glyph string below is written as an escape and asserted by number, and
// the reason is the tally: neighbouring letters of an aicme differ by one
// stroke in five, the two feather marks are mirror twins, and U+1680 is
// Unicode whitespace that any trim, split or \s match silently eats. A proof
// by looking is worth nothing here, so nothing in this file was copied off a
// rendered page.
//
// This file is generated from the glyph columns of section 10 rather than
// retyped, then kept by hand: what it holds is what the specification wrote.

export const LETTER_TABLE: ReadonlyArray<readonly [token: string, glyph: string]> = [
  ['b', '\u1681'],
  ['l', '\u1682'],
  ['v', '\u1683'],
  ['s', '\u1684'],
  ['n', '\u1685'],
  ['h', '\u1686'],
  ['d', '\u1687'],
  ['t', '\u1688'],
  ['c', '\u1689'],
  ['q', '\u168A'],
  ['m', '\u168B'],
  ['g', '\u168C'],
  ['ng', '\u168D'],
  ['st', '\u168E'],
  ['r', '\u168F'],
  ['a', '\u1690'],
  ['o', '\u1691'],
  ['u', '\u1692'],
  ['e', '\u1693'],
  ['i', '\u1694'],
  ['ea', '\u1695'],
  ['oi', '\u1696'],
  ['ui', '\u1697'],
  ['io', '\u1698'],
  ['ae', '\u1699'],
  ['p', '\u169A'],
];

// The three non-letters. The space mark is a bare length of stem and Unicode
// whitespace at once, and the two feathers are mirror twins.
export const SPACE_MARK = '\u1680';
export const FEATHER = '\u169B';
export const REVERSED_FEATHER = '\u169C';

// A rod joint is exactly the closing feather of one rod against the opening
// feather of the next, with nothing between them (spec 10.2).
export const ROD_JOINT = `${REVERSED_FEATHER}${FEATHER}`;

// The five forfeda, the scholastic supplement, and the letter the language
// lost. Both sets are reachable only where the spec licenses them.
export const FORFEDA: ReadonlyArray<string> = ['\u1695', '\u1696', '\u1697', '\u1698', '\u1699'];
export const PEITH = '\u169A';

// U+169D to U+169F are unassigned and nothing in this genome reaches for them.
export const UNASSIGNED: ReadonlyArray<string> = ['\u169D', '\u169E', '\u169F'];

// Twenty-nine codepoints, the whole assigned block and nothing else.
export const ALLOWED_CODEPOINTS: ReadonlySet<string> = new Set([
  ...LETTER_TABLE.map(([, glyph]) => glyph),
  SPACE_MARK,
  FEATHER,
  REVERSED_FEATHER,
]);

// The coined roots of spec 10.3: root and its dictionary gloss, in table order.
export const LEXICON: Readonly<
  Record<string, ReadonlyArray<readonly [root: string, gloss: string]>>
> = {
  warding: [
    ['dit', 'shield'],
    ['anect', 'protect'],
    ['dun', 'fort'],
    ['rat', 'rampart'],
    ['scet', 'shield'],
    ['cur', 'champion'],
    ['les', 'enclosure'],
    ['imdit', 'gird'],
    ['nert', 'strength'],
    ['cing', 'warrior'],
  ],
  harm: [
    ['bris', 'break'],
    ['lot', 'wound'],
    ['gon', 'pierce'],
    ['mill', 'spoil'],
    ['crad', 'torment'],
    ['galar', 'sickness'],
    ['serb', 'bitter'],
    ['bron', 'grief'],
    ['coll', 'destruction'],
    ['amnas', 'cruel'],
  ],
  summoning: [
    ['gar', 'call'],
    ['toc', 'summon'],
    ['congar', 'convoke'],
    ['tic', 'come'],
    ['ling', 'leap hither'],
    ['guid', 'beseech'],
  ],
  hidden: [
    ['run', 'secret'],
    ['ruin', 'mystery'],
    ['clet', 'covert'],
    ['tost', 'silence'],
    ['sanas', 'whisper'],
    ['celt', 'veil'],
    ['elad', 'secret craft'],
    ['ogom', 'secret writing'],
  ],
  binding: [
    ['nasc', 'bond'],
    ['cengal', 'fetter'],
    ['glas', 'lock'],
    ['drut', 'shut'],
    ['snim', 'twist'],
    ['timarc', 'constrain'],
  ],
  fire: [
    ['ten', 'fire'],
    ['adand', 'kindle'],
    ['brut', 'blaze'],
    ['losc', 'burn'],
    ['gris', 'embers'],
    ['grisc', 'spark'],
    ['deg', 'fire-brand'],
    ['gred', 'scorch'],
    ['tellac', 'hearth'],
    ['lasar', 'flame'],
  ],
  night: [
    ['adag', 'night'],
    ['dorc', 'dark'],
    ['dub', 'black'],
    ['esc', 'moon'],
    ['reann', 'star'],
    ['temel', 'darkness'],
    ['cotlud', 'sleep'],
    ['brat', 'cloak'],
    ['gorm', 'murky'],
    ['noct', 'dead of night'],
  ],
  death: [
    ['bas', 'death'],
    ['marb', 'dead'],
    ['lig', 'grave-bed'],
    ['vert', 'grave-mound'],
    ['scal', 'phantom'],
    ['ec', 'dying'],
    ['cnam', 'bone'],
    ['tam', 'plague'],
  ],
  gates: [
    ['dor', 'door'],
    ['bel', 'mouth'],
    ['set', 'path'],
    ['sid', 'hollow hill'],
    ['comlad', 'door-leaf'],
    ['tarsec', 'threshold'],
    ['bern', 'breach'],
    ['rod', 'road'],
    ['glenn', 'defile'],
  ],
  time: [
    ['tan', 'time'],
    ['trat', 'hour'],
    ['matan', 'morning'],
    ['bledan', 'year'],
    ['amser', 'season'],
    ['gam', 'winter'],
    ['vescor', 'evening'],
    ['cet', 'beginning'],
    ['vorcenn', 'end'],
    ['sior', 'everlasting age'],
  ],
  sight: [
    ['derc', 'eye'],
    ['sell', 'gaze'],
    ['dec', 'look'],
    ['adbat', 'show'],
    ['glan', 'clear'],
    ['vat', 'seer'],
    ['druid', 'druid'],
    ['rosc', 'vision'],
    ['mes', 'judge'],
    ['amarc', 'sight'],
  ],
  fate: [
    ['toic', 'allotted portion'],
    ['dan', 'destiny'],
    ['cinned', 'decree'],
    ['tocad', 'fortune'],
    ['dal', 'appointed doom'],
    ['derb', 'certain'],
    ['rand', 'share'],
    ['crandcor', 'cast lot'],
    ['bret', 'judgment'],
    ['ges', 'taboo'],
  ],
  signs: [
    ['sen', 'omen'],
    ['comard', 'token'],
    ['man', 'portent'],
    ['bran', 'raven'],
    ['irar', 'eagle'],
    ['en', 'bird'],
    ['vis', 'foreknowledge'],
    ['celman', 'augury'],
    ['tarngir', 'foretell'],
    ['brig', 'meaning'],
  ],
  course: [
    ['tect', 'traverse'],
    ['cor', 'turn'],
    ['brost', 'hasten'],
    ['cosc', 'check'],
    ['mall', 'slow'],
    ['grib', 'swift'],
    ['gen', 'renew'],
  ],
  beings: [
    ['dev', 'god'],
    ['rig', 'king'],
    ['tigern', 'lord'],
    ['tren', 'hero'],
    ['sinser', 'ancestor'],
    ['bard', 'poet'],
    ['goban', 'smith'],
    ['bansid', 'woman of the mound'],
    ['luct', 'folk of the mound'],
    ['mordev', 'sea-god'],
  ],
};

// Spec 10.3: the two roots that never fill a slot taking an object. Crin was
// the third until the mute-verb sweep: it withered in a field the planner
// asks for nouns and adjectives alone.
export const INTRANSITIVE: ReadonlyArray<string> = ['tic', 'ling'];

// The scholastic six, one per field the seeing schools lean on hardest. Each
// carries a forfid, so each is drawable only at difficulties 8 and 9.
export const SCHOLASTIC: ReadonlyArray<string> = ['guid', 'ruin', 'reann', 'sior', 'druid', 'toic'];

// The case table of spec 10.4, ending by ending, on the one stem it shows.
export const DECLENSION: ReadonlyArray<readonly [spoken: string, glyphs: string]> = [
  ['curas', '\u1689\u1692\u168F\u1690\u1684'],
  ['curan', '\u1689\u1692\u168F\u1690\u1685'],
  ['curi', '\u1689\u1692\u168F\u1694'],
  ['cure', '\u1689\u1692\u168F\u1693'],
];

export const NOUN_ENDINGS: ReadonlyArray<string> = ['as', 'an', 'i', 'e'];

// The five verb forms of spec 10.4, on the one stem it shows.
export const CONJUGATION: ReadonlyArray<readonly [spoken: string, glyphs: string]> = [
  ['nascu', '\u1685\u1690\u1684\u1689\u1692'],
  ['nascit', '\u1685\u1690\u1684\u1689\u1694\u1688'],
  ['nasc', '\u1685\u1690\u1684\u1689'],
  ['nascetu', '\u1685\u1690\u1684\u1689\u1693\u1688\u1692'],
  ['ronascus', '\u168F\u1691\u1685\u1690\u1684\u1689\u1692\u1684'],
];

// The attributive adjective copies its noun's ending exactly and stands after
// it, which no other genome in this document does (spec 10.4).
export const AGREEMENT: readonly [spoken: string, glyphs: string] = [
  'scalan duban',
  '\u1684\u1689\u1690\u1682\u1690\u1685\u1680\u1687\u1692\u1681\u1690\u1685',
];

// The epithet chain hangs a genitive off the vocative, the corpus's own syntax.
export const EPITHET_CHAIN: readonly [spoken: string, glyphs: string] = [
  'cure adagi',
  '\u1689\u1692\u168F\u1693\u1680\u1690\u1687\u1690\u168C\u1694',
];

// The six adverbs of spec 10.4, a closed set and never a co- prefix, since
// coined roots may begin with those letters.
export const ADVERBS: ReadonlyArray<string> = [
  'coserb',
  'codorc',
  'coclet',
  'coglan',
  'cogrib',
];

export const ADVERB_SAMPLE: readonly [spoken: string, glyphs: string] = [
  'coglan',
  '\u1689\u1691\u168C\u1682\u1690\u1685',
];

// Function words of spec 10.4. The last two fuse to the front of a drawn word
// rather than standing alone.
export const FUNCTION_WORDS: ReadonlyArray<readonly [spoken: string, glyphs: string]> = [
  ['vrit', '\u1683\u168F\u1694\u1688'],
  ['do', '\u1687\u1691'],
  ['in', '\u1694\u1685'],
  ['ro', '\u168F\u1691'],
  ['co', '\u1689\u1691'],
];

// The four direction adverbs of spec 10.4, Chronomancy only.
export const DIRECTION_WORDS_SPEC: Readonly<
  Record<string, readonly [spoken: string, glyphs: string]>
> = {
  back: ['cul', '\u1689\u1692\u1682'],
  forth: ['rem', '\u168F\u1693\u168B'],
  again: ['atir', '\u1690\u1688\u1694\u168F'],
  still: ['beos', '\u1681\u1693\u1691\u1684'],
};

// The verb the return anchor closes on, carrying neither ro nor -us.
export const OC5_TAIL_SPEC: readonly [spoken: string, glyphs: string] = [
  'tanac',
  '\u1688\u1690\u1685\u1690\u1689',
];

// The twenty letter names of the manuscript tradition, in the order OO3
// recites them, accents dropped for the reading line (spec 10.6).
export const ROW_NAMES: ReadonlyArray<string> = [
  'beithe',
  'luis',
  'fern',
  'sail',
  'nin',
  'uath',
  'dair',
  'tinne',
  'coll',
  'cert',
  'muin',
  'gort',
  'getal',
  'straif',
  'ruis',
  'ailm',
  'onn',
  'ur',
  'edad',
  'idad',
];

// Idiom word lists of spec 10.6 and 10.10, each with the glyph row it writes.
export const IDIOM_TABLE: Readonly<
  Record<string, readonly [spoken: string, glyphs: string]>
> = {
  OO1: ['bbbbbbb', '\u1681\u1681\u1681\u1681\u1681\u1681\u1681'],
  OO2: ['celi', '\u1689\u1693\u1682\u1694'],
  OO3_SHORT: ['beithe luis fern sail nin', '\u1681\u1680\u1682\u1680\u1683\u1680\u1684\u1680\u1685'],
  OO3_FULL: ['beithe luis fern sail nin uath dair tinne coll cert muin gort getal straif ruis ailm onn ur edad idad', '\u1681\u1680\u1682\u1680\u1683\u1680\u1684\u1680\u1685\u1680\u1686\u1680\u1687\u1680\u1688\u1680\u1689\u1680\u168A\u1680\u168B\u1680\u168C\u1680\u168D\u1680\u168E\u1680\u168F\u1680\u1690\u1680\u1691\u1680\u1692\u1680\u1693\u1680\u1694'],
  OO4: ['anm', '\u1690\u1685\u168B'],
  OO5: ['cetri vlesca ibari', '\u1689\u1693\u1688\u168F\u1694\u1680\u1683\u1682\u1693\u1684\u1689\u1690\u1680\u1694\u1681\u1690\u168F\u1694'],
  OO6: ['dore sidi', '\u1687\u1691\u168F\u1693\u1680\u1684\u1694\u1687\u1694'],
  OC1: ['coi', '\u1689\u1691\u1694'],
  OC2: ['slan', '\u1684\u1682\u1690\u1685'],
  OC3: ['ogom ogmi', '\u1691\u168C\u1691\u168B\u1680\u1691\u168C\u168B\u1694'],
  OC4: ['derb', '\u1687\u1693\u168F\u1681'],
  ELDRITCH_OPEN_SHORT: ['idad edad ur onn ailm', '\u1694\u1680\u1693\u1680\u1692\u1680\u1691\u1680\u1690'],
  ELDRITCH_OPEN_FULL: ['idad edad ur onn ailm ruis straif getal gort muin cert coll tinne dair uath nin sail fern luis beithe', '\u1694\u1680\u1693\u1680\u1692\u1680\u1691\u1680\u1690\u1680\u168F\u1680\u168E\u1680\u168D\u1680\u168C\u1680\u168B\u1680\u168A\u1680\u1689\u1680\u1688\u1680\u1687\u1680\u1686\u1680\u1685\u1680\u1684\u1680\u1683\u1680\u1682\u1680\u1681'],
  ELDRITCH_CLOSE: ['coll temell', '\u1689\u1691\u1682\u1682\u1680\u1688\u1693\u168B\u1693\u1682\u1682'],
};

// The attested power words of spec 10.7. ogmios is the trap the spec left in
// deliberately: its i then o would weld into the forfid U+1698 under the
// greedy map, and the glyph column writes two letters.
export const POWER_TABLE: ReadonlyArray<readonly [id: string, glyphs: string]> = [
  ['lugus', '\u1682\u1692\u168C\u1692\u1684'],
  ['dovvinias', '\u1687\u1691\u1683\u1683\u1694\u1685\u1694\u1690\u1684'],
  ['lugudeccas', '\u1682\u1692\u168C\u1692\u1687\u1693\u1689\u1689\u1690\u1684'],
  ['ogmios', '\u1691\u168C\u168B\u1694\u1691\u1684'],
  ['brigantia', '\u1681\u168F\u1694\u168C\u1690\u1685\u1688\u1694\u1690'],
  ['dagodevos', '\u1687\u1690\u168C\u1691\u1687\u1693\u1683\u1691\u1684'],
  ['manannan', '\u168B\u1690\u1685\u1690\u1685\u1685\u1690\u1685'],
  ['danu', '\u1687\u1690\u1685\u1692'],
  ['morrigan', '\u168B\u1691\u168F\u168F\u1694\u168C\u1690\u1685'],
  ['donn', '\u1687\u1691\u1685\u1685'],
  ['bodua', '\u1681\u1691\u1687\u1692\u1690'],
  ['macha', '\u168B\u1690\u1689\u1686\u1690'],
  ['nemain', '\u1685\u1693\u168B\u1690\u1694\u1685'],
];

export const BRIGHT_IDS: ReadonlyArray<string> = [
  'lugus',
  'dovvinias',
  'lugudeccas',
  'ogmios',
  'brigantia',
  'dagodevos',
  'manannan',
  'danu',
];

export const DARK_IDS: ReadonlyArray<string> = [
  'morrigan',
  'donn',
  'bodua',
  'macha',
  'nemain',
];

// The kenning vox of spec 10.7: one letter standing as its own word, spoken by
// its attested name and glossed by its kenning. The closed pool is these five.
export const KENNING_TABLE: ReadonlyArray<
  readonly [id: string, spoken: string, glyphs: string, kenning: string]
> = [
  ['beith', 'beithe', '\u1681', 'whitest of barks'],
  ['sail', 'sail', '\u1684', 'palest of withies'],
  ['dair', 'dair', '\u1687', 'stoutest of doors'],
  ['coll', 'coll', '\u1689', 'wisest of woods'],
  ['ruis', 'ruis', '\u168F', 'deepest of blushes'],
];

// The numeral words of spec 10.8. Ogham has no numerals, so a count is spoken,
// and twenty-seven is two words on both lines.
export const NUMERALS: Readonly<
  Record<number, readonly [spoken: string, glyphs: string]>
> = {
  3: ['tri', '\u1688\u168F\u1694'],
  4: ['cetri', '\u1689\u1693\u1688\u168F\u1694'],
  5: ['qenqe', '\u168A\u1693\u1685\u168A\u1693'],
  7: ['sect', '\u1684\u1693\u1689\u1688'],
  9: ['novan', '\u1685\u1691\u1683\u1690\u1685'],
  27: ['tri novan', '\u1688\u168F\u1694\u1680\u1685\u1691\u1683\u1690\u1685'],
};

export const SEAL_COUNTS_SPEC: ReadonlyArray<number> = [3, 4, 5, 7, 9, 27];

// The instruction the count is sealed with, verb first as every command in
// this genome is.
export const SEAL_HEAD_SPOKEN = 'snad';
export const SEAL_SAMPLE: readonly [spoken: string, glyphs: string] = [
  'snad tri',
  '\u1684\u1685\u1690\u1687\u1680\u1688\u168F\u1694',
];

// The register's seal never moves: the count that holds back what speaks from
// beyond the ninth wave.
export const ELDRITCH_SEAL: readonly [spoken: string, glyphs: string] = [
  'snad novan',
  '\u1684\u1685\u1690\u1687\u1680\u1685\u1691\u1683\u1690\u1685',
];

// Dread epithets of spec 10.10, indeclinable listed forms built to fail the
// native tests on sight, every one of them carrying the letter p.
export const DREAD_TABLE: ReadonlyArray<
  readonly [word: string, glyphs: string, gloss: string]
> = [
  ['pethagg', '\u169A\u1693\u1688\u1686\u1690\u168C\u168C', 'the mouth beneath the tide'],
  ['prusc', '\u169A\u168F\u1692\u1684\u1689', 'the crawler along the stem'],
  ['moppad', '\u168B\u1691\u169A\u169A\u1690\u1687', 'the swarm beneath the sand'],
  ['dolp', '\u1687\u1691\u1682\u169A', 'the hunger under the wave'],
  ['prugg', '\u169A\u168F\u1692\u168C\u168C', 'the eye below the keel'],
  ['hnapp', '\u1686\u1685\u1690\u169A\u169A', 'the breath from under the threshold'],
  ['scradap', '\u1684\u1689\u168F\u1690\u1687\u1690\u169A', 'the tally that counts the living'],
  ['golp', '\u168C\u1691\u1682\u169A', 'the gullet of the deep'],
  ['thulp', '\u1688\u1686\u1692\u1682\u169A', 'the sleeper below the ninth wave'],
  ['pemnag', '\u169A\u1693\u168B\u1685\u1690\u168C', 'the mist that unmakes names'],
];

export const DREAD_EPITHETS: ReadonlyArray<string> = DREAD_TABLE.map(([word]) => word);

// The two transformed verbs the register can produce, and no third one: the
// bright vowel drowns, then the cut stutters (spec 10.10).
export const TRANSFORMED_VERBS: ReadonlyArray<string> = ['tucc', 'lungg'];

// How a word shrinks under this genome's device: the last letter goes at each
// step, down to a single letter. The bright four shrink the birch warning of
// OO1 and Curse shrinks morrigan, so the steps are computed rather than listed.
export function truncations(letters: ReadonlyArray<string>): string[] {
  return letters.map((_unused, index) => letters.slice(0, letters.length - index).join(''));
}

// Reads a glyph line back into its rods and their words, by codepoint and
// never by a whitespace class: U+1680 is Unicode whitespace, so a split on \s
// or a trim would eat the separator and leave a plausible line behind (spec
// 10.13). Both splits below take a literal string, and the frame is checked
// rather than assumed.
export function parseRods(glyphs: string): string[][] {
  const characters = Array.from(glyphs);
  if (characters[0] !== FEATHER || characters[characters.length - 1] !== REVERSED_FEATHER) {
    throw new Error('a formula that does not open and close on its feathers');
  }
  return glyphs
    .slice(FEATHER.length, glyphs.length - REVERSED_FEATHER.length)
    .split(ROD_JOINT)
    .map((rod) => rod.split(SPACE_MARK));
}

// How many rods a tier writes (spec 10.13): one through difficulty 5, two at 6
// and 7, four at 8 and 9.
export function rodCount(difficulty: number): number {
  if (difficulty <= 5) return 1;
  if (difficulty <= 7) return 2;
  return 4;
}
