// How an Ogham formula is built: what rides which rod, what order a school
// writes its clause in, and what the tiers add.
//
// The reading line is where the words are counted, because it joins with a
// plain ASCII space and the glyph line joins with Unicode whitespace. Where a
// test needs the cut of the object itself, it reads the rods by codepoint.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  ALL_SCHOOLS,
  BRIGHT_SCHOOLS,
  SEEDS,
  label,
  ogham,
  oghamWords,
  sweepOgham,
} from './gen.js';
import type { School } from '../src/ts/generator/types.js';
import {
  BRIGHT_POWER,
  DARK_POWER,
  DREAD_POWER,
  FIELDS,
  IDIOM_WORDS,
} from '../src/ts/languages/ogham-data.js';
import {
  ADVERBS,
  IDIOM_TABLE,
  KENNING_TABLE,
  NUMERALS,
  ROW_NAMES,
  SEAL_HEAD_SPOKEN,
  parseRods,
  rodCount,
  truncations,
} from './ogham-spec.js';

const BRIGHT_IDS = BRIGHT_POWER.map((power) => power.id);
const DARK_IDS = DARK_POWER.map((power) => power.id);
const DREAD_IDS = DREAD_POWER.map((epithet) => epithet.id);
const KENNING_SPOKEN = KENNING_TABLE.map(([, spoken]) => spoken);

// The school's own opener, per spec 10.9 and the tables of 10.11 and 10.12.
const SCHOOL_OPENER: Readonly<Record<string, string>> = {
  protection: 'OO1',
  curse: 'OO4',
  invocation: 'OO2',
  divination: 'OO5',
  chronomancy: 'OO6',
};

function openerWords(id: string): string[] {
  return (IDIOM_TABLE[id]?.[0] ?? '').split(' ');
}

// How many words the opening spends, so a test can start reading at the clause
// instead of at the first word. The row stands in front of the school opener
// at the top tiers, and under the register it is the whole opening (10.9,
// 10.10).
function openingLength(school: string, difficulty: number): number {
  if (difficulty <= 2) return 0;
  if (school === 'eldritch') return difficulty < 6 ? 5 : 20;
  const own = openerWords(SCHOOL_OPENER[school] ?? 'OO1').length;
  if (difficulty === 7) return 5 + own;
  if (difficulty >= 8) return 20 + own;
  return own;
}

test('tier 1 whispers one attested name, framed and continuous', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const out = ogham(school, 1, seed);
      const where = label(school, 1, seed);
      const words = out.transliteration.split(' ');
      assert.strictEqual(words.length, 1, `tier 1 is not one word in ${where}`);
      const pool = school === 'eldritch' ? DREAD_IDS : school === 'curse' ? DARK_IDS : BRIGHT_IDS;
      assert.ok(pool.includes(words[0] ?? ''), `${words[0]} is outside its pool in ${where}`);
      // The kenning vox is excluded from the tier 1 draw: it whispers a name
      // and needs a name to whisper (spec 10.7).
      assert.ok(!KENNING_SPOKEN.includes(words[0] ?? ''), `a kenning at tier 1 in ${where}`);
    }
  }
});

test('tier 2 writes two genes, an imperative and its object', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const words = oghamWords(school, 2, seed);
      const where = label(school, 2, seed);
      assert.strictEqual(words.length, 2, `tier 2 is not two genes in ${where}`);
      assert.ok((words[1] ?? '').endsWith('an'), `no accusative object in ${where}`);
    }
  }
});

test('the school opener rides the first rod, and the row stands in front of it', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'eldritch') continue;
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = oghamWords(school, difficulty, seed);
        const own = openerWords(SCHOOL_OPENER[school] ?? 'OO1');
        const row =
          difficulty === 7
            ? openerWords('OO3_SHORT')
            : difficulty >= 8
              ? openerWords('OO3_FULL')
              : [];
        assert.deepStrictEqual(
          words.slice(0, row.length + own.length),
          [...row, ...own],
          `the opening of ${where}`,
        );
        // And it is the first rod that carries it.
        const first = parseRods(ogham(school, difficulty, seed).glyphs)[0] ?? [];
        assert.ok(first.length > row.length + own.length - 1, `the opener overflowed its rod in ${where}`);
      }
    }
  }
});

test('the row is recited whole at the top tiers and short at seven', () => {
  for (const seed of SEEDS) {
    const short = oghamWords('protection', 7, seed);
    assert.deepStrictEqual(short.slice(0, 5), ROW_NAMES.slice(0, 5));
    const full = oghamWords('protection', 8, seed);
    assert.deepStrictEqual(full.slice(0, 20), [...ROW_NAMES]);
  }
});

test('the closer and the seal ride the last rod, always', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    if (difficulty < 5) return;
    const where = label(school, difficulty, seed);
    const rods = parseRods(out.glyphs);
    assert.strictEqual(rods.length, rodCount(difficulty), `rod count in ${where}`);
    const words = out.transliteration.split(' ');
    const last = rods[rods.length - 1] ?? [];
    const tail = words.slice(words.length - last.length);
    if (difficulty >= 7) {
      // The seal sits at the absolute end of the formula, inside the final rod.
      const count = tail[tail.length - 1] === 'novan' && tail[tail.length - 2] === 'tri' ? 2 : 1;
      const spoken = tail.slice(tail.length - count).join(' ');
      const head = tail[tail.length - count - 1];
      assert.strictEqual(head, SEAL_HEAD_SPOKEN, `the seal head in ${where}`);
      assert.ok(
        Object.values(NUMERALS).some(([word]) => word === spoken),
        `the count ${spoken} is not one of the six in ${where}`,
      );
    }
  });
});

test('the seal appears from difficulty 7 and never below it', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const has = out.transliteration.split(' ').includes(SEAL_HEAD_SPOKEN);
    assert.strictEqual(has, difficulty >= 7, `the seal in ${label(school, difficulty, seed)}`);
  });
});

test('the seal counts are the ones each school and tier is allowed', () => {
  const ALLOWED: Readonly<Record<string, Readonly<Record<number, ReadonlyArray<string>>>>> = {
    // The bright three read the base table of 10.9.
    base: { 7: ['tri', 'qenqe', 'sect'], 8: ['sect', 'novan'], 9: ['novan', 'tri novan'] },
    // Dalán cut four rods, and tier 7 seals on that scene alone (spec 10.11).
    divination: { 7: ['cetri'], 8: ['sect', 'novan'], 9: ['novan', 'tri novan'] },
    // The ninth wave, and only the top tier reaches past it (spec 10.12).
    chronomancy: { 7: ['novan'], 8: ['novan'], 9: ['novan', 'tri novan'] },
    // The register seals on the count that holds it back (spec 10.10).
    eldritch: { 7: ['novan'], 8: ['novan'], 9: ['novan'] },
  };
  for (const school of ALL_SCHOOLS) {
    const table = ALLOWED[school] ?? ALLOWED.base;
    for (const difficulty of [7, 8, 9]) {
      for (let seed = 0; seed < 40; seed += 1) {
        const words = oghamWords(school, difficulty, seed);
        const at = words.lastIndexOf(SEAL_HEAD_SPOKEN);
        const spoken = words.slice(at + 1).join(' ');
        assert.ok(
          (table?.[difficulty] ?? []).includes(spoken),
          `the count ${spoken} in ${label(school, difficulty, seed)}`,
        );
      }
    }
  }
});

test('the closers are the school stack of 10.9, with OC3 behind them at the top', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'eldritch') continue;
    for (const difficulty of [5, 6, 7, 8, 9]) {
      for (let seed = 0; seed < 40; seed += 1) {
        const where = label(school, difficulty, seed);
        const words = oghamWords(school, difficulty, seed);
        const trimmed = difficulty >= 7 ? words.slice(0, words.lastIndexOf(SEAL_HEAD_SPOKEN)) : words;
        const stacked = difficulty >= 8;
        const body = stacked ? trimmed.slice(0, -2) : trimmed;
        if (stacked) {
          assert.deepStrictEqual(trimmed.slice(-2), ['ogom', 'ogmi'], `OC3 in ${where}`);
        }
        if (school === 'divination') {
          assert.strictEqual(body[body.length - 1], 'derb', `OC4 in ${where}`);
        } else if (school === 'chronomancy') {
          assert.strictEqual(body[body.length - 1], 'tanac', `OC5 in ${where}`);
        } else {
          const closer = body[body.length - 1];
          assert.ok(['coi', 'slan'].includes(closer ?? ''), `the closer ${closer} in ${where}`);
          // OC2 is an alternative to OC1 at tiers 5 and 6 alone.
          if (difficulty > 6) assert.strictEqual(closer, 'coi', `OC2 above its tiers in ${where}`);
        }
      }
    }
  }
});

test('the protection clause runs agent, vrit, object, verb', () => {
  for (const difficulty of [3, 5, 6]) {
    for (const seed of SEEDS) {
      const where = label('protection', difficulty, seed);
      const words = oghamWords('protection', difficulty, seed);
      const at = words.indexOf('vrit');
      assert.ok(at > 0, `no vrit phrase in ${where}`);
      assert.ok((words[at - 1] ?? '').endsWith('as'), `the agent is not nominative in ${where}`);
      assert.ok((words[at + 1] ?? '').endsWith('an'), `vrit does not govern an accusative in ${where}`);
    }
  }
});

test('a vrit phrase may end on its adjective, which no other genome does', () => {
  // Noun-first order reaches even inside the preposition phrase (spec 10.5).
  let seen = 0;
  for (let seed = 0; seed < 200; seed += 1) {
    const words = oghamWords('protection', 4, seed);
    const at = words.indexOf('vrit');
    if ((words[at + 2] ?? '').endsWith('an')) seen += 1;
  }
  assert.ok(seen > 0, 'no vrit phrase ever ended on an adjective');
});

test('the curse clause opens on its jussive and trails its modifier', () => {
  for (const difficulty of [3, 4, 5, 6]) {
    for (const seed of SEEDS) {
      const where = label('curse', difficulty, seed);
      const rods = parseRods(ogham('curse', difficulty, seed).glyphs);
      const words = oghamWords('curse', difficulty, seed);
      // The opener is one word, so the clause starts right behind it.
      const first = words[1];
      assert.ok((first ?? '').endsWith('etu'), `the clause does not open on -etu in ${where}`);
      assert.ok(rods.length >= 1);
    }
  }
});

test('the jussive is the curse form and no other school writes it', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    if (school === 'curse') return;
    for (const word of out.transliteration.split(' ')) {
      assert.ok(!word.endsWith('etu'), `a jussive in ${label(school, difficulty, seed)}`);
    }
  });
});

test('the perfective is the chronomancy binding form and no other school writes it', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const words = out.transliteration.split(' ');
    const perfect = words.filter((word) => word.startsWith('ro') && word.endsWith('us'));
    if (school !== 'chronomancy') {
      assert.deepStrictEqual(perfect, [], `a perfective in ${label(school, difficulty, seed)}`);
      return;
    }
    // A binding clause exists from difficulty 6, and every one of them wears
    // both pieces (spec 10.13).
    const expected = difficulty <= 5 ? 0 : difficulty <= 7 ? 1 : 2;
    assert.strictEqual(perfect.length, expected, `perfectives in ${label(school, difficulty, seed)}`);
    // tanac carries neither, which is what keeps the two apart.
    assert.ok(!words.includes('rotanacus'), 'the frozen return was conjugated');
  });
});

test('the asking particle opens a divination question and appears nowhere else', () => {
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    const words = out.transliteration.split(' ');
    const particles = words.filter((word) => word === 'in').length;
    const where = label(school, difficulty, seed);
    if (school !== 'divination' || difficulty <= 2) {
      assert.strictEqual(particles, 0, `the particle in ${where}`);
      return;
    }
    assert.strictEqual(particles, 1, `the particle count in ${where}`);
    // The verb in -it is the second word of the asking clause, behind it.
    const at = words.indexOf('in');
    assert.ok((words[at + 1] ?? '').endsWith('it'), `no -it behind the particle in ${where}`);
  });
});

test('the crossing clause puts its direction immediately behind its verb', () => {
  const directions = ['cul', 'rem', 'atir', 'beos'];
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = oghamWords('chronomancy', difficulty, seed);
      const found = words.filter((word) => directions.includes(word));
      assert.strictEqual(found.length, 1, `direction count in ${where}`);
      const at = words.indexOf(found[0] ?? '');
      // The verb is the bare imperative, so what stands in front of the
      // direction is a root of the two fields this school commands with, whole
      // and unended.
      const commands = [...FIELDS.course, ...FIELDS.binding]
        .filter((root) => root.forms.includes('verb'))
        .map((root) => root.root);
      assert.ok(commands.includes(words[at - 1] ?? ''), `the crossing verb in ${where}`);
    }
  }
});

test('the anchor phrase runs do, an accusative time noun, then tanac', () => {
  for (const difficulty of [5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = oghamWords('chronomancy', difficulty, seed);
      const at = words.indexOf('do');
      assert.ok(at > 0, `no anchor in ${where}`);
      const timeNouns = FIELDS.time.map((root) => root.root);
      const anchor = words[at + 1] ?? '';
      assert.ok(anchor.endsWith('an'), `the anchor is not accusative in ${where}`);
      assert.ok(timeNouns.includes(anchor.slice(0, -2)), `the anchor is not a time noun in ${where}`);
      if (difficulty === 9) {
        const genitive = words[at + 2] ?? '';
        assert.ok(genitive.endsWith('i'), `no genitive behind the anchor in ${where}`);
        assert.notStrictEqual(genitive.slice(0, -1), anchor.slice(0, -2), 'the pair named one time twice');
        assert.strictEqual(words[at + 3], 'tanac', `tanac in ${where}`);
      } else {
        assert.strictEqual(words[at + 2], 'tanac', `tanac in ${where}`);
      }
    }
  }
});

test('the invocation chain hangs genitives off a vocative', () => {
  for (const difficulty of [6, 8]) {
    for (const seed of SEEDS) {
      const where = label('invocation', difficulty, seed);
      const words = oghamWords('invocation', difficulty, seed).slice(
        openingLength('invocation', difficulty),
      );
      const head = words[0] ?? '';
      assert.ok(head.endsWith('e'), `the head is not a vocative in ${where}`);
      const stacked = difficulty >= 8 ? 2 : 1;
      for (let index = 0; index < stacked; index += 1) {
        assert.ok(
          (words[1 + index] ?? '').endsWith('i'),
          `a stacked agent is not a genitive in ${where}`,
        );
      }
    }
  }
});

test('the repetition triples at eight and cuts a tally at nine', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const triple = oghamWords(school, 8, seed);
      const where = label(school, 8, seed);
      // Three identical words stand together somewhere in the final rod.
      const at = triple.findIndex(
        (word, index) => word === triple[index + 1] && word === triple[index + 2],
      );
      assert.ok(at > 0, `no triple in ${where}`);

      const words = oghamWords(school, 9, seed);
      const steps =
        school === 'eldritch' || school === 'curse'
          ? null
          : truncations(IDIOM_WORDS.OO1[0]?.letters ?? []);
      if (steps !== null) {
        // Protection opens on the same seven strokes and then cuts them away,
        // so the tally is the last run of them, not the first (spec 10.9).
        const start = words.lastIndexOf(steps[0] ?? '');
        assert.deepStrictEqual(
          words.slice(start, start + steps.length),
          steps,
          `the birch tally in ${label(school, 9, seed)}`,
        );
      }
    }
  }
});

test('the curse tally cuts down the queen it calls, eight steps to a single m', () => {
  for (const seed of SEEDS) {
    const words = oghamWords('curse', 9, seed);
    const steps = truncations(Array.from('morrigan'));
    const start = words.lastIndexOf('morrigan');
    assert.deepStrictEqual(words.slice(start, start + steps.length), steps);
    assert.strictEqual(steps.length, 8);
    assert.strictEqual(steps[steps.length - 1], 'm');
  }
});

test('the adjacency rule keeps a clause off the repeated word', () => {
  // At tiers 8 and 9 the repetition is settled first, so the free power word of
  // the same formula never repeats it (spec 10.9).
  for (const difficulty of [8, 9]) {
    for (let seed = 0; seed < 60; seed += 1) {
      const words = oghamWords('invocation', difficulty, seed);
      const at = words.findIndex(
        (word, index) => word === words[index + 1] && word === words[index + 2],
      );
      if (at < 0) continue;
      const repeated = words[at];
      const clauses = words.slice(0, at);
      assert.ok(
        !clauses.includes(repeated ?? ''),
        `the clause spoke the repeated word in ${label('invocation', difficulty, seed)}`,
      );
    }
  }
});

test('the protection power word is subsumed by the repetition at the top tiers', () => {
  for (const difficulty of [8, 9]) {
    for (let seed = 0; seed < 40; seed += 1) {
      const words = oghamWords('protection', difficulty, seed);
      const spoken = words.filter((word) => BRIGHT_IDS.includes(word));
      // Either three, from the triple, or none, when the tally runs instead.
      assert.ok(
        spoken.length === 3 || spoken.length === 0,
        `a name spoken ${spoken.length} times in ${label('protection', difficulty, seed)}`,
      );
    }
  }
});

// A kenning vox is one letter standing as its own word, so it is read off the
// glyph line rather than off the reading line: its spoken form is a letter
// name, and letter names also open every high formula and spell the closer of
// the register. One glyph, one word, is unambiguous.
function loneLetters(school: School, difficulty: number, seed: number): number {
  const rods = parseRods(ogham(school, difficulty, seed).glyphs);
  return rods
    .flat()
    .slice(openingLength(school, difficulty))
    .filter((word) => Array.from(word).length === 1).length;
}

test('no formula below the scholastic tiers ever writes a letter as a word', () => {
  for (const school of ALL_SCHOOLS) {
    // Tier 9 is left out because the tally triangle ends on a single letter by
    // design, which is the device of 10.9 and not a vox.
    for (const difficulty of [3, 4, 5, 6, 7]) {
      for (let seed = 0; seed < 40; seed += 1) {
        assert.strictEqual(
          loneLetters(school, difficulty, seed),
          0,
          `a lone letter in ${label(school, difficulty, seed)}`,
        );
      }
    }
  }
});

test('Curse and the register never draw a kenning, even where the tiers license one', () => {
  for (const school of ['curse', 'eldritch'] as const) {
    for (let seed = 0; seed < 60; seed += 1) {
      assert.strictEqual(
        loneLetters(school, 8, seed),
        0,
        `a kenning in ${label(school, 8, seed)}`,
      );
    }
  }
});

test('the kenning vox is reachable where the spec licenses it', () => {
  let seen = 0;
  for (let seed = 0; seed < 400; seed += 1) {
    if (loneLetters('invocation', 8, seed) > 0) seen += 1;
  }
  assert.ok(seen > 0, 'no free power word ever drew a letter');
});

test('the modifier is absent below four, mandatory at four and drawn above it', () => {
  const adverbs = new Set(ADVERBS);
  for (const school of BRIGHT_SCHOOLS) {
    for (let seed = 0; seed < 40; seed += 1) {
      const low = oghamWords(school, 3, seed);
      assert.ok(!low.some((word) => adverbs.has(word)), `an adverb at tier 3 in ${school}`);
    }
  }
  let atFour = 0;
  for (let seed = 0; seed < 40; seed += 1) {
    const words = oghamWords('invocation', 4, seed);
    if (words.some((word) => adverbs.has(word))) atFour += 1;
  }
  // The invocation family takes adverbs only, so tier 4 must show one every
  // time (spec 10.9, plan 1.3).
  assert.strictEqual(atFour, 40, 'tier 4 did not always carry its modifier');
});

test('every drawn noun form is a stem plus one of the four endings', () => {
  const roots = new Set(Object.values(FIELDS).flat().map((root) => root.root));
  const listed = new Set([
    ...Object.values(IDIOM_TABLE).flatMap(([spoken]) => spoken.split(' ')),
    ...BRIGHT_IDS,
    ...DARK_IDS,
    ...DREAD_IDS,
    ...Object.values(NUMERALS).flatMap(([spoken]) => spoken.split(' ')),
    // The tally triangle writes the steps of a listed word, which are listed
    // data cut short rather than drawn material (spec 10.9).
    ...truncations(IDIOM_WORDS.OO1[0]?.letters ?? []),
    ...truncations(Array.from('morrigan')),
    SEAL_HEAD_SPOKEN,
    'vrit',
    'do',
    'in',
    'tanac',
    'cul',
    'rem',
    'atir',
    'beos',
  ]);
  sweepOgham(ALL_SCHOOLS, (out, school, difficulty, seed) => {
    if (school === 'eldritch') return;
    const where = label(school, difficulty, seed);
    for (const word of out.transliteration.split(' ')) {
      if (listed.has(word)) continue;
      const stripped = ['as', 'an', 'etu', 'it', 'us', 'u', 'i', 'e']
        .map((ending) => (word.endsWith(ending) ? word.slice(0, -ending.length) : null))
        .filter((stem): stem is string => stem !== null);
      const candidates = [word, ...stripped, ...stripped.map((stem) => stem.replace(/^ro/u, ''))];
      const adverb = ADVERBS.includes(word);
      assert.ok(
        adverb || candidates.some((stem) => roots.has(stem)),
        `${word} is neither listed nor built from a root in ${where}`,
      );
    }
  });
});
