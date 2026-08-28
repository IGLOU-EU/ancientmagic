// What the Latin genome hands a gloss pack, and what it asks back.
//
// Which clauses a script produces, and who stands in each of them, is the
// genome's own knowledge, so it is declared beside the genome rather than in
// the contract every language shares. A pack writes the sentence, a genome
// says what the sentence is about.
//
// This pack is held to a stricter contract than any other: the reader can lay
// the gloss under the glyph line and read both, so a wording that drifted from
// the letters would be caught by exactly the audience the genome exists for
// (spec 9, opener).
//
// Types only, so a pack that names this file fetches nothing at runtime: the
// pairing is checked by the compiler and erased before the page loads.

import type { TimeDirection } from '../generator/types.js';
import type {
  GenomeGlosses,
  GlossRef,
  GlossTable,
  NamedPowerTable,
  RootGlossTable,
} from '../glosses/types.js';

// Latin marks its roles with endings, so its seven clause shapes differ by
// order rather than by machinery. Every one of them carries `joined`, because
// this genome joins clauses with the word ET and a joined clause opens on
// "And" in the gloss, as the Greek and Phoenician ones do.
export interface LatinProtection {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  // Absent at the tiers where the repetition subsumes it.
  readonly powerWord: string | null;
  readonly joined: boolean;
}

export interface LatinCurse {
  readonly targetRoot: string;
  readonly intentRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly joined: boolean;
}

export interface LatinInvocation {
  readonly agents: ReadonlyArray<GlossRef>;
  readonly intentRoot: string;
  readonly adverbRoot: string | null;
  readonly powerWord: string;
  readonly eldritch: boolean;
  readonly joined: boolean;
}

export interface LatinDivination {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly joined: boolean;
}

export interface LatinChronomancyCross {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly direction: TimeDirection;
  readonly joined: boolean;
}

export interface LatinChronomancyBind {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly joined: boolean;
}

export interface LatinGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  // An attested power carries the name a sentence spells it with and the gloss
  // the low tier shows, as the older genomes do: the genome's romanization
  // exists to be mapped to letters, not to be read in a sentence.
  readonly powers: NamedPowerTable;
  readonly epithets: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;
  readonly depths: GlossTable;
  readonly directions: GlossTable;

  protectionClause(parts: LatinProtection): string;
  curseClause(parts: LatinCurse): string;
  invocationClause(parts: LatinInvocation): string;
  divinationAsk(parts: LatinDivination): string;
  divinationSee(parts: LatinDivination): string;
  chronomancyCross(parts: LatinChronomancyCross): string;
  chronomancyBind(parts: LatinChronomancyBind): string;
  // LC5, the genome's one idiom with an argument.
  returnAnchor(anchorRoot: string, genitiveRoot: string | null): string;
  // The repeated word is an attested power in the clear register and a dread
  // epithet under the other, and this genome keeps the two tables apart, so
  // the flag rides along as it does on tierOne.
  litanyTriple(word: string, eldritch: boolean): string;
  litanyShrink(word: string, eldritch: boolean): string;
  tierOne(word: string, eldritch: boolean): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}
