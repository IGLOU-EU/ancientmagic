// Ogham genome rules: tokenization, the one declension and the one
// conjugation, the Eldritch register and the realization of a clause plan into
// the three aligned output lines. Every rule implements docs/genomes.md
// section 10.
//
// Two things make this genome unlike the five before it, and both are
// material rather than grammatical. A formula is an object, framed feather to
// feather, and a formula of several clauses is several objects: from
// difficulty 6 each clause is a rod of its own, joined to the next by a
// closing feather cut against an opening one, with no conjunction word
// anywhere. And the word separator is U+1680, which is Unicode whitespace, so
// nothing here ever trims, splits on whitespace or matches \s: a word carries
// its glyphs beside its romanization from the moment it is built, and the two
// lines are assembled from the same list.
//
// The other rule this file exists to keep is the listed-data rule of 10.13.
// The greedy map welds coi into a forfid and ogmios into another, so every
// attested word, idiom and numeral arrives from ogham-data.ts already spelled
// in codepoints, and only drawn material is tokenized.
//
// No English lives here. The genome decides which root fills which role and
// hands those choices to the gloss pack of the displayed language, which
// writes the sentence.

import { chance, pick, type Rng } from '../generator/rng.js';
import type {
  ClausePlan,
  FormulaOutput,
  FormulaPlan,
  Genome,
  SemanticField,
} from '../generator/types.js';
import type { GlossRef } from '../glosses/types.js';
import type { OghamGlosses, OghamRepeat, OghamVox } from './ogham-glosses.js';
import {
  anchorPair,
  drawUnused,
  geneField,
  greedyTokens,
  pickModifier,
  requireField,
  sealGloss,
  shrinkingSteps,
  tierTwoClause,
  transitive,
  withForm,
} from './shared.js';
import {
  BRIGHT_POWER,
  DARK_POWER,
  DARK_SHRINKING_WORD,
  DIRECTION_WORDS,
  DREAD_POWER,
  FEATHER,
  FIELDS,
  FN_DO,
  FN_IN,
  FN_VRIT,
  IDIOM_WORDS,
  INVOCATION_COME,
  KENNING_VOX,
  LETTER_MAP,
  OC5_TAIL,
  PREFIX_CO,
  PREFIX_RO,
  REVERSED_FEATHER,
  ROD_JOINT,
  SEAL_HEAD,
  SEAL_NUMERALS,
  SPACE_MARK,
  glyphOf,
  type Listed,
  type OghamIdiomId,
  type OghamPower,
  type OghamRoot,
  type SealCount,
} from './ogham-data.js';

export { tokenizeOgham, lettersFor, nounForm, verbForm, adverbForm };

export type NounCase = 'nominative' | 'accusative' | 'genitive' | 'vocative';
type VerbForm = 'u' | 'it' | 'bare' | 'etu' | 'perfective';

// A word on both lines at once. Listed data arrives already shaped like this,
// which is what keeps the two assemblies from ever drifting apart.
interface Word {
  readonly spoken: string;
  readonly glyphs: string;
}

// The four cases of spec 10.4. The genitive is the attested row, the ending of
// the stones themselves, and the other three are reconstruction worn openly.
// Primitive Irish had a dative, more stem classes and full plurals, and no
// clause here takes one, so they are left unspecified rather than specified
// and unused.
const ENDINGS: Readonly<Record<NounCase, string>> = {
  nominative: 'as',
  accusative: 'an',
  genitive: 'i',
  vocative: 'e',
};

// Greedy longest match, which is what makes ng, st and the five diphthongs
// single letters. It serves drawn material alone (spec 10.13).
function tokenizeOgham(word: string): string[] {
  return greedyTokens(word, (token) => LETTER_MAP[token] !== undefined, 'ogham');
}

// No collapse rule: the stones double freely, MAQI and MAQQI standing side by
// side, so a written geminate is attested practice (spec 10.2).
function lettersFor(word: string): string {
  return tokenizeOgham(word).map(glyphOf).join('');
}

function drawn(spoken: string): Word {
  return { spoken, glyphs: lettersFor(spoken) };
}

function nounForm(stem: string, kase: NounCase): string {
  return `${stem}${ENDINGS[kase]}`;
}

// The perfective is ro fused in front and -us closed behind, one written word,
// and no other school draws either piece (spec 10.4).
function verbForm(stem: string, form: VerbForm): string {
  if (form === 'bare') return stem;
  if (form === 'perfective') return `${PREFIX_RO}${stem}us`;
  return `${stem}${form}`;
}

// co- fused to the front of the bare root, the shape Old Irish builds its
// adverbs with (spec 10.4).
function adverbForm(stem: string): string {
  return `${PREFIX_CO}${stem}`;
}

// The scholastic gate of spec 10.9: below tier 8 the pools behave as if the
// six roots carrying a forfid did not exist, which is what keeps the mason's
// twenty letters the whole alphabet of every low formula.
function reachable(roots: ReadonlyArray<OghamRoot>, difficulty: number): OghamRoot[] {
  return difficulty >= 8 ? [...roots] : roots.filter((root) => root.scholastic !== true);
}

function nounsOf(field: SemanticField, difficulty: number): OghamRoot[] {
  return withForm(reachable(FIELDS[field], difficulty), 'noun');
}

function verbsOf(field: SemanticField, difficulty: number): OghamRoot[] {
  return withForm(reachable(FIELDS[field], difficulty), 'verb');
}

// An intransitive root never fills a slot that takes an object (spec 10.3).
function transitiveVerbsOf(field: SemanticField, difficulty: number): OghamRoot[] {
  return transitive(verbsOf(field, difficulty));
}

interface ClauseRealization {
  words: Word[];
  gloss: string;
}

interface Modifier {
  adj: OghamRoot | null;
  adv: OghamRoot | null;
}

function drawModifier(clause: ClausePlan, rng: Rng, difficulty: number): Modifier {
  const { adjective, adverb } = pickModifier(
    clause,
    rng,
    (field) => withForm(reachable(FIELDS[field], difficulty), 'adj'),
    (field) => withForm(reachable(FIELDS[field], difficulty), 'adv'),
  );
  return { adj: adjective, adv: adverb };
}

// The attributive adjective follows its noun and copies its ending exactly.
// Every other genome in this document sets the adjective before the noun, and
// this one cannot: the family is noun-first and putting the adjective in front
// would falsify the one thing Celtic word order is known for (spec 10.4).
function adjectiveWords(mod: Modifier, kase: NounCase): Word[] {
  return mod.adj === null ? [] : [drawn(nounForm(mod.adj.root, kase))];
}

function adverbWords(mod: Modifier): Word[] {
  return mod.adv === null ? [] : [drawn(adverbForm(mod.adv.root))];
}

function modifierRoots(mod: Modifier): { adjectiveRoot: string | null; adverbRoot: string | null } {
  return { adjectiveRoot: mod.adj?.root ?? null, adverbRoot: mod.adv?.root ?? null };
}

// The names this school may speak: the bright eight, or the chthonic pair the
// curses call (spec 10.7).
function powerPool(plan: FormulaPlan): ReadonlyArray<OghamPower> {
  return plan.school === 'curse' ? DARK_POWER : BRIGHT_POWER;
}

interface VoxDraw {
  readonly vox: OghamVox;
  readonly words: ReadonlyArray<Word>;
}

// What a free POWER-WORD slot may draw. The adjacency rule of 10.9 takes the
// repetition word out of it, and at the scholastic tiers the kenning vox joins
// it in the four bright schools: the letter as a power, spoken by its name and
// glossed by its kenning, which is the most ogham thing this genome does.
function freeVoxPool(plan: FormulaPlan, settled: string | null): VoxDraw[] {
  const named: VoxDraw[] = powerPool(plan)
    .filter((entry) => entry.id !== settled)
    .map((entry) => ({ vox: { kind: 'power', id: entry.id }, words: [entry] }));
  if (plan.difficulty < 8 || plan.school === 'curse') return named;
  return [
    ...named,
    ...KENNING_VOX.map((letter) => ({
      vox: { kind: 'kenning', id: letter.id } as const,
      words: [letter],
    })),
  ];
}

// Protection: the votive order, the guard naming himself first as the
// dedicator and the dead of the stones do, and the deed landing last (10.5).
function realizeProtectionClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  glosses: OghamGlosses,
  settled: string | null,
): ClauseRealization {
  const difficulty = plan.difficulty;
  const agent = pick(rng, nounsOf('warding', difficulty));
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT'), difficulty));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET'), difficulty));
  const mod = drawModifier(clause, rng, difficulty);

  const words: Word[] = [
    drawn(nounForm(agent.root, 'nominative')),
    FN_VRIT,
    drawn(nounForm(target.root, 'accusative')),
    ...adjectiveWords(mod, 'accusative'),
    ...adverbWords(mod),
    drawn(verbForm(intent.root, 'u')),
  ];

  // At tiers 8 and 9 the free power word is subsumed by the repetition, so the
  // name is never written four times over (spec 10.13).
  const power = difficulty >= 8 ? null : pick(rng, freeVoxPool(plan, settled));
  if (power !== null) words.push(...power.words);

  return {
    words,
    gloss: glosses.protectionClause({
      agentRoot: agent.root,
      intentRoot: intent.root,
      targetRoot: target.root,
      ...modifierRoots(mod),
      powerWord: power?.vox ?? null,
    }),
  };
}

// Curse: the verb-first command the daughter language made canonical, spent on
// the jussive, with the modifier trailing the clause per the school override
// of spec 10.5.
function realizeCurseClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  glosses: OghamGlosses,
): ClauseRealization {
  const difficulty = plan.difficulty;
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET'), difficulty));
  const intent = pick(rng, transitiveVerbsOf('harm', difficulty));
  const mod = drawModifier(clause, rng, difficulty);

  return {
    words: [
      drawn(verbForm(intent.root, 'etu')),
      drawn(nounForm(target.root, 'accusative')),
      ...adjectiveWords(mod, 'accusative'),
      ...adverbWords(mod),
    ],
    gloss: glosses.curseClause({
      targetRoot: target.root,
      intentRoot: intent.root,
      ...modifierRoots(mod),
    }),
  };
}

// The two rules of the register, in order, applied to the INTENT verb and to
// nothing else: the bright vowel drowns, then the cut stutters. A final that
// is already double stays as it is (spec 10.10).
function darken(word: string): string {
  const drowned = word.replace(/i/gu, 'u');
  const last = drowned.slice(-1);
  return drowned.endsWith(`${last}${last}`) ? drowned : `${drowned}${last}`;
}

// Invocation: address, chain, demand. The chain of genitives hung off a
// vocative is the corpus's own syntax, X of Y of Z, four hundred times over,
// doing magic instead of genealogy (spec 10.5).
function realizeInvocationClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  used: Set<string>,
  glosses: OghamGlosses,
  settled: string | null,
): ClauseRealization {
  const difficulty = plan.difficulty;
  const eldritch = plan.eldritch;
  const words: Word[] = [];
  const agents: GlossRef[] = [];

  clause.genes
    .filter((gene) => gene.role === 'AGENT')
    .forEach((gene, index) => {
      if (eldritch) {
        // A dread epithet is indeclinable and takes no genitive: the chain of
        // 10.5 is suspended under the register (spec 10.10).
        const epithet = drawUnused(rng, DREAD_POWER, used, (entry) => entry.id);
        words.push(epithet);
        agents.push({ kind: 'epithet', id: epithet.id, spoken: epithet.spoken });
        return;
      }
      const root = drawUnused(
        rng,
        nounsOf(requireField(gene.field), difficulty),
        used,
        (entry) => entry.root,
      );
      words.push(drawn(nounForm(root.root, index === 0 ? 'vocative' : 'genitive')));
      agents.push({ kind: 'root', id: root.root });
    });

  const intent = pick(
    rng,
    FIELDS.summoning.filter((root) => INVOCATION_COME.includes(root.root)),
  );
  const mod = drawModifier(clause, rng, difficulty);
  const imperative = verbForm(intent.root, 'bare');
  words.push(...adverbWords(mod), drawn(eldritch ? darken(imperative) : imperative));

  let vox: OghamVox;
  if (eldritch) {
    const epithet = drawUnused(
      rng,
      DREAD_POWER.filter((entry) => entry.id !== settled),
      used,
      (entry) => entry.id,
    );
    words.push(epithet);
    vox = { kind: 'epithet', id: epithet.id };
  } else {
    const power = pick(rng, freeVoxPool(plan, settled));
    words.push(...power.words);
    vox = power.vox;
  }

  return {
    words,
    gloss: glosses.invocationClause({
      agents,
      intentRoot: intent.root,
      adverbRoot: mod.adv?.root ?? null,
      powerWord: vox,
      eldritch,
    }),
  };
}

// Divination: the question keeps the family's verb-first voice behind the
// particle in, and the answer keeps the votive order, which is what an answer
// should sound like next to a question (spec 10.11).
function realizeDivinationClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  glosses: OghamGlosses,
): ClauseRealization {
  const difficulty = plan.difficulty;
  const agent = pick(rng, nounsOf(geneField(clause, 'AGENT'), difficulty));
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT'), difficulty));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET'), difficulty));
  const mod = drawModifier(clause, rng, difficulty);

  const parts = {
    agentRoot: agent.root,
    intentRoot: intent.root,
    targetRoot: target.root,
    ...modifierRoots(mod),
  };

  if (clause.kind === 'seeing') {
    return {
      words: [
        drawn(nounForm(agent.root, 'nominative')),
        drawn(nounForm(target.root, 'accusative')),
        ...adjectiveWords(mod, 'accusative'),
        ...adverbWords(mod),
        drawn(verbForm(intent.root, 'u')),
      ],
      gloss: glosses.divinationSee(parts),
    };
  }

  return {
    words: [
      FN_IN,
      drawn(verbForm(intent.root, 'it')),
      ...adverbWords(mod),
      drawn(nounForm(agent.root, 'nominative')),
      drawn(nounForm(target.root, 'accusative')),
      ...adjectiveWords(mod, 'accusative'),
    ],
    gloss: glosses.divinationAsk(parts),
  };
}

// Chronomancy: the command first with its direction immediately behind it,
// then the deed stated after its object in the perfective, the one form no
// other school draws (spec 10.12).
function realizeChronomancyClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  glosses: OghamGlosses,
): ClauseRealization {
  const difficulty = plan.difficulty;
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT'), difficulty));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET'), difficulty));
  const mod = drawModifier(clause, rng, difficulty);
  const parts = {
    intentRoot: intent.root,
    targetRoot: target.root,
    ...modifierRoots(mod),
  };

  if (clause.kind === 'binding') {
    return {
      words: [
        drawn(nounForm(target.root, 'accusative')),
        ...adjectiveWords(mod, 'accusative'),
        ...adverbWords(mod),
        drawn(verbForm(intent.root, 'perfective')),
      ],
      gloss: glosses.chronomancyBind(parts),
    };
  }

  const direction = clause.direction;
  if (direction === null) throw new Error('a crossing clause carries no direction');
  return {
    words: [
      drawn(verbForm(intent.root, 'bare')),
      DIRECTION_WORDS[direction],
      ...adverbWords(mod),
      drawn(nounForm(target.root, 'accusative')),
      ...adjectiveWords(mod, 'accusative'),
    ],
    gloss: glosses.chronomancyCross({ ...parts, direction }),
  };
}

// OC5, the return anchor and this genome's one idiom with an argument: a time
// noun in the accusative governed by do, with a second time noun in the
// genitive behind it at tier 9, drawn without replacement, and the frozen
// tanac last of all, carrying neither ro nor -us (spec 10.6).
function returnAnchor(plan: FormulaPlan, rng: Rng, glosses: OghamGlosses): ClauseRealization {
  const { anchor, genitive } = anchorPair(plan, rng, nounsOf('time', plan.difficulty));
  const words: Word[] = [FN_DO, drawn(nounForm(anchor.root, 'accusative'))];
  if (genitive !== null) words.push(drawn(nounForm(genitive.root, 'genitive')));
  words.push(OC5_TAIL);
  return { words, gloss: glosses.returnAnchor(anchor.root, genitive?.root ?? null) };
}

const SCHOOL_OPENER: Readonly<Record<string, OghamIdiomId>> = {
  protection: 'OO1',
  curse: 'OO4',
  invocation: 'OO2',
  divination: 'OO5',
  chronomancy: 'OO6',
};

function pickOpenings(plan: FormulaPlan): OghamIdiomId[] {
  // Under the register the reversed row is the whole opening: no school opener
  // of 10.6 ever appears beside it (spec 10.10).
  if (plan.eldritch) {
    return [plan.difficulty < 6 ? 'ELDRITCH_OPEN_SHORT' : 'ELDRITCH_OPEN_FULL'];
  }
  const own = SCHOOL_OPENER[plan.school] ?? 'OO1';
  // The row stands in front of the school's own opener at the top tiers, short
  // at seven and entire above it (spec 10.9).
  if (plan.difficulty === 7) return ['OO3_SHORT', own];
  if (plan.difficulty >= 8) return ['OO3_FULL', own];
  return [own];
}

function pickClosings(plan: FormulaPlan, rng: Rng): OghamIdiomId[] {
  if (plan.eldritch) return ['ELDRITCH_CLOSE'];
  const stack: OghamIdiomId[] = [];
  if (plan.school === 'divination') stack.push('OC4');
  else if (plan.school !== 'chronomancy') {
    // OC2 is an alternative to OC1 at tiers 5 and 6, decided by a seeded draw
    // (spec 10.9).
    stack.push(plan.difficulty <= 6 && chance(rng, 0.5) ? 'OC2' : 'OC1');
  }
  if (plan.difficulty >= 8) stack.push('OC3');
  return stack;
}

// The tally triangle of tier 9: one letter goes at each step, down to the last
// one, and both lines are cut from the same letter list rather than from a
// re-parsed romanization (spec 10.9).
function tally(letters: ReadonlyArray<string>): Word[] {
  return shrinkingSteps(letters, 'back').map((spoken, index) => ({
    spoken,
    glyphs: letters
      .slice(0, letters.length - index)
      .map(glyphOf)
      .join(''),
  }));
}

// The repeated segment of tiers 8 and 9, settled before any clause draws so
// that the clauses can avoid its word (spec 10.9). Three cases and no fourth:
// the four bright schools cut down the birch warning, Curse cuts down the
// queen it calls, and the register cuts down the epithet its repetition drew.
interface Repetition {
  readonly words: ReadonlyArray<Word>;
  readonly gloss: string;
  // The name a free power word must then avoid. The birch is an idiom rather
  // than a name, so the triangle of the bright four settles nothing.
  readonly word: string | null;
}

function settleRepetition(
  plan: FormulaPlan,
  rng: Rng,
  glosses: OghamGlosses,
): Repetition | null {
  if (plan.powerWordStyle === 'none') return null;
  const triple = plan.powerWordStyle === 'triple';

  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER);
    const named: OghamRepeat = { kind: 'epithet', id: epithet.id };
    return {
      words: triple ? [epithet, epithet, epithet] : tally(epithet.letters),
      gloss: triple ? glosses.litanyTriple(named) : glosses.litanyShrink(named),
      word: epithet.id,
    };
  }

  if (triple) {
    const power = pick(rng, powerPool(plan));
    return {
      words: [power, power, power],
      gloss: glosses.litanyTriple({ kind: 'power', id: power.id }),
      word: power.id,
    };
  }

  if (plan.school === 'curse') {
    const power = powerPool(plan).find((entry) => entry.id === DARK_SHRINKING_WORD);
    if (power === undefined) {
      throw new Error(`the triangle word ${DARK_SHRINKING_WORD} is outside its own pool`);
    }
    return {
      words: tally(power.letters),
      gloss: glosses.litanyShrink({ kind: 'power', id: power.id }),
      word: power.id,
    };
  }

  const birch = IDIOM_WORDS.OO1[0];
  if (birch === undefined) throw new Error('the birch warning is missing from the idioms');
  return {
    words: tally(birch.letters),
    gloss: glosses.litanyShrink({ kind: 'birch' }),
    word: null,
  };
}

function sealCountFor(plan: FormulaPlan, rng: Rng): SealCount {
  if (plan.eldritch) return 9;
  // The ninth wave is where the otherworld begins, so the crossing school
  // seals on it and reaches past it only at the top tier (spec 10.12).
  if (plan.school === 'chronomancy') return plan.difficulty === 9 ? pick(rng, [9, 27] as const) : 9;
  if (plan.difficulty === 9) return pick(rng, [9, 27] as const);
  // Dalán cut four rods, and the school seals on its own founding scene.
  if (plan.school === 'divination') {
    return plan.difficulty === 7 ? 4 : pick(rng, [7, 9] as const);
  }
  if (plan.difficulty === 7) return pick(rng, [3, 5, 7] as const);
  return pick(rng, [7, 9] as const);
}

function sealWords(count: SealCount): Word[] {
  return [SEAL_HEAD, ...SEAL_NUMERALS[count]];
}

// Difficulty 1 and 2 write continuous, the stones' own habit: no space mark
// anywhere, so the whole formula is one uninterrupted stem between its
// feathers (spec 10.2).
function frame(rods: ReadonlyArray<ReadonlyArray<Word>>, separator: string): string {
  const cut = rods.map((rod) => rod.map((word) => word.glyphs).join(separator));
  return `${FEATHER}${cut.join(ROD_JOINT)}${REVERSED_FEATHER}`;
}

function speak(rods: ReadonlyArray<ReadonlyArray<Word>>): string {
  return rods.flat().map((word) => word.spoken).join(' ');
}

function realizeTierOne(plan: FormulaPlan, rng: Rng, glosses: OghamGlosses): FormulaOutput {
  const entry: Listed & { id: string } = plan.eldritch
    ? pick(rng, DREAD_POWER)
    : pick(rng, powerPool(plan));
  const vox: OghamVox = plan.eldritch
    ? { kind: 'epithet', id: entry.id }
    : { kind: 'power', id: entry.id };
  return {
    glyphs: frame([[entry]], ''),
    transliteration: entry.spoken,
    gloss: glosses.tierOne(vox),
  };
}

function realizeTierTwo(plan: FormulaPlan, rng: Rng, glosses: OghamGlosses): FormulaOutput {
  const clause = tierTwoClause(plan);
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT'), plan.difficulty));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET'), plan.difficulty));
  const imperative = verbForm(intent.root, 'bare');
  const words = [
    drawn(plan.eldritch ? darken(imperative) : imperative),
    drawn(nounForm(target.root, 'accusative')),
  ];
  return {
    glyphs: frame([words], ''),
    transliteration: speak([words]),
    gloss: glosses.tierTwo(intent.root, target.root),
  };
}

// From tier 6 every clause is a rod of its own. The openers ride the first rod
// before its clause, and below tier 8 the closer and the seal ride the last
// clause's rod. From tier 8 the repetition, the stacked closers and the seal
// share a final rod of their own, which is the shape a ritual ending wants
// (spec 10.9).
function buildRods(
  plan: FormulaPlan,
  openers: ReadonlyArray<Word>,
  clauses: ReadonlyArray<ReadonlyArray<Word>>,
  tail: ReadonlyArray<Word>,
  repeated: ReadonlyArray<Word>,
): Word[][] {
  const [first = [], ...rest] = clauses;
  if (plan.difficulty < 6) return [[...openers, ...first, ...tail]];
  if (plan.difficulty < 8) {
    const [second = []] = rest;
    return [[...openers, ...first], [...second, ...tail]];
  }
  return [[...openers, ...first], ...rest.map((clause) => [...clause]), [...repeated, ...tail]];
}

function realizeFormula(plan: FormulaPlan, rng: Rng, glosses: OghamGlosses): FormulaOutput {
  if (plan.difficulty === 1) return realizeTierOne(plan, rng, glosses);
  if (plan.difficulty === 2) return realizeTierTwo(plan, rng, glosses);

  const glossParts: string[] = [];

  // Settled before anything is drawn for a clause, which is the whole of the
  // adjacency rule: what the clauses may not spend has to be known first.
  const repeated = settleRepetition(plan, rng, glosses);
  const settled = repeated?.word ?? null;

  const openers: Word[] = [];
  for (const id of pickOpenings(plan)) {
    openers.push(...IDIOM_WORDS[id]);
    glossParts.push(glosses.idiom(id));
  }

  const clauses: Word[][] = [];
  for (const clause of plan.clauses) {
    // Epithets and agents stay distinct within one clause. Across clauses the
    // pools reopen.
    const used = new Set<string>();
    let realized: ClauseRealization;
    if (plan.school === 'protection') {
      realized = realizeProtectionClause(plan, clause, rng, glosses, settled);
    } else if (plan.school === 'curse') {
      realized = realizeCurseClause(plan, clause, rng, glosses);
    } else if (plan.school === 'divination') {
      realized = realizeDivinationClause(plan, clause, rng, glosses);
    } else if (plan.school === 'chronomancy') {
      realized = realizeChronomancyClause(plan, clause, rng, glosses);
    } else {
      realized = realizeInvocationClause(plan, clause, rng, used, glosses, settled);
    }
    clauses.push(realized.words);
    glossParts.push(realized.gloss);
  }

  if (repeated !== null) glossParts.push(repeated.gloss);

  const tail: Word[] = [];
  if (plan.closing) {
    // The Chronomancy closer takes an argument, so it is built rather than
    // listed, and whatever stacks behind it follows.
    if (plan.school === 'chronomancy' && !plan.eldritch) {
      const anchor = returnAnchor(plan, rng, glosses);
      tail.push(...anchor.words);
      glossParts.push(anchor.gloss);
    }
    for (const id of pickClosings(plan, rng)) {
      tail.push(...IDIOM_WORDS[id]);
      glossParts.push(glosses.idiom(id));
    }
  }

  if (plan.seal) {
    // The instruction to the cutter, at the absolute end of the formula,
    // inside the final rod (spec 10.8).
    const count = sealCountFor(plan, rng);
    tail.push(...sealWords(count));
    glossParts.push(sealGloss(plan, count, glosses));
  }

  const rods = buildRods(plan, openers, clauses, tail, repeated?.words ?? []);
  return {
    glyphs: frame(rods, SPACE_MARK),
    transliteration: speak(rods),
    gloss: glosses.sentences(glossParts),
  };
}

export const oghamGenome: Genome<OghamGlosses> = {
  id: 'ogham',
  // U+1680 alone. It is Unicode whitespace and therefore already a line-break
  // opportunity, so the hint mechanism has nothing to add here, and the
  // declaration costs nothing (spec 10.2).
  separators: [SPACE_MARK],
  realize: realizeFormula,
};
