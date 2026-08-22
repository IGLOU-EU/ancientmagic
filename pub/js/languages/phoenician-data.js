export const LETTER_MAP = {
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
export const NUM_1 = '\u{10916}';
export const NUM_2 = '\u{1091A}';
export const NUM_3 = '\u{1091B}';
export const NUM_10 = '\u{10917}';
export const NUMERAL_GLYPHS = {
    3: NUM_3,
    7: `${NUM_3}${NUM_3}${NUM_1}`,
    9: `${NUM_3}${NUM_3}${NUM_3}`,
    12: `${NUM_10}${NUM_2}`,
};
export const NUMERAL_WORDS = {
    3: 'shalosh',
    7: 'sheba',
    9: 'tesha',
    12: 'shenem asar',
};
export const SEAL_COUNTS = [3, 7, 9, 12];
export const FIELDS = {
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
        { root: 'qr\'', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'zghq', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'shlkh', forms: ['verb', 'pp'] },
        { root: 'bw\'', forms: ['noun', 'plural', 'verb', 'pp'] },
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
        { root: '\'sr', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'khtm', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'qshr', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'kbl', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'rtq', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'ghqd', forms: ['verb', 'pp'] },
        { root: 'khnq', forms: ['verb', 'pp'] },
        { root: 'tsrr', forms: ['verb', 'pp'] },
        { root: 'khgr', forms: ['noun', 'plural', 'verb', 'pp'] },
        { root: 'zmm', forms: ['noun', 'plural', 'verb', 'pp'] },
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
};
export const ALL_NAMES = [
    { skeleton: 'bghl', glyphs: '\u{10901}\u{1090F}\u{1090B}', spoken: 'baal', feminine: false },
    { skeleton: 'ghshtrt', glyphs: '\u{1090F}\u{10914}\u{10915}\u{10913}\u{10915}', spoken: 'ashtart', feminine: true },
    { skeleton: "'shmn", glyphs: '\u{10900}\u{10914}\u{1090C}\u{1090D}', spoken: 'eshmun', feminine: false },
    { skeleton: 'mlqrt', glyphs: '\u{1090C}\u{1090B}\u{10912}\u{10913}\u{10915}', spoken: 'milqart', feminine: false },
    { skeleton: 'tnt', glyphs: '\u{10915}\u{1090D}\u{10915}', spoken: 'tinnit', feminine: true },
    { skeleton: 'rshp', glyphs: '\u{10913}\u{10914}\u{10910}', spoken: 'reshep', feminine: false },
    { skeleton: 'khrn', glyphs: '\u{10907}\u{10913}\u{1090D}', spoken: 'horon', feminine: false },
    { skeleton: 'ssm', glyphs: '\u{1090E}\u{1090E}\u{1090C}', spoken: 'sasam', feminine: false },
];
export const BRIGHT_NAMES = ALL_NAMES.filter((n) => ['bghl', 'ghshtrt', "'shmn", 'mlqrt', 'tnt'].includes(n.skeleton));
export const DARK_NAMES = ALL_NAMES.filter((n) => ['rshp', 'khrn', 'ssm'].includes(n.skeleton));
export const DREAD_POWER = [
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
export const PO1_HEAD = {
    glyphs: '\u{1090B}\u{10907}\u{10914}\u{10915}',
    spoken: 'lakhashat',
};
export const PO2_HEAD = { glyphs: '\u{10900}\u{1090D}\u{1090A}', spoken: 'anok' };
export const PO3_HEAD = {
    glyphs: '\u{1090B}\u{10900}\u{10903}\u{1090D}',
    spoken: 'ladon',
};
export const THEOPHORIC_SKELETON = 'bghl';
export const THEOPHORIC_SPOKEN = 'baal';
export const IDIOM_WORDS = {
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
    ELDRITCH_CLOSE: [
        { glyphs: '\u{10910}\u{10915}\u{10907}', spoken: 'petokh' },
        { glyphs: '\u{10914}\u{1090F}\u{10913}', spoken: 'shoghur' },
        { glyphs: '\u{1090B}\u{1090F}\u{1090B}\u{1090C}', spoken: 'leolam' },
    ],
};
export const YT = { glyphs: '\u{10900}\u{10909}\u{10915}', spoken: 'et' };
export const SEAL_HEAD = { glyphs: '\u{10910}\u{1090F}\u{1090C}', spoken: 'paghom' };
export const PROCLITIC_SPOKEN = {
    l: 'le',
    b: 'be',
    w: 'we',
    h: 'ha',
};
export const PLURAL_SPOKEN = 'im';
export const FEMININE_SPOKEN = 'at';
export const INVOCATION_COME = ["bw'", 'ghny'];
