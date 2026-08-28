import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  adverbForm,
  lettersFor,
  nounForm,
  tokenizeLatin,
  verbForm,
} from '../src/ts/languages/latin.js';
import {
  ALLOWED_CODEPOINTS,
  ANO_TELEIA,
  CAPITALS,
  CONJUGATION,
  DECLENSION,
  EXCLUDED_LETTERS,
  INTERPUNCT,
  LETTER_TABLE,
  NUMERALS,
  SEAL_TAIL_SPOKEN,
} from './latin-spec.js';
import { codePoints } from './text.js';
import { ALL_SCHOOLS, SEEDS, label, latin, latinWords, sweepLatin } from './gen.js';

const NUMERAL_WORDS: ReadonlySet<string> = new Set(
  Object.values(NUMERALS).flatMap(([, spoken]) => spoken.split(' ')),
);

test('letter table: every romanization token maps to the spec codepoint', () => {
  for (const [token, glyph] of LETTER_TABLE) {
    assert.strictEqual(lettersFor(token), glyph, `token ${token}`);
  }
  assert.strictEqual(LETTER_TABLE.length, 21, 'twenty-one tokens over twenty letters');
  assert.strictEqual(new Set(LETTER_TABLE.map(([, glyph]) => glyph)).size, 20);
});

// The one row in this project that splits a letter instead of fusing two: the
// reading line has to speak the sound the capital does not write (spec 9.1).
test('u and v both land on V, and i carries both its values', () => {
  assert.strictEqual(lettersFor('u'), 'V');
  assert.strictEqual(lettersFor('v'), 'V');
  assert.strictEqual(lettersFor('servus'), 'SERVVS');
  assert.strictEqual(lettersFor('votum'), 'VOTVM');
  assert.strictEqual(lettersFor('quaesoque'), 'QVAESOQVE');
  assert.strictEqual(lettersFor('iudicium'), 'IVDICIVM');
  assert.strictEqual(lettersFor('iane'), 'IANE');
});

test('tokenization cuts single letters, since this genome has no digraph', () => {
  assert.deepStrictEqual(tokenizeLatin('sator'), ['s', 'a', 't', 'o', 'r']);
  // The dread epithets carry th, which is two letters here and never one.
  assert.deepStrictEqual(tokenizeLatin('xulgoth'), ['x', 'u', 'l', 'g', 'o', 't', 'h']);
  assert.strictEqual(lettersFor('xulgoth'), 'XVLGOTH');
});

test('tokenization rejects the letters this alphabet does not carry', () => {
  // J, K, U as a letter of its own, W, Y and Z, plus the uppercase the map
  // never reads and the space no word holds.
  for (const word of ['jot', 'kalendae', 'wax', 'yes', 'zona', 'PORTA', 'a b']) {
    assert.throws(() => tokenizeLatin(word), `accepted ${word}`);
  }
});

test('adjacent identical letters are kept, never collapsed', () => {
  // Latin is the second genome without a collapse rule, beside Greek (9.2).
  assert.strictEqual(lettersFor('flammam'), 'FLAMMAM');
  assert.strictEqual(lettersFor('vallum'), 'VALLVM');
  assert.strictEqual(lettersFor('corvus'), 'CORVVS');
  assert.strictEqual(lettersFor('dissunapiter'), 'DISSVNAPITER');
});

test('morphology: the twelve cells of the case table, class by class', () => {
  const cases = ['nominative', 'accusative', 'genitive', 'vocative'] as const;
  const classes = ['a', 'us', 'um'] as const;
  DECLENSION.forEach(([stem, ...written], index) => {
    const nounClass = classes[index];
    assert.ok(nounClass !== undefined);
    cases.forEach((kase, cell) => {
      assert.strictEqual(
        lettersFor(nounForm(stem, nounClass, kase)),
        written[cell],
        `${stem} ${kase}`,
      );
    });
  });
});

// One written rule rides on the table (spec 9.4): GENIE is not a form Latin
// has, and the bare stem is.
test('morphology: an i-final stem of the -us class is its own vocative', () => {
  assert.strictEqual(lettersFor(nounForm('geni', 'us', 'vocative')), 'GENI');
  assert.strictEqual(lettersFor(nounForm('nunti', 'us', 'vocative')), 'NVNTI');
  assert.strictEqual(lettersFor(nounForm('geni', 'us', 'nominative')), 'GENIVS');
  // And the rule reaches no other class and no other case.
  assert.strictEqual(lettersFor(nounForm('silenti', 'um', 'vocative')), 'SILENTIVM');
  assert.strictEqual(lettersFor(nounForm('mur', 'us', 'vocative')), 'MVRE');
});

test('morphology: the five verb forms, the enclitic and the adverb in -E', () => {
  const [first, third, imperative, future, perfect, asking] = CONJUGATION;
  assert.strictEqual(lettersFor(verbForm('lig', 'o')), first?.[1]);
  assert.strictEqual(lettersFor(verbForm('monstr', 'at')), third?.[1]);
  assert.strictEqual(lettersFor(verbForm('lig', 'a')), imperative?.[1]);
  assert.strictEqual(lettersFor(verbForm('lig', 'ato')), future?.[1]);
  assert.strictEqual(lettersFor(verbForm('lig', 'avi')), perfect?.[1]);
  assert.strictEqual(lettersFor(`${verbForm('monstr', 'at')}ne`), asking?.[1]);
  // The first conjugation attaches its perfect to every stem unchanged, which
  // is this genome's answer to the Greek aorist fusion (spec 9.4).
  assert.strictEqual(verbForm('serv', 'avi'), 'servavi');
  assert.strictEqual(verbForm('revoc', 'avi'), 'revocavi');
  assert.strictEqual(verbForm('nov', 'avi'), 'novavi');
  assert.strictEqual(adverbForm('amar'), 'amare');
  assert.strictEqual(lettersFor(adverbForm('clar')), 'CLARE');
});

test('transliteration is lowercase ascii words in every output', () => {
  sweepLatin(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    assert.match(out.transliteration, /^[a-z]+(?: [a-z]+)*$/u, label(school, difficulty, seed));
  });
});

test('the glyph line is monumental capitals and nothing else, ever', () => {
  sweepLatin(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    for (const cp of codePoints(out.glyphs)) {
      assert.ok(
        ALLOWED_CODEPOINTS.has(cp),
        `forbidden codepoint U+${(cp.codePointAt(0) ?? 0).toString(16)} in ${where}`,
      );
    }
    assert.doesNotMatch(out.glyphs, /[a-z]/u, `lowercase in ${where}`);
    for (const letter of EXCLUDED_LETTERS) {
      assert.ok(!out.glyphs.includes(letter), `${letter} in ${where}`);
    }
    assert.strictEqual(out.glyphs, out.glyphs.toUpperCase(), `not uppercase in ${where}`);
    // The homoglyph, read by number: the ano teleia is the same picture and
    // this project writes it in its own Greek output (spec 9.1).
    assert.ok(!out.glyphs.includes(ANO_TELEIA), `the ano teleia in ${where}`);
  });
});

test('the separator is the interpunct, at U+00B7 and not its look-alike', () => {
  assert.strictEqual(INTERPUNCT.codePointAt(0), 0x00b7);
  assert.strictEqual(ANO_TELEIA.codePointAt(0), 0x0387);
  assert.notStrictEqual(INTERPUNCT, ANO_TELEIA);
  for (const glyph of CAPITALS) {
    const code = glyph.codePointAt(0) ?? 0;
    assert.ok(code >= 0x0041 && code <= 0x005a, `${glyph} is outside the capital range`);
  }
  // Every codepoint of the contract sits in Basic Latin or Latin-1, which is
  // the whole reason this genome ships no font (spec 9.1).
  for (const cp of ALLOWED_CODEPOINTS) {
    assert.ok((cp.codePointAt(0) ?? 0) <= 0x00ff, `${cp} is outside Latin-1`);
  }
});

test('difficulty 1 and 2 write continuously, three and up separate on the interpunct', () => {
  sweepLatin(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    if (difficulty <= 2) {
      assert.ok(!out.glyphs.includes(INTERPUNCT), `separator in ${where}`);
      return;
    }
    assert.ok(out.glyphs.includes(INTERPUNCT), `no separator in ${where}`);
    assert.ok(!out.glyphs.startsWith(INTERPUNCT), `leading separator in ${where}`);
    assert.ok(!out.glyphs.endsWith(INTERPUNCT), `trailing separator in ${where}`);
    assert.ok(
      !out.glyphs.includes(`${INTERPUNCT}${INTERPUNCT}`),
      `empty word in ${where}`,
    );
  });
});

// The token map holds both ways (spec 9.13): uppercasing a transliterated word
// and mapping u and v to V yields exactly its glyph word.
test('every transliterated word maps letter for letter onto its glyph word', () => {
  sweepLatin(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    const words = out.transliteration.split(' ');
    if (difficulty <= 2) {
      assert.strictEqual(out.glyphs, words.map(lettersFor).join(''), where);
      return;
    }
    const groups = out.glyphs.split(INTERPUNCT);
    // A numeral group speaks two words at the count 27, so word-count parity
    // is not asserted across the seal (spec 9.8). Everything in front of the
    // numeral maps one to one, and DICITO behind it maps like any word.
    const sealed = difficulty >= 7;
    const spoken = sealed
      ? (words[words.length - 2] === 'novies' && words[words.length - 3] === 'ter' ? 2 : 1)
      : 0;
    const written = sealed ? groups.slice(0, -2) : groups;
    const body = sealed ? words.slice(0, -(spoken + 1)) : words;
    assert.strictEqual(body.length, written.length, `word count in ${where}`);
    body.forEach((word, index) => {
      assert.strictEqual(lettersFor(word), written[index], `word ${word} in ${where}`);
    });
  });
});

test('the seal is a numeral group and its instruction, at the absolute end', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2, 3, 4, 5, 6]) {
        const out = latin(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        assert.ok(!out.glyphs.endsWith('DICITO'), `seal at ${where}`);
        assert.ok(!latinWords(school, difficulty, seed).includes(SEAL_TAIL_SPOKEN), `dicito at ${where}`);
      }
      for (const difficulty of [7, 8, 9]) {
        const where = label(school, difficulty, seed);
        const out = latin(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        const groups = out.glyphs.split(INTERPUNCT);
        assert.strictEqual(groups[groups.length - 1], 'DICITO', `no DICITO closing ${where}`);
        const numeral = groups[groups.length - 2] ?? '';
        const count = Object.entries(NUMERALS).find(([, [glyphs]]) => glyphs === numeral);
        assert.ok(count !== undefined, `numeral off the table in ${where}: ${numeral}`);
        // Additive and never subtractive: nine is VIIII and no pair of the
        // subtractive kind is ever emitted (spec 9.8).
        for (const pair of ['IV', 'IX', 'XL']) {
          assert.ok(!numeral.includes(pair), `subtractive numeral in ${where}`);
        }
        const spoken = (count?.[1][1] ?? '').split(' ');
        assert.strictEqual(words[words.length - 1], SEAL_TAIL_SPOKEN, `spoken tail in ${where}`);
        assert.deepStrictEqual(
          words.slice(-(spoken.length + 1), -1),
          spoken,
          `numeral word in ${where}`,
        );
        // The instruction is the only place this verb ever stands.
        assert.strictEqual(
          words.filter((word) => word === SEAL_TAIL_SPOKEN).length,
          1,
          `dicito written twice in ${where}`,
        );
        assert.strictEqual(
          words.filter((word) => NUMERAL_WORDS.has(word)).length,
          spoken.length,
          `a numeral adverb outside the seal in ${where}`,
        );
      }
    }
  }
});
