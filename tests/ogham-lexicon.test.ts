// The Ogham lexicon against spec 10.3, and the listed data against 10.6 to
// 10.10.
//
// This genome coins, so the phonotactics are the whole discipline of the
// invention and they are checked here rather than trusted. And the listed
// half is checked the other way round: a quoted word is held as a sequence of
// codepoints and must equal the one the specification wrote, because running
// its romanization back through the greedy map welds coi into a forfid.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  ADVERBS as DATA_ADVERBS,
  BRIGHT_POWER,
  DARK_POWER,
  DIRECTION_WORDS,
  DREAD_POWER,
  FIELDS,
  FN_DO,
  FN_IN,
  FN_VRIT,
  IDIOM_WORDS,
  KENNING_VOX,
  OC5_TAIL,
  SEAL_COUNTS,
  SEAL_HEAD,
  SEAL_NUMERALS,
  type Listed,
  type OghamRoot,
} from '../src/ts/languages/ogham-data.js';
import { adverbForm, lettersFor, nounForm, tokenizeOgham, verbForm } from '../src/ts/languages/ogham.js';
import {
  ADVERBS,
  ADVERB_SAMPLE,
  CONJUGATION,
  DECLENSION,
  DIRECTION_WORDS_SPEC,
  DREAD_TABLE,
  FUNCTION_WORDS,
  IDIOM_TABLE,
  INTRANSITIVE,
  KENNING_TABLE,
  LEXICON,
  NOUN_ENDINGS,
  NUMERALS,
  OC5_TAIL_SPEC,
  POWER_TABLE,
  ROW_NAMES,
  SCHOLASTIC,
  SEAL_COUNTS_SPEC,
  SEAL_HEAD_SPOKEN,
  SEAL_SAMPLE,
  SPACE_MARK,
} from './ogham-spec.js';

const ALL_ROOTS: ReadonlyArray<OghamRoot> = Object.values(FIELDS).flat();

// The four cases of 10.4, in the order the table gives them, so the endings
// below are read off the forms rather than pasted beside them.
const NOUN_CASES = ['nominative', 'accusative', 'genitive', 'vocative'] as const;

test('the fifteen fields carry the roots of 10.3, in the order it lists them', () => {
  assert.deepStrictEqual(Object.keys(FIELDS).sort(), Object.keys(LEXICON).sort());
  for (const [field, rows] of Object.entries(LEXICON)) {
    assert.deepStrictEqual(
      FIELDS[field as keyof typeof FIELDS].map((root) => root.root),
      rows.map(([root]) => root),
      `the ${field} field drifted from the spec`,
    );
  }
  // Twelve fields still hold ten. Summoning, binding and course are shorter
  // since the dead-lexicon sweep took out the nouns no order ever asked them
  // for (spec 10.3).
  assert.strictEqual(ALL_ROOTS.length, 139, 'twelve fields of ten roots and three shortened');
});

test('exactly three roots are intransitive and exactly six are scholastic', () => {
  assert.deepStrictEqual(
    ALL_ROOTS.filter((root) => root.intransitive === true).map((root) => root.root),
    [...INTRANSITIVE].sort((a, b) => ALL_ROOTS.findIndex((r) => r.root === a) - ALL_ROOTS.findIndex((r) => r.root === b)),
  );
  assert.deepStrictEqual(
    ALL_ROOTS.filter((root) => root.scholastic === true).map((root) => root.root).sort(),
    [...SCHOLASTIC].sort(),
  );
});

// --- The coining rules of 10.3 ---------------------------------------------

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const FORFID_PAIRS = new Set(['ea', 'oi', 'ui', 'io', 'ae']);

test('no coined root carries the letter the language lost', () => {
  // p exists only under the register, inside a listed epithet (spec 10.10).
  for (const root of ALL_ROOTS) {
    assert.ok(!root.root.includes('p'), `p in the coined root ${root.root}`);
  }
});

test('no coined root reaches outside the romanization of 10.3', () => {
  for (const root of ALL_ROOTS) {
    assert.doesNotMatch(root.root, /[fjkwxyz]/u, `a forbidden letter in ${root.root}`);
    assert.match(root.root, /^[a-z]+$/u, `${root.root} is not a romanization`);
  }
});

test('h stands word-initially and nowhere else', () => {
  for (const root of ALL_ROOTS) {
    assert.ok(!root.root.slice(1).includes('h'), `an internal h in ${root.root}`);
  }
});

test('every coined root ends in a consonant, because every ending opens on a vowel', () => {
  for (const root of ALL_ROOTS) {
    const last = root.root.slice(-1);
    assert.ok(!VOWELS.has(last), `${root.root} ends in a vowel`);
  }
  for (const ending of [...NOUN_ENDINGS, 'u', 'it', 'etu', 'us']) {
    assert.ok(VOWELS.has(ending.charAt(0)), `the ending ${ending} does not open on a vowel`);
  }
});

test('no two vowels stand adjacent, except one written diphthong in a scholastic root', () => {
  for (const root of ALL_ROOTS) {
    const pairs: string[] = [];
    for (let index = 0; index + 1 < root.root.length; index += 1) {
      const pair = root.root.slice(index, index + 2);
      if (VOWELS.has(pair.charAt(0)) && VOWELS.has(pair.charAt(1))) pairs.push(pair);
    }
    if (root.scholastic === true) {
      assert.strictEqual(pairs.length, 1, `${root.root} is flagged scholastic on ${pairs.length} pairs`);
      assert.ok(FORFID_PAIRS.has(pairs[0] ?? ''), `${root.root} carries the pair ${pairs[0]}`);
      continue;
    }
    assert.deepStrictEqual(pairs, [], `a vowel pair in the unflagged root ${root.root}`);
  }
});

test('every coined root is one to three syllables, counted on the romanization', () => {
  for (const root of ALL_ROOTS) {
    // A digraph counts as the one sound its single letter writes, which the
    // tokenizer already knows.
    const syllables = tokenizeOgham(root.root).filter((token) => VOWELS.has(token.charAt(0))).length;
    assert.ok(syllables >= 1 && syllables <= 3, `${root.root} counts ${syllables} syllables`);
  }
});

test('no root reparses under the greedy map, so its letters are the letters meant', () => {
  for (const root of ALL_ROOTS) {
    const tokens = tokenizeOgham(root.root);
    assert.strictEqual(tokens.join(''), root.root, `${root.root} does not round-trip`);
    // A root that carries ng or st carries the letter on purpose, and the six
    // roots that do are named by 10.3.
    const digraphs = tokens.filter((token) => token.length === 2);
    for (const digraph of digraphs) {
      assert.ok(
        ['ng', 'st', ...FORFID_PAIRS].includes(digraph),
        `${root.root} welds ${digraph}, which is no letter`,
      );
    }
  }
});

test('no ending or prefix ever welds a digraph across its seam', () => {
  // Spec 10.4: no ending begins with g or t after a consonant, so ng and st
  // arise only where a root wrote them on purpose. The check is run on the
  // tokens rather than on the claim.
  for (const root of ALL_ROOTS) {
    const own = tokenizeOgham(root.root);
    const built = [
      ...NOUN_CASES.map((kase) => nounForm(root.root, kase)),
      verbForm(root.root, 'u'),
      verbForm(root.root, 'it'),
      verbForm(root.root, 'bare'),
      verbForm(root.root, 'etu'),
    ];
    for (const word of built) {
      const tokens = tokenizeOgham(word);
      assert.deepStrictEqual(
        tokens.slice(0, own.length),
        own,
        `the seam of ${word} reparsed the root`,
      );
    }
  }
});

// ro- and co- fuse to the front of a drawn word, so their seam is the one the
// spec's no-weld rule does not cover by construction: ro before a
// vowel-initial root would weld oi or io, and co before one would do the same.
// What keeps them safe is the lexicon itself, so that is what is asserted.
const PERFECTIVE_FIELDS = ['course', 'binding'] as const;

test('nothing the perfective or the adverb can reach begins on a vowel', () => {
  const reachable = [
    ...PERFECTIVE_FIELDS.flatMap((field) =>
      FIELDS[field].filter((root) => root.forms.includes('verb')),
    ),
    ...ALL_ROOTS.filter((root) => root.forms.includes('adv')),
  ];
  assert.ok(reachable.length > 0, 'no root reaches a prefix at all');
  for (const root of reachable) {
    assert.ok(
      !VOWELS.has(root.root.charAt(0)),
      `${root.root} would weld a digraph behind its prefix`,
    );
  }
});

test('the perfective and the adverb keep their prefix off the root letters', () => {
  const reachable = [
    ...PERFECTIVE_FIELDS.flatMap((field) =>
      FIELDS[field].filter((root) => root.forms.includes('verb')),
    ),
  ];
  for (const root of reachable) {
    const tokens = tokenizeOgham(verbForm(root.root, 'perfective'));
    assert.deepStrictEqual(tokens.slice(0, 2), ['r', 'o'], `ro welded into ${root.root}`);
    assert.strictEqual(tokens[tokens.length - 1], 's', `-us lost its s on ${root.root}`);
  }
  for (const adverb of ADVERBS) {
    const tokens = tokenizeOgham(adverb);
    assert.deepStrictEqual(tokens.slice(0, 2), ['c', 'o'], `co welded into ${adverb}`);
  }
});

test('the adverbs are the closed set of six the spec names', () => {
  const declared = ALL_ROOTS.filter((root) => root.forms.includes('adv')).map((root) =>
    adverbForm(root.root),
  );
  assert.deepStrictEqual(declared.sort(), [...ADVERBS].sort());
  assert.deepStrictEqual([...DATA_ADVERBS].sort(), [...ADVERBS].sort());
  assert.strictEqual(lettersFor(ADVERB_SAMPLE[0]), ADVERB_SAMPLE[1]);
});

test('past participles are declared in the harm field alone', () => {
  for (const [field, roots] of Object.entries(FIELDS)) {
    for (const root of roots) {
      if (!root.forms.includes('pp')) continue;
      assert.strictEqual(field, 'harm', `a participle on ${root.root}, outside harm`);
    }
  }
});

// --- The paradigm of 10.4 ---------------------------------------------------

test('the four noun forms are the stem plus -as, -an, -i or -e', () => {
  const built = NOUN_CASES.map((kase) => nounForm('cur', kase));
  assert.deepStrictEqual(
    built.map((form) => form.slice('cur'.length)),
    [...NOUN_ENDINGS],
  );
  assert.deepStrictEqual(built, DECLENSION.map(([spoken]) => spoken));
  for (const [spoken, glyphs] of DECLENSION) {
    assert.strictEqual(lettersFor(spoken), glyphs, `the glyphs of ${spoken}`);
  }
});

test('the five verb forms are the ones 10.4 tabulates', () => {
  const built = [
    verbForm('nasc', 'u'),
    verbForm('nasc', 'it'),
    verbForm('nasc', 'bare'),
    verbForm('nasc', 'etu'),
    verbForm('nasc', 'perfective'),
  ];
  assert.deepStrictEqual(built, CONJUGATION.map(([spoken]) => spoken));
  for (const [spoken, glyphs] of CONJUGATION) {
    assert.strictEqual(lettersFor(spoken), glyphs, `the glyphs of ${spoken}`);
  }
});

// --- The listed data of 10.6 to 10.10 ---------------------------------------

function written(words: ReadonlyArray<Listed>): { spoken: string; glyphs: string } {
  return {
    spoken: words.map((word) => word.spoken).join(' '),
    glyphs: words.map((word) => word.glyphs).join(SPACE_MARK),
  };
}

test('every idiom is the word list and the glyph row of 10.6 and 10.10', () => {
  assert.deepStrictEqual(Object.keys(IDIOM_WORDS).sort(), Object.keys(IDIOM_TABLE).sort());
  for (const [id, [spoken, glyphs]] of Object.entries(IDIOM_TABLE)) {
    const held = written(IDIOM_WORDS[id as keyof typeof IDIOM_WORDS]);
    assert.strictEqual(held.spoken, spoken, `the reading of ${id}`);
    assert.strictEqual(held.glyphs, glyphs, `the glyphs of ${id}`);
  }
});

test('the row is recited parted, one attested name per letter', () => {
  assert.deepStrictEqual(
    IDIOM_WORDS.OO3_FULL.map((word) => word.spoken),
    [...ROW_NAMES],
  );
  assert.strictEqual(IDIOM_WORDS.OO3_FULL.length, 20, 'twenty for twenty');
  assert.strictEqual(IDIOM_WORDS.OO3_SHORT.length, 5, 'five for five');
  for (const word of IDIOM_WORDS.OO3_FULL) {
    assert.strictEqual(Array.from(word.glyphs).length, 1, `${word.spoken} is not one letter`);
  }
  // The register reads the row against its order, whole above difficulty 6 and
  // the last aicme alone below it (spec 10.10).
  assert.deepStrictEqual(
    IDIOM_WORDS.ELDRITCH_OPEN_FULL.map((word) => word.spoken),
    [...ROW_NAMES].reverse(),
  );
  assert.deepStrictEqual(
    IDIOM_WORDS.ELDRITCH_OPEN_SHORT.map((word) => word.spoken),
    ['idad', 'edad', 'ur', 'onn', 'ailm'],
  );
});

test('listed data is held as codepoints and never re-derived by the greedy map', () => {
  // The trap the spec left in deliberately. coi would weld into ᚉᚖ and ogmios
  // into ᚑᚌᚋᚘᚄ, so both are named here as the failure they must not be.
  const coi = IDIOM_WORDS.OC1[0];
  assert.notStrictEqual(coi?.glyphs, lettersFor('coi'), 'coi was re-derived');
  assert.strictEqual(coi?.glyphs, IDIOM_TABLE.OC1?.[1]);

  const ogmios = BRIGHT_POWER.find((power) => power.id === 'ogmios');
  assert.notStrictEqual(ogmios?.glyphs, lettersFor('ogmios'), 'ogmios was re-derived');

  for (const [id, glyphs] of POWER_TABLE) {
    const held = [...BRIGHT_POWER, ...DARK_POWER].find((power) => power.id === id);
    assert.strictEqual(held?.glyphs, glyphs, `the glyphs of ${id}`);
  }
});

test('the kenning vox is the five listed letters, spoken by their names', () => {
  assert.deepStrictEqual(
    KENNING_VOX.map((letter) => [letter.id, letter.spoken, letter.glyphs]),
    KENNING_TABLE.map(([id, spoken, glyphs]) => [id, spoken, glyphs]),
  );
});

test('the numerals and the seal head are the words of 10.8', () => {
  assert.deepStrictEqual([...SEAL_COUNTS], [...SEAL_COUNTS_SPEC]);
  for (const [count, [spoken, glyphs]] of Object.entries(NUMERALS)) {
    const held = written(SEAL_NUMERALS[Number(count) as keyof typeof SEAL_NUMERALS]);
    assert.strictEqual(held.spoken, spoken, `the reading of the count ${count}`);
    assert.strictEqual(held.glyphs, glyphs, `the glyphs of the count ${count}`);
  }
  assert.strictEqual(SEAL_HEAD.spoken, SEAL_HEAD_SPOKEN);
  assert.strictEqual(
    written([SEAL_HEAD, ...SEAL_NUMERALS[3]]).glyphs,
    SEAL_SAMPLE[1],
    'the seal is the instruction then the count',
  );
});

test('the function words and the direction words are the rows of 10.4', () => {
  const held = new Map([
    ['vrit', FN_VRIT.glyphs],
    ['do', FN_DO.glyphs],
    ['in', FN_IN.glyphs],
  ]);
  for (const [spoken, glyphs] of FUNCTION_WORDS) {
    const carried = held.get(spoken);
    if (carried === undefined) continue;
    assert.strictEqual(carried, glyphs, `the glyphs of ${spoken}`);
  }
  for (const [id, [spoken, glyphs]] of Object.entries(DIRECTION_WORDS_SPEC)) {
    const word = DIRECTION_WORDS[id as keyof typeof DIRECTION_WORDS];
    assert.strictEqual(word.spoken, spoken, `the reading of ${id}`);
    assert.strictEqual(word.glyphs, glyphs, `the glyphs of ${id}`);
  }
  // beos writes its e and o as two plain letters, no forfid: listed data owes
  // the coining rules nothing.
  assert.strictEqual(DIRECTION_WORDS.still.letters.join('|'), 'b|e|o|s');
  assert.strictEqual(OC5_TAIL.spoken, OC5_TAIL_SPEC[0]);
  assert.strictEqual(OC5_TAIL.glyphs, OC5_TAIL_SPEC[1]);
});

test('every dread epithet is a listed form carrying the letter p', () => {
  assert.deepStrictEqual(
    DREAD_POWER.map((epithet) => [epithet.id, epithet.glyphs]),
    DREAD_TABLE.map(([word, glyphs]) => [word, glyphs]),
  );
  for (const epithet of DREAD_POWER) {
    assert.ok(epithet.spoken.includes('p'), `${epithet.spoken} carries no p`);
    // Each is built to fail the native tests on sight, so none may pass them.
    const fails =
      epithet.spoken.includes('p') ||
      epithet.spoken.slice(1).includes('h') ||
      /(.)\1/u.test(epithet.spoken);
    assert.ok(fails, `${epithet.spoken} would pass for a native root`);
  }
});

test('no attested name and no epithet collides with a coined root', () => {
  const roots = new Set(ALL_ROOTS.map((root) => root.root));
  for (const listed of [...BRIGHT_POWER, ...DARK_POWER, ...DREAD_POWER]) {
    assert.ok(!roots.has(listed.id), `${listed.id} is both listed and coined`);
  }
});
