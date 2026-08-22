import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import { enGlosses } from '../src/ts/glosses/en/index.js';
import { runicGlosses } from '../src/ts/glosses/en/runic.js';
import { bindGenome, GENOME_LOADERS, loadGenome } from '../src/ts/languages/index.js';
import { runicGenome } from '../src/ts/languages/runic.js';
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
    const genome = await load(enGlosses);
    assert.strictEqual(genome.id, id, `registry key ${id} points elsewhere`);
  }
});

test('every registered loader answers with a distinct genome', async () => {
  const loaded = await Promise.all(
    Object.values(GENOME_LOADERS).map((load) => {
      assert.ok(load !== undefined);
      return load(enGlosses);
    }),
  );
  assert.strictEqual(new Set(loaded.map((g) => g.id)).size, loaded.length, 'two keys, one genome');
});

// A loader pairs a genome with a slice of glosses. Pairing it with the wrong
// slice is a compile error, so what is left to check at runtime is that the
// pair a loader builds writes what the same pair written by hand writes.
test('a loaded genome writes what its genome bound to its own slice writes', async () => {
  const loaded = await loadGenome('runic', enGlosses);
  const byHand = bindGenome(runicGenome, runicGlosses);
  const settings = { language: 'runic' as LanguageId, school: 'curse' as const, difficulty: 7 };
  assert.deepStrictEqual(generate(loaded, settings, 4242), generate(byHand, settings, 4242));
});

test('a language the registry does not carry is rejected', async () => {
  const unshipped = 'greek' as unknown as LanguageId;
  await assert.rejects(loadGenome(unshipped, enGlosses), /genome not available yet: greek/u);
});
