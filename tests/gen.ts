// Shared bench for the contract tests: what to sweep, what writes it, and the
// few readings every suite takes on a sweep point.

import {
  clampDifficulty,
  generate,
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
} from '../src/ts/generator/pipeline.js';
import { buildPlan } from '../src/ts/generator/plan.js';
import { mulberry32 } from '../src/ts/generator/rng.js';
import { egyptianGlosses } from '../src/ts/glosses/en/egyptian.js';
import { phoenicianGlosses } from '../src/ts/glosses/en/phoenician.js';
import { runicGlosses } from '../src/ts/glosses/en/runic.js';
import { composeEgyptian, egyptianGenome, type EgyptianWord } from '../src/ts/languages/egyptian.js';
import {
  composePhoenician,
  phoenicianGenome,
  type PhoenicianWord,
} from '../src/ts/languages/phoenician.js';
import { bindGenome } from '../src/ts/languages/index.js';
import { greekGenome } from '../src/ts/languages/greek.js';
import { greekGlosses } from '../src/ts/glosses/en/greek.js';
import { runicGenome } from '../src/ts/languages/runic.js';
import {
  SCHOOLS,
  type BoundGenome,
  type FormulaOutput,
  type FormulaPlan,
  type LanguageId,
  type School,
} from '../src/ts/generator/types.js';
import { DREAD_SPOKEN as EGYPTIAN_DREAD } from './egyptian-spec.js';
import { DREAD_WORDS as GREEK_DREAD } from './greek-spec.js';
import { DREAD_SPOKEN as PHOENICIAN_DREAD } from './phoenician-spec.js';
import { DREAD_EPITHETS as RUNIC_DREAD, parseGlyphs } from './runic-spec.js';

// The sweeps run the schools the site teaches, so a school reaches the contract
// tests the day it is declared, without a test edit that could forget it.
export const ALL_SCHOOLS = SCHOOLS;

// The schools built on the base tier table of each genome: clear register,
// openers and closers of section N.9. Divination reads against its own table
// (section N.11) and is swept by its own assertions.
export const BRIGHT_SCHOOLS: ReadonlyArray<School> = [
  'protection',
  'curse',
  'invocation',
];

// Every tier the pipeline reads, so widening the range widens the sweep.
export const DIFFICULTIES: ReadonlyArray<number> = Array.from(
  { length: MAX_DIFFICULTY - MIN_DIFFICULTY + 1 },
  (_unused, index) => MIN_DIFFICULTY + index,
);

export const SEEDS: ReadonlyArray<number> = [7, 1234, 987654321];

// Names the sweep point a failure was found at, so a message says which of the
// hundreds of formulas behind an assertion is the one that broke.
export const label = (school: string, difficulty: number, seed: number): string =>
  `${school} d${difficulty} seed ${seed}`;

// The dread words each script keeps out of the schools that never take one,
// transcribed from the spec next to the writer that must never emit one. Keyed
// by the shipped set, so a genome added to the site is swept here or fails to
// compile.
export const DREAD: Readonly<Record<LanguageId, ReadonlyArray<string>>> = {
  runic: RUNIC_DREAD,
  egyptian: EGYPTIAN_DREAD,
  phoenician: PHOENICIAN_DREAD,
  greek: GREEK_DREAD,
};

// The contract tests read the English gloss, so each genome is bound to the
// English slice of its own script, once, here. Nothing falls back to a default
// language, and nothing is loaded on demand: the page fetches a pair when a
// reader asks for one, a test bench has every pair from the start.
//
// The bound genomes are exported, not only written through, because a test
// about what a script declares (its separators, for one) asks the genome
// rather than a transcription of it.
export const GENOMES: Readonly<Record<LanguageId, BoundGenome>> = {
  runic: bindGenome(runicGenome, runicGlosses),
  egyptian: bindGenome(egyptianGenome, egyptianGlosses),
  phoenician: bindGenome(phoenicianGenome, phoenicianGlosses),
  greek: bindGenome(greekGenome, greekGlosses),
};

export function runic(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate(GENOMES.runic, { language: 'runic', school, difficulty }, seed);
}

export function egyptian(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate(GENOMES.egyptian, { language: 'egyptian', school, difficulty }, seed);
}

export function phoenician(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate(GENOMES.phoenician, { language: 'phoenician', school, difficulty }, seed);
}

export function greek(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate(GENOMES.greek, { language: 'greek', school, difficulty }, seed);
}

export type Writer = (school: School, difficulty: number, seed: number) => FormulaOutput;

// Every shipped genome behind the writer this bench uses for it, keyed by the
// shipped set itself. A test that sweeps all of them builds its table from
// here instead of naming the genomes again, and a genome the site carries
// cannot go unswept: leaving it out is a compile error.
export const WRITERS: Readonly<Record<LanguageId, Writer>> = {
  runic,
  egyptian,
  phoenician,
  greek,
};

// Greek writes one flat word list, joined by the ano teleia from tier 3 up, so
// its words are read off the transliteration like the Runic ones.
export function greekWords(school: School, difficulty: number, seed: number): string[] {
  return greek(school, difficulty, seed).transliteration.split(' ');
}

export type Sweep = (
  schools: ReadonlyArray<School>,
  cb: (out: FormulaOutput, school: School, difficulty: number, seed: number) => void,
) => void;

// The sweep a genome's suite runs: the schools it is given, crossed with every
// tier and every seed. One shape for the four, so widening the bench widens all
// of them at once.
function sweeper(write: Writer): Sweep {
  return (schools, cb) => {
    for (const school of schools) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          cb(write(school, difficulty, seed), school, difficulty, seed);
        }
      }
    }
  };
}

export const sweep: Sweep = sweeper(runic);
export const sweepEgyptian: Sweep = sweeper(egyptian);
export const sweepPhoenician: Sweep = sweeper(phoenician);
export const sweepGreek: Sweep = sweeper(greek);

// The clause plan a seed and a school produce, for the assertions that read a
// formula's structure before any script has written it. The pipeline's own
// clamp is used rather than a repeat of it, so the bench and the page enter the
// planner on the same tier.
export function plan(school: School, difficulty: number, seed: number): FormulaPlan {
  return buildPlan(school, clampDifficulty(difficulty), mulberry32(seed >>> 0));
}

// Rebuilds the word list behind a Phoenician formula, so the contract tests
// can read each word's kind and its vocalized romanization.
export function phoenicianWords(
  school: School,
  difficulty: number,
  seed: number,
): PhoenicianWord[] {
  const rng = mulberry32(seed >>> 0);
  const built = buildPlan(school, clampDifficulty(difficulty), rng);
  return composePhoenician(built, rng, phoenicianGlosses).words;
}

// Rebuilds the word list behind an Egyptian formula. The script carries no
// separator, so the contract tests read the genome's own word seam.
export function egyptianWords(
  school: School,
  difficulty: number,
  seed: number,
): EgyptianWord[] {
  const rng = mulberry32(seed >>> 0);
  const built = buildPlan(school, clampDifficulty(difficulty), rng);
  return composeEgyptian(built, rng, egyptianGlosses).words;
}

// How many school clauses a tier carries, transcribed from the tier tables of
// docs/genomes.md, which give every genome the same three steps. Held here
// rather than read off generator/plan.ts: a contract test that asked the
// planner how many clauses to expect would be checking it against itself.
export function clauseCount(difficulty: number): number {
  if (difficulty <= 5) return 1;
  if (difficulty <= 7) return 2;
  return 3;
}

// Groups the transliteration words to mirror the glyph segments. The final
// numeral word is returned separately when a seal is present.
export function alignSegments(out: FormulaOutput): {
  segments: string[][];
  sealWord: string | null;
} {
  const { segments, seal } = parseGlyphs(out.glyphs);
  const words = out.transliteration.split(' ');
  const glyphWordCount = segments.reduce((n, seg) => n + seg.length, 0);
  const sealWord = seal !== null ? (words[words.length - 1] ?? null) : null;
  const bodyWords = seal !== null ? words.slice(0, -1) : words;
  if (bodyWords.length !== glyphWordCount) {
    throw new Error(
      `word count mismatch: ${bodyWords.length} transliterated vs ${glyphWordCount} glyph words`,
    );
  }
  let index = 0;
  const grouped = segments.map((seg) => {
    const group = bodyWords.slice(index, index + seg.length);
    index += seg.length;
    return group;
  });
  return { segments: grouped, sealWord };
}
