import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  BRIGHT_POWER,
  DARK_POWER,
  DIRECTION_WORDS,
  DREAD_POWER,
  FIELDS,
  IDIOM_WORDS,
  LETTER_MAP,
  SEAL_COUNTS,
  SEAL_GLYPHS,
  SEAL_HEAD,
  KOPPA,
  NUMERAL_SIGN,
  SEAL_WORDS,
  SHRINKING_WORD,
  WORD_SEP,
} from '../src/ts/languages/greek-data.js';
import { lettersFor, tokenizeGreek } from '../src/ts/languages/greek.js';
import { greekGlosses } from '../src/ts/glosses/en/greek.js';
import type { SemanticField } from '../src/ts/generator/types.js';
import {
  DARK_WORDS,
  DIRECTION_WORDS_SPEC,
  DREAD_TABLE,
  ELDRITCH_CLOSE,
  ELDRITCH_OPEN_FULL,
  ELDRITCH_OPEN_SHORT,
  GC1,
  GC2,
  GC3,
  GC4,
  GO1,
  GO2,
  GO3_FULL,
  GO3_SHORT,
  GO4,
  GO5,
  GO6,
  INTRANSITIVE,
  LETTER_TABLE,
  LEXICON,
  NUMERALS,
  POWER_TABLE,
  SEAL_HEAD_SPOKEN,
} from './greek-spec.js';

const VOWELS: ReadonlySet<string> = new Set(['a', 'e', 'ee', 'i', 'o', 'oo', 'u']);

test('the alphabet is the 24 letters of the spec, in table order', () => {
  assert.strictEqual(Object.keys(LETTER_MAP).length, 24);
  for (const [token, glyph] of LETTER_TABLE) {
    assert.strictEqual(LETTER_MAP[token], glyph, `token ${token}`);
  }
  // No h of its own: the h inside th, ph and kh is part of a digraph and never
  // stands alone (spec 8.1).
  assert.strictEqual(LETTER_MAP['h'], undefined);
});

test('the three non-letters are the codepoints the spec names, not their twins', () => {
  // Read numerically: the ano teleia and the middle dot are the same picture,
  // and so are the numeral sign and the modifier letter prime.
  assert.strictEqual(WORD_SEP.codePointAt(0), 0x0387, 'the separator is not the ano teleia');
  assert.strictEqual(NUMERAL_SIGN.codePointAt(0), 0x0374, 'not the greek numeral sign');
  assert.strictEqual(KOPPA.codePointAt(0), 0x03de, 'not the numeral koppa');
  // Every letter of the inventory sits in the Greek capital range.
  for (const [, glyph] of LETTER_TABLE) {
    const code = glyph.codePointAt(0) ?? 0;
    assert.ok(code >= 0x0391 && code <= 0x03a9, `${glyph} is outside the capital range`);
    assert.notStrictEqual(code, 0x03a2, 'the unassigned codepoint is in the table');
  }
});

test('the coined lexicon matches the spec table, root and gloss', () => {
  for (const [field, rows] of Object.entries(LEXICON)) {
    const roots = FIELDS[field as SemanticField];
    assert.strictEqual(roots.length, rows.length, `root count of ${field}`);
    rows.forEach(([root, gloss], index) => {
      const entry = roots[index];
      assert.strictEqual(entry?.root, root, `${field} row ${index} root`);
      assert.strictEqual(greekGlosses.roots[root]?.gloss, gloss, `${field} row ${index} gloss`);
    });
  }
  const total = Object.values(FIELDS).reduce((n, roots) => n + roots.length, 0);
  assert.strictEqual(total, 150, 'fifteen fields of ten roots');
});

test('root shape follows the phonotactics of the spec', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      const tokens = tokenizeGreek(root.root);
      for (const token of tokens) {
        assert.ok(LETTER_MAP[token] !== undefined, `unknown letter ${token} in ${root.root}`);
      }
      // Every root ends in a consonant, which is what spares this genome the
      // contraction rules a real Greek grammar needs (spec 8.3).
      assert.ok(
        !VOWELS.has(tokens[tokens.length - 1] ?? ''),
        `${root.root} ends in a vowel`,
      );
      // No letter sequence that would reparse: the tokenizer's reading of the
      // root is the only reading there is.
      assert.strictEqual(tokens.join(''), root.root, `${root.root} reparses`);
      assert.doesNotMatch(root.root, /[cqvwxyj]/u, `forbidden letter in ${root.root}`);
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
      // singular, so no plural wording is needed in this genome (spec 8.5).
      assert.ok(!root.forms.includes('plural'), `${root.root} declares a plural`);
    }
  }
  // Every pool a school can draw from has to hold what the school asks of it.
  for (const field of ['warding', 'binding', 'harm', 'summoning', 'sight', 'course'] as const) {
    const transitive = FIELDS[field].filter(
      (r) => r.forms.includes('verb') && r.intransitive !== true,
    );
    assert.ok(transitive.length >= 3, `thin transitive verbs in ${field}`);
  }
  for (const field of ['night', 'harm', 'death', 'sight', 'fate', 'course'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('adj')), `no adjective in ${field}`);
  }
  for (const field of ['hidden', 'night', 'harm', 'sight', 'course'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('adv')), `no adverb in ${field}`);
  }
  for (const field of [
    'warding', 'harm', 'summoning', 'hidden', 'binding', 'fire', 'night',
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

test('the voces magicae are written letter for letter as the spec lists them', () => {
  assert.deepStrictEqual([...BRIGHT_POWER, ...DARK_POWER], POWER_TABLE.map(([word]) => word));
  for (const [word, glyphs] of POWER_TABLE) {
    assert.strictEqual(lettersFor(word), glyphs, `vox ${word}`);
    assert.ok(greekGlosses.powers[word] !== undefined, `vox ${word} has no gloss`);
  }
  assert.deepStrictEqual([...DARK_POWER], [...DARK_WORDS]);
  // The shrinking sequence drops a letter at a time down to a single one,
  // which iao does exactly (spec 8.7).
  assert.strictEqual(SHRINKING_WORD, 'iaoo');
  const tokens = tokenizeGreek(SHRINKING_WORD);
  assert.deepStrictEqual(
    tokens.map((_, index) => lettersFor(tokens.slice(index).join(''))),
    ['ΙΑΩ', 'ΑΩ', 'Ω'],
  );
});

test('the dread pool matches the spec table and every epithet ends in -OOTH', () => {
  assert.deepStrictEqual([...DREAD_POWER], DREAD_TABLE.map(([word]) => word));
  for (const [word, gloss] of DREAD_TABLE) {
    assert.strictEqual(greekGlosses.epithets[word], gloss, `dread ${word}`);
    assert.ok(lettersFor(word).endsWith('ΩΘ'), `dread ${word} does not end in -OOTH`);
  }
});

test('idioms carry the attested spellings of the spec', () => {
  const words = (id: keyof typeof IDIOM_WORDS): string[] => [...IDIOM_WORDS[id]];
  assert.deepStrictEqual(words('GO1'), [...GO1]);
  assert.deepStrictEqual(words('GO2'), [...GO2]);
  assert.deepStrictEqual(words('GO3_SHORT'), [...GO3_SHORT]);
  assert.deepStrictEqual(words('GO3_FULL'), [...GO3_FULL]);
  assert.deepStrictEqual(words('GO4'), [...GO4]);
  assert.deepStrictEqual(words('GO5'), [...GO5]);
  assert.deepStrictEqual(words('GO6'), [...GO6]);
  assert.deepStrictEqual(words('GC1'), [...GC1]);
  assert.deepStrictEqual(words('GC2'), [...GC2]);
  assert.deepStrictEqual(words('GC3'), [...GC3]);
  assert.deepStrictEqual(words('GC4'), [...GC4]);
  assert.deepStrictEqual(words('ELDRITCH_OPEN_SHORT'), [...ELDRITCH_OPEN_SHORT]);
  assert.deepStrictEqual(words('ELDRITCH_OPEN_FULL'), [...ELDRITCH_OPEN_FULL]);
  assert.deepStrictEqual(words('ELDRITCH_CLOSE'), [...ELDRITCH_CLOSE]);
  // The amulet word and the Aion pair, written out.
  assert.strictEqual(lettersFor(GO1[0] ?? ''), 'ΦΥΛΑΚΤΗΡΙΟΝ');
  assert.strictEqual(GO6.map(lettersFor).join('·'), 'ΑΙΩΝ·ΑΙΩΝΟΣ');
  // The register reads the Ephesian row against its order, whole and short.
  assert.deepStrictEqual(words('ELDRITCH_OPEN_FULL'), [...GO3_FULL].reverse());
  assert.deepStrictEqual(words('ELDRITCH_OPEN_SHORT'), [...GO3_SHORT].reverse());
});

test('numerals are the alphabetic ones, each closed by the numeral sign', () => {
  assert.deepStrictEqual([...SEAL_COUNTS], Object.keys(NUMERALS).map(Number));
  for (const [count, [glyphs, spoken]] of Object.entries(NUMERALS)) {
    const key = Number(count) as keyof typeof SEAL_GLYPHS;
    assert.strictEqual(SEAL_GLYPHS[key], glyphs, `numeral ${count} glyphs`);
    assert.strictEqual(SEAL_WORDS[key], spoken, `numeral ${count} spoken`);
  }
  assert.strictEqual(SEAL_HEAD, SEAL_HEAD_SPOKEN);
  assert.strictEqual(lettersFor(SEAL_HEAD), 'ΛΕΓΕ');
});

test('the four direction adverbs are the ones the spec attests', () => {
  for (const [id, word] of Object.entries(DIRECTION_WORDS)) {
    assert.strictEqual(word, DIRECTION_WORDS_SPEC[id], `direction ${id}`);
  }
  assert.strictEqual(lettersFor(DIRECTION_WORDS.back), 'ΟΠΙΣΩ');
  assert.strictEqual(lettersFor(DIRECTION_WORDS.forth), 'ΠΡΟΣΩ');
  assert.strictEqual(lettersFor(DIRECTION_WORDS.again), 'ΠΑΛΙΝ');
  assert.strictEqual(lettersFor(DIRECTION_WORDS.still), 'ΑΤΡΕΜΑ');
});
