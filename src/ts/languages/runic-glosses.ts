// What the Runic genome hands a gloss pack, and what it asks back.
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
  RootGlossTable,
} from '../glosses/types.js';

export interface RunicProtection {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface RunicCurse {
  readonly targetRoot: string;
  readonly intentRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

// The two Divination clause kinds carry the same participants, so one shape
// serves both and the method that receives it says which mood it writes.
export interface RunicDivination {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

// What can stand in a free POWER-WORD slot. A cry and a dread epithet are
// romanized words the pack speaks as they are, which is why they carry no
// wording of their own here. A Norse-layer word is spoken and then said: the
// glyph line writes Proto-Germanic and the gloss carries the picture those
// words compose, which the record only spells out centuries later (spec 2.7).
export type RunicVox =
  | { readonly kind: 'power'; readonly id: string }
  | { readonly kind: 'norse'; readonly id: string };

export interface RunicInvocation {
  readonly agents: ReadonlyArray<GlossRef>;
  readonly intentRoot: string;
  readonly adverbRoot: string | null;
  readonly powerWord: RunicVox;
}

export interface RunicGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  readonly powers: GlossTable;
  // One wording per word of the Norse layer of 2.7: the word spoken, then what
  // it is. A reader who hears an unfamiliar name needs to be told what stood up.
  readonly norse: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;
  readonly depths: GlossTable;
  readonly directions: GlossTable;

  protectionClause(parts: RunicProtection): string;
  curseClause(parts: RunicCurse): string;
  invocationClause(parts: RunicInvocation): string;
  // The question, then what the seer answers. Only the asking gloss carries a
  // question mark, since no script in this site writes one.
  divinationAsk(parts: RunicDivination): string;
  divinationSee(parts: RunicDivination): string;
  // The command that opens the way, then the deed done in the saying. Only
  // the binding gloss is marked for its mood, and how it is marked is the
  // pack's business, as the question is.
  chronomancyCross(parts: ChronomancyCross): string;
  chronomancyBind(parts: ChronomancyBind): string;
  // The closing idiom that takes an argument: the time the caster returns to,
  // with a second noun hung behind it at tier 9.
  returnAnchor(anchorRoot: string, genitiveRoot: string | null): string;
  litanyTriple(word: string): string;
  litanyTriangle(word: string): string;
  tierOne(word: string, eldritch: boolean): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}
