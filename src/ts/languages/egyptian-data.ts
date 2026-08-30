// Egyptian genome data, transcribed from docs/genomes.md section 3. Every
// skeleton, spoken form, idiom, power word and codepoint comes from the spec.
//
// What a root MEANS is not here. This file says which roles a root can fill,
// the gloss pack of the displayed language says how each role reads. The pack
// must cover exactly the forms declared here, no more and no less, which the
// pack completeness tests check.

import type { SemanticField, TimeDirection } from '../generator/types.js';
import type { RootForm } from '../glosses/types.js';

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
export const U38_BALANCE = '\u{1335D}';
export const V17_SHELTER = '\u{13383}';
export const Y1_ROLL = '\u{133DB}';
export const Y3_SCRIBE = '\u{133DE}';
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
  // The balance and the scribe's kit entered with Divination, which needs a
  // sign for what is decreed and one for what is read (spec 3.1).
  U38_BALANCE,
  V17_SHELTER,
  Y1_ROLL,
  Y3_SCRIBE,
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
  sight: D4_EYE,
  fate: U38_BALANCE,
  signs: Y3_SCRIBE,
  // The walking legs were in the sign table from the start and no field had
  // claimed them, which is exactly the sign a school of moving through time
  // wants (spec 3.1).
  course: D54_LEGS,
  // The netjer flag was declared with the first sign table, listed among the
  // determinatives, cut into the shipped font subset, and written by nothing
  // for five genomes: it was waiting for the field the Invocation widening
  // finally opened (spec 1.3, 3.3).
  beings: R8_GOD,
};

export interface EgyptianRoot {
  // Consonant skeleton in Manuel de Codage tokens.
  skeleton: string;
  // Spoken form listed by the spec, which overrides the derivation of 3.2.
  spoken: string;
  // Roles this root can fill. A role it does not declare is never drawn.
  forms: ReadonlyArray<RootForm>;
}

// Coined roots by semantic field (spec 3.3).
export const FIELDS: Readonly<Record<SemanticField, ReadonlyArray<EgyptianRoot>>> = {
  warding: [
    { skeleton: 'mkA', spoken: 'meka', forms: ['verb', 'pp'] },
    { skeleton: 'sAq', spoken: 'saq', forms: ['verb', 'pp'] },
    { skeleton: 'xwf', spoken: 'khuf', forms: ['verb', 'pp'] },
    { skeleton: 'nbT', spoken: 'nebetj', forms: ['verb', 'pp'] },
    { skeleton: 'dnH', spoken: 'deneh', forms: ['verb', 'pp'] },
    { skeleton: 'Hsb', spoken: 'heseb', forms: ['verb', 'pp'] },
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
    { skeleton: 'nis', spoken: 'nis', forms: ['verb', 'pp'] },
    { skeleton: 'aS', spoken: 'ash', forms: ['verb', 'pp'] },
    { skeleton: 'dbH', spoken: 'debeh', forms: ['verb', 'pp'] },
    { skeleton: 'sxpr', spoken: 'sekheper', forms: ['verb', 'pp'] },
    { skeleton: 'iny', spoken: 'iny', forms: ['verb', 'pp'] },
    { skeleton: 'wxr', spoken: 'ukher', forms: ['verb', 'pp'] },
    { skeleton: 'spr', spoken: 'seper', forms: ['verb', 'pp'] },
    { skeleton: 'sHn', spoken: 'sehen', forms: ['verb', 'pp'] },
    { skeleton: 'mAT', spoken: 'matj', forms: ['verb', 'pp'] },
    { skeleton: 'qmA', spoken: 'qema', forms: ['verb', 'pp'] },
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
    { skeleton: 'qAs', spoken: 'qas', forms: ['verb', 'pp'] },
    { skeleton: 'snH', spoken: 'seneh', forms: ['verb', 'pp'] },
    { skeleton: 'arq', spoken: 'areq', forms: ['verb', 'pp'] },
    { skeleton: 'dmA', spoken: 'dema', forms: ['verb', 'pp'] },
    { skeleton: 'xtm', spoken: 'khetem', forms: ['verb', 'pp'] },
    { skeleton: 'mny', spoken: 'meny', forms: ['verb', 'pp'] },
    { skeleton: 'TAs', spoken: 'tjas', forms: ['verb', 'pp'] },
    { skeleton: 'inH', spoken: 'ineh', forms: ['verb', 'pp'] },
    { skeleton: 'gAf', spoken: 'gaf', forms: ['verb', 'pp'] },
    { skeleton: 'ndb', spoken: 'nedeb', forms: ['verb', 'pp'] },
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
  // The three Divination fields (spec 3.3 and 3.11). No root declares a past
  // participle, no divination clause uses one, and a signs root is a noun
  // alone: the school reads a sign, it never conjugates one.
  sight: [
    { skeleton: 'gmH', spoken: 'gemeh', forms: ['verb'] },
    { skeleton: 'sSm', spoken: 'seshem', forms: ['noun', 'verb'] },
    { skeleton: 'sHD', spoken: 'sehedj', forms: ['verb'] },
    { skeleton: 'wbA', spoken: 'weba', forms: ['verb'] },
    { skeleton: 'irt', spoken: 'iret', forms: ['noun'] },
    { skeleton: 'rswt', spoken: 'resut', forms: ['noun'] },
    { skeleton: 'sxA', spoken: 'sekha', forms: ['verb'] },
    { skeleton: 'nwty', spoken: 'nuty', forms: ['noun'] },
    { skeleton: 'wHa', spoken: 'weha', forms: ['verb'] },
    { skeleton: 'mAa', spoken: 'maa', forms: ['adj'] },
  ],
  fate: [
    { skeleton: 'SAy', spoken: 'shay', forms: ['noun', 'adj'] },
    { skeleton: 'wD', spoken: 'wedj', forms: ['noun'] },
    { skeleton: 'mxAt', spoken: 'mekhat', forms: ['noun'] },
    { skeleton: 'ip', spoken: 'ip', forms: ['noun'] },
    { skeleton: 'nHb', spoken: 'neheb', forms: ['noun'] },
    { skeleton: 'pHwy', spoken: 'pehuy', forms: ['noun'] },
    { skeleton: 'bAw', spoken: 'bau', forms: ['noun'] },
    { skeleton: 'xpr', spoken: 'kheper', forms: ['noun'] },
    { skeleton: 'mty', spoken: 'mety', forms: ['adj'] },
    { skeleton: 'wpwt', spoken: 'weput', forms: ['noun'] },
  ],
  // The Chronomancy field (spec 3.3 and 3.12). No pp, every verb transitive,
  // every noun able to sit behind an article.
  course: [
    { skeleton: 'DA', spoken: 'dja', forms: ['verb'] },
    { skeleton: 'an', spoken: 'an', forms: ['verb'] },
    { skeleton: 'As', spoken: 'as', forms: ['verb'] },
    { skeleton: 'wsf', spoken: 'wesef', forms: ['verb'] },
    { skeleton: 'aHa', spoken: 'aha', forms: ['verb'] },
    { skeleton: 'Ts', spoken: 'tjes', forms: ['verb'] },
    { skeleton: 'nmt', spoken: 'nemet', forms: ['noun'] },
    { skeleton: 'Smt', spoken: 'shemet', forms: ['noun'] },
    { skeleton: 'xAx', spoken: 'khakh', forms: ['adj'] },
    { skeleton: 'mAwy', spoken: 'mauy', forms: ['verb', 'adj'] },
  ],
  signs: [
    { skeleton: 'sS', spoken: 'sesh', forms: ['noun'] },
    { skeleton: 'mtr', spoken: 'meter', forms: ['noun'] },
    { skeleton: 'bik', spoken: 'bik', forms: ['noun'] },
    { skeleton: 'Sdy', spoken: 'shedy', forms: ['noun'] },
    { skeleton: 'wSd', spoken: 'weshed', forms: ['noun'] },
    { skeleton: 'wSb', spoken: 'wesheb', forms: ['noun'] },
    { skeleton: 'smi', spoken: 'semi', forms: ['noun'] },
    { skeleton: 'psS', spoken: 'pesesh', forms: ['noun'] },
    { skeleton: 'xAy', spoken: 'khay', forms: ['noun'] },
    { skeleton: 'hn', spoken: 'hen', forms: ['noun'] },
  ],
  beings: [
    { skeleton: 'nTr', spoken: 'netjer', forms: ['noun'] },
    { skeleton: 'kA', spoken: 'ka', forms: ['noun'] },
    { skeleton: 'bA', spoken: 'ba', forms: ['noun'] },
    { skeleton: 'Ax', spoken: 'akh', forms: ['noun'] },
    { skeleton: 'Hm', spoken: 'hem', forms: ['noun'] },
    { skeleton: 'Sms', spoken: 'shemes', forms: ['noun'] },
    { skeleton: 'wr', spoken: 'wer', forms: ['noun'] },
    { skeleton: 'Hnwt', spoken: 'henut', forms: ['noun'] },
    { skeleton: 'sAw', spoken: 'sau', forms: ['noun'] },
    { skeleton: 'tpy', spoken: 'tepy', forms: ['noun'] },
  ],
};

export interface PowerWord {
  skeleton: string;
  glyphs: string;
  spoken: string;
}

// Attested power words (spec 3.7), each written phonetically plus its listed
// determinative. The glyph strings are the spec's, sign for sign.
export const BRIGHT_POWER: ReadonlyArray<PowerWord> = [
  { skeleton: 'HkA', glyphs: '\u{1339B}\u{133A1}\u{1313F}\u{132B9}', spoken: 'heka' },
  { skeleton: 'ra', glyphs: '\u{1308B}\u{1309D}\u{131F3}', spoken: 'ra' },
  { skeleton: 'DHwty', glyphs: '\u{13193}\u{1339B}\u{13171}\u{133CF}\u{131CC}\u{132B9}', spoken: 'djehuty' },
  { skeleton: 'Ast', glyphs: '\u{1313F}\u{132F4}\u{133CF}\u{132B9}', spoken: 'aset' },
  { skeleton: 'wsir', glyphs: '\u{13171}\u{132F4}\u{131CB}\u{1308B}\u{132B9}', spoken: 'usir' },
  { skeleton: 'inpw', glyphs: '\u{131CB}\u{13216}\u{132AA}\u{13171}\u{132B9}', spoken: 'inpu' },
  { skeleton: 'sxmt', glyphs: '\u{132F4}\u{1340D}\u{13153}\u{133CF}\u{132B9}', spoken: 'sekhmet' },
  { skeleton: 'aApp', glyphs: '\u{1309D}\u{1313F}\u{132AA}\u{13010}', spoken: 'aapep' },
];

// Amun, whose barque oracle answered the questions put to it (spec 3.7). He
// arrived with Divination and stays inside it: the schools that shipped before
// draw their powers from BRIGHT_POWER, which is unchanged.
export const IMEN: PowerWord = {
  skeleton: 'imn',
  glyphs: '\u{131CB}\u{13153}\u{13216}\u{132B9}',
  spoken: 'imen',
};

// Horus, the falcon child of the healing spells (spec 3.7). He arrived with
// the Coptic ruling and is reached through the EO5 declaration alone, so the
// pools every shipped school draws are the pools they drew before.
export const HOR: PowerWord = {
  skeleton: 'Hr',
  glyphs: '\u{1339B}\u{1308B}\u{132B9}',
  spoken: 'hor',
};

// Every attested name the packs must gloss, the eight of the shipped schools,
// the one Divination questions and the one only a declaration reaches.
export const ALL_POWER: ReadonlyArray<PowerWord> = [...BRIGHT_POWER, IMEN, HOR];

// The four powers a caster may declare himself to be (spec 3.7): the ones the
// corpus speaks as, never the ones it sends or coerces.
export const ASSUMED_POWER: ReadonlyArray<PowerWord> = [
  ...BRIGHT_POWER.filter(
    (p) => p.skeleton === 'HkA' || p.skeleton === 'DHwty' || p.skeleton === 'Ast',
  ),
  HOR,
];

// The god who writes and reckons, and the god whose oracle answered: the two
// powers a divination formula puts its question to (spec 3.7).
export const DIVINATION_POWER: ReadonlyArray<PowerWord> = [
  ...BRIGHT_POWER.filter((p) => p.skeleton === 'DHwty'),
  IMEN,
];

// The in-agent slot invokes a power that acts for the caster, so the serpent
// adversary of the corpus stays out of it and remains a free power word.
export const AGENT_POWER: ReadonlyArray<PowerWord> = BRIGHT_POWER.filter(
  (p) => p.skeleton !== 'aApp',
);

export interface DreadEpithet {
  skeleton: string;
  spoken: string;
}

// Dread epithet pool of the Eldritch register (spec 3.10). All already end
// in x, so the guttural suffix rule adds nothing to them.
export const DREAD_POWER: ReadonlyArray<DreadEpithet> = [
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

export interface FixedWord {
  glyphs: string;
  spoken: string;
}

// Function words and suffix pronouns (spec 3.4). None takes a determinative.
export const FN_R: FixedWord = { glyphs: '\u{1308B}', spoken: 'er' };
export const FN_N: FixedWord = { glyphs: '\u{13216}', spoken: 'en' };
export const FN_M: FixedWord = { glyphs: '\u{13153}', spoken: 'em' };
export const FN_IN: FixedWord = { glyphs: '\u{131CB}\u{13216}', spoken: 'in' };
// The question particle jn-jw, which opens a Divination asking clause and
// stands first in it (spec 3.4). It shares its first two signs with the agent
// marker, which is the language's own doing: position separates them.
export const FN_INIW: FixedWord = { glyphs: '\u{131CB}\u{13216}\u{131CB}\u{13171}', spoken: 'iniu' };
export const FN_IR: FixedWord = { glyphs: '\u{131CB}\u{1308B}', spoken: 'ir' };
export const FN_I: FixedWord = { glyphs: '\u{131CB}\u{13001}', spoken: 'i' };
// The independent pronoun jnk, "I am" (spec 3.4). It opens the EO5 self
// declaration and takes no determinative, as no function word does. Coptic
// kept it as anok, which is why 3.7 lets the device be written at all.
export const FN_INK: FixedWord = { glyphs: '\u{131CB}\u{13216}\u{133A1}', spoken: 'inek' };
export const FN_MY: FixedWord = { glyphs: '\u{13153}\u{131CC}', spoken: 'mi' };

export const RX_I: FixedWord = { glyphs: '\u{1308B}\u{1340D}\u{133DB}\u{13000}', spoken: 'rekhi' };
export const RX_K: FixedWord = { glyphs: '\u{1308B}\u{1340D}\u{133DB}\u{133A1}', spoken: 'rekhek' };
export const RN_K: FixedWord = { glyphs: '\u{1308B}\u{13216}\u{133E4}\u{133A1}', spoken: 'renek' };
export const RN_I: FixedWord = { glyphs: '\u{1308B}\u{13216}\u{133E4}\u{13000}', spoken: 'reni' };

// The last id is the sedjem-en-ef of spec 3.4, the form that states a thing
// done: the water ripple stands between the determinative and the suffix, and
// Chronomancy alone draws it.
export type SuffixId = 'i' | 'k' | 'f' | 'sn' | 'n.i';

// A suffix pronoun attaches after the verb's determinative (spec 3.4).
export const SUFFIX_GLYPHS: Readonly<Record<SuffixId, string>> = {
  i: A1_MAN,
  k: '\u{133A1}',
  f: '\u{13191}',
  sn: `\u{132F4}\u{13216}${Z2_PLURAL}`,
  'n.i': `\u{13216}${A1_MAN}`,
};

export const SUFFIX_SKELETON: Readonly<Record<SuffixId, string>> = {
  i: 'i',
  k: 'k',
  f: 'f',
  sn: 'sn',
  'n.i': 'ni',
};

// Four function words, Chronomancy only (spec 3.4), determinative free like
// the rest of that table. Backward is written with the word for in front:
// Egyptian puts what came before at the head.
export const DIRECTION_WORDS: Readonly<Record<TimeDirection, FixedWord>> = {
  back: { glyphs: '\u{1340D}\u{13216}\u{133CF}', spoken: 'khenet' },
  forth: { glyphs: '\u{13153}\u{1340D}\u{133CF}', spoken: 'emkhet' },
  again: { glyphs: '\u{13171}\u{1339B}\u{13153}', spoken: 'wehem' },
  still: { glyphs: '\u{133BC}\u{1308B}', spoken: 'ger' },
};

export type EgyptianIdiomId =
  | 'EO1'
  | 'EO4'
  | 'ELDRITCH_OPEN'
  | 'EC1'
  | 'EC2'
  | 'EC4'
  | 'ELDRITCH_CLOSE';

// Idiom word lists of spec 3.6 and 3.10. EO2 and EO3 take a slot filled at
// realization, so only their fixed parts live here. What each idiom says is in
// the packs, under the same id.
export const IDIOM_WORDS: Readonly<Record<EgyptianIdiomId, ReadonlyArray<FixedWord>>> = {
  EO1: [
    { glyphs: '\u{13193}\u{130A7}', spoken: 'djed' },
    { glyphs: S43_STAFF, spoken: 'medu' },
  ],
  // The Dream Book opener (spec 3.6), Divination only. mAA is written with the
  // eye plus the logogram stroke and rswt with the same eye as determinative,
  // both fixed idiom spellings that take no further sign.
  EO4: [
    FN_IR,
    { glyphs: `${D4_EYE}${Z1_STROKE}`, spoken: 'maa' },
    FN_M,
    { glyphs: `\u{1308B}\u{132F4}\u{13171}\u{133CF}${D4_EYE}`, spoken: 'resut' },
  ],
  // EO1 read against its order is the Eldritch opener (spec 3.10).
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
  // The scribal colophon (spec 3.6), read here as the verdict on the question.
  // Built from function-word signs alone, so it takes no determinative either.
  EC4: [
    { glyphs: '\u{131CB}\u{13171}\u{13191}', spoken: 'iuef' },
    { glyphs: '\u{132AA}\u{13171}', spoken: 'pu' },
  ],
  // The fixed Eldritch closing (spec 3.10): isft and Dt with the register's
  // double determinatives, keeping their normal spoken forms.
  ELDRITCH_CLOSE: [
    {
      glyphs: `\u{131CB}\u{132F4}\u{13191}\u{133CF}${A14_ENEMY}${G37_EVIL}`,
      spoken: 'isefet',
    },
    { glyphs: `\u{13193}\u{133CF}${N5_SUN}${G37_EVIL}`, spoken: 'djet' },
  ],
};

// EC5, the return anchor (spec 3.6): prt written with its phonograms plus the
// walking legs, then m, then a time-field anchor which carries its own N5.
export const EC5_HEAD: ReadonlyArray<FixedWord> = [
  { glyphs: `\u{132AA}\u{1308B}\u{133CF}${D54_LEGS}`, spoken: 'peret' },
  FN_M,
];

export const EO2_HEAD: ReadonlyArray<FixedWord> = [
  { glyphs: `\u{1308B}${Z1_STROKE}`, spoken: 'ra' },
  FN_N,
];

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

export const SEAL_COUNTS: ReadonlyArray<SealCount> = [2, 3, 4, 7, 9, 12];
