// Egyptian spec constants transcribed from docs/genomes.md section 3 so the
// contract tests stand independent of the implementation's own data tables.

export const SIGN_TABLE: ReadonlyArray<readonly [token: string, glyph: string]> = [
  ['A', '\u{1313F}'],
  ['i', '\u{131CB}'],
  ['y', '\u{131CC}'],
  ['a', '\u{1309D}'],
  ['w', '\u{13171}'],
  ['b', '\u{130C0}'],
  ['p', '\u{132AA}'],
  ['f', '\u{13191}'],
  ['m', '\u{13153}'],
  ['n', '\u{13216}'],
  ['r', '\u{1308B}'],
  ['h', '\u{13254}'],
  ['H', '\u{1339B}'],
  ['x', '\u{1340D}'],
  ['s', '\u{132F4}'],
  ['S', '\u{13219}'],
  ['q', '\u{1320E}'],
  ['k', '\u{133A1}'],
  ['g', '\u{133BC}'],
  ['t', '\u{133CF}'],
  ['T', '\u{1337F}'],
  ['d', '\u{130A7}'],
  ['D', '\u{13193}'],
];

export const DETERMINATIVE_TABLE: ReadonlyArray<readonly [gardiner: string, glyph: string]> = [
  ['A1', '\u{13000}'],
  ['A2', '\u{13001}'],
  ['A14', '\u{13010}'],
  ['R8', '\u{132B9}'],
  ['D4', '\u{13079}'],
  ['D40', '\u{130A1}'],
  ['D54', '\u{130BB}'],
  ['G37', '\u{1316A}'],
  ['N5', '\u{131F3}'],
  ['N14', '\u{131FC}'],
  ['O32', '\u{13280}'],
  ['Q7', '\u{132AE}'],
  ['R11', '\u{132BD}'],
  ['S34', '\u{132F9}'],
  ['U38', '\u{1335D}'],
  ['V17', '\u{13383}'],
  ['Y1', '\u{133DB}'],
  ['Y3', '\u{133DE}'],
  ['Z2', '\u{133E5}'],
];

export const IDIOM_SIGN_TABLE: ReadonlyArray<readonly [gardiner: string, glyph: string]> = [
  ['Z1', '\u{133E4}'],
  ['U28', '\u{13351}'],
  ['S43', '\u{13303}'],
  ['O50', '\u{13297}'],
  ['P8', '\u{132A4}'],
  ['Aa11', '\u{13419}'],
  ['V20', '\u{13386}'],
];

export const ALLOWED_CODEPOINTS: ReadonlySet<string> = new Set([
  ...SIGN_TABLE.map(([, glyph]) => glyph),
  ...DETERMINATIVE_TABLE.map(([, glyph]) => glyph),
  ...IDIOM_SIGN_TABLE.map(([, glyph]) => glyph),
]);

export const DETERMINATIVE_GLYPHS: ReadonlySet<string> = new Set(
  DETERMINATIVE_TABLE.map(([, glyph]) => glyph),
);

// Field determinatives of spec 3.3, keyed by the generator's field names.
export const FIELD_DET: Readonly<Record<string, string>> = {
  warding: '\u{13383}',
  harm: '\u{130A1}',
  summoning: '\u{13001}',
  hidden: '\u{133DB}',
  binding: '\u{132BD}',
  fire: '\u{132AE}',
  night: '\u{131FC}',
  death: '\u{13010}',
  gates: '\u{13280}',
  time: '\u{131F3}',
  sight: '\u{13079}',
  fate: '\u{1335D}',
  signs: '\u{133DE}',
  course: '\u{130BB}',
  beings: '\u{132B9}',
};

// The coined roots of spec 3.3: skeleton, spoken form, gloss, in table order.
export const LEXICON: Readonly<
  Record<string, ReadonlyArray<readonly [skeleton: string, spoken: string, gloss: string]>>
> = {
  warding: [
    ['mkA', 'meka', 'ward'],
    ['sAq', 'saq', 'guard over'],
    ['xwf', 'khuf', 'shield'],
    ['nbT', 'nebetj', 'encircle'],
    ['dnH', 'deneh', 'wing over'],
    ['Hsb', 'heseb', 'bar the way'],
    ['twr', 'tur', 'repel in purity'],
    ['xsf', 'khesef', 'drive back'],
    ['mnq', 'menq', 'make firm'],
    ['wDb', 'wedjeb', 'turn aside'],
  ],
  harm: [
    ['sqr', 'seqer', 'strike down'],
    ['xbd', 'khebed', 'afflict'],
    ['dSr', 'desher', 'make bleed'],
    ['nkn', 'neken', 'wound'],
    ['smA', 'sema', 'slay'],
    ['Hwy', 'huy', 'beat'],
    ['xAd', 'khad', 'seize cruelly'],
    ['ptx', 'petekh', 'cast down'],
    ['gbA', 'geba', 'cripple'],
    ['tks', 'tekes', 'pierce'],
  ],
  summoning: [
    ['nis', 'nis', 'call by name'],
    ['aS', 'ash', 'cry out to'],
    ['dbH', 'debeh', 'entreat'],
    ['sxpr', 'sekheper', 'bring into being'],
    ['iny', 'iny', 'fetch'],
    ['wxr', 'ukher', 'seek out'],
    ['spr', 'seper', 'petition'],
    ['sHn', 'sehen', 'commission'],
    ['mAT', 'matj', 'proclaim'],
    ['qmA', 'qema', 'call forth'],
  ],
  hidden: [
    ['imn', 'imen', 'hidden'],
    ['StA', 'sheta', 'secret'],
    ['HAp', 'hap', 'conceal'],
    ['kAp', 'kap', 'cover over'],
    ['sdx', 'sedekh', 'shroud'],
    ['bsy', 'besy', 'initiate into mystery'],
    ['sStA', 'sesheta', 'make secret'],
    ['qrf', 'qeref', 'enfold in dark'],
  ],
  binding: [
    ['qAs', 'qas', 'bind'],
    ['snH', 'seneh', 'fetter'],
    ['arq', 'areq', 'bind by oath'],
    ['dmA', 'dema', 'bind together'],
    ['xtm', 'khetem', 'seal'],
    ['mny', 'meny', 'moor fast'],
    ['TAs', 'tjas', 'knot'],
    ['inH', 'ineh', 'surround'],
    ['gAf', 'gaf', 'clench'],
    ['ndb', 'nedeb', 'rivet down'],
  ],
  fire: [
    ['xt', 'khet', 'fire'],
    ['sDt', 'sedjet', 'flame'],
    ['nsr', 'neser', 'blaze'],
    ['rkH', 'rekeh', 'burn'],
    ['nby', 'neby', 'flare'],
    ['Am', 'am', 'burn up'],
    ['wbd', 'webed', 'scorch'],
    ['tkA', 'teka', 'torch'],
    ['qrH', 'qereh', 'smolder'],
    ['psy', 'pesy', 'cook away'],
  ],
  night: [
    ['grH', 'gereh', 'night'],
    ['snk', 'senek', 'darkness'],
    ['wSA', 'usha', 'deep night'],
    ['xAwy', 'khawy', 'evening'],
    ['dwAt', 'duat', 'the world below'],
    ['iwx', 'iukh', 'gloom'],
    ['Sna', 'shena', 'storm-gloom'],
    ['mskt', 'mesket', 'night-barque'],
    ['qnH', 'qeneh', 'shrine-dark'],
  ],
  death: [
    ['mwt', 'mut', 'death'],
    ['qrs', 'qeres', 'bury'],
    ['imAx', 'imakh', 'the honored dead'],
    ['HfAw', 'hefau', 'grave-worm'],
    ['isft', 'isefet', 'dissolution'],
    ['nSp', 'neshep', 'last breath'],
    ['igrt', 'igeret', 'the silent land'],
    ['Htm', 'hetem', 'annihilate'],
  ],
  gates: [
    ['sbA', 'seba', 'portal'],
    ['sbxt', 'sebekhet', 'gateway'],
    ['aA', 'aa', 'door'],
    ['rwty', 'ruty', 'double gate'],
    ['arwt', 'arut', 'portal court'],
    ['TpHt', 'tjepehet', 'cavern mouth'],
    ['wAt', 'uat', 'road'],
    ['xnd', 'khened', 'threshold'],
  ],
  time: [
    ['wnwt', 'unut', 'hour'],
    ['nHH', 'neheh', 'endless time'],
    ['Dt', 'djet', 'eternity'],
    ['rk', 'rek', 'era'],
    ['hAw', 'hau', 'epoch'],
    ['sp', 'sep', 'occasion'],
    ['tr', 'ter', 'season'],
    ['aHaw', 'ahau', 'lifetime'],
    ['pAwt', 'paut', 'primeval time'],
    ['sf', 'sef', 'yesterday'],
  ],
  sight: [
    ['gmH', 'gemeh', 'glimpse'],
    ['sSm', 'seshem', 'show'],
    ['sHD', 'sehedj', 'illumine'],
    ['wbA', 'weba', 'disclose'],
    ['irt', 'iret', 'eye'],
    ['rswt', 'resut', 'dream'],
    ['sxA', 'sekha', 'call to mind'],
    ['nwty', 'nuty', 'watcher'],
    ['wHa', 'weha', 'unriddle'],
    ['mAa', 'maa', 'true'],
  ],
  fate: [
    ['SAy', 'shay', 'fate'],
    ['wD', 'wedj', 'decree'],
    ['mxAt', 'mekhat', 'balance'],
    ['ip', 'ip', 'reckoning'],
    ['nHb', 'neheb', 'allotment'],
    ['pHwy', 'pehuy', 'the end of it'],
    ['bAw', 'bau', 'manifest power'],
    ['xpr', 'kheper', 'what comes to pass'],
    ['mty', 'mety', 'unerring'],
    ['wpwt', 'weput', 'verdict sent'],
  ],
  course: [
    ['DA', 'dja', 'cross'],
    ['an', 'an', 'turn back'],
    ['As', 'as', 'hasten'],
    ['wsf', 'wesef', 'slow'],
    ['aHa', 'aha', 'halt'],
    ['Ts', 'tjes', 'lift out'],
    ['nmt', 'nemet', 'step'],
    ['Smt', 'shemet', 'course'],
    ['xAx', 'khakh', 'swift'],
    ['mAwy', 'mauy', 'renew'],
  ],
  signs: [
    ['sS', 'sesh', 'written sign'],
    ['mtr', 'meter', 'witness'],
    ['bik', 'bik', 'falcon'],
    ['Sdy', 'shedy', 'reading aloud'],
    ['wSd', 'weshed', 'question put'],
    ['wSb', 'wesheb', 'answer'],
    ['smi', 'semi', 'report'],
    ['psS', 'pesesh', 'divided lot'],
    ['xAy', 'khay', 'measuring out'],
    ['hn', 'hen', 'assent'],
  ],
  beings: [
    ['nTr', 'netjer', 'god'],
    ['kA', 'ka', 'the double that outlives the body'],
    ['bA', 'ba', 'the soul that travels'],
    ['Ax', 'akh', 'the transfigured dead'],
    ['Hm', 'hem', 'majesty'],
    ['Sms', 'shemes', 'follower of a god'],
    ['wr', 'wer', 'the great one'],
    ['Hnwt', 'henut', 'mistress'],
    ['sAw', 'sau', 'guardian'],
    ['tpy', 'tepy', 'the one who came before'],
  ],
};

// Attested power words of spec 3.7: skeleton, glyph string, spoken form.
export const POWER_TABLE: ReadonlyArray<
  readonly [skeleton: string, glyphs: string, spoken: string]
> = [
  ['HkA', '\u{1339B}\u{133A1}\u{1313F}\u{132B9}', 'heka'],
  ['ra', '\u{1308B}\u{1309D}\u{131F3}', 'ra'],
  ['DHwty', '\u{13193}\u{1339B}\u{13171}\u{133CF}\u{131CC}\u{132B9}', 'djehuty'],
  ['Ast', '\u{1313F}\u{132F4}\u{133CF}\u{132B9}', 'aset'],
  ['wsir', '\u{13171}\u{132F4}\u{131CB}\u{1308B}\u{132B9}', 'usir'],
  ['inpw', '\u{131CB}\u{13216}\u{132AA}\u{13171}\u{132B9}', 'inpu'],
  ['sxmt', '\u{132F4}\u{1340D}\u{13153}\u{133CF}\u{132B9}', 'sekhmet'],
  ['aApp', '\u{1309D}\u{1313F}\u{132AA}\u{13010}', 'aapep'],
];

export const BRIGHT_SPOKEN: ReadonlyArray<string> = POWER_TABLE.map(([, , spoken]) => spoken);

// Amun, the ninth name of spec 3.7. He arrived with Divination and is the one
// power the shipped schools never draw, so he stands outside POWER_TABLE.
export const IMEN_ROW: readonly [skeleton: string, glyphs: string, spoken: string] = [
  'imn',
  '\u{131CB}\u{13153}\u{13216}\u{132B9}',
  'imen',
];

// Horus, the tenth name of spec 3.7. He arrived with the Coptic ruling and is
// reached through the EO5 declaration alone, so he stands outside POWER_TABLE
// beside Amun.
export const HOR_ROW: readonly [skeleton: string, glyphs: string, spoken: string] = [
  'Hr',
  '\u{1339B}\u{1308B}\u{132B9}',
  'hor',
];

// The two powers a divination formula questions (spec 3.7).
export const DIVINATION_SPOKEN: ReadonlyArray<string> = ['djehuty', 'imen'];

// The four powers a caster may declare himself to be (spec 3.7).
export const ASSUMED_SPOKEN: ReadonlyArray<string> = ['heka', 'djehuty', 'aset', 'hor'];

// Dread epithet pool of spec 3.10: skeleton, spoken form, gloss.
export const DREAD_TABLE: ReadonlyArray<
  readonly [skeleton: string, spoken: string, gloss: string]
> = [
  ['xAxr', 'khokhur', 'the devourer at the threshold'],
  ['nqrx', 'nuqrukh', 'the gnawer in the dark'],
  ['TmAx', 'tjumokh', 'the buried hunger'],
  ['sSdx', 'sushdukh', 'the flash that blinds'],
  ['qbHx', 'qubhukh', 'the cold beneath the river'],
  ['wgpx', 'wugpukh', 'the breaker of names'],
  ['Hnbx', 'hunbukh', 'the sprawler at the gates'],
  ['dSrx', 'dushrukh', 'the red thirst'],
  ['iApx', 'iopukh', 'the coiled dark'],
  ['gnwx', 'gunukh', 'the silence that watches'],
];

export const DREAD_SPOKEN: ReadonlyArray<string> = DREAD_TABLE.map(([, spoken]) => spoken);

// Numerals and seal words of spec 3.8. The stroke is Z1, the ten is V20.
export const NUMERALS: Readonly<Record<number, readonly [glyphs: string, spoken: string]>> = {
  2: ['\u{133E4}\u{133E4}', 'senu'],
  3: ['\u{133E4}\u{133E4}\u{133E4}', 'khemet'],
  4: ['\u{133E4}\u{133E4}\u{133E4}\u{133E4}', 'fedu'],
  7: ['\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}', 'sefekh'],
  9: ['\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4}', 'pesedj'],
  12: ['\u{13386}\u{133E4}\u{133E4}', 'medj senu'],
};

export const SEAL_SIGN = '\u{13297}';
export const G37_EVIL = '\u{1316A}';
export const A14_ENEMY = '\u{13010}';
export const A1_MAN = '\u{13000}';
export const X_SIEVE = '\u{1340D}';

// Idiom spoken forms of spec 3.6 and 3.10.
export const EO1_SPOKEN: ReadonlyArray<string> = ['djed', 'medu'];
export const EO4_SPOKEN: ReadonlyArray<string> = ['ir', 'maa', 'em', 'resut'];
export const EC4_SPOKEN: ReadonlyArray<string> = ['iuef', 'pu'];
export const INIW_SPOKEN = 'iniu';
// The independent pronoun that opens EO5 (spec 3.4 and 3.6).
export const INK_GLYPHS = '\u{131CB}\u{13216}\u{133A1}';
export const INK_SPOKEN = 'inek';
// The return anchor and the four direction words of spec 3.6 and 3.4.
export const EC5_HEAD_SPOKEN: ReadonlyArray<string> = ['peret', 'em'];
export const DIRECTION_SPOKEN: Readonly<Record<string, string>> = {
  back: 'khenet',
  forth: 'emkhet',
  again: 'wehem',
  still: 'ger',
};
export const ELDRITCH_OPEN_SPOKEN: ReadonlyArray<string> = ['medu', 'djed'];
export const EO2_HEAD_SPOKEN: ReadonlyArray<string> = ['ra', 'en'];
export const EC1_SPOKEN: ReadonlyArray<string> = ['ankh', 'wedja', 'seneb'];
export const EC2_SPOKEN: ReadonlyArray<string> = ['maa', 'kheru'];
export const ELDRITCH_CLOSE_SPOKEN: ReadonlyArray<string> = ['isefet', 'djet'];

export const EO1_GLYPHS = '\u{13193}\u{130A7}\u{13303}';
export const EO4_GLYPHS =
  '\u{131CB}\u{1308B}\u{13079}\u{133E4}\u{13153}\u{1308B}\u{132F4}\u{13171}\u{133CF}\u{13079}';
export const EC4_GLYPHS = '\u{131CB}\u{13171}\u{13191}\u{132AA}\u{13171}';
export const INIW_GLYPHS = '\u{131CB}\u{13216}\u{131CB}\u{13171}';
export const EC5_HEAD_GLYPHS = '\u{132AA}\u{1308B}\u{133CF}\u{130BB}\u{13153}';
export const DIRECTION_GLYPHS: Readonly<Record<string, string>> = {
  back: '\u{1340D}\u{13216}\u{133CF}',
  forth: '\u{13153}\u{1340D}\u{133CF}',
  again: '\u{13171}\u{1339B}\u{13153}',
  still: '\u{133BC}\u{1308B}',
};
// The sedjem-en-ef writes the water ripple between the determinative and the
// suffix (spec 3.4).
export const SEDJEM_EN_EF_SUFFIX = '\u{13216}\u{13000}';
export const EC1_GLYPHS = '\u{132F9}\u{13351}\u{132F4}';
export const EC2_GLYPHS = '\u{13419}\u{132A4}';
export const ELDRITCH_CLOSE_GLYPHS =
  '\u{131CB}\u{132F4}\u{13191}\u{133CF}\u{13010}\u{1316A}\u{13193}\u{133CF}\u{131F3}\u{1316A}';
