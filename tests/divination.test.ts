// The Divination contract that holds in every genome (genomes.md 1.5 and the
// "All genomes" block of section 7). What each script makes of the school is
// asserted in its own structure test, next to the rest of its grammar.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import {
  LANGUAGES,
  type BoundGenome,
  type LanguageId,
  type School,
  type SemanticField,
} from '../src/ts/generator/types.js';
import { resolveGlosses } from '../src/ts/glosses/index.js';
import { bindGenome } from '../src/ts/languages/index.js';
import { egyptianGenome } from '../src/ts/languages/egyptian.js';
import { greekGenome } from '../src/ts/languages/greek.js';
import { phoenicianGenome } from '../src/ts/languages/phoenician.js';
import { runicGenome } from '../src/ts/languages/runic.js';
import { LEXICON as PHOENICIAN_LEXICON } from './phoenician-spec.js';
import {
  ALL_SCHOOLS,
  DIFFICULTIES,
  DREAD,
  SEEDS,
  WRITERS,
  egyptianWords,
  label,
  phoenicianWords,
  plan,
} from './gen.js';

// The three fields the school brought with it (spec 1.5). Fate is the one it
// shares with Chronomancy, which acts on what Divination reads, so only the
// other two are exclusive to it.
const DIVINATION_FIELDS: ReadonlyArray<SemanticField> = ['sight', 'signs'];

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
          const where = label(school, difficulty, seed);
          assert.notStrictEqual(clause.kind, 'asking', `asking clause in ${where}`);
          assert.notStrictEqual(clause.kind, 'seeing', `seeing clause in ${where}`);
          for (const gene of clause.genes) {
            assert.notStrictEqual(
              gene.flavor,
              'interrogative',
              `interrogative flavor in ${where}`,
            );
          }
        }
      }
    }
  }
});

test('the sight and signs fields are reached by divination and by nothing else', () => {
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
test('no word of another school is written with a divination-only field', () => {
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
          DIVINATION_FIELDS.flatMap((field) =>
            PHOENICIAN_LEXICON[field].map(([skeleton]) => skeleton),
          ),
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
  for (const id of LANGUAGES) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = `${id} ${label('divination', difficulty, seed)}`;
        const out = WRITERS[id]('divination', difficulty, seed);
        for (const word of out.transliteration.split(' ')) {
          assert.ok(!DREAD[id].includes(word), `dread word ${word} in ${where}`);
        }
        // The register's own determinative pair, on the one genome that marks
        // its epithets with signs rather than with sounds.
        if (id === 'egyptian') {
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
  for (const id of LANGUAGES) {
    for (const school of ALL_SCHOOLS) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const where = `${id} ${label(school, difficulty, seed)}`;
          const gloss = WRITERS[id](school, difficulty, seed).gloss;
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
    ['greek', bindGenome(greekGenome, await pack.greek())],
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
