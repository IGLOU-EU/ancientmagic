import test from 'node:test';
import * as assert from 'node:assert/strict';
import { eldritchRoot } from '../src/ts/languages/runic.js';
import {
  BRIGHT_POWER_WORDS,
  DREAD_EPITHETS,
  ELDRITCH_OPENING_FULL,
  ELDRITCH_OPENING_SHORT,
  NUMERAL_WORDS,
} from './runic-spec.js';
import { DIFFICULTIES, SEEDS, alignSegments, clauseCount, runic } from './gen.js';

test('eldritch distortion follows the three ordered rules', () => {
  // Worked examples of section 2.10.
  assert.strictEqual(eldritchRoot('ward'), 'wuzrd');
  assert.strictEqual(eldritchRoot('bind'), 'buznd');
  assert.strictEqual(eldritchRoot('gal'), 'guzl');
  // Diphthongs ai and au collapse to u before the z injection.
  assert.strictEqual(eldritchRoot('hait'), 'huzt');
  assert.strictEqual(eldritchRoot('draum'), 'druzm');
  // A vowel-final root gains the guttural coda after all three rules.
  assert.strictEqual(eldritchRoot('mena'), 'moznuh');
  // The ei rune is a single token and rule 1 leaves it alone.
  assert.strictEqual(eldritchRoot('eim'), 'eizm');
});

test('eldritch bans every bright power word', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const out = runic('eldritch', difficulty, seed);
      for (const word of out.transliteration.split(' ')) {
        assert.ok(
          !BRIGHT_POWER_WORDS.includes(word),
          `bright word ${word} at d${difficulty} seed ${seed}`,
        );
      }
    }
  }
});

test('eldritch difficulty 1 speaks a dread epithet', () => {
  for (const seed of SEEDS) {
    const out = runic('eldritch', 1, seed);
    const words = out.transliteration.split(' ');
    assert.strictEqual(words.length, 1);
    assert.ok(DREAD_EPITHETS.includes(words[0] ?? ''), `not dread: ${words[0]}`);
  }
});

test('eldritch openings are the reversed rune row', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4, 5]) {
      const { segments } = alignSegments(runic('eldritch', difficulty, seed));
      assert.strictEqual(segments[0]?.[0], ELDRITCH_OPENING_SHORT, `d${difficulty} seed ${seed}`);
    }
    for (const difficulty of [6, 7, 8, 9]) {
      const { segments } = alignSegments(runic('eldritch', difficulty, seed));
      assert.strictEqual(segments[0]?.[0], ELDRITCH_OPENING_FULL, `d${difficulty} seed ${seed}`);
    }
  }
});

test('eldritch closes on runoz gnagido and never on the bright closings', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [5, 6, 7, 8, 9]) {
      const { segments } = alignSegments(runic('eldritch', difficulty, seed));
      assert.deepStrictEqual(
        segments[segments.length - 1],
        ['runoz', 'gnagido'],
        `d${difficulty} seed ${seed}`,
      );
    }
  }
});

test('eldritch clause and litany segments per tier', () => {
  const expected = (d: number): number => {
    if (d < 5) return 1;
    if (d === 5) return 2;
    if (d <= 7) return 3;
    return 5; // three clauses, the dread litany, one gnawed closing
  };
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      const { segments } = alignSegments(runic('eldritch', difficulty, seed));
      assert.strictEqual(segments.length, expected(difficulty), `d${difficulty} seed ${seed}`);
    }
  }
});

test('eldritch clauses end on a dread epithet', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      const { segments } = alignSegments(runic('eldritch', difficulty, seed));
      for (let c = 0; c < clauseCount(difficulty); c += 1) {
        const clause = segments[c] ?? [];
        assert.ok(
          DREAD_EPITHETS.includes(clause[clause.length - 1] ?? ''),
          `clause end at d${difficulty} seed ${seed}`,
        );
      }
    }
  }
});

test('eldritch litany draws from the dread pool', () => {
  for (const seed of SEEDS) {
    const t8 = alignSegments(runic('eldritch', 8, seed)).segments[3] ?? [];
    assert.strictEqual(t8.length, 3, `d8 seed ${seed}`);
    assert.ok(
      t8[0] === t8[1] && t8[1] === t8[2] && DREAD_EPITHETS.includes(t8[0] ?? ''),
      `bad dread triple at seed ${seed}`,
    );
    const t9 = alignSegments(runic('eldritch', 9, seed)).segments[3] ?? [];
    assert.ok(t9.length >= 4, `triangle too short at seed ${seed}`);
    assert.ok(DREAD_EPITHETS.includes(t9[0] ?? ''), `triangle base not dread at seed ${seed}`);
  }
});

test('eldritch numeric seal is always nine', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [7, 8, 9]) {
      const out = runic('eldritch', difficulty, seed);
      const { sealWord } = alignSegments(out);
      assert.strictEqual(sealWord, NUMERAL_WORDS[9], `d${difficulty} seed ${seed}`);
    }
    for (const difficulty of [1, 2, 3, 4, 5, 6]) {
      const out = runic('eldritch', difficulty, seed);
      assert.ok(!out.glyphs.includes('\u{16ED}'), `unexpected seal at d${difficulty} seed ${seed}`);
    }
  }
});
