// The Eldritch register over Ogham, spec 10.10.
//
// This register is a hybrid and the tests follow the split: transformation
// where a word is drawn, replacement everywhere else. So there are two kinds
// of assertion here. One says what the two rules did to the one verb they may
// touch. The other says that everything else in the line arrived whole, out of
// a closed set, because what nothing native could say is exactly what the
// register wants to be heard saying.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { DIFFICULTIES, SEEDS, clauseCount, label, ogham, oghamWords } from './gen.js';
import { DREAD_POWER, IDIOM_WORDS } from '../src/ts/languages/ogham-data.js';
import {
  ADVERBS,
  DREAD_TABLE,
  IDIOM_TABLE,
  PEITH,
  POWER_TABLE,
  ROW_NAMES,
  SEAL_HEAD_SPOKEN,
  TRANSFORMED_VERBS,
  truncations,
} from './ogham-spec.js';

const DREAD_IDS = DREAD_POWER.map((epithet) => epithet.id);
const NAMES = POWER_TABLE.map(([id]) => id);

function eldritch(difficulty: number, seed: number): string[] {
  return oghamWords('eldritch', difficulty, seed);
}

test('the reversed row is the whole opening, and no school opener stands beside it', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const words = eldritch(difficulty, seed);
      const where = label('eldritch', difficulty, seed);
      const expected =
        difficulty < 6
          ? ['idad', 'edad', 'ur', 'onn', 'ailm']
          : [...ROW_NAMES].reverse();
      assert.deepStrictEqual(words.slice(0, expected.length), expected, `the opening of ${where}`);
      // OO1, OO2, OO4, OO5 and OO6 never appear under the register.
      for (const id of ['OO1', 'OO2', 'OO4', 'OO5', 'OO6']) {
        const opener = (IDIOM_TABLE[id]?.[0] ?? '').split(' ');
        assert.ok(
          !words.join(' ').includes(opener.join(' ')),
          `${id} under the register in ${where}`,
        );
      }
    }
  }
});

test('every closing is the fixed dread pair and nothing else', () => {
  for (const difficulty of [5, 6, 7, 8, 9]) {
    for (let seed = 0; seed < 40; seed += 1) {
      const words = eldritch(difficulty, seed);
      const where = label('eldritch', difficulty, seed);
      const seal = words.lastIndexOf(SEAL_HEAD_SPOKEN);
      const body = seal < 0 ? words : words.slice(0, seal);
      assert.deepStrictEqual(body.slice(-2), ['coll', 'temell'], `the closing of ${where}`);
      // OC3 never stacks behind it, unlike every clear school at tiers 8 and 9.
      assert.ok(!words.includes('ogmi'), `OC3 under the register in ${where}`);
    }
  }
});

test('the seal is always nine, at every tier that carries one', () => {
  for (const difficulty of [7, 8, 9]) {
    for (let seed = 0; seed < 60; seed += 1) {
      const words = eldritch(difficulty, seed);
      const at = words.lastIndexOf(SEAL_HEAD_SPOKEN);
      assert.strictEqual(
        words.slice(at).join(' '),
        'snad novan',
        `the seal of ${label('eldritch', difficulty, seed)}`,
      );
    }
  }
});

test('the two rules are visible in the verb, and nothing else is transformed', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (let seed = 0; seed < 60; seed += 1) {
      const words = eldritch(difficulty, seed);
      const where = label('eldritch', difficulty, seed);
      const verbs = words.filter((word) => TRANSFORMED_VERBS.includes(word));
      // One summoning verb per clause, and the tiers say how many clauses.
      assert.strictEqual(verbs.length, clauseCount(difficulty), `transformed verbs in ${where}`);
      // The bright vowel drowned, so no i survives in the verb, and the cut
      // stuttered, so its final consonant stands twice.
      for (const verb of verbs) {
        assert.ok(!verb.includes('i'), `an undrowned vowel in ${where}`);
        assert.ok(verb.slice(-2) === verb.slice(-1).repeat(2), `an unstuttered final in ${where}`);
      }
      // And the two forms the register can produce are exactly the two the
      // spec names, so the untransformed roots never reach the line.
      assert.ok(!words.includes('tic'), `an untransformed tic in ${where}`);
      assert.ok(!words.includes('ling'), `an untransformed ling in ${where}`);
    }
  }
});

test('no attested name of 10.7 reaches an eldritch line, compared on glyphs', () => {
  for (const difficulty of DIFFICULTIES) {
    for (let seed = 0; seed < 40; seed += 1) {
      const out = ogham('eldritch', difficulty, seed);
      const where = label('eldritch', difficulty, seed);
      for (const [id, glyphs] of POWER_TABLE) {
        assert.ok(!out.glyphs.includes(glyphs), `the name ${id} in ${where}`);
      }
      for (const name of NAMES) {
        assert.ok(!out.transliteration.split(' ').includes(name), `the name ${name} in ${where}`);
      }
    }
  }
});

test('every word of an eldritch formula belongs to the closed set of 10.13', () => {
  const reversed = [...ROW_NAMES].reverse();
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (let seed = 0; seed < 40; seed += 1) {
      const words = eldritch(difficulty, seed);
      const where = label('eldritch', difficulty, seed);
      const steps = DREAD_POWER.flatMap((epithet) => truncations(epithet.letters));
      const allowed = new Set([
        ...reversed,
        ...DREAD_IDS,
        ...steps,
        ...TRANSFORMED_VERBS,
        // The MODIFIER of 10.9 is mandatory at tier 4 and drawn above it, and
        // the invocation family takes adverbs, so the six of 10.4 reach this
        // school too. The two rules never touch them: they are drawn material
        // outside the INTENT slot.
        ...ADVERBS,
        'coll',
        'temell',
        SEAL_HEAD_SPOKEN,
        'novan',
      ]);
      for (const word of words) {
        assert.ok(allowed.has(word), `${word} is outside the closed set in ${where}`);
      }
    }
  }
});

test('the dread epithets are the whole of the AGENT and POWER-WORD slots', () => {
  for (const difficulty of [3, 5, 8]) {
    for (let seed = 0; seed < 40; seed += 1) {
      const words = eldritch(difficulty, seed);
      const where = label('eldritch', difficulty, seed);
      const drawn = words.filter((word) => DREAD_IDS.includes(word));
      assert.ok(drawn.length >= 2, `too few epithets in ${where}`);
      // They stand in their listed forms: no genitive -i, no agreement, the
      // chain of 10.5 suspended (spec 10.10).
      for (const word of drawn) {
        assert.ok(DREAD_IDS.includes(word), `${word} was inflected in ${where}`);
      }
    }
  }
});

test('every epithet carries the letter the language lost', () => {
  for (const [word, glyphs] of DREAD_TABLE) {
    assert.ok(word.includes('p'), `${word} carries no p`);
    assert.ok(glyphs.includes(PEITH), `${word} writes no peith`);
  }
});

test('the register tally cuts the epithet it drew, never the birch', () => {
  const birch = IDIOM_WORDS.OO1[0]?.spoken ?? '';
  for (let seed = 0; seed < 40; seed += 1) {
    const words = eldritch(9, seed);
    assert.ok(!words.includes(birch), `the birch warning under the register at seed ${seed}`);
    // The repetition is settled before the clauses draw, so the epithet it
    // cuts is not the first one on the line: the tally is the run whose second
    // word is the first word minus a letter.
    const start = words.findIndex((word, index) => {
      const epithet = DREAD_POWER.find((entry) => entry.id === word);
      if (epithet === undefined) return false;
      return words[index + 1] === truncations(epithet.letters)[1];
    });
    assert.ok(start >= 0, `no tally at seed ${seed}`);
    const cut = DREAD_POWER.find((entry) => entry.id === words[start]);
    const steps = truncations(cut?.letters ?? []);
    assert.deepStrictEqual(
      words.slice(start, start + steps.length),
      steps,
      `the tally at seed ${seed}`,
    );
  }
});
