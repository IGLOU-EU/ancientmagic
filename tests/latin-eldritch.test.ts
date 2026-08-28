import test from 'node:test';
import * as assert from 'node:assert/strict';
import { lettersFor } from '../src/ts/languages/latin.js';
import { FIELDS } from '../src/ts/languages/latin-data.js';
import {
  CAPITALS,
  DREAD_WORDS,
  ELDRITCH_CLOSE,
  ELDRITCH_OPEN_FULL,
  ELDRITCH_OPEN_SHORT,
  INTERPUNCT,
  LC1,
  LC2,
  LC3,
  LC4,
  LC5_TAIL_SPEC,
  LO1,
  LO2,
  LO4,
  LO5,
  LO6,
  NUMERALS,
  POWER_TABLE,
  POWER_WORDS,
  SEAL_TAIL_SPOKEN,
  SHRINKING_STEPS,
  VERB_ENDINGS,
  truncations,
} from './latin-spec.js';
import { DIFFICULTIES, SEEDS, label, latin, latinWords } from './gen.js';

const SUMMONING = new Set(FIELDS.summoning.map((r) => r.root));

// Spec 9.13: every word of an Eldritch formula belongs to a closed set. The
// list is exhaustive on purpose, and the register that transforms nothing must
// emit nothing this section cannot account for.
function accountedFor(word: string): boolean {
  if (DREAD_WORDS.includes(word)) return true;
  // A truncation step of the tier 9 triangle, which shrinks the epithet the
  // repetition drew. Fragments of a word that was never Latin cannot read as
  // broken Latin, which is what lets the register keep both devices (9.10.4).
  if (DREAD_WORDS.some((epithet) => truncations(epithet).includes(word))) return true;
  if (ELDRITCH_OPEN_FULL.includes(word)) return true;
  if (ELDRITCH_CLOSE.includes(word)) return true;
  if (word === SEAL_TAIL_SPOKEN || word === NUMERALS[9]?.[1]) return true;
  if (word === 'et') return true;
  // A drawn lexicon form, correct per 9.4: the summons in its imperative, an
  // accusative object at tier 2, or an adverb before the verb.
  return Object.values(FIELDS)
    .flat()
    .some((root) => {
      if (!word.startsWith(root.root)) return false;
      const ending = word.slice(root.root.length);
      return VERB_ENDINGS.includes(ending) || ['a', 'am', 'um', 'e'].includes(ending);
    });
}

test('the register transforms nothing: every word is accounted for', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const where = label('eldritch', difficulty, seed);
      for (const word of latinWords('eldritch', difficulty, seed)) {
        assert.ok(accountedFor(word), `${word} is outside the closed set in ${where}`);
      }
    }
  }
});

// The summons is in perfect Latin because the caller is Roman, and what
// answers is not (spec 9.10, rule 2).
test('the summoning verb stands undistorted in its real imperative', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('eldritch', difficulty, seed);
      const words = latinWords('eldritch', difficulty, seed);
      const verbs = words.filter((word) => {
        const root = word.slice(0, -1);
        return word.endsWith('a') && SUMMONING.has(root);
      });
      assert.ok(verbs.length > 0, `no summons in ${where}`);
      for (const verb of verbs) {
        // Undistorted means the stem comes back whole out of the ending.
        assert.ok(SUMMONING.has(verb.slice(0, -1)), `${verb} is not a summoning stem in ${where}`);
      }
    }
  }
});

// The ban of 1.4 falls on the slots a power is drawn into. Nothing of 9.7
// survives anywhere in this register's output, because its own opening quotes
// the square rather than a name (spec 9.13).
test('eldritch output speaks none of the ten attested rows, compared on glyphs', () => {
  const banned = POWER_TABLE.map(([, glyphs]) => glyphs.split(INTERPUNCT));
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const where = label('eldritch', difficulty, seed);
      const groups = latin('eldritch', difficulty, seed).glyphs.split(INTERPUNCT);
      // Every ban is asserted on whole glyph words, never on a substring.
      for (const row of banned) {
        assert.ok(
          !groups.some((_unused, index) =>
            row.every((glyphs, offset) => groups[index + offset] === glyphs),
          ),
          `${row.join(INTERPUNCT)} in ${where}`,
        );
      }
    }
  }
});

test('the whole opening is the square read against its order', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4, 5]) {
      const words = latinWords('eldritch', difficulty, seed);
      assert.deepStrictEqual(
        words.slice(0, ELDRITCH_OPEN_SHORT.length),
        [...ELDRITCH_OPEN_SHORT],
        label('eldritch', difficulty, seed),
      );
    }
    for (const difficulty of [6, 7, 8, 9]) {
      const words = latinWords('eldritch', difficulty, seed);
      assert.deepStrictEqual(
        words.slice(0, ELDRITCH_OPEN_FULL.length),
        [...ELDRITCH_OPEN_FULL],
        label('eldritch', difficulty, seed),
      );
    }
    // The clear openers never appear under the register (spec 9.10).
    for (const difficulty of DIFFICULTIES) {
      const words = latinWords('eldritch', difficulty, seed);
      for (const part of [...LO1, ...LO2, ...LO4, ...LO5, ...LO6]) {
        assert.ok(!words.includes(part), `${part} in ${label('eldritch', difficulty, seed)}`);
      }
    }
  }
});

test('every closing is the fixed dread pair, and the seal is always nine', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [5, 6, 7, 8, 9]) {
      const where = label('eldritch', difficulty, seed);
      const words = latinWords('eldritch', difficulty, seed);
      const seal = difficulty >= 7 ? words.lastIndexOf(SEAL_TAIL_SPOKEN) - 1 : -1;
      const end = seal > 0 ? seal : words.length;
      assert.deepStrictEqual(
        words.slice(end - ELDRITCH_CLOSE.length, end),
        [...ELDRITCH_CLOSE],
        `closer in ${where}`,
      );
      for (const part of [...LC1, ...LC2, ...LC3, ...LC4, LC5_TAIL_SPEC]) {
        assert.ok(!words.includes(part), `${part} in ${where}`);
      }
      if (difficulty >= 7) {
        assert.deepStrictEqual(words.slice(-2), [NUMERALS[9]?.[1], SEAL_TAIL_SPOKEN], `seal in ${where}`);
        assert.ok(latin('eldritch', difficulty, seed).glyphs.endsWith('VIIII·DICITO'), where);
      }
    }
  }
});

// The register realizes itself by selection and replacement, so its own words
// arrive whole or not at all. No shrunk shape exists for an assertion to find,
// which is itself the assertion (spec 9.10, 9.13).
test('dread epithets appear only in their listed forms, at every tier', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const where = label('eldritch', difficulty, seed);
      const words = latinWords('eldritch', difficulty, seed);
      const found = words.filter((word) => DREAD_WORDS.some((epithet) => word.startsWith(epithet)));
      // Tier 2 is the one tier the register speaks no name at all.
      assert.ok(found.length > 0 || difficulty === 2, `no epithet in ${where}`);
      for (const word of found) {
        assert.ok(DREAD_WORDS.includes(word), `${word} is not a listed epithet in ${where}`);
      }
      // The attested rows stay banned, so no step of the bright triangle can
      // reach this register (spec 9.7, 9.10).
      for (const step of SHRINKING_STEPS) {
        assert.ok(!words.includes(step), `a bright shrinking step in ${where}`);
      }
      if (difficulty === 8) {
        const at = words.findIndex(
          (word, index) =>
            DREAD_WORDS.includes(word) && words[index + 1] === word && words[index + 2] === word,
        );
        assert.ok(at > 0, `no triple in ${where}`);
      }
      if (difficulty === 9) {
        // The triangle shrinks the epithet the repetition drew, down to a
        // single letter (spec 9.10.4).
        const head = DREAD_WORDS.find((epithet) =>
          words.some((_unused, index) =>
            truncations(epithet).every((step, offset) => words[index + offset] === step),
          ),
        );
        assert.ok(head !== undefined, `no triangle in ${where}`);
        assert.ok(words.includes((head ?? '').slice(0, 1)), `the triangle stops short in ${where}`);
      }
    }
  }
});

// The register keeps its Latin correct to the letter, so tier 2 comes out as a
// clear command on a dark field. The spec author raised it and the owner
// accepted it: the register's mark at that tier is the field and the company
// it keeps, not the word (ruling recorded against spec 9.9).
test('tier 2 emits correct Latin, an imperative and its accusative', () => {
  for (const seed of SEEDS) {
    const where = label('eldritch', 2, seed);
    const words = latinWords('eldritch', 2, seed);
    assert.strictEqual(words.length, 2, `tier 2 is not two genes in ${where}`);
    const [verb, target] = words;
    assert.ok(SUMMONING.has((verb ?? '').slice(0, -1)), `${verb ?? ''} is not a summons in ${where}`);
    assert.match(target ?? '', /(?:am|um)$/u, `${target ?? ''} is not accusative in ${where}`);
    // The two genes are written continuously, so the reader sees one run.
    assert.ok(!latin('eldritch', 2, seed).glyphs.includes(INTERPUNCT), `separator in ${where}`);
  }
});

test('the register writes the same capitals as every other school', () => {
  const allowed = new Set([...CAPITALS, INTERPUNCT]);
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const glyphs = latin('eldritch', difficulty, seed).glyphs;
      for (const character of glyphs) {
        assert.ok(
          allowed.has(character),
          `${character} in ${label('eldritch', difficulty, seed)}`,
        );
      }
    }
  }
  // The epithets are built to fail the phonotactics of 9.3, not the alphabet
  // of 9.1: every one of them writes with the twenty letters and no more.
  for (const word of DREAD_WORDS) {
    for (const character of lettersFor(word)) {
      assert.ok(CAPITALS.includes(character), `${character} of ${word} is off the table`);
    }
  }
  // No chant or name of 9.7 stands in the register's own vocabulary.
  for (const words of Object.values(POWER_WORDS)) {
    for (const word of words) {
      assert.ok(!DREAD_WORDS.includes(word), `${word} is both attested and dread`);
    }
  }
});

// The register's tiers 8 and 9 stay distinct, the triple against the triangle
// (spec 9.9). Before the realignment they emitted the same bytes, which is the
// defect this ruling was written to close.
test('the register writes a different tier 9 from its tier 8', () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const eight = latin('eldritch', 8, seed);
    const nine = latin('eldritch', 9, seed);
    assert.notStrictEqual(eight.glyphs, nine.glyphs, `d8 and d9 alike at seed ${seed}`);
    assert.notStrictEqual(eight.gloss, nine.gloss, `d8 and d9 gloss alike at seed ${seed}`);
  }
});
