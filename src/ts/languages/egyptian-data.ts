// Egyptian genome data, transcribed from docs/genomes.md section 3. Every
// skeleton, spoken form, gloss, idiom, power word and codepoint comes from
// the spec. The noun, verb, pp and adj fields are the generator's English
// gloss forms for the roles a root can fill. A root without a form for a
// role is never drawn for that role.

import type { SemanticField } from '../generator/types.js';

// Uniliteral phonograms (spec 3.1). Manuel de Codage tokens are case
// sensitive, so H, x, S, T and D are distinct keys from h, s, t and d.
export const SIGN_MAP: Readonly<Record<string, string>> = {
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

// Logograms and determinatives (spec 3.1).
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

export const DETERMINATIVES: ReadonlyArray<string> = [
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

// Closed idiom signs (spec 3.1): only the fixed idioms, suffix spellings and
// numerals use these, never open coinage.
export const Z1_STROKE = '\u{133E4}';
export const U28_DRILL = '\u{13351}';
export const S43_STAFF = '\u{13303}';
export const O50_SEAL = '\u{13297}';
export const P8_OAR = '\u{132A4}';
export const AA11_PLATFORM = '\u{13419}';
export const V20_TEN = '\u{13386}';

export const IDIOM_SIGNS: ReadonlyArray<string> = [
  Z1_STROKE,
  U28_DRILL,
  S43_STAFF,
  O50_SEAL,
  P8_OAR,
  AA11_PLATFORM,
  V20_TEN,
];

// Field determinatives (spec 3.3). Every root of a field takes this sign.
export const FIELD_DET: Readonly<Record<SemanticField, string>> = {
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

export interface EgyptianRoot {
  // Consonant skeleton in Manuel de Codage tokens.
  skeleton: string;
  // Spoken form listed by the spec, which overrides the derivation of 3.2.
  spoken: string;
  gloss: string;
  noun?: string;
  verb?: string;
  pp?: string;
  adj?: string;
}

// Coined roots by semantic field (spec 3.3). Skeleton, spoken form and gloss
// are the spec's, the part-of-speech forms are the generator's gloss data.
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<EgyptianRoot>>> = {
  warding: [
    { skeleton: 'mkA', spoken: 'meka', gloss: 'ward', noun: 'warding', verb: 'ward', pp: 'warded' },
    { skeleton: 'sAq', spoken: 'saq', gloss: 'guard over', noun: 'guard', verb: 'guard', pp: 'guarded' },
    { skeleton: 'xwf', spoken: 'khuf', gloss: 'shield', noun: 'shield', verb: 'shield', pp: 'shielded' },
    { skeleton: 'nbT', spoken: 'nebetj', gloss: 'encircle', noun: 'encircling', verb: 'encircle', pp: 'encircled' },
    { skeleton: 'dnH', spoken: 'deneh', gloss: 'wing over', noun: 'wing', verb: 'wing over', pp: 'winged over' },
    { skeleton: 'Hsb', spoken: 'heseb', gloss: 'bar the way', noun: 'barrier', verb: 'bar the way', pp: 'barred' },
    { skeleton: 'twr', spoken: 'tur', gloss: 'repel in purity', verb: 'repel', pp: 'repelled' },
    { skeleton: 'xsf', spoken: 'khesef', gloss: 'drive back', verb: 'drive back', pp: 'driven back' },
    { skeleton: 'mnq', spoken: 'menq', gloss: 'make firm', verb: 'make firm', pp: 'made firm' },
    { skeleton: 'wDb', spoken: 'wedjeb', gloss: 'turn aside', verb: 'turn aside', pp: 'turned aside' },
  ],
  harm: [
    { skeleton: 'sqr', spoken: 'seqer', gloss: 'strike down', noun: 'blow', verb: 'strike down', pp: 'struck down' },
    { skeleton: 'xbd', spoken: 'khebed', gloss: 'afflict', noun: 'affliction', verb: 'afflict', pp: 'afflicted', adj: 'afflicted' },
    { skeleton: 'dSr', spoken: 'desher', gloss: 'make bleed', noun: 'bleeding', verb: 'make bleed', pp: 'made to bleed', adj: 'bloodied' },
    { skeleton: 'nkn', spoken: 'neken', gloss: 'wound', noun: 'wound', verb: 'wound', pp: 'wounded', adj: 'wounded' },
    { skeleton: 'smA', spoken: 'sema', gloss: 'slay', noun: 'slaughter', verb: 'slay', pp: 'slain' },
    { skeleton: 'Hwy', spoken: 'huy', gloss: 'beat', noun: 'beating', verb: 'beat', pp: 'beaten' },
    { skeleton: 'xAd', spoken: 'khad', gloss: 'seize cruelly', verb: 'seize cruelly', pp: 'seized' },
    { skeleton: 'ptx', spoken: 'petekh', gloss: 'cast down', verb: 'cast down', pp: 'cast down' },
    { skeleton: 'gbA', spoken: 'geba', gloss: 'cripple', verb: 'cripple', pp: 'crippled', adj: 'crippled' },
    { skeleton: 'tks', spoken: 'tekes', gloss: 'pierce', noun: 'piercing', verb: 'pierce', pp: 'pierced' },
  ],
  summoning: [
    { skeleton: 'nis', spoken: 'nis', gloss: 'call by name', noun: 'naming', verb: 'call by name', pp: 'called by name' },
    { skeleton: 'aS', spoken: 'ash', gloss: 'cry out to', noun: 'cry', verb: 'cry out to', pp: 'cried out to' },
    { skeleton: 'dbH', spoken: 'debeh', gloss: 'entreat', noun: 'entreaty', verb: 'entreat', pp: 'entreated' },
    { skeleton: 'sxpr', spoken: 'sekheper', gloss: 'bring into being', noun: 'becoming', verb: 'bring into being', pp: 'brought into being' },
    { skeleton: 'iny', spoken: 'iny', gloss: 'fetch', verb: 'fetch', pp: 'fetched' },
    { skeleton: 'wxr', spoken: 'ukher', gloss: 'seek out', noun: 'search', verb: 'seek out', pp: 'sought out' },
    { skeleton: 'spr', spoken: 'seper', gloss: 'petition', noun: 'petition', verb: 'petition', pp: 'petitioned' },
    { skeleton: 'sHn', spoken: 'sehen', gloss: 'commission', noun: 'commission', verb: 'commission', pp: 'commissioned' },
    { skeleton: 'mAT', spoken: 'matj', gloss: 'proclaim', noun: 'proclamation', verb: 'proclaim', pp: 'proclaimed' },
    { skeleton: 'qmA', spoken: 'qema', gloss: 'call forth', noun: 'calling forth', verb: 'call forth', pp: 'called forth' },
  ],
  hidden: [
    { skeleton: 'imn', spoken: 'imen', gloss: 'hidden', noun: 'hidden thing', verb: 'hide', pp: 'hidden', adj: 'hidden' },
    { skeleton: 'StA', spoken: 'sheta', gloss: 'secret', noun: 'secret', adj: 'secret' },
    { skeleton: 'HAp', spoken: 'hap', gloss: 'conceal', noun: 'concealment', verb: 'conceal', pp: 'concealed' },
    { skeleton: 'dgy', spoken: 'degy', gloss: 'hide away', verb: 'hide away', pp: 'hidden away' },
    { skeleton: 'kAp', spoken: 'kap', gloss: 'cover over', noun: 'cover', verb: 'cover over', pp: 'covered over' },
    { skeleton: 'sdx', spoken: 'sedekh', gloss: 'shroud', noun: 'shroud', verb: 'shroud', pp: 'shrouded' },
    { skeleton: 'bsy', spoken: 'besy', gloss: 'initiate into mystery', noun: 'mystery', verb: 'initiate', pp: 'initiated' },
    { skeleton: 'sStA', spoken: 'sesheta', gloss: 'make secret', noun: 'secret rite', verb: 'make secret', pp: 'made secret' },
    { skeleton: 'Tms', spoken: 'tjemes', gloss: 'bury from sight', verb: 'bury from sight', pp: 'buried from sight' },
    { skeleton: 'qrf', spoken: 'qeref', gloss: 'enfold in dark', noun: 'enfolding dark', verb: 'enfold', pp: 'enfolded' },
  ],
  binding: [
    { skeleton: 'qAs', spoken: 'qas', gloss: 'bind', noun: 'binding', verb: 'bind', pp: 'bound' },
    { skeleton: 'snH', spoken: 'seneh', gloss: 'fetter', noun: 'fetter', verb: 'fetter', pp: 'fettered' },
    { skeleton: 'arq', spoken: 'areq', gloss: 'bind by oath', noun: 'oath', verb: 'bind by oath', pp: 'bound by oath' },
    { skeleton: 'dmA', spoken: 'dema', gloss: 'bind together', noun: 'bundle', verb: 'bind together', pp: 'bound together' },
    { skeleton: 'xtm', spoken: 'khetem', gloss: 'seal', noun: 'seal', verb: 'seal', pp: 'sealed' },
    { skeleton: 'mny', spoken: 'meny', gloss: 'moor fast', noun: 'mooring post', verb: 'moor fast', pp: 'moored fast' },
    { skeleton: 'TAs', spoken: 'tjas', gloss: 'knot', noun: 'knot', verb: 'knot', pp: 'knotted' },
    { skeleton: 'inH', spoken: 'ineh', gloss: 'surround', noun: 'surrounding', verb: 'surround', pp: 'surrounded' },
    { skeleton: 'gAf', spoken: 'gaf', gloss: 'clench', noun: 'clench', verb: 'clench', pp: 'clenched' },
    { skeleton: 'ndb', spoken: 'nedeb', gloss: 'rivet down', noun: 'rivet', verb: 'rivet down', pp: 'riveted down' },
  ],
  fire: [
    { skeleton: 'xt', spoken: 'khet', gloss: 'fire', noun: 'fire' },
    { skeleton: 'sDt', spoken: 'sedjet', gloss: 'flame', noun: 'flame' },
    { skeleton: 'nsr', spoken: 'neser', gloss: 'blaze', noun: 'blaze', verb: 'blaze', pp: 'blazed' },
    { skeleton: 'rkH', spoken: 'rekeh', gloss: 'burn', noun: 'burning', verb: 'burn', pp: 'burned' },
    { skeleton: 'nby', spoken: 'neby', gloss: 'flare', noun: 'flare', verb: 'flare', pp: 'flared' },
    { skeleton: 'Am', spoken: 'am', gloss: 'burn up', verb: 'burn up', pp: 'burned up' },
    { skeleton: 'wbd', spoken: 'webed', gloss: 'scorch', noun: 'scorching', verb: 'scorch', pp: 'scorched' },
    { skeleton: 'tkA', spoken: 'teka', gloss: 'torch', noun: 'torch' },
    { skeleton: 'qrH', spoken: 'qereh', gloss: 'smolder', noun: 'smoldering', verb: 'smolder', pp: 'smoldered' },
    { skeleton: 'psy', spoken: 'pesy', gloss: 'cook away', verb: 'cook away', pp: 'cooked away' },
  ],
  night: [
    { skeleton: 'grH', spoken: 'gereh', gloss: 'night', noun: 'night' },
    { skeleton: 'snk', spoken: 'senek', gloss: 'darkness', noun: 'darkness', adj: 'dark' },
    { skeleton: 'wSA', spoken: 'usha', gloss: 'deep night', noun: 'deep night' },
    { skeleton: 'xAwy', spoken: 'khawy', gloss: 'evening', noun: 'evening' },
    { skeleton: 'dwAt', spoken: 'duat', gloss: 'the world below', noun: 'world below' },
    { skeleton: 'iwx', spoken: 'iukh', gloss: 'gloom', noun: 'gloom', adj: 'gloomy' },
    { skeleton: 'Sna', spoken: 'shena', gloss: 'storm-gloom', noun: 'storm-gloom' },
    { skeleton: 'mskt', spoken: 'mesket', gloss: 'night-barque', noun: 'night-barque' },
    { skeleton: 'sDr', spoken: 'sedjer', gloss: 'lie through the night', verb: 'lie through the night', pp: 'laid through the night' },
    { skeleton: 'qnH', spoken: 'qeneh', gloss: 'shrine-dark', noun: 'shrine-dark', adj: 'shrine-dark' },
  ],
  death: [
    { skeleton: 'mwt', spoken: 'mut', gloss: 'death', noun: 'death', adj: 'dead' },
    { skeleton: 'xpy', spoken: 'khepy', gloss: 'pass away', verb: 'pass away', pp: 'passed away' },
    { skeleton: 'sxr', spoken: 'sekher', gloss: 'lay low', verb: 'lay low', pp: 'laid low' },
    { skeleton: 'qrs', spoken: 'qeres', gloss: 'bury', noun: 'burial', verb: 'bury', pp: 'buried', adj: 'buried' },
    { skeleton: 'imAx', spoken: 'imakh', gloss: 'the honored dead', noun: 'honored dead', adj: 'honored' },
    { skeleton: 'HfAw', spoken: 'hefau', gloss: 'grave-worm', noun: 'grave-worm' },
    { skeleton: 'isft', spoken: 'isefet', gloss: 'dissolution', noun: 'dissolution' },
    { skeleton: 'nSp', spoken: 'neshep', gloss: 'last breath', noun: 'last breath' },
    { skeleton: 'igrt', spoken: 'igeret', gloss: 'the silent land', noun: 'silent land' },
    { skeleton: 'Htm', spoken: 'hetem', gloss: 'annihilate', noun: 'annihilation', verb: 'annihilate', pp: 'annihilated' },
  ],
  gates: [
    { skeleton: 'sbA', spoken: 'seba', gloss: 'portal', noun: 'portal' },
    { skeleton: 'sbxt', spoken: 'sebekhet', gloss: 'gateway', noun: 'gateway' },
    { skeleton: 'aA', spoken: 'aa', gloss: 'door', noun: 'door' },
    { skeleton: 'rwty', spoken: 'ruty', gloss: 'double gate', noun: 'double gate' },
    { skeleton: 'arwt', spoken: 'arut', gloss: 'portal court', noun: 'portal court' },
    { skeleton: 'TpHt', spoken: 'tjepehet', gloss: 'cavern mouth', noun: 'cavern mouth' },
    { skeleton: 'wAt', spoken: 'uat', gloss: 'road', noun: 'road' },
    { skeleton: 'xnd', spoken: 'khened', gloss: 'threshold', noun: 'threshold' },
    { skeleton: 'wpy', spoken: 'upy', gloss: 'open', verb: 'open', pp: 'opened' },
    { skeleton: 'snS', spoken: 'senesh', gloss: 'throw open', verb: 'throw open', pp: 'thrown open' },
  ],
  time: [
    { skeleton: 'wnwt', spoken: 'unut', gloss: 'hour', noun: 'hour' },
    { skeleton: 'nHH', spoken: 'neheh', gloss: 'endless time', noun: 'endless time' },
    { skeleton: 'Dt', spoken: 'djet', gloss: 'eternity', noun: 'eternity' },
    { skeleton: 'rk', spoken: 'rek', gloss: 'era', noun: 'era' },
    { skeleton: 'hAw', spoken: 'hau', gloss: 'epoch', noun: 'epoch' },
    { skeleton: 'sp', spoken: 'sep', gloss: 'occasion', noun: 'occasion' },
    { skeleton: 'tr', spoken: 'ter', gloss: 'season', noun: 'season' },
    { skeleton: 'aHaw', spoken: 'ahau', gloss: 'lifetime', noun: 'lifetime' },
    { skeleton: 'pAwt', spoken: 'paut', gloss: 'primeval time', noun: 'primeval time' },
    { skeleton: 'sf', spoken: 'sef', gloss: 'yesterday', noun: 'yesterday' },
  ],
};

export interface PowerWord {
  skeleton: string;
  glyphs: string;
  spoken: string;
  // Capitalized name used in the gloss line.
  name: string;
  gloss: string;
}

// Attested power words (spec 3.7), each written phonetically plus its listed
// determinative. The glyph strings are the spec's, sign for sign.
export const BRIGHT_POWER: ReadonlyArray<PowerWord> = [
  {
    skeleton: 'HkA',
    glyphs: '\u{1339B}\u{133A1}\u{1313F}\u{132B9}',
    spoken: 'heka',
    name: 'Heka',
    gloss: 'Heka, magic itself.',
  },
  {
    skeleton: 'ra',
    glyphs: '\u{1308B}\u{1309D}\u{131F3}',
    spoken: 'ra',
    name: 'Ra',
    gloss: 'Ra, the sun above.',
  },
  {
    skeleton: 'DHwty',
    glyphs: '\u{13193}\u{1339B}\u{13171}\u{133CF}\u{131CC}\u{132B9}',
    spoken: 'djehuty',
    name: 'Djehuty',
    gloss: 'Djehuty, lord of writing.',
  },
  {
    skeleton: 'Ast',
    glyphs: '\u{1313F}\u{132F4}\u{133CF}\u{132B9}',
    spoken: 'aset',
    name: 'Aset',
    gloss: 'Aset, great of magic.',
  },
  {
    skeleton: 'wsir',
    glyphs: '\u{13171}\u{132F4}\u{131CB}\u{1308B}\u{132B9}',
    spoken: 'usir',
    name: 'Usir',
    gloss: 'Usir, lord of the dead.',
  },
  {
    skeleton: 'inpw',
    glyphs: '\u{131CB}\u{13216}\u{132AA}\u{13171}\u{132B9}',
    spoken: 'inpu',
    name: 'Inpu',
    gloss: 'Inpu, opener of the ways.',
  },
  {
    skeleton: 'sxmt',
    glyphs: '\u{132F4}\u{1340D}\u{13153}\u{133CF}\u{132B9}',
    spoken: 'sekhmet',
    name: 'Sekhmet',
    gloss: 'Sekhmet, plague and shield.',
  },
  {
    skeleton: 'aApp',
    glyphs: '\u{1309D}\u{1313F}\u{132AA}\u{13010}',
    spoken: 'aapep',
    name: 'Aapep',
    gloss: 'Aapep, the serpent adversary.',
  },
];

// The in-agent slot invokes a power that acts for the caster, so the serpent
// adversary of the corpus stays out of it and remains a free power word.
export const AGENT_POWER: ReadonlyArray<PowerWord> = BRIGHT_POWER.filter(
  (p) => p.skeleton !== 'aApp',
);

export interface DreadEpithet {
  skeleton: string;
  spoken: string;
  gloss: string;
}

// Dread epithet pool of the Eldritch register (spec 3.10). All already end
// in x, so the guttural suffix rule adds nothing to them.
export const DREAD_POWER: ReadonlyArray<DreadEpithet> = [
  { skeleton: 'xAxr', spoken: 'khokhur', gloss: 'the devourer at the threshold' },
  { skeleton: 'nqrx', spoken: 'nuqrukh', gloss: 'the gnawer in the dark' },
  { skeleton: 'TmAx', spoken: 'tjumokh', gloss: 'the buried hunger' },
  { skeleton: 'sSdx', spoken: 'sushdukh', gloss: 'the flash that blinds' },
  { skeleton: 'qbHx', spoken: 'qubhukh', gloss: 'the cold beneath the river' },
  { skeleton: 'wgpx', spoken: 'wugpukh', gloss: 'the breaker of names' },
  { skeleton: 'Hnbx', spoken: 'hunbukh', gloss: 'the sprawler at the gates' },
  { skeleton: 'dSrx', spoken: 'dushrukh', gloss: 'the red thirst' },
  { skeleton: 'iApx', spoken: 'iopukh', gloss: 'the coiled dark' },
  { skeleton: 'gnwx', spoken: 'gunukh', gloss: 'the silence that watches' },
];

export interface FixedWord {
  glyphs: string;
  spoken: string;
}

// Function words and suffix pronouns (spec 3.4). None takes a determinative.
export const FN_R: FixedWord = { glyphs: '\u{1308B}', spoken: 'er' };
export const FN_N: FixedWord = { glyphs: '\u{13216}', spoken: 'en' };
export const FN_M: FixedWord = { glyphs: '\u{13153}', spoken: 'em' };
export const FN_IN: FixedWord = { glyphs: '\u{131CB}\u{13216}', spoken: 'in' };
export const FN_IR: FixedWord = { glyphs: '\u{131CB}\u{1308B}', spoken: 'ir' };
export const FN_I: FixedWord = { glyphs: '\u{131CB}\u{13001}', spoken: 'i' };
export const FN_MY: FixedWord = { glyphs: '\u{13153}\u{131CC}', spoken: 'mi' };

export const RX_I: FixedWord = { glyphs: '\u{1308B}\u{1340D}\u{133DB}\u{13000}', spoken: 'rekhi' };
export const RX_K: FixedWord = { glyphs: '\u{1308B}\u{1340D}\u{133DB}\u{133A1}', spoken: 'rekhek' };
export const RN_K: FixedWord = { glyphs: '\u{1308B}\u{13216}\u{133E4}\u{133A1}', spoken: 'renek' };
export const RN_I: FixedWord = { glyphs: '\u{1308B}\u{13216}\u{133E4}\u{13000}', spoken: 'reni' };

export type SuffixId = 'i' | 'k' | 'f' | 'sn';

// A suffix pronoun attaches after the verb's determinative (spec 3.4).
export const SUFFIX_GLYPHS: Readonly<Record<SuffixId, string>> = {
  i: A1_MAN,
  k: '\u{133A1}',
  f: '\u{13191}',
  sn: `\u{132F4}\u{13216}${Z2_PLURAL}`,
};

export const SUFFIX_SKELETON: Readonly<Record<SuffixId, string>> = {
  i: 'i',
  k: 'k',
  f: 'f',
  sn: 'sn',
};

export interface Idiom {
  words: ReadonlyArray<FixedWord>;
  gloss: string;
}

// Idiom templates (spec 3.6). EO2 and EO3 take a slot filled at realization,
// so they live as their fixed parts here.
export const EO1: Idiom = {
  words: [
    { glyphs: '\u{13193}\u{130A7}', spoken: 'djed' },
    { glyphs: S43_STAFF, spoken: 'medu' },
  ],
  gloss: 'Recitation.',
};

// EO1 read against its order is the Eldritch opener (spec 3.10).
export const ELDRITCH_OPEN: Idiom = {
  words: [
    { glyphs: S43_STAFF, spoken: 'medu' },
    { glyphs: '\u{13193}\u{130A7}', spoken: 'djed' },
  ],
  gloss: 'The rite spoken backwards.',
};

export const EO2_HEAD: ReadonlyArray<FixedWord> = [
  { glyphs: `\u{1308B}${Z1_STROKE}`, spoken: 'ra' },
  FN_N,
];

export const EC1: Idiom = {
  words: [
    { glyphs: S34_ANKH, spoken: 'ankh' },
    { glyphs: U28_DRILL, spoken: 'wedja' },
    { glyphs: '\u{132F4}', spoken: 'seneb' },
  ],
  gloss: 'Life, prosperity, health.',
};

export const EC2: Idiom = {
  words: [
    { glyphs: AA11_PLATFORM, spoken: 'maa' },
    { glyphs: P8_OAR, spoken: 'kheru' },
  ],
  gloss: 'True of voice.',
};

// The fixed Eldritch closing (spec 3.10): isft and Dt with the register's
// double determinatives, keeping their normal spoken forms.
export const ELDRITCH_CLOSE: Idiom = {
  words: [
    {
      glyphs: `\u{131CB}\u{132F4}\u{13191}\u{133CF}${A14_ENEMY}${G37_EVIL}`,
      spoken: 'isefet',
    },
    { glyphs: `\u{13193}\u{133CF}${N5_SUN}${G37_EVIL}`, spoken: 'djet' },
  ],
  gloss: 'Dissolution forever.',
};

export type SealCount = 2 | 3 | 4 | 7 | 9 | 12;

// Native numerals (spec 3.8): units are repeated strokes, ten is the hobble.
// The spoken column may hold two words, which stay two transliterated words.
export const NUMERAL_WORDS: Readonly<Record<SealCount, ReadonlyArray<FixedWord>>> = {
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

export const SEAL_HEAD: FixedWord = { glyphs: O50_SEAL, spoken: 'sep' };

export const SEAL_GLOSS: Readonly<Record<SealCount, string>> = {
  2: 'Recited two times.',
  3: 'Recited three times.',
  4: 'Recited four times.',
  7: 'Recited seven times.',
  9: 'Recited nine times.',
  12: 'Recited twelve times.',
};
