import test from 'node:test';
import * as assert from 'node:assert/strict';
import { lettersFor } from '../src/ts/languages/greek.js';
import { FIELDS } from '../src/ts/languages/greek-data.js';
import {
  BRIGHT_WORDS,
  DARK_WORDS,
  DIRECTION_WORDS_SPEC,
  FN_ARA,
  FN_EIS,
  FN_KAI,
  FN_KATA,
  GC1,
  GC2,
  GC3,
  GC4,
  GC5_TAIL,
  GO1,
  GO2,
  GO3_FULL,
  GO3_SHORT,
  GO4,
  GO5,
  GO6,
  NUMERALS,
} from './greek-spec.js';
import { ALL_SCHOOLS, BRIGHT_SCHOOLS, DIFFICULTIES, SEEDS, greek, greekWords } from './gen.js';

const label = (school: string, difficulty: number, seed: number): string =>
  `${school} d${difficulty} seed ${seed}`;

const TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

const clauseCount = (difficulty: number): number =>
  difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;

// The school's own opener, which the Ephesian words may stand in front of.
const OPENER: Readonly<Record<string, ReadonlyArray<string>>> = {
  protection: GO1,
  curse: GO4,
  invocation: GO2,
  divination: GO5,
  chronomancy: GO6,
};

// Every clause of a formula, cut on the word that joins them.
function clausesOf(words: ReadonlyArray<string>, from: number, to: number): string[][] {
  const body = words.slice(from, to);
  const clauses: string[][] = [[]];
  for (const word of body) {
    if (word === FN_KAI) clauses.push([]);
    else clauses[clauses.length - 1]?.push(word);
  }
  return clauses;
}

test('the school opener heads the formula, behind the Ephesian words at the top tiers', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'eldritch') continue;
    for (const difficulty of TIERS) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = greekWords(school, difficulty, seed);
        const own = [...(OPENER[school] ?? [])];
        const row = difficulty === 7 ? [...GO3_SHORT] : difficulty >= 8 ? [...GO3_FULL] : [];
        assert.deepStrictEqual(words.slice(0, row.length + own.length), [...row, ...own], where);
      }
    }
  }
});

test('the closers follow the assignment and stack the sealing word at the top', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'eldritch') continue;
    for (const difficulty of TIERS) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = greekWords(school, difficulty, seed);
        const seal = difficulty >= 7 ? words.lastIndexOf('lege') : -1;
        const end = seal > 0 ? seal : words.length;
        const stacked = difficulty >= 8 ? [...GC3] : [];
        const own =
          school === 'divination'
            ? [...GC4]
            : school === 'chronomancy'
              ? [GC5_TAIL]
              : words.includes(GC2[0] ?? '')
                ? [...GC2]
                : [...GC1];
        if (difficulty <= 4) {
          for (const part of [...GC1, ...GC2, ...GC3, ...GC4, GC5_TAIL]) {
            assert.ok(!words.includes(part), `closer at ${where}`);
          }
          continue;
        }
        assert.deepStrictEqual(
          words.slice(end - stacked.length - own.length, end),
          [...own, ...stacked],
          `closer in ${where}`,
        );
      }
    }
  }
});

test('KAI joins clauses, only between them, and only from difficulty 6', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = greekWords(school, difficulty, seed);
        const joins = words.filter((word) => word === FN_KAI).length;
        assert.strictEqual(joins, Math.max(0, clauseCount(difficulty) - 1), `KAI count in ${where}`);
        if (difficulty < 6) assert.strictEqual(joins, 0, `KAI below tier 6 in ${where}`);
      }
    }
  }
});

test('ARA opens a divination asking clause and stands nowhere else', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = greekWords(school, difficulty, seed);
        const asks = words.filter((word) => word === FN_ARA).length;
        const expected = school === 'divination' && difficulty >= 3 ? 1 : 0;
        assert.strictEqual(asks, expected, `ARA count in ${where}`);
        if (expected === 0) continue;
        // It stands first in its clause, and the verb second (spec 8.13). The
        // Ephesian words and the school opener are what precede it.
        const at = words.indexOf(FN_ARA);
        const row = difficulty === 7 ? GO3_SHORT.length : difficulty >= 8 ? GO3_FULL.length : 0;
        assert.strictEqual(at, row + GO5.length, `ARA is not first in its clause in ${where}`);
        assert.match(words[at + 1] ?? '', /ei$/u, `the verb does not follow ARA in ${where}`);
      }
    }
  }
});

test('the verb sits where its school puts it', () => {
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      // Protection: the amulet puts its verb last, behind the KATA phrase.
      const protection = greekWords('protection', difficulty, seed);
      for (const clause of clausesOf(protection, GO1.length + (difficulty === 7 ? GO3_SHORT.length : difficulty >= 8 ? GO3_FULL.length : 0), protection.length)) {
        if (clause.length === 0) continue;
        const at = clause.indexOf(FN_KATA);
        if (at < 0) continue;
        assert.match(clause[0] ?? '', /os$/u, `protection subject in ${label('protection', difficulty, seed)}`);
        // Every word of the KATA phrase after the preposition ends in -ou, and
        // the phrase ends on its noun (spec 8.13).
        let index = at + 1;
        while (index < clause.length && (clause[index] ?? '').endsWith('ou')) index += 1;
        assert.ok(index > at + 1, `empty KATA phrase in ${label('protection', difficulty, seed)}`);
        assert.match(clause[index] ?? '', /oo$/u, `verb after the KATA phrase`);
      }

      // Curse: the tablets open on the binding verb.
      const curse = greekWords('curse', difficulty, seed);
      for (const clause of clausesOf(curse, GO4.length + (difficulty === 7 ? GO3_SHORT.length : difficulty >= 8 ? GO3_FULL.length : 0), curse.length)) {
        if (clause.length === 0) continue;
        if (GC1.includes(clause[0] ?? '') || GC2.includes(clause[0] ?? '')) continue;
        assert.match(clause[0] ?? '', /etoo$/u, `curse verb not first in ${label('curse', difficulty, seed)}`);
      }
    }
  }
});

test('the divination clauses ask first and see after, verb-final in the answer', () => {
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const words = greekWords('divination', difficulty, seed);
      const row = difficulty === 7 ? GO3_SHORT.length : difficulty >= 8 ? GO3_FULL.length : 0;
      const clauses = clausesOf(words, row + GO5.length, words.length);
      const asking = clauses[0] ?? [];
      assert.strictEqual(asking[0], FN_ARA, `the question does not open on ARA in ${where}`);
      for (let i = 1; i < clauseCount(difficulty); i += 1) {
        const seeing = clauses[i] ?? [];
        assert.match(seeing[0] ?? '', /os$/u, `seeing subject in ${where}`);
        // The verb closes the statement, with its adverb behind it if drawn.
        const tail = seeing.filter((word) => /oo$|oos$/u.test(word));
        assert.ok(tail.length > 0, `no verb in the seeing clause of ${where}`);
      }
    }
  }
});

test('the chronomancy clauses cross first and bind after, on the aorist', () => {
  const directions = new Set(Object.values(DIRECTION_WORDS_SPEC));
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = greekWords('chronomancy', difficulty, seed);
      const row = difficulty === 7 ? GO3_SHORT.length : difficulty >= 8 ? GO3_FULL.length : 0;
      const clauses = clausesOf(words, row + GO6.length, words.length);
      const crossing = clauses[0] ?? [];
      assert.match(crossing[0] ?? '', /e$/u, `the command does not open the crossing in ${where}`);
      assert.ok(directions.has(crossing[1] ?? ''), `no direction behind the verb in ${where}`);
      assert.strictEqual(
        crossing.filter((word) => directions.has(word)).length,
        1,
        `one direction per formula in ${where}`,
      );
      for (let i = 1; i < clauseCount(difficulty); i += 1) {
        const binding = clauses[i] ?? [];
        assert.match(binding[0] ?? '', /on$/u, `the object does not open the binding in ${where}`);
        // The aorist is the form that states a thing done, and no other school
        // in this genome draws it.
        assert.ok(
          binding.some((word) => /(?:ksa|psa|sa|eesa)$/u.test(word)),
          `no aorist in the binding clause of ${where}`,
        );
        assert.ok(!directions.has(binding[1] ?? ''), `a direction in a binding clause in ${where}`);
      }
    }
  }
});

test('the chronomancy anchor is a time noun governed by EIS', () => {
  const time = new Set(FIELDS.time.map((r) => r.root));
  for (const difficulty of [5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = greekWords('chronomancy', difficulty, seed);
      const at = words.indexOf(FN_EIS);
      assert.ok(at > 0, `no anchor in ${where}`);
      const anchor = words[at + 1] ?? '';
      assert.match(anchor, /on$/u, `the anchor is not accusative in ${where}`);
      assert.ok(time.has(anchor.slice(0, -2)), `the anchor is not a time noun: ${anchor}`);
      if (difficulty >= 9) {
        const genitive = words[at + 2] ?? '';
        assert.match(genitive, /ou$/u, `the anchor genitive in ${where}`);
        assert.ok(time.has(genitive.slice(0, -2)), `the genitive is not a time noun: ${genitive}`);
        assert.notStrictEqual(genitive.slice(0, -2), anchor.slice(0, -2), 'drawn twice');
        assert.strictEqual(words[at + 3], GC5_TAIL, `the anchor tail in ${where}`);
      } else {
        assert.strictEqual(words[at + 2], GC5_TAIL, `the anchor tail in ${where}`);
      }
    }
  }
});

test('the repetition stands after the last clause and before the closer', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [8, 9]) {
        const where = label(school, difficulty, seed);
        const words = greekWords(school, difficulty, seed);
        const pool = school === 'curse' ? DARK_WORDS : BRIGHT_WORDS;
        if (difficulty === 8) {
          // Three of the same word in a row, from the school's own pool.
          const at = words.findIndex(
            (word, index) =>
              pool.includes(word) && words[index + 1] === word && words[index + 2] === word,
          );
          if (school !== 'eldritch') {
            assert.ok(at > 0, `no triple in ${where}`);
          }
          continue;
        }
        // At tier 9 the word loses its first letter at each step, down to one,
        // so the sequence is a run of shrinking suffixes.
        const at = words.findIndex((word, index) => {
          const next = words[index + 1] ?? '';
          const third = words[index + 2] ?? '';
          return (
            word.length > next.length &&
            word.endsWith(next) &&
            next.length > third.length &&
            next.endsWith(third)
          );
        });
        assert.ok(at > 0, `no shrinking sequence in ${where}`);
      }
    }
  }
});

test('the protection power word gives way to the repetition at the top tiers', () => {
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      const where = label('protection', difficulty, seed);
      const words = greekWords('protection', difficulty, seed);
      const voces = words.filter((word) => BRIGHT_WORDS.includes(word)).length;
      // One free power word per clause below tier 8, and none above it, where
      // the repetition speaks the word three times in its own segment.
      const free = difficulty >= 8 ? 0 : clauseCount(difficulty);
      const repeated = difficulty === 8 ? 3 : difficulty === 9 ? 1 : 0;
      // damnameneus is also the fifth Ephesian word, which the row spends at
      // tiers 7 and up, so it is counted out of the free tally.
      const row = difficulty >= 7 ? (GO3_FULL.includes('damnameneus') && difficulty >= 8 ? 1 : 0) : 0;
      assert.strictEqual(voces - row, free + repeated, `power word count in ${where}`);
    }
  }
});

test('an attributive adjective carries the ending of the noun that follows it', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const difficulty of [4, 5, 6, 7, 8, 9]) {
      for (let seed = 0; seed < 40; seed += 1) {
        const where = label(school, difficulty, seed);
        const words = greekWords(school, difficulty, seed);
        // Only the roots that are adjectives and nothing else: a root that is
        // also a noun would be read as its own head.
        const adjectives = FIELDS.night
          .concat(FIELDS.harm, FIELDS.death, FIELDS.sight, FIELDS.fate, FIELDS.course)
          .filter((r) => r.forms.includes('adj') && !r.forms.includes('noun'))
          .map((r) => r.root);
        words.forEach((word, index) => {
          const root = adjectives.find(
            (candidate) =>
              word === `${candidate}os` || word === `${candidate}on` || word === `${candidate}ou`,
          );
          if (root === undefined) return;
          const ending = word.slice(root.length);
          const next = words[index + 1] ?? '';
          assert.ok(next.endsWith(ending), `adjective ${word} disagrees with ${next} in ${where}`);
        });
      }
    }
  }
});

test('the seal is fixed where the school fixes it', () => {
  for (const seed of SEEDS) {
    // Three at tier 7 for Divination, the count the papyri most often ask for.
    for (const difficulty of [7]) {
      const words = greekWords('divination', difficulty, seed);
      assert.deepStrictEqual(words.slice(-1), [NUMERALS[3]?.[1]], label('divination', 7, seed));
    }
    // Twelve at tiers 7 and 8 for Chronomancy, tier 9 chooses.
    for (const difficulty of [7, 8]) {
      const words = greekWords('chronomancy', difficulty, seed);
      assert.deepStrictEqual(
        words.slice(-1),
        [NUMERALS[12]?.[1]],
        label('chronomancy', difficulty, seed),
      );
    }
    const nine = greekWords('chronomancy', 9, seed).slice(-2).join(' ');
    assert.ok(
      nine.endsWith(NUMERALS[12]?.[1] ?? '') || nine.endsWith(NUMERALS[99]?.[1] ?? ''),
      `tier 9 seal in ${label('chronomancy', 9, seed)}`,
    );
  }
});

test('gloss is plain english and reflects the school', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const out = greek(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        assert.match(out.gloss, /^[A-Za-z][A-Za-z ,.!?-]*[.!?]$/u, `gloss shape in ${where}`);
        if (difficulty < 3) continue;
        if (school === 'protection') assert.ok(out.gloss.includes('against'), `against in ${where}`);
        if (school === 'curse') assert.ok(out.gloss.includes('ay the'), `may in ${where}`);
        if (school === 'invocation' || school === 'eldritch') {
          assert.ok(out.gloss.includes('O '), `vocative in ${where}`);
        }
        if (school === 'divination') assert.ok(out.gloss.includes('?'), `question in ${where}`);
        if (school === 'chronomancy') {
          // The binding clause, and with it the performative, enters at tier 6.
          if (difficulty >= 6) assert.ok(out.gloss.includes('hereby'), `performative in ${where}`);
          assert.ok(!out.gloss.includes('?'), `question in ${where}`);
        }
      }
    }
  }
});

test('the glyph line of one formula is the letters of its own transliteration', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const out = greek(school, difficulty, seed);
        for (const word of out.transliteration.split(' ')) {
          if (word === 'eneneekonta' || word === 'ennea' || word === 'treis') continue;
          if (word === 'epta' || word === 'doodeka') continue;
          assert.ok(
            out.glyphs.includes(lettersFor(word)),
            `${word} is not written in ${label(school, difficulty, seed)}`,
          );
        }
      }
    }
  }
});
