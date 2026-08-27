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
  TimeDirection,
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

// Chronomancy commands time directly and names no god to do it for the caster
// (spec 1.6), so it carries no AGENT gene at all and its clause is verb,
// object, qualifier. Fate is the one field it shares with Divination: the one
// reads what is decreed, the other acts on it.
const CHRONOMANCY_INTENT: ReadonlyArray<SemanticField> = ['course', 'binding'];
const CHRONOMANCY_TARGET: ReadonlyArray<SemanticField> = ['time', 'gates', 'fate'];

// Modifier fields are keyed by kind so every reachable pool holds at least
// one root carrying the needed form.
type ModifierFields = Readonly<Record<ModifierKind, ReadonlyArray<SemanticField>>>;

const BASE_MODIFIER_FIELDS: ModifierFields = {
  adjective: ['night', 'harm', 'death'],
  adverb: ['hidden', 'night', 'harm'],
};

// The two schools that qualify from fields of their own. Every other school
// reads the base pair, so one lookup answers for all six and the adjective and
// the adverb can never fall on different sides of the same question.
const SCHOOL_MODIFIER_FIELDS: Readonly<Partial<Record<School, ModifierFields>>> = {
  divination: {
    adjective: ['night', 'sight', 'fate'],
    adverb: ['sight', 'night', 'hidden'],
  },
  chronomancy: {
    adjective: ['course', 'night', 'fate'],
    adverb: ['course', 'night', 'hidden'],
  },
};

// The four values a crossing clause moves by, in the order the spec lists
// them. Exported because the packs must gloss exactly these four and the
// genomes must map exactly these four to words of their own.
export const DIRECTIONS: ReadonlyArray<TimeDirection> = ['back', 'forth', 'again', 'still'];

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
  let direction: TimeDirection | null = null;

  // The invocation family is the clause no branch below claims, and it is read
  // three times over: it builds the agent chain, it fixes the modifier kind,
  // and it is what makes a clause report an agent count at all.
  const invocationLike = school === 'invocation' || school === 'eldritch';

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
  } else if (school === 'chronomancy') {
    // The crossing clause commands and carries its direction, the binding
    // clause performs. No AGENT: the school addresses time itself.
    genes.push({
      role: 'INTENT',
      field: pick(rng, CHRONOMANCY_INTENT),
      flavor: kind === 'crossing' ? 'imperative' : 'performative',
    });
    genes.push({ role: 'TARGET', field: pick(rng, CHRONOMANCY_TARGET), flavor: null });
    if (kind === 'crossing') direction = pick(rng, DIRECTIONS);
  } else {
    // Invocation carries the same skeleton with or without the Eldritch
    // register, per genomes.md 1.3.
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
    const fields = SCHOOL_MODIFIER_FIELDS[school] ?? BASE_MODIFIER_FIELDS;
    modifierField = pick(rng, fields[modifier]);
    genes.push({ role: 'MODIFIER', field: modifierField, flavor: null });
  }

  return {
    genes,
    modifier,
    modifierField,
    agentCount: invocationLike ? agentCount(difficulty) : 0,
    kind,
    direction,
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
          direction: null,
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
    } else if (school === 'chronomancy') {
      genes.push({ role: 'INTENT', field: pick(rng, CHRONOMANCY_INTENT), flavor: 'imperative' });
      genes.push({ role: 'TARGET', field: pick(rng, CHRONOMANCY_TARGET), flavor: null });
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
      clauses: [
        { genes, modifier: null, modifierField: null, agentCount: 0, kind: null, direction: null },
      ],
    };
  }

  const clauses: ClausePlan[] = [];
  for (let i = 0; i < clauseCount(difficulty); i += 1) {
    // Spec 1.5 and 1.6: a divination formula asks once then sees, a
    // chronomantic one crosses once then binds. The index is the kind.
    let kind: ClauseKind | null = null;
    if (school === 'divination') kind = i === 0 ? 'asking' : 'seeing';
    else if (school === 'chronomancy') kind = i === 0 ? 'crossing' : 'binding';
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
