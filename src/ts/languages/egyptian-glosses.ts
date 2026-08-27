// What the Egyptian genome hands a gloss pack, and what it asks back.
//
// Which clauses a script produces, and who stands in each of them, is the
// genome's own knowledge, so it is declared beside the genome rather than in
// the contract every language shares. A pack writes the sentence, a genome
// says what the sentence is about.
//
// Types only, so a pack that names this file fetches nothing at runtime: the
// pairing is checked by the compiler and erased before the page loads.

import type {
  ChronomancyBind,
  ChronomancyCross,
  GenomeGlosses,
  GlossRef,
  GlossTable,
  NamedPowerTable,
  RootGlossTable,
} from '../glosses/types.js';

export interface EgyptianProtection {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly agentPower: string;
  readonly freePower: string;
}

export interface EgyptianCurse {
  readonly targetRoot: string;
  readonly intentRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface EgyptianInvocation {
  readonly agents: ReadonlyArray<GlossRef>;
  readonly adverbRoot: string | null;
  readonly power: GlossRef;
}

// The asking clause questions a named god, with the n-genitive chain its tier
// gives it. The seeing clause carries the caster in the verb alone, so it
// names no agent at all.
export interface EgyptianDivinationAsk {
  readonly agentPower: string;
  readonly chainRoots: ReadonlyArray<string>;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface EgyptianDivinationSee {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

// Who an EO3 name-knowledge line addresses. The gate form is the coined
// "X of the Y" name of the tier 8 litany, which the oracle names of the
// Divination litany borrow: the two read through the same shape.
export type EgyptianAddress =
  | GlossRef
  | { readonly kind: 'gate'; readonly headRoot: string; readonly tailRoot: string };

export interface EgyptianGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  readonly powers: NamedPowerTable;
  readonly epithets: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;
  readonly depths: GlossTable;
  readonly directions: GlossTable;

  protectionClause(parts: EgyptianProtection): string;
  curseClause(parts: EgyptianCurse): string;
  invocationClause(parts: EgyptianInvocation): string;
  divinationAsk(parts: EgyptianDivinationAsk): string;
  divinationSee(parts: EgyptianDivinationSee): string;
  chronomancyCross(parts: ChronomancyCross): string;
  chronomancyBind(parts: ChronomancyBind): string;
  returnAnchor(anchorRoot: string, genitiveRoot: string | null): string;
  // The EO2 title line, over a dread epithet or a coined root.
  spellTitle(subject: GlossRef): string;
  // The EO3 line. The register inverts who knows whose name.
  nameKnowledge(address: EgyptianAddress, eldritch: boolean): string;
  tierOne(subject: GlossRef): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}
