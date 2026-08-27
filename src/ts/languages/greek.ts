// Greek genome rules: tokenization, the second declension, the aorist fusion,
// the Eldritch register and the realization of a clause plan into the three
// aligned output lines. Every rule implements docs/genomes.md section 8.
//
// Greek marks roles by ending, so this genome spends its word order on telling
// the schools apart: seven clause orders, one per school and one per clause
// kind of the two that have kinds.
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
import type { GreekGlosses } from './greek-glosses.js';
import {
  BRIGHT_POWER,
  DARK_POWER,
  DIRECTION_WORDS,
  DREAD_POWER,
  FIELDS,
  FN_ARA,
  FN_EIS,
  FN_KAI,
  FN_KATA,
  GC5_TAIL,
  IDIOM_WORDS,
  INVOCATION_COME,
  LETTER_MAP,
  SEAL_GLYPHS,
  SEAL_HEAD,
  SEAL_WORDS,
  SHRINKING_WORD,
  WORD_SEP,
  type GreekIdiomId,
  type GreekRoot,
  type SealCount,
} from './greek-data.js';

export { tokenizeGreek, lettersFor, nounForm, verbForm, aoristForm, adverbForm, eldritchRoot };

type NounEnding = 'os' | 'on' | 'ou' | 'e';
type VerbForm = 'oo' | 'ei' | 'e' | 'etoo' | 'aorist';

// Greedy longest match. The spec forbids any root that would reparse, so no
// lexicon entry contains t plus h, p plus s, e plus e and so on meaning two
// separate sounds.
function tokenizeGreek(word: string): string[] {
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
    if (LETTER_MAP[one] === undefined) {
      throw new Error(`letter outside the greek romanization: ${one} in ${word}`);
    }
    tokens.push(one);
    i += 1;
  }
  return tokens;
}

// No collapse rule: Greek writes its geminates, and this genome is the only
// one of the four without one (spec 8.2).
function lettersFor(word: string): string {
  return tokenizeGreek(word)
    .map((token) => LETTER_MAP[token] ?? '')
    .join('');
}

function nounForm(root: string, ending: NounEnding): string {
  return `${root}${ending}`;
}

// The aorist takes -SA after a stop and -EESA after anything else, and after a
// stop the sigma fuses with it (spec 8.4). The fusion runs on the
// romanization, and the p plus s or k plus s it produces is written Ψ or Ξ by
// the ordinary greedy rule, which is why Greek has those two letters.
const VELAR: ReadonlySet<string> = new Set(['k', 'g', 'kh']);
const LABIAL: ReadonlySet<string> = new Set(['p', 'b', 'ph']);
const DENTAL: ReadonlySet<string> = new Set(['t', 'd', 'th']);

function aoristForm(root: string): string {
  const tokens = tokenizeGreek(root);
  const last = tokens[tokens.length - 1] ?? '';
  const stem = tokens.slice(0, -1).join('');
  if (VELAR.has(last)) return `${stem}ksa`;
  if (LABIAL.has(last)) return `${stem}psa`;
  if (DENTAL.has(last)) return `${stem}sa`;
  return `${root}eesa`;
}

function verbForm(root: string, form: VerbForm): string {
  return form === 'aorist' ? aoristForm(root) : `${root}${form}`;
}

function adverbForm(root: string): string {
  return `${root}oos`;
}

// The Eldritch register over a content root, the two ordered rules of spec
// 8.10: every short vowel lengthens, every s hardens to ks and every t to th.
// The digraphs already contain their letters and are left alone, so the rule
// never runs twice on one sound.
function eldritchRoot(root: string): string {
  return tokenizeGreek(root)
    .map((token) => {
      if (token === 'o') return 'oo';
      if (token === 'e') return 'ee';
      if (token === 's') return 'ks';
      if (token === 't') return 'th';
      return token;
    })
    .join('');
}

function fills(root: GreekRoot, role: 'noun' | 'verb' | 'adj' | 'adv' | 'pp'): boolean {
  return root.forms.includes(role);
}

function nounsOf(field: SemanticField): GreekRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'noun'));
}

function verbsOf(field: SemanticField): GreekRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'verb'));
}

// An intransitive root never fills a slot that takes an object (spec 8.3).
function transitiveVerbsOf(field: SemanticField): GreekRoot[] {
  return verbsOf(field).filter((r) => r.intransitive !== true);
}

function adjectivesOf(field: SemanticField): GreekRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'adj'));
}

function adverbsOf(field: SemanticField): GreekRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'adv'));
}

function requireField(field: SemanticField | null): SemanticField {
  return (() => {
    if (field === null) throw new Error('gene is missing its semantic field');
    return field;
  })();
}

function geneField(clause: ClausePlan, role: 'INTENT' | 'TARGET' | 'AGENT'): SemanticField {
  return requireField(clause.genes.find((g) => g.role === role)?.field ?? null);
}

interface ClauseRealization {
  words: string[];
  gloss: string;
}

interface Modifier {
  adj: GreekRoot | null;
  adv: GreekRoot | null;
  adjWord: string;
  advWord: string;
}

const NO_MODIFIER: Modifier = { adj: null, adv: null, adjWord: '', advWord: '' };

function drawModifier(clause: ClausePlan, rng: Rng, distort: (root: string) => string): Modifier {
  const field = clause.modifierField;
  if (clause.modifier === null || field === null) return NO_MODIFIER;
  if (clause.modifier === 'adjective') {
    const root = pick(rng, adjectivesOf(field));
    return { adj: root, adv: null, adjWord: distort(root.root), advWord: '' };
  }
  const root = pick(rng, adverbsOf(field));
  return { adj: null, adv: root, adjWord: '', advWord: adverbForm(distort(root.root)) };
}

// An attributive adjective copies the ending of the noun that follows it
// (spec 8.4), so it is written with whatever case its head is in.
function adjectiveWords(mod: Modifier, ending: NounEnding): string[] {
  return mod.adj === null ? [] : [nounForm(mod.adjWord, ending)];
}

function adverbWords(mod: Modifier): string[] {
  return mod.adv === null ? [] : [mod.advWord];
}

function modifierRoots(mod: Modifier): { adjectiveRoot: string | null; adverbRoot: string | null } {
  return { adjectiveRoot: mod.adj?.root ?? null, adverbRoot: mod.adv?.root ?? null };
}

// Protection: the amulet speaks in the first person and puts its verb last,
// with the threat behind KATA in the genitive (spec 8.5).
function realizeProtectionClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: GreekGlosses,
): ClauseRealization {
  const agent = pick(rng, nounsOf('warding'));
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const mod = drawModifier(clause, rng, (root) => root);

  const words = [
    nounForm(agent.root, 'os'),
    FN_KATA,
    ...adjectiveWords(mod, 'ou'),
    nounForm(target.root, 'ou'),
    verbForm(intent.root, 'oo'),
    ...adverbWords(mod),
  ];

  // At tiers 8 and 9 the free power word is subsumed by the repetition, so it
  // is never written four times over (spec 8.13).
  const power = plan.difficulty >= 8 ? null : pick(rng, BRIGHT_POWER);
  if (power !== null) words.push(power);

  return {
    words,
    gloss: glosses.protectionClause({
      agentRoot: agent.root,
      intentRoot: intent.root,
      targetRoot: target.root,
      ...modifierRoots(mod),
      powerWord: power,
      joined,
    }),
  };
}

// Curse: the tablets open on the binding verb and let the victim fall straight
// after it, with the modifier behind the object (spec 8.5).
function realizeCurseClause(
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: GreekGlosses,
): ClauseRealization {
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const intent = pick(rng, transitiveVerbsOf('harm'));
  const mod = drawModifier(clause, rng, (root) => root);

  const words = [
    verbForm(intent.root, 'etoo'),
    ...adjectiveWords(mod, 'on'),
    nounForm(target.root, 'on'),
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

// Invocation: address, then the stack of what the power is lord of, then the
// demand (spec 8.5). The vocative heads the chain and every epithet behind it
// is a genitive.
function realizeInvocationClause(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  used: Set<string>,
  joined: boolean,
  glosses: GreekGlosses,
): ClauseRealization {
  const eldritch = plan.eldritch;
  const distort = (root: string): string => (eldritch ? eldritchRoot(root) : root);
  const words: string[] = [];
  const agents: GlossRef[] = [];

  clause.genes
    .filter((g) => g.role === 'AGENT')
    .forEach((gene, index) => {
      const ending: NounEnding = index === 0 ? 'e' : 'ou';
      if (eldritch) {
        const epithet = pick(rng, DREAD_POWER.filter((word) => !used.has(word)));
        used.add(epithet);
        // A dread epithet is indeclinable and appears only in its listed form.
        words.push(epithet);
        agents.push({ kind: 'epithet', id: epithet, spoken: epithet });
        return;
      }
      const root = pick(rng, nounsOf(requireField(gene.field)).filter((r) => !used.has(r.root)));
      used.add(root.root);
      words.push(nounForm(root.root, ending));
      agents.push({ kind: 'root', id: root.root });
    });

  const intent = pick(rng, FIELDS.summoning.filter((r) => INVOCATION_COME.includes(r.root)));
  const mod = drawModifier(clause, rng, distort);
  words.push(verbForm(distort(intent.root), 'e'), ...adverbWords(mod));

  let power: string;
  if (eldritch) {
    power = pick(rng, DREAD_POWER.filter((word) => !used.has(word)));
    used.add(power);
  } else {
    power = pick(rng, BRIGHT_POWER);
  }
  words.push(power);

  return {
    words,
    gloss: glosses.invocationClause({
      agents,
      intentRoot: intent.root,
      adverbRoot: mod.adv?.root ?? null,
      powerWord: power,
      eldritch,
      joined,
    }),
  };
}

// Divination: ARA in front turns the statement into a question and leaves the
// rest of the clause where it stood; the answer is verb-final (spec 8.11).
function realizeDivinationClause(
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: GreekGlosses,
): ClauseRealization {
  const agent = pick(rng, nounsOf(geneField(clause, 'AGENT')));
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const mod = drawModifier(clause, rng, (root) => root);

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
        nounForm(agent.root, 'os'),
        ...adjectiveWords(mod, 'on'),
        nounForm(target.root, 'on'),
        verbForm(intent.root, 'oo'),
        ...adverbWords(mod),
      ],
      gloss: glosses.divinationSee(parts),
    };
  }

  return {
    words: [
      FN_ARA,
      verbForm(intent.root, 'ei'),
      ...adverbWords(mod),
      nounForm(agent.root, 'os'),
      ...adjectiveWords(mod, 'on'),
      nounForm(target.root, 'on'),
    ],
    gloss: glosses.divinationAsk(parts),
  };
}

// Chronomancy: the command first with its direction behind it, then the deed
// stated as done, which is the aorist and its fusion (spec 8.12).
function realizeChronomancyClause(
  clause: ClausePlan,
  rng: Rng,
  joined: boolean,
  glosses: GreekGlosses,
): ClauseRealization {
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const mod = drawModifier(clause, rng, (root) => root);
  const parts = {
    intentRoot: intent.root,
    targetRoot: target.root,
    ...modifierRoots(mod),
    joined,
  };

  if (clause.kind === 'binding') {
    return {
      words: [
        ...adjectiveWords(mod, 'on'),
        nounForm(target.root, 'on'),
        verbForm(intent.root, 'aorist'),
        ...adverbWords(mod),
      ],
      gloss: glosses.chronomancyBind(parts),
    };
  }

  const direction = clause.direction;
  if (direction === null) throw new Error('a crossing clause carries no direction');
  return {
    words: [
      verbForm(intent.root, 'e'),
      DIRECTION_WORDS[direction],
      ...adverbWords(mod),
      ...adjectiveWords(mod, 'on'),
      nounForm(target.root, 'on'),
    ],
    gloss: glosses.chronomancyCross({ ...parts, direction }),
  };
}

// GC5, the return anchor: a time-field noun in the accusative governed by EIS,
// with a second time noun in the genitive behind it at tier 9, drawn without
// replacement so it is never the first (spec 8.6).
function returnAnchor(plan: FormulaPlan, rng: Rng, glosses: GreekGlosses): ClauseRealization {
  const anchor = pick(rng, nounsOf('time'));
  const words = [FN_EIS, nounForm(anchor.root, 'on')];
  let genitive: string | null = null;
  if (plan.difficulty >= 9) {
    const held = pick(rng, nounsOf('time').filter((r) => r.root !== anchor.root));
    genitive = held.root;
    words.push(nounForm(held.root, 'ou'));
  }
  words.push(GC5_TAIL);
  return { words, gloss: glosses.returnAnchor(anchor.root, genitive) };
}

const SCHOOL_OPENER: Readonly<Record<string, GreekIdiomId>> = {
  protection: 'GO1',
  curse: 'GO4',
  invocation: 'GO2',
  divination: 'GO5',
  chronomancy: 'GO6',
};

function pickOpenings(plan: FormulaPlan): GreekIdiomId[] {
  if (plan.eldritch) {
    return [plan.difficulty < 6 ? 'ELDRITCH_OPEN_SHORT' : 'ELDRITCH_OPEN_FULL'];
  }
  const own = SCHOOL_OPENER[plan.school] ?? 'GO1';
  // The Ephesian words stand in front of the school's own opener at the top
  // tiers, short at seven and entire above it (spec 8.9).
  if (plan.difficulty === 7) return ['GO3_SHORT', own];
  if (plan.difficulty >= 8) return ['GO3_FULL', own];
  return [own];
}

function pickClosings(plan: FormulaPlan, rng: Rng): GreekIdiomId[] {
  if (plan.eldritch) return ['ELDRITCH_CLOSE'];
  const stack: GreekIdiomId[] = [];
  if (plan.school === 'divination') stack.push('GC4');
  else if (plan.school !== 'chronomancy') {
    // GC2 is an alternative to GC1 at tiers 5 and 6, decided by a seeded draw
    // (spec 8.9).
    stack.push(plan.difficulty <= 6 && chance(rng, 0.5) ? 'GC2' : 'GC1');
  }
  if (plan.difficulty >= 8) stack.push('GC3');
  return stack;
}

function powerPool(plan: FormulaPlan): ReadonlyArray<string> {
  if (plan.eldritch) return DREAD_POWER;
  return plan.school === 'curse' ? DARK_POWER : BRIGHT_POWER;
}

function litany(plan: FormulaPlan, rng: Rng, glosses: GreekGlosses): ClauseRealization | null {
  if (plan.powerWordStyle === 'none') return null;
  if (plan.powerWordStyle === 'triple') {
    const word = pick(rng, powerPool(plan));
    return { words: [word, word, word], gloss: glosses.litanyTriple(word, plan.eldritch) };
  }
  // The shrinking sequence drops a letter at each step down to a single one.
  // Iao does it exactly, which is why the spec names it; the schools that must
  // not speak a bright word shrink one of their own instead.
  const base = plan.school === 'protection' || plan.school === 'invocation'
    ? SHRINKING_WORD
    : plan.eldritch || plan.school === 'curse'
      ? pick(rng, powerPool(plan))
      : SHRINKING_WORD;
  const tokens = tokenizeGreek(base);
  const words = tokens.map((_, index) => tokens.slice(index).join(''));
  return { words, gloss: glosses.litanyShrink(base, plan.eldritch) };
}

function sealCountFor(plan: FormulaPlan, rng: Rng): SealCount {
  if (plan.eldritch) return 9;
  if (plan.difficulty === 9) return pick(rng, [12, 99] as const);
  if (plan.school === 'divination' && plan.difficulty === 7) return 3;
  if (plan.school === 'chronomancy') return 12;
  if (plan.difficulty === 7) return pick(rng, [3, 7] as const);
  return pick(rng, [7, 9] as const);
}

function realizeTierOne(plan: FormulaPlan, rng: Rng, glosses: GreekGlosses): FormulaOutput {
  const power = pick(rng, powerPool(plan));
  return {
    glyphs: lettersFor(power),
    transliteration: power,
    gloss: glosses.tierOne(power, plan.eldritch),
  };
}

function realizeTierTwo(plan: FormulaPlan, rng: Rng, glosses: GreekGlosses): FormulaOutput {
  const clause = plan.clauses[0];
  if (clause === undefined) throw new Error('tier 2 plan has no clause');
  const distort = (root: string): string => (plan.eldritch ? eldritchRoot(root) : root);
  const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
  const target = pick(rng, nounsOf(geneField(clause, 'TARGET')));
  const words = [
    verbForm(distort(intent.root), 'e'),
    nounForm(distort(target.root), 'on'),
  ];
  return {
    glyphs: words.map(lettersFor).join(''),
    transliteration: words.join(' '),
    gloss: glosses.tierTwo(intent.root, target.root),
  };
}

function realizeFormula(plan: FormulaPlan, rng: Rng, glosses: GreekGlosses): FormulaOutput {
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
    // joint is the word KAI, which is what Greek does with clauses (spec 8.2).
    if (index > 0) words.push(FN_KAI);
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
    const count = sealCountFor(plan, rng);
    glyphs += `${WORD_SEP}${lettersFor(SEAL_HEAD)}${WORD_SEP}${SEAL_GLYPHS[count]}`;
    transliteration += ` ${SEAL_HEAD} ${SEAL_WORDS[count]}`;
    // Chronomancy reads the count as how far the crossing went (spec 1.6).
    glossParts.push(
      plan.school === 'chronomancy' ? glosses.sealDepth(count) : glosses.seal(count),
    );
  }

  return { glyphs, transliteration, gloss: glosses.sentences(glossParts) };
}

export const greekGenome: Genome<GreekGlosses> = {
  id: 'greek',
  separators: [WORD_SEP],
  realize: realizeFormula,
};
