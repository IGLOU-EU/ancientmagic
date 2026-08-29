import test from 'node:test';
import * as assert from 'node:assert/strict';
import { runesFor } from '../src/ts/languages/runic.js';
import {
  ALLOWED_CODEPOINTS,
  AEGEAN,
  BRIGHT_POWER_WORDS,
  CLAUSE_SEP,
  CROSS_SEP,
  DIRECTION_WORDS_SPEC,
  NORSE_VOX_WORDS,
  NUMERAL_WORDS,
  RC5_TAIL_SPEC,
  RO5_SPEC,
  WORD_SEP,
  parseGlyphs,
} from './runic-spec.js';
import { codePoints } from './text.js';
import {
  ALL_SCHOOLS,
  BRIGHT_SCHOOLS,
  SEEDS,
  alignSegments,
  clauseCount,
  label,
  runic,
  sweep,
} from './gen.js';

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

// The free slot of the Invocation clause releases a bracteate cry or a word of
// the Norse layer (spec 2.7), and nothing else ever reaches it.
const FREE_VOX_WORDS: ReadonlyArray<string> = [...BRIGHT_POWER_WORDS, ...NORSE_VOX_WORDS];

test('invocation clauses end on an attested power word or a norse release', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const out = runic('invocation', difficulty, seed);
      const { segments } = alignSegments(out);
      for (let c = 0; c < clauseCount(difficulty); c += 1) {
        const clause = segments[c] ?? [];
        assert.ok(
          FREE_VOX_WORDS.includes(clause[clause.length - 1] ?? ''),
          `clause does not end on a released word in ${label('invocation', difficulty, seed)}`,
        );
      }
    }
  }
});

// The layer is released, never whispered and never tripled: tier 1 and tier 2
// are one word and a bare command, and a repetition segment cuts a cry down
// rather than a world (spec 2.7).
test('the norse layer never reaches a tier or a segment it is barred from', () => {
  const layer = new Set(NORSE_VOX_WORDS);
  for (const school of ALL_SCHOOLS) {
    for (let seed = 0; seed < 200; seed += 1) {
      for (const difficulty of [1, 2]) {
        for (const word of runic(school, difficulty, seed).transliteration.split(' ')) {
          assert.ok(!layer.has(word), `norse release at tier ${difficulty} in ${school}`);
        }
      }
      for (const difficulty of [8, 9]) {
        const repetition = alignSegments(runic(school, difficulty, seed)).segments[3] ?? [];
        for (const word of repetition) {
          assert.ok(!layer.has(word), `norse release repeated in ${label(school, difficulty, seed)}`);
        }
      }
    }
  }
});

// Only Invocation has a free POWER-WORD slot in the clear register, so only
// Invocation ever speaks the layer, and only it opens on RO5.
test('the norse layer and RO5 belong to invocation alone', () => {
  const layer = new Set(NORSE_VOX_WORDS);
  for (const school of ALL_SCHOOLS) {
    if (school === 'invocation') continue;
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (let seed = 0; seed < 200; seed += 1) {
        const words = runic(school, difficulty, seed).transliteration.split(' ');
        for (const word of words) {
          assert.ok(!layer.has(word), `norse release in ${label(school, difficulty, seed)}`);
        }
        assert.ok(
          !words.includes(RO5_SPEC[1] ?? ''),
          `RO5 in ${label(school, difficulty, seed)}`,
        );
      }
    }
  }
});

// RO5 falls in behind the cries the tier already gives and waits for tier 5,
// so the openings the earlier tiers pin stay exactly where they were.
test('RO5 opens invocation from tier 5, behind the openers of its tier', () => {
  let seen = 0;
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (let seed = 0; seed < 200; seed += 1) {
      const segment = alignSegments(runic('invocation', difficulty, seed)).segments[0] ?? [];
      const at = segment.indexOf(RO5_SPEC[0] ?? '');
      const opens = at >= 0 && segment[at + 1] === RO5_SPEC[1];
      if (!opens) continue;
      seen += 1;
      assert.ok(difficulty >= 5, `RO5 below tier 5 in ${label('invocation', difficulty, seed)}`);
      assert.ok(at > 0, `RO5 stands first in ${label('invocation', difficulty, seed)}`);
    }
  }
  assert.ok(seen > 0, 'RO5 never opened a formula');
});

test('gloss is plain english and reflects the school', () => {
  sweep(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    // The question mark joins the shape with Divination, whose asking clause
    // is the only place any script here can put one.
    assert.match(out.gloss, /^[A-Za-z][A-Za-z ,.!?-]*[.!?]$/, `gloss shape in ${where}`);
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
    if (school === 'divination') {
      assert.ok(out.gloss.includes('lot-staves'), `no opener in the gloss of ${where}`);
      assert.ok(out.gloss.includes('?'), `no question in the gloss of ${where}`);
    }
  });
});

// --- Divination (spec 2.11) -------------------------------------------------

const DIVINATION_TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

test('divination opens on RO4, which stands as its own clause', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const { segments } = alignSegments(runic('divination', difficulty, seed));
      const opening = segments[0] ?? [];
      // RO4 is a full clause and takes ᛬ after it, so the opening never runs
      // into the question. The cries that may precede it keep their ᛫ join.
      assert.deepStrictEqual(opening.slice(-3), ['thri', 'teinoz', 'nemido'], where);
      if (difficulty === 6) assert.deepStrictEqual(opening.slice(0, 2), ['ek', 'erilaz'], where);
      if (difficulty >= 8) assert.strictEqual(opening[0], 'futharkgwhnijeipzstbemlngdo', where);
    }
  }
});

test('divination clause and closing segments follow its own tier table', () => {
  // The opening clause, the school clauses, the repetition clause at the top
  // two tiers, then RC4 and RC3.
  const expected = (d: number): number => {
    if (d <= 4) return 2;
    if (d === 5) return 3;
    if (d <= 7) return 4;
    return 7;
  };
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const { segments } = alignSegments(runic('divination', difficulty, seed));
      assert.strictEqual(segments.length, expected(difficulty), where);
      if (difficulty >= 5) {
        const closing = segments[difficulty >= 8 ? segments.length - 2 : segments.length - 1];
        assert.deepStrictEqual(closing, ['runoz', 'radido'], `RC4 in ${where}`);
      }
      if (difficulty >= 8) {
        assert.deepStrictEqual(segments[segments.length - 1], ['alu'], `RC3 in ${where}`);
      }
    }
  }
});

test('the question fronts its verb in -ith, the answer buries it in -o', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const { segments } = alignSegments(runic('divination', difficulty, seed));
      const asking = segments[1] ?? [];
      assert.match(asking[0] ?? '', /ith$/u, `question not verb initial in ${where}`);
      // The subject follows the verb, and the object closes the clause.
      assert.match(asking[asking.length - 1] ?? '', /an$/u, `question object in ${where}`);
      assert.ok(
        asking.some((word) => /az$/u.test(word)),
        `question subject in ${where}`,
      );
      for (let c = 2; c < 1 + clauseCount(difficulty); c += 1) {
        const seeing = segments[c] ?? [];
        assert.match(seeing[seeing.length - 1] ?? '', /o$/u, `answer not verb final in ${where}`);
        assert.match(seeing[0] ?? '', /az$/u, `answer subject in ${where}`);
      }
      // One question per formula, whatever the tier allows after it.
      const ithWords = segments
        .slice(1, 1 + clauseCount(difficulty))
        .flat()
        .filter((word) => /ith$/u.test(word));
      assert.strictEqual(ithWords.length, 1, `question count in ${where}`);
    }
  }
});

test('a divination adjective copies the ending of the noun it precedes', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (let seed = 0; seed < 60; seed += 1) {
      const where = label('divination', difficulty, seed);
      const { segments } = alignSegments(runic('divination', difficulty, seed));
      for (let c = 1; c < 1 + clauseCount(difficulty); c += 1) {
        const clause = segments[c] ?? [];
        // The object phrase is the only accusative of the clause: the object
        // alone, or the adjective in -an immediately before it.
        const accusatives = clause
          .map((word, index) => (/an$/u.test(word) ? index : -1))
          .filter((index) => index >= 0);
        assert.ok(
          accusatives.length === 1 || accusatives.length === 2,
          `accusative count in ${where}`,
        );
        if (accusatives.length === 2) {
          assert.strictEqual(
            accusatives[1],
            (accusatives[0] ?? 0) + 1,
            `adjective not before its noun in ${where}`,
          );
        }
      }
    }
  }
});

test('the tier 7 divination seal is three lots and never another count', () => {
  for (const seed of SEEDS) {
    const out = runic('divination', 7, seed);
    const { sealWord } = alignSegments(out);
    assert.strictEqual(sealWord, NUMERAL_WORDS[3], label('divination', 7, seed));
  }
});

// --- Chronomancy (spec 2.12) ------------------------------------------------

const CHRONOMANCY_TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

test('the command opens the crossing clause and its direction follows it', () => {
  const directions = new Set(Object.values(DIRECTION_WORDS_SPEC));
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const { segments } = alignSegments(runic('chronomancy', difficulty, seed));
      // The openers of this school are cries, not clauses, so they keep their
      // word separator and the crossing clause opens the first segment.
      const opening = segments[0] ?? [];
      // The opener is a cry of one or two words, so the clause is found by its
      // direction rather than by an index: the verb is the word in front of
      // it, and the two open the clause together.
      const at = opening.findIndex((word) => directions.has(word));
      assert.ok(at > 0, `no direction in the crossing clause of ${where}`);
      const verb = opening[at - 1] ?? '';
      // The bare imperative is the root itself: no ending at all.
      assert.doesNotMatch(verb, /(?:az|an|oz|as|ith|ai|o)$/u, `crossing verb inflected in ${where}`);
      assert.match(opening[opening.length - 1] ?? '', /an$/u, `crossing object in ${where}`);
      // Nothing of the clause stands before its verb: whatever precedes it
      // belongs to an opening cry, which is fixed material.
      const openerWords = new Set([...BRIGHT_POWER_WORDS, 'ek', 'erilaz']);
      for (const word of opening.slice(0, at - 1)) {
        assert.ok(openerWords.has(word), `${word} stands before the command in ${where}`);
      }
    }
  }
});

test('a binding clause opens on ek and closes on the verb, with nothing between them', () => {
  for (const difficulty of [6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const { segments } = alignSegments(runic('chronomancy', difficulty, seed));
      for (let c = 1; c < clauseCount(difficulty); c += 1) {
        const clause = segments[c] ?? [];
        assert.strictEqual(clause[0], 'ek', `binding clause without ek in ${where}`);
        assert.match(clause[clause.length - 1] ?? '', /o$/u, `verb not clause-final in ${where}`);
        // The pronoun carries the subject, so no -az epithet stands anywhere.
        for (const word of clause) {
          assert.doesNotMatch(word, /az$/u, `an epithet in a binding clause in ${where}`);
        }
      }
    }
  }
});

test('the return anchor is the first closing clause and inflects for its tier', () => {
  for (const difficulty of [5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const { segments } = alignSegments(runic('chronomancy', difficulty, seed));
      const closing = segments[difficulty >= 8 ? segments.length - 2 : segments.length - 1] ?? [];
      assert.deepStrictEqual(
        closing.slice(-RC5_TAIL_SPEC.length),
        [...RC5_TAIL_SPEC],
        `RC5 tail in ${where}`,
      );
      assert.strictEqual(
        closing.length,
        RC5_TAIL_SPEC.length + (difficulty >= 9 ? 2 : 1),
        `anchor length in ${where}`,
      );
      assert.match(closing[0] ?? '', /an$/u, `anchor not accusative in ${where}`);
      if (difficulty >= 9) assert.match(closing[1] ?? '', /as$/u, `genitive in ${where}`);
      if (difficulty >= 8) {
        assert.deepStrictEqual(segments[segments.length - 1], ['alu'], `RC3 in ${where}`);
      }
    }
  }
});

test('chronomancy clause and closing segments follow its own tier table', () => {
  const expected = (d: number): number => {
    if (d <= 4) return 1;
    if (d === 5) return 2;
    if (d <= 7) return 3;
    return 6; // three clauses, the repetition clause, then RC5 and RC3
  };
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const { segments } = alignSegments(runic('chronomancy', difficulty, seed));
      assert.strictEqual(
        segments.length,
        expected(difficulty),
        label('chronomancy', difficulty, seed),
      );
    }
  }
});

test('the tier 7 chronomantic seal is twelve and never another count', () => {
  for (const seed of SEEDS) {
    const { sealWord } = alignSegments(runic('chronomancy', 7, seed));
    assert.strictEqual(sealWord, NUMERAL_WORDS[12], label('chronomancy', 7, seed));
  }
});
