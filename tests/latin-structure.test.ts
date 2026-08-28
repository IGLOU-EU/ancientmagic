import test from 'node:test';
import * as assert from 'node:assert/strict';
import { lettersFor } from '../src/ts/languages/latin.js';
import { FIELDS } from '../src/ts/languages/latin-data.js';
import {
  CHANT_IDS,
  DARK_SHRINKING_STEPS,
  DIRECTION_WORDS_SPEC,
  DISPATER_TIER1,
  DREAD_WORDS,
  FN_AD_SPEC,
  FN_CONTRA_SPEC,
  FN_ET_SPEC,
  FROZEN_WORDS,
  LC1,
  LC2,
  LC3,
  LC4,
  LC5_TAIL_SPEC,
  LO1,
  LO2,
  LO3_FULL,
  LO3_SHORT,
  LO4,
  LO5,
  LO6,
  NUMERALS,
  POWER_WORDS,
  SEAL_TAIL_SPOKEN,
  SHRINKING_STEPS,
  VERB_ENDINGS,
  truncations,
} from './latin-spec.js';
import {
  ALL_SCHOOLS,
  BRIGHT_SCHOOLS,
  DIFFICULTIES,
  SEEDS,
  clauseCount,
  label,
  latin,
  latinWords,
} from './gen.js';

const TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

// The school's own opener, which the square may stand in front of.
const OPENER: Readonly<Record<string, ReadonlyArray<string>>> = {
  protection: LO1,
  curse: LO4,
  invocation: LO2,
  divination: LO5,
  chronomancy: LO6,
};

// How many words the square spends at a tier, which is what a clause reader
// has to skip before the school's own opener.
function rowLength(difficulty: number): number {
  if (difficulty === 7) return LO3_SHORT.length;
  return difficulty >= 8 ? LO3_FULL.length : 0;
}

// Every clause of a formula, cut on the word that joins them.
function clausesOf(words: ReadonlyArray<string>, from: number, to: number): string[][] {
  const body = words.slice(from, to);
  const clauses: string[][] = [[]];
  for (const word of body) {
    if (word === FN_ET_SPEC) clauses.push([]);
    else clauses[clauses.length - 1]?.push(word);
  }
  return clauses;
}

const ROOTS = Object.values(FIELDS).flat();
const NOUN_ROOTS = ROOTS.filter((r) => r.forms.includes('noun'));
const VERB_ROOTS = ROOTS.filter((r) => r.forms.includes('verb'));
const ADJ_ROOTS = ROOTS.filter((r) => r.forms.includes('adj'));
const ADV_ROOTS = ROOTS.filter((r) => r.forms.includes('adv'));
// The endings of the twelve cells of spec 9.4, plus the bare-stem vocative,
// which is why the empty string stands among them.
const CASE_ENDINGS: ReadonlyArray<string> = ['a', 'am', 'ae', 'us', 'um', 'i', 'e', ''];

// Everything a formula can write that is not a drawn form: listed data, the
// function words, the seal and the sequences the tiers repeat.
const LISTED: ReadonlySet<string> = new Set([
  ...FROZEN_WORDS,
  ...DREAD_WORDS,
  FN_CONTRA_SPEC,
  FN_ET_SPEC,
  ...Object.values(DIRECTION_WORDS_SPEC),
  ...Object.values(POWER_WORDS).flat(),
  DISPATER_TIER1,
  ...SHRINKING_STEPS,
  ...DARK_SHRINKING_STEPS,
  ...DREAD_WORDS.flatMap(truncations),
  ...Object.values(NUMERALS).flatMap(([, spoken]) => spoken.split(' ')),
]);

// How many times a word sequence runs through a formula. A chant repeats one
// of its own words, so counting a power by any single word of it overcounts.
function countRuns(words: ReadonlyArray<string>, run: ReadonlyArray<string>): number {
  let found = 0;
  for (let index = 0; index + run.length <= words.length; index += 1) {
    if (run.every((word, offset) => words[index + offset] === word)) found += 1;
  }
  return found;
}

// How a drawn word decomposes: a stem of the lexicon plus one ending of the
// paradigm, and nothing else (spec 9.13). The answer names which paradigm, so
// an assertion can say more than that the word was legal.
function decompose(word: string): 'noun' | 'verb' | 'adverb' | null {
  for (const root of VERB_ROOTS) {
    if (!word.startsWith(root.root)) continue;
    const ending = word.slice(root.root.length);
    if (VERB_ENDINGS.includes(ending)) return 'verb';
  }
  // The adverb is read before the case table, because the two collide on one
  // shape: a root that is both an adjective and an adverb writes stem plus E
  // for the adverb and for the vocative of the -us class, and no adjective of
  // this genome is ever addressed.
  for (const root of ADV_ROOTS) {
    if (word === `${root.root}e`) return 'adverb';
  }
  for (const root of [...NOUN_ROOTS, ...ADJ_ROOTS]) {
    if (!word.startsWith(root.root)) continue;
    if (CASE_ENDINGS.includes(word.slice(root.root.length))) return 'noun';
  }
  return null;
}

test('every word of a formula is listed data or a form of the paradigm', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        for (const word of latinWords(school, difficulty, seed)) {
          if (LISTED.has(word)) continue;
          assert.ok(decompose(word) !== null, `${word} is neither listed nor declined in ${where}`);
        }
      }
    }
  }
});

// A frozen string of 9.6, 9.8 and 9.10 renders as listed and never inflects,
// and the three verbs of other conjugations never leave their own position.
test('the frozen strings never inflect and never enter a gene slot', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        // DEFIGO opens a Curse and nothing else, DVCO closes the Divination
        // opener, DICITO seals. None is ever drawn.
        assert.strictEqual(
          words.filter((word) => word === 'defigo').length,
          school === 'curse' && difficulty >= 3 ? 1 : 0,
          `defigo in ${where}`,
        );
        assert.strictEqual(
          words.filter((word) => word === 'duco').length,
          school === 'divination' && difficulty >= 3 ? 1 : 0,
          `duco in ${where}`,
        );
        // A perfect in the line is either a drawn stem plus AVI, or the frozen
        // VENI and SOLVI inside their own idioms.
        for (const word of words) {
          if (!word.endsWith('vi') || word.endsWith('avi')) continue;
          if (decompose(word) !== null) continue;
          assert.ok(
            word === LC5_TAIL_SPEC || word === 'solvi',
            `${word} is a perfect outside the paradigm in ${where}`,
          );
        }
        // AETERNA belongs to the dread closer alone: the time noun aeternum
        // is a different form and stays where it is (spec 9.10).
        if (words.includes('aeterna')) {
          assert.strictEqual(school, 'eldritch', `aeterna outside the register in ${where}`);
        }
      }
    }
  }
});

test('the school opener heads the formula, behind the square at the top tiers', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'eldritch') continue;
    for (const difficulty of TIERS) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        const own = [...(OPENER[school] ?? [])];
        const row =
          difficulty === 7 ? [...LO3_SHORT] : difficulty >= 8 ? [...LO3_FULL] : [];
        assert.deepStrictEqual(words.slice(0, row.length + own.length), [...row, ...own], where);
      }
    }
  }
});

test('the closers follow the assignment and stack the paid vow at the top', () => {
  for (const school of ALL_SCHOOLS) {
    if (school === 'eldritch') continue;
    for (const difficulty of TIERS) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        const seal = difficulty >= 7 ? words.lastIndexOf(SEAL_TAIL_SPOKEN) : -1;
        // The seal is the numeral group and its instruction, so what precedes
        // it is the numeral, one word or two.
        const spoken = difficulty >= 7 ? (words[seal - 2] === 'ter' ? 2 : 1) : 0;
        const end = seal > 0 ? seal - spoken : words.length;
        const stacked = difficulty >= 8 ? [...LC3] : [];
        const own =
          school === 'divination'
            ? [...LC4]
            : school === 'chronomancy'
              ? [LC5_TAIL_SPEC]
              : words.includes(LC2[0] ?? '')
                ? [...LC2]
                : [...LC1];
        if (difficulty <= 4) {
          for (const part of [...LC1, ...LC2, ...LC3, ...LC4, LC5_TAIL_SPEC]) {
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

test('ET joins clauses, only between them, and only from difficulty 6', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        const joins = words.filter((word) => word === FN_ET_SPEC).length;
        assert.strictEqual(joins, Math.max(0, clauseCount(difficulty) - 1), `ET count in ${where}`);
        if (difficulty < 6) assert.strictEqual(joins, 0, `ET below tier 6 in ${where}`);
      }
    }
  }
});

// Spec 9.13: a CONTRA phrase runs CONTRA, an optional adjective, then its
// noun, every word after CONTRA in the accusative of its own class, and the
// phrase ends on its noun.
test('the CONTRA phrase is accusative from the preposition to its noun', () => {
  const ACCUSATIVE = /(?:am|um)$/u;
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        const found = words.filter((word) => word === FN_CONTRA_SPEC).length;
        assert.strictEqual(
          found,
          school === 'protection' && difficulty >= 3 ? clauseCount(difficulty) : 0,
          `CONTRA count in ${where}`,
        );
        words.forEach((word, index) => {
          if (word !== FN_CONTRA_SPEC) return;
          const first = words[index + 1] ?? '';
          assert.match(first, ACCUSATIVE, `${first} after CONTRA in ${where}`);
          const second = words[index + 2] ?? '';
          // Either the phrase ended on its noun, or the first word was the
          // adjective and the noun follows it in the same case.
          if (ACCUSATIVE.test(second) && decompose(second) === 'noun') {
            assert.strictEqual(
              first.slice(-2),
              second.slice(-2),
              `adjective ${first} disagrees with ${second} in ${where}`,
            );
            assert.ok(
              !ACCUSATIVE.test(words[index + 3] ?? '') ||
                decompose(words[index + 3] ?? '') !== 'noun',
              `a third accusative in the CONTRA phrase of ${where}`,
            );
          }
        });
      }
    }
  }
});

test('the verb sits where its school puts it', () => {
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      // Protection: the votive shape lands its verb last, behind the CONTRA
      // phrase, with the free power word after it below tier 8.
      const protection = latinWords('protection', difficulty, seed);
      const clauses = clausesOf(
        protection,
        rowLength(difficulty) + LO1.length,
        protection.length,
      );
      clauses.forEach((clause, index) => {
        if (index >= clauseCount(difficulty)) return;
        const at = clause.indexOf(FN_CONTRA_SPEC);
        assert.ok(at >= 0, `no CONTRA in ${label('protection', difficulty, seed)}`);
        const verb = clause.findIndex((word, i) => i > at && /o$/u.test(word));
        assert.ok(verb > at, `no first person verb in ${label('protection', difficulty, seed)}`);
      });

      // Curse: the victim first, the law second, the manner trailing.
      const curse = latinWords('curse', difficulty, seed);
      for (const clause of clausesOf(
        curse,
        rowLength(difficulty) + LO4.length,
        curse.length,
      )) {
        if (clause.length === 0) continue;
        if (LC1.includes(clause[0] ?? '') || LC2.includes(clause[0] ?? '')) continue;
        const optative = clause.findIndex((word) => word.endsWith('ato'));
        assert.ok(optative >= 0, `no -ATO in ${label('curse', difficulty, seed)}`);
        // The target stands in front of it, one word or two with its adjective.
        assert.ok(optative >= 1, `the law opens the clause in ${label('curse', difficulty, seed)}`);
        assert.match(
          clause[optative - 1] ?? '',
          /(?:am|um)$/u,
          `the victim is not accusative in ${label('curse', difficulty, seed)}`,
        );
      }
    }
  }
});

// Spec 9.13: -ATO appears only in a Curse clause, -AVI only in a Chronomancy
// binding clause, and the enclitic only on the first word of an asking clause.
test('the marked verb forms appear in their own school and nowhere else', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        const laws = words.filter((word) => word.endsWith('ato')).length;
        const perfects = words.filter(
          (word) => word.endsWith('avi') && decompose(word) === 'verb',
        ).length;
        const asked = words.filter((word) => word.endsWith('atne'));
        assert.strictEqual(
          laws,
          school === 'curse' && difficulty >= 3 ? clauseCount(difficulty) : 0,
          `-ATO count in ${where}`,
        );
        assert.strictEqual(
          perfects,
          school === 'chronomancy' && difficulty >= 3 ? clauseCount(difficulty) - 1 : 0,
          `-AVI count in ${where}`,
        );
        assert.strictEqual(
          asked.length,
          school === 'divination' && difficulty >= 3 ? 1 : 0,
          `enclitic count in ${where}`,
        );
        if (asked.length === 0) continue;
        // It hangs on the asking clause's verb, which the order makes the
        // first word of that clause (spec 9.4).
        const at = words.indexOf(asked[0] ?? '');
        assert.strictEqual(at, rowLength(difficulty) + LO5.length, `the enclitic is not first in ${where}`);
      }
    }
  }
});

test('the divination clauses ask first and see after, verb-final in the answer', () => {
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const words = latinWords('divination', difficulty, seed);
      const clauses = clausesOf(words, rowLength(difficulty) + LO5.length, words.length);
      const asking = clauses[0] ?? [];
      assert.match(asking[0] ?? '', /atne$/u, `the question does not open on the verb in ${where}`);
      for (let i = 1; i < clauseCount(difficulty); i += 1) {
        const seeing = clauses[i] ?? [];
        // The answer is the verb-final statement: subject, object, verb.
        assert.strictEqual(decompose(seeing[0] ?? ''), 'noun', `seeing subject in ${where}`);
        const verb = seeing.findIndex((word) => /o$/u.test(word) && decompose(word) === 'verb');
        assert.ok(verb > 0, `no first person verb in the seeing clause of ${where}`);
      }
    }
  }
});

test('the chronomancy clauses cross first and bind after, on the perfect', () => {
  const directions = new Set(Object.values(DIRECTION_WORDS_SPEC));
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = latinWords('chronomancy', difficulty, seed);
      // The return anchor closes the formula from tier 5 up, and it is not a
      // clause, so the last clause ends where AD begins.
      const anchorAt = words.indexOf(FN_AD_SPEC);
      const body = anchorAt > 0 ? anchorAt : words.length;
      const clauses = clausesOf(words, rowLength(difficulty) + LO6.length, body);
      const crossing = clauses[0] ?? [];
      assert.strictEqual(decompose(crossing[0] ?? ''), 'verb', `no command opening ${where}`);
      assert.ok(directions.has(crossing[1] ?? ''), `no direction behind the verb in ${where}`);
      assert.strictEqual(
        crossing.filter((word) => directions.has(word)).length,
        1,
        `one direction per formula in ${where}`,
      );
      for (let i = 1; i < clauseCount(difficulty); i += 1) {
        const binding = clauses[i] ?? [];
        assert.match(binding[0] ?? '', /(?:am|um)$/u, `the object does not open the binding in ${where}`);
        // Object in the accusative, then the perfect, with the adverb between
        // them when one was drawn (spec 9.12). What follows the perfect is the
        // repetition or the closer, not the clause.
        const perfect = binding.findIndex((word) => word.endsWith('avi'));
        assert.ok(perfect > 0, `no perfect in the binding clause of ${where}`);
        for (const word of binding.slice(0, perfect)) {
          assert.ok(
            /(?:am|um)$/u.test(word) || decompose(word) === 'adverb',
            `${word} stands before the perfect in ${where}`,
          );
        }
        assert.ok(!directions.has(binding[1] ?? ''), `a direction in a binding clause in ${where}`);
      }
    }
  }
});

test('the chronomancy anchor is a time noun in the accusative governed by AD', () => {
  const time = new Set(FIELDS.time.map((r) => r.root));
  for (const difficulty of [5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = latinWords('chronomancy', difficulty, seed);
      const at = words.indexOf(FN_AD_SPEC);
      assert.ok(at > 0, `no anchor in ${where}`);
      const anchor = words[at + 1] ?? '';
      assert.match(anchor, /(?:am|um)$/u, `the anchor is not accusative in ${where}`);
      assert.ok(
        time.has(anchor.slice(0, -2)),
        `the anchor is not a time noun: ${anchor} in ${where}`,
      );
      if (difficulty >= 9) {
        const genitive = words[at + 2] ?? '';
        const stem = genitive.endsWith('ae') ? genitive.slice(0, -2) : genitive.slice(0, -1);
        assert.ok(time.has(stem), `the genitive is not a time noun: ${genitive} in ${where}`);
        assert.notStrictEqual(stem, anchor.slice(0, -2), 'the anchor pair drew one time twice');
        assert.strictEqual(words[at + 3], LC5_TAIL_SPEC, `the anchor tail in ${where}`);
      } else {
        assert.strictEqual(words[at + 2], LC5_TAIL_SPEC, `the anchor tail in ${where}`);
      }
    }
  }
});

test('the repetition stands after the last clause and before the closer', () => {
  const chants = new Set(CHANT_IDS.flatMap((id) => POWER_WORDS[id] ?? []));
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      // The chants fill only the free power word of a school clause: never a
      // single whispered word, and never a repetition (spec 9.7). Every other
      // row fills every use, and the one row of two words writes continuous
      // at tier 1, DIS PATER as DISPATER.
      const whispered = latinWords(school, 1, seed);
      assert.strictEqual(whispered.length, 1, `tier 1 is not one word in ${label(school, 1, seed)}`);
      assert.ok(!chants.has(whispered[0] ?? ''), `a chant at ${label(school, 1, seed)}`);

      for (const difficulty of [8, 9]) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        if (difficulty === 8) {
          // Three copies of one power row back to back, and no chant among
          // them: the row may be two words, so the run is matched whole.
          const rows: ReadonlyArray<ReadonlyArray<string>> = [
            ...Object.values(POWER_WORDS),
            ...DREAD_WORDS.map((epithet) => [epithet]),
          ];
          const at = words.findIndex((_unused, index) =>
            rows.some((row) =>
              [...row, ...row, ...row].every((word, offset) => words[index + offset] === word),
            ),
          );
          assert.ok(at > 0, `no triple in ${where}`);
          assert.ok(!chants.has(words[at] ?? ''), `a chant tripled in ${where}`);
          continue;
        }
        // At tier 9 the sequence is the school's own triangle word, whole,
        // losing its final letter down to a single one: the attested amulet
        // for the bright four, the queen below for Curse, and the epithet the
        // register's own repetition drew (spec 9.9, three cases and no fourth).
        const run = (candidate: ReadonlyArray<string>): number =>
          words.findIndex((_unused, index) =>
            candidate.every((step, offset) => words[index + offset] === step),
          );
        // The register spends whatever epithet its own repetition drew, and
        // that epithet may also stand as an agent elsewhere in the line, so
        // the segment is found by its whole run rather than by its head.
        const steps =
          school === 'curse'
            ? [...DARK_SHRINKING_STEPS]
            : school === 'eldritch'
              ? truncations(DREAD_WORDS.find((epithet) => run(truncations(epithet)) >= 0) ?? '')
              : [...SHRINKING_STEPS];
        assert.ok(steps.length > 1, `no triangle word in ${where}`);
        const at = run(steps);
        assert.ok(at >= 0, `no shrinking sequence in ${where}`);
        assert.strictEqual(
          words[at + steps.length - 1],
          steps[steps.length - 1],
          `the sequence does not reach a single letter in ${where}`,
        );
        // A bright fever amulet never enters a nailing (spec 9.9).
        if (school === 'curse') {
          assert.ok(!words.includes(SHRINKING_STEPS[0] ?? ''), `abracadabra in ${where}`);
        }
      }
    }
  }
});

test('the protection power word gives way to the repetition at the top tiers', () => {
  const single = new Set(
    Object.entries(POWER_WORDS)
      .filter(([id, words]) => !CHANT_IDS.includes(id) && words.length === 1)
      .flatMap(([, words]) => words),
  );
  for (const difficulty of TIERS) {
    for (const seed of SEEDS) {
      const where = label('protection', difficulty, seed);
      const words = latinWords('protection', difficulty, seed);
      // Below tier 8 one free power word per clause, and above it none: the
      // repetition speaks the word three times in its own segment instead.
      const spoken = words.filter((word) => single.has(word)).length;
      const chanted = CHANT_IDS.reduce(
        (n, id) => n + countRuns(words, POWER_WORDS[id] ?? []),
        0,
      );
      const free = difficulty >= 8 ? 0 : clauseCount(difficulty);
      // The triangle speaks the word once and its ten shrunk steps after it,
      // and a step is not the word.
      const repeated = difficulty === 8 ? 3 : difficulty === 9 ? 1 : 0;
      assert.strictEqual(spoken + chanted, free + repeated, `power word count in ${where}`);
    }
  }
});

test('an attributive adjective carries the case of the noun that follows it', () => {
  // Only the roots that are adjectives and nothing else: a root that is also a
  // noun would be read as its own head.
  const adjectives = ADJ_ROOTS.filter((r) => !r.forms.includes('noun')).map((r) => r.root);
  for (const school of BRIGHT_SCHOOLS) {
    for (const difficulty of [4, 5, 6, 7, 8, 9]) {
      for (let seed = 0; seed < 40; seed += 1) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        words.forEach((word, index) => {
          const root = adjectives.find(
            (candidate) => word === `${candidate}am` || word === `${candidate}um`,
          );
          if (root === undefined) return;
          const ending = word.slice(root.length);
          const next = words[index + 1] ?? '';
          assert.ok(next.endsWith(ending), `adjective ${word} disagrees with ${next} in ${where}`);
          // The class is the noun's own, so an -a head takes -AM and a -us or
          // -um head takes -VM (spec 9.4).
          const head = NOUN_ROOTS.find((r) => next === `${r.root}${ending}`);
          assert.ok(head !== undefined, `${next} is not a declined noun in ${where}`);
          assert.strictEqual(
            ending,
            head?.nounClass === 'a' ? 'am' : 'um',
            `${word} takes the wrong class in ${where}`,
          );
        });
      }
    }
  }
});

test('the seal is fixed where the school fixes it', () => {
  for (const seed of SEEDS) {
    // Three at tier 7 for Divination, the count Roman charm instructions reach
    // for first (spec 9.11).
    const divination = latinWords('divination', 7, seed);
    assert.strictEqual(divination[divination.length - 2], NUMERALS[3]?.[1], label('divination', 7, seed));
    // Twelve at tiers 7 and 8 for Chronomancy, tier 9 chooses.
    for (const difficulty of [7, 8]) {
      const words = latinWords('chronomancy', difficulty, seed);
      assert.strictEqual(
        words[words.length - 2],
        NUMERALS[12]?.[1],
        label('chronomancy', difficulty, seed),
      );
    }
    const nine = latinWords('chronomancy', 9, seed).slice(0, -1).join(' ');
    assert.ok(
      nine.endsWith(NUMERALS[12]?.[1] ?? '') || nine.endsWith(NUMERALS[27]?.[1] ?? ''),
      `tier 9 seal in ${label('chronomancy', 9, seed)}`,
    );
  }
});

test('gloss is plain english and reflects the school', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const out = latin(school, difficulty, seed);
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

// The one reading line in this project a reader can lay under the glyphs and
// match letter for letter, which is the whole point of the genome (spec 9.2).
test('the glyph line of one formula is the letters of its own transliteration', () => {
  const numerals = new Set(
    Object.values(NUMERALS).flatMap(([, spoken]) => spoken.split(' ')),
  );
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const out = latin(school, difficulty, seed);
        for (const word of out.transliteration.split(' ')) {
          // The seal speaks a numeral adverb for a letter group, which is the
          // one place the two lines part (spec 9.8).
          if (numerals.has(word)) continue;
          assert.ok(
            out.glyphs.includes(lettersFor(word)),
            `${word} is not written in ${label(school, difficulty, seed)}`,
          );
        }
      }
    }
  }
});

// Conformance bullet 13, the adjacency rule of spec 9.9: at tiers 8 and 9, in
// every school and register, the repetition word is settled before the clauses
// draw, and every free POWER-WORD draw of the same formula then excludes it.
// Before the realignment an Invocation clause could speak abracadabra
// immediately in front of the triangle that opens on it.
test('the repetition word never also fills a free power word of its formula', () => {
  const rows: ReadonlyArray<ReadonlyArray<string>> = [
    ...Object.values(POWER_WORDS),
    ...DREAD_WORDS.map((epithet) => [epithet]),
  ];
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [8, 9]) {
      for (let seed = 0; seed < 60; seed += 1) {
        const where = label(school, difficulty, seed);
        const words = latinWords(school, difficulty, seed);
        // The head of the segment, found on the whole run so a word standing
        // elsewhere in the line cannot be mistaken for it.
        const row =
          difficulty === 8
            ? rows.find((candidate) =>
                words.some((_unused, index) =>
                  [...candidate, ...candidate, ...candidate].every(
                    (word, offset) => words[index + offset] === word,
                  ),
                ),
              )
            : rows.find((candidate) => {
                const head = candidate[0] ?? '';
                if (candidate.length !== 1) return false;
                return words.some((_unused, index) =>
                  truncations(head).every((step, offset) => words[index + offset] === step),
                );
              });
        assert.ok(row !== undefined, `no repetition segment in ${where}`);
        const head = row?.[0] ?? '';
        const steps = difficulty === 8 ? [...(row ?? [])] : truncations(head);
        const at = words.findIndex((_unused, index) =>
          steps.every((step, offset) => words[index + offset] === step),
        );
        // The last free power word of the formula stands immediately in front
        // of the segment, so the two must not be the same row.
        const before = words.slice(Math.max(0, at - (row ?? []).length), at).join(' ');
        assert.notStrictEqual(before, (row ?? []).join(' '), `adjacent repetition in ${where}`);
      }
    }
  }
});
