// Greek spec constants transcribed from docs/genomes.md section 8 so the
// contract tests stand independent of the implementation's own data tables.

export const LETTER_TABLE: ReadonlyArray<readonly [token: string, glyph: string]> = [
  ['a', 'Α'],
  ['b', 'Β'],
  ['g', 'Γ'],
  ['d', 'Δ'],
  ['e', 'Ε'],
  ['z', 'Ζ'],
  ['ee', 'Η'],
  ['th', 'Θ'],
  ['i', 'Ι'],
  ['k', 'Κ'],
  ['l', 'Λ'],
  ['m', 'Μ'],
  ['n', 'Ν'],
  ['ks', 'Ξ'],
  ['o', 'Ο'],
  ['p', 'Π'],
  ['r', 'Ρ'],
  ['s', 'Σ'],
  ['t', 'Τ'],
  ['u', 'Υ'],
  ['ph', 'Φ'],
  ['kh', 'Χ'],
  ['ps', 'Ψ'],
  ['oo', 'Ω'],
];

export const ANO_TELEIA = '·';
export const NUMERAL_SIGN = 'ʹ';
export const KOPPA = 'Ϟ';
// The unassigned codepoint between rho and sigma, which nothing may emit.
export const UNASSIGNED_SIGMA = '΢';

export const ALLOWED_CODEPOINTS: ReadonlySet<string> = new Set([
  ...LETTER_TABLE.map(([, glyph]) => glyph),
  ANO_TELEIA,
  NUMERAL_SIGN,
  KOPPA,
]);

// The coined roots of spec 8.3: root and dictionary gloss, in table order.
export const LEXICON: Readonly<
  Record<string, ReadonlyArray<readonly [root: string, gloss: string]>>
> = {
  warding: [
    ['phulak', 'guard'],
    ['alek', 'ward off'],
    ['skep', 'shelter'],
    ['teikh', 'wall'],
    ['thoorak', 'breastplate'],
    ['erk', 'barrier'],
    ['sooteer', 'savior'],
    ['amun', 'defend'],
    ['steph', 'crown'],
    ['alk', 'defense'],
  ],
  harm: [
    ['blab', 'harm'],
    ['pleeg', 'blow'],
    ['nos', 'sickness'],
    ['alg', 'pain'],
    ['phthor', 'ruin'],
    ['traumat', 'wound'],
    ['lup', 'grief'],
    ['olethr', 'destruction'],
    ['mastig', 'scourge'],
    ['pikr', 'bitter'],
  ],
  summoning: [
    ['kal', 'call'],
    ['kleez', 'name aloud'],
    ['kraug', 'shout'],
    ['elth', 'come'],
    ['ik', 'arrive'],
    ['zeet', 'seek'],
    ['eukh', 'prayer'],
    ['phoon', 'voice'],
    ['orm', 'onrush'],
    ['aggel', 'messenger'],
  ],
  hidden: [
    ['krupt', 'hide'],
    ['lathr', 'secretly'],
    ['musteer', 'mystery'],
    ['aporreet', 'forbidden thing'],
    ['kruph', 'concealment'],
    ['kalupt', 'veil'],
    ['sioop', 'silence'],
    ['ainigm', 'riddle'],
    ['buth', 'deep'],
    ['amaur', 'dim'],
  ],
  binding: [
    ['desm', 'bond'],
    ['sphrag', 'seal'],
    ['plek', 'plait'],
    ['zug', 'yoke'],
    ['alus', 'chain'],
    ['sphigg', 'bind tight'],
    ['ped', 'fetter'],
    ['katokh', 'holding spell'],
    ['kleithr', 'bolt'],
    ['sunekh', 'hold together'],
  ],
  fire: [
    ['pur', 'fire'],
    ['phlog', 'flame'],
    ['kaus', 'burn up'],
    ['anthrak', 'coal'],
    ['lamp', 'lamp'],
    ['aithal', 'smoke'],
    ['phleg', 'burn'],
    ['therm', 'heat'],
    ['spintheer', 'spark'],
    ['keraun', 'thunderbolt'],
  ],
  night: [
    ['nukt', 'night'],
    ['skot', 'darkness'],
    ['seleen', 'moon'],
    ['zoph', 'gloom'],
    ['oneir', 'dream'],
    ['melan', 'black'],
    ['esper', 'evening'],
    ['kneph', 'dusk'],
    ['astr', 'star'],
    ['upn', 'sleep'],
  ],
  death: [
    ['thanat', 'death'],
    ['nekr', 'corpse'],
    ['taph', 'tomb'],
    ['aid', 'house of the dead'],
    ['phthin', 'waste away'],
    ['keer', 'death-spirit'],
    ['psukh', 'shade'],
    ['sphag', 'slaughter'],
    ['tumb', 'burial mound'],
    ['leipsan', 'remains'],
  ],
  gates: [
    ['pul', 'gate'],
    ['thur', 'door'],
    ['od', 'road'],
    ['por', 'passage'],
    ['katabas', 'descent'],
    ['stom', 'mouth'],
    ['khasm', 'chasm'],
    ['gephur', 'bridge'],
    ['oud', 'threshold'],
    ['anoig', 'open'],
  ],
  time: [
    ['khron', 'time'],
    ['oor', 'hour'],
    ['aioon', 'age'],
    ['et', 'year'],
    ['eemer', 'day'],
    ['kair', 'due moment'],
    ['arkh', 'beginning'],
    ['tel', 'end'],
    ['meen', 'month'],
    ['eeoos', 'dawn'],
  ],
  sight: [
    ['or', 'see'],
    ['blep', 'behold'],
    ['opt', 'eye'],
    ['skop', 'watcher'],
    ['mant', 'seer'],
    ['deik', 'show'],
    ['phain', 'reveal'],
    ['saph', 'clear'],
    ['gnoos', 'knowledge'],
    ['propheet', 'prophet'],
  ],
  fate: [
    ['moir', 'allotted fate'],
    ['eimarmen', 'destiny'],
    ['anagk', 'necessity'],
    ['kleer', 'cast lot'],
    ['tukh', 'fortune'],
    ['aisim', 'fated'],
    ['nemes', 'apportionment'],
    ['asphal', 'unfailing'],
    ['klooth', 'spun thread'],
    ['orism', 'set bound'],
  ],
  signs: [
    ['seem', 'sign'],
    ['terat', 'portent'],
    ['khreesm', 'oracle-word'],
    ['sumbol', 'token'],
    ['ornith', 'bird of omen'],
    ['splagkhn', 'entrails'],
    ['graph', 'written mark'],
    ['pheem', 'utterance'],
    ['kleedon', 'chance word'],
    ['tekmeer', 'proof'],
  ],
  course: [
    ['diabain', 'cross'],
    ['streph', 'turning'],
    ['speud', 'hasten'],
    ['brad', 'slow'],
    ['paus', 'halt'],
    ['air', 'lift out'],
    ['drom', 'course'],
    ['beem', 'step'],
    ['takh', 'swift'],
    ['kain', 'renew'],
  ],
};

// Spec 8.3: the three roots that never fill a slot taking an object.
export const INTRANSITIVE: ReadonlyArray<string> = ['elth', 'ik', 'phthin'];

// Voces magicae of spec 8.7, romanization and glyph string.
export const POWER_TABLE: ReadonlyArray<readonly [word: string, glyphs: string]> = [
  ['iaoo', 'ΙΑΩ'],
  ['abrasaks', 'ΑΒΡΑΣΑΞ'],
  ['sabaooth', 'ΣΑΒΑΩΘ'],
  ['adoonai', 'ΑΔΩΝΑΙ'],
  ['ablanathanalba', 'ΑΒΛΑΝΑΘΑΝΑΛΒΑ'],
  ['semeseilam', 'ΣΕΜΕΣΕΙΛΑΜ'],
  ['akrammakhamarei', 'ΑΚΡΑΜΜΑΧΑΜΑΡΕΙ'],
  ['damnameneus', 'ΔΑΜΝΑΜΕΝΕΥΣ'],
  ['ereskhigal', 'ΕΡΕΣΧΙΓΑΛ'],
  ['nebutosoualeeth', 'ΝΕΒΥΤΟΣΟΥΑΛΗΘ'],
];

export const BRIGHT_WORDS: ReadonlyArray<string> = [
  'iaoo',
  'abrasaks',
  'sabaooth',
  'adoonai',
  'ablanathanalba',
  'semeseilam',
  'akrammakhamarei',
  'damnameneus',
];

export const DARK_WORDS: ReadonlyArray<string> = ['ereskhigal', 'nebutosoualeeth'];

// Dread epithets of spec 8.10, all ending in -OOTH.
export const DREAD_TABLE: ReadonlyArray<readonly [word: string, gloss: string]> = [
  ['ksargooth', 'the shape at the door'],
  ['thrugksooth', 'the throat of the deep'],
  ['borgmooth', 'the gnawer beneath'],
  ['psalkhooth', 'the whisper that unmakes'],
  ['khthonksooth', 'the weight under the ground'],
  ['murksathooth', 'the swarm without number'],
  ['gorguthooth', 'the eye that does not close'],
  ['sphigksooth', 'the coil that tightens'],
  ['nuktrapsooth', 'the night that reaches'],
  ['zophragksooth', 'the gloom that swallows'],
];

export const DREAD_WORDS: ReadonlyArray<string> = DREAD_TABLE.map(([word]) => word);

// Idiom word lists of spec 8.6 and 8.10.
export const GO1: ReadonlyArray<string> = ['phulakteerion'];
export const GO2: ReadonlyArray<string> = ['epikaloumai', 'se'];
export const GO3_SHORT: ReadonlyArray<string> = ['aski', 'kataski'];
export const GO3_FULL: ReadonlyArray<string> = [
  'aski',
  'kataski',
  'liks',
  'tetraks',
  'damnameneus',
  'aisia',
];
export const GO4: ReadonlyArray<string> = ['orkizoo', 'se'];
export const GO5: ReadonlyArray<string> = ['khreeson', 'moi'];
export const GO6: ReadonlyArray<string> = ['aioon', 'aioonos'];
export const GC1: ReadonlyArray<string> = ['eedee', 'eedee', 'takhu', 'takhu'];
export const GC2: ReadonlyArray<string> = ['genesthoo'];
export const GC3: ReadonlyArray<string> = ['ameen'];
export const GC4: ReadonlyArray<string> = ['outoos', 'ekhei'];
export const GC5_TAIL = 'eekoo';
export const ELDRITCH_OPEN_SHORT: ReadonlyArray<string> = ['kataski', 'aski'];
export const ELDRITCH_OPEN_FULL: ReadonlyArray<string> = [
  'aisia',
  'damnameneus',
  'tetraks',
  'liks',
  'kataski',
  'aski',
];
export const ELDRITCH_CLOSE: ReadonlyArray<string> = ['phthorooth', 'aioonooth'];

// Function words of spec 8.4.
export const FN_KATA = 'kata';
export const FN_EIS = 'eis';
export const FN_KAI = 'kai';
export const FN_ARA = 'ara';

// The four direction adverbs of spec 8.4.
export const DIRECTION_WORDS_SPEC: Readonly<Record<string, string>> = {
  back: 'opisoo',
  forth: 'prosoo',
  again: 'palin',
  still: 'atrema',
};

// The alphabetic numerals of spec 8.8, each closed by the numeral sign.
export const NUMERALS: Readonly<Record<number, readonly [glyphs: string, spoken: string]>> = {
  3: [`Γ${NUMERAL_SIGN}`, 'treis'],
  7: [`Ζ${NUMERAL_SIGN}`, 'epta'],
  9: [`Θ${NUMERAL_SIGN}`, 'ennea'],
  12: [`ΙΒ${NUMERAL_SIGN}`, 'doodeka'],
  99: [`${KOPPA}Θ${NUMERAL_SIGN}`, 'eneneekonta ennea'],
};

export const SEAL_HEAD_SPOKEN = 'lege';

// The aorist fusion table of spec 8.4, branch by branch.
export const AORIST_TABLE: ReadonlyArray<readonly [root: string, aorist: string]> = [
  ['sphrag', 'sphraksa'],
  ['lamp', 'lampsa'],
  ['krupt', 'krupsa'],
  ['desm', 'desmeesa'],
  ['paus', 'pauseesa'],
];
