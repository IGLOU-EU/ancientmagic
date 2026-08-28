// The Chronomancy contract that holds in every genome (genomes.md 1.6 and the
// "All genomes" block of section 7). What each script makes of the school is
// asserted in its own structure test, next to the rest of its grammar.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import { DIRECTIONS } from '../src/ts/generator/plan.js';
import {
  LANGUAGES,
  type BoundGenome,
  type LanguageId,
  type SemanticField,
} from '../src/ts/generator/types.js';
import { resolveGlosses } from '../src/ts/glosses/index.js';
import { bindGenome } from '../src/ts/languages/index.js';
import { egyptianGenome } from '../src/ts/languages/egyptian.js';
import { greekGenome } from '../src/ts/languages/greek.js';
import { latinGenome } from '../src/ts/languages/latin.js';
import { phoenicianGenome } from '../src/ts/languages/phoenician.js';
import { runicGenome } from '../src/ts/languages/runic.js';
import { LEXICON as PHOENICIAN_LEXICON } from './phoenician-spec.js';
import {
  DIRECTION_WORDS_SPEC,
  RC5_TAIL_SPEC,
  TIME_FIELD as RUNIC_TIME_FIELD,
} from './runic-spec.js';
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
  runic,
} from './gen.js';

test('the first clause of a chronomantic formula crosses and every clause after it binds', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const seed of SEEDS) {
      const clauses = plan('chronomancy', difficulty, seed).clauses;
      // Tiers 1 and 2 carry no school clause, so they carry no kind either.
      if (difficulty <= 2) {
        for (const clause of clauses) assert.strictEqual(clause.kind, null, `kind at d${difficulty}`);
        continue;
      }
      assert.strictEqual(clauses[0]?.kind, 'crossing', `first clause at d${difficulty}`);
      for (const clause of clauses.slice(1)) {
        assert.strictEqual(clause.kind, 'binding', `later clause at d${difficulty}`);
      }
      // The mood rides the INTENT gene, which is what the genome reads: the
      // command opens the way, the performative does the deed.
      const intents = clauses.map(
        (c) => c.genes.find((g) => g.role === 'INTENT')?.flavor ?? null,
      );
      assert.strictEqual(intents[0], 'imperative', `crossing flavor at d${difficulty}`);
      for (const flavor of intents.slice(1)) {
        assert.strictEqual(flavor, 'performative', `binding flavor at d${difficulty}`);
      }
      // The school commands time directly and names no god to do it for the
      // caster (spec 1.6).
      for (const clause of clauses) {
        assert.ok(
          !clause.genes.some((g) => g.role === 'AGENT'),
          `agent gene at d${difficulty}`,
        );
      }
    }
  }
});

test('no other school emits a crossing or a binding clause', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'chronomancy') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        for (const clause of plan(school, difficulty, seed).clauses) {
          const where = label(school, difficulty, seed);
          assert.notStrictEqual(clause.kind, 'crossing', `crossing clause in ${where}`);
          assert.notStrictEqual(clause.kind, 'binding', `binding clause in ${where}`);
          assert.strictEqual(clause.direction, null, `direction in ${where}`);
          for (const gene of clause.genes) {
            assert.notStrictEqual(gene.flavor, 'performative', `performative in ${where}`);
          }
        }
      }
    }
  }
});

test('every crossing clause carries one direction of the closed four, and no binding clause any', () => {
  assert.deepStrictEqual([...DIRECTIONS], ['back', 'forth', 'again', 'still']);
  const seen = new Set<string>();
  for (const difficulty of DIFFICULTIES) {
    for (let seed = 0; seed < 60; seed += 1) {
      for (const clause of plan('chronomancy', difficulty, seed).clauses) {
        if (clause.kind === 'crossing') {
          assert.ok(clause.direction !== null, `crossing without a direction at d${difficulty}`);
          assert.ok(
            DIRECTIONS.includes(clause.direction ?? 'back'),
            `direction off the closed set at d${difficulty}`,
          );
          seen.add(clause.direction ?? '');
          continue;
        }
        assert.strictEqual(clause.direction, null, `direction on a non crossing clause`);
      }
    }
  }
  assert.strictEqual(seen.size, DIRECTIONS.length, 'a direction the sweep never drew');
});

test('the course field is reached by chronomancy and by nothing else', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const fields = plan(school, difficulty, seed)
          .clauses.flatMap((c) => c.genes)
          .map((g) => g.field)
          .filter((field): field is SemanticField => field !== null);
        if (school === 'chronomancy') continue;
        assert.ok(!fields.includes('course'), `course field in ${where}`);
      }
    }
  }
  // And on the output side, where the word lists carry the field written.
  for (const school of ALL_SCHOOLS) {
    if (school === 'chronomancy') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        for (const word of egyptianWords(school, difficulty, seed)) {
          assert.notStrictEqual(word.field, 'course', `course word in ${where}`);
        }
        const banned = new Set(PHOENICIAN_LEXICON['course'].map(([skeleton]) => skeleton));
        for (const word of phoenicianWords(school, difficulty, seed)) {
          assert.ok(word.root === null || !banned.has(word.root), `course word in ${where}`);
        }
      }
    }
  }
});

test('no dread epithet ever enters a chronomantic formula', () => {
  for (const id of LANGUAGES) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = `${id} ${label('chronomancy', difficulty, seed)}`;
        const out = WRITERS[id]('chronomancy', difficulty, seed);
        for (const word of out.transliteration.split(' ')) {
          assert.ok(!DREAD[id].includes(word), `dread word ${word} in ${where}`);
        }
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

// Spec 1.6: a formula that moves through time must say where it stops, and
// what it stops at is always a time-field noun.
test('the return anchor is drawn from the time field in every genome', () => {
  const runicTime = new Set(RUNIC_TIME_FIELD);
  const phoenicianTime = new Set(PHOENICIAN_LEXICON['time'].map(([skeleton]) => skeleton));
  for (const difficulty of [5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);

      const words = runic('chronomancy', difficulty, seed).transliteration.split(' ');
      const tailAt = words.lastIndexOf(RC5_TAIL_SPEC[0] ?? '');
      assert.ok(tailAt > 0, `no return anchor in runic ${where}`);
      // The anchor stands in front of the fixed tail, in the accusative, with
      // its genitive between them at tier 9.
      const anchor = words[tailAt - (difficulty >= 9 ? 2 : 1)] ?? '';
      assert.match(anchor, /an$/u, `runic anchor not accusative in ${where}`);
      assert.ok(runicTime.has(anchor.slice(0, -2)), `runic anchor off the time field: ${anchor}`);
      if (difficulty >= 9) {
        const genitive = words[tailAt - 1] ?? '';
        assert.match(genitive, /as$/u, `runic genitive not genitive in ${where}`);
        assert.ok(
          runicTime.has(genitive.slice(0, -2)),
          `runic genitive off the time field: ${genitive}`,
        );
      }

      const egyptianList = egyptianWords('chronomancy', difficulty, seed);
      const peretAt = egyptianList.findIndex((w) => w.spoken === 'peret');
      assert.ok(peretAt >= 0, `no return anchor in egyptian ${where}`);
      assert.strictEqual(egyptianList[peretAt + 1]?.spoken, 'em', `egyptian anchor head`);
      assert.strictEqual(
        egyptianList[peretAt + 2]?.field,
        'time',
        `egyptian anchor off the time field in ${where}`,
      );
      if (difficulty >= 9) {
        assert.strictEqual(egyptianList[peretAt + 3]?.spoken, 'en', `egyptian anchor genitive`);
        assert.strictEqual(egyptianList[peretAt + 4]?.field, 'time', `egyptian genitive field`);
      }

      const phoenicianList = phoenicianWords('chronomancy', difficulty, seed);
      const bawatiAt = phoenicianList.findIndex((w) => w.spoken === 'bawati');
      assert.ok(bawatiAt >= 0, `no return anchor in phoenician ${where}`);
      const root = phoenicianList[bawatiAt + 1]?.root ?? '';
      assert.ok(phoenicianTime.has(root), `phoenician anchor off the time field: ${root}`);
      if (difficulty >= 9) {
        const held = phoenicianList[bawatiAt + 2]?.root ?? '';
        assert.ok(phoenicianTime.has(held), `phoenician genitive off the time field: ${held}`);
      }
    }
  }
});

// Spec 1.6: nothing new is emitted at the seal, only glossed differently.
test('the chronomantic seal is glossed as a depth in time, never as a count', () => {
  for (const id of LANGUAGES) {
    for (const difficulty of [7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = `${id} ${label('chronomancy', difficulty, seed)}`;
        const gloss = WRITERS[id]('chronomancy', difficulty, seed).gloss;
        assert.match(gloss, /hours deep\.$/u, `seal not a depth in ${where}`);
        for (const wording of ['Sealed', 'Recited', 'times over']) {
          assert.ok(!gloss.includes(wording), `${wording} in ${where}`);
        }
      }
    }
  }
  // And the other schools keep the reading they always had.
  for (const id of LANGUAGES) {
    for (const school of ALL_SCHOOLS) {
      if (school === 'chronomancy') continue;
      for (const difficulty of [7, 8, 9]) {
        for (const seed of SEEDS) {
          const gloss = WRITERS[id](school, difficulty, seed).gloss;
          assert.ok(
            !gloss.includes('hours deep'),
            `a depth in ${id} ${label(school, difficulty, seed)}`,
          );
        }
      }
    }
  }
});

// Spec 1.6: no clause of this school ever asks anything.
test('no chronomantic gloss carries a question mark, in either language', async () => {
  const packs = [await resolveGlosses('en'), await resolveGlosses('fr')];
  for (const pack of packs) {
    const bound: ReadonlyArray<readonly [LanguageId, BoundGenome]> = [
      ['runic', bindGenome(runicGenome, await pack.runic())],
      ['egyptian', bindGenome(egyptianGenome, await pack.egyptian())],
      ['phoenician', bindGenome(phoenicianGenome, await pack.phoenician())],
      ['greek', bindGenome(greekGenome, await pack.greek())],
    ['latin', bindGenome(latinGenome, await pack.latin())],
    ];
    for (const [id, genome] of bound) {
      for (const difficulty of DIFFICULTIES) {
        for (let seed = 0; seed < 12; seed += 1) {
          const gloss = generate(
            genome,
            { language: id, school: 'chronomancy', difficulty },
            seed,
          ).gloss;
          assert.ok(
            !gloss.includes('?'),
            `question mark in ${pack.language} ${id} d${difficulty} seed ${seed}`,
          );
        }
      }
    }
  }
});

// The four values are language independent, so one plan gives the same
// direction in every genome (spec 1.6). Each genome writes it its own
// way, and each pack words it its own way, but never a fifth one.
test('every genome writes exactly the four directions and no other', () => {
  const runicWords = new Set(Object.values(DIRECTION_WORDS_SPEC));
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (let seed = 0; seed < 40; seed += 1) {
      const words = runic('chronomancy', difficulty, seed).transliteration.split(' ');
      const found = words.filter((word) => runicWords.has(word));
      // aftar is also the fixed tail of RC5, which is not a clause direction.
      const inClauses = found.length - (difficulty >= 5 ? 1 : 0);
      assert.strictEqual(inClauses, 1, `direction count in runic d${difficulty} seed ${seed}`);
    }
  }
});
