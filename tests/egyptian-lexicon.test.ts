import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  AGENT_POWER,
  ALL_POWER,
  ASSUMED_POWER,
  BRIGHT_POWER,
  DIVINATION_POWER,
  DIRECTION_WORDS,
  DREAD_POWER,
  EC5_HEAD,
  FIELD_DET,
  FIELDS,
  FN_INIW,
  FN_INK,
  HOR,
  IDIOM_WORDS,
  IMEN,
  NUMERAL_WORDS,
  SIGN_MAP,
} from '../src/ts/languages/egyptian-data.js';
import { glyphsFor } from '../src/ts/languages/egyptian.js';
import { egyptianGlosses } from '../src/ts/glosses/en/egyptian.js';
import type { SemanticField } from '../src/ts/generator/types.js';
import {
  ASSUMED_SPOKEN,
  DETERMINATIVE_TABLE,
  DIRECTION_GLYPHS,
  DIRECTION_SPOKEN,
  DIVINATION_SPOKEN,
  EC5_HEAD_GLYPHS,
  EC5_HEAD_SPOKEN,
  DREAD_TABLE,
  EC1_GLYPHS,
  EC1_SPOKEN,
  EC2_GLYPHS,
  EC2_SPOKEN,
  EC4_GLYPHS,
  EC4_SPOKEN,
  ELDRITCH_CLOSE_GLYPHS,
  ELDRITCH_CLOSE_SPOKEN,
  ELDRITCH_OPEN_SPOKEN,
  EO1_GLYPHS,
  EO1_SPOKEN,
  EO4_GLYPHS,
  EO4_SPOKEN,
  HOR_ROW,
  IMEN_ROW,
  INIW_GLYPHS,
  INIW_SPOKEN,
  INK_GLYPHS,
  INK_SPOKEN,
  FIELD_DET as SPEC_FIELD_DET,
  IDIOM_SIGN_TABLE,
  LEXICON,
  NUMERALS,
  POWER_TABLE,
  SIGN_TABLE,
} from './egyptian-spec.js';

test('the working set is 23 phonograms, 19 determinatives and 7 closed idiom signs', () => {
  assert.strictEqual(SIGN_TABLE.length, 23);
  assert.strictEqual(DETERMINATIVE_TABLE.length, 19);
  assert.strictEqual(IDIOM_SIGN_TABLE.length, 7);
  assert.strictEqual(Object.keys(SIGN_MAP).length, 23);
  for (const [token, glyph] of SIGN_TABLE) {
    assert.strictEqual(SIGN_MAP[token], glyph, `token ${token}`);
  }
  // The door bolt z and the second kh are deliberately excluded (spec 3.1).
  assert.strictEqual(SIGN_MAP['z'], undefined);
});

test('field determinatives follow the normative table', () => {
  for (const [field, glyph] of Object.entries(SPEC_FIELD_DET)) {
    assert.strictEqual(FIELD_DET[field as SemanticField], glyph, `field ${field}`);
  }
  assert.strictEqual(new Set(Object.values(FIELD_DET)).size, 15, 'fifteen distinct field signs');
});

test('the coined lexicon matches the spec table, skeleton, spoken form and gloss', () => {
  for (const [field, rows] of Object.entries(LEXICON)) {
    const roots = FIELDS[field as SemanticField];
    assert.strictEqual(roots.length, rows.length, `root count of ${field}`);
    rows.forEach(([skeleton, spoken, gloss], index) => {
      const root = roots[index];
      assert.strictEqual(root?.skeleton, skeleton, `${field} row ${index} skeleton`);
      assert.strictEqual(root?.spoken, spoken, `${field} row ${index} spoken`);
      assert.strictEqual(
        egyptianGlosses.roots[skeleton]?.gloss,
        gloss,
        `${field} row ${index} gloss`,
      );
    });
  }
  const total = Object.values(FIELDS).reduce((n, roots) => n + roots.length, 0);
  assert.strictEqual(total, 150, 'fifteen fields of ten roots');
});

test('coined skeletons respect the phonotactics of the spec', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      const signs = Array.from(root.skeleton);
      assert.ok(signs.length >= 2 && signs.length <= 4, `skeleton length of ${root.skeleton}`);
      for (const sign of signs) {
        assert.ok(SIGN_MAP[sign] !== undefined, `unknown sign ${sign} in ${root.skeleton}`);
      }
      // No l and no z: the script has no simple sign for either (spec 3.3).
      assert.ok(!/[lz]/u.test(root.skeleton), `forbidden letter in ${root.skeleton}`);
    }
  }
});

// The Divination and Chronomancy fields declare no past participle, because
// neither school renders one (spec 3.11, 3.12), and they are the only fields
// that may hold a root offering an adjective alone.
const DIVINATION_FIELDS: ReadonlySet<string> = new Set(['sight', 'fate', 'signs', 'course']);

test('every root carries the gloss forms of the roles it can fill', () => {
  for (const [field, roots] of Object.entries(FIELDS)) {
    const divination = DIVINATION_FIELDS.has(field);
    for (const root of roots) {
      assert.ok(
        root.forms.includes('noun') ||
          root.forms.includes('verb') ||
          (divination && root.forms.includes('adj')),
        `${root.skeleton} fills no role`,
      );
      if (root.forms.includes('verb') && !divination) {
        assert.ok(root.forms.includes('pp'), `${root.skeleton} is a verb without a participle`);
      }
      if (divination) {
        assert.ok(!root.forms.includes('pp'), `${root.skeleton} declares an unused participle`);
      }
    }
  }
  // Divination draws its own genes from its own fields, so each must hold
  // what the school asks of it.
  for (const field of ['sight', 'summoning', 'course', 'binding'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('verb')), `no verb in ${field}`);
  }
  for (const field of ['sight', 'fate', 'course'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('adj')), `no adjective in ${field}`);
  }
  for (const field of ['signs', 'sight', 'fate', 'time', 'hidden'] as const) {
    assert.ok(
      FIELDS[field].filter((r) => r.forms.includes('noun')).length >= 3,
      `thin nouns in ${field}`,
    );
  }
  // Course is a field of verbs before it is a field of nouns: it exists
  // because the time field cannot conjugate (spec 1.6). Its two nouns are
  // what the adverbial m-phrase draws, and two is enough for that.
  assert.ok(
    FIELDS.course.filter((r) => r.forms.includes('noun')).length >= 2,
    'thin nouns in course',
  );
  // The plan draws adjectives from these three fields only, so each must offer
  // at least one, and adverbial m-phrases need nouns in theirs.
  for (const field of ['night', 'harm', 'death'] as const) {
    assert.ok(
      FIELDS[field].some((r) => r.forms.includes('adj')),
      `no adjective in ${field}`,
    );
  }
  for (const field of ['hidden', 'night', 'harm'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('noun')), `no noun in ${field}`);
  }
  // Every field a school can draw a verb or a noun from must offer one.
  for (const field of ['warding', 'binding', 'harm', 'summoning'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('verb')), `no verb in ${field}`);
  }
  for (const field of ['harm', 'death', 'night', 'fire', 'hidden', 'gates', 'time'] as const) {
    assert.ok(
      FIELDS[field].filter((r) => r.forms.includes('noun')).length >= 3,
      `thin nouns in ${field}`,
    );
  }
});

test('attested power words are written sign for sign as the spec lists them', () => {
  assert.strictEqual(BRIGHT_POWER.length, POWER_TABLE.length);
  POWER_TABLE.forEach(([skeleton, glyphs, spoken], index) => {
    const power = BRIGHT_POWER[index];
    assert.strictEqual(power?.skeleton, skeleton, `power ${index} skeleton`);
    assert.strictEqual(power?.glyphs, glyphs, `power ${index} glyphs`);
    assert.strictEqual(power?.spoken, spoken, `power ${index} spoken`);
  });
});

// The ninth name of spec 3.7 ships with Divination alone, so it is written
// with the others and drawn by no school that predates it.
test('amun is written as the spec lists him and stays out of the other pools', () => {
  const [skeleton, glyphs, spoken] = IMEN_ROW;
  assert.strictEqual(IMEN.skeleton, skeleton);
  assert.strictEqual(IMEN.glyphs, glyphs);
  assert.strictEqual(IMEN.spoken, spoken);
  assert.ok(!BRIGHT_POWER.some((p) => p.skeleton === skeleton), 'amun reached the bright pool');
  assert.ok(!AGENT_POWER.some((p) => p.skeleton === skeleton), 'amun reached the agent pool');
  assert.deepStrictEqual(ALL_POWER.map((p) => p.skeleton), [
    ...POWER_TABLE.map(([id]) => id),
    skeleton,
    HOR_ROW[0],
  ]);
  assert.deepStrictEqual(
    DIVINATION_POWER.map((p) => p.spoken),
    [...DIVINATION_SPOKEN],
    'the questioned pool is Thoth and Amun',
  );
  // The god and the hidden-things root share a spelling and a spoken form,
  // and stay two strings: one ends on the god flag, the other on its field.
  assert.notStrictEqual(IMEN.glyphs, glyphsFor('imn') + FIELD_DET.hidden);
});

// The tenth name of spec 3.7 ships with the Coptic ruling, which reaches it
// through the declaration alone: every pool the shipped schools draw is the
// pool they drew before, which is what keeps their output where it was.
test('horus is written as the spec lists him and only the declaration reaches him', () => {
  const [skeleton, glyphs, spoken] = HOR_ROW;
  assert.strictEqual(HOR.skeleton, skeleton);
  assert.strictEqual(HOR.glyphs, glyphs);
  assert.strictEqual(HOR.spoken, spoken);
  assert.ok(!BRIGHT_POWER.some((p) => p.skeleton === skeleton), 'horus reached the bright pool');
  assert.ok(!AGENT_POWER.some((p) => p.skeleton === skeleton), 'horus reached the agent pool');
  assert.ok(
    !DIVINATION_POWER.some((p) => p.skeleton === skeleton),
    'horus reached the questioned pool',
  );
  assert.deepStrictEqual(
    ASSUMED_POWER.map((p) => p.spoken),
    [...ASSUMED_SPOKEN],
    'the assumed pool is the four the corpus speaks as',
  );
  // The pronoun that opens the declaration is a function word: no
  // determinative of its own, and the spelling the spec lists.
  assert.strictEqual(FN_INK.glyphs, INK_GLYPHS);
  assert.strictEqual(FN_INK.spoken, INK_SPOKEN);
});

test('the dread pool matches the spec table and every skeleton already ends in x', () => {
  assert.strictEqual(DREAD_POWER.length, DREAD_TABLE.length);
  DREAD_TABLE.forEach(([skeleton, spoken, gloss], index) => {
    const epithet = DREAD_POWER[index];
    assert.strictEqual(epithet?.skeleton, skeleton, `dread ${index} skeleton`);
    assert.strictEqual(epithet?.spoken, spoken, `dread ${index} spoken`);
    assert.strictEqual(egyptianGlosses.epithets[skeleton], gloss, `dread ${index} gloss`);
    // The sieve is the tell of the register. It closes every epithet but
    // xAxr, where the spec's own skeleton carries it in second position.
    assert.ok(skeleton.includes('x'), `dread ${skeleton} carries no sieve`);
  });
});

test('idioms carry the attested spellings of the spec', () => {
  const spoken = (id: keyof typeof IDIOM_WORDS): string[] =>
    IDIOM_WORDS[id].map((w) => w.spoken);
  const glyphs = (id: keyof typeof IDIOM_WORDS): string =>
    IDIOM_WORDS[id].map((w) => w.glyphs).join('');

  assert.deepStrictEqual(spoken('EO1'), [...EO1_SPOKEN]);
  assert.strictEqual(glyphs('EO1'), EO1_GLYPHS);
  assert.deepStrictEqual(spoken('EO4'), [...EO4_SPOKEN]);
  assert.strictEqual(glyphs('EO4'), EO4_GLYPHS);
  assert.deepStrictEqual(spoken('EC4'), [...EC4_SPOKEN]);
  assert.strictEqual(glyphs('EC4'), EC4_GLYPHS);
  assert.strictEqual(FN_INIW.glyphs, INIW_GLYPHS);
  assert.strictEqual(FN_INIW.spoken, INIW_SPOKEN);
  assert.strictEqual(EC5_HEAD.map((w) => w.glyphs).join(''), EC5_HEAD_GLYPHS);
  assert.deepStrictEqual(EC5_HEAD.map((w) => w.spoken), [...EC5_HEAD_SPOKEN]);
  for (const [id, word] of Object.entries(DIRECTION_WORDS)) {
    assert.strictEqual(word.glyphs, DIRECTION_GLYPHS[id], `direction ${id} glyphs`);
    assert.strictEqual(word.spoken, DIRECTION_SPOKEN[id], `direction ${id} spoken`);
  }
  assert.deepStrictEqual(spoken('ELDRITCH_OPEN'), [...ELDRITCH_OPEN_SPOKEN]);
  assert.deepStrictEqual(spoken('EC1'), [...EC1_SPOKEN]);
  assert.strictEqual(glyphs('EC1'), EC1_GLYPHS);
  assert.deepStrictEqual(spoken('EC2'), [...EC2_SPOKEN]);
  assert.strictEqual(glyphs('EC2'), EC2_GLYPHS);
  assert.deepStrictEqual(spoken('ELDRITCH_CLOSE'), [...ELDRITCH_CLOSE_SPOKEN]);
  assert.strictEqual(glyphs('ELDRITCH_CLOSE'), ELDRITCH_CLOSE_GLYPHS);
});

test('numerals compose from strokes and the hobble as the spec lists them', () => {
  for (const [count, [glyphs, spoken]] of Object.entries(NUMERALS)) {
    const words = NUMERAL_WORDS[Number(count) as keyof typeof NUMERAL_WORDS];
    assert.ok(words !== undefined, `numeral ${count} missing`);
    assert.strictEqual(words.map((w) => w.glyphs).join(''), glyphs, `numeral ${count} glyphs`);
    assert.strictEqual(words.map((w) => w.spoken).join(' '), spoken, `numeral ${count} spoken`);
  }
});
