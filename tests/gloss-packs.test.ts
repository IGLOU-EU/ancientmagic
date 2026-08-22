// Completeness of the gloss packs.
//
// A pack that misses one form, one epithet or one idiom must fail here rather
// than reach a reader as a hole in a sentence. The sweep runs every registered
// pack, awaiting its loader, so adding a language adds no test: it is checked
// the moment it is registered, against all three genomes.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import type { BoundGenome, School } from '../src/ts/generator/types.js';
import { GLOSS_PACKS, resolveGlosses } from '../src/ts/glosses/index.js';
import { enGlosses } from '../src/ts/glosses/en/index.js';
import type { GlossPack, GlossTable, NamedPowerTable, RootGlossTable } from '../src/ts/glosses/types.js';
import * as runicData from '../src/ts/languages/runic-data.js';
import * as egyptianData from '../src/ts/languages/egyptian-data.js';
import * as phoenicianData from '../src/ts/languages/phoenician-data.js';
import { bindGenome } from '../src/ts/languages/index.js';
import { egyptianGenome } from '../src/ts/languages/egyptian.js';
import { phoenicianGenome } from '../src/ts/languages/phoenician.js';
import { runicGenome } from '../src/ts/languages/runic.js';

const SCHOOLS: ReadonlyArray<School> = ['protection', 'curse', 'invocation', 'eldritch'];

interface GenomeGlossTables {
  roots: RootGlossTable;
  idioms: GlossTable;
  seals: GlossTable;
  powers: GlossTable | NamedPowerTable;
  epithets?: GlossTable;
}

// What one genome expects of a language, read off the genome's own data, plus
// the two ways to reach that language's answer: the slice of glosses alone,
// for the coverage checks, and the genome bound to it, for the sweep. Both are
// per genome, because that is the grain a pack is loaded at.
interface Inventory {
  genome: string;
  slice: (pack: GlossPack) => Promise<GenomeGlossTables>;
  bind: (pack: GlossPack) => Promise<BoundGenome>;
  roots: ReadonlyArray<{ id: string; forms: ReadonlyArray<string> }>;
  powers: ReadonlyArray<string>;
  epithets: ReadonlyArray<string>;
  idioms: ReadonlyArray<string>;
  seals: ReadonlyArray<number>;
}

function rootsOf(
  fields: Readonly<Record<string, ReadonlyArray<{ forms: ReadonlyArray<string> }>>>,
  key: (root: never) => string,
): Array<{ id: string; forms: ReadonlyArray<string> }> {
  return Object.values(fields)
    .flat()
    .map((root) => ({ id: key(root as never), forms: root.forms }));
}

const INVENTORIES: ReadonlyArray<Inventory> = [
  {
    genome: 'runic',
    slice: (pack) => pack.runic(),
    bind: async (pack) => bindGenome(runicGenome, await pack.runic()),
    roots: rootsOf(runicData.FIELDS, (r: { root: string }) => r.root),
    // Runic keeps bright words and dread epithets in one table, they are all
    // power words of the same shape.
    powers: [...runicData.BRIGHT_POWER, ...runicData.DREAD_POWER],
    epithets: [],
    idioms: Object.keys(runicData.IDIOM_WORDS),
    seals: [...runicData.SEAL_COUNTS],
  },
  {
    genome: 'egyptian',
    slice: (pack) => pack.egyptian(),
    bind: async (pack) => bindGenome(egyptianGenome, await pack.egyptian()),
    roots: rootsOf(egyptianData.FIELDS, (r: { skeleton: string }) => r.skeleton),
    powers: egyptianData.BRIGHT_POWER.map((p) => p.skeleton),
    epithets: egyptianData.DREAD_POWER.map((p) => p.skeleton),
    idioms: Object.keys(egyptianData.IDIOM_WORDS),
    seals: [...egyptianData.SEAL_COUNTS],
  },
  {
    genome: 'phoenician',
    slice: (pack) => pack.phoenician(),
    bind: async (pack) => bindGenome(phoenicianGenome, await pack.phoenician()),
    roots: rootsOf(phoenicianData.FIELDS, (r: { root: string }) => r.root),
    powers: phoenicianData.ALL_NAMES.map((n) => n.skeleton),
    epithets: phoenicianData.DREAD_POWER.map((p) => p.skeleton),
    idioms: Object.keys(phoenicianData.IDIOM_WORDS),
    seals: [...phoenicianData.SEAL_COUNTS],
  },
];

function sorted(values: Iterable<string>): string[] {
  return Array.from(values).sort();
}

for (const [language, loadPack] of GLOSS_PACKS) {
  for (const inventory of INVENTORIES) {
    const where = `${language}/${inventory.genome}`;

    test(`${where}: covers exactly the roots the genome declares`, async () => {
      const tables = await inventory.slice(await loadPack());
      assert.deepStrictEqual(
        sorted(Object.keys(tables.roots)),
        sorted(inventory.roots.map((r) => r.id)),
        'root coverage',
      );
    });

    test(`${where}: covers exactly the forms each root declares`, async () => {
      const tables = await inventory.slice(await loadPack());
      for (const root of inventory.roots) {
        const entry = tables.roots[root.id];
        assert.ok(entry !== undefined, `${root.id} is missing`);
        assert.deepStrictEqual(
          sorted(Object.keys(entry?.forms ?? {})),
          sorted(root.forms),
          `forms of ${root.id}`,
        );
      }
    });

    test(`${where}: every root wording is real text`, async () => {
      const tables = await inventory.slice(await loadPack());
      for (const [id, entry] of Object.entries(tables.roots)) {
        assert.ok(entry.gloss.trim().length > 0, `${id} has a blank gloss`);
        for (const [form, word] of Object.entries(entry.forms)) {
          assert.ok(word.trim().length > 0, `${id} has a blank ${form}`);
        }
      }
    });

    test(`${where}: covers exactly the named powers, epithets, idioms and seals`, async () => {
      const tables = await inventory.slice(await loadPack());
      assert.deepStrictEqual(
        sorted(Object.keys(tables.powers)),
        sorted(inventory.powers),
        'power coverage',
      );
      assert.deepStrictEqual(
        sorted(Object.keys(tables.epithets ?? {})),
        sorted(inventory.epithets),
        'epithet coverage',
      );
      assert.deepStrictEqual(
        sorted(Object.keys(tables.idioms)),
        sorted(inventory.idioms),
        'idiom coverage',
      );
      assert.deepStrictEqual(
        sorted(Object.keys(tables.seals)),
        sorted(inventory.seals.map(String)),
        'seal coverage',
      );
    });
  }

  // The tables can be complete and the grammar still be a stub, so every
  // clause shape is driven through real plans and the result read back.
  test(`${language}: writes a whole gloss at every tier of every school`, async () => {
    const pack = await loadPack();
    for (const inventory of INVENTORIES) {
      const genome = await inventory.bind(pack);
      for (const school of SCHOOLS) {
        for (let difficulty = 1; difficulty <= 9; difficulty += 1) {
          for (let seed = 0; seed < 12; seed += 1) {
            const where = `${language} ${genome.id} ${school} d${difficulty} seed ${seed}`;
            const gloss = generate(genome, { language: genome.id, school, difficulty }, seed)
              .gloss;

            assert.ok(gloss.length > 0, `empty gloss: ${where}`);
            assert.doesNotMatch(gloss, /undefined|null|\[object/u, `hole in the gloss: ${where}`);
            assert.strictEqual(gloss, gloss.trim(), `loose edge whitespace: ${where}`);
            assert.doesNotMatch(gloss, /\s{2}/u, `doubled space: ${where}`);
            // A slot that renders empty leaves its spacing behind. Those three
            // shapes are what the residue looks like, and each is a hole.
            assert.doesNotMatch(gloss, /^[,.!?]/u, `opens on punctuation: ${where}`);
            // An ordinary space, not any whitespace: the residue a pack leaves
            // behind always comes from its own joins, while a language whose
            // typography sets a narrow no-break space before a mark is right
            // to put one there.
            assert.doesNotMatch(gloss, / [,.!?]/u, `space before punctuation: ${where}`);
            assert.match(gloss, /[.!?]$/u, `ends mid-sentence: ${where}`);
          }
        }
      }
    }
  });
}

// Loading a pack on demand must not loosen what resolution promises: a
// language without a pack of its own still gets the English one entire, and a
// language with one never gets a mixture.
test('a language with no pack of its own falls back to the whole English pack', async () => {
  assert.strictEqual(await resolveGlosses('zz'), enGlosses);
  assert.strictEqual(await resolveGlosses(''), enGlosses);
  assert.strictEqual(await resolveGlosses('en-GB'), enGlosses);
});

test('every registered pack resolves to itself, whole', async () => {
  for (const [language, loadPack] of GLOSS_PACKS) {
    const pack = await loadPack();
    assert.strictEqual(await resolveGlosses(language), pack, `${language} resolves elsewhere`);
    assert.strictEqual(
      await resolveGlosses(`${language}-ZZ`),
      pack,
      `${language}-ZZ leaves its base language`,
    );
  }
});

test('every registered pack declares the language it is registered under', async () => {
  assert.ok(GLOSS_PACKS.size > 0, 'no pack registered');
  for (const [language, loadPack] of GLOSS_PACKS) {
    assert.ok(language.length > 0, 'a pack is registered under no language');
    const pack = await loadPack();
    assert.strictEqual(pack.language, language, `the ${language} loader answers another pack`);
  }
});
