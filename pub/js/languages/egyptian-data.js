export const SIGN_MAP = {
    A: '\u{1313F}',
    i: '\u{131CB}',
    y: '\u{131CC}',
    a: '\u{1309D}',
    w: '\u{13171}',
    b: '\u{130C0}',
    p: '\u{132AA}',
    f: '\u{13191}',
    m: '\u{13153}',
    n: '\u{13216}',
    r: '\u{1308B}',
    h: '\u{13254}',
    H: '\u{1339B}',
    x: '\u{1340D}',
    s: '\u{132F4}',
    S: '\u{13219}',
    q: '\u{1320E}',
    k: '\u{133A1}',
    g: '\u{133BC}',
    t: '\u{133CF}',
    T: '\u{1337F}',
    d: '\u{130A7}',
    D: '\u{13193}',
};
export const A1_MAN = '\u{13000}';
export const A2_SPEECH = '\u{13001}';
export const A14_ENEMY = '\u{13010}';
export const R8_GOD = '\u{132B9}';
export const D4_EYE = '\u{13079}';
export const D40_FORCE = '\u{130A1}';
export const D54_LEGS = '\u{130BB}';
export const G37_EVIL = '\u{1316A}';
export const N5_SUN = '\u{131F3}';
export const N14_STAR = '\u{131FC}';
export const O32_GATE = '\u{13280}';
export const Q7_BRAZIER = '\u{132AE}';
export const R11_DJED = '\u{132BD}';
export const S34_ANKH = '\u{132F9}';
export const V17_SHELTER = '\u{13383}';
export const Y1_ROLL = '\u{133DB}';
export const Z2_PLURAL = '\u{133E5}';
export const DETERMINATIVES = [
    A1_MAN,
    A2_SPEECH,
    A14_ENEMY,
    R8_GOD,
    D4_EYE,
    D40_FORCE,
    D54_LEGS,
    G37_EVIL,
    N5_SUN,
    N14_STAR,
    O32_GATE,
    Q7_BRAZIER,
    R11_DJED,
    S34_ANKH,
    V17_SHELTER,
    Y1_ROLL,
    Z2_PLURAL,
];
export const Z1_STROKE = '\u{133E4}';
export const U28_DRILL = '\u{13351}';
export const S43_STAFF = '\u{13303}';
export const O50_SEAL = '\u{13297}';
export const P8_OAR = '\u{132A4}';
export const AA11_PLATFORM = '\u{13419}';
export const V20_TEN = '\u{13386}';
export const IDIOM_SIGNS = [
    Z1_STROKE,
    U28_DRILL,
    S43_STAFF,
    O50_SEAL,
    P8_OAR,
    AA11_PLATFORM,
    V20_TEN,
];
export const FIELD_DET = {
    warding: V17_SHELTER,
    harm: D40_FORCE,
    summoning: A2_SPEECH,
    hidden: Y1_ROLL,
    binding: R11_DJED,
    fire: Q7_BRAZIER,
    night: N14_STAR,
    death: A14_ENEMY,
    gates: O32_GATE,
    time: N5_SUN,
};
export const FIELDS = {
    warding: [
        { skeleton: 'mkA', spoken: 'meka', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'sAq', spoken: 'saq', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'xwf', spoken: 'khuf', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'nbT', spoken: 'nebetj', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'dnH', spoken: 'deneh', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'Hsb', spoken: 'heseb', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'twr', spoken: 'tur', forms: ['verb', 'pp'] },
        { skeleton: 'xsf', spoken: 'khesef', forms: ['verb', 'pp'] },
        { skeleton: 'mnq', spoken: 'menq', forms: ['verb', 'pp'] },
        { skeleton: 'wDb', spoken: 'wedjeb', forms: ['verb', 'pp'] },
    ],
    harm: [
        { skeleton: 'sqr', spoken: 'seqer', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'xbd', spoken: 'khebed', forms: ['noun', 'verb', 'pp', 'adj'] },
        { skeleton: 'dSr', spoken: 'desher', forms: ['noun', 'verb', 'pp', 'adj'] },
        { skeleton: 'nkn', spoken: 'neken', forms: ['noun', 'verb', 'pp', 'adj'] },
        { skeleton: 'smA', spoken: 'sema', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'Hwy', spoken: 'huy', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'xAd', spoken: 'khad', forms: ['verb', 'pp'] },
        { skeleton: 'ptx', spoken: 'petekh', forms: ['verb', 'pp'] },
        { skeleton: 'gbA', spoken: 'geba', forms: ['verb', 'pp', 'adj'] },
        { skeleton: 'tks', spoken: 'tekes', forms: ['noun', 'verb', 'pp'] },
    ],
    summoning: [
        { skeleton: 'nis', spoken: 'nis', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'aS', spoken: 'ash', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'dbH', spoken: 'debeh', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'sxpr', spoken: 'sekheper', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'iny', spoken: 'iny', forms: ['verb', 'pp'] },
        { skeleton: 'wxr', spoken: 'ukher', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'spr', spoken: 'seper', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'sHn', spoken: 'sehen', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'mAT', spoken: 'matj', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'qmA', spoken: 'qema', forms: ['noun', 'verb', 'pp'] },
    ],
    hidden: [
        { skeleton: 'imn', spoken: 'imen', forms: ['noun', 'verb', 'pp', 'adj'] },
        { skeleton: 'StA', spoken: 'sheta', forms: ['noun', 'adj'] },
        { skeleton: 'HAp', spoken: 'hap', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'dgy', spoken: 'degy', forms: ['verb', 'pp'] },
        { skeleton: 'kAp', spoken: 'kap', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'sdx', spoken: 'sedekh', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'bsy', spoken: 'besy', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'sStA', spoken: 'sesheta', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'Tms', spoken: 'tjemes', forms: ['verb', 'pp'] },
        { skeleton: 'qrf', spoken: 'qeref', forms: ['noun', 'verb', 'pp'] },
    ],
    binding: [
        { skeleton: 'qAs', spoken: 'qas', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'snH', spoken: 'seneh', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'arq', spoken: 'areq', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'dmA', spoken: 'dema', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'xtm', spoken: 'khetem', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'mny', spoken: 'meny', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'TAs', spoken: 'tjas', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'inH', spoken: 'ineh', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'gAf', spoken: 'gaf', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'ndb', spoken: 'nedeb', forms: ['noun', 'verb', 'pp'] },
    ],
    fire: [
        { skeleton: 'xt', spoken: 'khet', forms: ['noun'] },
        { skeleton: 'sDt', spoken: 'sedjet', forms: ['noun'] },
        { skeleton: 'nsr', spoken: 'neser', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'rkH', spoken: 'rekeh', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'nby', spoken: 'neby', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'Am', spoken: 'am', forms: ['verb', 'pp'] },
        { skeleton: 'wbd', spoken: 'webed', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'tkA', spoken: 'teka', forms: ['noun'] },
        { skeleton: 'qrH', spoken: 'qereh', forms: ['noun', 'verb', 'pp'] },
        { skeleton: 'psy', spoken: 'pesy', forms: ['verb', 'pp'] },
    ],
    night: [
        { skeleton: 'grH', spoken: 'gereh', forms: ['noun'] },
        { skeleton: 'snk', spoken: 'senek', forms: ['noun', 'adj'] },
        { skeleton: 'wSA', spoken: 'usha', forms: ['noun'] },
        { skeleton: 'xAwy', spoken: 'khawy', forms: ['noun'] },
        { skeleton: 'dwAt', spoken: 'duat', forms: ['noun'] },
        { skeleton: 'iwx', spoken: 'iukh', forms: ['noun', 'adj'] },
        { skeleton: 'Sna', spoken: 'shena', forms: ['noun'] },
        { skeleton: 'mskt', spoken: 'mesket', forms: ['noun'] },
        { skeleton: 'sDr', spoken: 'sedjer', forms: ['verb', 'pp'] },
        { skeleton: 'qnH', spoken: 'qeneh', forms: ['noun', 'adj'] },
    ],
    death: [
        { skeleton: 'mwt', spoken: 'mut', forms: ['noun', 'adj'] },
        { skeleton: 'xpy', spoken: 'khepy', forms: ['verb', 'pp'] },
        { skeleton: 'sxr', spoken: 'sekher', forms: ['verb', 'pp'] },
        { skeleton: 'qrs', spoken: 'qeres', forms: ['noun', 'verb', 'pp', 'adj'] },
        { skeleton: 'imAx', spoken: 'imakh', forms: ['noun', 'adj'] },
        { skeleton: 'HfAw', spoken: 'hefau', forms: ['noun'] },
        { skeleton: 'isft', spoken: 'isefet', forms: ['noun'] },
        { skeleton: 'nSp', spoken: 'neshep', forms: ['noun'] },
        { skeleton: 'igrt', spoken: 'igeret', forms: ['noun'] },
        { skeleton: 'Htm', spoken: 'hetem', forms: ['noun', 'verb', 'pp'] },
    ],
    gates: [
        { skeleton: 'sbA', spoken: 'seba', forms: ['noun'] },
        { skeleton: 'sbxt', spoken: 'sebekhet', forms: ['noun'] },
        { skeleton: 'aA', spoken: 'aa', forms: ['noun'] },
        { skeleton: 'rwty', spoken: 'ruty', forms: ['noun'] },
        { skeleton: 'arwt', spoken: 'arut', forms: ['noun'] },
        { skeleton: 'TpHt', spoken: 'tjepehet', forms: ['noun'] },
        { skeleton: 'wAt', spoken: 'uat', forms: ['noun'] },
        { skeleton: 'xnd', spoken: 'khened', forms: ['noun'] },
        { skeleton: 'wpy', spoken: 'upy', forms: ['verb', 'pp'] },
        { skeleton: 'snS', spoken: 'senesh', forms: ['verb', 'pp'] },
    ],
    time: [
        { skeleton: 'wnwt', spoken: 'unut', forms: ['noun'] },
        { skeleton: 'nHH', spoken: 'neheh', forms: ['noun'] },
        { skeleton: 'Dt', spoken: 'djet', forms: ['noun'] },
        { skeleton: 'rk', spoken: 'rek', forms: ['noun'] },
        { skeleton: 'hAw', spoken: 'hau', forms: ['noun'] },
        { skeleton: 'sp', spoken: 'sep', forms: ['noun'] },
        { skeleton: 'tr', spoken: 'ter', forms: ['noun'] },
        { skeleton: 'aHaw', spoken: 'ahau', forms: ['noun'] },
        { skeleton: 'pAwt', spoken: 'paut', forms: ['noun'] },
        { skeleton: 'sf', spoken: 'sef', forms: ['noun'] },
    ],
};
export const BRIGHT_POWER = [
    { skeleton: 'HkA', glyphs: '\u{1339B}\u{133A1}\u{1313F}\u{132B9}', spoken: 'heka' },
    { skeleton: 'ra', glyphs: '\u{1308B}\u{1309D}\u{131F3}', spoken: 'ra' },
    { skeleton: 'DHwty', glyphs: '\u{13193}\u{1339B}\u{13171}\u{133CF}\u{131CC}\u{132B9}', spoken: 'djehuty' },
    { skeleton: 'Ast', glyphs: '\u{1313F}\u{132F4}\u{133CF}\u{132B9}', spoken: 'aset' },
    { skeleton: 'wsir', glyphs: '\u{13171}\u{132F4}\u{131CB}\u{1308B}\u{132B9}', spoken: 'usir' },
    { skeleton: 'inpw', glyphs: '\u{131CB}\u{13216}\u{132AA}\u{13171}\u{132B9}', spoken: 'inpu' },
    { skeleton: 'sxmt', glyphs: '\u{132F4}\u{1340D}\u{13153}\u{133CF}\u{132B9}', spoken: 'sekhmet' },
    { skeleton: 'aApp', glyphs: '\u{1309D}\u{1313F}\u{132AA}\u{13010}', spoken: 'aapep' },
];
export const AGENT_POWER = BRIGHT_POWER.filter((p) => p.skeleton !== 'aApp');
export const DREAD_POWER = [
    { skeleton: 'xAxr', spoken: 'khokhur' },
    { skeleton: 'nqrx', spoken: 'nuqrukh' },
    { skeleton: 'TmAx', spoken: 'tjumokh' },
    { skeleton: 'sSdx', spoken: 'sushdukh' },
    { skeleton: 'qbHx', spoken: 'qubhukh' },
    { skeleton: 'wgpx', spoken: 'wugpukh' },
    { skeleton: 'Hnbx', spoken: 'hunbukh' },
    { skeleton: 'dSrx', spoken: 'dushrukh' },
    { skeleton: 'iApx', spoken: 'iopukh' },
    { skeleton: 'gnwx', spoken: 'gunukh' },
];
export const FN_R = { glyphs: '\u{1308B}', spoken: 'er' };
export const FN_N = { glyphs: '\u{13216}', spoken: 'en' };
export const FN_M = { glyphs: '\u{13153}', spoken: 'em' };
export const FN_IN = { glyphs: '\u{131CB}\u{13216}', spoken: 'in' };
export const FN_IR = { glyphs: '\u{131CB}\u{1308B}', spoken: 'ir' };
export const FN_I = { glyphs: '\u{131CB}\u{13001}', spoken: 'i' };
export const FN_MY = { glyphs: '\u{13153}\u{131CC}', spoken: 'mi' };
export const RX_I = { glyphs: '\u{1308B}\u{1340D}\u{133DB}\u{13000}', spoken: 'rekhi' };
export const RX_K = { glyphs: '\u{1308B}\u{1340D}\u{133DB}\u{133A1}', spoken: 'rekhek' };
export const RN_K = { glyphs: '\u{1308B}\u{13216}\u{133E4}\u{133A1}', spoken: 'renek' };
export const RN_I = { glyphs: '\u{1308B}\u{13216}\u{133E4}\u{13000}', spoken: 'reni' };
export const SUFFIX_GLYPHS = {
    i: A1_MAN,
    k: '\u{133A1}',
    f: '\u{13191}',
    sn: `\u{132F4}\u{13216}${Z2_PLURAL}`,
};
export const SUFFIX_SKELETON = {
    i: 'i',
    k: 'k',
    f: 'f',
    sn: 'sn',
};
export const IDIOM_WORDS = {
    EO1: [
        { glyphs: '\u{13193}\u{130A7}', spoken: 'djed' },
        { glyphs: S43_STAFF, spoken: 'medu' },
    ],
    ELDRITCH_OPEN: [
        { glyphs: S43_STAFF, spoken: 'medu' },
        { glyphs: '\u{13193}\u{130A7}', spoken: 'djed' },
    ],
    EC1: [
        { glyphs: S34_ANKH, spoken: 'ankh' },
        { glyphs: U28_DRILL, spoken: 'wedja' },
        { glyphs: '\u{132F4}', spoken: 'seneb' },
    ],
    EC2: [
        { glyphs: AA11_PLATFORM, spoken: 'maa' },
        { glyphs: P8_OAR, spoken: 'kheru' },
    ],
    ELDRITCH_CLOSE: [
        {
            glyphs: `\u{131CB}\u{132F4}\u{13191}\u{133CF}${A14_ENEMY}${G37_EVIL}`,
            spoken: 'isefet',
        },
        { glyphs: `\u{13193}\u{133CF}${N5_SUN}${G37_EVIL}`, spoken: 'djet' },
    ],
};
export const EO2_HEAD = [
    { glyphs: `\u{1308B}${Z1_STROKE}`, spoken: 'ra' },
    FN_N,
];
export const NUMERAL_WORDS = {
    2: [{ glyphs: Z1_STROKE.repeat(2), spoken: 'senu' }],
    3: [{ glyphs: Z1_STROKE.repeat(3), spoken: 'khemet' }],
    4: [{ glyphs: Z1_STROKE.repeat(4), spoken: 'fedu' }],
    7: [{ glyphs: Z1_STROKE.repeat(7), spoken: 'sefekh' }],
    9: [{ glyphs: Z1_STROKE.repeat(9), spoken: 'pesedj' }],
    12: [
        { glyphs: V20_TEN, spoken: 'medj' },
        { glyphs: Z1_STROKE.repeat(2), spoken: 'senu' },
    ],
};
export const SEAL_HEAD = { glyphs: O50_SEAL, spoken: 'sep' };
export const SEAL_COUNTS = [2, 3, 4, 7, 9, 12];
