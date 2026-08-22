// The shared-formula format.
//
// A link copied today must still open the same formula when the reading side
// lands, so the format is pinned here rather than left to whatever the writer
// happens to emit. That is why decode ships before anything calls it: it is the
// half of the contract that says what the text means, and these tests are the
// only thing holding the two halves together until the page reads a link.
//
// Rejection carries as much of the contract as acceptance. Anything decode
// accepts is something a future slice will have to replay, so it accepts
// exactly what encode writes and nothing else.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { decode, encode, LANGUAGES, SCHOOLS } from '../src/ts/share.js';
import { GENOME_LOADERS } from '../src/ts/languages/index.js';
import { ALL_SCHOOLS } from './gen.js';

// The runic fixture of genomes.md section 5, the one the page ships pre-rendered.
const FIXTURE = { settings: { language: 'runic', school: 'protection', difficulty: 5 }, seed: 66238 } as const;

function sorted(values: Iterable<string>): string[] {
  return Array.from(values).sort();
}

test('share: a formula is written as language.school.difficulty.seed', () => {
  assert.strictEqual(encode(FIXTURE.settings, FIXTURE.seed), 'runic.protection.5.66238');
});

test('share: the ids are the genome and school ids, spelled out', () => {
  assert.strictEqual(
    encode({ language: 'phoenician', school: 'eldritch', difficulty: 9 }, 0),
    'phoenician.eldritch.9.0',
  );
});

test('share: decode reads every field back', () => {
  assert.deepStrictEqual(decode('runic.protection.5.66238'), FIXTURE);
});

test('share: decode accepts the leading hash the location gives it', () => {
  assert.deepStrictEqual(decode('#runic.protection.5.66238'), FIXTURE);
});

test('share: every state the altar can reach round-trips', () => {
  for (const language of LANGUAGES) {
    for (const school of SCHOOLS) {
      for (let difficulty = 1; difficulty <= 9; difficulty += 1) {
        for (const seed of [0, 1, 66238, 2147483648, 4294967295]) {
          const settings = { language, school, difficulty };
          const text = encode(settings, seed);
          assert.deepStrictEqual(decode(text), { settings, seed }, text);
        }
      }
    }
  }
});

// encode must never write something decode refuses, so it normalizes its two
// numbers the way the pipeline does before it seeds and plans. A link that
// named a difficulty the generator did not use would be a lie.
test('share: encode names the difficulty the generator actually used', () => {
  assert.strictEqual(encode({ language: 'runic', school: 'curse', difficulty: 12 }, 1), 'runic.curse.9.1');
  assert.strictEqual(encode({ language: 'runic', school: 'curse', difficulty: 0 }, 1), 'runic.curse.1.1');
  assert.strictEqual(encode({ language: 'runic', school: 'curse', difficulty: 5.7 }, 1), 'runic.curse.5.1');
});

test('share: encode names the seed the generator actually used', () => {
  assert.strictEqual(encode(FIXTURE.settings, -1), 'runic.protection.5.4294967295');
  assert.strictEqual(encode(FIXTURE.settings, 4294967296), 'runic.protection.5.0');
});

test('share: whatever encode writes, decode accepts', () => {
  for (const [difficulty, seed] of [
    [-3, -1],
    [99, 4294967296],
    [5.7, 66238.9],
  ]) {
    const text = encode({ language: 'egyptian', school: 'invocation', difficulty }, seed);
    assert.notStrictEqual(decode(text), null, text);
  }
});

// --- what decode refuses ----------------------------------------------------

test('share: a text of the wrong shape is not a formula', () => {
  for (const text of [
    '',
    '#',
    '.',
    '...',
    'runic',
    'runic.protection',
    'runic.protection.5',
    'runic.protection.5.66238.7',
    'runic.protection.5.66238.',
    '.runic.protection.5.66238',
    '##runic.protection.5.66238',
    'runic/protection/5/66238',
    'runic protection 5 66238',
  ]) {
    assert.strictEqual(decode(text), null, `accepted ${JSON.stringify(text)}`);
  }
});

test('share: a genome the site does not carry is not a formula', () => {
  for (const text of [
    'greek.protection.5.1',
    'RUNIC.protection.5.1',
    'Runic.protection.5.1',
    'runics.protection.5.1',
    '.protection.5.1',
  ]) {
    assert.strictEqual(decode(text), null, `accepted ${JSON.stringify(text)}`);
  }
});

test('share: a school the site does not teach is not a formula', () => {
  for (const text of [
    'runic.divination.5.1',
    'runic.chronomancy.5.1',
    'runic.PROTECTION.5.1',
    'runic..5.1',
  ]) {
    assert.strictEqual(decode(text), null, `accepted ${JSON.stringify(text)}`);
  }
});

test('share: a difficulty outside the nine tiers is not a formula', () => {
  for (const text of [
    'runic.protection.0.1',
    'runic.protection.10.1',
    'runic.protection.-1.1',
    'runic.protection.+5.1',
    'runic.protection.05.1',
    'runic.protection.5.5.1',
    'runic.protection.five.1',
    'runic.protection..1',
    'runic.protection. 5.1',
  ]) {
    assert.strictEqual(decode(text), null, `accepted ${JSON.stringify(text)}`);
  }
});

test('share: a seed outside an unsigned 32 bit number is not a formula', () => {
  for (const text of [
    'runic.protection.5.-1',
    'runic.protection.5.+1',
    'runic.protection.5.4294967296',
    'runic.protection.5.99999999999999999999',
    'runic.protection.5.007',
    'runic.protection.5.0x10',
    'runic.protection.5.1e5',
    'runic.protection.5.66238.0',
    'runic.protection.5.abc',
    'runic.protection.5.',
    'runic.protection.5. 1',
    'runic.protection.5.NaN',
    'runic.protection.5.Infinity',
  ]) {
    assert.strictEqual(decode(text), null, `accepted ${JSON.stringify(text)}`);
  }
});

test('share: surrounding whitespace is not trimmed away', () => {
  for (const text of [' runic.protection.5.1', 'runic.protection.5.1 ', '\nrunic.protection.5.1']) {
    assert.strictEqual(decode(text), null, `accepted ${JSON.stringify(text)}`);
  }
});

// --- the format cannot drift from what the site ships -----------------------

test('share: the languages a link may name are the genomes the registry carries', () => {
  assert.deepStrictEqual(sorted(LANGUAGES), sorted(Object.keys(GENOME_LOADERS)));
});

test('share: the schools a link may name are the schools the plan builds', () => {
  assert.deepStrictEqual(sorted(SCHOOLS), sorted(ALL_SCHOOLS));
});
