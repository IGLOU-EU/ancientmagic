import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  ALL_NAMES,
  DIRECTION_WORDS,
  DIVINATION_NAMES,
  DREAD_POWER,
  FEMININE_SPOKEN,
  FIELDS,
  IDIOM_WORDS,
  INTERROGATIVE_SPOKEN,
  LETTER_MAP,
  NUMERAL_GLYPHS,
  NUMERAL_WORDS,
  PLURAL_SPOKEN,
  PO1_HEAD,
  PO2_HEAD,
  PC5_HEAD,
  PO3_HEAD,
  PO4_HEAD,
  PO5_HEAD,
  PROCLITIC_SPOKEN,
  SEAL_HEAD,
  YT,
} from '../src/ts/languages/phoenician-data.js';
import {
  citation,
  conjugate,
  degrade,
  glyphsFor,
  speak,
  tokenize,
} from '../src/ts/languages/phoenician.js';
import type { SemanticField } from '../src/ts/generator/types.js';
import { phoenicianGlosses } from '../src/ts/glosses/en/phoenician.js';
import {
  ARTICLE,
  BICONSONANTAL,
  DIRECTION_GLYPHS,
  DIRECTION_SPOKEN,
  DIVINATION_SPOKEN,
  INTERROGATIVE,
  DREAD_TABLE,
  ELDRITCH_CLOSE_GLYPHS,
  ELDRITCH_CLOSE_SPOKEN,
  INTRANSITIVE,
  LETTER_TABLE,
  LEXICON,
  FEMININE_SPOKEN as FEMININE,
  NAME_TABLE,
  NUMERALS,
  PC1_GLYPHS,
  PC1_SPOKEN,
  PC2_GLYPHS,
  PC2_SPOKEN,
  PC3_GLYPHS,
  PC3_SPOKEN,
  PC4_GLYPHS,
  PC4_SPOKEN,
  PO1_HEAD_GLYPHS,
  PO1_HEAD_SPOKEN,
  PO2_HEAD_GLYPHS,
  PO2_HEAD_SPOKEN,
  PLURAL_SPOKEN as PLURAL,
  PO3_HEAD_GLYPHS,
  PO3_HEAD_SPOKEN,
  PC5_HEAD_GLYPHS,
  PC5_HEAD_SPOKEN,
  PO4_HEAD_GLYPHS,
  PO4_HEAD_SPOKEN,
  PO5_HEAD_GLYPHS,
  PO5_HEAD_SPOKEN,
  PROCLITIC_B,
  PROCLITIC_L,
  PROCLITIC_W,
  SEAL_HEAD_GLYPHS,
  SEAL_HEAD_SPOKEN,
  YT_GLYPHS,
  YT_SPOKEN,
} from './phoenician-spec.js';

test('the abjad is the 22 letters of the spec, in table order', () => {
  assert.strictEqual(Object.keys(LETTER_MAP).length, 22);
  for (const [token, glyph] of LETTER_TABLE) {
    assert.strictEqual(LETTER_MAP[token], glyph, `token ${token}`);
  }
  // No vowel letter exists in the inventory: the abjad writes consonants.
  for (const vowel of ['a', 'e', 'i', 'o', 'u']) {
    assert.strictEqual(LETTER_MAP[vowel], undefined, `vowel ${vowel} in the inventory`);
  }
});

test('the coined lexicon matches the spec table, skeleton and gloss', () => {
  for (const [field, rows] of Object.entries(LEXICON)) {
    const roots = FIELDS[field as SemanticField];
    assert.strictEqual(roots.length, rows.length, `root count of ${field}`);
    rows.forEach(([skeleton, gloss], index) => {
      const root = roots[index];
      assert.strictEqual(root?.root, skeleton, `${field} row ${index} skeleton`);
      assert.strictEqual(
        phoenicianGlosses.roots[skeleton]?.gloss,
        gloss,
        `${field} row ${index} gloss`,
      );
    });
  }
  const total = Object.values(FIELDS).reduce((n, roots) => n + roots.length, 0);
  assert.strictEqual(total, 150, 'fifteen fields of ten roots');
});

test('root shape follows the phonotactics of the spec', () => {
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      const radicals = tokenize(root.root);
      assert.ok(radicals.length === 2 || radicals.length === 3, `radical count of ${root.root}`);
      for (const radical of radicals) {
        assert.ok(LETTER_MAP[radical] !== undefined, `unknown radical ${radical} in ${root.root}`);
      }
      // No identical first and second radical, a real Semitic constraint.
      assert.notStrictEqual(radicals[0], radicals[1], `twin first radicals in ${root.root}`);
      // No two emphatics in one root. A geminated second and third radical is
      // one emphatic written twice, which the spec's own rtsts shows is fine.
      // qbts is the one listed root that carries two distinct emphatics, so
      // the table wins over the avoid list there and the exception is named.
      const emphatics = new Set(radicals.filter((r) => r === 'tt' || r === 'ts' || r === 'q'));
      const allowed = root.root === 'qbts' ? 2 : 1;
      assert.ok(emphatics.size <= allowed, `two emphatics in ${root.root}`);
    }
  }
});

test('the biconsonantal roots are exactly the ones the spec allows, and are nouns', () => {
  const found: string[] = [];
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      if (tokenize(root.root).length !== 2) continue;
      found.push(root.root);
      assert.ok(root.forms.includes('noun'), `${root.root} is biconsonantal without a noun`);
      assert.ok(!root.forms.includes('verb'), `${root.root} is biconsonantal with a verb`);
    }
  }
  assert.deepStrictEqual(found.sort(), [...BICONSONANTAL].sort());
});

test('the intransitive flag sits on exactly the five roots of the spec', () => {
  const flagged: string[] = [];
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      if (root.intransitive === true) flagged.push(root.root);
    }
  }
  assert.deepStrictEqual(flagged.sort(), [...INTRANSITIVE].sort());
  // A flagged root is a verb, otherwise the flag would guard nothing.
  for (const roots of Object.values(FIELDS)) {
    for (const root of roots) {
      if (root.intransitive !== true) continue;
      assert.ok(root.forms.includes('verb'), `${root.root} is flagged but is not a verb`);
    }
  }
});

// The Divination and Chronomancy fields declare no past participle, because
// neither school renders one, and a plural only where a construct chain draws
// from, which is the signs field alone (spec 4.11, 4.12).
const DIVINATION_FIELDS: ReadonlySet<string> = new Set(['sight', 'fate', 'signs', 'course']);

test('every root carries the gloss forms of the roles it can fill', () => {
  for (const [field, roots] of Object.entries(FIELDS)) {
    const divination = DIVINATION_FIELDS.has(field);
    for (const root of roots) {
      assert.ok(
        root.forms.includes('noun') ||
          root.forms.includes('verb') ||
          (divination && root.forms.includes('adj')),
        `${root.root} fills no role`,
      );
      if (root.forms.includes('noun') && (!divination || field === 'signs')) {
        assert.ok(root.forms.includes('plural'), `${root.root} is a noun without a plural`);
      }
      if (root.forms.includes('verb') && !divination) {
        assert.ok(root.forms.includes('pp'), `${root.root} is a verb without a participle`);
      }
      if (divination) {
        assert.ok(!root.forms.includes('pp'), `${root.root} declares an unused participle`);
      }
      if (field === 'sight' || field === 'fate' || field === 'course') {
        assert.ok(!root.forms.includes('plural'), `${root.root} declares an unused plural`);
      }
    }
  }
  // Divination draws its own genes from its own fields, so each must hold
  // what the school asks of it.
  for (const field of ['sight', 'summoning', 'course', 'binding'] as const) {
    const transitive = FIELDS[field].filter(
      (r) => r.forms.includes('verb') && r.intransitive !== true,
    );
    assert.ok(transitive.length >= 3, `thin transitive verbs in ${field}`);
  }
  for (const field of ['sight', 'fate', 'course'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('adj')), `no adjective in ${field}`);
  }
  // The construct chain of an asking clause draws plural signs nouns, and the
  // caster of PO2 draws a sight noun.
  assert.strictEqual(
    FIELDS.signs.filter((r) => r.forms.includes('plural')).length,
    10,
    'a signs root without a plural',
  );
  assert.ok(
    FIELDS.sight.filter((r) => r.forms.includes('noun')).length >= 3,
    'thin sight nouns for the caster name',
  );
  // The plan draws verbs from these fields and adjectives from those three.
  for (const field of ['warding', 'binding', 'harm', 'summoning'] as const) {
    const transitive = FIELDS[field].filter(
      (r) => r.forms.includes('verb') && r.intransitive !== true,
    );
    assert.ok(transitive.length >= 3, `thin transitive verbs in ${field}`);
  }
  for (const field of ['night', 'harm', 'death'] as const) {
    assert.ok(FIELDS[field].some((r) => r.forms.includes('adj')), `no adjective in ${field}`);
  }
  // Course is a field of verbs before it is a field of nouns (spec 1.6). Its
  // two nouns are what the adverbial b-phrase draws, and two is enough.
  assert.ok(
    FIELDS.course.filter((r) => r.forms.includes('noun')).length >= 2,
    'thin nouns in course',
  );
  // Adverbial b-phrases and eldritch draws need triconsonantal nouns.
  for (const field of ['hidden', 'night', 'harm', 'death', 'fire', 'gates', 'time'] as const) {
    const nouns = FIELDS[field].filter(
      (r) => r.forms.includes('noun') && tokenize(r.root).length === 3,
    );
    assert.ok(nouns.length >= 3, `thin triconsonantal nouns in ${field}`);
  }
});

test('attested divine names are written letter for letter as the spec lists them', () => {
  assert.strictEqual(ALL_NAMES.length, NAME_TABLE.length);
  NAME_TABLE.forEach(([skeleton, glyphs, spoken], index) => {
    const name = ALL_NAMES[index];
    assert.strictEqual(name?.skeleton, skeleton, `name ${index} skeleton`);
    assert.strictEqual(name?.glyphs, glyphs, `name ${index} glyphs`);
    assert.strictEqual(name?.spoken, spoken, `name ${index} spoken`);
  });
  // ssm keeps both semks, the collapse rule does not touch attested spellings.
  const sasam = ALL_NAMES.find((n) => n.skeleton === 'ssm');
  assert.strictEqual(Array.from(sasam?.glyphs ?? '').length, 3, 'sasam lost a semk');
});

test('divination questions the three names the spec names', () => {
  assert.deepStrictEqual(
    DIVINATION_NAMES.map((n) => n.spoken),
    [...DIVINATION_SPOKEN],
  );
  // Two of the three are goddesses, which is what the t- prefix resumes.
  assert.deepStrictEqual(
    DIVINATION_NAMES.filter((n) => n.feminine).map((n) => n.spoken),
    ['ashtart', 'tinnit'],
  );
});

test('the dread pool matches the spec table and every skeleton is quadriliteral', () => {
  assert.strictEqual(DREAD_POWER.length, DREAD_TABLE.length);
  DREAD_TABLE.forEach(([skeleton, spoken, gloss], index) => {
    const epithet = DREAD_POWER[index];
    assert.strictEqual(epithet?.skeleton, skeleton, `dread ${index} skeleton`);
    assert.strictEqual(epithet?.spoken, spoken, `dread ${index} spoken`);
    assert.strictEqual(phoenicianGlosses.epithets[skeleton], gloss, `dread ${index} gloss`);
    assert.strictEqual(tokenize(skeleton).length, 4, `dread ${skeleton} is not quadriliteral`);
  });
});

test('the listed dread forms are the degraded quadriliteral citation', () => {
  // Cross-check of the pattern engine against the spec's own pool: every
  // epithet reads C1oC2C3uC4, which is the citation of 4.3 under rule 3.
  for (const [skeleton, spoken] of DREAD_TABLE) {
    assert.strictEqual(speak(degrade(citation(skeleton))), spoken, `derivation of ${skeleton}`);
  }
});

test('idioms carry the attested spellings of the spec', () => {
  assert.strictEqual(PO1_HEAD.glyphs, PO1_HEAD_GLYPHS);
  assert.strictEqual(PO1_HEAD.spoken, PO1_HEAD_SPOKEN);
  assert.strictEqual(PO2_HEAD.glyphs, PO2_HEAD_GLYPHS);
  assert.strictEqual(PO2_HEAD.spoken, PO2_HEAD_SPOKEN);
  assert.strictEqual(PO3_HEAD.glyphs, PO3_HEAD_GLYPHS);
  assert.strictEqual(PO3_HEAD.spoken, PO3_HEAD_SPOKEN);

  const spoken = (id: keyof typeof IDIOM_WORDS): string[] =>
    IDIOM_WORDS[id].map((w) => w.spoken);
  const glyphs = (id: keyof typeof IDIOM_WORDS): string[] =>
    IDIOM_WORDS[id].map((w) => w.glyphs);

  assert.deepStrictEqual(spoken('PC1'), [...PC1_SPOKEN]);
  assert.deepStrictEqual(glyphs('PC1'), [...PC1_GLYPHS]);
  assert.deepStrictEqual(spoken('PC2'), [...PC2_SPOKEN]);
  assert.deepStrictEqual(glyphs('PC2'), [...PC2_GLYPHS]);
  assert.deepStrictEqual(spoken('PC3'), [...PC3_SPOKEN]);
  assert.deepStrictEqual(glyphs('PC3'), [...PC3_GLYPHS]);
  assert.deepStrictEqual(spoken('PC4'), [...PC4_SPOKEN]);
  assert.deepStrictEqual(glyphs('PC4'), [...PC4_GLYPHS]);
  assert.strictEqual(PO4_HEAD.glyphs, PO4_HEAD_GLYPHS);
  assert.strictEqual(PO4_HEAD.spoken, PO4_HEAD_SPOKEN);
  assert.strictEqual(PO5_HEAD.glyphs, PO5_HEAD_GLYPHS);
  assert.strictEqual(PO5_HEAD.spoken, PO5_HEAD_SPOKEN);
  assert.strictEqual(PC5_HEAD.glyphs, PC5_HEAD_GLYPHS);
  assert.strictEqual(PC5_HEAD.spoken, PC5_HEAD_SPOKEN);
  // PC5 is the summoning root bw' in the perfect 1sg, so the idiom and the
  // pattern engine have to agree letter for letter (spec 4.6).
  assert.strictEqual(PC5_HEAD.spoken, speak(conjugate("bw'", 'perfect-1sg')));
  assert.strictEqual(PC5_HEAD.glyphs, glyphsFor(conjugate("bw'", 'perfect-1sg')));
  // The direction words are a proclitic on a noun the lexicon already holds,
  // except the ordinary word for again (spec 4.4).
  for (const [id, word] of Object.entries(DIRECTION_WORDS)) {
    assert.strictEqual(word.glyphs, DIRECTION_GLYPHS[id], `direction ${id} glyphs`);
    assert.strictEqual(word.spoken, DIRECTION_SPOKEN[id], `direction ${id} spoken`);
  }
  assert.strictEqual(DIRECTION_WORDS.back.spoken, `le${speak(citation('qdm'))}`);
  assert.strictEqual(DIRECTION_WORDS.forth.spoken, `le${speak(citation("'khr"))}`);
  assert.strictEqual(DIRECTION_WORDS.still.spoken, `be${speak(citation('dmm'))}`);
  // PC4 is the first half of PC1 and nothing else (spec 4.6).
  assert.deepStrictEqual(PC4_SPOKEN, PC1_SPOKEN.slice(0, 3));
  assert.deepStrictEqual(spoken('ELDRITCH_CLOSE'), [...ELDRITCH_CLOSE_SPOKEN]);
  assert.deepStrictEqual(glyphs('ELDRITCH_CLOSE'), [...ELDRITCH_CLOSE_GLYPHS]);

  assert.strictEqual(YT.glyphs, YT_GLYPHS);
  assert.strictEqual(YT.spoken, YT_SPOKEN);
});

test('the affixes carry the listed spoken values, the only source of their vowels', () => {
  // Spec 4.4: nothing about an affix vowel is inferred anywhere else.
  assert.strictEqual(PROCLITIC_SPOKEN.h, ARTICLE.spoken);
  // The interrogative is the same letter in another function, and the two are
  // one vowel apart in the transliteration and identical in the script.
  assert.strictEqual(INTERROGATIVE_SPOKEN, INTERROGATIVE.spoken);
  assert.notStrictEqual(INTERROGATIVE_SPOKEN, PROCLITIC_SPOKEN.h);
  assert.strictEqual(INTERROGATIVE.glyph, ARTICLE.glyph);
  assert.strictEqual(PROCLITIC_SPOKEN.l, PROCLITIC_L.spoken);
  assert.strictEqual(PROCLITIC_SPOKEN.b, PROCLITIC_B.spoken);
  assert.strictEqual(PROCLITIC_SPOKEN.w, PROCLITIC_W.spoken);
  assert.strictEqual(PLURAL, PLURAL_SPOKEN);
  assert.strictEqual(FEMININE, FEMININE_SPOKEN);
  // Each proclitic is written with its own letter, glued to its host.
  assert.strictEqual(LETTER_MAP.h, ARTICLE.glyph);
  assert.strictEqual(LETTER_MAP.l, PROCLITIC_L.glyph);
  assert.strictEqual(LETTER_MAP.b, PROCLITIC_B.glyph);
  assert.strictEqual(LETTER_MAP.w, PROCLITIC_W.glyph);
});

test('numerals compose additively and the seal word heads them', () => {
  assert.strictEqual(SEAL_HEAD.glyphs, SEAL_HEAD_GLYPHS);
  assert.strictEqual(SEAL_HEAD.spoken, SEAL_HEAD_SPOKEN);
  for (const [count, [glyphs, spoken]] of Object.entries(NUMERALS)) {
    const key = Number(count) as keyof typeof NUMERAL_GLYPHS;
    assert.strictEqual(NUMERAL_GLYPHS[key], glyphs, `numeral ${count} glyphs`);
    assert.strictEqual(NUMERAL_WORDS[key], spoken, `numeral ${count} spoken`);
  }
});
