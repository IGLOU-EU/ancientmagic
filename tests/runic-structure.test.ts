import test from 'node:test';
import * as assert from 'node:assert/strict';
import { runesFor } from '../src/ts/languages/runic.js';
import {
  ALLOWED_CODEPOINTS,
  AEGEAN,
  BRIGHT_POWER_WORDS,
  CLAUSE_SEP,
  CROSS_SEP,
  NUMERAL_WORDS,
  WORD_SEP,
  codePoints,
  parseGlyphs,
} from './spec.js';
import {
  ALL_SCHOOLS,
  BRIGHT_SCHOOLS,
  SEEDS,
  alignSegments,
  clauseCount,
  runic,
  sweep,
} from './gen.js';

const label = (school: string, difficulty: number, seed: number): string =>
  `${school} d${difficulty} seed ${seed}`;

test('transliteration is lowercase ascii words in every output', () => {
  sweep(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    assert.match(out.transliteration, /^[a-z]+(?: [a-z]+)*$/, label(school, difficulty, seed));
  });
});

test('glyph line uses only the runic inventory, separators and aegean seals', () => {
  sweep(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    for (const cp of codePoints(out.glyphs)) {
      assert.ok(
        ALLOWED_CODEPOINTS.has(cp),
        `forbidden codepoint U+${(cp.codePointAt(0) ?? 0).toString(16)} in ${label(school, difficulty, seed)}`,
      );
    }
  });
});

test('difficulty 1 and 2 write continuously, without any separator', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [1, 2]) {
      for (const seed of SEEDS) {
        const out = runic(school, difficulty, seed);
        for (const sep of [WORD_SEP, CLAUSE_SEP, CROSS_SEP]) {
          assert.ok(
            !out.glyphs.includes(sep),
            `separator in ${label(school, difficulty, seed)}`,
          );
        }
      }
    }
  }
});

test('difficulty 3 and up separates words, never leading nor trailing', () => {
  sweep(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    if (difficulty < 3) return;
    const where = label(school, difficulty, seed);
    const { segments, seal } = parseGlyphs(out.glyphs);
    assert.ok(out.glyphs.includes(WORD_SEP), `no word separator in ${where}`);
    for (const segment of segments) {
      for (const word of segment) {
        assert.ok(word.length > 0, `empty glyph word (dangling separator) in ${where}`);
      }
    }
    // Cross punctuation exists only as the two-glyph frame of the final seal.
    const crossCount = codePoints(out.glyphs).filter((cp) => cp === CROSS_SEP).length;
    if (seal === null) {
      assert.strictEqual(crossCount, 0, `stray cross punctuation in ${where}`);
      assert.ok(
        !/[\u{10100}-\u{1013F}]/u.test(out.glyphs),
        `aegean glyph outside a seal frame in ${where}`,
      );
    } else {
      assert.strictEqual(crossCount, 2, `cross punctuation outside the frame in ${where}`);
      assert.match(
        out.glyphs,
        new RegExp(`${CROSS_SEP}(?:\u{10109}|\u{1010D}|\u{1010F}|\u{10110}\u{10108})${CROSS_SEP}$`, 'u'),
        `seal not framed at the end in ${where}`,
      );
    }
  });
});

test('transliteration words map one to one onto glyph words', () => {
  sweep(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    const words = out.transliteration.split(' ');
    if (difficulty < 3) {
      assert.strictEqual(
        out.glyphs,
        words.map((w) => runesFor(w)).join(''),
        `continuous glyphs do not match transliteration in ${where}`,
      );
      return;
    }
    const { segments, sealWord } = alignSegments(out);
    const { segments: glyphSegments, seal } = parseGlyphs(out.glyphs);
    segments.forEach((group, s) => {
      group.forEach((word, w) => {
        assert.strictEqual(
          runesFor(word),
          glyphSegments[s]?.[w],
          `word ${word} misaligned in ${where}`,
        );
      });
    });
    if (seal !== null) {
      assert.ok(sealWord !== null, `missing numeral word in ${where}`);
      assert.strictEqual(AEGEAN[sealWord ?? ''], seal, `seal word mismatch in ${where}`);
    }
  });
});

test('no two adjacent identical runes inside a glyph word', () => {
  sweep(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    for (const word of out.transliteration.split(' ')) {
      if (word in AEGEAN) continue;
      const runes = codePoints(runesFor(word));
      for (let i = 1; i < runes.length; i += 1) {
        assert.ok(
          runes[i] !== runes[i - 1],
          `double rune in ${word} (${label(school, difficulty, seed)})`,
        );
      }
    }
  });
});

test('difficulty 1: a single attested power word', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      const out = runic(school, 1, seed);
      const words = out.transliteration.split(' ');
      assert.strictEqual(words.length, 1, label(school, 1, seed));
      assert.ok(
        BRIGHT_POWER_WORDS.includes(words[0] ?? ''),
        `not an attested word: ${words[0]} (${label(school, 1, seed)})`,
      );
    }
  }
});

test('difficulty 2: imperative intent plus accusative target', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      const out = runic(school, 2, seed);
      const words = out.transliteration.split(' ');
      assert.strictEqual(words.length, 2, label(school, 2, seed));
      assert.match(words[1] ?? '', /an$/, `target not accusative in ${label(school, 2, seed)}`);
    }
  }
});

test('clause and closing segments follow the tier table', () => {
  const expectedSegments = (d: number): number => {
    if (d < 5) return 1;
    if (d === 5) return 2;
    if (d <= 7) return 3;
    return 6; // three clauses, the power word litany, then RC1 and RC3
  };
  for (const school of BRIGHT_SCHOOLS) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const out = runic(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        const { segments } = alignSegments(out);
        assert.strictEqual(segments.length, expectedSegments(difficulty), where);
        if (difficulty >= 5 && difficulty <= 7) {
          const closing = segments[segments.length - 1] ?? [];
          assert.ok(
            ['faihido', 'tawido'].includes(closing[1] ?? '') && closing[0] === 'runoz',
            `bad closing clause in ${where}`,
          );
        }
        if (difficulty >= 8) {
          assert.deepStrictEqual(segments[4], ['runoz', 'faihido'], where);
          assert.deepStrictEqual(segments[5], ['alu'], where);
        }
      }
    }
  }
});

test('openings follow the tier table', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [3, 4]) {
        const { segments } = alignSegments(runic(school, difficulty, seed));
        assert.strictEqual(segments[0]?.[0], 'alu', label(school, difficulty, seed));
      }
      const d5 = alignSegments(runic(school, 5, seed)).segments[0] ?? [];
      assert.ok(
        d5[0] === 'alu' || (d5[0] === 'ek' && d5[1] === 'erilaz'),
        `bad d5 opening in ${label(school, 5, seed)}`,
      );
      for (const difficulty of [6, 7]) {
        const seg = alignSegments(runic(school, difficulty, seed)).segments[0] ?? [];
        assert.strictEqual(seg[0], 'ek', label(school, difficulty, seed));
        assert.strictEqual(seg[1], 'erilaz', label(school, difficulty, seed));
      }
      for (const difficulty of [8, 9]) {
        const seg = alignSegments(runic(school, difficulty, seed)).segments[0] ?? [];
        assert.strictEqual(
          seg[0],
          'futharkgwhnijeipzstbemlngdo',
          label(school, difficulty, seed),
        );
      }
    }
  }
});

test('difficulty 8 repeats a power word three times, difficulty 9 shrinks it', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      const t8 = alignSegments(runic(school, 8, seed)).segments[3] ?? [];
      assert.strictEqual(t8.length, 3, label(school, 8, seed));
      assert.ok(
        t8[0] === t8[1] && t8[1] === t8[2] && BRIGHT_POWER_WORDS.includes(t8[0] ?? ''),
        `bad litany triple in ${label(school, 8, seed)}`,
      );

      const glyphSegments = parseGlyphs(runic(school, 9, seed).glyphs).segments;
      const triangle = glyphSegments[3] ?? [];
      assert.ok(triangle.length >= 4, `triangle too short in ${label(school, 9, seed)}`);
      for (let i = 1; i < triangle.length; i += 1) {
        const prev = codePoints(triangle[i - 1] ?? '');
        assert.strictEqual(
          triangle[i],
          prev.slice(1).join(''),
          `triangle step ${i} broken in ${label(school, 9, seed)}`,
        );
      }
      const last = codePoints(triangle[triangle.length - 1] ?? '');
      assert.strictEqual(last.length, 1, `triangle does not end on one rune in ${label(school, 9, seed)}`);
    }
  }
});

test('seals: absent before 7, tier-bound counts from 7 up', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2, 3, 4, 5, 6]) {
        const out = runic(school, difficulty, seed);
        assert.ok(
          !out.glyphs.includes(CROSS_SEP),
          `unexpected seal in ${label(school, difficulty, seed)}`,
        );
      }
      const allowed: Record<number, number[]> = { 7: [3, 7], 8: [7, 9], 9: [9, 12] };
      for (const difficulty of [7, 8, 9]) {
        const out = runic(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        const { seal, sealWord } = { ...parseGlyphs(out.glyphs), ...alignSegments(out) };
        assert.ok(seal !== null, `missing seal in ${where}`);
        const counts = allowed[difficulty] ?? [];
        const matched = counts.some(
          (count) => AEGEAN[NUMERAL_WORDS[count] ?? ''] === seal && sealWord === NUMERAL_WORDS[count],
        );
        assert.ok(matched, `seal count out of tier in ${where}: ${sealWord}`);
        assert.ok(out.gloss.includes('Sealed'), `seal missing from gloss in ${where}`);
      }
    }
  }
});

test('protection and curse keep the verb clause-final, withra takes the accusative', () => {
  for (const school of ['protection', 'curse'] as const) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const out = runic(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        const { segments } = alignSegments(out);
        for (let c = 0; c < clauseCount(difficulty); c += 1) {
          const clause = segments[c] ?? [];
          const lastWord = clause[clause.length - 1] ?? '';
          if (school === 'protection') {
            assert.match(lastWord, /o$/, `verb not clause-final in ${where}`);
          } else {
            assert.match(lastWord, /ai$/, `optative not clause-final in ${where}`);
          }
        }
        if (school === 'protection') {
          const words = out.transliteration.split(' ');
          const at = words.indexOf('withra');
          assert.ok(at >= 0, `withra missing in ${where}`);
          for (let i = 0; i < words.length; i += 1) {
            if (words[i] === 'withra') {
              assert.match(words[i + 1] ?? '', /an$/, `withra not before -an in ${where}`);
            }
          }
        }
      }
    }
  }
});

test('invocation clauses end on an attested power word', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const out = runic('invocation', difficulty, seed);
      const { segments } = alignSegments(out);
      for (let c = 0; c < clauseCount(difficulty); c += 1) {
        const clause = segments[c] ?? [];
        assert.ok(
          BRIGHT_POWER_WORDS.includes(clause[clause.length - 1] ?? ''),
          `clause does not end on a power word in ${label('invocation', difficulty, seed)}`,
        );
      }
    }
  }
});

test('gloss is plain english and reflects the school', () => {
  sweep(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    assert.match(out.gloss, /^[A-Za-z][A-Za-z ,.!-]*[.!]$/, `gloss shape in ${where}`);
    if (difficulty < 3) return;
    if (school === 'protection') {
      assert.ok(out.gloss.includes('against'), `protection gloss in ${where}`);
    }
    if (school === 'curse') {
      assert.ok(out.gloss.includes('May the'), `curse gloss in ${where}`);
    }
    if (school === 'invocation' || school === 'eldritch') {
      assert.ok(out.gloss.includes('O '), `vocative gloss in ${where}`);
    }
  });
});
