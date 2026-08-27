import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  adverbForm,
  aoristForm,
  eldritchRoot,
  lettersFor,
  nounForm,
  tokenizeGreek,
  verbForm,
} from '../src/ts/languages/greek.js';
import {
  ALLOWED_CODEPOINTS,
  ANO_TELEIA,
  AORIST_TABLE,
  KOPPA,
  LETTER_TABLE,
  NUMERAL_SIGN,
  NUMERALS,
  UNASSIGNED_SIGMA,
} from './greek-spec.js';
import { codePoints } from './text.js';
import { ALL_SCHOOLS, SEEDS, greek, greekWords, label, sweepGreek } from './gen.js';

test('letter table: every romanization token maps to the spec codepoint', () => {
  for (const [token, glyph] of LETTER_TABLE) {
    assert.strictEqual(lettersFor(token), glyph, `token ${token}`);
  }
  assert.strictEqual(LETTER_TABLE.length, 24, 'the alphabet is 24 letters');
});

test('tokenization is greedy longest match over the seven digraphs', () => {
  for (const digraph of ['ee', 'th', 'ks', 'oo', 'ph', 'kh', 'ps']) {
    assert.deepStrictEqual(tokenizeGreek(digraph), [digraph], `digraph ${digraph}`);
  }
  assert.deepStrictEqual(tokenizeGreek('sphrag'), ['s', 'ph', 'r', 'a', 'g']);
  assert.deepStrictEqual(tokenizeGreek('phulakteerion'), [
    'ph', 'u', 'l', 'a', 'k', 't', 'ee', 'r', 'i', 'o', 'n',
  ]);
  assert.deepStrictEqual(tokenizeGreek('aioonos'), ['a', 'i', 'oo', 'n', 'o', 's']);
});

test('tokenization rejects letters outside the romanization', () => {
  // No h standing alone, and none of c, q, v, w, x, y, j (spec 8.3).
  for (const word of ['hera', 'cyrus', 'qoph', 'vex', 'wax', 'yes', 'jot', 'a b']) {
    assert.throws(() => tokenizeGreek(word), `accepted ${word}`);
  }
});

test('the ps and ks digraphs are single letters, and doubles are kept', () => {
  assert.strictEqual(lettersFor('ps'), 'Ψ');
  assert.strictEqual(lettersFor('ks'), 'Ξ');
  // Greek writes its geminates: this genome has no collapse rule and is the
  // only one of the four without one (spec 8.2).
  assert.strictEqual(lettersFor('aggelos'), 'ΑΓΓΕΛΟΣ');
  assert.strictEqual(lettersFor('aporreeton'), 'ΑΠΟΡΡΗΤΟΝ');
  assert.strictEqual(lettersFor('akrammakhamarei'), 'ΑΚΡΑΜΜΑΧΑΜΑΡΕΙ');
});

test('morphology: the four noun endings of the second declension', () => {
  assert.strictEqual(nounForm('phulak', 'os'), 'phulakos');
  assert.strictEqual(nounForm('phulak', 'on'), 'phulakon');
  assert.strictEqual(nounForm('phulak', 'ou'), 'phulakou');
  assert.strictEqual(nounForm('phulak', 'e'), 'phulake');
  assert.strictEqual(lettersFor(nounForm('phulak', 'os')), 'ΦΥΛΑΚΟΣ');
});

test('morphology: the five verb forms, and the adverb in -oos', () => {
  assert.strictEqual(verbForm('desm', 'oo'), 'desmoo');
  assert.strictEqual(verbForm('desm', 'ei'), 'desmei');
  assert.strictEqual(verbForm('desm', 'e'), 'desme');
  assert.strictEqual(verbForm('desm', 'etoo'), 'desmetoo');
  assert.strictEqual(lettersFor(verbForm('desm', 'etoo')), 'ΔΕΣΜΕΤΩ');
  assert.strictEqual(adverbForm('pikr'), 'pikroos');
  assert.strictEqual(lettersFor(adverbForm('pikr')), 'ΠΙΚΡΩΣ');
});

// The genome's signature transformation, the counterpart of the Runic rune
// collapse and the Phoenician vowel drop.
test('the aorist fusion follows the spec table, branch by branch', () => {
  for (const [root, aorist] of AORIST_TABLE) {
    assert.strictEqual(aoristForm(root), aorist, `aorist of ${root}`);
  }
  // A stem in a velar writes Ξ, a labial writes Ψ, a dental writes Σ, and a
  // liquid, a nasal or a sigma takes -ΗΣΑ instead.
  assert.strictEqual(lettersFor(aoristForm('sphrag')), 'ΣΦΡΑΞΑ');
  assert.strictEqual(lettersFor(aoristForm('lamp')), 'ΛΑΜΨΑ');
  assert.strictEqual(lettersFor(aoristForm('krupt')), 'ΚΡΥΨΑ');
  assert.strictEqual(lettersFor(aoristForm('desm')), 'ΔΕΣΜΗΣΑ');
  assert.strictEqual(lettersFor(aoristForm('paus')), 'ΠΑΥΣΗΣΑ');
  // Every branch of the table, on one root of each shape.
  assert.strictEqual(aoristForm('katokh'), 'katoksa');
  assert.strictEqual(aoristForm('streph'), 'strepsa');
  assert.strictEqual(aoristForm('brad'), 'brasa');
  assert.strictEqual(aoristForm('air'), 'aireesa');
  assert.strictEqual(aoristForm('kain'), 'kaineesa');
});

test('the eldritch register lengthens vowels and hardens s and t', () => {
  // Spec 8.10's own example: elth keeps its ending and its root vowel grows.
  assert.strictEqual(eldritchRoot('elth'), 'eelth');
  assert.strictEqual(lettersFor(verbForm(eldritchRoot('elth'), 'e')), 'ΗΛΘΕ');
  assert.strictEqual(eldritchRoot('skot'), 'kskooth');
  assert.strictEqual(eldritchRoot('nos'), 'nooks');
  // The digraphs already contain their letters and are left alone, so the rule
  // never runs twice on one sound.
  assert.strictEqual(eldritchRoot('psukh'), 'psukh');
  assert.strictEqual(eldritchRoot('phthor'), 'phthoor');
  assert.strictEqual(eldritchRoot('oor'), 'oor');
});

test('transliteration is lowercase ascii words in every output', () => {
  sweepGreek(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    assert.match(out.transliteration, /^[a-z]+(?: [a-z]+)*$/u, label(school, difficulty, seed));
  });
});

test('the glyph line is uppercase greek and nothing else, ever', () => {
  sweepGreek(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    for (const cp of codePoints(out.glyphs)) {
      assert.ok(
        ALLOWED_CODEPOINTS.has(cp),
        `forbidden codepoint U+${(cp.codePointAt(0) ?? 0).toString(16)} in ${where}`,
      );
    }
    // No lowercase letter, no accent, no breathing, no final sigma, and never
    // the unassigned codepoint between rho and sigma (spec 8.13).
    assert.doesNotMatch(out.glyphs, /[\u{03B1}-\u{03C9}]/u, `lowercase in ${where}`);
    assert.doesNotMatch(out.glyphs, /\u{03C2}/u, `final sigma in ${where}`);
    assert.ok(!out.glyphs.includes(UNASSIGNED_SIGMA), `U+03A2 in ${where}`);
    assert.strictEqual(out.glyphs, out.glyphs.toUpperCase(), `not uppercase in ${where}`);
  });
});

test('difficulty 1 and 2 write continuously, three and up separate on the ano teleia', () => {
  sweepGreek(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    if (difficulty <= 2) {
      assert.ok(!out.glyphs.includes(ANO_TELEIA), `separator in ${where}`);
      return;
    }
    assert.ok(out.glyphs.includes(ANO_TELEIA), `no separator in ${where}`);
    assert.ok(!out.glyphs.startsWith(ANO_TELEIA), `leading separator in ${where}`);
    assert.ok(!out.glyphs.endsWith(ANO_TELEIA), `trailing separator in ${where}`);
    assert.ok(!out.glyphs.includes(`${ANO_TELEIA}${ANO_TELEIA}`), `empty word in ${where}`);
  });
});

test('every transliterated word maps letter for letter onto its glyph word', () => {
  sweepGreek(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    const words = out.transliteration.split(' ');
    if (difficulty <= 2) {
      assert.strictEqual(out.glyphs, words.map(lettersFor).join(''), where);
      return;
    }
    const groups = out.glyphs.split(ANO_TELEIA);
    // A numeral seal speaks two words for one glyph group at the count 99, so
    // word-count parity is not asserted across the seal (spec 8.8). Everything
    // in front of it maps one to one.
    const numeral = groups[groups.length - 1] ?? '';
    const sealed = numeral.endsWith(NUMERAL_SIGN);
    const numeralWords = numeral.includes(KOPPA) ? 2 : 1;
    const written = sealed ? groups.slice(0, -2) : groups;
    const body = sealed ? words.slice(0, -(numeralWords + 1)) : words;
    assert.strictEqual(body.length, written.length, `word count in ${where}`);
    body.forEach((word, index) => {
      assert.strictEqual(lettersFor(word), written[index], `word ${word} in ${where}`);
    });
  });
});

test('the seal closes the formula, one numeral group under the numeral sign', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2, 3, 4, 5, 6]) {
        const out = greek(school, difficulty, seed);
        assert.ok(!out.glyphs.includes(NUMERAL_SIGN), `seal at ${label(school, difficulty, seed)}`);
        assert.ok(!out.glyphs.includes(KOPPA), `koppa at ${label(school, difficulty, seed)}`);
      }
      for (const difficulty of [7, 8, 9]) {
        const where = label(school, difficulty, seed);
        const out = greek(school, difficulty, seed);
        const words = greekWords(school, difficulty, seed);
        const numeral = out.glyphs.split(ANO_TELEIA).pop() ?? '';
        assert.ok(numeral.endsWith(NUMERAL_SIGN), `no numeral sign at the end of ${where}`);
        assert.strictEqual(
          codePoints(out.glyphs).filter((c) => c === NUMERAL_SIGN).length,
          1,
          `more than one numeral sign in ${where}`,
        );
        const count = Object.entries(NUMERALS).find(([, [glyphs]]) => glyphs === numeral);
        assert.ok(count !== undefined, `numeral off the table in ${where}: ${numeral}`);
        const spoken = (count?.[1][1] ?? '').split(' ');
        assert.deepStrictEqual(words.slice(-spoken.length), spoken, `numeral word in ${where}`);
        assert.strictEqual(
          words[words.length - spoken.length - 1],
          'lege',
          `the seal word does not head its numeral in ${where}`,
        );
        // Koppa stands inside the count 99 and nowhere else.
        assert.strictEqual(
          out.glyphs.includes(KOPPA),
          numeral === NUMERALS[99]?.[0],
          `koppa outside the count 99 in ${where}`,
        );
      }
    }
  }
});
