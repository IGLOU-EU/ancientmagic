import test from 'node:test';
import * as assert from 'node:assert/strict';
import { eldritchRoot } from '../src/ts/languages/runic.js';
import { FIELDS } from '../src/ts/languages/runic-data.js';
import type { SemanticField } from '../src/ts/generator/types.js';
import { SEEDS, runic } from './gen.js';

// Normative rune-name assignment table of spec 2.3.
const RUNE_NAME_TABLE: ReadonlyArray<readonly [string, string, SemanticField]> = [
  ['feh', 'hoarded wealth', 'hidden'],
  ['ur', 'primal beast', 'summoning'],
  ['thurs', 'hostile wight', 'death'],
  ['ans', 'god', 'summoning'],
  ['raid', 'ride, journey', 'gates'],
  ['kaun', 'sore', 'harm'],
  ['geb', 'binding gift', 'binding'],
  ['wunj', 'joy', 'warding'],
  ['hagl', 'hail', 'harm'],
  ['naud', 'need-fetter', 'binding'],
  ['is', 'ice', 'binding'],
  ['jer', 'harvest-year', 'time'],
  ['iw', 'yew', 'death'],
  ['perth', 'lot-cup', 'hidden'],
  ['alg', 'elk-guard', 'warding'],
  ['sowil', 'sun', 'fire'],
  ['tiw', 'the sky god', 'warding'],
  ['berk', 'birch', 'warding'],
  ['ehw', 'horse', 'summoning'],
  ['mann', 'mortal man', 'death'],
  ['lauk', 'leek', 'warding'],
  ['ingw', 'the god Ing', 'summoning'],
  ['dag', 'day', 'time'],
  ['othal', 'heritage', 'warding'],
];

test('rune-name roots follow the normative table and stay noun-only', () => {
  for (const [root, gloss, field] of RUNE_NAME_TABLE) {
    const entry = FIELDS[field].find((r) => r.root === root);
    assert.ok(entry !== undefined, `${root} missing from field ${field}`);
    assert.strictEqual(entry?.gloss, gloss, `gloss of ${root}`);
    assert.strictEqual(entry?.runeName, true, `${root} not flagged as rune name`);
    assert.ok(entry?.noun !== undefined, `${root} has no noun form`);
    assert.strictEqual(entry?.verb, undefined, `${root} must not be a verb`);
    assert.strictEqual(entry?.adj, undefined, `${root} must not be an adjective`);
    assert.strictEqual(entry?.adv, undefined, `${root} must not be an adverb`);
    assert.strictEqual(entry?.pp, undefined, `${root} must not carry a participle`);
  }
  const flagged = Object.values(FIELDS).flat().filter((r) => r.runeName === true);
  assert.strictEqual(flagged.length, 24, 'exactly the 24 rune names are flagged');
});

test('intransitive flags cover exactly kum and swelt', () => {
  const flagged = Object.values(FIELDS)
    .flat()
    .filter((r) => r.intransitive === true)
    .map((r) => r.root)
    .sort();
  assert.deepStrictEqual(flagged, ['kum', 'swelt']);
});

test('tier 2 never draws an intransitive intent', () => {
  const banned = new Set(['kum', 'swelt', eldritchRoot('kum'), eldritchRoot('swelt')]);
  for (const school of ['protection', 'curse', 'invocation', 'eldritch'] as const) {
    for (let seed = 0; seed < 60; seed += 1) {
      const verb = runic(school, 2, seed).transliteration.split(' ')[0] ?? '';
      assert.ok(!banned.has(verb), `intransitive ${verb} with an object (${school} seed ${seed})`);
    }
  }
});

test('tier 2 invocation pool is wider than wek and kall', () => {
  const verbs = new Set<string>();
  for (let seed = 0; seed < 120; seed += 1) {
    verbs.add(runic('invocation', 2, seed).transliteration.split(' ')[0] ?? '');
  }
  assert.ok(verbs.size >= 4, `only ${verbs.size} distinct tier 2 verbs observed`);
  const beyond = [...verbs].filter((v) => v !== 'wek' && v !== 'kall');
  assert.ok(beyond.length > 0, 'no draw beyond wek and kall');
  // The historical draws stay legal.
  for (const seed of SEEDS) {
    const verb = runic('invocation', 2, seed).transliteration.split(' ')[0] ?? '';
    assert.ok(verb.length > 0, `empty verb at seed ${seed}`);
  }
});
