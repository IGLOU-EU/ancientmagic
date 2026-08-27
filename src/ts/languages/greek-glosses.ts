// What the Greek genome hands a gloss pack, and what it asks back.
//
// Which clauses a script produces, and who stands in each of them, is the
// genome's own knowledge, so it is declared beside the genome rather than in
// the contract every language shares. A pack writes the sentence, a genome
// says what the sentence is about.
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

// Greek marks its roles with endings, so its seven clause shapes differ by
// order rather than by machinery. Every one of them carries `joined`, because
// this genome joins clauses with the word KAI and a joined clause opens on
// "And" in the gloss, as the Phoenician seeing clause does.
export interface GreekProtection {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  // Absent at the tiers where the repetition subsumes it.
  readonly powerWord: string | null;
  readonly joined: boolean;
}

export interface GreekCurse {
  readonly targetRoot: string;
  readonly intentRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly joined: boolean;
}

export interface GreekInvocation {
  readonly agents: ReadonlyArray<GlossRef>;
  readonly intentRoot: string;
  readonly adverbRoot: string | null;
  readonly powerWord: string;
  readonly eldritch: boolean;
  readonly joined: boolean;
}

export interface GreekDivination {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly joined: boolean;
}

export interface GreekChronomancyCross {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly direction: TimeDirection;
  readonly joined: boolean;
}

export interface GreekChronomancyBind {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly joined: boolean;
}

export interface GreekGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  // A vox magica carries the name a sentence spells it with and the gloss the
  // low tier shows, as the Egyptian and Phoenician powers do: the genome's
  // romanization exists to be mapped to letters, not to be read in a sentence.
  readonly powers: NamedPowerTable;
  readonly epithets: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;
  readonly depths: GlossTable;
  readonly directions: GlossTable;

  protectionClause(parts: GreekProtection): string;
  curseClause(parts: GreekCurse): string;
  invocationClause(parts: GreekInvocation): string;
  divinationAsk(parts: GreekDivination): string;
  divinationSee(parts: GreekDivination): string;
  chronomancyCross(parts: GreekChronomancyCross): string;
  chronomancyBind(parts: GreekChronomancyBind): string;
  // GC5, the genome's one idiom with an argument.
  returnAnchor(anchorRoot: string, genitiveRoot: string | null): string;
  // The repeated word is a vox in the clear register and a dread epithet under
  // the other, and this genome keeps the two tables apart, so the flag rides
  // along as it does on tierOne.
  litanyTriple(word: string, eldritch: boolean): string;
  litanyShrink(word: string, eldritch: boolean): string;
  tierOne(word: string, eldritch: boolean): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}
