// What every genome does the same way. A script's rules are its own, but
// cutting a romanization, reading a lexicon and drawing without replacement
// are one move repeated in all four, so each is written once here.
//
// Nothing in this file knows a genome: a helper is handed the pool, the table
// or the accessor it works on. The data stays with the genome that declares
// it, which is what keeps one script's conjuration from loading another's
// roots.

import { pick, type Rng } from '../generator/rng.js';
import type { ClausePlan, FormulaPlan, SemanticField } from '../generator/types.js';
import type { RootForm } from '../glosses/types.js';

// The five vowels of the romanizations. A script that writes them and a script
// that drops them both have to know which letters they are.
export const VOWELS: ReadonlySet<string> = new Set(['a', 'e', 'i', 'o', 'u']);

// Greedy longest match: two characters are tried before one, which is what
// lets a digraph be a single letter. The spec of each script guarantees no
// lexicon entry holds a digraph's two characters as separate sounds, so the
// longest match is always the right one.
export function greedyTokens(
  word: string,
  known: (token: string) => boolean,
  script: string,
): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < word.length) {
    const two = word.slice(i, i + 2);
    if (two.length === 2 && known(two)) {
      tokens.push(two);
      i += 2;
      continue;
    }
    const one = word.charAt(i);
    if (!known(one)) {
      throw new Error(`letter outside the ${script} romanization: ${one} in ${word}`);
    }
    tokens.push(one);
    i += 1;
  }
  return tokens;
}

// A root fills the roles it declares and no other: a role it does not declare
// is never drawn.
export function withForm<R extends { forms: ReadonlyArray<RootForm> }>(
  roots: ReadonlyArray<R>,
  form: RootForm,
): R[] {
  return roots.filter((root) => root.forms.includes(form));
}

// An intransitive root never fills a slot that takes an object.
export function transitive<R extends { intransitive?: boolean }>(
  verbs: ReadonlyArray<R>,
): R[] {
  return verbs.filter((verb) => verb.intransitive !== true);
}

export function requireField(field: SemanticField | null): SemanticField {
  if (field === null) throw new Error('gene is missing its semantic field');
  return field;
}

export function geneField(
  clause: ClausePlan,
  role: 'INTENT' | 'TARGET' | 'AGENT',
): SemanticField {
  return requireField(clause.genes.find((g) => g.role === role)?.field ?? null);
}

// Tier 2 is one clause, and every genome writes it from that clause alone.
export function tierTwoClause(plan: FormulaPlan): ClausePlan {
  const clause = plan.clauses[0];
  if (clause === undefined) throw new Error('tier 2 plan has no clause');
  return clause;
}

// Draw without replacement: the pool loses what has been spoken already, and
// what comes out joins it. One set of names covers pools of different kinds,
// which is how a power is never both the invoked agent and the free word.
export function drawUnused<T>(
  rng: Rng,
  pool: ReadonlyArray<T>,
  used: Set<string>,
  name: (item: T) => string,
): T {
  const drawn = pick(rng, pool.filter((item) => !used.has(name(item))));
  used.add(name(drawn));
  return drawn;
}

// The MODIFIER gene is one root from one pool, and the kind the plan asked for
// says which pool. What a genome writes with that root is the genome's own.
export function pickModifier<R>(
  clause: ClausePlan,
  rng: Rng,
  adjectives: (field: SemanticField) => ReadonlyArray<R>,
  adverbs: (field: SemanticField) => ReadonlyArray<R>,
): { adjective: R | null; adverb: R | null } {
  const field = clause.modifierField;
  if (clause.modifier === null || field === null) return { adjective: null, adverb: null };
  if (clause.modifier === 'adjective') {
    return { adjective: pick(rng, adjectives(field)), adverb: null };
  }
  return { adjective: null, adverb: pick(rng, adverbs(field)) };
}

// The return anchor of the crossing schools: a time noun, and from tier 9 a
// second one drawn without replacement, so the pair never names one time
// twice (spec 1.6).
export function anchorPair<R>(
  plan: FormulaPlan,
  rng: Rng,
  nouns: ReadonlyArray<R>,
): { anchor: R; genitive: R | null } {
  const anchor = pick(rng, nouns);
  if (plan.difficulty < 9) return { anchor, genitive: null };
  return { anchor, genitive: pick(rng, nouns.filter((noun) => noun !== anchor)) };
}

// Which end of a word the shrinking triangle eats into. Four genomes borrowed
// the device and drop the first letter, and the one genome that owns it
// attested drops the last, since that is what its own amulet prescribes.
export type ShrinkEnd = 'front' | 'back';

// The shrinking triangle drops one token at each repetition, down to the last
// one. Steps are whole tokens, so a digraph never splits into two letters.
export function shrinkingSteps(
  tokens: ReadonlyArray<string>,
  drop: ShrinkEnd = 'front',
): string[] {
  return tokens.map((_unused, index) =>
    (drop === 'front' ? tokens.slice(index) : tokens.slice(0, tokens.length - index)).join(''),
  );
}

// Chronomancy reads the count as how far the crossing went, so the same seal
// is worded as a depth in time (spec 1.6).
export function sealGloss<C>(
  plan: FormulaPlan,
  count: C,
  glosses: { seal: (count: C) => string; sealDepth: (count: C) => string },
): string {
  return plan.school === 'chronomancy' ? glosses.sealDepth(count) : glosses.seal(count);
}
