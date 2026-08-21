import test from 'node:test';
import * as assert from 'node:assert/strict';
import { citation, degrade, eldritchRoot, speak, tokenize } from '../src/ts/languages/phoenician.js';
import {
  DARK_SPOKEN,
  DREAD_SPOKEN,
  ELDRITCH_CLOSE_SPOKEN,
  NAME_TABLE,
  NUMERALS,
  PC1_GLYPHS,
  PO1_HEAD_SPOKEN,
  PO2_HEAD_SPOKEN,
  PROCLITIC_B,
  PROCLITIC_L,
  SEAL_HEAD_SPOKEN,
  WORD_SEP,
} from './phoenician-spec.js';
import { DIFFICULTIES, SEEDS, phoenician, phoenicianWords } from './gen.js';

const where = (difficulty: number, seed: number): string => `d${difficulty} seed ${seed}`;

const line = (difficulty: number, seed: number): string[] =>
  phoenician('eldritch', difficulty, seed).transliteration.split(' ');

test('eldritch never writes an attested divine name', () => {
  // Asserted on the glyph line, as the cross-genome checklist requires.
  const banned = new Set(NAME_TABLE.map(([, glyphs]) => glyphs));
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      for (const word of phoenicianWords('eldritch', difficulty, seed)) {
        assert.ok(!banned.has(word.glyphs), `divine name at ${where(difficulty, seed)}`);
      }
      const words = line(difficulty, seed);
      for (const spoken of NAME_TABLE.map(([, , s]) => s)) {
        assert.ok(!words.includes(spoken), `bright word ${spoken} at ${where(difficulty, seed)}`);
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

test('every coined root of the register is quadriliteral and degraded', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      for (const word of phoenicianWords('eldritch', difficulty, seed)) {
        if (word.kind !== 'content' || word.root === null) continue;
        const radicals = tokenize(word.root);
        assert.strictEqual(radicals.length, 4, `radical count of ${word.root}`);
        assert.strictEqual(radicals[3], 'gh', `no fourth radical on ${word.root}`);
        // Rule 1 leaves no plain t, s or k standing in a coined root.
        for (const radical of radicals) {
          assert.ok(
            radical !== 't' && radical !== 's' && radical !== 'k',
            `unshifted radical ${radical} in ${word.root} at ${where(difficulty, seed)}`,
          );
        }
        // Rule 3 leaves no a and no e in the spoken form of a coined word.
        const stem = word.spoken.replace(/^(?:we|le|be|ha)+/, '');
        assert.ok(!/[ae]/u.test(stem), `undegraded vowel in ${word.spoken}`);
      }
    }
  }
});

test('the emphatic shift and the fourth radical follow the spec example', () => {
  assert.strictEqual(eldritchRoot('shmr'), 'shmrgh');
  assert.strictEqual(speak(degrade(citation(eldritchRoot('shmr')))), 'shomrugh');
  // kh stays one token, t becomes the emphatic tt, which is spoken t again.
  assert.strictEqual(eldritchRoot('khtm'), 'khttmgh');
  assert.strictEqual(speak(degrade(citation(eldritchRoot('khtm')))), 'khotmugh');
  assert.strictEqual(eldritchRoot('skk'), 'tsqqgh');
});

test('the opener inverts to an incantation spoken by the dread one', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const words = phoenicianWords('eldritch', difficulty, seed);
      const spoken = words.map((w) => w.spoken);
      const at = spoken.indexOf(PO1_HEAD_SPOKEN);
      assert.ok(at >= 0, `no incantation opener at ${where(difficulty, seed)}`);
      const bearer = words[at + 1];
      assert.ok(
        bearer?.spoken.startsWith(PROCLITIC_B.spoken),
        `opener not inverted to b at ${where(difficulty, seed)}`,
      );
      assert.ok(
        DREAD_SPOKEN.includes(bearer?.spoken.slice(2) ?? ''),
        `opener bearer is not dread at ${where(difficulty, seed)}`,
      );
      // The upright l form of the amulet never survives the register.
      assert.notStrictEqual(
        words[at + 1]?.spoken.startsWith(PROCLITIC_L.spoken),
        true,
        `upright opener at ${where(difficulty, seed)}`,
      );
    }
  }
});

test('the self presentation turns into a self dedication', () => {
  for (const difficulty of [6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const words = phoenicianWords('eldritch', difficulty, seed);
      assert.strictEqual(words[0]?.spoken, PO2_HEAD_SPOKEN, where(difficulty, seed));
      const bearer = words[1];
      assert.ok(
        bearer?.spoken.startsWith(PROCLITIC_L.spoken),
        `no l dedication at ${where(difficulty, seed)}`,
      );
      assert.ok(
        DREAD_SPOKEN.includes(bearer?.spoken.slice(2) ?? ''),
        `dedication is not dread at ${where(difficulty, seed)}`,
      );
    }
  }
});

test('dread epithets keep their listed form, a proclitic being the only affix', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const dread = phoenicianWords('eldritch', difficulty, seed).filter((w) => w.kind === 'dread');
      // Tier 2 is two coined genes and carries no power word slot at all.
      if (difficulty !== 2) {
        assert.ok(dread.length > 0, `no dread epithet at ${where(difficulty, seed)}`);
      }
      for (const word of dread) {
        const bare = word.spoken.replace(/^(?:we|le|be)/, '');
        assert.ok(DREAD_SPOKEN.includes(bare), `epithet off its listed form: ${word.spoken}`);
        // No article, no plural, no pattern morphology.
        assert.ok(!word.spoken.startsWith('ha'), `article on ${word.spoken}`);
        assert.ok(!bare.endsWith('im'), `plural on ${word.spoken}`);
      }
    }
  }
});

test('the closing is the dread gate line, never the blessing', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [5, 6]) {
      assert.deepStrictEqual(
        line(difficulty, seed).slice(-3),
        [...ELDRITCH_CLOSE_SPOKEN],
        where(difficulty, seed),
      );
    }
    for (const difficulty of [7, 8, 9]) {
      const words = line(difficulty, seed);
      const at = words.lastIndexOf(SEAL_HEAD_SPOKEN);
      assert.deepStrictEqual(
        words.slice(at - 3, at),
        [...ELDRITCH_CLOSE_SPOKEN],
        where(difficulty, seed),
      );
    }
    for (const difficulty of [5, 6, 7, 8, 9]) {
      // The ban is read on the glyph line, as the checklist requires, and on
      // the whole formula: single words collide across the register, the
      // shrinking qlghsh passes through the same two letters as the ql of PC1.
      const blessing = PC1_GLYPHS.join(WORD_SEP);
      assert.ok(
        !phoenician('eldritch', difficulty, seed).glyphs.includes(blessing),
        `blessing formula at ${where(difficulty, seed)}`,
      );
    }
  }
});

test('the eldritch seal is always nine', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [7, 8, 9]) {
      const out = phoenician('eldritch', difficulty, seed);
      const words = out.transliteration.split(' ');
      const at = words.lastIndexOf(SEAL_HEAD_SPOKEN);
      assert.strictEqual(words.slice(at + 1).join(' '), NUMERALS[9]?.[1], where(difficulty, seed));
      assert.ok(out.glyphs.endsWith(NUMERALS[9]?.[0] ?? ''), where(difficulty, seed));
    }
    for (const difficulty of [1, 2, 3, 4, 5, 6]) {
      assert.ok(
        !line(difficulty, seed).includes(SEAL_HEAD_SPOKEN),
        `unexpected seal at ${where(difficulty, seed)}`,
      );
    }
  }
});

test('the dark names stay available to the curse school only', () => {
  // Spec 4.7 assigns reshep, horon and sasam to the curse, and 1.4 keeps every
  // attested name out of the register.
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      for (const dark of DARK_SPOKEN) {
        assert.ok(!line(difficulty, seed).includes(dark), `${dark} at ${where(difficulty, seed)}`);
      }
    }
  }
});
