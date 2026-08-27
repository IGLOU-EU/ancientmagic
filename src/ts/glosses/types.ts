// The gloss pack contract: everything a UI language must supply for the
// generator to write a gloss line.
//
// The genome decides WHAT is said (which root fills which role, which power is
// named, how many clauses). A pack decides HOW IT READS: the wording of each
// root, and the sentence grammar that assembles them. That split is why a
// translated pack is real linguistic work and why it needs no change to the
// genome code.
//
// A pack never receives a rendered fragment to paste. It receives the ids of
// what the genome chose and composes the sentence itself, so a language with
// gender, agreement or another word order has everything it needs.
//
// What is here is what every genome shares: the shape of a lexicon entry, the
// ways a participant can be named, and the clause parts every script hands
// over alike. What one script alone produces is declared with that script, in
// languages/<genome>-glosses.ts, so this contract stays the size it is
// whatever the site learns to write.

import type { TimeDirection } from '../generator/types.js';
import type { EgyptianGlosses } from '../languages/egyptian-glosses.js';
import type { GreekGlosses } from '../languages/greek-glosses.js';
import type { PhoenicianGlosses } from '../languages/phoenician-glosses.js';
import type { RunicGlosses } from '../languages/runic-glosses.js';

// The grammatical roles a root can fill. A genome declares, per root, which of
// these it offers; the pack must supply exactly those and no others.
export type RootForm = 'noun' | 'plural' | 'verb' | 'pp' | 'adj' | 'adv';

// Agreement data for the packs whose articles, adjectives and participles bend
// to a head word. A pack that needs none of it sets none of it, which is why
// every field below is optional: English never mentions them.
export type Gender = 'm' | 'f';

export interface RootGloss {
  // Dictionary gloss of the root, as docs/genomes.md lists it.
  readonly gloss: string;
  readonly forms: Readonly<Partial<Record<RootForm, string>>>;
  // Gender of the noun and plural wordings, so a clause can choose an article
  // and agree what it hangs on them.
  readonly gender?: Gender;
  // Wordings a clause may attach to a feminine head, keyed like `forms`. A
  // form absent here is invariable, the masculine wording serves both.
  readonly feminine?: Readonly<Partial<Record<RootForm, string>>>;
}

export type RootGlossTable = Readonly<Record<string, RootGloss>>;
export type GlossTable = Readonly<Record<string, string>>;

// A named power carries both the form used as a name in a sentence and the
// descriptive gloss the low tiers show on its own.
export interface NamedPower {
  readonly name: string;
  readonly gloss: string;
  // Set where a clause addresses the bearer by a title of its own gender.
  readonly gender?: Gender;
}

export type NamedPowerTable = Readonly<Record<string, NamedPower>>;

// What the genome hands the pack to name a participant.
export type GlossRef =
  // A coined root of the lexicon.
  | { readonly kind: 'root'; readonly id: string }
  // An attested named power.
  | { readonly kind: 'power'; readonly id: string }
  // A dread epithet: the pack may want its gloss, its spoken form, or both.
  | { readonly kind: 'epithet'; readonly id: string; readonly spoken: string };

// Every pack of every genome offers these.
export interface GenomeGlosses {
  // Fixed idiom of the genome's spec, by id.
  idiom(id: string): string;
  // Repetition count of a seal.
  seal(count: number): string;
  // The same count read as a depth in time, which is how Chronomancy words
  // the seal it shares with the other schools (genomes.md 1.6). Two methods
  // rather than one parameterized by a school, so that a pack that forgets a
  // wording fails the completeness sweep by name instead of quietly answering
  // the other school's sentence.
  sealDepth(count: number): string;
  // The four directions of a crossing clause, by their plan-level id.
  direction(id: TimeDirection): string;
  // Joins the gloss parts of one formula into the displayed line.
  sentences(parts: ReadonlyArray<string>): string;
}

// What a Chronomancy clause hands its pack. The crossing clause carries a
// direction and the binding clause never does (genomes.md 1.6).
export interface ChronomancyCross {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
  readonly direction: TimeDirection;
}

export interface ChronomancyBind {
  readonly intentRoot: string;
  readonly targetRoot: string;
  readonly adjectiveRoot: string | null;
  readonly adverbRoot: string | null;
}

// --- The pack --------------------------------------------------------------

// One UI language's glosses for every genome, one loader per genome. A genome
// added later adds its key here, which breaks every pack until each one covers
// it: the language is still the unit that must be whole, and a translator
// still copies a whole directory.
//
// The loading grain is finer than the guarantee on purpose. A conjuration in
// one script wants that script's wordings in the page's language, so that is
// what it fetches. Twelve genomes must not cost twelve gloss files a click.
export interface GlossPack {
  readonly language: string;
  readonly runic: () => Promise<RunicGlosses>;
  readonly egyptian: () => Promise<EgyptianGlosses>;
  readonly phoenician: () => Promise<PhoenicianGlosses>;
  readonly greek: () => Promise<GreekGlosses>;
}
