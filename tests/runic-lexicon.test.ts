import test from 'node:test';
import * as assert from 'node:assert/strict';
import { eldritchRoot, runesFor } from '../src/ts/languages/runic.js';
import { FIELDS, IDIOM_WORDS, NORSE_VOX } from '../src/ts/languages/runic-data.js';
import { runicGlosses } from '../src/ts/glosses/en/runic.js';
import { runicGlosses as frRunicGlosses } from '../src/ts/glosses/fr/runic.js';
import type { SemanticField } from '../src/ts/generator/types.js';
import { NORSE_VOX_TABLE, NORSE_VOX_WORDS, RO5_SPEC } from './runic-spec.js';
import { SEEDS, runic } from './gen.js';

// Normative rune-name assignment table of spec 2.3.
const RUNE_NAME_TABLE: ReadonlyArray<readonly [string, string, SemanticField]> = [
  ['feh', 'hoarded wealth', 'hidden'],
  ['ur', 'primal beast', 'beings'],
  ['thurs', 'hostile wight', 'death'],
  ['ans', 'god', 'beings'],
  ['raid', 'ride, journey', 'gates'],
  ['kaun', 'sore', 'harm'],
  ['geb', 'binding gift', 'warding'],
  ['wunj', 'joy', 'warding'],
  ['hagl', 'hail', 'harm'],
  ['naud', 'need-fetter', 'harm'],
  ['is', 'ice', 'warding'],
  ['jer', 'harvest-year', 'time'],
  ['iw', 'yew', 'death'],
  ['perth', 'lot-cup', 'hidden'],
  ['alg', 'elk-guard', 'warding'],
  ['sowil', 'sun', 'fire'],
  ['tiw', 'the sky god', 'warding'],
  ['berk', 'birch', 'warding'],
  ['ehw', 'horse', 'beings'],
  ['mann', 'mortal man', 'death'],
  ['lauk', 'leek', 'warding'],
  ['ingw', 'the god Ing', 'beings'],
  ['dag', 'day', 'time'],
  ['othal', 'heritage', 'warding'],
];

test('rune-name roots follow the normative table and stay noun-only', () => {
  for (const [root, gloss, field] of RUNE_NAME_TABLE) {
    const entry = FIELDS[field].find((r) => r.root === root);
    assert.ok(entry !== undefined, `${root} missing from field ${field}`);
    assert.strictEqual(runicGlosses.roots[root]?.gloss, gloss, `gloss of ${root}`);
    assert.strictEqual(entry?.runeName, true, `${root} not flagged as rune name`);
    assert.deepStrictEqual(entry?.forms, ['noun'], `${root} fills a role beyond noun`);
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

// --- The Norse layer of spec 2.7 -------------------------------------------

test('the norse layer is exactly the eleven words the spec lists', () => {
  assert.deepStrictEqual([...NORSE_VOX], [...NORSE_VOX_WORDS]);
});

test('every norse word cuts to the runes the spec lists beside it', () => {
  for (const [word, glyphs] of NORSE_VOX_TABLE) {
    assert.strictEqual(runesFor(word), glyphs, `${word} cuts to other runes`);
  }
});

// The layer is contained on purpose: a Norse word in a semantic field would
// move every school that draws that field, and only Invocation asked for it.
test('no norse word entered a semantic field', () => {
  const roots = new Set(Object.values(FIELDS).flat().map((entry) => entry.root));
  for (const word of NORSE_VOX) {
    assert.ok(!roots.has(word), `${word} reached the lexicon`);
  }
  assert.ok(!roots.has('haim'), 'the world root reached the lexicon');
});

test('RO5 is the numeral phrase of the spec and belongs to no other idiom', () => {
  assert.deepStrictEqual([...IDIOM_WORDS.RO5], [...RO5_SPEC]);
  const others = Object.entries(IDIOM_WORDS).filter(([id]) => id !== 'RO5');
  for (const [id, words] of others) {
    assert.ok(!words.includes('haimoz'), `${id} carries the world word`);
  }
});

test('both packs word every norse release and nothing else', () => {
  for (const [language, pack] of [['en', runicGlosses], ['fr', frRunicGlosses]] as const) {
    assert.deepStrictEqual(
      Object.keys(pack.norse).slice().sort(),
      [...NORSE_VOX_WORDS].sort(),
      `${language} norse coverage`,
    );
    for (const [word, wording] of Object.entries(pack.norse)) {
      assert.ok(wording.trim().length > 0, `${language} leaves ${word} blank`);
      // The wording speaks the word first, so a reader hears what stood up
      // before being told what it is (spec 2.7).
      assert.ok(
        wording.startsWith(word.charAt(0).toUpperCase() + word.slice(1)),
        `${language} wording of ${word} does not open on the word`,
      );
    }
  }
});
