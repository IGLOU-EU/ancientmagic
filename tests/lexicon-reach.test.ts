// Nothing is declared that nothing can draw.
//
// A root is written in a data module, glossed in every pack, listed in
// genomes.md and counted by its genome's lexicon test, and none of that says
// a school will ever ask for it. Three fields are named in plan.ts inside
// INTENT lists alone, and an INTENT slot draws a verb, so ninety-three nouns
// were declared, inflected and glossed twice in two languages, and no seed at
// any tier in any school could reach one of them. Six more roots declared no
// role at all. The whole set was resolved in the sweep of 2026-08-30
// (docs/dead-lexicon-review.md), and this suite is what stops the next genome
// from doing it again.
//
// The reach question is answered in two steps, because it has two halves that
// live in different places. Which SEMANTIC FIELD is drawn for what is the
// planner's business and the same in every genome, so the sweep below reads it
// off the planner. Which ROOT FORM a genome spends on a given draw is the
// genome's own grammar, so it is declared per genome and keyed by the shipped
// set: a script added to the site is checked here or fails to compile.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  LANGUAGES,
  SCHOOLS,
  type LanguageId,
  type SemanticField,
} from '../src/ts/generator/types.js';
import type { RootForm } from '../src/ts/glosses/types.js';
import * as runicData from '../src/ts/languages/runic-data.js';
import * as egyptianData from '../src/ts/languages/egyptian-data.js';
import * as phoenicianData from '../src/ts/languages/phoenician-data.js';
import * as greekData from '../src/ts/languages/greek-data.js';
import * as latinData from '../src/ts/languages/latin-data.js';
import * as oghamData from '../src/ts/languages/ogham-data.js';
import { DIFFICULTIES, plan } from './gen.js';
import { sorted } from './text.js';

// What a slot asks a field for. Four kinds, because the plan knows four: a
// gene role that takes a thing, one that takes an action, and the two kinds of
// modifier it can hang on either.
type Demand = 'noun' | 'verb' | 'adjective' | 'adverb';

// Enough seeds that every branch of the planner is entered at every tier. The
// rarest pair is a modifier of one kind on one field of three, which fires on
// roughly one plan in twelve, so a few hundred seeds make it a certainty. A
// seed count too low cannot pass wrongly: it can only under-report a demand,
// which the pinned table below then catches by name.
const REACH_SEEDS = 600;

// Which fields the six schools draw, and for what. Normative, and pinned
// against the planner by the first test: this is the table a genome's lexicon
// is judged against, so it is written out rather than computed twice.
const DEMANDS: Readonly<Record<SemanticField, ReadonlyArray<Demand>>> = {
  warding: ['noun', 'verb'],
  harm: ['adjective', 'adverb', 'noun', 'verb'],
  // Named in INTENT lists alone. A summoning root is a verb of calling, and
  // the one who is called belongs in beings (genomes.md 1.3).
  summoning: ['verb'],
  hidden: ['adverb', 'noun'],
  // Named in INTENT lists alone: the Protection and Chronomancy orders.
  binding: ['verb'],
  fire: ['noun'],
  night: ['adjective', 'adverb', 'noun'],
  death: ['adjective', 'noun'],
  gates: ['noun'],
  time: ['noun'],
  sight: ['adjective', 'adverb', 'noun', 'verb'],
  fate: ['adjective', 'noun'],
  signs: ['noun'],
  // The Chronomancy INTENT and the two Chronomancy modifier pools. No slot
  // asks it for a noun.
  course: ['adjective', 'adverb', 'verb'],
  beings: ['noun'],
};

// The root form each genome spends on each demand. Four of the six write an
// adverb of their own; Egyptian and Phoenician build theirs as a preposition
// in front of a noun (spec 3.4 and 4.5), so an adverbial draw reaches their
// noun pool and they declare no adverb anywhere.
const ADVERB_IS_A_WORD: Readonly<Record<Demand, RootForm>> = {
  noun: 'noun',
  verb: 'verb',
  adjective: 'adj',
  adverb: 'adv',
};

const ADVERB_IS_A_PHRASE: Readonly<Record<Demand, RootForm>> = {
  noun: 'noun',
  verb: 'verb',
  adjective: 'adj',
  adverb: 'noun',
};

const SPENDS: Readonly<Record<LanguageId, Readonly<Record<Demand, RootForm>>>> = {
  runic: ADVERB_IS_A_WORD,
  egyptian: ADVERB_IS_A_PHRASE,
  phoenician: ADVERB_IS_A_PHRASE,
  greek: ADVERB_IS_A_WORD,
  latin: ADVERB_IS_A_WORD,
  ogham: ADVERB_IS_A_WORD,
};

interface DeclaredRoot {
  readonly id: string;
  readonly forms: ReadonlyArray<RootForm>;
}

type FieldTable = Readonly<Record<string, ReadonlyArray<DeclaredRoot>>>;

function declared(
  fields: Readonly<Record<string, ReadonlyArray<{ forms: ReadonlyArray<RootForm> }>>>,
  id: (root: never) => string,
): FieldTable {
  const table: Record<string, DeclaredRoot[]> = {};
  for (const [field, roots] of Object.entries(fields)) {
    table[field] = roots.map((root) => ({ id: id(root as never), forms: root.forms }));
  }
  return table;
}

const LEXICONS: Readonly<Record<LanguageId, FieldTable>> = {
  runic: declared(runicData.FIELDS, (r: { root: string }) => r.root),
  egyptian: declared(egyptianData.FIELDS, (r: { skeleton: string }) => r.skeleton),
  phoenician: declared(phoenicianData.FIELDS, (r: { root: string }) => r.root),
  greek: declared(greekData.FIELDS, (r: { root: string }) => r.root),
  latin: declared(latinData.FIELDS, (r: { root: string }) => r.root),
  ogham: declared(oghamData.FIELDS, (r: { root: string }) => r.root),
};

// Every field, and for what, as the planner actually emits it.
function sweepDemands(): Map<SemanticField, Set<Demand>> {
  const found = new Map<SemanticField, Set<Demand>>();
  const note = (field: SemanticField, demand: Demand): void => {
    const kinds = found.get(field) ?? new Set<Demand>();
    kinds.add(demand);
    found.set(field, kinds);
  };
  for (const school of SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 0; seed < REACH_SEEDS; seed += 1) {
        for (const clause of plan(school, difficulty, seed).clauses) {
          for (const gene of clause.genes) {
            if (gene.field === null) continue;
            if (gene.role === 'INTENT') note(gene.field, 'verb');
            else if (gene.role === 'TARGET' || gene.role === 'AGENT') note(gene.field, 'noun');
            else if (gene.role === 'MODIFIER' && clause.modifier !== null) {
              note(gene.field, clause.modifier);
            }
          }
        }
      }
    }
  }
  return found;
}

// The forms of one genome that some school can draw from one field.
function drawable(language: LanguageId, field: SemanticField): Set<RootForm> {
  const spends = SPENDS[language];
  return new Set((DEMANDS[field] ?? []).map((demand) => spends[demand]));
}

test('the field demands of the planner are the ones the table names', () => {
  const found = sweepDemands();
  assert.deepStrictEqual(
    sorted([...found.keys()]),
    sorted(Object.keys(DEMANDS)),
    'a field the planner draws is missing from the table, or the other way round',
  );
  for (const [field, kinds] of found) {
    assert.deepStrictEqual(
      sorted([...kinds]),
      sorted([...(DEMANDS[field] ?? [])]),
      `what the schools ask of ${field}`,
    );
  }
});

// The floor, and the rule Egyptian already held itself to. A root that
// declares no role at all is a word the site cannot write under any
// circumstances: it is carried by a data module, worded in every pack of every
// UI language, listed in the spec, and no reader will ever see it. Runic
// carried six until the sweep of 2026-08-30.
test('every declared root declares a role', () => {
  for (const language of LANGUAGES) {
    for (const [field, roots] of Object.entries(LEXICONS[language])) {
      for (const root of roots) {
        assert.ok(
          root.forms.length > 0,
          `${language} declares ${root.id} in ${field} and gives it no role`,
        );
      }
    }
  }
});

// The defect this suite was written for. A noun is the form the packs spend
// the most work on, since it carries gender, article and agreement in the
// languages that inflect, and it is the form three verb fields collected
// without a slot to spend it in.
// The same question is open for the other three demands, and the answer is
// worse: eighty-eight verbs, five adjectives and four adverbs are declared in
// fields drawn for none of them, plus the participles and plurals that hang
// off them. That sweep is priced in docs/dead-lexicon-review.md and was not
// taken here. When it is ruled, this test becomes a loop over the four demands
// and nothing else about the suite changes.
test('every declared noun stands in a slot some school fills', () => {
  for (const language of LANGUAGES) {
    const lexicon = LEXICONS[language];
    for (const [field, roots] of Object.entries(lexicon)) {
      const reach = drawable(language, field as SemanticField);
      for (const root of roots) {
        if (!root.forms.includes('noun')) continue;
        assert.ok(
          reach.has('noun'),
          `${language} declares the noun ${root.id} in ${field}, which is drawn for ` +
            `${[...(DEMANDS[field as SemanticField] ?? [])].join(' and ')} alone`,
        );
      }
    }
  }
});
