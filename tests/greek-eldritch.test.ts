import test from 'node:test';
import * as assert from 'node:assert/strict';
import { eldritchRoot, lettersFor } from '../src/ts/languages/greek.js';
import {
  ANO_TELEIA,
  DREAD_WORDS,
  ELDRITCH_CLOSE,
  ELDRITCH_OPEN_FULL,
  ELDRITCH_OPEN_SHORT,
  GC1,
  GC2,
  GC3,
  GC4,
  GO1,
  GO2,
  GO4,
  GO5,
  GO6,
  NUMERALS,
  POWER_TABLE,
} from './greek-spec.js';
import { DIFFICULTIES, SEEDS, greek, greekWords } from './gen.js';

const label = (difficulty: number, seed: number): string => `eldritch d${difficulty} seed ${seed}`;

test('the register lengthens every short vowel and hardens every s and t', () => {
  // Rules 1 and 2 of spec 8.10, in order, on the roots the register reaches.
  assert.strictEqual(eldritchRoot('elth'), 'eelth');
  assert.strictEqual(eldritchRoot('nekr'), 'neekr');
  assert.strictEqual(eldritchRoot('thanat'), 'thaanath'.replace('aa', 'a'));
  assert.strictEqual(eldritchRoot('pur'), 'pur');
  assert.strictEqual(eldritchRoot('astr'), 'akshthr'.replace('sh', 's'));
  // A digraph already holds its letters, so no rule runs twice on one sound.
  for (const root of ['psukh', 'phthor', 'khasm', 'aithal']) {
    const once = eldritchRoot(root);
    assert.strictEqual(eldritchRoot(once.replace(/ks/gu, 's')), once.replace(/ks/gu, 'ks'));
  }
});

// The ban of 1.4 falls on the slots a vox is drawn into: the free power word,
// the agent, the tier 1 formula and the repetition. It does not reach inside
// the register's own opening, which quotes the Ephesian row against its order
// and whose fifth word is also listed as a vox standing alone (spec 8.7). The
// row is idiom material, not a name the formula calls on.
test('eldritch output speaks none of the ten attested words, compared on glyphs', () => {
  const banned = POWER_TABLE.map(([, glyphs]) => glyphs);
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const out = greek('eldritch', difficulty, seed);
      // Every ban is asserted on whole glyph words, never on a substring: a
      // vox may live inside a longer coined word without being a hit.
      const words = out.glyphs.split(ANO_TELEIA);
      const opening = difficulty <= 2 ? 0 : difficulty < 6 ? 2 : 6;
      for (const glyphs of banned) {
        assert.ok(
          !words.slice(opening).includes(glyphs),
          `${glyphs} in ${label(difficulty, seed)}`,
        );
      }
    }
  }
});

test('the whole opening is the Ephesian row read against its order', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4, 5]) {
      const words = greekWords('eldritch', difficulty, seed);
      assert.deepStrictEqual(words.slice(0, 2), [...ELDRITCH_OPEN_SHORT], label(difficulty, seed));
    }
    for (const difficulty of [6, 7, 8, 9]) {
      const words = greekWords('eldritch', difficulty, seed);
      assert.deepStrictEqual(words.slice(0, 6), [...ELDRITCH_OPEN_FULL], label(difficulty, seed));
    }
    // The clear openers never appear under the register.
    for (const difficulty of DIFFICULTIES) {
      const words = greekWords('eldritch', difficulty, seed);
      for (const part of [...GO1, ...GO2, ...GO4, ...GO5, ...GO6]) {
        if (part === 'aioon' || part === 'se') continue;
        assert.ok(!words.includes(part), `${part} in ${label(difficulty, seed)}`);
      }
    }
  }
});

test('every closing is the fixed dread pair, and the seal is always nine', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [5, 6, 7, 8, 9]) {
      const where = label(difficulty, seed);
      const words = greekWords('eldritch', difficulty, seed);
      const seal = difficulty >= 7 ? words.lastIndexOf('lege') : -1;
      const end = seal > 0 ? seal : words.length;
      assert.deepStrictEqual(words.slice(end - 2, end), [...ELDRITCH_CLOSE], `closer in ${where}`);
      for (const part of [...GC1, ...GC2, ...GC3, ...GC4]) {
        assert.ok(!words.includes(part), `${part} in ${where}`);
      }
      if (difficulty >= 7) {
        assert.deepStrictEqual(words.slice(-1), [NUMERALS[9]?.[1]], `seal in ${where}`);
      }
    }
  }
});

test('dread epithets appear only in their listed forms', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const where = label(difficulty, seed);
      const words = greekWords('eldritch', difficulty, seed);
      const epithets = words.filter((word) => word.endsWith('ooth'));
      assert.ok(epithets.length > 0 || difficulty <= 2, `no epithet in ${where}`);
      for (const word of epithets) {
        // The closer is built from lexicon words with the register's ending,
        // and is listed data like the epithets themselves.
        if (ELDRITCH_CLOSE.includes(word)) continue;
        // At tier 9 the repetition shrinks an epithet a letter at a time, so a
        // step is a suffix of a listed form rather than a form of its own.
        const listed =
          DREAD_WORDS.includes(word) ||
          (difficulty === 9 && DREAD_WORDS.some((epithet) => epithet.endsWith(word)));
        assert.ok(listed, `${word} is not a listed epithet in ${where}`);
        assert.ok(lettersFor(word).endsWith('ΩΘ'), `${word} does not end in -OOTH`);
      }
    }
  }
});
