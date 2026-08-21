// Shared types of the generation pipeline. The plan layer is language
// independent, genomes turn a plan into the three aligned output lines.

import type { Rng } from './rng.js';

export type LanguageId = 'runic' | 'egyptian' | 'phoenician';

export type School = 'protection' | 'curse' | 'invocation' | 'eldritch';

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
  | 'time';

export type ModifierKind = 'adjective' | 'adverb';

export interface GeneInstance {
  role: GeneRole;
  field: SemanticField | null;
  // Grammatical flavor fixed by the school, the genome maps it to endings.
  flavor: 'first-person' | 'optative' | 'imperative' | null;
}

export interface ClausePlan {
  genes: GeneInstance[];
  modifier: ModifierKind | null;
  modifierField: SemanticField | null;
  agentCount: number;
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

export interface Genome {
  id: LanguageId;
  realize(plan: FormulaPlan, rng: Rng): FormulaOutput;
}
