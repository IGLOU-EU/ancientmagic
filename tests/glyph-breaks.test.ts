// The displayed glyph line carries invisible break opportunities, and the text
// behind it stays the pipeline's own output.
//
// The hint is a wbr element, so the guarantee this file holds is that the
// segments the renderer writes as text nodes join back into the exact glyphs:
// textContent is that join, and textContent is what the copy button hands over
// and what the accessible name and the live region read.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { LANGUAGES } from '../src/ts/generator/types.js';
import { breakSegments } from '../src/ts/ui/manifestation.js';
import { ALL_SCHOOLS, DIFFICULTIES, GENOMES, SEEDS, WRITERS, egyptian, greek } from './gen.js';

// Every shipped genome, each carrying the separators it declares itself. A
// script that gains one is swept with it, and no separator is written twice.
const CASES = LANGUAGES.map((id) => ({
  id,
  write: WRITERS[id],
  separators: GENOMES[id].separators,
}));

test('the copied text is the pipeline output, character for character', () => {
  for (const genome of CASES) {
    for (const school of ALL_SCHOOLS) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const glyphs = genome.write(school, difficulty, seed).glyphs;
          assert.strictEqual(
            breakSegments(glyphs, genome.separators).join(''),
            glyphs,
            `${genome.id} ${school} d${difficulty} seed ${seed}`,
          );
        }
      }
    }
  }
});

test('a break opportunity sits after every separator and nowhere else', () => {
  for (const genome of CASES) {
    const cut = new Set(genome.separators);
    for (const school of ALL_SCHOOLS) {
      for (const difficulty of [3, 5, 7, 9]) {
        for (const seed of SEEDS) {
          const where = `${genome.id} ${school} d${difficulty} seed ${seed}`;
          const glyphs = genome.write(school, difficulty, seed).glyphs;
          const segments = breakSegments(glyphs, genome.separators);
          const separators = Array.from(glyphs).filter((c) => cut.has(c)).length;
          // One segment per separator, plus whatever follows the last one.
          const trailing = cut.has(Array.from(glyphs).pop() ?? '') ? 0 : 1;
          assert.strictEqual(segments.length, separators + trailing, `segment count in ${where}`);
          segments.forEach((segment, index) => {
            const inner = Array.from(segment).slice(0, -1);
            assert.ok(
              !inner.some((c) => cut.has(c)),
              `a separator inside a segment in ${where}`,
            );
            if (index < segments.length - 1) {
              assert.ok(
                cut.has(Array.from(segment).pop() ?? ''),
                `segment ${index} does not end on a separator in ${where}`,
              );
            }
          });
        }
      }
    }
  }
});

test('a run without separators is written whole, with no hint at all', () => {
  // Egyptian writes continuously at every tier, and the low tiers of the other
  // three do the same, so those runs must come back as one segment.
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2]) {
        for (const genome of CASES) {
          const glyphs = genome.write(school, difficulty, seed).glyphs;
          assert.deepStrictEqual(
            breakSegments(glyphs, genome.separators),
            [glyphs],
            `${genome.id} ${school} d${difficulty} seed ${seed}`,
          );
        }
      }
      for (const difficulty of DIFFICULTIES) {
        const glyphs = egyptian(school, difficulty, seed).glyphs;
        assert.deepStrictEqual(
          breakSegments(glyphs, GENOMES.egyptian.separators),
          [glyphs],
          `egyptian d${difficulty}`,
        );
      }
    }
  }
});

test('the greek line is cut where its words end', () => {
  // The fixture of section 8.13, whose separators are the ones the browser
  // will not break on its own.
  const out = greek('protection', 5, 78253);
  // Written with the separator escaped: the ano teleia has a look-alike, and a
  // literal typed by hand is how one got into a fixture once already.
  const t = '\u{0387}';
  assert.deepStrictEqual(breakSegments(out.glyphs, GENOMES.greek.separators), [
    `ΦΥΛΑΚΤΗΡΙΟΝ${t}`,
    `ΦΥΛΑΚΟΣ${t}`,
    `ΚΑΤΑ${t}`,
    `ΝΕΚΡΟΥ${t}`,
    `ΔΕΣΜΩ${t}`,
    `ΙΑΩ${t}`,
    `ΗΔΗ${t}`,
    `ΗΔΗ${t}`,
    `ΤΑΧΥ${t}`,
    'ΤΑΧΥ',
  ]);
  assert.strictEqual(breakSegments(out.glyphs, GENOMES.greek.separators).join(''), out.glyphs);
});
