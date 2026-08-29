// Latin spec constants transcribed from docs/genomes.md section 9 so the
// contract tests stand independent of the implementation's own data tables.
//
// The separator is the trap this genome records: U+00B7 MIDDLE DOT and U+0387
// GREEK ANO TELEIA draw the same picture, this project emits both, and the
// likeliest source of contamination is its own Greek output rendered on
// screen. Every one below is written as an escape and asserted by number.

export const LETTER_TABLE: ReadonlyArray<readonly [token: string, glyph: string]> = [
  ['a', 'A'],
  ['b', 'B'],
  ['c', 'C'],
  ['d', 'D'],
  ['e', 'E'],
  ['f', 'F'],
  ['g', 'G'],
  ['h', 'H'],
  ['i', 'I'],
  ['l', 'L'],
  ['m', 'M'],
  ['n', 'N'],
  ['o', 'O'],
  ['p', 'P'],
  ['q', 'Q'],
  ['r', 'R'],
  ['s', 'S'],
  ['t', 'T'],
  ['u', 'V'],
  ['v', 'V'],
  ['x', 'X'],
];

export const INTERPUNCT = '\u{00B7}';
// The look-alike the Greek genome writes, which this one must never emit.
export const ANO_TELEIA = '\u{0387}';

// The twenty capitals of spec 9.1, in table order. Twenty-one codepoints in
// all once the separator joins them, and the six letters left out are asserted
// against this set rather than listed twice.
export const CAPITALS: ReadonlyArray<string> = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X',
];

export const EXCLUDED_LETTERS: ReadonlyArray<string> = ['J', 'K', 'U', 'W', 'Y', 'Z'];

export const ALLOWED_CODEPOINTS: ReadonlySet<string> = new Set([...CAPITALS, INTERPUNCT]);

// The selected roots of spec 9.3: root, the real Latin word it is cut from,
// and its dictionary gloss, in table order.
export const LEXICON: Readonly<
  Record<string, ReadonlyArray<readonly [root: string, word: string, gloss: string]>>
> = {
  warding: [
    ['serv', 'servare', 'guard'],
    ['tutel', 'tutela', 'guardian'],
    ['geni', 'genius', 'guardian spirit'],
    ['mur', 'murus', 'wall'],
    ['clipe', 'clipeus', 'shield'],
    ['vall', 'vallus', 'palisade'],
    ['praesidi', 'praesidium', 'stronghold'],
    ['firm', 'firmare', 'make fast'],
    ['arm', 'armare', 'arm'],
    ['obser', 'obserare', 'bolt shut'],
  ],
  harm: [
    ['vex', 'vexare', 'torment'],
    ['damn', 'damnare', 'condemn'],
    ['vulner', 'vulnerare', 'wound'],
    ['nec', 'necare', 'slay'],
    ['flagell', 'flagellare', 'scourge'],
    ['morb', 'morbus', 'sickness'],
    ['ruin', 'ruina', 'ruin'],
    ['nox', 'noxa', 'harm'],
    ['amar', 'amarus', 'bitter'],
    ['dir', 'dirus', 'dread'],
  ],
  summoning: [
    ['voc', 'vocare', 'call'],
    ['evoc', 'evocare', 'call forth'],
    ['clam', 'clamare', 'proclaim'],
    ['invit', 'invitare', 'invite'],
    ['rog', 'rogare', 'entreat'],
    ['flagit', 'flagitare', 'demand'],
    ['incant', 'incantare', 'chant over'],
    ['nunti', 'nuntius', 'messenger'],
    ['proper', 'properare', 'hasten near'],
    ['advol', 'advolare', 'fly hither'],
  ],
  hidden: [
    ['cel', 'celare', 'hide'],
    ['occult', 'occultare', 'conceal'],
    ['vel', 'velum', 'veil'],
    ['latebr', 'latebra', 'hiding place'],
    ['cavern', 'caverna', 'hollow'],
    ['susurr', 'susurrus', 'whisper'],
    ['secret', 'secretum', 'secret'],
    ['arcan', 'arcanum', 'mystery'],
    ['silenti', 'silentium', 'silence'],
    ['profund', 'profundum', 'the deep'],
  ],
  binding: [
    ['lig', 'ligare', 'bind'],
    ['oblig', 'obligare', 'bind fast'],
    ['nod', 'nodus', 'knot'],
    ['vincul', 'vinculum', 'bond'],
    ['caten', 'catena', 'chain'],
    ['obsign', 'obsignare', 'seal'],
    ['sigill', 'sigillum', 'seal'],
    ['fren', 'frenum', 'bridle'],
    ['ser', 'sera', 'door-bar'],
    ['clav', 'clavus', 'nail'],
  ],
  fire: [
    ['flamm', 'flamma', 'flame'],
    ['crem', 'cremare', 'burn up'],
    ['ustul', 'ustulare', 'scorch'],
    ['flagr', 'flagrare', 'blaze'],
    ['favill', 'favilla', 'ember'],
    ['scintill', 'scintilla', 'spark'],
    ['prun', 'pruna', 'live coal'],
    ['fum', 'fumus', 'smoke'],
    ['lucern', 'lucerna', 'lamp'],
    ['bust', 'bustum', 'pyre'],
  ],
  night: [
    ['lun', 'luna', 'moon'],
    ['stell', 'stella', 'star'],
    ['umbr', 'umbra', 'shadow'],
    ['nebul', 'nebula', 'mist'],
    ['somn', 'somnus', 'sleep'],
    ['crepuscul', 'crepusculum', 'twilight'],
    ['brum', 'bruma', 'midwinter night'],
    ['obscur', 'obscurus', 'dark'],
    ['furv', 'furvus', 'black'],
    ['nocturn', 'nocturnus', 'nocturnal'],
  ],
  death: [
    ['let', 'letum', 'death'],
    ['sepulcr', 'sepulcrum', 'tomb'],
    ['larv', 'larva', 'ghost'],
    ['tumul', 'tumulus', 'burial mound'],
    ['simulacr', 'simulacrum', 'phantom'],
    ['urn', 'urna', 'urn'],
    ['defunct', 'defunctus', 'dead'],
    ['funest', 'funestus', 'deathly'],
    ['trucid', 'trucidare', 'slaughter'],
    ['immol', 'immolare', 'sacrifice'],
  ],
  gates: [
    ['port', 'porta', 'gate'],
    ['ianu', 'ianua', 'door'],
    ['osti', 'ostium', 'doorway'],
    ['vi', 'via', 'road'],
    ['semit', 'semita', 'path'],
    ['fenestr', 'fenestra', 'window'],
    ['claustr', 'claustrum', 'barred passage'],
    ['vestibul', 'vestibulum', 'forecourt'],
    ['postic', 'posticum', 'back door'],
    ['reser', 'reserare', 'unbar'],
  ],
  time: [
    ['hor', 'hora', 'hour'],
    ['auror', 'aurora', 'dawn'],
    ['ann', 'annus', 'year'],
    ['saecul', 'saeculum', 'age'],
    ['aev', 'aevum', 'unending age'],
    ['moment', 'momentum', 'moment'],
    ['crastin', 'crastinum', 'morrow'],
    ['initi', 'initium', 'beginning'],
    ['termin', 'terminus', 'end'],
    ['aetern', 'aeternum', 'eternity'],
  ],
  sight: [
    ['spect', 'spectare', 'watch'],
    ['observ', 'observare', 'observe'],
    ['monstr', 'monstrare', 'show'],
    ['revel', 'revelare', 'unveil'],
    ['lustr', 'lustrare', 'survey'],
    ['explor', 'explorare', 'search out'],
    ['divin', 'divinus', 'diviner'],
    ['sortileg', 'sortilegus', 'lot-reader'],
    ['ocul', 'oculus', 'eye'],
    ['hariol', 'hariolus', 'soothsayer'],
    ['clar', 'clarus', 'clear'],
    ['laev', 'laevus', 'left-hand'],
    ['faust', 'faustus', 'auspicious'],
  ],
  fate: [
    ['fat', 'fatum', 'fate'],
    ['fortun', 'fortuna', 'fortune'],
    ['fil', 'filum', 'thread'],
    ['pens', 'pensum', 'allotted portion'],
    ['decret', 'decretum', 'decree'],
    ['iudici', 'iudicium', 'judgment'],
    ['genitur', 'genitura', 'birth-star'],
    ['destin', 'destinatus', 'destined'],
    ['cert', 'certus', 'certain'],
    ['fatidic', 'fatidicus', 'fate-speaking'],
  ],
  signs: [
    ['sign', 'signum', 'sign'],
    ['portent', 'portentum', 'portent'],
    ['oracul', 'oraculum', 'oracle'],
    ['auguri', 'augurium', 'augury'],
    ['praesagi', 'praesagium', 'presage'],
    ['respons', 'responsum', 'answer'],
    ['aquil', 'aquila', 'eagle'],
    ['corv', 'corvus', 'raven'],
    ['fibr', 'fibra', 'entrail-sign'],
    ['fiss', 'fissum', 'cleft'],
    ['hosti', 'hostia', 'sacrificial victim'],
    ['astr', 'astrum', 'star-sign'],
    ['cael', 'caelum', 'sky'],
  ],
  course: [
    ['super', 'superare', 'overpass'],
    ['revoc', 'revocare', 'call back'],
    ['festin', 'festinare', 'hasten'],
    ['tard', 'tardare', 'slow'],
    ['retent', 'retentare', 'hold back'],
    ['nov', 'novare', 'renew'],
    ['rapid', 'rapidus', 'swift'],
    ['curricul', 'curriculum', 'course'],
    ['vestigi', 'vestigium', 'footstep'],
    ['orbit', 'orbita', 'wheel-track'],
  ],
};

// Spec 9.3: the three roots that never fill a slot taking an object.
export const INTRANSITIVE: ReadonlyArray<string> = ['proper', 'advol', 'flagr'];

// The declension a citation form declares (spec 9.4): -a feminine, -us
// masculine, -um neuter. A verb is cited by its infinitive in -are and belongs
// to no class, and an adjective is cited like a noun of the -us class, so this
// answers only for the roots the lexicon reaches as nouns.
export function classFromWord(word: string): 'a' | 'us' | 'um' | null {
  if (word.endsWith('are')) return null;
  if (word.endsWith('um')) return 'um';
  if (word.endsWith('us')) return 'us';
  if (word.endsWith('a')) return 'a';
  return null;
}

export const CITATION: Readonly<Record<string, string>> = Object.fromEntries(
  Object.values(LEXICON)
    .flat()
    .map(([root, word]) => [root, word]),
);

// The case table of spec 9.4, ending by ending, on one stem of each class.
export const DECLENSION: ReadonlyArray<
  readonly [stem: string, nominative: string, accusative: string, genitive: string, vocative: string]
> = [
  ['port', 'PORTA', 'PORTAM', 'PORTAE', 'PORTA'],
  ['mur', 'MVRVS', 'MVRVM', 'MVRI', 'MVRE'],
  ['fat', 'FATVM', 'FATVM', 'FATI', 'FATVM'],
];

// The five verb forms of spec 9.4, plus the enclitic the question hangs on.
export const CONJUGATION: ReadonlyArray<readonly [form: string, written: string]> = [
  ['lig' + 'o', 'LIGO'],
  ['monstr' + 'at', 'MONSTRAT'],
  ['lig' + 'a', 'LIGA'],
  ['lig' + 'ato', 'LIGATO'],
  ['lig' + 'avi', 'LIGAVI'],
  ['monstr' + 'atne', 'MONSTRATNE'],
];

export const VERB_ENDINGS: ReadonlyArray<string> = ['o', 'at', 'a', 'ato', 'avi', 'atne'];

// The attested power words of spec 9.7, each with the glyph row it writes.
export const POWER_TABLE: ReadonlyArray<readonly [id: string, glyphs: string]> = [
  ['abracadabra', 'ABRACADABRA'],
  ['motas', 'MOTAS·VAETA·DARIES·DARDARES·ASTATARIES·DISSVNAPITER'],
  ['huat', 'HVAT·HAVAT·HVAT·ISTA·PISTA·SISTA·DANNABO·DANNAVSTRA'],
  ['fascinus', 'FASCINVS'],
  ['angitia', 'ANGITIA'],
  ['carmenta', 'CARMENTA'],
  ['egeria', 'EGERIA'],
  ['proserpina', 'PROSERPINA'],
  ['dispater', 'DIS·PATER'],
];

// The same rows read aloud. The glyph column cannot be turned back into the
// reading line, since V speaks as both u and v, so the words are transcribed
// beside their letters rather than derived from them.
export const POWER_WORDS: Readonly<Record<string, ReadonlyArray<string>>> = {
  abracadabra: ['abracadabra'],
  motas: ['motas', 'vaeta', 'daries', 'dardares', 'astataries', 'dissunapiter'],
  huat: ['huat', 'hauat', 'huat', 'ista', 'pista', 'sista', 'dannabo', 'dannaustra'],
  fascinus: ['fascinus'],
  angitia: ['angitia'],
  carmenta: ['carmenta'],
  egeria: ['egeria'],
  proserpina: ['proserpina'],
  dispater: ['dis', 'pater'],
};

export const BRIGHT_IDS: ReadonlyArray<string> = [
  'abracadabra',
  'motas',
  'huat',
  'fascinus',
  'angitia',
  'carmenta',
  'egeria',
];

export const DARK_IDS: ReadonlyArray<string> = ['proserpina', 'dispater'];

// The two chant rows, which fill only the free power word of a school clause.
export const CHANT_IDS: ReadonlyArray<string> = ['motas', 'huat'];

// Dread epithets of spec 9.10, built to fail the phonotactics of 9.3 on sight.
export const DREAD_TABLE: ReadonlyArray<readonly [word: string, glyphs: string, gloss: string]> = [
  ['xulgoth', 'XVLGOTH', 'the maw beneath the threshold'],
  ['sthulvorn', 'STHVLVORN', 'the sprawl behind the wall'],
  ['gnorvath', 'GNORVATH', 'the hunger that learns'],
  ['throxul', 'THROXVL', 'the wheel that grinds the stars'],
  ['mroguth', 'MROGVTH', 'the swarm without a master'],
  ['gvortha', 'GVORTHA', 'the door that breathes'],
  ['sthanox', 'STHANOX', 'the eye beneath the year'],
  ['thulcron', 'THVLCRON', 'the sleeper under the ages'],
  ['vrixoth', 'VRIXOTH', 'the whisper against the light'],
  ['ulthrax', 'VLTHRAX', 'the night that counts the dead'],
];

export const DREAD_WORDS: ReadonlyArray<string> = DREAD_TABLE.map(([word]) => word);

// Idiom word lists of spec 9.6 and 9.10.
export const LO1: ReadonlyArray<string> = ['amuletum'];
export const LO2: ReadonlyArray<string> = ['te', 'precor', 'quaesoque'];
export const LO3_SHORT: ReadonlyArray<string> = ['sator', 'arepo'];
export const LO3_FULL: ReadonlyArray<string> = ['sator', 'arepo', 'tenet', 'opera', 'rotas'];
export const LO4: ReadonlyArray<string> = ['defigo'];
export const LO5: ReadonlyArray<string> = ['sortem', 'duco'];
export const LO6: ReadonlyArray<string> = ['iane', 'pater'];
export const LO7: ReadonlyArray<string> = ['exta', 'inspicio'];
export const LC1: ReadonlyArray<string> = ['iam', 'iam', 'cito', 'cito'];
export const LC2: ReadonlyArray<string> = ['esto'];
export const LC3: ReadonlyArray<string> = ['votum', 'solvi'];
export const LC4: ReadonlyArray<string> = ['ita', 'est'];
export const LC5_TAIL_SPEC = 'veni';
export const ELDRITCH_OPEN_SHORT: ReadonlyArray<string> = ['rotas', 'opera'];
export const ELDRITCH_OPEN_FULL: ReadonlyArray<string> = [
  'rotas',
  'opera',
  'tenet',
  'arepo',
  'sator',
];
export const ELDRITCH_CLOSE: ReadonlyArray<string> = ['ruina', 'aeterna'];

// Every frozen string of 9.6, 9.8 and 9.10, which render letter for letter as
// listed and never inflect.
export const FROZEN_WORDS: ReadonlyArray<string> = [
  ...LO1, ...LO2, ...LO3_FULL, ...LO4, ...LO5, ...LO6, ...LO7,
  ...LC1, ...LC2, ...LC3, ...LC4, LC5_TAIL_SPEC,
  ...ELDRITCH_CLOSE, 'dicito', 'ad',
];

// Function words of spec 9.4.
export const FN_CONTRA_SPEC = 'contra';
export const FN_AD_SPEC = 'ad';
export const FN_ET_SPEC = 'et';
export const ENCLITIC_NE_SPEC = 'ne';

// The four direction adverbs of spec 9.4.
export const DIRECTION_WORDS_SPEC: Readonly<Record<string, string>> = {
  back: 'retro',
  forth: 'porro',
  again: 'iterum',
  still: 'quiete',
};

// The Roman numerals of spec 9.8, additive and never subtractive, each with
// the numeral adverb that speaks it.
export const NUMERALS: Readonly<Record<number, readonly [glyphs: string, spoken: string]>> = {
  3: ['III', 'ter'],
  7: ['VII', 'septies'],
  9: ['VIIII', 'novies'],
  12: ['XII', 'duodecies'],
  27: ['XXVII', 'ter novies'],
};

export const SEAL_TAIL_SPOKEN = 'dicito';

// The tier 1 form of the one two-word row, written continuous because tier 1
// writes no separator (spec 9.7).
export const DISPATER_TIER1 = 'dispater';

// The triangle words of the clear register, one per case of the three-case
// rule of spec 9.9. The register's own case draws its word, so it has no
// fixed sequence to transcribe.
export const SHRINKING_STEPS: ReadonlyArray<string> = [
  'abracadabra',
  'abracadabr',
  'abracadab',
  'abracada',
  'abracad',
  'abraca',
  'abrac',
  'abra',
  'abr',
  'ab',
  'a',
];

// PROSERPINA, ten steps down to a single P: a bright fever amulet has no place
// under a nailing, so Curse shrinks the queen below instead (spec 9.9).
export const DARK_SHRINKING_STEPS: ReadonlyArray<string> = [
  'proserpina',
  'proserpin',
  'proserpi',
  'proserp',
  'proser',
  'prose',
  'pros',
  'pro',
  'pr',
  'p',
];

// How a word shrinks under this genome's device: the final letter goes at each
// step, down to a single letter. The register spends it on whatever epithet
// its repetition drew, so the steps are computed rather than listed.
export function truncations(word: string): string[] {
  return Array.from(word).map((_unused, index) => word.slice(0, word.length - index));
}
