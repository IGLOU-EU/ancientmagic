// Shared sweep helpers for the contract tests.

import { generate } from '../src/ts/generator/pipeline.js';
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
  type LanguageId,
  type School,
} from '../src/ts/generator/types.js';
import { MAX_DIFFICULTY, MIN_DIFFICULTY } from '../src/ts/generator/pipeline.js';
import { parseGlyphs } from './spec.js';

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

export function sweepGreek(
  schools: ReadonlyArray<School>,
  cb: (out: FormulaOutput, school: School, difficulty: number, seed: number) => void,
): void {
  for (const school of schools) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        cb(greek(school, difficulty, seed), school, difficulty, seed);
      }
    }
  }
}

export function sweep(
  schools: ReadonlyArray<School>,
  cb: (out: FormulaOutput, school: School, difficulty: number, seed: number) => void,
): void {
  for (const school of schools) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        cb(runic(school, difficulty, seed), school, difficulty, seed);
      }
    }
  }
}

export function sweepEgyptian(
  schools: ReadonlyArray<School>,
  cb: (out: FormulaOutput, school: School, difficulty: number, seed: number) => void,
): void {
  for (const school of schools) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        cb(egyptian(school, difficulty, seed), school, difficulty, seed);
      }
    }
  }
}

export function sweepPhoenician(
  schools: ReadonlyArray<School>,
  cb: (out: FormulaOutput, school: School, difficulty: number, seed: number) => void,
): void {
  for (const school of schools) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        cb(phoenician(school, difficulty, seed), school, difficulty, seed);
      }
    }
  }
}

// Rebuilds the word list behind a Phoenician formula, so the contract tests
// can read each word's kind and its vocalized romanization.
export function phoenicianWords(
  school: School,
  difficulty: number,
  seed: number,
): PhoenicianWord[] {
  const level = Math.min(9, Math.max(1, Math.trunc(difficulty)));
  const rng = mulberry32(seed >>> 0);
  const plan = buildPlan(school, level, rng);
  return composePhoenician(plan, rng, phoenicianGlosses).words;
}

// Rebuilds the word list behind an Egyptian formula. The script carries no
// separator, so the contract tests read the genome's own word seam.
export function egyptianWords(
  school: School,
  difficulty: number,
  seed: number,
): EgyptianWord[] {
  const level = Math.min(9, Math.max(1, Math.trunc(difficulty)));
  const rng = mulberry32(seed >>> 0);
  const plan = buildPlan(school, level, rng);
  return composeEgyptian(plan, rng, egyptianGlosses).words;
}

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
