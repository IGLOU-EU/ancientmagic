import test from 'node:test';
import * as assert from 'node:assert/strict';
import { GENOME_LOADERS, loadGenome } from '../src/ts/languages/index.js';
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

test('the registry carries the three mvp genomes and nothing else', async () => {
  assert.deepStrictEqual(Object.keys(GENOME_LOADERS).sort(), ['egyptian', 'phoenician', 'runic']);
  for (const [id, load] of Object.entries(GENOME_LOADERS)) {
    assert.ok(load !== undefined, `registry key ${id} carries no loader`);
    const genome = await load();
    assert.strictEqual(genome.id, id, `registry key ${id} points elsewhere`);
  }
});

test('every registered loader answers with a distinct genome', async () => {
  const loaded = await Promise.all(
    Object.values(GENOME_LOADERS).map((load) => {
      assert.ok(load !== undefined);
      return load();
    }),
  );
  assert.strictEqual(new Set(loaded.map((g) => g.id)).size, loaded.length, 'two keys, one genome');
});

test('a language the registry does not carry is rejected', async () => {
  const unshipped = 'greek' as unknown as LanguageId;
  await assert.rejects(loadGenome(unshipped), /genome not available yet: greek/u);
});
