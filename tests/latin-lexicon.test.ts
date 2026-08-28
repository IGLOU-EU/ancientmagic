import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  BRIGHT_POWER,
  DARK_POWER,
  DIRECTION_WORDS,
  DREAD_POWER,
  ENCLITIC_NE,
  FIELDS,
  FN_AD,
  FN_CONTRA,
  FN_ET,
  IDIOM_WORDS,
  LC5_TAIL,
  LETTER_MAP,
  SEAL_COUNTS,
  SEAL_GLYPHS,
  SEAL_TAIL,
  SEAL_WORDS,
  SHRINKING_WORD,
  WORD_SEP,
} from '../src/ts/languages/latin-data.js';
import { lettersFor, tokenizeLatin } from '../src/ts/languages/latin.js';
import { latinGlosses } from '../src/ts/glosses/en/latin.js';
import type { SemanticField } from '../src/ts/generator/types.js';
import {
  CHANT_IDS,
  CITATION,
  DARK_IDS,
  DIRECTION_WORDS_SPEC,
  DREAD_TABLE,
  ELDRITCH_CLOSE,
  ELDRITCH_OPEN_FULL,
  ELDRITCH_OPEN_SHORT,
  ENCLITIC_NE_SPEC,
  FN_AD_SPEC,
  FN_CONTRA_SPEC,
  FN_ET_SPEC,
  INTERPUNCT,
  INTRANSITIVE,
  LC1,
  LC2,
  LC3,
  LC4,
  LC5_TAIL_SPEC,
  LETTER_TABLE,
  LEXICON,
  LO1,
  LO2,
  LO3_FULL,
  LO3_SHORT,
  LO4,
  LO5,
  LO6,
  NUMERALS,
  POWER_TABLE,
  SEAL_TAIL_SPOKEN,
  SHRINKING_STEPS,
  classFromWord,
} from './latin-spec.js';

const VOWELS: ReadonlySet<string> = new Set(['a', 'e', 'i', 'o', 'u']);

// The stems the root table ends on a vowel other than i. Spec 9.3 records
// ianu and its own rule says the table wins over the shape list, so clipe
// stands here beside it: clipeus declines clipe-um exactly as ianua declines
// ianu-am, and both are real words in their real class.
const VOWEL_FINAL_STEMS: ReadonlyArray<string> = ['ianu', 'clipe'];

// Syllables, counted with the two conventions classical scansion needs and
// spec 9.3 leaves implicit: the diphthongs are one nucleus each (PRAESIDIVM
// is prae-si-di-um and not four vowels), and a word-initial i before a vowel
// is the consonant the letter table calls y (IVDICIVM opens on it).
function syllables(stem: string): number {
  return Array.from(stem.replace(/^i(?=[aeou])/u, '').replace(/ae|au|oe|eu/gu, 'a')).filter(
    (letter) => VOWELS.has(letter),
  ).length;
}

test('the alphabet is the 21 tokens of the spec over its 20 letters', () => {
  assert.strictEqual(Object.keys(LETTER_MAP).length, 21);
  for (const [token, glyph] of LETTER_TABLE) {
    assert.strictEqual(LETTER_MAP[token], glyph, `token ${token}`);
  }
  // The six letters no root, idiom, power or numeral of this genome reaches.
  for (const token of ['j', 'k', 'w', 'y', 'z']) {
    assert.strictEqual(LETTER_MAP[token], undefined, `token ${token} is readable`);
  }
});

test('the separator is the interpunct the spec names, not its Greek twin', () => {
  assert.strictEqual(WORD_SEP.codePointAt(0), 0x00b7, 'the separator is not the middle dot');
  assert.strictEqual(WORD_SEP, INTERPUNCT);
});

test('the selected lexicon matches the spec table, root and gloss', () => {
  for (const [field, rows] of Object.entries(LEXICON)) {
    const roots = FIELDS[field as SemanticField];
    assert.strictEqual(roots.length, rows.length, `root count of ${field}`);
    rows.forEach(([root, , gloss], index) => {
      const entry = roots[index];
      assert.strictEqual(entry?.root, root, `${field} row ${index} root`);
      assert.strictEqual(latinGlosses.roots[root]?.gloss, gloss, `${field} row ${index} gloss`);
    });
  }
  const total = Object.values(FIELDS).reduce((n, roots) => n + roots.length, 0);
  assert.strictEqual(total, 140, 'fourteen fields of ten roots');
});

// This genome selects rather than coins, so the class is not a choice: it is
// read off the real word the stem is cut from (spec 9.3, 9.4).
test('every noun declines in the class its citation form declares', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      const word = CITATION[root.root];
      assert.ok(word !== undefined, `${root.root} is not in the spec table`);
      if (!root.forms.includes('noun')) {
        assert.strictEqual(root.nounClass, undefined, `${root.root} declines without a noun`);
        continue;
      }
      assert.strictEqual(
        root.nounClass,
        classFromWord(word ?? ''),
        `${root.root} is cut from ${word ?? ''}`,
      );
    }
  }
  // Every class is reached, so no branch of the table is dead data.
  const classes = new Set(
    Object.values(FIELDS)
      .flat()
      .map((root) => root.nounClass)
      .filter((nounClass) => nounClass !== undefined),
  );
  assert.deepStrictEqual([...classes].sort(), ['a', 'um', 'us']);
});

test('root shape follows the phonotactics of the spec', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      const tokens = tokenizeLatin(root.root);
      assert.strictEqual(tokens.join(''), root.root, `${root.root} reparses`);
      // No k, y, z, w or j, and no Greek digraph aspirate: the tomb is spelled
      // SEPVLCRVM and never SEPVLCHRVM (spec 9.3).
      assert.doesNotMatch(root.root, /[kyzwj]/u, `forbidden letter in ${root.root}`);
      assert.doesNotMatch(root.root, /th|ph|ch/u, `Greek aspirate in ${root.root}`);
      // A stem ends in a consonant or in i, the one vowel Latin lets stand
      // before an ending. ianu is the one recorded exception.
      const last = tokens[tokens.length - 1] ?? '';
      assert.ok(
        !VOWELS.has(last) || last === 'i' || VOWEL_FINAL_STEMS.includes(root.root),
        `${root.root} ends in a vowel`,
      );
      const count = syllables(root.root);
      assert.ok(count >= 1 && count <= 3, `${root.root} has ${count} syllables`);
    }
  }
});

test('no stem string appears in two fields', () => {
  const seen = new Map<string, string>();
  for (const [field, roots] of Object.entries(FIELDS)) {
    for (const root of roots) {
      const already = seen.get(root.root);
      assert.strictEqual(already, undefined, `${root.root} sits in ${already ?? ''} and ${field}`);
      seen.set(root.root, field);
    }
  }
});

test('every root carries the gloss forms of the roles it can fill', () => {
  for (const [field, roots] of Object.entries(FIELDS)) {
    for (const root of roots) {
      assert.ok(
        root.forms.includes('noun') ||
          root.forms.includes('verb') ||
          root.forms.includes('adj') ||
          root.forms.includes('adv'),
        `${root.root} fills no role`,
      );
      // Past participles are declared in the harm field alone, because the
      // Curse gloss is the only clause template here that reaches for one.
      if (root.forms.includes('pp')) {
        assert.strictEqual(field, 'harm', `${root.root} declares a participle`);
      }
      if (field === 'harm' && root.forms.includes('verb')) {
        assert.ok(root.forms.includes('pp'), `${root.root} is a curse verb without a participle`);
      }
      // No plural anywhere: the epithet chain reads through a genitive
      // singular, so no plural wording is needed in this genome (spec 9.5).
      assert.ok(!root.forms.includes('plural'), `${root.root} declares a plural`);
    }
  }
  // Every pool a school can draw from has to hold what the school asks of it.
  for (const field of ['warding', 'binding', 'harm', 'summoning', 'sight', 'course'] as const) {
    const usable = FIELDS[field].filter(
      (r) => r.forms.includes('verb') && r.intransitive !== true,
    );
    assert.ok(usable.length >= 3, `thin transitive verbs in ${field}`);
  }
  for (const field of ['night', 'harm', 'death', 'sight', 'fate', 'course'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('adj')), `no adjective in ${field}`);
  }
  for (const field of ['hidden', 'night', 'harm', 'sight', 'course'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('adv')), `no adverb in ${field}`);
  }
  // Every field a school draws a noun from. Summoning, binding and course are
  // left out because no order of spec 9.5 asks any of them for one: this
  // genome spends them on verbs, and nunti is the one noun among them.
  for (const field of [
    'warding', 'harm', 'hidden', 'fire', 'night',
    'death', 'gates', 'time', 'sight', 'fate', 'signs',
  ] as const) {
    assert.ok(
      FIELDS[field].filter((r) => r.forms.includes('noun')).length >= 3,
      `thin nouns in ${field}`,
    );
  }
});

test('the intransitive flag sits on exactly the three roots of the spec', () => {
  const flagged = Object.values(FIELDS)
    .flat()
    .filter((r) => r.intransitive === true)
    .map((r) => r.root)
    .sort();
  assert.deepStrictEqual(flagged, [...INTRANSITIVE].sort());
});

test('the attested powers are written letter for letter as the spec lists them', () => {
  const all = [...BRIGHT_POWER, ...DARK_POWER];
  assert.deepStrictEqual(all.map((p) => p.id), POWER_TABLE.map(([id]) => id));
  for (const [id, glyphs] of POWER_TABLE) {
    const entry = all.find((p) => p.id === id);
    assert.ok(entry !== undefined, `power ${id} is missing`);
    assert.strictEqual(
      (entry?.words ?? []).map(lettersFor).join(WORD_SEP),
      glyphs,
      `power ${id}`,
    );
    assert.ok(latinGlosses.powers[id] !== undefined, `power ${id} has no gloss`);
  }
  assert.deepStrictEqual(DARK_POWER.map((p) => p.id), [...DARK_IDS]);
  // The chant rows are flagged, because they are the two the draw rules of
  // spec 9.7 keep out of tier 1 and out of a repetition.
  assert.deepStrictEqual(
    all.filter((p) => p.chant === true).map((p) => p.id),
    [...CHANT_IDS],
  );
  for (const power of all) {
    assert.strictEqual(power.chant === true, power.words.length > 2, `chant flag on ${power.id}`);
  }
});

test('the shrinking sequence is abracadabra, losing its final letter', () => {
  assert.strictEqual(SHRINKING_WORD, 'abracadabra');
  const tokens = tokenizeLatin(SHRINKING_WORD);
  assert.deepStrictEqual(
    tokens.map((_unused, index) => tokens.slice(0, tokens.length - index).join('')),
    [...SHRINKING_STEPS],
  );
  assert.strictEqual(SHRINKING_STEPS.length, 11, 'eleven steps down to a single A');
  assert.strictEqual(lettersFor(SHRINKING_STEPS[SHRINKING_STEPS.length - 1] ?? ''), 'A');
});

test('the dread pool matches the spec table and fails the phonotactics on sight', () => {
  assert.deepStrictEqual([...DREAD_POWER], DREAD_TABLE.map(([word]) => word));
  for (const [word, glyphs, gloss] of DREAD_TABLE) {
    assert.strictEqual(lettersFor(word), glyphs, `dread ${word}`);
    assert.strictEqual(latinGlosses.epithets[word], gloss, `dread ${word}`);
    // Each is built so no reader can mistake it for Latin mangled: an initial
    // x, a th, or an onset Latin never wrote (spec 9.10).
    assert.match(
      word,
      /^x|th|^gn|^mr|^gv|^vr/u,
      `${word} could pass for a Latin word`,
    );
  }
});

test('idioms carry the attested spellings of the spec', () => {
  const words = (id: keyof typeof IDIOM_WORDS): string[] => [...IDIOM_WORDS[id]];
  assert.deepStrictEqual(words('LO1'), [...LO1]);
  assert.deepStrictEqual(words('LO2'), [...LO2]);
  assert.deepStrictEqual(words('LO3_SHORT'), [...LO3_SHORT]);
  assert.deepStrictEqual(words('LO3_FULL'), [...LO3_FULL]);
  assert.deepStrictEqual(words('LO4'), [...LO4]);
  assert.deepStrictEqual(words('LO5'), [...LO5]);
  assert.deepStrictEqual(words('LO6'), [...LO6]);
  assert.deepStrictEqual(words('LC1'), [...LC1]);
  assert.deepStrictEqual(words('LC2'), [...LC2]);
  assert.deepStrictEqual(words('LC3'), [...LC3]);
  assert.deepStrictEqual(words('LC4'), [...LC4]);
  assert.deepStrictEqual(words('ELDRITCH_OPEN_SHORT'), [...ELDRITCH_OPEN_SHORT]);
  assert.deepStrictEqual(words('ELDRITCH_OPEN_FULL'), [...ELDRITCH_OPEN_FULL]);
  assert.deepStrictEqual(words('ELDRITCH_CLOSE'), [...ELDRITCH_CLOSE]);
  assert.strictEqual(LC5_TAIL, LC5_TAIL_SPEC);
  // Cato's prayer and the square, written out.
  assert.strictEqual(LO2.map(lettersFor).join(WORD_SEP), 'TE·PRECOR·QVAESOQVE');
  assert.strictEqual(LO3_FULL.map(lettersFor).join(WORD_SEP), 'SATOR·AREPO·TENET·OPERA·ROTAS');
  assert.strictEqual(LO6.map(lettersFor).join(WORD_SEP), 'IANE·PATER');
  assert.strictEqual(LC3.map(lettersFor).join(WORD_SEP), 'VOTVM·SOLVI');
  assert.strictEqual(ELDRITCH_CLOSE.map(lettersFor).join(WORD_SEP), 'RVINA·AETERNA');
  // The register reads the square against its order, whole and short, and the
  // palindrome is what makes the reversal cost nothing (spec 9.10).
  assert.deepStrictEqual(words('ELDRITCH_OPEN_FULL'), [...LO3_FULL].reverse());
  // The short form takes the head of the row it reads, in both directions:
  // SATOR·AREPO opens the clear row, ROTAS·OPERA the reversed one.
  assert.deepStrictEqual(words('LO3_SHORT'), LO3_FULL.slice(0, 2));
  assert.deepStrictEqual(words('ELDRITCH_OPEN_SHORT'), ELDRITCH_OPEN_FULL.slice(0, 2));
});

test('numerals are the Roman ones, additive, sealed by their instruction', () => {
  assert.deepStrictEqual([...SEAL_COUNTS], Object.keys(NUMERALS).map(Number));
  for (const [count, [glyphs, spoken]] of Object.entries(NUMERALS)) {
    const key = Number(count) as keyof typeof SEAL_GLYPHS;
    assert.strictEqual(SEAL_GLYPHS[key], glyphs, `numeral ${count} glyphs`);
    assert.strictEqual(SEAL_WORDS[key], spoken, `numeral ${count} spoken`);
    // Built from letters the alphabet already carries, so the numeral system
    // costs the font contract nothing (spec 9.8).
    assert.match(glyphs, /^[IVX]+$/u, `numeral ${count} is not built from I, V and X`);
  }
  assert.strictEqual(SEAL_TAIL, SEAL_TAIL_SPOKEN);
  assert.strictEqual(lettersFor(SEAL_TAIL), 'DICITO');
});

test('the four direction adverbs are the ones the spec attests', () => {
  for (const [id, word] of Object.entries(DIRECTION_WORDS)) {
    assert.strictEqual(word, DIRECTION_WORDS_SPEC[id], `direction ${id}`);
  }
  assert.strictEqual(lettersFor(DIRECTION_WORDS.back), 'RETRO');
  assert.strictEqual(lettersFor(DIRECTION_WORDS.forth), 'PORRO');
  assert.strictEqual(lettersFor(DIRECTION_WORDS.again), 'ITERVM');
  assert.strictEqual(lettersFor(DIRECTION_WORDS.still), 'QVIETE');
});

test('the function words are the four the spec declares', () => {
  assert.strictEqual(FN_CONTRA, FN_CONTRA_SPEC);
  assert.strictEqual(FN_AD, FN_AD_SPEC);
  assert.strictEqual(FN_ET, FN_ET_SPEC);
  assert.strictEqual(ENCLITIC_NE, ENCLITIC_NE_SPEC);
  assert.strictEqual(lettersFor(FN_CONTRA), 'CONTRA');
  assert.strictEqual(lettersFor(FN_AD), 'AD');
  assert.strictEqual(lettersFor(FN_ET), 'ET');
});
