import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  degradeSpoken,
  eldritchSkeleton,
  glyphsFor,
  joinSpoken,
  speakSkeleton,
} from '../src/ts/languages/egyptian.js';
import {
  ALLOWED_CODEPOINTS,
  DETERMINATIVE_GLYPHS,
  FIELD_DET,
  LEXICON,
  SIGN_TABLE,
} from './egyptian-spec.js';
import { codePoints } from './text.js';
import { ALL_SCHOOLS, egyptian, egyptianWords, label, sweepEgyptian } from './gen.js';

const PHONOGRAMS: ReadonlySet<string> = new Set(SIGN_TABLE.map(([, glyph]) => glyph));

test('sign table: every manuel de codage token maps to the spec codepoint', () => {
  for (const [token, glyph] of SIGN_TABLE) {
    assert.strictEqual(glyphsFor(token), glyph, `token ${token}`);
  }
});

test('sign mapping: rejects letters outside the working set', () => {
  assert.throws(() => glyphsFor('lion'));
  assert.throws(() => glyphsFor('zA'));
  assert.throws(() => glyphsFor('q s'));
});

test('doubling: adjacent identical phonograms collapse, the spoken form does not', () => {
  // Spec 3.2 worked example: nHH renders as two signs but is spoken neheh.
  assert.strictEqual(glyphsFor('nHH'), '\u{13216}\u{1339B}');
  assert.strictEqual(speakSkeleton('nHH'), 'neheh');
  assert.strictEqual(glyphsFor('aApp'), '\u{1309D}\u{1313F}\u{132AA}');
});

test('spoken derivation: the e insertion and the w to u rule of the spec', () => {
  assert.strictEqual(speakSkeleton('mkA'), 'meka');
  assert.strictEqual(speakSkeleton('qAs'), 'qas');
  assert.strictEqual(speakSkeleton('nbT'), 'nebetj');
  assert.strictEqual(speakSkeleton('sxpr'), 'sekheper');
  assert.strictEqual(speakSkeleton('sStA'), 'sesheta');
  // w is spoken u when word final or between two consonants.
  assert.strictEqual(speakSkeleton('xwf'), 'khuf');
  assert.strictEqual(speakSkeleton('twr'), 'tur');
  assert.strictEqual(speakSkeleton('HfAw'), 'hefau');
  assert.strictEqual(speakSkeleton('xAwy'), 'khawy');
  // A one-letter function word with no vowel gains a leading e.
  assert.strictEqual(speakSkeleton('r'), 'er');
  assert.strictEqual(speakSkeleton('n'), 'en');
  assert.strictEqual(speakSkeleton('m'), 'em');
});

test('suffix pronouns join their verb as one spoken word', () => {
  assert.strictEqual(joinSpoken('qas', 'i'), 'qasi');
  assert.strictEqual(joinSpoken('qas', 'k'), 'qasek');
  assert.strictEqual(joinSpoken('qas', 'f'), 'qasef');
  assert.strictEqual(joinSpoken('qas', 'sn'), 'qasesen');
  // The gate spell forms of spec 3.6.
  assert.strictEqual(joinSpoken('ren', 'k'), 'renek');
  assert.strictEqual(joinSpoken('rekh', 'i'), 'rekhi');
  assert.strictEqual(joinSpoken('rekh', 'k'), 'rekhek');
});

test('eldritch guttural suffix and vowel degradation follow the spec example', () => {
  assert.strictEqual(eldritchSkeleton('mkA'), 'mkAx');
  assert.strictEqual(degradeSpoken(joinSpoken('meka', 'x')), 'mukokh');
  // A root already ending in x or q takes no further suffix.
  assert.strictEqual(eldritchSkeleton('sdx'), 'sdx');
  assert.strictEqual(eldritchSkeleton('mnq'), 'mnq');
  assert.strictEqual(eldritchSkeleton('xAxr'), 'xAxrx');
});

test('transliteration is lowercase ascii words in every output', () => {
  sweepEgyptian(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    assert.match(out.transliteration, /^[a-z]+(?: [a-z]+)*$/, label(school, difficulty, seed));
  });
});

test('glyph line uses only the curated egyptian working set', () => {
  sweepEgyptian(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    for (const cp of codePoints(out.glyphs)) {
      assert.ok(
        ALLOWED_CODEPOINTS.has(cp),
        `forbidden codepoint U+${(cp.codePointAt(0) ?? 0).toString(16)} in ${label(school, difficulty, seed)}`,
      );
    }
  });
});

test('the script runs continuous: no space and no separator, at every tier', () => {
  sweepEgyptian(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    assert.ok(!/\s/u.test(out.glyphs), `whitespace in the glyph line of ${where}`);
    // No format control of the hieroglyph block, and nothing outside it.
    assert.ok(
      !/[\u{13430}-\u{1345F}]/u.test(out.glyphs),
      `format control in ${where}`,
    );
  });
});

test('glyph and transliteration lines are built from the same word list', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of [7, 1234, 987654321]) {
        const out = egyptian(school, difficulty, seed);
        const words = egyptianWords(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        assert.strictEqual(words.map((w) => w.glyphs).join(''), out.glyphs, where);
        assert.strictEqual(words.map((w) => w.spoken).join(' '), out.transliteration, where);
        for (const word of words) {
          assert.ok(word.spoken.length > 0, `empty spoken word in ${where}`);
          assert.ok(word.glyphs.length > 0, `empty glyph word in ${where}`);
          assert.ok(!word.spoken.includes(' '), `spoken word holds a space in ${where}`);
        }
      }
    }
  }
});

test('every content word ends on exactly its field determinative', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of [7, 1234, 987654321]) {
        const where = label(school, difficulty, seed);
        for (const word of egyptianWords(school, difficulty, seed)) {
          if (word.role !== 'content') continue;
          const field = word.field ?? '';
          assert.ok(
            word.glyphs.endsWith(word.determinatives + word.suffix),
            `determinative not at word end in ${where}`,
          );
          const dets = codePoints(word.determinatives);
          assert.strictEqual(dets[0], FIELD_DET[field], `wrong field determinative in ${where}`);
          assert.strictEqual(
            dets.length,
            school === 'eldritch' ? 2 : 1,
            `determinative count in ${where}`,
          );
          for (const det of dets) {
            assert.ok(DETERMINATIVE_GLYPHS.has(det), `not a determinative sign in ${where}`);
          }
          const phonograms = codePoints(
            word.glyphs.slice(0, word.glyphs.length - (word.determinatives + word.suffix).length),
          );
          assert.ok(phonograms.length > 0, `content word without phonograms in ${where}`);
          for (const sign of phonograms) {
            assert.ok(PHONOGRAMS.has(sign), `non phonogram before the determinative in ${where}`);
          }
          for (let i = 1; i < phonograms.length; i += 1) {
            assert.notStrictEqual(
              phonograms[i],
              phonograms[i - 1],
              `uncollapsed double phonogram in ${where}`,
            );
          }
        }
      }
    }
  }
});

test('suffix pronouns sit only after a verb determinative, never on a noun', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of [7, 1234, 987654321]) {
        const where = label(school, difficulty, seed);
        for (const word of egyptianWords(school, difficulty, seed)) {
          if (word.suffix === '') continue;
          assert.strictEqual(word.role, 'content', `suffix on a non content word in ${where}`);
          assert.ok(
            word.glyphs.endsWith(word.determinatives + word.suffix),
            `suffix before the determinative in ${where}`,
          );
        }
      }
    }
  }
});

test('function words and idiom words never carry a determinative of their own', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [3, 5, 7, 9]) {
      for (const seed of [7, 1234, 987654321]) {
        for (const word of egyptianWords(school, difficulty, seed)) {
          if (word.role === 'content') continue;
          assert.strictEqual(word.determinatives, '');
          assert.strictEqual(word.suffix, '');
        }
      }
    }
  }
});

test('the lexicon spoken forms reach the transliteration unchanged outside eldritch', () => {
  // The spec lists a spoken form per root, so every content word of a clear
  // formula is one of them, alone or carrying a suffix pronoun.
  const spoken = new Set<string>();
  for (const roots of Object.values(LEXICON)) {
    for (const [, form] of roots) {
      spoken.add(form);
      for (const suffix of ['i', 'k', 'f', 'sn']) spoken.add(joinSpoken(form, suffix));
    }
  }
  let seen = 0;
  for (const school of ['protection', 'curse', 'invocation'] as const) {
    for (const difficulty of [3, 5, 7, 9]) {
      for (const seed of [7, 1234, 987654321]) {
        for (const word of egyptianWords(school, difficulty, seed)) {
          if (word.role !== 'content') continue;
          assert.ok(spoken.has(word.spoken), `spoken form off the lexicon: ${word.spoken}`);
          seen += 1;
        }
      }
    }
  }
  assert.ok(seen > 0, 'no content word observed');
});
