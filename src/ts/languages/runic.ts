// Runic genome rules: tokenization, morphology, the Eldritch register and
// the realization of a clause plan into the three aligned output lines.
// Every rule implements docs/genomes.md section 2.

import { chance, pick, type Rng } from '../generator/rng.js';
import type {
  ClausePlan,
  FormulaOutput,
  FormulaPlan,
  Genome,
  SemanticField,
} from '../generator/types.js';
import {
  BRIGHT_POWER,
  CLAUSE_SEP,
  CROSS_SEP,
  DREAD_POWER,
  ELDRITCH_CLOSE,
  ELDRITCH_OPEN_FULL,
  ELDRITCH_OPEN_SHORT,
  FIELDS,
  INVOCATION_COME,
  INVOCATION_T2,
  RC1,
  RC2,
  RC3,
  RO1,
  RO2,
  RO3_FIRST_AETT,
  RO3_FULL_ROW,
  RUNE_MAP,
  SEAL_GLOSS,
  SEAL_GLYPHS,
  SEAL_WORDS,
  WORD_SEP,
  type Idiom,
  type PowerWord,
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

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function nounsOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => r.noun !== undefined);
}

function verbsOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => r.verb !== undefined);
}

function adjectivesOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => r.adj !== undefined);
}

function adverbsOf(field: SemanticField): RunicRoot[] {
  return FIELDS[field].filter((r) => r.adv !== undefined);
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

  const adverb = mod.adv !== null ? ` ${mod.adv.adv ?? ''}` : '';
  const adjective = mod.adj !== null ? `${mod.adj.adj ?? ''} ` : '';
  return {
    words,
    gloss: `I, the ${agent.noun ?? ''}, ${intent.verb ?? ''}${adverb} against the ${adjective}${target.noun ?? ''}.`,
  };
}

function realizeCurseClause(
  clause: ClausePlan,
  rng: Rng,
  distort: (root: string) => string,
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

  const adverb = mod.adv !== null ? `${mod.adv.adv ?? ''} ` : '';
  const adjective = mod.adj !== null ? `${mod.adj.adj ?? ''} ` : '';
  return {
    words,
    gloss: `May the ${adjective}${target.noun ?? ''} be ${adverb}${intent.pp ?? ''}.`,
  };
}

function realizeInvocationClause(
  clause: ClausePlan,
  rng: Rng,
  eldritch: boolean,
  distort: (root: string) => string,
  usedEpithets: Set<string>,
): ClauseRealization {
  const vocatives: string[] = [];
  const words: string[] = [];

  for (const gene of clause.genes.filter((g) => g.role === 'AGENT')) {
    if (eldritch) {
      const pool = DREAD_POWER.filter((p) => !usedEpithets.has(p.word));
      const epithet = pick(rng, pool);
      usedEpithets.add(epithet.word);
      words.push(epithet.word);
      vocatives.push(`O ${epithet.gloss.replace(/^the /, '')}`);
    } else {
      const pool = nounsOf(requireField(gene.field)).filter((r) => !usedEpithets.has(r.root));
      const agent = pick(rng, pool);
      usedEpithets.add(agent.root);
      words.push(nounForm(agent.root, 'az'));
      vocatives.push(`O ${agent.noun ?? ''}`);
    }
  }

  const intent = pick(rng, byNames(INVOCATION_COME));
  const mod = realizeModifier(clause, rng, distort);
  if (mod.adv !== null) words.push(mod.advWord);
  words.push(verbForm(distort(intent.root), 'bare'));

  let power: PowerWord;
  if (eldritch) {
    power = pick(rng, DREAD_POWER.filter((p) => !usedEpithets.has(p.word)));
    usedEpithets.add(power.word);
  } else {
    power = pick(rng, BRIGHT_POWER);
  }
  words.push(power.word);

  const adverb = mod.adv !== null ? ` ${mod.adv.adv ?? ''}` : '';
  return {
    words,
    gloss: `${vocatives.join(', ')}, ${intent.verb ?? ''}${adverb}! ${capitalize(power.word)}!`,
  };
}

function pickOpenings(plan: FormulaPlan, rng: Rng): Idiom[] {
  const d = plan.difficulty;
  if (plan.eldritch) {
    return [d < 6 ? ELDRITCH_OPEN_SHORT : ELDRITCH_OPEN_FULL];
  }
  if (d <= 4) return [RO1];
  if (d === 5) return [pick(rng, [RO1, RO2])];
  if (d === 6) return [RO2];
  if (d === 7) {
    return chance(rng, 0.5) ? [RO2, RO3_FIRST_AETT] : [RO2];
  }
  return [RO3_FULL_ROW];
}

function pickClosings(plan: FormulaPlan, rng: Rng): Idiom[] {
  if (plan.eldritch) return [ELDRITCH_CLOSE];
  if (plan.difficulty >= 8) return [RC1, RC3];
  return [pick(rng, [RC1, RC2])];
}

function litanySegment(plan: FormulaPlan, rng: Rng): ClauseRealization | null {
  if (plan.powerWordStyle === 'none') return null;
  if (plan.powerWordStyle === 'triple') {
    const pool = plan.eldritch ? DREAD_POWER : BRIGHT_POWER;
    const word = pick(rng, pool).word;
    return { words: [word, word, word], gloss: `${capitalize(word)}, spoken three times.` };
  }
  // Shrinking triangle: the word loses its first rune at each repetition,
  // down to a single rune. Steps drop whole rune tokens so a digraph never
  // splits into two letters.
  const pool = plan.eldritch
    ? DREAD_POWER
    : BRIGHT_POWER.filter(({ word }) => word !== 'alu' && word !== 'ota');
  const base = pick(rng, pool).word;
  const tokens = tokenizeRunic(base);
  const words: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    words.push(tokens.slice(i).join(''));
  }
  return { words, gloss: `${capitalize(base)}, shrinking to a single rune.` };
}

function realizeTierOne(plan: FormulaPlan, rng: Rng): FormulaOutput {
  const power = pick(rng, plan.eldritch ? DREAD_POWER : BRIGHT_POWER);
  const gloss = plan.eldritch ? `${capitalize(power.word)}, ${power.gloss}.` : power.gloss;
  return { glyphs: runesFor(power.word), transliteration: power.word, gloss };
}

function realizeTierTwo(plan: FormulaPlan, rng: Rng): FormulaOutput {
  const distort = (root: string): string => (plan.eldritch ? eldritchRoot(root) : root);
  const clause = plan.clauses[0];
  if (clause === undefined) throw new Error('tier 2 plan has no clause');
  const intentField = requireField(clause.genes.find((g) => g.role === 'INTENT')?.field ?? null);
  const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);

  let verbPool: RunicRoot[];
  if (plan.school === 'protection' || plan.school === 'curse') {
    verbPool = verbsOf(intentField);
  } else {
    verbPool = byNames(INVOCATION_T2);
  }
  const intent = pick(rng, verbPool);
  const target = pick(rng, nounsOf(targetField));

  const words = [verbForm(distort(intent.root), 'bare'), nounForm(distort(target.root), 'an')];
  return {
    glyphs: words.map(runesFor).join(''),
    transliteration: words.join(' '),
    gloss: `${capitalize(intent.verb ?? '')} the ${target.noun ?? ''}!`,
  };
}

function realizeFormula(plan: FormulaPlan, rng: Rng): FormulaOutput {
  if (plan.difficulty === 1) return realizeTierOne(plan, rng);
  if (plan.difficulty === 2) return realizeTierTwo(plan, rng);

  const distort = (root: string): string => (plan.eldritch ? eldritchRoot(root) : root);
  const segments: Segment[] = [];
  const glossParts: string[] = [];

  const openings = pickOpenings(plan, rng);
  for (const idiom of openings) glossParts.push(idiom.gloss);
  const openingWords = openings.flatMap((idiom) => [...idiom.words]);

  plan.clauses.forEach((clause, index) => {
    // Epithets stay distinct within one clause. Across clauses the pools
    // reopen, litanies may echo a power already named.
    const usedEpithets = new Set<string>();
    let realized: ClauseRealization;
    if (plan.school === 'protection') {
      realized = realizeProtectionClause(clause, rng, distort);
    } else if (plan.school === 'curse') {
      realized = realizeCurseClause(clause, rng, distort);
    } else {
      realized = realizeInvocationClause(clause, rng, plan.eldritch, distort, usedEpithets);
    }
    // The opening idioms join the first clause with word separators, as in
    // the section 5 rendering. Only clause boundaries take the colon.
    segments.push({ words: index === 0 ? [...openingWords, ...realized.words] : realized.words });
    glossParts.push(realized.gloss);
  });

  const litany = litanySegment(plan, rng);
  if (litany !== null) {
    segments.push({ words: litany.words });
    glossParts.push(litany.gloss);
  }

  if (plan.closing) {
    for (const idiom of pickClosings(plan, rng)) {
      segments.push({ words: [...idiom.words] });
      glossParts.push(idiom.gloss);
    }
  }

  let sealCount: SealCount | null = null;
  if (plan.seal) {
    if (plan.eldritch) sealCount = 9;
    else if (plan.difficulty === 7) sealCount = pick(rng, [3, 7] as const);
    else if (plan.difficulty === 8) sealCount = pick(rng, [7, 9] as const);
    else sealCount = pick(rng, [9, 12] as const);
    glossParts.push(SEAL_GLOSS[sealCount]);
  }

  let glyphs = segments
    .map((segment) => segment.words.map(runesFor).join(WORD_SEP))
    .join(CLAUSE_SEP);
  let transliteration = segments.flatMap((segment) => segment.words).join(' ');
  if (sealCount !== null) {
    glyphs += `${CROSS_SEP}${SEAL_GLYPHS[sealCount]}${CROSS_SEP}`;
    transliteration += ` ${SEAL_WORDS[sealCount]}`;
  }

  return { glyphs, transliteration, gloss: glossParts.join(' ') };
}

export const runicGenome: Genome = {
  id: 'runic',
  realize: realizeFormula,
};
