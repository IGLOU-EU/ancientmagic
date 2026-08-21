import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  BRIGHT_POWER,
  DREAD_POWER,
  EC1,
  EC2,
  EO1,
  ELDRITCH_CLOSE,
  ELDRITCH_OPEN,
  FIELD_DET,
  FIELDS,
  NUMERAL_WORDS,
  SIGN_MAP,
} from '../src/ts/languages/egyptian-data.js';
import type { SemanticField } from '../src/ts/generator/types.js';
import {
  DETERMINATIVE_TABLE,
  DREAD_TABLE,
  EC1_GLYPHS,
  EC1_SPOKEN,
  EC2_GLYPHS,
  EC2_SPOKEN,
  ELDRITCH_CLOSE_GLYPHS,
  ELDRITCH_CLOSE_SPOKEN,
  ELDRITCH_OPEN_SPOKEN,
  EO1_GLYPHS,
  EO1_SPOKEN,
  FIELD_DET as SPEC_FIELD_DET,
  IDIOM_SIGN_TABLE,
  LEXICON,
  NUMERALS,
  POWER_TABLE,
  SIGN_TABLE,
} from './egyptian-spec.js';

test('the working set is 23 phonograms, 17 determinatives and 7 closed idiom signs', () => {
  assert.strictEqual(SIGN_TABLE.length, 23);
  assert.strictEqual(DETERMINATIVE_TABLE.length, 17);
  assert.strictEqual(IDIOM_SIGN_TABLE.length, 7);
  assert.strictEqual(Object.keys(SIGN_MAP).length, 23);
  for (const [token, glyph] of SIGN_TABLE) {
    assert.strictEqual(SIGN_MAP[token], glyph, `token ${token}`);
  }
  // The door bolt z and the second kh are deliberately excluded (spec 3.1).
  assert.strictEqual(SIGN_MAP['z'], undefined);
});

test('field determinatives follow the normative table', () => {
  for (const [field, glyph] of Object.entries(SPEC_FIELD_DET)) {
    assert.strictEqual(FIELD_DET[field as SemanticField], glyph, `field ${field}`);
  }
  assert.strictEqual(new Set(Object.values(FIELD_DET)).size, 10, 'ten distinct field signs');
});

test('the coined lexicon matches the spec table, skeleton, spoken form and gloss', () => {
  for (const [field, rows] of Object.entries(LEXICON)) {
    const roots = FIELDS[field as SemanticField];
    assert.strictEqual(roots.length, rows.length, `root count of ${field}`);
    rows.forEach(([skeleton, spoken, gloss], index) => {
      const root = roots[index];
      assert.strictEqual(root?.skeleton, skeleton, `${field} row ${index} skeleton`);
      assert.strictEqual(root?.spoken, spoken, `${field} row ${index} spoken`);
      assert.strictEqual(root?.gloss, gloss, `${field} row ${index} gloss`);
    });
  }
  const total = Object.values(FIELDS).reduce((n, roots) => n + roots.length, 0);
  assert.strictEqual(total, 100, 'ten fields of ten roots');
});

test('coined skeletons respect the phonotactics of the spec', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      const signs = Array.from(root.skeleton);
      assert.ok(signs.length >= 2 && signs.length <= 4, `skeleton length of ${root.skeleton}`);
      for (const sign of signs) {
        assert.ok(SIGN_MAP[sign] !== undefined, `unknown sign ${sign} in ${root.skeleton}`);
      }
      // No l and no z: the script has no simple sign for either (spec 3.3).
      assert.ok(!/[lz]/u.test(root.skeleton), `forbidden letter in ${root.skeleton}`);
    }
  }
});

test('every root carries the gloss forms of the roles it can fill', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      assert.ok(
        root.noun !== undefined || root.verb !== undefined,
        `${root.skeleton} fills no role`,
      );
      if (root.verb !== undefined) {
        assert.ok(root.pp !== undefined, `${root.skeleton} is a verb without a participle`);
      }
    }
  }
  // The plan draws adjectives from these three fields only, so each must offer
  // at least one, and adverbial m-phrases need nouns in theirs.
  for (const field of ['night', 'harm', 'death'] as const) {
    assert.ok(
      FIELDS[field].some((r) => r.adj !== undefined),
      `no adjective in ${field}`,
    );
  }
  for (const field of ['hidden', 'night', 'harm'] as const) {
    assert.ok(FIELDS[field].some((r) => r.noun !== undefined), `no noun in ${field}`);
  }
  // Every field a school can draw a verb or a noun from must offer one.
  for (const field of ['warding', 'binding', 'harm', 'summoning'] as const) {
    assert.ok(FIELDS[field].some((r) => r.verb !== undefined), `no verb in ${field}`);
  }
  for (const field of ['harm', 'death', 'night', 'fire', 'hidden', 'gates', 'time'] as const) {
    assert.ok(FIELDS[field].filter((r) => r.noun !== undefined).length >= 3, `thin nouns in ${field}`);
  }
});

test('attested power words are written sign for sign as the spec lists them', () => {
  assert.strictEqual(BRIGHT_POWER.length, POWER_TABLE.length);
  POWER_TABLE.forEach(([skeleton, glyphs, spoken], index) => {
    const power = BRIGHT_POWER[index];
    assert.strictEqual(power?.skeleton, skeleton, `power ${index} skeleton`);
    assert.strictEqual(power?.glyphs, glyphs, `power ${index} glyphs`);
    assert.strictEqual(power?.spoken, spoken, `power ${index} spoken`);
  });
});

test('the dread pool matches the spec table and every skeleton already ends in x', () => {
  assert.strictEqual(DREAD_POWER.length, DREAD_TABLE.length);
  DREAD_TABLE.forEach(([skeleton, spoken, gloss], index) => {
    const epithet = DREAD_POWER[index];
    assert.strictEqual(epithet?.skeleton, skeleton, `dread ${index} skeleton`);
    assert.strictEqual(epithet?.spoken, spoken, `dread ${index} spoken`);
    assert.strictEqual(epithet?.gloss, gloss, `dread ${index} gloss`);
    // The sieve is the tell of the register. It closes every epithet but
    // xAxr, where the spec's own skeleton carries it in second position.
    assert.ok(skeleton.includes('x'), `dread ${skeleton} carries no sieve`);
  });
});

test('idioms carry the attested spellings of the spec', () => {
  assert.deepStrictEqual(EO1.words.map((w) => w.spoken), [...EO1_SPOKEN]);
  assert.strictEqual(EO1.words.map((w) => w.glyphs).join(''), EO1_GLYPHS);
  assert.deepStrictEqual(ELDRITCH_OPEN.words.map((w) => w.spoken), [...ELDRITCH_OPEN_SPOKEN]);
  assert.deepStrictEqual(EC1.words.map((w) => w.spoken), [...EC1_SPOKEN]);
  assert.strictEqual(EC1.words.map((w) => w.glyphs).join(''), EC1_GLYPHS);
  assert.deepStrictEqual(EC2.words.map((w) => w.spoken), [...EC2_SPOKEN]);
  assert.strictEqual(EC2.words.map((w) => w.glyphs).join(''), EC2_GLYPHS);
  assert.deepStrictEqual(ELDRITCH_CLOSE.words.map((w) => w.spoken), [...ELDRITCH_CLOSE_SPOKEN]);
  assert.strictEqual(ELDRITCH_CLOSE.words.map((w) => w.glyphs).join(''), ELDRITCH_CLOSE_GLYPHS);
});

test('numerals compose from strokes and the hobble as the spec lists them', () => {
  for (const [count, [glyphs, spoken]] of Object.entries(NUMERALS)) {
    const words = NUMERAL_WORDS[Number(count) as keyof typeof NUMERAL_WORDS];
    assert.ok(words !== undefined, `numeral ${count} missing`);
    assert.strictEqual(words.map((w) => w.glyphs).join(''), glyphs, `numeral ${count} glyphs`);
    assert.strictEqual(words.map((w) => w.spoken).join(' '), spoken, `numeral ${count} spoken`);
  }
});
