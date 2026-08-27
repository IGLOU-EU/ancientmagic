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
import type { GlossRef, RootForm } from '../glosses/types.js';
import type { EgyptianAddress, EgyptianGlosses } from './egyptian-glosses.js';
import {
  A14_ENEMY,
  AGENT_POWER,
  BRIGHT_POWER,
  DIRECTION_WORDS,
  DIVINATION_POWER,
  DREAD_POWER,
  EC5_HEAD,
  EO2_HEAD,
  FIELD_DET,
  FIELDS,
  FN_I,
  FN_IN,
  FN_INIW,
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

// Spec 3.9 counts the AGENT chain in nouns, a head plus its n-genitives. The
// Divination head is the divine name, and the chain only grows at the top two
// tiers, where the litany gives it something to hang on.
function divinationGenitives(difficulty: number): number {
  if (difficulty >= 9) return 3;
  if (difficulty >= 8) return 2;
  return 0;
}

// The asking clause opens on the particle in-iw, then the verb in its bare
// form, then the divine name as a full noun subject, then the object. It
// carries no suffix pronoun and no in agent phrase (spec 3.11).
function realizeDivinationAsk(
  plan: FormulaPlan,
  clause: ClausePlan,
  rng: Rng,
  questioned: PowerWord,
  glosses: EgyptianGlosses,
): Realization {
  const intentField = geneField(clause, 'INTENT');
  const targetField = geneField(clause, 'TARGET');
  const chainField = geneField(clause, 'AGENT');
  const intent = pick(rng, verbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));
  const modifier = drawModifier(clause, rng);
  const adverb = adverbPhrase(modifier, clause, false);

  const words: EgyptianWord[] = [
    fixed(FN_INIW),
    contentWord({
      skeleton: intent.skeleton,
      spoken: intent.spoken,
      field: intentField,
      eldritch: false,
      verb: true,
    }),
    powerWord(questioned),
  ];

  const chainRoots: string[] = [];
  const used = new Set<string>();
  for (let i = 0; i < divinationGenitives(plan.difficulty); i += 1) {
    const root = pick(rng, nounsOf(chainField).filter((r) => !used.has(r.skeleton)));
    used.add(root.skeleton);
    words.push(fixed(FN_N));
    words.push(
      contentWord({
        skeleton: root.skeleton,
        spoken: root.spoken,
        field: chainField,
        eldritch: false,
        verb: false,
      }),
    );
    chainRoots.push(root.skeleton);
  }

  words.push(
    contentWord({
      skeleton: target.skeleton,
      spoken: target.spoken,
      field: targetField,
      eldritch: false,
      verb: false,
    }),
    ...adjectiveWord(modifier, targetField, false),
    ...adverb.words,
  );

  return {
    words,
    gloss: glosses.divinationAsk({
      agentPower: questioned.skeleton,
      chainRoots,
      intentRoot: intent.skeleton,
      targetRoot: target.skeleton,
      adjectiveRoot: modifier.adjective?.skeleton ?? null,
      adverbRoot: adverb.root,
    }),
  };
}

// The seeing clause is the sedjem-ef of Protection: the verb, the =i suffix,
// the object, and no nominal subject at all (spec 3.11).
function realizeDivinationSee(
  clause: ClausePlan,
  rng: Rng,
  glosses: EgyptianGlosses,
): Realization {
  const intentField = geneField(clause, 'INTENT');
  const targetField = geneField(clause, 'TARGET');
  const intent = pick(rng, verbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));
  const modifier = drawModifier(clause, rng);
  const adverb = adverbPhrase(modifier, clause, false);

  const words: EgyptianWord[] = [
    contentWord({
      skeleton: intent.skeleton,
      spoken: intent.spoken,
      field: intentField,
      eldritch: false,
      verb: true,
      suffix: 'i',
    }),
    contentWord({
      skeleton: target.skeleton,
      spoken: target.spoken,
      field: targetField,
      eldritch: false,
      verb: false,
    }),
    ...adjectiveWord(modifier, targetField, false),
    ...adverb.words,
  ];

  return {
    words,
    gloss: glosses.divinationSee({
      intentRoot: intent.skeleton,
      targetRoot: target.skeleton,
      adjectiveRoot: modifier.adjective?.skeleton ?? null,
      adverbRoot: adverb.root,
    }),
  };
}

// Spec 3.12. The crossing clause is the bare imperative with its direction
// straight behind it, verb initial as this genome always is. The binding
// clause is the sedjem-en-ef, the form that states a thing done.
function realizeChronomancyClause(
  clause: ClausePlan,
  rng: Rng,
  glosses: EgyptianGlosses,
): Realization {
  const intentField = geneField(clause, 'INTENT');
  const targetField = geneField(clause, 'TARGET');
  const intent = pick(rng, verbsOf(intentField));
  const target = pick(rng, nounsOf(targetField));
  const modifier = drawModifier(clause, rng);
  const adverb = adverbPhrase(modifier, clause, false);
  const crossing = clause.kind === 'crossing';

  const words: EgyptianWord[] = [
    contentWord({
      skeleton: intent.skeleton,
      spoken: intent.spoken,
      field: intentField,
      eldritch: false,
      verb: true,
      // The school names no god, so the caster rides the verb in a binding
      // clause and nothing rides it in a command.
      ...(crossing ? {} : { suffix: 'n.i' as const }),
    }),
  ];

  const direction = clause.direction;
  if (crossing) {
    if (direction === null) throw new Error('a crossing clause carries no direction');
    words.push(fixed(DIRECTION_WORDS[direction]));
  }

  words.push(
    contentWord({
      skeleton: target.skeleton,
      spoken: target.spoken,
      field: targetField,
      eldritch: false,
      verb: false,
    }),
    ...adjectiveWord(modifier, targetField, false),
    ...adverb.words,
  );

  const parts = {
    intentRoot: intent.skeleton,
    targetRoot: target.skeleton,
    adjectiveRoot: modifier.adjective?.skeleton ?? null,
    adverbRoot: adverb.root,
  };

  return {
    words,
    gloss:
      crossing && direction !== null
        ? glosses.chronomancyCross({ ...parts, direction })
        : glosses.chronomancyBind(parts),
  };
}

// EC5, the return anchor: prt m plus a time-field noun, with a second noun
// behind the genitive n at tier 9 (spec 3.6).
function returnAnchor(plan: FormulaPlan, rng: Rng, glosses: EgyptianGlosses): Realization {
  const anchor = pick(rng, nounsOf('time'));
  const words: EgyptianWord[] = [
    ...EC5_HEAD.map(idiomWord),
    contentWord({
      skeleton: anchor.skeleton,
      spoken: anchor.spoken,
      field: 'time',
      eldritch: false,
      verb: false,
    }),
  ];
  let genitive: string | null = null;
  if (plan.difficulty >= 9) {
    const held = pick(rng, nounsOf('time').filter((r) => r.skeleton !== anchor.skeleton));
    genitive = held.skeleton;
    words.push(fixed(FN_N));
    words.push(
      contentWord({
        skeleton: held.skeleton,
        spoken: held.spoken,
        field: 'time',
        eldritch: false,
        verb: false,
      }),
    );
  }
  return { words, gloss: glosses.returnAnchor(anchor.skeleton, genitive) };
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
    // The Divination title noun comes from the signs field, so the spell is
    // titled by what it reads (spec 3.11). That field is the asking clause's
    // own AGENT, which is where the genome looks for it.
    const gene =
      plan.school === 'divination'
        ? clause?.genes.find((g) => g.role === 'AGENT')
        : clause?.genes.find((g) => g.role === 'TARGET') ??
          clause?.genes.find((g) => g.role === 'AGENT');
    // A chronomantic spell is titled by the stretch of time it works on, so
    // its title noun comes from time whatever the clause acts on (spec 3.12).
    const field = plan.school === 'chronomancy' ? 'time' : requireField(gene?.field ?? null);
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

  // The dream opener carries the school on its own up to tier 7, where the
  // title line and the oracle litany take over (spec 3.11). Chronomancy reads
  // against the base table, its title line naming a stretch of time.
  if (plan.school === 'divination') {
    if (difficulty <= 7) {
      pushIdiom('EO4');
    } else {
      pushIdiom('EO1');
      pushTitle();
    }
  } else if (difficulty <= 4) {
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
  questioned: PowerWord | null,
): Realization | null {
  if (plan.school === 'curse') return null;
  // Chronomancy names no god at all, so the one address of tiers 6 and 7 is
  // an hour-gate, the same shape the litany builds (spec 3.12).
  if (plan.school === 'chronomancy') {
    const line = gateLitany(plan, rng, used, glosses, 1);
    return { words: line.words, gloss: line.gloss };
  }
  // Divination addresses the power it is about to question, and no other.
  if (questioned !== null) {
    return nameKnowledgeLine(
      plan,
      [powerWord(questioned)],
      { kind: 'power', id: questioned.skeleton },
      glosses,
    );
  }
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
  count = 3,
): Realization {
  const words: EgyptianWord[] = [];
  const glossParts: string[] = [];
  const heads = new Set<string>();

  for (let i = 0; i < count; i += 1) {
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
    // Divination reads its litany instead of passing through it: an oracle
    // name is a signs or sight head over a fate or time noun (spec 3.11).
    // Chronomancy crosses it: an hour-gate is a gates head over a time noun,
    // which is the Book of Gates rather than the Book of the Dead (3.12).
    const divination = plan.school === 'divination';
    const headField = divination ? pick(rng, ['signs', 'sight'] as const) : 'gates';
    const head = pick(rng, nounsOf(headField).filter((r) => !heads.has(r.skeleton)));
    heads.add(head.skeleton);
    const tailField = divination
      ? pick(rng, ['fate', 'time'] as const)
      : plan.school === 'chronomancy'
        ? 'time'
        : pick(rng, ['night', 'death'] as const);
    const tail = pick(rng, nounsOf(tailField));
    const line = nameKnowledgeLine(
      plan,
      [
        contentWord({
          skeleton: head.skeleton,
          spoken: head.spoken,
          field: headField,
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
  // The colophon closes the question at every tier it appears, and the
  // justification stacks behind it at the last one (spec 3.11).
  if (plan.school === 'divination') {
    return plan.difficulty >= 9 ? ['EC4', 'EC2'] : ['EC4'];
  }
  // The return anchor is built rather than listed, so Chronomancy's closer
  // list holds only what stacks behind it (spec 3.12).
  if (plan.school === 'chronomancy') return plan.difficulty >= 9 ? ['EC1'] : [];
  if (plan.difficulty <= 6) return ['EC2'];
  if (plan.difficulty <= 8) return ['EC1'];
  return ['EC1', 'EC2'];
}

function sealCountFor(plan: FormulaPlan, rng: Rng): SealCount {
  if (plan.eldritch) return 9;
  // The tier 7 divination seal is two and never another count: the oracle
  // received its question on two tickets (spec 3.11).
  if (plan.difficulty === 7 && plan.school === 'divination') return 2;
  // Twelve at tiers 7 and 8, for the twelve hours the barque passes. Only
  // tier 9 chooses (spec 3.12).
  if (plan.school === 'chronomancy') {
    return plan.difficulty <= 8 ? 12 : pick(rng, [9, 12] as const);
  }
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

  // One power is questioned per formula, named by the address that precedes
  // the question and by the question itself, so it is drawn before either.
  const questioned = plan.school === 'divination' ? pick(rng, DIVINATION_POWER) : null;
  if (questioned !== null) used.add(questioned.skeleton);

  const opening = openingWords(plan, rng, used, glosses);
  words.push(...opening.words);
  glossParts.push(opening.gloss);

  if (plan.difficulty >= 8) {
    // The chronomantic litany grows to four hour-gates at tier 9, where the
    // other schools keep three (spec 3.12).
    const gates = plan.school === 'chronomancy' && plan.difficulty >= 9 ? 4 : 3;
    const litany = gateLitany(plan, rng, used, glosses, gates);
    words.push(...litany.words);
    glossParts.push(litany.gloss);
  } else if (plan.difficulty >= 6) {
    const address = singleAddress(plan, rng, used, glosses, questioned);
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
    } else if (questioned !== null) {
      realized =
        clause.kind === 'asking'
          ? realizeDivinationAsk(plan, clause, rng, questioned, glosses)
          : realizeDivinationSee(clause, rng, glosses);
    } else if (plan.school === 'chronomancy') {
      realized = realizeChronomancyClause(clause, rng, glosses);
    } else {
      realized = realizeInvocationClause(clause, rng, plan, clauseUsed, glosses);
    }
    words.push(...realized.words);
    glossParts.push(realized.gloss);
  }

  if (plan.closing) {
    if (plan.school === 'chronomancy') {
      const anchor = returnAnchor(plan, rng, glosses);
      words.push(...anchor.words);
      glossParts.push(anchor.gloss);
    }
    for (const id of closingIdioms(plan)) {
      for (const word of IDIOM_WORDS[id]) words.push(idiomWord(word));
      glossParts.push(glosses.idiom(id));
    }
  }

  if (plan.seal) {
    const count = sealCountFor(plan, rng);
    words.push(idiomWord(SEAL_HEAD));
    for (const numeral of NUMERAL_WORDS[count]) words.push(idiomWord(numeral));
    // Chronomancy reads the count as a depth in time (spec 1.6).
    glossParts.push(
      plan.school === 'chronomancy' ? glosses.sealDepth(count) : glosses.seal(count),
    );
  }

  return { words, gloss: glosses.sentences(glossParts) };
}

function realizeFormula(plan: FormulaPlan, rng: Rng, glosses: EgyptianGlosses): FormulaOutput {
  const { words, gloss } = composeEgyptian(plan, rng, glosses);
  return {
    // The script runs continuous at every difficulty, word boundaries show
    // only through the determinatives (spec 3.2).
    glyphs: words.map((word) => word.glyphs).join(''),
    transliteration: words.map((word) => word.spoken).join(' '),
    gloss,
  };
}

export const egyptianGenome: Genome<EgyptianGlosses> = {
  id: 'egyptian',
  // The script writes continuously, with nothing standing between its words.
  separators: [],
  realize: realizeFormula,
};
