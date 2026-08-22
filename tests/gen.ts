// Shared sweep helpers for the contract tests.

import { generate } from '../src/ts/generator/pipeline.js';
import { enGlosses } from '../src/ts/glosses/en/index.js';
import { buildPlan } from '../src/ts/generator/plan.js';
import { mulberry32 } from '../src/ts/generator/rng.js';
import { composeEgyptian, type EgyptianWord } from '../src/ts/languages/egyptian.js';
import { composePhoenician, type PhoenicianWord } from '../src/ts/languages/phoenician.js';
import type { FormulaOutput, School } from '../src/ts/generator/types.js';
import { parseGlyphs } from './spec.js';

export const ALL_SCHOOLS: ReadonlyArray<School> = [
  'protection',
  'curse',
  'invocation',
  'eldritch',
];

export const BRIGHT_SCHOOLS: ReadonlyArray<School> = [
  'protection',
  'curse',
  'invocation',
];

export const DIFFICULTIES: ReadonlyArray<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const SEEDS: ReadonlyArray<number> = [7, 1234, 987654321];

// The contract tests read the English gloss, so they generate against the
// English pack explicitly. Nothing here falls back to a default language.
export function runic(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate({ language: 'runic', school, difficulty }, seed, enGlosses);
}

export function egyptian(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate({ language: 'egyptian', school, difficulty }, seed, enGlosses);
}

export function phoenician(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate({ language: 'phoenician', school, difficulty }, seed, enGlosses);
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
  return composePhoenician(plan, rng, enGlosses.phoenician).words;
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
  return composeEgyptian(plan, rng, enGlosses.egyptian).words;
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
