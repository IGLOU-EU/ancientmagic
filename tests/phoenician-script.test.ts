import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  citation,
  conjugate,
  degrade,
  eldritchRoot,
  glyphsFor,
  speak,
  tokenize,
} from '../src/ts/languages/phoenician.js';
import { FIELDS } from '../src/ts/languages/phoenician-data.js';
import {
  ALF,
  ALLOWED_CODEPOINTS,
  DIGRAPHS,
  LETTERS,
  LETTER_TABLE,
  NAME_TABLE,
  WORD_SEP,
  codePoints,
  splitWords,
} from './phoenician-spec.js';
import { ALL_SCHOOLS, DIFFICULTIES, SEEDS, phoenician, phoenicianWords, sweepPhoenician } from './gen.js';

const label = (school: string, difficulty: number, seed: number): string =>
  `${school} d${difficulty} seed ${seed}`;

test('letter table: every romanization token maps to the spec codepoint', () => {
  for (const [token, glyph] of LETTER_TABLE) {
    assert.strictEqual(glyphsFor(token), glyph, `token ${token}`);
  }
  assert.strictEqual(LETTER_TABLE.length, 22, 'the abjad is 22 letters');
});

test('tokenization is greedy longest match over the five digraphs', () => {
  for (const digraph of DIGRAPHS) {
    assert.deepStrictEqual(tokenize(digraph), [digraph], `digraph ${digraph}`);
  }
  assert.deepStrictEqual(tokenize('shmr'), ['sh', 'm', 'r']);
  assert.deepStrictEqual(tokenize('mkhts'), ['m', 'kh', 'ts']);
  assert.deepStrictEqual(tokenize('ttmn'), ['tt', 'm', 'n']);
  assert.deepStrictEqual(tokenize("rp'"), ['r', 'p', "'"]);
  assert.deepStrictEqual(tokenize('shamor'), ['sh', 'a', 'm', 'o', 'r']);
});

test('tokenization rejects letters outside the abjad romanization', () => {
  assert.throws(() => tokenize('vex'));
  assert.throws(() => glyphsFor('cq'));
  assert.throws(() => glyphsFor('a b'));
});

test('vowel dropping: interior vowels never surface, an initial vowel becomes one alf', () => {
  // Spec 4.2 with the section 5 words.
  assert.strictEqual(glyphsFor('lakhashat'), '\u{1090B}\u{10907}\u{10914}\u{10915}');
  assert.strictEqual(glyphsFor("lerapo'im"), '\u{1090B}\u{10913}\u{10910}\u{10900}\u{1090C}');
  assert.strictEqual(glyphsFor("ya'sur"), '\u{10909}\u{10900}\u{1090E}\u{10913}');
  // y and w are consonants and are always written.
  assert.strictEqual(glyphsFor('layol'), '\u{1090B}\u{10909}\u{1090B}');
  assert.strictEqual(glyphsFor('dawoy'), '\u{10903}\u{10905}\u{10909}');
  // A word-initial vowel surfaces as exactly one alf, and nothing else does.
  assert.strictEqual(glyphsFor('abed'), `${ALF}\u{10901}\u{10903}`);
  assert.strictEqual(codePoints(glyphsFor('oqol')).filter((c) => c === ALF).length, 1);
});

test('doubling: adjacent identical letters collapse inside a word', () => {
  // qll vocalized qalol writes qof then a single lamd.
  assert.strictEqual(glyphsFor('qalol'), '\u{10912}\u{1090B}');
  assert.strictEqual(glyphsFor('khapop'), '\u{10907}\u{10910}');
  // The collapse follows the proclitic into its host, which is one word.
  assert.strictEqual(glyphsFor('lelayolim'), '\u{1090B}\u{10909}\u{1090B}\u{1090C}');
});

test('the spoken line drops the alf apostrophe and speaks tt as t', () => {
  assert.strictEqual(speak("ya'sur"), 'yasur');
  assert.strictEqual(speak("lerapo'im"), 'lerapoim');
  assert.strictEqual(speak('ttakhmer'), 'takhmer');
  assert.strictEqual(speak('shamor'), 'shamor');
});

test('citation vocalization follows the shape of the root', () => {
  // Spec 4.3 worked examples.
  assert.strictEqual(speak(citation('mgn')), 'magon');
  assert.strictEqual(speak(citation('shmr')), 'shamor');
  assert.strictEqual(speak(citation('dl')), 'dol');
  assert.strictEqual(speak(citation('ym')), 'yom');
  // The quadriliteral citation of spec 4.10, before degradation.
  assert.strictEqual(speak(citation('shmrgh')), 'shamregh');
});

test('the five verb forms follow the pattern table', () => {
  // Spec 4.4 on the binding root of the section 5 rendering.
  assert.strictEqual(speak(conjugate("'sr", 'jussive-3ms')), 'yasur');
  assert.strictEqual(speak(conjugate("'sr", 'jussive-3fs')), 'tasur');
  assert.strictEqual(speak(conjugate('shmr', 'jussive-3ms')), 'yashmur');
  assert.strictEqual(speak(conjugate('shmr', 'jussive-3fs')), 'tashmur');
  assert.strictEqual(speak(conjugate('shmr', 'imperfect-1sg')), 'ashmor');
  assert.strictEqual(speak(conjugate('shmr', 'imperative')), 'shemor');
  assert.strictEqual(speak(conjugate('shmr', 'perfect')), 'shamar');
});

test('the imperative and the perfect are written alike and spoken apart', () => {
  // Spec 4.4: the abjad hides the pattern, only the transliteration shows it.
  for (const root of ['shmr', 'mgn', "'sr", 'khtm']) {
    const imperative = conjugate(root, 'imperative');
    const perfect = conjugate(root, 'perfect');
    assert.strictEqual(glyphsFor(imperative), glyphsFor(perfect), `written shape of ${root}`);
    assert.notStrictEqual(speak(imperative), speak(perfect), `spoken shape of ${root}`);
  }
});

test('a biconsonantal root never takes a verb pattern', () => {
  // Spec 4.3 gives no verb pattern below three radicals, so the genome data
  // keeps every biconsonantal root as noun material.
  for (const root of ['dl', 'ym', 'sp']) {
    assert.throws(() => conjugate(root, 'imperative'), `${root} conjugated`);
  }
});

test('the eldritch root rules shift emphatics and add the fourth radical', () => {
  // Spec 4.10 worked example: sh is one token, so shmr is untouched by rule 1.
  assert.strictEqual(eldritchRoot('shmr'), 'shmrgh');
  assert.strictEqual(speak(degrade(citation(eldritchRoot('shmr')))), 'shomrugh');
  // t becomes tt, s becomes ts, k becomes q.
  assert.strictEqual(eldritchRoot('str'), 'tsttrgh');
  assert.strictEqual(eldritchRoot('kbl'), 'qblgh');
  assert.strictEqual(eldritchRoot('smk'), 'tsmqgh');
  // Existing emphatics stay as they are.
  assert.strictEqual(eldritchRoot('tspn'), 'tspngh');
  assert.strictEqual(eldritchRoot('ttmn'), 'ttmngh');
});

test('the eldritch root round trips through tokenization', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      if (tokenize(root.root).length < 3) continue;
      const distorted = eldritchRoot(root.root);
      assert.strictEqual(tokenize(distorted).length, 4, `radical count of ${distorted}`);
    }
  }
});

test('transliteration is lowercase ascii words in every output', () => {
  sweepPhoenician(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    assert.match(out.transliteration, /^[a-z]+(?: [a-z]+)*$/, label(school, difficulty, seed));
  });
});

test('glyph line uses only the 22 letters, the separator and the four numerals', () => {
  sweepPhoenician(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    for (const cp of codePoints(out.glyphs)) {
      assert.ok(
        ALLOWED_CODEPOINTS.has(cp),
        `forbidden codepoint U+${(cp.codePointAt(0) ?? 0).toString(16)} in ${label(school, difficulty, seed)}`,
      );
    }
  });
});

test('separator policy: continuous below tier 3, one separator between words above', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2]) {
        const out = phoenician(school, difficulty, seed);
        assert.ok(
          !out.glyphs.includes(WORD_SEP),
          `separator at ${label(school, difficulty, seed)}`,
        );
      }
      for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
        const where = label(school, difficulty, seed);
        const out = phoenician(school, difficulty, seed);
        assert.ok(!out.glyphs.startsWith(WORD_SEP), `leading separator in ${where}`);
        assert.ok(!out.glyphs.endsWith(WORD_SEP), `trailing separator in ${where}`);
        assert.ok(
          !out.glyphs.includes(WORD_SEP + WORD_SEP),
          `doubled separator in ${where}`,
        );
        for (const word of splitWords(out.glyphs)) {
          assert.ok(word.length > 0, `empty glyph word in ${where}`);
        }
      }
    }
  }
});

test('glyph and transliteration lines are built from the same word list', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const out = phoenician(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        const sep = difficulty <= 2 ? '' : WORD_SEP;
        assert.strictEqual(words.map((w) => w.glyphs).join(sep), out.glyphs, where);
        assert.strictEqual(words.map((w) => w.spoken).join(' '), out.transliteration, where);
        for (const word of words) {
          assert.ok(word.glyphs.length > 0, `empty glyph word in ${where}`);
          assert.ok(word.spoken.length > 0, `empty spoken word in ${where}`);
          assert.ok(!word.glyphs.includes(WORD_SEP), `separator inside a word in ${where}`);
        }
      }
    }
  }
});

test('every derived word writes exactly its consonants, no vowel letter', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        for (const word of phoenicianWords(school, difficulty, seed)) {
          if (word.vocalized === null) continue;
          assert.strictEqual(word.glyphs, glyphsFor(word.vocalized), `glyph derivation in ${where}`);
          assert.strictEqual(word.spoken, speak(word.vocalized), `spoken derivation in ${where}`);
          const tokens = tokenize(word.vocalized);
          const vowels = tokens.filter((t) => 'aeiou'.includes(t));
          const initialVowel = 'aeiou'.includes(tokens[0] ?? '') ? 1 : 0;
          const alfs = codePoints(word.glyphs).filter((c) => c === ALF).length;
          const rootAlfs = tokens.filter((t) => t === "'").length;
          assert.ok(
            alfs <= rootAlfs + initialVowel,
            `a vowel surfaced as a letter in ${where}: ${word.vocalized}`,
          );
          assert.ok(vowels.length > 0, `unvocalized word in ${where}`);
        }
      }
    }
  }
});

test('no two adjacent identical letters inside a word, attested names excepted', () => {
  const attested = new Set(NAME_TABLE.map(([, glyphs]) => glyphs));
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        for (const word of phoenicianWords(school, difficulty, seed)) {
          if (attested.has(word.glyphs)) continue;
          const signs = codePoints(word.glyphs).filter((c) => LETTERS.has(c));
          for (let i = 1; i < signs.length; i += 1) {
            assert.notStrictEqual(signs[i], signs[i - 1], `uncollapsed double in ${where}`);
          }
        }
      }
    }
  }
});

test('the glyph line stays in logical order, never mirrored', () => {
  // A right-to-left script is stored in reading order and turned around by the
  // bidi algorithm, so the first glyph word must match the first spoken word.
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [3, 5, 7, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const out = phoenician(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        const glyphWords = splitWords(out.glyphs);
        assert.strictEqual(glyphWords[0], words[0]?.glyphs, `first word in ${where}`);
        assert.strictEqual(
          glyphWords[glyphWords.length - 1],
          words[words.length - 1]?.glyphs,
          `last word in ${where}`,
        );
        // No bidi format control ever reaches the output.
        assert.ok(
          !/[\u{200E}\u{200F}\u{202A}-\u{202E}\u{2066}-\u{2069}]/u.test(out.glyphs),
          `bidi control in ${where}`,
        );
      }
    }
  }
});
