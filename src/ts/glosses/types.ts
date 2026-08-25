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
// This module imports one type and nothing else. It is the contract both the
// generator and every pack depend on, so it must sit under both.

import type { TimeDirection } from '../generator/types.js';

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
interface GenomeGlosses {
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

// The two Divination clause kinds carry the same participants, so one shape
// serves both and the method that receives it says which mood it writes.
export interface RunicDivination {
  readonly agentRoot: string;
  readonly intentRoot: string;
  readonly targetRoot: string;
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

// --- Greek -----------------------------------------------------------------

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
