// What the Phoenician genome hands a gloss pack, and what it asks back.
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

export interface PhoenicianJussive {
  readonly agentPower: string;
  // Genitive chain stacked behind the agent, rendered in the plural.
  readonly chainRoots: ReadonlyArray<string>;
  readonly intentRoot: string;
  // Absent when the opener already named the target.
  readonly targetRoot: string | null;
  readonly adjectiveRoot: string | null;
  // Only Protection names a free power at clause end.
  readonly freePower: string | null;
  readonly adverbRoot: string | null;
}

// Below tier 8 the asking clause does not repeat the power's name, the verb
// prefix resumes it, so the pack is handed the power either way: named tells
// it whether to write the name or to speak of it in the third person, and its
// gender is what makes that pronoun agree.
export interface PhoenicianDivinationAsk {
  readonly agentPower: string;
  readonly named: boolean;
  readonly chainRoots: ReadonlyArray<string>;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface PhoenicianDivinationSee {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface PhoenicianInvocation {
  readonly agents: ReadonlyArray<GlossRef>;
  readonly intentRoot: string;
  readonly power: GlossRef;
  readonly adverbRoot: string | null;
}

export interface PhoenicianGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  readonly powers: NamedPowerTable;
  readonly epithets: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;
  readonly depths: GlossTable;
  readonly directions: GlossTable;

  jussiveClause(parts: PhoenicianJussive): string;
  invocationClause(parts: PhoenicianInvocation): string;
  divinationAsk(parts: PhoenicianDivinationAsk): string;
  divinationSee(parts: PhoenicianDivinationSee): string;
  chronomancyCross(parts: ChronomancyCross): string;
  chronomancyBind(parts: ChronomancyBind): string;
  returnAnchor(anchorRoot: string, genitiveRoot: string | null): string;
  // PO2, the royal self presentation. The bright form names the caster by the
  // coined theophoric name the genome spelled, so it arrives spoken.
  selfPresentationByName(spokenName: string): string;
  selfPresentationByEpithet(epithetId: string): string;
  // PO1 and PO3 openers.
  openerByEpithet(epithetId: string): string;
  openerToLord(powerId: string): string;
  openerAgainst(targetRoot: string, adjectiveRoot: string | null): string;
  // PO4, the inquiry put to a god, which names the power the formula asks.
  openerQuestion(powerId: string): string;
  // PO5, the dating formula, which stamps the formula with its year.
  openerYear(timeRoot: string): string;
  litanyTriple(subject: GlossRef): string;
  litanyTriangle(spoken: string): string;
  tierOne(subject: GlossRef): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}
