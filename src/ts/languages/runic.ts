// Runic genome rules: tokenization, morphology, the Eldritch register and
// the realization of a clause plan into the three aligned output lines.
// Every rule implements docs/genomes.md section 2.
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
import type { GlossRef, RunicGlosses } from '../glosses/types.js';
import {
  BRIGHT_POWER,
  CLAUSE_SEP,
  CROSS_SEP,
  DIRECTION_WORDS,
  DREAD_POWER,
  FIELDS,
  IDIOM_WORDS,
  INVOCATION_COME,
  RC5_TAIL,
  RUNE_MAP,
  SEAL_GLYPHS,
  SEAL_WORDS,
  WORD_SEP,
  type RunicIdiomId,
  type RunicRoot,
  type SealCount,
} from './runic-data.js';

export { tokenizeRunic, runesFor, nounForm, verbForm, adjectiveForm, adverbForm, eldritchRoot };

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function isVowelToken(token: string): boolean {
  return token === 'ei' || VOWELS.has(token);
}

// Greedy longest-match tokenization. The spec guarantees no lexicon entry
// contains t plus h, n plus g or e plus i as two separate sounds.
function tokenizeRunic(word: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < word.length) {
    const two = word.slice(i, i + 2);
    if (two.length === 2 && RUNE_MAP[two] !== undefined) {
      tokens.push(two);
      i += 2;
      continue;
    }
    const one = word.charAt(i);
    if (RUNE_MAP[one] === undefined) {
      throw new Error(`letter outside the futhark romanization: ${one} in ${word}`);
    }
    tokens.push(one);
    i += 1;
  }
  return tokens;
}

// Carving practice: adjacent identical runes collapse within a word, the
// transliteration keeps the double letter.
function runesFor(word: string): string {
  const glyphs: string[] = [];
  for (const token of tokenizeRunic(word)) {
    const glyph = RUNE_MAP[token];
    if (glyph !== undefined && glyphs[glyphs.length - 1] !== glyph) {
      glyphs.push(glyph);
    }
  }
  return glyphs.join('');
}

// A stem-final vowel elides before a vowel-initial ending, giving the
// spec's dative mene from mena.
function attach(stem: string, ending: string): string {
  const last = stem.charAt(stem.length - 1);
  const first = ending.charAt(0);
  if (VOWELS.has(last) && VOWELS.has(first)) {
    return stem.slice(0, -1) + ending;
  }
  return stem + ending;
}

type NounEnding = 'az' | 'an' | 'e' | 'oz' | 'as';
type VerbForm = 'o' | 'ith' | 'bare' | 'ido' | 'ai';

function nounForm(root: string, ending: NounEnding): string {
  return attach(root, ending);
}

function verbForm(root: string, form: VerbForm): string {
  return form === 'bare' ? root : attach(root, form);
}

function adjectiveForm(root: string, ending: string): string {
  return attach(root, ending);
}

function adverbForm(root: string): string {
  return attach(root, 'o');
}

// The Eldritch register over a content root, three ordered rules of spec
// 2.10: vowel darkening, z injection, guttural coda. The ei rune is one
// token and the darkening table does not list it, so it stays untouched.
function eldritchRoot(root: string): string {
  const tokens = tokenizeRunic(root);
  const darkened: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] ?? '';
    const next = tokens[i + 1] ?? '';
    if (token === 'a' && (next === 'i' || next === 'u')) {
      darkened.push('u');
      i += 1;
      continue;
    }
    if (token === 'a' || token === 'i') darkened.push('u');
    else if (token === 'e') darkened.push('o');
    else darkened.push(token);
  }
  const vowelAt = darkened.findIndex(isVowelToken);
  if (vowelAt >= 0) darkened.splice(vowelAt + 1, 0, 'z');
  if (isVowelToken(darkened[darkened.length - 1] ?? '')) darkened.push('h');
  return darkened.join('');
}

function fills(root: RunicRoot, role: 'noun' | 'verb' | 'adj' | 'adv'): boolean {
  return root.forms.includes(role);
}

function nounsOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'noun'));
}

function verbsOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'verb'));
}

// An intransitive root never fills a slot that takes a direct object
// (spec 2.3), which the tier 2 imperative does.
function transitiveVerbsOf(field: SemanticField): RunicRoot[] {
  return verbsOf(field).filter((r) => r.intransitive !== true);
}

function adjectivesOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'adj'));
}

function adverbsOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'adv'));
}

function byNames(names: ReadonlyArray<string>): RunicRoot[] {
  return FIELDS.summoning.filter((r) => names.includes(r.root));
}

function requireField(field: SemanticField | null): SemanticField {
  if (field === null) throw new Error('gene is missing its semantic field');
  return field;
}

interface Segment {
  words: string[];
}

interface ClauseRealization {
  words: string[];
  gloss: string;
}

function realizeModifier(
  clause: ClausePlan,
  rng: Rng,
  distort: (root: string) => string,
): { adj: RunicRoot | null; adv: RunicRoot | null; adjWord: string; advWord: string } {
  const field = clause.modifierField;
  if (clause.modifier === null || field === null) {
    return { adj: null, adv: null, adjWord: '', advWord: '' };
  }
  if (clause.modifier === 'adjective') {
    const root = pick(rng, adjectivesOf(field));
    return { adj: root, adv: null, adjWord: distort(root.root), advWord: '' };
  }
  const root = pick(rng, adverbsOf(field));
  return { adj: null, adv: root, adjWord: '', advWord: adverbForm(distort(root.root)) };
}

function realizeProtectionClause(
  clause: ClausePlan,
  rng: Rng,
  distort: (root: string) => string,
  glosses: RunicGlosses,
): ClauseRealization {
  const agent = pick(rng, nounsOf('warding'));
  const intentField = requireField(clause.genes.find((g) => g.role === 'INTENT')?.field ?? null);
  const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);
  const intent = pick(rng, verbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));
  const mod = realizeModifier(clause, rng, distort);

  const words: string[] = [nounForm(distort(agent.root), 'az'), 'withra'];
  if (mod.adj !== null) words.push(adjectiveForm(mod.adjWord, 'an'));
  words.push(nounForm(distort(target.root), 'an'));
  if (mod.adv !== null) words.push(mod.advWord);
  words.push(verbForm(distort(intent.root), 'o'));

  return {
    words,
    gloss: glosses.protectionClause({
      agentRoot: agent.root,
      intentRoot: intent.root,
      targetRoot: target.root,
      adjectiveRoot: mod.adj?.root ?? null,
      adverbRoot: mod.adv?.root ?? null,
    }),
  };
}

// Spec 2.11. The two clause kinds hold the same genes in reversed order: the
// question fronts its verb in the third person, the answer buries it in the
// first. That contrast is the school's whole grammatical signature here.
function realizeDivinationClause(
  clause: ClausePlan,
  rng: Rng,
  glosses: RunicGlosses,
): ClauseRealization {
  const keep = (root: string): string => root;
  const agentField = requireField(clause.genes.find((g) => g.role === 'AGENT')?.field ?? null);
  const intentField = requireField(clause.genes.find((g) => g.role === 'INTENT')?.field ?? null);
  const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);
  const agent = pick(rng, nounsOf(agentField));
  // Both clause kinds take an object, so neither may draw an intransitive
  // root (spec 2.3).
  const intent = pick(rng, transitiveVerbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));
  const mod = realizeModifier(clause, rng, keep);

  const parts = {
    agentRoot: agent.root,
    intentRoot: intent.root,
    targetRoot: target.root,
    adjectiveRoot: mod.adj?.root ?? null,
    adverbRoot: mod.adv?.root ?? null,
  };

  const words: string[] = [];
  if (clause.kind === 'seeing') {
    words.push(nounForm(agent.root, 'az'));
    if (mod.adj !== null) words.push(adjectiveForm(mod.adjWord, 'an'));
    words.push(nounForm(target.root, 'an'));
    if (mod.adv !== null) words.push(mod.advWord);
    words.push(verbForm(intent.root, 'o'));
    return { words, gloss: glosses.divinationSee(parts) };
  }

  // The verb opens the question and nothing may stand before it (spec 7), so
  // the adverb follows the verb it modifies instead of preceding it.
  words.push(verbForm(intent.root, 'ith'));
  if (mod.adv !== null) words.push(mod.advWord);
  words.push(nounForm(agent.root, 'az'));
  if (mod.adj !== null) words.push(adjectiveForm(mod.adjWord, 'an'));
  words.push(nounForm(target.root, 'an'));
  return { words, gloss: glosses.divinationAsk(parts) };
}

// Spec 2.12. The crossing clause opens on the bare imperative and its
// direction, the binding clause is the verb-final main clause with ek written
// out: the explicit pronoun is what marks the deed done in the saying.
function realizeChronomancyClause(
  clause: ClausePlan,
  rng: Rng,
  glosses: RunicGlosses,
): ClauseRealization {
  const keep = (root: string): string => root;
  const intentField = requireField(clause.genes.find((g) => g.role === 'INTENT')?.field ?? null);
  const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);
  const intent = pick(rng, transitiveVerbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));
  const mod = realizeModifier(clause, rng, keep);

  const parts = {
    intentRoot: intent.root,
    targetRoot: target.root,
    adjectiveRoot: mod.adj?.root ?? null,
    adverbRoot: mod.adv?.root ?? null,
  };

  const words: string[] = [];
  if (clause.kind === 'binding') {
    words.push('ek');
    if (mod.adj !== null) words.push(adjectiveForm(mod.adjWord, 'an'));
    words.push(nounForm(target.root, 'an'));
    if (mod.adv !== null) words.push(mod.advWord);
    words.push(verbForm(intent.root, 'o'));
    return { words, gloss: glosses.chronomancyBind(parts) };
  }

  const direction = clause.direction;
  if (direction === null) throw new Error('a crossing clause carries no direction');
  // The direction sits immediately after the verb, so an adverb drawn for this
  // clause falls in behind it (spec 2.12).
  words.push(verbForm(intent.root, 'bare'), DIRECTION_WORDS[direction]);
  if (mod.adv !== null) words.push(mod.advWord);
  if (mod.adj !== null) words.push(adjectiveForm(mod.adjWord, 'an'));
  words.push(nounForm(target.root, 'an'));
  return { words, gloss: glosses.chronomancyCross({ ...parts, direction }) };
}

// RC5, the return anchor: a time-field noun in the accusative, the goal of a
// verb of motion, with a -as genitive behind it at tier 9 (spec 2.6).
function returnAnchor(
  plan: FormulaPlan,
  rng: Rng,
  glosses: RunicGlosses,
): ClauseRealization {
  const anchor = pick(rng, nounsOf('time'));
  const words = [nounForm(anchor.root, 'an')];
  let genitive: string | null = null;
  if (plan.difficulty >= 9) {
    const held = pick(rng, nounsOf('time').filter((r) => r.root !== anchor.root));
    genitive = held.root;
    words.push(nounForm(held.root, 'as'));
  }
  words.push(...RC5_TAIL);
  return { words, gloss: glosses.returnAnchor(anchor.root, genitive) };
}

function realizeCurseClause(
  clause: ClausePlan,
  rng: Rng,
  distort: (root: string) => string,
  glosses: RunicGlosses,
): ClauseRealization {
  const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);
  const target = pick(rng, nounsOf(targetField));
  const intent = pick(rng, verbsOf('harm'));
  const mod = realizeModifier(clause, rng, distort);

  const words: string[] = [];
  if (mod.adj !== null) words.push(adjectiveForm(mod.adjWord, 'az'));
  words.push(nounForm(distort(target.root), 'az'));
  if (mod.adv !== null) words.push(mod.advWord);
  words.push(verbForm(distort(intent.root), 'ai'));

  return {
    words,
    gloss: glosses.curseClause({
      targetRoot: target.root,
      intentRoot: intent.root,
      adjectiveRoot: mod.adj?.root ?? null,
      adverbRoot: mod.adv?.root ?? null,
    }),
  };
}

function realizeInvocationClause(
  clause: ClausePlan,
  rng: Rng,
  eldritch: boolean,
  distort: (root: string) => string,
  usedEpithets: Set<string>,
  glosses: RunicGlosses,
): ClauseRealization {
  const agents: GlossRef[] = [];
  const words: string[] = [];

  for (const gene of clause.genes.filter((g) => g.role === 'AGENT')) {
    if (eldritch) {
      const pool = DREAD_POWER.filter((word) => !usedEpithets.has(word));
      const epithet = pick(rng, pool);
      usedEpithets.add(epithet);
      words.push(epithet);
      agents.push({ kind: 'epithet', id: epithet, spoken: epithet });
    } else {
      const pool = nounsOf(requireField(gene.field)).filter((r) => !usedEpithets.has(r.root));
      const agent = pick(rng, pool);
      usedEpithets.add(agent.root);
      words.push(nounForm(agent.root, 'az'));
      agents.push({ kind: 'root', id: agent.root });
    }
  }

  const intent = pick(rng, byNames(INVOCATION_COME));
  const mod = realizeModifier(clause, rng, distort);
  if (mod.adv !== null) words.push(mod.advWord);
  words.push(verbForm(distort(intent.root), 'bare'));

  let power: string;
  if (eldritch) {
    power = pick(rng, DREAD_POWER.filter((word) => !usedEpithets.has(word)));
    usedEpithets.add(power);
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
    }),
  };
}

function pickOpenings(plan: FormulaPlan, rng: Rng): RunicIdiomId[] {
  const d = plan.difficulty;
  if (plan.eldritch) {
    return [d < 6 ? 'ELDRITCH_OPEN_SHORT' : 'ELDRITCH_OPEN_FULL'];
  }
  // Spec 2.11: RO4 opens every divination formula, and the cries that may
  // precede it keep their ᛫ join inside the opening clause.
  if (plan.school === 'divination') {
    if (d <= 5) return ['RO4'];
    if (d === 6) return ['RO2', 'RO4'];
    if (d === 7) {
      return chance(rng, 0.5) ? ['RO2', 'RO3_FIRST_AETT', 'RO4'] : ['RO2', 'RO4'];
    }
    return ['RO3_FULL_ROW', 'RO4'];
  }
  if (d <= 4) return ['RO1'];
  if (d === 5) return [pick(rng, ['RO1', 'RO2'] as const)];
  if (d === 6) return ['RO2'];
  if (d === 7) {
    return chance(rng, 0.5) ? ['RO2', 'RO3_FIRST_AETT'] : ['RO2'];
  }
  return ['RO3_FULL_ROW'];
}

function pickClosings(plan: FormulaPlan, rng: Rng): RunicIdiomId[] {
  if (plan.eldritch) return ['ELDRITCH_CLOSE'];
  // RC1 and RC2 stay with the schools that carve, RC4 with the one that reads.
  if (plan.school === 'divination') {
    return plan.difficulty >= 8 ? ['RC4', 'RC3'] : ['RC4'];
  }
  if (plan.difficulty >= 8) return ['RC1', 'RC3'];
  return [pick(rng, ['RC1', 'RC2'] as const)];
}

function litanySegment(
  plan: FormulaPlan,
  rng: Rng,
  glosses: RunicGlosses,
): ClauseRealization | null {
  if (plan.powerWordStyle === 'none') return null;
  if (plan.powerWordStyle === 'triple') {
    const pool = plan.eldritch ? DREAD_POWER : BRIGHT_POWER;
    const word = pick(rng, pool);
    return { words: [word, word, word], gloss: glosses.litanyTriple(word) };
  }
  // Shrinking triangle: the word loses its first rune at each repetition,
  // down to a single rune. Steps drop whole rune tokens so a digraph never
  // splits into two letters.
  const pool = plan.eldritch
    ? DREAD_POWER
    : BRIGHT_POWER.filter((word) => word !== 'alu' && word !== 'ota');
  const base = pick(rng, pool);
  const tokens = tokenizeRunic(base);
  const words: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    words.push(tokens.slice(i).join(''));
  }
  return { words, gloss: glosses.litanyTriangle(base) };
}

function realizeTierOne(plan: FormulaPlan, rng: Rng, glosses: RunicGlosses): FormulaOutput {
  const power = pick(rng, plan.eldritch ? DREAD_POWER : BRIGHT_POWER);
  return {
    glyphs: runesFor(power),
    transliteration: power,
    gloss: glosses.tierOne(power, plan.eldritch),
  };
}

function realizeTierTwo(plan: FormulaPlan, rng: Rng, glosses: RunicGlosses): FormulaOutput {
  const distort = (root: string): string => (plan.eldritch ? eldritchRoot(root) : root);
  const clause = plan.clauses[0];
  if (clause === undefined) throw new Error('tier 2 plan has no clause');
  const intentField = requireField(clause.genes.find((g) => g.role === 'INTENT')?.field ?? null);
  const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);

  const intent = pick(rng, transitiveVerbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));

  const words = [verbForm(distort(intent.root), 'bare'), nounForm(distort(target.root), 'an')];
  return {
    glyphs: words.map(runesFor).join(''),
    transliteration: words.join(' '),
    gloss: glosses.tierTwo(intent.root, target.root),
  };
}

function realizeFormula(plan: FormulaPlan, rng: Rng, glosses: RunicGlosses): FormulaOutput {
  if (plan.difficulty === 1) return realizeTierOne(plan, rng, glosses);
  if (plan.difficulty === 2) return realizeTierTwo(plan, rng, glosses);

  const distort = (root: string): string => (plan.eldritch ? eldritchRoot(root) : root);
  const segments: Segment[] = [];
  const glossParts: string[] = [];

  const openings = pickOpenings(plan, rng);
  for (const id of openings) glossParts.push(glosses.idiom(id));
  const openingWords = openings.flatMap((id) => [...IDIOM_WORDS[id]]);

  // RO4 is a full clause and takes ᛬ after it, so a divination opening stands
  // as its own segment instead of joining the first clause (spec 2.2).
  const divination = plan.school === 'divination';
  if (divination) segments.push({ words: openingWords });

  plan.clauses.forEach((clause, index) => {
    // Epithets stay distinct within one clause. Across clauses the pools
    // reopen, litanies may echo a power already named.
    const usedEpithets = new Set<string>();
    let realized: ClauseRealization;
    if (plan.school === 'protection') {
      realized = realizeProtectionClause(clause, rng, distort, glosses);
    } else if (plan.school === 'curse') {
      realized = realizeCurseClause(clause, rng, distort, glosses);
    } else if (divination) {
      realized = realizeDivinationClause(clause, rng, glosses);
    } else if (plan.school === 'chronomancy') {
      realized = realizeChronomancyClause(clause, rng, glosses);
    } else {
      realized = realizeInvocationClause(
        clause,
        rng,
        plan.eldritch,
        distort,
        usedEpithets,
        glosses,
      );
    }
    // The opening idioms join the first clause with word separators, as in
    // the section 5 rendering. Only clause boundaries take the colon.
    segments.push({
      words: index === 0 && !divination ? [...openingWords, ...realized.words] : realized.words,
    });
    glossParts.push(realized.gloss);
  });

  const litany = litanySegment(plan, rng, glosses);
  if (litany !== null) {
    segments.push({ words: litany.words });
    glossParts.push(litany.gloss);
  }

  if (plan.closing) {
    // The return anchor is the one Runic closing built rather than listed, so
    // Chronomancy assembles its own closing clauses (spec 2.12).
    if (plan.school === 'chronomancy') {
      const anchor = returnAnchor(plan, rng, glosses);
      segments.push({ words: anchor.words });
      glossParts.push(anchor.gloss);
      if (plan.difficulty >= 8) {
        segments.push({ words: [...IDIOM_WORDS.RC3] });
        glossParts.push(glosses.idiom('RC3'));
      }
    } else {
      for (const id of pickClosings(plan, rng)) {
        segments.push({ words: [...IDIOM_WORDS[id]] });
        glossParts.push(glosses.idiom(id));
      }
    }
  }

  let sealCount: SealCount | null = null;
  if (plan.seal) {
    if (plan.eldritch) sealCount = 9;
    // The tier 7 divination seal is three and never another count: the rite
    // lifts three lots (spec 2.11). The chronomantic one is twelve, for the
    // hours of the night the crossing has to pass (spec 2.12).
    else if (plan.difficulty === 7 && divination) sealCount = 3;
    else if (plan.difficulty === 7 && plan.school === 'chronomancy') sealCount = 12;
    else if (plan.difficulty === 7) sealCount = pick(rng, [3, 7] as const);
    else if (plan.difficulty === 8) sealCount = pick(rng, [7, 9] as const);
    else sealCount = pick(rng, [9, 12] as const);
    // Chronomancy reads the count as how far the crossing went, so the same
    // seal is worded as a depth in time (spec 1.6).
    glossParts.push(
      plan.school === 'chronomancy'
        ? glosses.sealDepth(sealCount)
        : glosses.seal(sealCount),
    );
  }

  let glyphs = segments
    .map((segment) => segment.words.map(runesFor).join(WORD_SEP))
    .join(CLAUSE_SEP);
  let transliteration = segments.flatMap((segment) => segment.words).join(' ');
  if (sealCount !== null) {
    glyphs += `${CROSS_SEP}${SEAL_GLYPHS[sealCount]}${CROSS_SEP}`;
    transliteration += ` ${SEAL_WORDS[sealCount]}`;
  }

  return { glyphs, transliteration, gloss: glosses.sentences(glossParts) };
}

export const runicGenome: Genome<RunicGlosses> = {
  id: 'runic',
  realize: realizeFormula,
};
