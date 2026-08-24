// Plan stage: school, difficulty and seed become a language-independent
// clause plan. Genomes then reorder and inflect it per their own rules.

import { chance, pick, type Rng } from './rng.js';
import type {
  ClauseKind,
  ClausePlan,
  FormulaPlan,
  GeneInstance,
  ModifierKind,
  PowerWordStyle,
  School,
  SemanticField,
} from './types.js';

// Field pools per school. The school fixes the flavor of each gene, the
// plan only decides which semantic field the genome will draw roots from.
const PROTECTION_INTENT: ReadonlyArray<SemanticField> = ['warding', 'binding'];
const PROTECTION_TARGET: ReadonlyArray<SemanticField> = ['harm', 'death', 'night', 'fire'];
const CURSE_TARGET: ReadonlyArray<SemanticField> = ['death', 'night', 'hidden', 'gates'];
const INVOCATION_AGENT: ReadonlyArray<SemanticField> = ['night', 'fire', 'time', 'death'];
const ELDRITCH_TARGET: ReadonlyArray<SemanticField> = ['night', 'death', 'gates'];

// Divination asks the sign that answers and speaks as the seer, so its AGENT
// field is the one thing its two clause kinds do not share (spec 1.5), and it
// is fixed rather than drawn, the way Protection fixes its warding agent.
// TARGET never draws from signs, which keeps AGENT and TARGET off one root.
const DIVINATION_INTENT: ReadonlyArray<SemanticField> = ['sight', 'summoning'];
const DIVINATION_TARGET: ReadonlyArray<SemanticField> = ['fate', 'hidden', 'time'];

// Modifier fields are keyed by kind so every reachable pool holds at least
// one root carrying the needed form.
const ADJECTIVE_FIELDS: ReadonlyArray<SemanticField> = ['night', 'harm', 'death'];
const ADVERB_FIELDS: ReadonlyArray<SemanticField> = ['hidden', 'night', 'harm'];
const DIVINATION_ADJECTIVE_FIELDS: ReadonlyArray<SemanticField> = ['night', 'sight', 'fate'];
const DIVINATION_ADVERB_FIELDS: ReadonlyArray<SemanticField> = ['sight', 'night', 'hidden'];

function clauseCount(difficulty: number): number {
  if (difficulty <= 5) return 1;
  if (difficulty <= 7) return 2;
  return 3;
}

function powerWordStyle(difficulty: number): PowerWordStyle {
  if (difficulty === 8) return 'triple';
  if (difficulty === 9) return 'triangle';
  return 'none';
}

function agentCount(difficulty: number): number {
  return 1 + (difficulty >= 6 ? 1 : 0) + (difficulty >= 8 ? 1 : 0);
}

function buildClause(
  school: School,
  difficulty: number,
  rng: Rng,
  kind: ClauseKind | null,
): ClausePlan {
  const genes: GeneInstance[] = [];
  let invocationLike = false;

  if (school === 'protection') {
    genes.push({ role: 'AGENT', field: 'warding', flavor: null });
    genes.push({ role: 'INTENT', field: pick(rng, PROTECTION_INTENT), flavor: 'first-person' });
    genes.push({ role: 'TARGET', field: pick(rng, PROTECTION_TARGET), flavor: null });
  } else if (school === 'curse') {
    genes.push({ role: 'TARGET', field: pick(rng, CURSE_TARGET), flavor: null });
    genes.push({ role: 'INTENT', field: 'harm', flavor: 'optative' });
  } else if (school === 'divination') {
    // The formula asks once and answers as many times as its tier allows, so
    // the clause kind is the index and the genes only change mood with it.
    genes.push({
      role: 'AGENT',
      field: kind === 'asking' ? 'signs' : 'sight',
      flavor: null,
    });
    genes.push({
      role: 'INTENT',
      field: pick(rng, DIVINATION_INTENT),
      flavor: kind === 'asking' ? 'interrogative' : 'first-person',
    });
    genes.push({ role: 'TARGET', field: pick(rng, DIVINATION_TARGET), flavor: null });
  } else {
    // Invocation carries the same skeleton with or without the Eldritch
    // register, per genomes.md 1.3.
    invocationLike = true;
    for (let i = 0; i < agentCount(difficulty); i += 1) {
      genes.push({ role: 'AGENT', field: pick(rng, INVOCATION_AGENT), flavor: null });
    }
    genes.push({ role: 'INTENT', field: 'summoning', flavor: 'imperative' });
    genes.push({ role: 'POWER-WORD', field: null, flavor: null });
  }

  // The tier tables introduce the modifier at 4 and keep it optional above.
  let modifier: ModifierKind | null = null;
  let modifierField: SemanticField | null = null;
  const wantsModifier =
    difficulty === 4 || (difficulty >= 5 && chance(rng, 0.5));
  if (wantsModifier) {
    // Invocation epithets stay uninflected under Eldritch, so the
    // invocation family only takes adverbs and dodges agreement entirely.
    modifier = invocationLike ? 'adverb' : pick(rng, ['adjective', 'adverb'] as const);
    const divination = school === 'divination';
    const adjectives = divination ? DIVINATION_ADJECTIVE_FIELDS : ADJECTIVE_FIELDS;
    const adverbs = divination ? DIVINATION_ADVERB_FIELDS : ADVERB_FIELDS;
    modifierField = pick(rng, modifier === 'adjective' ? adjectives : adverbs);
    genes.push({ role: 'MODIFIER', field: modifierField, flavor: null });
  }

  return {
    genes,
    modifier,
    modifierField,
    agentCount: invocationLike ? agentCount(difficulty) : 0,
    kind,
  };
}

export function buildPlan(school: School, difficulty: number, rng: Rng): FormulaPlan {
  const eldritch = school === 'eldritch';
  const base = {
    school,
    difficulty,
    eldritch,
    powerWordStyle: powerWordStyle(difficulty),
  };

  if (difficulty === 1) {
    return {
      ...base,
      opening: false,
      closing: false,
      seal: false,
      clauses: [
        {
          genes: [{ role: 'POWER-WORD', field: null, flavor: null }],
          modifier: null,
          modifierField: null,
          agentCount: 0,
          kind: null,
        },
      ],
    };
  }

  if (difficulty === 2) {
    const genes: GeneInstance[] = [];
    if (school === 'protection') {
      genes.push({ role: 'INTENT', field: pick(rng, PROTECTION_INTENT), flavor: 'imperative' });
      genes.push({ role: 'TARGET', field: pick(rng, PROTECTION_TARGET), flavor: null });
    } else if (school === 'curse') {
      genes.push({ role: 'INTENT', field: 'harm', flavor: 'imperative' });
      genes.push({ role: 'TARGET', field: pick(rng, CURSE_TARGET), flavor: null });
    } else if (school === 'divination') {
      genes.push({ role: 'INTENT', field: pick(rng, DIVINATION_INTENT), flavor: 'imperative' });
      genes.push({ role: 'TARGET', field: pick(rng, DIVINATION_TARGET), flavor: null });
    } else {
      genes.push({ role: 'INTENT', field: 'summoning', flavor: 'imperative' });
      genes.push({
        role: 'TARGET',
        field: pick(rng, eldritch ? ELDRITCH_TARGET : INVOCATION_AGENT),
        flavor: null,
      });
    }
    return {
      ...base,
      opening: false,
      closing: false,
      seal: false,
      clauses: [{ genes, modifier: null, modifierField: null, agentCount: 0, kind: null }],
    };
  }

  const clauses: ClausePlan[] = [];
  for (let i = 0; i < clauseCount(difficulty); i += 1) {
    // Spec 1.5: the first clause of a divination formula asks, every clause
    // after it sees.
    const kind: ClauseKind | null =
      school === 'divination' ? (i === 0 ? 'asking' : 'seeing') : null;
    clauses.push(buildClause(school, difficulty, rng, kind));
  }

  return {
    ...base,
    opening: true,
    closing: difficulty >= 5,
    seal: difficulty >= 7,
    clauses,
  };
}
