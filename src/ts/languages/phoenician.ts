// Phoenician genome rules: tokenization, the vowel dropping of the abjad,
// root-and-pattern morphology, the Eldritch register and the realization of a
// clause plan into the three aligned output lines. Every rule implements
// docs/genomes.md section 4.
//
// The glyph line is always built and stored in logical (reading) order. The
// right-to-left appearance is the bidi algorithm's job inside the isolated
// block design.md specifies, so the string itself is never reversed.

import { pick, type Rng } from '../generator/rng.js';
import type {
  ClausePlan,
  FormulaOutput,
  FormulaPlan,
  Genome,
  SemanticField,
} from '../generator/types.js';
import {
  ALF,
  BRIGHT_NAMES,
  DARK_NAMES,
  DREAD_POWER,
  ELDRITCH_CLOSE,
  FIELDS,
  INVOCATION_COME,
  LETTER_MAP,
  NUMERAL_GLYPHS,
  NUMERAL_WORDS,
  PC1,
  PC2,
  PC3,
  PLURAL_SPOKEN,
  PO1_HEAD,
  PO2_HEAD,
  PO3_HEAD,
  PROCLITIC_SPOKEN,
  SEAL_GLOSS,
  SEAL_HEAD,
  THEOPHORIC_SKELETON,
  THEOPHORIC_SPOKEN,
  WORD_SEP,
  YT,
  type DivineName,
  type DreadEpithet,
  type FixedWord,
  type Idiom,
  type PhoenicianRoot,
  type ProcliticId,
  type SealCount,
} from './phoenician-data.js';

export {
  tokenize,
  glyphsFor,
  speak,
  citation,
  conjugate,
  degrade,
  eldritchRoot,
  transitiveVerbsOf,
  composePhoenician,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

// Greedy longest match. The spec guarantees no lexicon entry contains kh, tt,
// ts, sh or gh as two separate letters, so two characters are tried first.
function tokenize(word: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < word.length) {
    const two = word.slice(i, i + 2);
    if (two.length === 2 && LETTER_MAP[two] !== undefined) {
      tokens.push(two);
      i += 2;
      continue;
    }
    const one = word.charAt(i);
    if (LETTER_MAP[one] === undefined && !VOWELS.has(one)) {
      throw new Error(`letter outside the phoenician romanization: ${one} in ${word}`);
    }
    tokens.push(one);
    i += 1;
  }
  return tokens;
}

// The abjad writes consonants. Every vowel is deleted, except a word-initial
// one which surfaces as alf. Adjacent identical letters collapse (spec 4.2).
function glyphsFor(vocalized: string): string {
  const glyphs: string[] = [];
  const push = (glyph: string): void => {
    if (glyphs[glyphs.length - 1] !== glyph) glyphs.push(glyph);
  };
  tokenize(vocalized).forEach((token, index) => {
    if (VOWELS.has(token)) {
      if (index === 0) push(ALF);
      return;
    }
    const glyph = LETTER_MAP[token];
    if (glyph !== undefined) push(glyph);
  });
  return glyphs.join('');
}

// The transliteration drops the apostrophe of the alf token and speaks the
// emphatic tt as t (spec 4.2).
function speak(vocalized: string): string {
  return tokenize(vocalized)
    .map((token) => (token === "'" ? '' : token === 'tt' ? 't' : token))
    .join('');
}

function radicals(root: string): string[] {
  return tokenize(root);
}

// Citation vocalization of spec 4.3, plus the quadriliteral shape the Eldritch
// register needs, which 4.10 fixes through its own worked example shomrugh.
// The single radical case exists only for the last step of the shrinking word
// of 4.9, which is not a root the lexicon ever holds.
function citation(root: string): string {
  const c = radicals(root);
  const at = (index: number): string => c[index] ?? '';
  if (c.length === 2) return `${at(0)}o${at(1)}`;
  if (c.length === 3) return `${at(0)}a${at(1)}o${at(2)}`;
  if (c.length === 4) return `${at(0)}a${at(1)}${at(2)}e${at(3)}`;
  if (c.length === 1) return `${at(0)}a`;
  throw new Error(`root outside the one to four radical range: ${root}`);
}

export type VerbForm =
  | 'jussive-3ms'
  | 'jussive-3fs'
  | 'imperfect-1sg'
  | 'imperative'
  | 'perfect';

// A prefixed form clusters every radical but the last, then takes its vowel.
const PREFIXED: Readonly<Record<string, readonly [prefix: string, vowel: string]>> = {
  'jussive-3ms': ['ya', 'u'],
  'jussive-3fs': ['ta', 'u'],
  'imperfect-1sg': ["'a", 'o'],
};

// A bare form carries a vowel after the first radical and one before the last.
const BARE: Readonly<Record<string, readonly [first: string, last: string]>> = {
  imperative: ['e', 'o'],
  perfect: ['a', 'a'],
};

function conjugate(root: string, form: VerbForm): string {
  const c = radicals(root);
  if (c.length < 3) {
    throw new Error(`no verb pattern below three radicals: ${root}`);
  }
  const last = c[c.length - 1] ?? '';
  const prefixed = PREFIXED[form];
  if (prefixed !== undefined) {
    const [prefix, vowel] = prefixed;
    return `${prefix}${c.slice(0, -1).join('')}${vowel}${last}`;
  }
  const bare = BARE[form];
  if (bare === undefined) throw new Error(`unknown verb form: ${form}`);
  const [first, second] = bare;
  return `${c[0] ?? ''}${first}${c.slice(1, -1).join('')}${second}${last}`;
}

// Eldritch rule 3: a becomes o and e becomes u. Radicals carry no a and no e,
// so the shift can only reach the pattern vowels.
function degrade(vocalized: string): string {
  return vocalized.replace(/a/gu, 'o').replace(/e/gu, 'u');
}

const EMPHATIC: Readonly<Record<string, string>> = { t: 'tt', s: 'ts', k: 'q' };

// Eldritch rules 1 and 2: the emphatic shift, then the fourth radical. sh is a
// single token, so rule 1 never splits it.
function eldritchRoot(root: string): string {
  const shifted = radicals(root).map((radical) => EMPHATIC[radical] ?? radical);
  return `${shifted.join('')}gh`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type PhoenicianKind = 'content' | 'idiom' | 'power' | 'dread';

export type PhoenicianRole =
  | 'intent'
  | 'target'
  | 'agent'
  | 'power'
  | 'modifier'
  | 'adverb'
  | 'litany'
  | 'idiom'
  | 'marker'
  | 'seal';

export interface PhoenicianWord {
  glyphs: string;
  spoken: string;
  kind: PhoenicianKind;
  role: PhoenicianRole;
  // Vocalized romanization for words the patterns derive, null for the listed
  // forms of 4.6, 4.7 and 4.10 whose spelling the spec fixes outright.
  vocalized: string | null;
  // Skeleton actually written, after the register's distortion.
  root: string | null;
  // Set on the first word of a clause joined to the previous one by w-.
  joined?: boolean;
}

function derived(
  vocalized: string,
  role: PhoenicianRole,
  root: string | null = null,
): PhoenicianWord {
  return {
    glyphs: glyphsFor(vocalized),
    spoken: speak(vocalized),
    kind: 'content',
    role,
    vocalized,
    root,
  };
}

function fixed(word: FixedWord, role: PhoenicianRole = 'idiom'): PhoenicianWord {
  return { glyphs: word.glyphs, spoken: word.spoken, kind: 'idiom', role, vocalized: null, root: null };
}

// An attested name is written letter for letter and never collapses, so its
// glyph string is data rather than a derivation (spec 4.7).
function nameWord(name: DivineName, role: PhoenicianRole, proclitic?: ProcliticId): PhoenicianWord {
  const head = proclitic === undefined ? '' : LETTER_MAP[proclitic] ?? '';
  const spoken = proclitic === undefined ? '' : PROCLITIC_SPOKEN[proclitic];
  return {
    glyphs: head + name.glyphs,
    spoken: spoken + name.spoken,
    kind: 'power',
    role,
    vocalized: null,
    root: null,
  };
}

// A dread epithet is indeclinable, and a proclitic is the only affix it takes
// (spec 4.10), so the proclitic joins its token list and may collapse into it.
function dreadWord(
  epithet: DreadEpithet,
  role: PhoenicianRole,
  proclitic?: ProcliticId,
): PhoenicianWord {
  const head = proclitic === undefined ? '' : proclitic;
  return {
    glyphs: glyphsFor(`${head}${head === '' ? '' : 'e'}${epithet.skeleton}`),
    spoken: (proclitic === undefined ? '' : PROCLITIC_SPOKEN[proclitic]) + epithet.spoken,
    kind: 'dread',
    role,
    vocalized: null,
    root: epithet.skeleton,
  };
}

interface StemOptions {
  eldritch: boolean;
  article?: boolean;
  plural?: boolean;
  proclitic?: ProcliticId;
}

function stemOf(root: string, eldritch: boolean, pattern: (skeleton: string) => string): string {
  const skeleton = eldritch ? eldritchRoot(root) : root;
  const vocalized = pattern(skeleton);
  return eldritch ? degrade(vocalized) : vocalized;
}

// The affix vowels of 4.4 are the only ones added, and the register never
// reaches them: they wrap an already degraded stem.
function affix(stem: string, options: StemOptions): string {
  const proclitic = options.proclitic === undefined ? '' : PROCLITIC_SPOKEN[options.proclitic];
  const article = options.article === true ? PROCLITIC_SPOKEN.h : '';
  const plural = options.plural === true ? PLURAL_SPOKEN : '';
  return `${proclitic}${article}${stem}${plural}`;
}

function nounWord(root: PhoenicianRoot, role: PhoenicianRole, options: StemOptions): PhoenicianWord {
  const skeleton = options.eldritch ? eldritchRoot(root.root) : root.root;
  const stem = stemOf(root.root, options.eldritch, citation);
  return derived(affix(stem, options), role, skeleton);
}

function verbWord(
  root: PhoenicianRoot,
  form: VerbForm,
  options: StemOptions,
): PhoenicianWord {
  const skeleton = options.eldritch ? eldritchRoot(root.root) : root.root;
  const stem = stemOf(root.root, options.eldritch, (s) => conjugate(s, form));
  return derived(affix(stem, options), 'intent', skeleton);
}

function requireField(field: SemanticField | null): SemanticField {
  if (field === null) throw new Error('gene is missing its semantic field');
  return field;
}

function geneField(clause: ClausePlan, role: 'INTENT' | 'TARGET' | 'AGENT'): SemanticField {
  return requireField(clause.genes.find((g) => g.role === role)?.field ?? null);
}

// The register writes quadriliterals, so it only draws triconsonantal roots:
// the fourth radical rule of 4.10 has nothing to add to a two radical root.
function poolOf(field: SemanticField, eldritch: boolean): PhoenicianRoot[] {
  const roots = FIELDS[field];
  return eldritch ? roots.filter((r) => radicals(r.root).length === 3) : [...roots];
}

function nounsOf(field: SemanticField, eldritch = false): PhoenicianRoot[] {
  return poolOf(field, eldritch).filter((r) => r.noun !== undefined);
}

function verbsOf(field: SemanticField, eldritch = false): PhoenicianRoot[] {
  return poolOf(field, eldritch).filter((r) => r.verb !== undefined);
}

// An intransitive root never fills a slot that takes a direct object or an
// 'yt phrase (spec 4.3).
function transitiveVerbsOf(field: SemanticField, eldritch = false): PhoenicianRoot[] {
  return verbsOf(field, eldritch).filter((r) => r.intransitive !== true);
}

function adjectivesOf(field: SemanticField, eldritch = false): PhoenicianRoot[] {
  return poolOf(field, eldritch).filter((r) => r.adj !== undefined);
}

function comeVerbsOf(eldritch: boolean): PhoenicianRoot[] {
  return poolOf('summoning', eldritch).filter((r) => INVOCATION_COME.includes(r.root));
}

interface Realization {
  words: PhoenicianWord[];
  gloss: string;
}

interface Modifier {
  adjective: PhoenicianRoot | null;
  adverb: PhoenicianRoot | null;
}

const NO_MODIFIER: Modifier = { adjective: null, adverb: null };

function drawModifier(clause: ClausePlan, rng: Rng, eldritch: boolean): Modifier {
  const field = clause.modifierField;
  if (clause.modifier === null || field === null) return NO_MODIFIER;
  if (clause.modifier === 'adjective') {
    return { adjective: pick(rng, adjectivesOf(field, eldritch)), adverb: null };
  }
  return { adjective: null, adverb: pick(rng, nounsOf(field, eldritch)) };
}

// The adverbial modifier is b- plus a noun, placed at clause end (spec 4.5).
function adverbPhrase(modifier: Modifier, eldritch: boolean): Realization {
  const root = modifier.adverb;
  if (root === null) return { words: [], gloss: '' };
  return {
    words: [nounWord(root, 'adverb', { eldritch, proclitic: 'b' })],
    gloss: ` In the ${root.noun ?? ''}.`,
  };
}

// An attributive adjective follows its noun, agrees in number and repeats the
// article when the noun is definite (spec 4.4).
function adjectiveWord(
  modifier: Modifier,
  eldritch: boolean,
  options: { article: boolean; plural: boolean },
): PhoenicianWord[] {
  const root = modifier.adjective;
  if (root === null) return [];
  return [
    nounWord(root, 'modifier', {
      eldritch,
      article: options.article,
      plural: options.plural,
    }),
  ];
}

function adjectiveGloss(modifier: Modifier): string {
  return modifier.adjective === null ? '' : `${modifier.adjective.adj ?? ''} `;
}

function chainLength(difficulty: number): number {
  if (difficulty >= 9) return 3;
  if (difficulty >= 8) return 2;
  return 1;
}

// The construct chain of 4.4: juxtaposed nouns mean "X of Y", and the head
// never carries the article. Divine names head the chain where the school puts
// an invoked power in subject position (4.4), coined nouns where it stacks
// epithets (4.5).
function genitiveChain(
  field: SemanticField,
  count: number,
  rng: Rng,
  eldritch: boolean,
  used: Set<string>,
): Realization {
  const words: PhoenicianWord[] = [];
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const root = pick(rng, nounsOf(field, eldritch).filter((r) => !used.has(r.root)));
    used.add(root.root);
    words.push(nounWord(root, 'agent', { eldritch, plural: true }));
    parts.push(` of the ${root.plural ?? ''}`);
  }
  return { words, gloss: parts.join('') };
}

function powerPool(plan: FormulaPlan): ReadonlyArray<DivineName> {
  return plan.school === 'curse' ? DARK_NAMES : BRIGHT_NAMES;
}

function realizeJussiveClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  used: Set<string>,
  consumed: { target: boolean; modifier: Modifier },
): Realization {
  const clauseUsed = new Set(used);
  const agent = pick(rng, powerPool(plan).filter((n) => !clauseUsed.has(n.skeleton)));
  clauseUsed.add(agent.skeleton);

  const agentField = plan.school === 'curse' ? 'harm' : geneField(clause, 'AGENT');
  const chain = genitiveChain(agentField, chainLength(plan.difficulty) - 1, rng, false, new Set());

  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const modifier = consumed.target ? consumed.modifier : drawModifier(clause, rng, false);

  const words: PhoenicianWord[] = [
    verbWord(intent, agent.feminine ? 'jussive-3fs' : 'jussive-3ms', { eldritch: false }),
    nameWord(agent, 'agent'),
    ...chain.words,
  ];

  let objectGloss = '';
  if (!consumed.target) {
    const targetField = geneField(clause, 'TARGET');
    const target = pick(rng, nounsOf(targetField));
    words.push(fixed(YT, 'marker'));
    words.push(nounWord(target, 'target', { eldritch: false, article: true }));
    words.push(...adjectiveWord(modifier, false, { article: true, plural: false }));
    objectGloss = ` the ${adjectiveGloss(modifier)}${target.noun ?? ''}`;
  }

  let power: DivineName | null = null;
  if (plan.school === 'protection') {
    power = pick(rng, powerPool(plan).filter((n) => !clauseUsed.has(n.skeleton)));
    clauseUsed.add(power.skeleton);
    words.push(nameWord(power, 'power'));
  }

  const adverb = adverbPhrase(modifier, false);
  words.push(...adverb.words);

  const vocative = power === null ? '' : ` ${power.name}!`;
  return {
    words,
    gloss: `May ${agent.name}${chain.gloss} ${intent.verb ?? ''}${objectGloss}.${vocative}${adverb.gloss}`,
  };
}

function realizeInvocationClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  used: Set<string>,
): Realization {
  const eldritch = plan.eldritch;
  const clauseUsed = new Set(used);
  const words: PhoenicianWord[] = [];
  const names: string[] = [];
  const agentGenes = clause.genes.filter((g) => g.role === 'AGENT');

  for (let i = 0; i < chainLength(plan.difficulty); i += 1) {
    if (eldritch) {
      const epithet = pick(rng, DREAD_POWER.filter((e) => !clauseUsed.has(e.skeleton)));
      clauseUsed.add(epithet.skeleton);
      words.push(dreadWord(epithet, 'agent'));
      names.push(epithet.gloss.replace(/^the /u, ''));
      continue;
    }
    const field = requireField(agentGenes[i]?.field ?? agentGenes[0]?.field ?? null);
    const root = pick(rng, nounsOf(field).filter((r) => !clauseUsed.has(r.root)));
    clauseUsed.add(root.root);
    words.push(nounWord(root, 'agent', { eldritch: false, plural: i > 0 }));
    names.push(i > 0 ? root.plural ?? '' : root.noun ?? '');
  }

  const intent = pick(rng, comeVerbsOf(eldritch));
  words.push(verbWord(intent, 'imperative', { eldritch }));

  let powerGloss: string;
  if (eldritch) {
    const epithet = pick(rng, DREAD_POWER.filter((e) => !clauseUsed.has(e.skeleton)));
    clauseUsed.add(epithet.skeleton);
    words.push(dreadWord(epithet, 'power'));
    powerGloss = capitalize(epithet.spoken);
  } else {
    const name = pick(rng, BRIGHT_NAMES.filter((n) => !clauseUsed.has(n.skeleton)));
    clauseUsed.add(name.skeleton);
    words.push(nameWord(name, 'power'));
    powerGloss = name.name;
  }

  const modifier = drawModifier(clause, rng, eldritch);
  const adverb = adverbPhrase(modifier, eldritch);
  words.push(...adverb.words);

  const head = names[0] ?? '';
  const epithets = names.slice(1).map((name) => ` of the ${name}`).join('');
  return {
    words,
    gloss: `O ${head}${epithets}, ${intent.verb ?? ''}! ${powerGloss}!${adverb.gloss}`,
  };
}

// PO2, the royal self presentation. The caster name is a coined warding root
// carrying the theophoric element, and a name drops its initial guttural in
// the spoken line (spec 4.6).
function selfPresentation(plan: FormulaPlan, rng: Rng, used: Set<string>): Realization {
  const words: PhoenicianWord[] = [fixed(PO2_HEAD)];
  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER.filter((e) => !used.has(e.skeleton)));
    used.add(epithet.skeleton);
    words.push(dreadWord(epithet, 'idiom', 'l'));
    return { words, gloss: `I belong to ${epithet.gloss}.` };
  }
  const root = pick(rng, nounsOf('warding'));
  // A name drops its word-initial guttural in the spoken line. The alf is
  // already silent, so only the ain of a gh-initial root has to go.
  const stem = speak(citation(root.root)).replace(/^gh/u, '');
  const spoken = `${stem}${THEOPHORIC_SPOKEN}`;
  words.push({
    glyphs: glyphsFor(`${citation(root.root)}${THEOPHORIC_SKELETON}`),
    spoken,
    kind: 'idiom',
    role: 'idiom',
    vocalized: null,
    root: null,
  });
  return { words, gloss: `I am ${capitalize(spoken)}.` };
}

function schoolOpener(
  plan: FormulaPlan,
  rng: Rng,
  used: Set<string>,
): Realization & { consumed: { target: boolean; modifier: Modifier } } {
  const clause = plan.clauses[0];
  if (clause === undefined) throw new Error('plan has no clause');

  // The register inverts the amulet opener: the incantation now speaks with
  // the demon's voice rather than against it (spec 4.10).
  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER.filter((e) => !used.has(e.skeleton)));
    used.add(epithet.skeleton);
    return {
      words: [fixed(PO1_HEAD), dreadWord(epithet, 'target', 'b')],
      gloss: `Incantation by ${epithet.gloss}.`,
      consumed: { target: false, modifier: NO_MODIFIER },
    };
  }

  if (plan.school === 'invocation') {
    const god = pick(rng, BRIGHT_NAMES);
    used.add(god.skeleton);
    return {
      words: [fixed(PO3_HEAD), nameWord(god, 'idiom', 'l')],
      gloss: `To the lord, to ${god.name}.`,
      consumed: { target: false, modifier: NO_MODIFIER },
    };
  }

  const targetField = geneField(clause, 'TARGET');
  const target = pick(rng, nounsOf(targetField));
  const modifier = drawModifier(clause, rng, false);
  const words: PhoenicianWord[] = [
    fixed(PO1_HEAD),
    nounWord(target, 'target', { eldritch: false, plural: true, proclitic: 'l' }),
    ...adjectiveWord(modifier, false, { article: false, plural: true }),
  ];
  return {
    words,
    gloss: `Incantation against the ${adjectiveGloss(modifier)}${target.plural ?? ''}.`,
    consumed: { target: true, modifier },
  };
}

// The shrinking word of tier 9 loses its final letter at each step. Only the
// full form has a listed spoken value, every truncation is a fresh skeleton
// and takes the citation vocalization of 4.3.
function shrinkSteps(skeleton: string, glyphs: string, spoken: string, eldritch: boolean): PhoenicianWord[] {
  const letters = Array.from(glyphs);
  const c = radicals(skeleton);
  const words: PhoenicianWord[] = [];
  for (let i = 0; i < letters.length; i += 1) {
    const kept = c.slice(0, c.length - i).join('');
    const truncated = citation(kept);
    words.push({
      glyphs: letters.slice(0, letters.length - i).join(''),
      spoken: i === 0 ? spoken : speak(eldritch ? degrade(truncated) : truncated),
      kind: 'idiom',
      role: 'litany',
      vocalized: null,
      root: kept,
    });
  }
  return words;
}

// A shrinking word needs at least three steps and a glyph per radical, so the
// pool keeps the names whose letters neither double nor exceed the citation
// patterns of 4.3.
function shrinkPool(plan: FormulaPlan): ReadonlyArray<{ skeleton: string; glyphs: string; spoken: string }> {
  if (plan.eldritch) {
    return DREAD_POWER.map((e) => ({
      skeleton: e.skeleton,
      glyphs: glyphsFor(e.skeleton),
      spoken: e.spoken,
    }));
  }
  return powerPool(plan)
    .filter((n) => radicals(n.skeleton).length === 3)
    // A name whose letters double, like ssm, writes more glyphs than it has
    // radicals, so its truncations would not line up letter for letter.
    .filter((n) => glyphsFor(n.skeleton).length === n.glyphs.length)
    .map((n) => ({ skeleton: n.skeleton, glyphs: n.glyphs, spoken: n.spoken }));
}

function litany(plan: FormulaPlan, rng: Rng): Realization | null {
  if (plan.powerWordStyle === 'none') return null;
  if (plan.powerWordStyle === 'triple') {
    if (plan.eldritch) {
      const epithet = pick(rng, DREAD_POWER);
      const word = dreadWord(epithet, 'litany');
      return {
        words: [word, word, word],
        gloss: `${capitalize(epithet.spoken)}, spoken three times.`,
      };
    }
    const name = pick(rng, powerPool(plan));
    const word = nameWord(name, 'litany');
    return { words: [word, word, word], gloss: `${name.name}, spoken three times.` };
  }
  const base = pick(rng, shrinkPool(plan));
  return {
    words: shrinkSteps(base.skeleton, base.glyphs, base.spoken, plan.eldritch),
    gloss: `${capitalize(base.spoken)}, shrinking to a single letter.`,
  };
}

// Spec 4.9: the school's closer from tier 5 to 8, that closer plus PC3 at
// tier 9, none below 5. The register's own closer already ends on the forever
// word, so it never stacks PC3 behind itself.
function closingIdioms(plan: FormulaPlan): Idiom[] {
  if (plan.eldritch) return [ELDRITCH_CLOSE];
  const own = plan.school === 'curse' ? PC2 : PC1;
  return plan.difficulty >= 9 ? [own, PC3] : [own];
}

function sealCountFor(plan: FormulaPlan, rng: Rng): SealCount {
  if (plan.eldritch) return 9;
  if (plan.difficulty === 7) return pick(rng, [3, 7] as const);
  if (plan.difficulty === 8) return pick(rng, [7, 9] as const);
  return pick(rng, [9, 12] as const);
}

function realizeTierOne(plan: FormulaPlan, rng: Rng): Realization {
  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER);
    return {
      words: [dreadWord(epithet, 'power')],
      gloss: `${capitalize(epithet.spoken)}, ${epithet.gloss}.`,
    };
  }
  const name = pick(rng, powerPool(plan));
  return { words: [nameWord(name, 'power')], gloss: name.gloss };
}

function realizeTierTwo(plan: FormulaPlan, rng: Rng): Realization {
  const clause = plan.clauses[0];
  if (clause === undefined) throw new Error('tier 2 plan has no clause');
  const eldritch = plan.eldritch;
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT'), eldritch));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET'), eldritch));

  return {
    words: [
      verbWord(intent, 'imperative', { eldritch }),
      nounWord(target, 'target', { eldritch }),
    ],
    gloss: `${capitalize(intent.verb ?? '')} the ${target.noun ?? ''}!`,
  };
}

// The and proclitic joins a clause to the one before it. A derived word is
// rebuilt from its vocalized form so the collapse rule still sees one word.
function joinWithW(word: PhoenicianWord): PhoenicianWord {
  const vocalized = word.vocalized === null ? null : `${PROCLITIC_SPOKEN.w}${word.vocalized}`;
  return {
    ...word,
    glyphs: vocalized === null ? `${LETTER_MAP.w ?? ''}${word.glyphs}` : glyphsFor(vocalized),
    spoken: `${PROCLITIC_SPOKEN.w}${word.spoken}`,
    vocalized,
    joined: true,
  };
}

function composePhoenician(plan: FormulaPlan, rng: Rng): Realization {
  if (plan.difficulty === 1) return realizeTierOne(plan, rng);
  if (plan.difficulty === 2) return realizeTierTwo(plan, rng);

  const words: PhoenicianWord[] = [];
  const glossParts: string[] = [];
  // Powers and epithets stay distinct inside one clause, and the opener's own
  // picks stay reserved across the whole formula.
  const used = new Set<string>();

  if (plan.difficulty >= 6) {
    const presentation = selfPresentation(plan, rng, used);
    words.push(...presentation.words);
    glossParts.push(presentation.gloss);
  }

  const opener = schoolOpener(plan, rng, used);
  words.push(...opener.words);
  glossParts.push(opener.gloss);

  const jussive = plan.school === 'protection' || plan.school === 'curse';
  plan.clauses.forEach((clause, index) => {
    const consumed =
      index === 0 ? opener.consumed : { target: false, modifier: NO_MODIFIER };
    const realized = jussive
      ? realizeJussiveClause(plan, clause, rng, used, consumed)
      : realizeInvocationClause(plan, clause, rng, used);
    // Spec 4.9: clauses after the first are joined by the w- proclitic, which
    // rides the first word of the clause with no separator between them.
    const first = realized.words[0];
    if (index > 0 && first !== undefined) {
      realized.words[0] = joinWithW(first);
    }
    words.push(...realized.words);
    glossParts.push(realized.gloss);
  });

  const repeated = litany(plan, rng);
  if (repeated !== null) {
    words.push(...repeated.words);
    glossParts.push(repeated.gloss);
  }

  if (plan.closing) {
    for (const idiom of closingIdioms(plan)) {
      for (const word of idiom.words) words.push(fixed(word));
      glossParts.push(idiom.gloss);
    }
  }

  if (plan.seal) {
    const count = sealCountFor(plan, rng);
    words.push(fixed(SEAL_HEAD, 'seal'));
    words.push({
      glyphs: NUMERAL_GLYPHS[count],
      spoken: NUMERAL_WORDS[count],
      kind: 'idiom',
      role: 'seal',
      vocalized: null,
      root: null,
    });
    glossParts.push(SEAL_GLOSS[count]);
  }

  return { words, gloss: glossParts.join(' ').replace(/\s+/gu, ' ').trim() };
}

function realizeFormula(plan: FormulaPlan, rng: Rng): FormulaOutput {
  const { words, gloss } = composePhoenician(plan, rng);
  // Continuous writing below tier 3, the word separator above (spec 4.2).
  const separator = plan.difficulty <= 2 ? '' : WORD_SEP;
  return {
    glyphs: words.map((word) => word.glyphs).join(separator),
    transliteration: words.map((word) => word.spoken).join(' '),
    gloss,
  };
}

export const phoenicianGenome: Genome = {
  id: 'phoenician',
  realize: realizeFormula,
};
