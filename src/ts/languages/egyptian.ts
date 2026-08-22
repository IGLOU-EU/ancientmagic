// Egyptian genome rules: sign mapping, the Egyptological spoken derivation,
// morphology, the Eldritch register and the realization of a clause plan into
// the three aligned output lines. Every rule implements docs/genomes.md
// section 3.
//
// No English lives here. The genome decides which root fills which role and
// hands those choices to the gloss pack of the displayed language, which
// writes the sentence.

import { pick, type Rng } from '../generator/rng.js';
import type {
  ClausePlan,
  FormulaOutput,
  FormulaPlan,
  Genome,
  SemanticField,
} from '../generator/types.js';
import type {
  EgyptianAddress,
  EgyptianGlosses,
  GlossPack,
  GlossRef,
  RootForm,
} from '../glosses/types.js';
import {
  A14_ENEMY,
  AGENT_POWER,
  BRIGHT_POWER,
  DREAD_POWER,
  EO2_HEAD,
  FIELD_DET,
  FIELDS,
  FN_I,
  FN_IN,
  FN_IR,
  FN_M,
  FN_MY,
  FN_N,
  FN_R,
  G37_EVIL,
  IDIOM_WORDS,
  NUMERAL_WORDS,
  RN_I,
  RN_K,
  RX_I,
  RX_K,
  SEAL_HEAD,
  SIGN_MAP,
  SUFFIX_GLYPHS,
  SUFFIX_SKELETON,
  type DreadEpithet,
  type EgyptianIdiomId,
  type EgyptianRoot,
  type FixedWord,
  type PowerWord,
  type SealCount,
  type SuffixId,
} from './egyptian-data.js';

export {
  speakSkeleton,
  glyphsFor,
  joinSpoken,
  degradeSpoken,
  eldritchSkeleton,
  composeEgyptian,
};

// Signs the spoken line renders as a vowel (spec 3.2). w joins them only when
// the u rule fires, which is decided per occurrence.
const VOWEL_SIGNS = new Set(['A', 'a', 'i']);

// Spoken value of each sign, before the w rule and the e insertion.
const SPOKEN_VALUE: Readonly<Record<string, string>> = {
  A: 'a',
  i: 'i',
  y: 'y',
  a: 'a',
  w: 'w',
  b: 'b',
  p: 'p',
  f: 'f',
  m: 'm',
  n: 'n',
  r: 'r',
  h: 'h',
  H: 'h',
  x: 'kh',
  s: 's',
  S: 'sh',
  q: 'q',
  k: 'k',
  g: 'g',
  t: 't',
  T: 'tj',
  d: 'd',
  D: 'dj',
};

const VOWEL_LETTERS = new Set(['a', 'e', 'i', 'o', 'u']);

interface SpokenUnit {
  text: string;
  // A unit that never triggers the e insertion of spec 3.2. y is spoken as a
  // consonant but the lexicon never inserts an e beside it.
  soft: boolean;
}

function signs(skeleton: string): string[] {
  return Array.from(skeleton);
}

// The w rule of spec 3.2 asks whether the neighbouring signs are consonants,
// where y and w themselves count as consonants.
function isConsonantSign(sign: string | undefined): boolean {
  return sign !== undefined && !VOWEL_SIGNS.has(sign);
}

function spokenUnits(skeleton: string): SpokenUnit[] {
  const tokens = signs(skeleton);
  return tokens.map((sign, index) => {
    if (sign === 'w') {
      const wordFinal = index === tokens.length - 1;
      const between =
        index > 0 &&
        !wordFinal &&
        isConsonantSign(tokens[index - 1]) &&
        isConsonantSign(tokens[index + 1]);
      if (wordFinal || between) return { text: 'u', soft: true };
      return { text: 'w', soft: false };
    }
    const value = SPOKEN_VALUE[sign];
    if (value === undefined) {
      throw new Error(`sign outside the egyptian working set: ${sign} in ${skeleton}`);
    }
    return { text: value, soft: VOWEL_SIGNS.has(sign) || sign === 'y' };
  });
}

// Spoken form derived from a skeleton per spec 3.2, without the leading e of
// the one-letter function words.
function speakUnits(units: ReadonlyArray<SpokenUnit>): string {
  let out = '';
  units.forEach((unit, index) => {
    const previous = units[index - 1];
    if (previous !== undefined && !previous.soft && !unit.soft) out += 'e';
    out += unit.text;
  });
  return out;
}

function speakSkeleton(skeleton: string): string {
  const spoken = speakUnits(spokenUnits(skeleton));
  // A one-letter function word with no vowel gains a leading e (spec 3.2).
  const voweled = Array.from(spoken).some((letter) => VOWEL_LETTERS.has(letter));
  return voweled ? spoken : `e${spoken}`;
}

function endsInConsonant(spoken: string): boolean {
  const last = spoken.charAt(spoken.length - 1);
  return last !== '' && !VOWEL_LETTERS.has(last);
}

function startsWithConsonant(spoken: string): boolean {
  const first = spoken.charAt(0);
  return first !== '' && !VOWEL_LETTERS.has(first);
}

// Appends a suffix skeleton to an already spoken stem, inserting the e that
// spec 3.2 requires between two adjacent spoken consonants.
function joinSpoken(stem: string, suffixSkeleton: string): string {
  const tail = speakUnits(spokenUnits(suffixSkeleton));
  const bridge = endsInConsonant(stem) && startsWithConsonant(tail) ? 'e' : '';
  return `${stem}${bridge}${tail}`;
}

// Adjacent identical phonograms collapse within a word (spec 3.2). The spoken
// line is derived from the full skeleton, before the collapse.
function glyphsFor(skeleton: string): string {
  const out: string[] = [];
  for (const sign of signs(skeleton)) {
    const glyph = SIGN_MAP[sign];
    if (glyph === undefined) {
      throw new Error(`sign outside the egyptian working set: ${sign} in ${skeleton}`);
    }
    if (out[out.length - 1] !== glyph) out.push(glyph);
  }
  return out.join('');
}

// Eldritch rule 1: every content root gains a final x unless it already ends
// in x or q (spec 3.10).
function eldritchSkeleton(skeleton: string): string {
  const last = skeleton.charAt(skeleton.length - 1);
  return last === 'x' || last === 'q' ? skeleton : `${skeleton}x`;
}

// Eldritch rule 2: every inserted e becomes u, every non-initial a becomes o.
// Egyptian writes no vowels, so every vowel of the spoken line was inserted.
function degradeSpoken(spoken: string): string {
  return Array.from(spoken)
    .map((letter, index) => {
      if (letter === 'e') return 'u';
      if (letter === 'a' && index > 0) return 'o';
      return letter;
    })
    .join('');
}

export type EgyptianWordRole = 'content' | 'function' | 'idiom';

export interface EgyptianWord {
  role: EgyptianWordRole;
  glyphs: string;
  spoken: string;
  // Content words only: the determinative sequence that closes the phonograms
  // and the suffix pronoun signs that may follow it.
  determinatives: string;
  suffix: string;
  // The field whose determinative the word carries. An attributive adjective
  // copies the field of its head noun (spec 3.4).
  field: SemanticField | null;
}

function fixed(word: FixedWord): EgyptianWord {
  return { role: 'function', glyphs: word.glyphs, spoken: word.spoken, determinatives: '', suffix: '', field: null };
}

function idiomWord(word: FixedWord): EgyptianWord {
  return { role: 'idiom', glyphs: word.glyphs, spoken: word.spoken, determinatives: '', suffix: '', field: null };
}

interface ContentOptions {
  skeleton: string;
  spoken: string;
  field: SemanticField;
  eldritch: boolean;
  // Eldritch rule 3 marks verbs with the falling enemy and nouns with the
  // evil bird.
  verb: boolean;
  suffix?: SuffixId;
}

function contentWord(options: ContentOptions): EgyptianWord {
  const skeleton = options.eldritch ? eldritchSkeleton(options.skeleton) : options.skeleton;
  let spoken = options.spoken;
  if (skeleton !== options.skeleton) spoken = joinSpoken(spoken, 'x');
  if (options.suffix !== undefined) {
    spoken = joinSpoken(spoken, SUFFIX_SKELETON[options.suffix]);
  }
  if (options.eldritch) spoken = degradeSpoken(spoken);

  let determinatives = FIELD_DET[options.field];
  if (options.eldritch) determinatives += options.verb ? A14_ENEMY : G37_EVIL;
  const suffix = options.suffix === undefined ? '' : SUFFIX_GLYPHS[options.suffix];

  return {
    role: 'content',
    glyphs: glyphsFor(skeleton) + determinatives + suffix,
    spoken,
    determinatives,
    suffix,
    field: options.field,
  };
}

// A dread epithet is indeclinable and already ends in x, so it only takes the
// determinatives of the register: the enemy sign the corpus gives the
// adversary, then the evil bird of rule 3.
function dreadWord(epithet: DreadEpithet): EgyptianWord {
  const determinatives = A14_ENEMY + G37_EVIL;
  return {
    role: 'content',
    glyphs: glyphsFor(epithet.skeleton) + determinatives,
    spoken: epithet.spoken,
    determinatives,
    suffix: '',
    field: 'death',
  };
}

function powerWord(power: PowerWord): EgyptianWord {
  return {
    role: 'idiom',
    glyphs: power.glyphs,
    spoken: power.spoken,
    determinatives: '',
    suffix: '',
    field: null,
  };
}

function fills(root: EgyptianRoot, role: RootForm): boolean {
  return root.forms.includes(role);
}

function nounsOf(field: SemanticField): EgyptianRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'noun'));
}

function verbsOf(field: SemanticField): EgyptianRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'verb'));
}

function adjectivesOf(field: SemanticField): EgyptianRoot[] {
  return FIELDS[field].filter((r) => fills(r, 'adj'));
}

function requireField(field: SemanticField | null): SemanticField {
  if (field === null) throw new Error('gene is missing its semantic field');
  return field;
}

function geneField(clause: ClausePlan, role: 'INTENT' | 'TARGET' | 'AGENT'): SemanticField {
  return requireField(clause.genes.find((g) => g.role === role)?.field ?? null);
}

interface Realization {
  words: EgyptianWord[];
  gloss: string;
}

interface Modifier {
  adjective: EgyptianRoot | null;
  adverb: EgyptianRoot | null;
}

function drawModifier(clause: ClausePlan, rng: Rng): Modifier {
  const field = clause.modifierField;
  if (clause.modifier === null || field === null) return { adjective: null, adverb: null };
  if (clause.modifier === 'adjective') {
    return { adjective: pick(rng, adjectivesOf(field)), adverb: null };
  }
  return { adjective: null, adverb: pick(rng, nounsOf(field)) };
}

// The adverbial modifier is m plus a noun, placed at clause end (spec 3.4).
function adverbPhrase(
  modifier: Modifier,
  clause: ClausePlan,
  eldritch: boolean,
): { words: EgyptianWord[]; root: string | null } {
  const root = modifier.adverb;
  if (root === null || clause.modifierField === null) return { words: [], root: null };
  return {
    words: [
      fixed(FN_M),
      contentWord({
        skeleton: root.skeleton,
        spoken: root.spoken,
        field: clause.modifierField,
        eldritch,
        verb: false,
      }),
    ],
    root: root.skeleton,
  };
}

// An attributive adjective follows its noun and copies its determinative
// field (spec 3.4), so it is written with the head noun's field sign.
function adjectiveWord(
  modifier: Modifier,
  headField: SemanticField,
  eldritch: boolean,
): EgyptianWord[] {
  const root = modifier.adjective;
  if (root === null) return [];
  return [
    contentWord({
      skeleton: root.skeleton,
      spoken: root.spoken,
      field: headField,
      eldritch,
      verb: false,
    }),
  ];
}

function realizeProtectionClause(
  clause: ClausePlan,
  rng: Rng,
  usedPowers: Set<string>,
  glosses: EgyptianGlosses,
): Realization {
  const intent = pick(rng, verbsOf(geneField(clause, 'INTENT')));
  const targetField = geneField(clause, 'TARGET');
  const target = pick(rng, nounsOf(targetField));
  const modifier = drawModifier(clause, rng);
  const agent = pick(rng, AGENT_POWER.filter((p) => !usedPowers.has(p.skeleton)));
  usedPowers.add(agent.skeleton);
  const power = pick(rng, BRIGHT_POWER.filter((p) => !usedPowers.has(p.skeleton)));
  usedPowers.add(power.skeleton);
  const adverb = adverbPhrase(modifier, clause, false);

  const words: EgyptianWord[] = [
    contentWord({
      skeleton: intent.skeleton,
      spoken: intent.spoken,
      field: geneField(clause, 'INTENT'),
      eldritch: false,
      verb: true,
      suffix: 'i',
    }),
    fixed(FN_R),
    contentWord({
      skeleton: target.skeleton,
      spoken: target.spoken,
      field: targetField,
      eldritch: false,
      verb: false,
    }),
    ...adjectiveWord(modifier, targetField, false),
    fixed(FN_IN),
    powerWord(agent),
    powerWord(power),
    ...adverb.words,
  ];

  return {
    words,
    gloss: glosses.protectionClause({
      intentRoot: intent.skeleton,
      targetRoot: target.skeleton,
      adjectiveRoot: modifier.adjective?.skeleton ?? null,
      adverbRoot: adverb.root,
      agentPower: agent.skeleton,
      freePower: power.skeleton,
    }),
  };
}

function realizeCurseClause(
  clause: ClausePlan,
  rng: Rng,
  glosses: EgyptianGlosses,
): Realization {
  const targetField = geneField(clause, 'TARGET');
  const target = pick(rng, nounsOf(targetField));
  const intent = pick(rng, verbsOf('harm'));
  const modifier = drawModifier(clause, rng);
  const adverb = adverbPhrase(modifier, clause, false);

  const words: EgyptianWord[] = [
    fixed(FN_IR),
    contentWord({
      skeleton: target.skeleton,
      spoken: target.spoken,
      field: targetField,
      eldritch: false,
      verb: false,
    }),
    ...adjectiveWord(modifier, targetField, false),
    contentWord({
      skeleton: intent.skeleton,
      spoken: intent.spoken,
      field: 'harm',
      eldritch: false,
      verb: true,
      suffix: 'f',
    }),
    ...adverb.words,
  ];

  return {
    words,
    gloss: glosses.curseClause({
      targetRoot: target.skeleton,
      intentRoot: intent.skeleton,
      adjectiveRoot: modifier.adjective?.skeleton ?? null,
      adverbRoot: adverb.root,
    }),
  };
}

function realizeInvocationClause(
  clause: ClausePlan,
  rng: Rng,
  plan: FormulaPlan,
  used: Set<string>,
  glosses: EgyptianGlosses,
): Realization {
  const eldritch = plan.eldritch;
  const agentGenes = clause.genes.filter((g) => g.role === 'AGENT');
  // Spec 3.9 counts the AGENT chain in nouns: three at tier 8 (a head plus two
  // n-genitives), four at tier 9. The plan hands three AGENT genes at both
  // tiers, so tier 9 stacks one more epithet on the field of the last gene.
  const lastGene = agentGenes[agentGenes.length - 1];
  const chain =
    plan.difficulty >= 9 && lastGene !== undefined ? [...agentGenes, lastGene] : agentGenes;
  const words: EgyptianWord[] = [fixed(FN_I)];
  const agents: GlossRef[] = [];

  chain.forEach((gene, index) => {
    if (index > 0) words.push(fixed(FN_N));
    if (eldritch) {
      const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
      used.add(epithet.skeleton);
      words.push(dreadWord(epithet));
      agents.push({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken });
    } else {
      const field = requireField(gene.field);
      const root = pick(rng, nounsOf(field).filter((r) => !used.has(r.skeleton)));
      used.add(root.skeleton);
      words.push(
        contentWord({
          skeleton: root.skeleton,
          spoken: root.spoken,
          field,
          eldritch: false,
          verb: false,
        }),
      );
      agents.push({ kind: 'root', id: root.skeleton });
    }
  });

  // The Invocation order realizes INTENT with the fixed imperative my,
  // "come!" (spec 3.5), which is a function word and takes no determinative.
  words.push(fixed(FN_MY));

  let invoked: GlossRef;
  if (eldritch) {
    const power = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
    used.add(power.skeleton);
    words.push(dreadWord(power));
    invoked = { kind: 'epithet', id: power.skeleton, spoken: power.spoken };
  } else {
    const power = pick(rng, BRIGHT_POWER.filter((p) => !used.has(p.skeleton)));
    used.add(power.skeleton);
    words.push(powerWord(power));
    invoked = { kind: 'power', id: power.skeleton };
  }

  const modifier = drawModifier(clause, rng);
  const adverb = adverbPhrase(modifier, clause, eldritch);
  words.push(...adverb.words);

  return {
    words,
    gloss: glosses.invocationClause({ agents, adverbRoot: adverb.root, power: invoked }),
  };
}

function openingWords(
  plan: FormulaPlan,
  rng: Rng,
  used: Set<string>,
  glosses: EgyptianGlosses,
): Realization {
  const words: EgyptianWord[] = [];
  const glossParts: string[] = [];
  const difficulty = plan.difficulty;

  const pushIdiom = (id: EgyptianIdiomId): void => {
    for (const word of IDIOM_WORDS[id]) words.push(idiomWord(word));
    glossParts.push(glosses.idiom(id));
  };

  // EO2 keeps its shape under the register but its topic noun always comes
  // from the dread pool (spec 3.10).
  const pushTitle = (): void => {
    for (const word of EO2_HEAD) words.push(idiomWord(word));
    if (plan.eldritch) {
      const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
      used.add(epithet.skeleton);
      words.push(dreadWord(epithet));
      glossParts.push(
        glosses.spellTitle({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken }),
      );
      return;
    }
    const clause = plan.clauses[0];
    const gene =
      clause?.genes.find((g) => g.role === 'TARGET') ?? clause?.genes.find((g) => g.role === 'AGENT');
    const field = requireField(gene?.field ?? null);
    const root = pick(rng, nounsOf(field));
    words.push(
      contentWord({
        skeleton: root.skeleton,
        spoken: root.spoken,
        field,
        eldritch: false,
        verb: false,
      }),
    );
    glossParts.push(glosses.spellTitle({ kind: 'root', id: root.skeleton }));
  };

  if (difficulty <= 4) {
    pushTitle();
  } else if (difficulty <= 7) {
    pushIdiom(plan.eldritch ? 'ELDRITCH_OPEN' : 'EO1');
  } else {
    pushIdiom(plan.eldritch ? 'ELDRITCH_OPEN' : 'EO1');
    pushTitle();
  }

  return { words, gloss: glosses.sentences(glossParts) };
}

// EO3, the gate spell address. The register inverts it: the gatekeeper knows
// the caster, not the reverse (spec 3.10).
function nameKnowledgeLine(
  plan: FormulaPlan,
  address: EgyptianWord[],
  addressed: EgyptianAddress,
  glosses: EgyptianGlosses,
): Realization {
  const words: EgyptianWord[] = [fixed(FN_I), ...address];
  words.push(...(plan.eldritch ? [fixed(RX_K), fixed(RN_I)] : [fixed(RX_I), fixed(RN_K)]));
  return { words, gloss: glosses.nameKnowledge(addressed, plan.eldritch) };
}

function singleAddress(
  plan: FormulaPlan,
  rng: Rng,
  used: Set<string>,
  glosses: EgyptianGlosses,
): Realization | null {
  if (plan.school === 'curse') return null;
  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
    used.add(epithet.skeleton);
    return nameKnowledgeLine(
      plan,
      [dreadWord(epithet)],
      { kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken },
      glosses,
    );
  }
  if (plan.school === 'protection') {
    const god = pick(rng, AGENT_POWER);
    return nameKnowledgeLine(plan, [powerWord(god)], { kind: 'power', id: god.skeleton }, glosses);
  }
  const field = requireField(plan.clauses[0]?.genes.find((g) => g.role === 'AGENT')?.field ?? null);
  const root = pick(rng, nounsOf(field));
  return nameKnowledgeLine(
    plan,
    [
      contentWord({
        skeleton: root.skeleton,
        spoken: root.spoken,
        field,
        eldritch: false,
        verb: false,
      }),
    ],
    { kind: 'root', id: root.skeleton },
    glosses,
  );
}

// The tier 8 and 9 litany: three EO3 addresses to coined gate names, a
// gates-field noun joined by n to a night or death noun (spec 3.9). The three
// head nouns of one litany must differ.
function gateLitany(
  plan: FormulaPlan,
  rng: Rng,
  used: Set<string>,
  glosses: EgyptianGlosses,
): Realization {
  const words: EgyptianWord[] = [];
  const glossParts: string[] = [];
  const heads = new Set<string>();

  for (let i = 0; i < 3; i += 1) {
    if (plan.eldritch) {
      const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
      used.add(epithet.skeleton);
      const line = nameKnowledgeLine(
        plan,
        [dreadWord(epithet)],
        { kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken },
        glosses,
      );
      words.push(...line.words);
      glossParts.push(line.gloss);
      continue;
    }
    const head = pick(rng, nounsOf('gates').filter((r) => !heads.has(r.skeleton)));
    heads.add(head.skeleton);
    const tailField = pick(rng, ['night', 'death'] as const);
    const tail = pick(rng, nounsOf(tailField));
    const line = nameKnowledgeLine(
      plan,
      [
        contentWord({
          skeleton: head.skeleton,
          spoken: head.spoken,
          field: 'gates',
          eldritch: false,
          verb: false,
        }),
        fixed(FN_N),
        contentWord({
          skeleton: tail.skeleton,
          spoken: tail.spoken,
          field: tailField,
          eldritch: false,
          verb: false,
        }),
      ],
      { kind: 'gate', headRoot: head.skeleton, tailRoot: tail.skeleton },
      glosses,
    );
    words.push(...line.words);
    glossParts.push(line.gloss);
  }

  return { words, gloss: glosses.sentences(glossParts) };
}

function closingIdioms(plan: FormulaPlan): EgyptianIdiomId[] {
  if (plan.eldritch) return ['ELDRITCH_CLOSE'];
  if (plan.difficulty <= 6) return ['EC2'];
  if (plan.difficulty <= 8) return ['EC1'];
  return ['EC1', 'EC2'];
}

function sealCountFor(plan: FormulaPlan, rng: Rng): SealCount {
  if (plan.eldritch) return 9;
  if (plan.difficulty === 7) return pick(rng, [2, 4] as const);
  if (plan.difficulty === 8) return 7;
  return pick(rng, [9, 12] as const);
}

function realizeTierOne(plan: FormulaPlan, rng: Rng, glosses: EgyptianGlosses): Realization {
  if (plan.eldritch) {
    const epithet = pick(rng, DREAD_POWER);
    return {
      words: [dreadWord(epithet)],
      gloss: glosses.tierOne({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken }),
    };
  }
  const power = pick(rng, BRIGHT_POWER);
  return {
    words: [powerWord(power)],
    gloss: glosses.tierOne({ kind: 'power', id: power.skeleton }),
  };
}

function realizeTierTwo(plan: FormulaPlan, rng: Rng, glosses: EgyptianGlosses): Realization {
  const clause = plan.clauses[0];
  if (clause === undefined) throw new Error('tier 2 plan has no clause');
  const intentField = geneField(clause, 'INTENT');
  const targetField = geneField(clause, 'TARGET');
  const intent = pick(rng, verbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));

  return {
    words: [
      contentWord({
        skeleton: intent.skeleton,
        spoken: intent.spoken,
        field: intentField,
        eldritch: plan.eldritch,
        verb: true,
      }),
      contentWord({
        skeleton: target.skeleton,
        spoken: target.spoken,
        field: targetField,
        eldritch: plan.eldritch,
        verb: false,
      }),
    ],
    gloss: glosses.tierTwo(intent.skeleton, target.skeleton),
  };
}

function composeEgyptian(plan: FormulaPlan, rng: Rng, glosses: EgyptianGlosses): Realization {
  if (plan.difficulty === 1) return realizeTierOne(plan, rng, glosses);
  if (plan.difficulty === 2) return realizeTierTwo(plan, rng, glosses);

  const words: EgyptianWord[] = [];
  const glossParts: string[] = [];
  // Powers and epithets stay distinct across one formula so the same god is
  // never both the invoked agent and the free power word.
  const used = new Set<string>();

  const opening = openingWords(plan, rng, used, glosses);
  words.push(...opening.words);
  glossParts.push(opening.gloss);

  if (plan.difficulty >= 8) {
    const litany = gateLitany(plan, rng, used, glosses);
    words.push(...litany.words);
    glossParts.push(litany.gloss);
  } else if (plan.difficulty >= 6) {
    const address = singleAddress(plan, rng, used, glosses);
    if (address !== null) {
      words.push(...address.words);
      glossParts.push(address.gloss);
    }
  }

  for (const clause of plan.clauses) {
    const clauseUsed = new Set<string>(used);
    let realized: Realization;
    if (plan.school === 'protection') {
      realized = realizeProtectionClause(clause, rng, clauseUsed, glosses);
    } else if (plan.school === 'curse') {
      realized = realizeCurseClause(clause, rng, glosses);
    } else {
      realized = realizeInvocationClause(clause, rng, plan, clauseUsed, glosses);
    }
    words.push(...realized.words);
    glossParts.push(realized.gloss);
  }

  if (plan.closing) {
    for (const id of closingIdioms(plan)) {
      for (const word of IDIOM_WORDS[id]) words.push(idiomWord(word));
      glossParts.push(glosses.idiom(id));
    }
  }

  if (plan.seal) {
    const count = sealCountFor(plan, rng);
    words.push(idiomWord(SEAL_HEAD));
    for (const numeral of NUMERAL_WORDS[count]) words.push(idiomWord(numeral));
    glossParts.push(glosses.seal(count));
  }

  return { words, gloss: glosses.sentences(glossParts) };
}

function realizeFormula(plan: FormulaPlan, rng: Rng, pack: GlossPack): FormulaOutput {
  const { words, gloss } = composeEgyptian(plan, rng, pack.egyptian);
  return {
    // The script runs continuous at every difficulty, word boundaries show
    // only through the determinatives (spec 3.2).
    glyphs: words.map((word) => word.glyphs).join(''),
    transliteration: words.map((word) => word.spoken).join(' '),
    gloss,
  };
}

export const egyptianGenome: Genome = {
  id: 'egyptian',
  realize: realizeFormula,
};
