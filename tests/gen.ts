// Shared sweep helpers for the contract tests.

import { generate } from '../src/ts/generator/pipeline.js';
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

export function runic(school: School, difficulty: number, seed: number): FormulaOutput {
  return generate({ language: 'runic', school, difficulty }, seed);
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
