// What the Ogham genome may write, and how a formula is cut.
//
// Everything here is asserted by codepoint, and section 10.1 says why: ᚄ and
// ᚅ differ by one stroke in five, ᚉ and ᚊ likewise, and the two feather marks
// are mirror twins, so a proof by looking is worth nothing. On top of that
// U+1680 is Unicode whitespace, which means a trim, a split on whitespace or
// an \s match eats the word separator silently and leaves a line that still
// reads plausibly. Nothing in this file trims, and every split takes a literal
// string.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { ALL_SCHOOLS, DIFFICULTIES, SEEDS, label, ogham, oghamWords, sweepOgham } from './gen.js';
import { LETTER_MAP, SPACE_MARK as DATA_SPACE_MARK } from '../src/ts/languages/ogham-data.js';
import {
  ALLOWED_CODEPOINTS,
  FEATHER,
  FORFEDA,
  IDIOM_TABLE,
  LETTER_TABLE,
  PEITH,
  REVERSED_FEATHER,
  ROD_JOINT,
  SPACE_MARK,
  UNASSIGNED,
  parseRods,
  rodCount,
} from './ogham-spec.js';

test('the letter map is the table of spec 10.1, token for codepoint', () => {
  assert.deepStrictEqual(
    Object.entries(LETTER_MAP),
    LETTER_TABLE.map(([token, glyph]) => [token, glyph]),
  );
  // The separator the genome declares is the space mark and nothing that looks
  // like one: an ASCII space here would leave every transliteration right and
  // every stem broken.
  assert.strictEqual(DATA_SPACE_MARK, SPACE_MARK);
  assert.strictEqual(SPACE_MARK.codePointAt(0), 0x1680);
  assert.strictEqual(FEATHER.codePointAt(0), 0x169b);
  assert.strictEqual(REVERSED_FEATHER.codePointAt(0), 0x169c);
});

test('every emitted codepoint belongs to the tables of 10.1, and nothing else', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    for (const character of out.glyphs) {
      assert.ok(
        ALLOWED_CODEPOINTS.has(character),
        `U+${(character.codePointAt(0) ?? 0).toString(16).toUpperCase()} in ${where}`,
      );
    }
    // The three unassigned codepoints of the block, named so the assertion
    // above cannot pass by accident on an empty line.
    for (const gap of UNASSIGNED) {
      assert.ok(!out.glyphs.includes(gap), `an unassigned codepoint in ${where}`);
    }
    assert.ok(out.glyphs.length > 0, `an empty glyph line in ${where}`);
  });
});

test('no borrowed script reaches an ogham line, there being no Aegean seal', () => {
  // Runic borrows Aegean digits for its counts. This genome refused the
  // borrowing because a foreign glyph carries no stem to weld into the line,
  // so its counts are spoken (spec 10.8).
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    assert.doesNotMatch(
      out.glyphs,
      /[^ -᚜]/u,
      `a codepoint outside the block in ${label(school, difficulty, seed)}`,
    );
    assert.doesNotMatch(out.glyphs, /[0-9]/u, 'a digit reached the glyph line');
  });
});

test('the glyph line opens on a feather and closes on the reversed one', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    const characters = Array.from(out.glyphs);
    assert.strictEqual(characters[0], FEATHER, `no opening feather in ${where}`);
    assert.strictEqual(
      characters[characters.length - 1],
      REVERSED_FEATHER,
      `no closing feather in ${where}`,
    );
  });
});

test('a feather stands only as the frame or as a rod joint, never alone', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    const inner = out.glyphs.slice(1, -1);
    // Every feather inside the frame belongs to a joint, which is exactly one
    // closing feather against one opening feather with nothing between them.
    const joints = inner.split(ROD_JOINT).length - 1;
    const feathers = Array.from(inner).filter(
      (character) => character === FEATHER || character === REVERSED_FEATHER,
    ).length;
    assert.strictEqual(feathers, joints * 2, `a loose feather in ${where}`);
    // And what closes a formula is never the space mark.
    assert.ok(!out.glyphs.endsWith(`${SPACE_MARK}${REVERSED_FEATHER}`), `a bare stem end in ${where}`);
  });
});

test('the rod count per tier is the one 10.13 fixes', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    assert.strictEqual(
      parseRods(out.glyphs).length,
      rodCount(difficulty),
      `rod count in ${label(school, difficulty, seed)}`,
    );
  });
});

// The whitespace assertion of spec 10.13, run on explicit matches by codepoint.
test('the space mark parts words from difficulty 3 and appears nowhere below', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    const marks = Array.from(out.glyphs).filter((character) => character === SPACE_MARK).length;
    if (difficulty <= 2) {
      assert.strictEqual(marks, 0, `continuous writing broken in ${where}`);
      return;
    }
    assert.ok(marks > 0, `no space mark in ${where}`);
    // Never first, never last, never against a feather.
    assert.ok(!out.glyphs.includes(`${FEATHER}${SPACE_MARK}`), `a mark after a feather in ${where}`);
    assert.ok(
      !out.glyphs.includes(`${SPACE_MARK}${REVERSED_FEATHER}`),
      `a mark before a feather in ${where}`,
    );
    assert.ok(!out.glyphs.includes(`${SPACE_MARK}${SPACE_MARK}`), `a doubled mark in ${where}`);
  });
});

test('the reading line writes one word wherever the glyph line writes a mark or a joint', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    const spoken = out.transliteration.split(' ');
    if (difficulty <= 2) {
      // Continuous writing: the glyph line parts nothing, and the reading line
      // still reads as speech.
      assert.ok(spoken.length >= 1, `no reading line in ${where}`);
      return;
    }
    const written = parseRods(out.glyphs).flat();
    // Word parity, asserted at the seal too, since a seal spoken in words is
    // words all the way down (spec 10.8).
    assert.strictEqual(written.length, spoken.length, `word parity in ${where}`);
    for (const word of written) {
      assert.ok(word.length > 0, `an empty word in ${where}`);
    }
  });
});

test('the reading line is lowercase ascii with single spaces and no stray mark', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    assert.match(out.transliteration, /^[a-z]+(?: [a-z]+)*$/u, `reading line in ${where}`);
    // The separator must never leak into the line a screen reader speaks.
    assert.ok(!out.transliteration.includes(SPACE_MARK), `a space mark in the reading of ${where}`);
    assert.ok(!out.transliteration.includes(FEATHER), `a feather in the reading of ${where}`);
    assert.ok(
      !out.transliteration.includes(REVERSED_FEATHER),
      `a reversed feather in the reading of ${where}`,
    );
  });
});

test('the forfeda arrive at difficulties 8 and 9 and at no tier below', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    if (difficulty >= 8) return;
    for (const letter of FORFEDA) {
      assert.ok(
        !out.glyphs.includes(letter),
        `a forfid below the scholastic tiers in ${label(school, difficulty, seed)}`,
      );
    }
  });
});

test('the scholastic license really fires, so the forfeda are reachable', () => {
  // The gate above passes on a genome that never writes a forfid at all, so
  // the other direction is asserted too: the six scholastic roots must come
  // out somewhere at the tiers that license them.
  let seen = 0;
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [8, 9]) {
      for (let seed = 0; seed < 60; seed += 1) {
        const glyphs = ogham(school, difficulty, seed).glyphs;
        if (FORFEDA.some((letter) => glyphs.includes(letter))) seen += 1;
      }
    }
  }
  assert.ok(seen > 0, 'no formula of tiers 8 and 9 ever writes a forfid');
});

test('peith writes only under the register, inside a listed dread epithet', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    if (school === 'eldritch') return;
    assert.ok(
      !out.glyphs.includes(PEITH),
      `the letter the language lost, in ${label(school, difficulty, seed)}`,
    );
  });
  // Every dread epithet carries a p, so the register brands every formula
  // built on its skeleton. Tier 2 is the stated exception: it writes two genes
  // and reaches no epithet at all, exactly as the Greek register does.
  for (const difficulty of DIFFICULTIES) {
    if (difficulty <= 2) continue;
    for (const seed of SEEDS) {
      assert.ok(
        ogham('eldritch', difficulty, seed).glyphs.includes(PEITH),
        `no p in eldritch ${label('eldritch', difficulty, seed)}`,
      );
    }
  }
});

test('adjacent identical letters are kept, never collapsed', () => {
  // The seven b's of OO1 are the extreme case the rule exists for, and the
  // MAQQI spellings of the stones are its licence (spec 10.2).
  const birch = IDIOM_TABLE.OO1?.[1] ?? '';
  assert.strictEqual(Array.from(birch).length, 7);
  const out = ogham('protection', 3, 0);
  assert.ok(out.glyphs.includes(birch), 'the birch warning lost its strokes');
  assert.ok(out.transliteration.startsWith('bbbbbbb '), 'the birch warning lost its reading');
});

test('a rod joint is exactly one closing feather against one opening feather', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const where = label(school, difficulty, seed);
    // Nothing may stand between the two, and no other pairing of feathers may
    // appear: the mirror trap of 10.1 lands here if a copy went backwards.
    assert.ok(
      !out.glyphs.includes(`${FEATHER}${REVERSED_FEATHER}`),
      `an empty rod in ${where}`,
    );
    assert.ok(
      !out.glyphs.includes(`${REVERSED_FEATHER}${SPACE_MARK}`),
      `a mark after a joint in ${where}`,
    );
  });
});

test('nothing in the pipeline can trim the separator away unnoticed', () => {
  // The trap the probe recorded, asserted as a property of the output rather
  // than as a habit of the writer: a line whose marks a generic trim would eat
  // still has to carry every one of them at the end.
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [3, 5, 7, 9]) {
      for (const seed of SEEDS) {
        const out = ogham(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        const marks = Array.from(out.glyphs).filter((c) => c === SPACE_MARK).length;
        const words = oghamWords(school, difficulty, seed).length;
        const joints = out.glyphs.split(ROD_JOINT).length - 1;
        assert.strictEqual(marks + joints, words - 1, `a mark went missing in ${where}`);
        // And the naive reading a careless test would take must disagree,
        // which is what makes the assertion above worth writing.
        assert.notStrictEqual(out.glyphs.trim(), '', `trimming emptied ${where}`);
      }
    }
  }
});
