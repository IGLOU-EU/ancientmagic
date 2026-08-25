// Shared types of the generation pipeline. The plan layer is language
// independent, genomes turn a plan into the three aligned output lines.

import type { Rng } from './rng.js';

export type LanguageId = 'runic' | 'egyptian' | 'phoenician';

export type School =
  | 'protection'
  | 'curse'
  | 'invocation'
  | 'eldritch'
  | 'divination'
  | 'chronomancy';

export type GeneRole =
  | 'INTENT'
  | 'TARGET'
  | 'AGENT'
  | 'MODIFIER'
  | 'POWER-WORD'
  | 'SEAL';

export type SemanticField =
  | 'warding'
  | 'harm'
  | 'summoning'
  | 'hidden'
  | 'binding'
  | 'fire'
  | 'night'
  | 'death'
  | 'gates'
  | 'time'
  // The last three arrived with Divination, which is the only school that
  // draws from them (genomes.md 1.5).
  | 'sight'
  | 'fate'
  | 'signs'
  // Course arrived with Chronomancy and is likewise its own: the verbs and
  // nouns of moving through time (genomes.md 1.6). Fate is the one field the
  // two schools share.
  | 'course';

export type ModifierKind = 'adjective' | 'adverb';

export interface GeneInstance {
  role: GeneRole;
  field: SemanticField | null;
  // Grammatical flavor fixed by the school, the genome maps it to endings.
  flavor:
    | 'first-person'
    | 'optative'
    | 'imperative'
    | 'interrogative'
    // The mood where saying is doing, which every genome maps to a form it
    // spends on no other school (genomes.md 1.6).
    | 'performative'
    | null;
}

// Divination holds the same genes in two moods: the formula asks once, then
// says what it sees. Chronomancy does the same with two moods of its own: it
// opens the way, then does the deed. Every other school builds clauses of one
// shape and leaves this null.
export type ClauseKind = 'asking' | 'seeing' | 'crossing' | 'binding';

// Which way a crossing clause moves through time. Closed and language
// independent, so one clause plan gives the same direction in all three
// genomes (genomes.md 1.6).
export type TimeDirection = 'back' | 'forth' | 'again' | 'still';

export interface ClausePlan {
  genes: GeneInstance[];
  modifier: ModifierKind | null;
  modifierField: SemanticField | null;
  agentCount: number;
  kind: ClauseKind | null;
  // Set on a crossing clause and on nothing else.
  direction: TimeDirection | null;
}

export type PowerWordStyle = 'none' | 'triple' | 'triangle';

export interface FormulaPlan {
  school: School;
  difficulty: number;
  eldritch: boolean;
  opening: boolean;
  closing: boolean;
  seal: boolean;
  powerWordStyle: PowerWordStyle;
  clauses: ClausePlan[];
}

export interface FormulaOutput {
  glyphs: string;
  transliteration: string;
  gloss: string;
}

export interface Settings {
  language: LanguageId;
  school: School;
  difficulty: number;
}

// What a genome module exports: the rules of one script, still waiting for the
// wordings of one language. The glosses are passed in rather than imported, so
// the language displayed is the caller's decision and a genome never reaches
// for a wording of its own. It asks for its own slice and nothing wider: a
// runic conjuration must not carry the Egyptian glosses of any language.
export interface Genome<Glosses> {
  readonly id: LanguageId;
  realize(plan: FormulaPlan, rng: Rng, glosses: Glosses): FormulaOutput;
}

// A genome once a language's slice is bound to it, which is what the pipeline
// realizes. The binding erases the slice type on purpose: every genome wants a
// different one, so only the place that names both can pair them, and one
// bound shape is what a loader can hand back.
export interface BoundGenome {
  readonly id: LanguageId;
  realize(plan: FormulaPlan, rng: Rng): FormulaOutput;
}
