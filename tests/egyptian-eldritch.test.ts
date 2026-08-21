import test from 'node:test';
import * as assert from 'node:assert/strict';
import { degradeSpoken, eldritchSkeleton, joinSpoken } from '../src/ts/languages/egyptian.js';
import {
  A14_ENEMY,
  DREAD_SPOKEN,
  EC1_SPOKEN,
  EC2_SPOKEN,
  ELDRITCH_CLOSE_GLYPHS,
  ELDRITCH_CLOSE_SPOKEN,
  ELDRITCH_OPEN_SPOKEN,
  EO2_HEAD_SPOKEN,
  G37_EVIL,
  NUMERALS,
  POWER_TABLE,
  SEAL_SIGN,
  X_SIEVE,
  codePoints,
} from './egyptian-spec.js';
import { DIFFICULTIES, SEEDS, egyptian, egyptianWords } from './gen.js';

const where = (difficulty: number, seed: number): string => `d${difficulty} seed ${seed}`;

const line = (difficulty: number, seed: number): string[] =>
  egyptian('eldritch', difficulty, seed).transliteration.split(' ');

test('the register degrades the spoken line per the spec example', () => {
  assert.strictEqual(degradeSpoken(joinSpoken('meka', 'x')), 'mukokh');
  assert.strictEqual(degradeSpoken(joinSpoken('qas', 'x')), 'qosukh');
  // A word initial a survives, only the inner ones darken.
  assert.strictEqual(degradeSpoken('areq'), 'aruq');
  assert.strictEqual(degradeSpoken('sema'), 'sumo');
  assert.strictEqual(eldritchSkeleton('qAs'), 'qAsx');
});

test('eldritch never writes a bright power word', () => {
  // Compared on the glyph line: the EO2 opener word rA and the sun god ra are
  // homophones in transliteration but different sign groups.
  const banned = new Set(POWER_TABLE.map(([, glyphs]) => glyphs));
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      for (const word of egyptianWords('eldritch', difficulty, seed)) {
        assert.ok(
          !banned.has(word.glyphs),
          `bright power word ${word.spoken} at ${where(difficulty, seed)}`,
        );
      }
      for (const spoken of ['heka', 'djehuty', 'aset', 'usir', 'inpu', 'sekhmet', 'aapep']) {
        assert.ok(
          !line(difficulty, seed).includes(spoken),
          `bright word ${spoken} at ${where(difficulty, seed)}`,
        );
      }
    }
  }
});

test('eldritch difficulty 1 speaks a dread epithet', () => {
  for (const seed of SEEDS) {
    const words = line(1, seed);
    assert.strictEqual(words.length, 1);
    assert.ok(DREAD_SPOKEN.includes(words[0] ?? ''), `not dread: ${words[0]}`);
  }
});

test('the guttural suffix reaches every content root', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      for (const word of egyptianWords('eldritch', difficulty, seed)) {
        if (word.role !== 'content') continue;
        const phonograms = word.glyphs.slice(
          0,
          word.glyphs.length - (word.determinatives + word.suffix).length,
        );
        // Dread epithets are listed forms and carry the sieve inside their own
        // skeleton, so they are read for its presence rather than its position.
        if (DREAD_SPOKEN.includes(word.spoken)) {
          assert.ok(
            phonograms.includes(X_SIEVE),
            `dread epithet without the sieve at ${where(difficulty, seed)}`,
          );
          continue;
        }
        // The sieve stands before the determinative, unless the root already
        // closed on the hill slope q, which the rule exempts.
        assert.ok(
          phonograms.endsWith(X_SIEVE) || phonograms.endsWith('\u{1320E}'),
          `no guttural suffix on ${word.spoken} at ${where(difficulty, seed)}`,
        );
      }
    }
  }
});

test('the register doubles every determinative, evil bird on nouns and enemy on verbs', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      for (const word of egyptianWords('eldritch', difficulty, seed)) {
        if (word.role !== 'content') continue;
        const dets = codePoints(word.determinatives);
        assert.strictEqual(dets.length, 2, `single determinative at ${where(difficulty, seed)}`);
        assert.ok(
          dets[1] === G37_EVIL || dets[1] === A14_ENEMY,
          `unexpected appendix sign at ${where(difficulty, seed)}`,
        );
      }
    }
  }
});

test('the opener is the rite spoken backwards', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4]) {
      assert.deepStrictEqual(
        line(difficulty, seed).slice(0, 2),
        [...EO2_HEAD_SPOKEN],
        where(difficulty, seed),
      );
      // The title takes its topic from the dread pool.
      assert.ok(DREAD_SPOKEN.includes(line(difficulty, seed)[2] ?? ''), where(difficulty, seed));
    }
    for (const difficulty of [5, 6, 7]) {
      assert.deepStrictEqual(
        line(difficulty, seed).slice(0, 2),
        [...ELDRITCH_OPEN_SPOKEN],
        where(difficulty, seed),
      );
    }
    for (const difficulty of [8, 9]) {
      assert.deepStrictEqual(
        line(difficulty, seed).slice(0, 4),
        [...ELDRITCH_OPEN_SPOKEN, ...EO2_HEAD_SPOKEN],
        where(difficulty, seed),
      );
    }
  }
});

test('the gate address is inverted, the gatekeeper knows the caster', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [6, 7, 8, 9]) {
      const words = line(difficulty, seed);
      const expected = difficulty >= 8 ? 3 : 1;
      assert.strictEqual(
        words.filter((w) => w === 'rekhek').length,
        expected,
        `inverted address count at ${where(difficulty, seed)}`,
      );
      assert.ok(!words.includes('rekhi'), `upright address at ${where(difficulty, seed)}`);
      assert.ok(!words.includes('renek'), `upright name at ${where(difficulty, seed)}`);
      words.forEach((word, index) => {
        if (word !== 'rekhek') return;
        assert.strictEqual(words[index + 1], 'reni', where(difficulty, seed));
      });
    }
  }
});

test('the closing is the fixed dissolution pair, never a bright closer', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [5, 6]) {
      assert.deepStrictEqual(
        line(difficulty, seed).slice(-2),
        [...ELDRITCH_CLOSE_SPOKEN],
        where(difficulty, seed),
      );
    }
    for (const difficulty of [7, 8, 9]) {
      const words = line(difficulty, seed);
      const at = words.lastIndexOf('sep');
      assert.deepStrictEqual(
        words.slice(at - 2, at),
        [...ELDRITCH_CLOSE_SPOKEN],
        where(difficulty, seed),
      );
    }
    for (const difficulty of [5, 6, 7, 8, 9]) {
      const out = egyptian('eldritch', difficulty, seed);
      for (const banned of [...EC1_SPOKEN, ...EC2_SPOKEN]) {
        assert.ok(
          !out.transliteration.split(' ').includes(banned),
          `bright closer ${banned} at ${where(difficulty, seed)}`,
        );
      }
      assert.ok(out.glyphs.includes(ELDRITCH_CLOSE_GLYPHS), `closing glyphs at ${where(difficulty, seed)}`);
    }
  }
});

test('the eldritch seal is always nine', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [7, 8, 9]) {
      const out = egyptian('eldritch', difficulty, seed);
      const words = out.transliteration.split(' ');
      const at = words.lastIndexOf('sep');
      assert.strictEqual(words.slice(at + 1).join(' '), NUMERALS[9]?.[1], where(difficulty, seed));
      assert.ok(out.glyphs.endsWith(SEAL_SIGN + (NUMERALS[9]?.[0] ?? '')), where(difficulty, seed));
    }
    for (const difficulty of [1, 2, 3, 4, 5, 6]) {
      assert.ok(
        !egyptian('eldritch', difficulty, seed).glyphs.includes(SEAL_SIGN),
        `unexpected seal at ${where(difficulty, seed)}`,
      );
    }
  }
});

test('dread epithets appear exactly in their listed spoken form', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const dread = egyptianWords('eldritch', difficulty, seed).filter(
        (w) => w.role === 'content' && DREAD_SPOKEN.includes(w.spoken),
      );
      assert.ok(dread.length > 0, `no dread epithet at ${where(difficulty, seed)}`);
      for (const word of dread) {
        assert.strictEqual(word.determinatives, A14_ENEMY + G37_EVIL, where(difficulty, seed));
      }
    }
  }
});
