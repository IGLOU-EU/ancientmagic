// Spec constants transcribed from docs/genomes.md so the contract tests stand
// independent of the implementation's own data tables.

export const RUNE_TABLE: ReadonlyArray<readonly [token: string, glyph: string]> = [
  ['f', '\u{16A0}'],
  ['u', '\u{16A2}'],
  ['th', '\u{16A6}'],
  ['a', '\u{16A8}'],
  ['r', '\u{16B1}'],
  ['k', '\u{16B2}'],
  ['g', '\u{16B7}'],
  ['w', '\u{16B9}'],
  ['h', '\u{16BA}'],
  ['n', '\u{16BE}'],
  ['i', '\u{16C1}'],
  ['j', '\u{16C3}'],
  ['ei', '\u{16C7}'],
  ['p', '\u{16C8}'],
  ['z', '\u{16C9}'],
  ['s', '\u{16CA}'],
  ['t', '\u{16CF}'],
  ['b', '\u{16D2}'],
  ['e', '\u{16D6}'],
  ['m', '\u{16D7}'],
  ['l', '\u{16DA}'],
  ['ng', '\u{16DC}'],
  ['d', '\u{16DE}'],
  ['o', '\u{16DF}'],
];

export const WORD_SEP = '\u{16EB}'; // ᛫
export const CLAUSE_SEP = '\u{16EC}'; // ᛬
export const CROSS_SEP = '\u{16ED}'; // ᛭

export const AEGEAN: Readonly<Record<string, string>> = {
  thri: '\u{10109}',
  sebun: '\u{1010D}',
  niun: '\u{1010F}',
  twalif: '\u{10110}\u{10108}',
};

export const ALLOWED_CODEPOINTS: ReadonlySet<string> = new Set([
  ...RUNE_TABLE.map(([, glyph]) => glyph),
  WORD_SEP,
  CLAUSE_SEP,
  CROSS_SEP,
  '\u{10109}',
  '\u{1010D}',
  '\u{1010F}',
  '\u{10110}',
  '\u{10108}',
]);

export const BRIGHT_POWER_WORDS: ReadonlyArray<string> = [
  'alu',
  'laukaz',
  'lathu',
  'auja',
  'ota',
  'gagaga',
  'tuwatuwa',
  'futharkgw',
  'futharkgwhnijeipzstbemlngdo',
];

export const DREAD_EPITHETS: ReadonlyArray<string> = [
  'thruznaz',
  'gulzoth',
  'wuzgrim',
  'skulthogn',
  'hruzbanaz',
  'nuthkolaz',
  'zguwald',
  'muznaht',
  'thulgzar',
  'kruthmol',
];

export const ELDRITCH_OPENING_SHORT = 'wgkrathuf';
export const ELDRITCH_OPENING_FULL = 'odnglmebtszpeijinhwgkrathuf';

// The time field of spec 2.3: the ten coined roots of the lexicon table, then
// the two rune names the rune-name table puts in the same field. Transcribed
// because the return anchor of spec 1.6 is held to this field and to no other,
// so the assertion has to know the field independently of the data module that
// fills it.
export const TIME_FIELD: ReadonlyArray<string> = [
  'tid',
  'stund',
  'sumar',
  'ald',
  'wurd',
  'skap',
  'morgan',
  'aband',
  'aiw',
  'forn',
  'jer',
  'dag',
];

// The four direction words of spec 2.4 and the fixed tail of RC5 (2.6).
export const DIRECTION_WORDS_SPEC: Readonly<Record<string, string>> = {
  back: 'aftar',
  forth: 'fram',
  again: 'eft',
  still: 'stil',
};

export const RC5_TAIL_SPEC: ReadonlyArray<string> = ['aftar', 'wendo'];

export const NUMERAL_WORDS: Readonly<Record<number, string>> = {
  3: 'thri',
  7: 'sebun',
  9: 'niun',
  12: 'twalif',
};

export interface ParsedFormula {
  // Words per clause segment, split on the clause then the word separator.
  segments: string[][];
  // The framed Aegean glyph sequence, null when no seal is present.
  seal: string | null;
}

export function parseGlyphs(glyphs: string): ParsedFormula {
  let body = glyphs;
  let seal: string | null = null;

  const sealMatch = body.match(
    new RegExp(`${CROSS_SEP}([^${CROSS_SEP}]+)${CROSS_SEP}$`, 'u'),
  );
  if (sealMatch !== null) {
    seal = sealMatch[1] ?? null;
    body = body.slice(0, body.length - (sealMatch[0] ?? '').length);
  }

  const segments = body
    .split(CLAUSE_SEP)
    .map((segment) => segment.split(WORD_SEP));
  return { segments, seal };
}
