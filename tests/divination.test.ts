// The Divination contract that holds in every genome (genomes.md 1.5 and the
// "All genomes" block of section 7). What each script makes of the school is
// asserted in its own structure test, next to the rest of its grammar.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import { buildPlan } from '../src/ts/generator/plan.js';
import { mulberry32 } from '../src/ts/generator/rng.js';
import type {
  BoundGenome,
  LanguageId,
  School,
  SemanticField,
} from '../src/ts/generator/types.js';
import { resolveGlosses } from '../src/ts/glosses/index.js';
import { bindGenome } from '../src/ts/languages/index.js';
import { egyptianGenome } from '../src/ts/languages/egyptian.js';
import { phoenicianGenome } from '../src/ts/languages/phoenician.js';
import { runicGenome } from '../src/ts/languages/runic.js';
import { DREAD_SPOKEN as EGYPTIAN_DREAD } from './egyptian-spec.js';
import { DREAD_SPOKEN as PHOENICIAN_DREAD } from './phoenician-spec.js';
import { DREAD_EPITHETS as RUNIC_DREAD } from './spec.js';
import { FIELDS as PHOENICIAN_FIELDS } from '../src/ts/languages/phoenician-data.js';
import {
  ALL_SCHOOLS,
  DIFFICULTIES,
  SEEDS,
  egyptian,
  egyptianWords,
  phoenician,
  phoenicianWords,
  runic,
} from './gen.js';

const label = (school: string, difficulty: number, seed: number): string =>
  `${school} d${difficulty} seed ${seed}`;

// The three fields the school brought with it (spec 1.5).
const DIVINATION_FIELDS: ReadonlyArray<SemanticField> = ['sight', 'fate', 'signs'];

const GENOMES = [
  { id: 'runic', write: runic, dread: RUNIC_DREAD },
  { id: 'egyptian', write: egyptian, dread: EGYPTIAN_DREAD },
  { id: 'phoenician', write: phoenician, dread: PHOENICIAN_DREAD },
] as const;

function plan(school: School, difficulty: number, seed: number): ReturnType<typeof buildPlan> {
  return buildPlan(school, difficulty, mulberry32(seed >>> 0));
}

test('the first clause of a divination formula asks and every clause after it sees', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const clauses = plan('divination', difficulty, seed).clauses;
      // Tiers 1 and 2 carry no school clause, so they carry no kind either.
      if (difficulty <= 2) {
        assert.deepStrictEqual(
          clauses.map((c) => c.kind),
          clauses.map(() => null),
          `kinds below tier 3 at d${difficulty} seed ${seed}`,
        );
        continue;
      }
      assert.strictEqual(clauses[0]?.kind, 'asking', `first clause at d${difficulty}`);
      for (const clause of clauses.slice(1)) {
        assert.strictEqual(clause.kind, 'seeing', `later clause at d${difficulty}`);
      }
      // The mood rides the INTENT gene, which is what the genome reads.
      const intents = clauses.map(
        (c) => c.genes.find((g) => g.role === 'INTENT')?.flavor ?? null,
      );
      assert.strictEqual(intents[0], 'interrogative', `asking flavor at d${difficulty}`);
      for (const flavor of intents.slice(1)) {
        assert.strictEqual(flavor, 'first-person', `seeing flavor at d${difficulty}`);
      }
    }
  }
});

test('no other school emits an asking or a seeing clause', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'divination') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        for (const clause of plan(school, difficulty, seed).clauses) {
          assert.strictEqual(clause.kind, null, `clause kind in ${label(school, difficulty, seed)}`);
          for (const gene of clause.genes) {
            assert.notStrictEqual(
              gene.flavor,
              'interrogative',
              `interrogative flavor in ${label(school, difficulty, seed)}`,
            );
          }
        }
      }
    }
  }
});

test('the sight, fate and signs fields are reached by divination and by nothing else', () => {
  const fieldsOf = (school: School, difficulty: number, seed: number): SemanticField[] =>
    plan(school, difficulty, seed)
      .clauses.flatMap((c) => c.genes)
      .map((g) => g.field)
      .filter((field): field is SemanticField => field !== null);

  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const fields = fieldsOf(school, difficulty, seed);
        const reached = fields.filter((f) => DIVINATION_FIELDS.includes(f));
        if (school === 'divination') {
          if (difficulty >= 3) {
            assert.ok(reached.length > 0, `no divination field in ${where}`);
          }
        } else {
          assert.deepStrictEqual(reached, [], `divination field in ${where}`);
        }
      }
    }
  }
});

// The Egyptian and Phoenician word lists carry the field a word was written
// with, so the ban is checkable on the output and not only on the plan.
test('no word of another school is written with a divination field', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'divination') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        for (const word of egyptianWords(school, difficulty, seed)) {
          assert.ok(
            word.field === null || !DIVINATION_FIELDS.includes(word.field),
            `${word.spoken} carries a divination field in ${where}`,
          );
        }
        const banned = new Set(
          DIVINATION_FIELDS.flatMap((field) => PHOENICIAN_FIELDS[field].map((r) => r.root)),
        );
        for (const word of phoenicianWords(school, difficulty, seed)) {
          assert.ok(
            word.root === null || !banned.has(word.root),
            `${word.spoken} is a divination root in ${where}`,
          );
        }
      }
    }
  }
});

test('no dread epithet ever enters a divination formula', () => {
  for (const genome of GENOMES) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = `${genome.id} ${label('divination', difficulty, seed)}`;
        const out = genome.write('divination', difficulty, seed);
        for (const word of out.transliteration.split(' ')) {
          assert.ok(!genome.dread.includes(word), `dread word ${word} in ${where}`);
        }
        // The register's own determinative pair, on the one genome that marks
        // its epithets with signs rather than with sounds.
        if (genome.id === 'egyptian') {
          assert.ok(
            !out.glyphs.includes('\u{13010}\u{1316A}'),
            `dread determinative pair in ${where}`,
          );
        }
      }
    }
  }
});

// Spec 7: a question mark appears in the gloss line of a Divination asking
// clause and nowhere else, since no script here writes one.
test('the question mark lives in an asking clause gloss and nowhere else', () => {
  for (const genome of GENOMES) {
    for (const school of ALL_SCHOOLS) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const where = `${genome.id} ${label(school, difficulty, seed)}`;
          const gloss = genome.write(school, difficulty, seed).gloss;
          const marks = Array.from(gloss).filter((c) => c === '?').length;
          // One asking clause per formula, from the tier the school clause
          // enters. Below that the formula is a power word or a bare order.
          const expected = school === 'divination' && difficulty >= 3 ? 1 : 0;
          assert.strictEqual(marks, expected, `question marks in ${where}`);
        }
      }
    }
  }
});

// docs/i18n.md narrowed the sweep's punctuation rule to a literal ASCII space
// so that a language whose typography sets a narrow no-break space before a
// mark is supported. The question mark is the second mark to need it.
test('a french question mark carries the narrow no-break space before it', async () => {
  const pack = await resolveGlosses('fr');
  const bound: ReadonlyArray<readonly [LanguageId, BoundGenome]> = [
    ['runic', bindGenome(runicGenome, await pack.runic())],
    ['egyptian', bindGenome(egyptianGenome, await pack.egyptian())],
    ['phoenician', bindGenome(phoenicianGenome, await pack.phoenician())],
  ];
  for (const [id, genome] of bound) {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 0; seed < 12; seed += 1) {
        const where = `${id} ${label('divination', difficulty, seed)}`;
        const gloss = generate(genome, { language: id, school: 'divination', difficulty }, seed)
          .gloss;
        const marks = Array.from(gloss).filter((c) => c === '?').length;
        assert.strictEqual(marks, difficulty >= 3 ? 1 : 0, `question marks in ${where}`);
        if (marks === 0) continue;
        // U+202F, written as an escape so the character that carries French
        // punctuation spacing is visible in the source.
        assert.match(gloss, /\u202F\?/u, `no narrow no-break space in ${where}`);
        assert.doesNotMatch(gloss, / \?/u, `ascii space before the mark in ${where}`);
      }
    }
  }
});
