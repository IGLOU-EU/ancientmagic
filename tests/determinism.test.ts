import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import { enGlosses } from '../src/ts/glosses/en/index.js';
import { genomes } from '../src/ts/languages/index.js';
import type { LanguageId } from '../src/ts/generator/types.js';
import { ALL_SCHOOLS, DIFFICULTIES, SEEDS, egyptian, phoenician, runic } from './gen.js';

const GENOMES = [runic, egyptian, phoenician];

test('same seed and settings produce byte-identical output', () => {
  for (const genome of GENOMES) {
    for (const school of ALL_SCHOOLS) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const a = genome(school, difficulty, seed);
          const b = genome(school, difficulty, seed);
          assert.deepStrictEqual(a, b, `${school} d${difficulty} seed ${seed}`);
        }
      }
    }
  }
});

test('different seeds change the output somewhere in the sweep', () => {
  for (const genome of GENOMES) {
    let diverged = false;
    for (const school of ALL_SCHOOLS) {
      const a = genome(school, 5, 1);
      const b = genome(school, 5, 2);
      if (a.glyphs !== b.glyphs) diverged = true;
    }
    assert.ok(diverged, 'two seeds never diverged, the rng is not wired in');
  }
});

test('the three shipped genomes render one plan differently', () => {
  for (const school of ALL_SCHOOLS) {
    const lines = GENOMES.map((genome) => genome(school, 5, 42).glyphs);
    assert.strictEqual(new Set(lines).size, GENOMES.length, `${school} rendered alike`);
  }
});

test('the registry carries the three mvp genomes and nothing else', () => {
  assert.deepStrictEqual(Object.keys(genomes).sort(), ['egyptian', 'phoenician', 'runic']);
  for (const [id, genome] of Object.entries(genomes)) {
    assert.strictEqual(genome?.id, id, `registry key ${id} points elsewhere`);
  }
});

test('a language the registry does not carry is rejected', () => {
  const unshipped = 'greek' as unknown as LanguageId;
  assert.throws(() => generate({ language: unshipped, school: 'curse', difficulty: 5 }, 1, enGlosses));
});
