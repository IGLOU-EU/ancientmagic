// The Invocation contract that holds in every genome (genomes.md 1.3 and the
// "All genomes" block of section 7). What each script makes of the school is
// asserted in its own structure test, next to the rest of its grammar.
//
// This suite exists for one reason: the widening of 2026-08-30 gave Invocation
// a semantic field of its own, and a field is only worth what the poorest
// genome puts in it. So the assertions below run the same three questions past
// all six scripts. Can each of them fill the field, can each of them address
// what it filled it with, and does the field stay out of the five schools that
// never call anybody.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  LANGUAGES,
  type School,
  type SemanticField,
} from '../src/ts/generator/types.js';
import * as runicData from '../src/ts/languages/runic-data.js';
import * as egyptianData from '../src/ts/languages/egyptian-data.js';
import * as phoenicianData from '../src/ts/languages/phoenician-data.js';
import * as greekData from '../src/ts/languages/greek-data.js';
import * as latinData from '../src/ts/languages/latin-data.js';
import * as oghamData from '../src/ts/languages/ogham-data.js';
import {
  ALL_SCHOOLS,
  DIFFICULTIES,
  SEEDS,
  WRITERS,
  egyptianWords,
  label,
  phoenicianWords,
  plan,
} from './gen.js';

// The school that calls, and the register that borrows its skeleton. Eldritch
// fills every AGENT with an indeclinable epithet and never reads the gene's
// field (spec 1.4), so its genes carry the field and its output never does.
// That split is what the two sweeps below assert separately.
const INVOCATION_FAMILY: ReadonlyArray<School> = ['invocation', 'eldritch'];

// The one field the school brought with it (spec 1.3).
const BEINGS: SemanticField = 'beings';

// Every field table the six genomes declare, keyed by the shipped set, so a
// genome added to the site is checked here or fails to compile.
const FIELDS: Readonly<
  Record<string, Readonly<Record<string, ReadonlyArray<{ forms: ReadonlyArray<string> }>>>>
> = {
  runic: runicData.FIELDS,
  egyptian: egyptianData.FIELDS,
  phoenician: phoenicianData.FIELDS,
  greek: greekData.FIELDS,
  latin: latinData.FIELDS,
  ogham: oghamData.FIELDS,
};

// The deepest agent chain any tier asks for is three genes, and tier 9 stacks
// one more epithet on the last of them, so a genome needs four addressable
// nouns in the field before a draw can run out of them.
const DEEPEST_CHAIN = 4;

test('every genome fills the beings field with nouns it can address', () => {
  for (const language of LANGUAGES) {
    const table = FIELDS[language]?.[BEINGS];
    assert.ok(table !== undefined, `${language} declares no beings field`);
    const nouns = (table ?? []).filter((root) => root.forms.includes('noun'));
    assert.ok(
      nouns.length >= DEEPEST_CHAIN,
      `${language} carries ${nouns.length} addressable beings, fewer than a tier 9 chain needs`,
    );
    assert.strictEqual(
      nouns.length,
      (table ?? []).length,
      `${language} lists a being it cannot address as a noun`,
    );
  }
});

test('the beings field is reached by the invocation family and by nothing else', () => {
  const fieldsOf = (school: School, difficulty: number, seed: number): SemanticField[] =>
    plan(school, difficulty, seed)
      .clauses.flatMap((c) => c.genes)
      .map((g) => g.field)
      .filter((field): field is SemanticField => field !== null);

  const reachedBy = new Set<School>();
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const reached = fieldsOf(school, difficulty, seed).includes(BEINGS);
        if (reached) reachedBy.add(school);
        assert.ok(
          !reached || INVOCATION_FAMILY.includes(school),
          `a beings field in ${where}`,
        );
      }
    }
  }
  // The ban is only half the contract. A field no draw ever lands on would
  // pass the sweep above and buy the school nothing, so the school that owns
  // it has to be caught using it.
  assert.ok(reachedBy.has('invocation'), 'no invocation draw reached the beings field');
});

test('an invocation in every genome can call a being', () => {
  for (const language of LANGUAGES) {
    const write = WRITERS[language];
    let called = 0;
    for (let seed = 1; seed <= 400 && called < 1; seed += 1) {
      for (const difficulty of DIFFICULTIES) {
        const genes = plan('invocation', difficulty, seed).clauses.flatMap((c) => c.genes);
        if (!genes.some((gene) => gene.field === BEINGS)) continue;
        const out = write('invocation', difficulty, seed);
        assert.ok(out.glyphs.length > 0, `${language} wrote no glyphs at d${difficulty}`);
        assert.ok(out.transliteration.length > 0, `${language} wrote no reading at d${difficulty}`);
        assert.ok(out.gloss.length > 0, `${language} wrote no gloss at d${difficulty}`);
        called += 1;
        break;
      }
    }
    assert.strictEqual(called, 1, `${language} never drew a being in four hundred seeds`);
  }
});

// The Egyptian and Phoenician word lists carry the field a word was written
// with, so the ban is checkable on the output and not only on the plan. This
// is where Eldritch is pinned: its genes carry the field and its words must
// not, because the register writes epithets and reads no field at all.
test('no word outside an invocation is written with the beings field', () => {
  const banned = new Set(
    (phoenicianData.FIELDS[BEINGS] ?? []).map((root) => root.root),
  );
  for (const school of ALL_SCHOOLS) {
    if (school === 'invocation') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        for (const word of egyptianWords(school, difficulty, seed)) {
          assert.notStrictEqual(word.field, BEINGS, `${word.spoken} calls a being in ${where}`);
        }
        for (const word of phoenicianWords(school, difficulty, seed)) {
          assert.ok(
            word.root === null || !banned.has(word.root),
            `${word.root} calls a being in ${where}`,
          );
        }
      }
    }
  }
});
