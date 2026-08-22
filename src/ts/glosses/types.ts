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
// This module imports nothing on purpose. It is the contract both the
// generator and every pack depend on, so it must sit under both.

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

// Every pack of every genome offers these three.
interface GenomeGlosses {
  // Fixed idiom of the genome's spec, by id.
  idiom(id: string): string;
  // Repetition count of a seal.
  seal(count: number): string;
  // Joins the gloss parts of one formula into the displayed line.
  sentences(parts: ReadonlyArray<string>): string;
}

// --- Runic -----------------------------------------------------------------

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

export interface RunicInvocation {
  readonly agents: ReadonlyArray<GlossRef>;
  readonly intentRoot: string;
  readonly adverbRoot: string | null;
  // Power words are romanized attested words, so the pack is handed the word
  // itself rather than an id to look up.
  readonly powerWord: string;
}

export interface RunicGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  readonly powers: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;

  protectionClause(parts: RunicProtection): string;
  curseClause(parts: RunicCurse): string;
  invocationClause(parts: RunicInvocation): string;
  litanyTriple(word: string): string;
  litanyTriangle(word: string): string;
  tierOne(word: string, eldritch: boolean): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}

// --- Egyptian --------------------------------------------------------------

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

// Who an EO3 name-knowledge line addresses. The gate form is the coined
// "X of the Y" name of the tier 8 litany.
export type EgyptianAddress =
  | GlossRef
  | { readonly kind: 'gate'; readonly headRoot: string; readonly tailRoot: string };

export interface EgyptianGlosses extends GenomeGlosses {
  readonly roots: RootGlossTable;
  readonly powers: NamedPowerTable;
  readonly epithets: GlossTable;
  readonly idioms: GlossTable;
  readonly seals: GlossTable;

  protectionClause(parts: EgyptianProtection): string;
  curseClause(parts: EgyptianCurse): string;
  invocationClause(parts: EgyptianInvocation): string;
  // The EO2 title line, over a dread epithet or a coined root.
  spellTitle(subject: GlossRef): string;
  // The EO3 line. The register inverts who knows whose name.
  nameKnowledge(address: EgyptianAddress, eldritch: boolean): string;
  tierOne(subject: GlossRef): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
}

// --- Phoenician ------------------------------------------------------------

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

  jussiveClause(parts: PhoenicianJussive): string;
  invocationClause(parts: PhoenicianInvocation): string;
  // PO2, the royal self presentation. The bright form names the caster by the
  // coined theophoric name the genome spelled, so it arrives spoken.
  selfPresentationByName(spokenName: string): string;
  selfPresentationByEpithet(epithetId: string): string;
  // PO1 and PO3 openers.
  openerByEpithet(epithetId: string): string;
  openerToLord(powerId: string): string;
  openerAgainst(targetRoot: string, adjectiveRoot: string | null): string;
  litanyTriple(subject: GlossRef): string;
  litanyTriangle(spoken: string): string;
  tierOne(subject: GlossRef): string;
  tierTwo(intentRoot: string, targetRoot: string): string;
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
}
