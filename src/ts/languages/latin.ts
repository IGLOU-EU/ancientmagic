// Latin genome rules: tokenization, the regular half of the declension and the
// conjugation, the Eldritch register and the realization of a clause plan into
// the three aligned output lines. Every rule implements docs/genomes.md
// section 9.
//
// Latin marks roles by ending, so this genome spends its word order on telling
// the schools apart: seven clause orders, one per school and one per clause
// kind of the two that have kinds.
//
// The one signature move of this genome is that it has none. Every other
// script transforms something on the way to the glyphs, and here the reading
// line splits one letter V into the two sounds it writes and nothing else
// moves, because the audience can read what is written and a distorted word
// would read as an error rather than as magic.
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
import type { LatinGlosses } from './latin-glosses.js';
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
  DIRECTION_WORDS,
  DREAD_POWER,
  ENCLITIC_NE,
  FIELDS,
  FN_AD,
  FN_CONTRA,
  FN_ET,
  IDIOM_WORDS,
  INVOCATION_COME,
  LC5_TAIL,
  LETTER_MAP,
  SEAL_GLYPHS,
  SEAL_TAIL,
  SEAL_WORDS,
  SHRINKING_WORD,
  WORD_SEP,
  type LatinIdiomId,
  type LatinPower,
  type LatinRoot,
  type NounClass,
  type SealCount,
} from './latin-data.js';

export { tokenizeLatin, lettersFor, nounForm, verbForm, adverbForm };

export type NounCase = 'nominative' | 'accusative' | 'genitive' | 'vocative';
type VerbForm = 'o' | 'at' | 'a' | 'ato' | 'avi';

// The four cases this genome reaches, in the three classes of spec 9.4. Latin
// has a dative, an ablative and full plurals, and no clause here takes one, so
// they are left unspecified rather than specified and unused.
const ENDINGS: Readonly<Record<NounClass, Readonly<Record<NounCase, string>>>> = {
  a: { nominative: 'a', accusative: 'am', genitive: 'ae', vocative: 'a' },
  us: { nominative: 'us', accusative: 'um', genitive: 'i', vocative: 'e' },
  um: { nominative: 'um', accusative: 'um', genitive: 'i', vocative: 'um' },
};

// Every token is a single letter, so the greedy rule has nothing to parse
// here: two characters are tried and none is ever known.
function tokenizeLatin(word: string): string[] {
  return greedyTokens(word, (token) => LETTER_MAP[token] !== undefined, 'latin');
}

// No collapse rule: classical practice writes its geminates, so FLAMMAM keeps
// two Ms and VALLVM two Ls (spec 9.2).
function lettersFor(word: string): string {
  return tokenizeLatin(word)
    .map((token) => LETTER_MAP[token] ?? '')
    .join('');
}

function nounForm(stem: string, nounClass: NounClass, kase: NounCase): string {
  // GENI and NVNTI: a stem ending in i in the -us class is its own vocative,
  // because that is the form Latin actually has and GENIE is not (spec 9.4).
  if (nounClass === 'us' && kase === 'vocative' && stem.endsWith('i')) return stem;
  return `${stem}${ENDINGS[nounClass][kase]}`;
}

function verbForm(stem: string, form: VerbForm): string {
  return `${stem}${form}`;
}

function adverbForm(stem: string): string {
  return `${stem}e`;
}

// The class a root declines in, which spec 9.3 reads off its citation form. A
// root drawn as a noun always carries one, so a gap is a hole in the data.
function classOf(root: LatinRoot): NounClass {
  if (root.nounClass === undefined) {
    throw new Error(`root ${root.root} heads a noun without a declension`);
  }
  return root.nounClass;
}

function declined(root: LatinRoot, kase: NounCase): string {
  return nounForm(root.root, classOf(root), kase);
}

function nounsOf(field: SemanticField): LatinRoot[] {
  return withForm(FIELDS[field], 'noun');
}

function verbsOf(field: SemanticField): LatinRoot[] {
  return withForm(FIELDS[field], 'verb');
}

// An intransitive root never fills a slot that takes an object (spec 9.3).
function transitiveVerbsOf(field: SemanticField): LatinRoot[] {
  return transitive(verbsOf(field));
}

function adjectivesOf(field: SemanticField): LatinRoot[] {
  return withForm(FIELDS[field], 'adj');
}

function adverbsOf(field: SemanticField): LatinRoot[] {
  return withForm(FIELDS[field], 'adv');
}

interface ClauseRealization {
  words: string[];
  gloss: string;
}

interface Modifier {
  adj: LatinRoot | null;
  adv: LatinRoot | null;
}

function drawModifier(clause: ClausePlan, rng: Rng): Modifier {
  const { adjective, adverb } = pickModifier(clause, rng, adjectivesOf, adverbsOf);
  return { adj: adjective, adv: adverb };
}

// An attributive adjective agrees with the noun that follows it in case and in
// class, which is real Latin agreement and not a copying rule (spec 9.4).
function adjectiveWords(mod: Modifier, head: LatinRoot, kase: NounCase): string[] {
  return mod.adj === null ? [] : [nounForm(mod.adj.root, classOf(head), kase)];
}

function adverbWords(mod: Modifier): string[] {
  return mod.adv === null ? [] : [adverbForm(mod.adv.root)];
}

function modifierRoots(mod: Modifier): { adjectiveRoot: string | null; adverbRoot: string | null } {
  return { adjectiveRoot: mod.adj?.root ?? null, adverbRoot: mod.adv?.root ?? null };
}

// Protection: the votive shape, the dedicator naming himself first and the
// verb landing last, with the threat behind CONTRA in the accusative (9.5).
function realizeProtectionClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: LatinGlosses,
): ClauseRealization {
  const agent = pick(rng, nounsOf('warding'));
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const mod = drawModifier(clause, rng);

  const words = [
    declined(agent, 'nominative'),
    FN_CONTRA,
    ...adjectiveWords(mod, target, 'accusative'),
    declined(target, 'accusative'),
    ...adverbWords(mod),
    verbForm(intent.root, 'o'),
  ];

  // At tiers 8 and 9 the free power word is subsumed by the repetition, so it
  // is never written four times over (spec 9.13).
  const power = plan.difficulty >= 8 ? null : pick(rng, powerPool(plan));
  if (power !== null) words.push(...power.words);

  return {
    words,
    gloss: glosses.protectionClause({
      agentRoot: agent.root,
      intentRoot: intent.root,
      targetRoot: target.root,
      ...modifierRoots(mod),
      powerWord: power?.id ?? null,
      joined,
    }),
  };
}

// Curse: the tablets name the victim first and the law pronounces the sentence
// on him, so the adverb trails the whole clause (spec 9.5).
function realizeCurseClause(
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: LatinGlosses,
): ClauseRealization {
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const intent = pick(rng, transitiveVerbsOf('harm'));
  const mod = drawModifier(clause, rng);

  const words = [
    ...adjectiveWords(mod, target, 'accusative'),
    declined(target, 'accusative'),
    verbForm(intent.root, 'ato'),
    ...adverbWords(mod),
  ];

  return {
    words,
    gloss: glosses.curseClause({
      targetRoot: target.root,
      intentRoot: intent.root,
      ...modifierRoots(mod),
      joined,
    }),
  };
}

// Invocation: Cato's prayer discipline, address then titles then demand (9.5).
// The vocative heads the chain and every epithet behind it is a genitive.
function realizeInvocationClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  used: Set<string>,
  joined: boolean,
  glosses: LatinGlosses,
): ClauseRealization {
  const eldritch = plan.eldritch;
  const words: string[] = [];
  const agents: GlossRef[] = [];

  clause.genes
    .filter((g) => g.role === 'AGENT')
    .forEach((gene, index) => {
      if (eldritch) {
        const epithet = drawUnused(rng, DREAD_POWER, used, (word) => word);
        // A dread epithet is indeclinable and appears only in its listed form.
        words.push(epithet);
        agents.push({ kind: 'epithet', id: epithet, spoken: epithet });
        return;
      }
      const root = drawUnused(rng, nounsOf(requireField(gene.field)), used, (r) => r.root);
      words.push(declined(root, index === 0 ? 'vocative' : 'genitive'));
      agents.push({ kind: 'root', id: root.root });
    });

  const intent = pick(rng, FIELDS.summoning.filter((r) => INVOCATION_COME.includes(r.root)));
  const mod = drawModifier(clause, rng);
  words.push(...adverbWords(mod), verbForm(intent.root, 'a'));

  // Under the register the summons stays perfect Latin and what answers does
  // not: the verb is untouched and the names are the whole of the dread.
  let powerId: string;
  if (eldritch) {
    powerId = drawUnused(rng, DREAD_POWER, used, (word) => word);
    words.push(powerId);
  } else {
    const power = pick(rng, powerPool(plan));
    powerId = power.id;
    words.push(...power.words);
  }

  return {
    words,
    gloss: glosses.invocationClause({
      agents,
      intentRoot: intent.root,
      adverbRoot: mod.adv?.root ?? null,
      powerWord: powerId,
      eldritch,
      joined,
    }),
  };
}

// Divination: the enclitic question fronts its emphatic word and Latin makes
// that word the verb, so nothing may precede it and the adverb follows it. The
// answer is the verb-final statement (spec 9.11).
function realizeDivinationClause(
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: LatinGlosses,
): ClauseRealization {
  const agent = pick(rng, nounsOf(geneField(clause, 'AGENT')));
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const mod = drawModifier(clause, rng);

  const parts = {
    agentRoot: agent.root,
    intentRoot: intent.root,
    targetRoot: target.root,
    ...modifierRoots(mod),
    joined,
  };

  if (clause.kind === 'seeing') {
    return {
      words: [
        declined(agent, 'nominative'),
        ...adjectiveWords(mod, target, 'accusative'),
        declined(target, 'accusative'),
        ...adverbWords(mod),
        verbForm(intent.root, 'o'),
      ],
      gloss: glosses.divinationSee(parts),
    };
  }

  return {
    words: [
      // The enclitic hangs on the asking clause's verb and on nothing else,
      // which is what makes that verb the first word (spec 9.4).
      `${verbForm(intent.root, 'at')}${ENCLITIC_NE}`,
      ...adverbWords(mod),
      declined(agent, 'nominative'),
      ...adjectiveWords(mod, target, 'accusative'),
      declined(target, 'accusative'),
    ],
    gloss: glosses.divinationAsk(parts),
  };
}

// Chronomancy: the command first with its direction behind it, then the deed
// stated as done, which is the perfect and needs no pronoun (spec 9.12).
function realizeChronomancyClause(
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: LatinGlosses,
): ClauseRealization {
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const mod = drawModifier(clause, rng);
  const parts = {
    intentRoot: intent.root,
    targetRoot: target.root,
    ...modifierRoots(mod),
    joined,
  };

  if (clause.kind === 'binding') {
    return {
      words: [
        ...adjectiveWords(mod, target, 'accusative'),
        declined(target, 'accusative'),
        ...adverbWords(mod),
        verbForm(intent.root, 'avi'),
      ],
      gloss: glosses.chronomancyBind(parts),
    };
  }

  const direction = clause.direction;
  if (direction === null) throw new Error('a crossing clause carries no direction');
  return {
    words: [
      verbForm(intent.root, 'a'),
      DIRECTION_WORDS[direction],
      ...adverbWords(mod),
      ...adjectiveWords(mod, target, 'accusative'),
      declined(target, 'accusative'),
    ],
    gloss: glosses.chronomancyCross({ ...parts, direction }),
  };
}

// LC5, the return anchor and this genome's one idiom with an argument: a time
// noun in the accusative governed by AD, with a second time noun in the
// genitive behind it at tier 9, drawn without replacement (spec 9.6).
function returnAnchor(plan: FormulaPlan, rng: Rng, glosses: LatinGlosses): ClauseRealization {
  const { anchor, genitive } = anchorPair(plan, rng, nounsOf('time'));
  const words = [FN_AD, declined(anchor, 'accusative')];
  if (genitive !== null) words.push(declined(genitive, 'genitive'));
  words.push(LC5_TAIL);
  return { words, gloss: glosses.returnAnchor(anchor.root, genitive?.root ?? null) };
}

const SCHOOL_OPENER: Readonly<Record<string, LatinIdiomId>> = {
  protection: 'LO1',
  curse: 'LO4',
  invocation: 'LO2',
  divination: 'LO5',
  chronomancy: 'LO6',
};

function pickOpenings(plan: FormulaPlan): LatinIdiomId[] {
  if (plan.eldritch) {
    return [plan.difficulty < 6 ? 'ELDRITCH_OPEN_SHORT' : 'ELDRITCH_OPEN_FULL'];
  }
  const own = SCHOOL_OPENER[plan.school] ?? 'LO1';
  // The square stands in front of the school's own opener at the top tiers,
  // short at seven and entire above it (spec 9.9).
  if (plan.difficulty === 7) return ['LO3_SHORT', own];
  if (plan.difficulty >= 8) return ['LO3_FULL', own];
  return [own];
}

function pickClosings(plan: FormulaPlan, rng: Rng): LatinIdiomId[] {
  if (plan.eldritch) return ['ELDRITCH_CLOSE'];
  const stack: LatinIdiomId[] = [];
  if (plan.school === 'divination') stack.push('LC4');
  else if (plan.school !== 'chronomancy') {
    // LC2 is an alternative to LC1 at tiers 5 and 6, decided by a seeded draw
    // (spec 9.9).
    stack.push(plan.difficulty <= 6 && chance(rng, 0.5) ? 'LC2' : 'LC1');
  }
  if (plan.difficulty >= 8) stack.push('LC3');
  return stack;
}

// The bright names, or the chthonic pair the tablets consign their targets to
// (spec 9.7). Whole as it stands here it is the free power word of a school
// clause, which is the one slot a chant may fill.
function powerPool(plan: FormulaPlan): ReadonlyArray<LatinPower> {
  return plan.school === 'curse' ? DARK_POWER : BRIGHT_POWER;
}

function litany(plan: FormulaPlan, rng: Rng, glosses: LatinGlosses): ClauseRealization | null {
  if (plan.powerWordStyle === 'none') return null;
  // The register transforms nothing and speaks only listed forms, so it has no
  // shrinking device of its own: a shrunk epithet would be a shape neither a
  // dictionary nor spec 9.10 could account for, and abracadabra is banned
  // under the register with the rest of 9.7. It speaks a listed epithet three
  // times at both top tiers.
  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER);
    return {
      words: [epithet, epithet, epithet],
      gloss: glosses.litanyTriple(epithet, true),
    };
  }
  if (plan.powerWordStyle === 'triple') {
    const power = pick(rng, powerPool(plan).filter((entry) => entry.chant !== true));
    return {
      words: [...power.words, ...power.words, ...power.words],
      gloss: glosses.litanyTriple(power.id, false),
    };
  }
  // The tier 9 sequence is abracadabra and no other word, losing its final
  // letter at each of its eleven steps (spec 9.9).
  return {
    words: shrinkingSteps(tokenizeLatin(SHRINKING_WORD), 'back'),
    gloss: glosses.litanyShrink(SHRINKING_WORD),
  };
}

function sealCountFor(plan: FormulaPlan, rng: Rng): SealCount {
  if (plan.eldritch) return 9;
  if (plan.difficulty === 9) return pick(rng, [12, 27] as const);
  if (plan.school === 'divination' && plan.difficulty === 7) return 3;
  if (plan.school === 'chronomancy') return 12;
  if (plan.difficulty === 7) return pick(rng, [3, 7] as const);
  return pick(rng, [7, 9] as const);
}

// Tier 1 writes no separator, so only a row that is one word can be whispered
// (spec 9.9).
function realizeTierOne(plan: FormulaPlan, rng: Rng, glosses: LatinGlosses): FormulaOutput {
  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER);
    return {
      glyphs: lettersFor(epithet),
      transliteration: epithet,
      gloss: glosses.tierOne(epithet, true),
    };
  }
  const power = pick(rng, powerPool(plan).filter((entry) => entry.words.length === 1));
  const word = power.words.join('');
  return {
    glyphs: lettersFor(word),
    transliteration: word,
    gloss: glosses.tierOne(power.id, false),
  };
}

function realizeTierTwo(plan: FormulaPlan, rng: Rng, glosses: LatinGlosses): FormulaOutput {
  const clause = tierTwoClause(plan);
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const words = [verbForm(intent.root, 'a'), declined(target, 'accusative')];
  return {
    glyphs: words.map(lettersFor).join(''),
    transliteration: words.join(' '),
    gloss: glosses.tierTwo(intent.root, target.root),
  };
}

function realizeFormula(plan: FormulaPlan, rng: Rng, glosses: LatinGlosses): FormulaOutput {
  if (plan.difficulty === 1) return realizeTierOne(plan, rng, glosses);
  if (plan.difficulty === 2) return realizeTierTwo(plan, rng, glosses);

  const words: string[] = [];
  const glossParts: string[] = [];

  for (const id of pickOpenings(plan)) {
    words.push(...IDIOM_WORDS[id]);
    glossParts.push(glosses.idiom(id));
  }

  plan.clauses.forEach((clause, index) => {
    // Epithets and agents stay distinct within one clause. Across clauses the
    // pools reopen.
    const used = new Set<string>();
    // There is no clause separator glyph in this genome: from difficulty 6 the
    // joint is the word ET, and the enclitic -que was declined because it
    // would fuse with whatever word the draw put first (spec 9.2).
    if (index > 0) words.push(FN_ET);
    const joined = index > 0;
    let realized: ClauseRealization;
    if (plan.school === 'protection') {
      realized = realizeProtectionClause(plan, clause, rng, joined, glosses);
    } else if (plan.school === 'curse') {
      realized = realizeCurseClause(clause, rng, joined, glosses);
    } else if (plan.school === 'divination') {
      realized = realizeDivinationClause(clause, rng, joined, glosses);
    } else if (plan.school === 'chronomancy') {
      realized = realizeChronomancyClause(clause, rng, joined, glosses);
    } else {
      realized = realizeInvocationClause(plan, clause, rng, used, joined, glosses);
    }
    words.push(...realized.words);
    glossParts.push(realized.gloss);
  });

  const repeated = litany(plan, rng, glosses);
  if (repeated !== null) {
    words.push(...repeated.words);
    glossParts.push(repeated.gloss);
  }

  if (plan.closing) {
    // The Chronomancy closer takes an argument, so it is built rather than
    // listed, and whatever stacks behind it follows.
    if (plan.school === 'chronomancy' && !plan.eldritch) {
      const anchor = returnAnchor(plan, rng, glosses);
      words.push(...anchor.words);
      glossParts.push(anchor.gloss);
    }
    for (const id of pickClosings(plan, rng)) {
      words.push(...IDIOM_WORDS[id]);
      glossParts.push(glosses.idiom(id));
    }
  }

  let glyphs = words.map(lettersFor).join(WORD_SEP);
  let transliteration = words.join(' ');
  if (plan.seal) {
    // The count, then the instruction: even the seal keeps this genome's
    // verb-final word order (spec 9.8).
    const count = sealCountFor(plan, rng);
    glyphs += `${WORD_SEP}${SEAL_GLYPHS[count]}${WORD_SEP}${lettersFor(SEAL_TAIL)}`;
    transliteration += ` ${SEAL_WORDS[count]} ${SEAL_TAIL}`;
    glossParts.push(sealGloss(plan, count, glosses));
  }

  return { glyphs, transliteration, gloss: glosses.sentences(glossParts) };
}

export const latinGenome: Genome<LatinGlosses> = {
  id: 'latin',
  separators: [WORD_SEP],
  realize: realizeFormula,
};
