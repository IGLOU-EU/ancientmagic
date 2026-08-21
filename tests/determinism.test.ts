import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import { ALL_SCHOOLS, DIFFICULTIES, SEEDS, runic } from './gen.js';

test('same seed and settings produce byte-identical output', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const a = runic(school, difficulty, seed);
        const b = runic(school, difficulty, seed);
        assert.deepStrictEqual(a, b, `${school} d${difficulty} seed ${seed}`);
      }
    }
  }
});

test('different seeds change the output somewhere in the sweep', () => {
  let diverged = false;
  for (const school of ALL_SCHOOLS) {
    const a = runic(school, 5, 1);
    const b = runic(school, 5, 2);
    if (a.glyphs !== b.glyphs) diverged = true;
  }
  assert.ok(diverged, 'two seeds never diverged, the rng is not wired in');
});

test('unshipped genomes are rejected', () => {
  assert.throws(() => generate({ language: 'egyptian', school: 'protection', difficulty: 5 }, 1));
  assert.throws(() => generate({ language: 'phoenician', school: 'curse', difficulty: 5 }, 1));
});
