// What the Ogham genome hands a gloss pack, and what it asks back.
//
// Which clauses a script produces, and who stands in each of them, is the
// genome's own knowledge, so it is declared beside the genome rather than in
// the contract every language shares. A pack writes the sentence, a genome
// says what the sentence is about.
//
// This genome asks a pack for one thing no other does: the kenning of a
// letter. Where every other power word is a name the gloss repeats, the
// kenning vox of spec 10.7 puts a single letter on the glyph line and lets the
// gloss speak the lore the letter carries, so for those five words the
// attested layer is the gloss and the coined layer is the glyph.
//
// No clause carries a joined flag, and that absence is the rod ruling of 10.2:
// a new rod opens a new sentence with no conjunction word, so nothing here
// ever has to know it stands second.
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

// What can stand in a free POWER-WORD slot. The kenning is drawable only at
// the scholastic tiers and only in the four bright schools, the epithet only
// under the register, and the pools keep them apart (spec 10.7, 10.9).
export type OghamVox =
  | { readonly kind: 'power'; readonly id: string }
  | { readonly kind: 'kenning'; readonly id: string }
  | { readonly kind: 'epithet'; readonly id: string };

// What the repetition segment of tiers 8 and 9 repeats. The triangle of the
// four bright schools cuts down the birch warning rather than a name, which is
// this genome's own device: a count shrinking by its strokes, not a word
// shrinking by its letters (spec 10.9).
export type OghamNamedRepeat =
  | { readonly kind: 'power'; readonly id: string }
  | { readonly kind: 'epithet'; readonly id: string };

export type OghamRepeat = OghamNamedRepeat | { readonly kind: 'birch' };

export interface OghamProtection {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  // Absent at the tiers where the repetition subsumes it.
  readonly powerWord: OghamVox | null;
}

export interface OghamCurse {
  readonly targetRoot: string;
  readonly intentRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface OghamInvocation {
  readonly agents: ReadonlyArray<GlossRef>;
  readonly intentRoot: string;
  readonly adverbRoot: string | null;
  readonly powerWord: OghamVox;
  readonly eldritch: boolean;
}

export interface OghamDivination {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface OghamChronomancyCross {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly direction: TimeDirection;
}

export interface OghamChronomancyBind {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

export interface OghamGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  // An attested name carries the form a sentence spells it with and the gloss
  // the low tier shows on its own: the reading line writes lugus, the sentence
  // writes Lugus, and a name the scholarship accents keeps its accents here.
  readonly powers: NamedPowerTable;
  readonly epithets: GlossTable;
  // One kenning per letter of the closed pool of 10.7, the riddling two-word
  // gloss the Bríatharogam shape hands down.
  readonly kennings: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;
  readonly depths: GlossTable;
  readonly directions: GlossTable;

  protectionClause(parts: OghamProtection): string;
  curseClause(parts: OghamCurse): string;
  invocationClause(parts: OghamInvocation): string;
  divinationAsk(parts: OghamDivination): string;
  divinationSee(parts: OghamDivination): string;
  chronomancyCross(parts: OghamChronomancyCross): string;
  chronomancyBind(parts: OghamChronomancyBind): string;
  // OC5, the genome's one idiom with an argument, and the one closer that
  // keeps its deed last in the gloss as well as in the glyphs.
  returnAnchor(anchorRoot: string, genitiveRoot: string | null): string;
  // A triple repeats a name, never the birch: that one is the triangle's own.
  litanyTriple(word: OghamNamedRepeat): string;
  litanyShrink(word: OghamRepeat): string;
  tierOne(word: OghamVox): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}
