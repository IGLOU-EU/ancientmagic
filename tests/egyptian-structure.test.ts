import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  A1_MAN,
  BRIGHT_SPOKEN,
  EC1_SPOKEN,
  EC2_SPOKEN,
  EO1_SPOKEN,
  EO2_HEAD_SPOKEN,
  NUMERALS,
  SEAL_SIGN,
  codePoints,
} from './egyptian-spec.js';
import { ALL_SCHOOLS, BRIGHT_SCHOOLS, DIFFICULTIES, SEEDS, egyptian, egyptianWords } from './gen.js';

const label = (school: string, difficulty: number, seed: number): string =>
  `${school} d${difficulty} seed ${seed}`;

const words = (school: string, difficulty: number, seed: number): string[] =>
  egyptian(school as never, difficulty, seed).transliteration.split(' ');

test('difficulty 1: a single attested power word with its determinative', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      const line = words(school, 1, seed);
      assert.strictEqual(line.length, 1, label(school, 1, seed));
      assert.ok(BRIGHT_SPOKEN.includes(line[0] ?? ''), `not attested: ${line[0]}`);
    }
  }
});

test('difficulty 2: imperative intent then target, two content words', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const where = label(school, 2, seed);
      const list = egyptianWords(school, 2, seed);
      assert.strictEqual(list.length, 2, where);
      assert.ok(list.every((w) => w.role === 'content'), where);
      // The imperative is the bare root, so it carries no suffix pronoun.
      assert.strictEqual(list[0]?.suffix, '', `tier 2 verb takes a suffix in ${where}`);
    }
  }
});

test('openers follow the tier table', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [3, 4]) {
        const line = words(school, difficulty, seed);
        assert.deepStrictEqual(line.slice(0, 2), [...EO2_HEAD_SPOKEN], label(school, difficulty, seed));
      }
      for (const difficulty of [5, 6, 7]) {
        const line = words(school, difficulty, seed);
        assert.deepStrictEqual(line.slice(0, 2), [...EO1_SPOKEN], label(school, difficulty, seed));
      }
      for (const difficulty of [8, 9]) {
        const line = words(school, difficulty, seed);
        assert.deepStrictEqual(
          line.slice(0, 4),
          [...EO1_SPOKEN, ...EO2_HEAD_SPOKEN],
          label(school, difficulty, seed),
        );
      }
    }
  }
});

test('closers follow the tier table', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [3, 4]) {
        const line = words(school, difficulty, seed);
        for (const closer of [...EC1_SPOKEN, ...EC2_SPOKEN]) {
          assert.ok(!line.includes(closer), `closer at d${difficulty}`);
        }
      }
      for (const difficulty of [5, 6]) {
        const line = words(school, difficulty, seed);
        assert.deepStrictEqual(line.slice(-2), [...EC2_SPOKEN], label(school, difficulty, seed));
      }
      for (const difficulty of [7, 8]) {
        // The seal closes the formula, the closing idiom sits just before it.
        // The lexicon also holds a root spoken sep, so the seal is the last one.
        const line = words(school, difficulty, seed);
        const at = line.lastIndexOf('sep');
        assert.ok(at > 0, `no seal in ${label(school, difficulty, seed)}`);
        assert.deepStrictEqual(line.slice(at - 3, at), [...EC1_SPOKEN], label(school, difficulty, seed));
      }
      const nine = words(school, 9, seed);
      const at = nine.lastIndexOf('sep');
      assert.deepStrictEqual(
        nine.slice(at - 5, at),
        [...EC1_SPOKEN, ...EC2_SPOKEN],
        label(school, 9, seed),
      );
    }
  }
});

test('the sep seal closes the formula and its strokes match the numeral word', () => {
  const allowed: Record<number, number[]> = { 7: [2, 4], 8: [7], 9: [9, 12] };
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2, 3, 4, 5, 6]) {
        const out = egyptian(school, difficulty, seed);
        assert.ok(
          !out.glyphs.includes(SEAL_SIGN),
          `unexpected seal in ${label(school, difficulty, seed)}`,
        );
      }
      for (const difficulty of [7, 8, 9]) {
        const where = label(school, difficulty, seed);
        const out = egyptian(school, difficulty, seed);
        const line = out.transliteration.split(' ');
        const at = line.lastIndexOf('sep');
        assert.ok(at >= 0, `no seal word in ${where}`);
        const numeral = line.slice(at + 1).join(' ');
        const counts = allowed[difficulty] ?? [];
        const count = counts.find((c) => NUMERALS[c]?.[1] === numeral);
        assert.ok(count !== undefined, `seal count out of tier in ${where}: ${numeral}`);
        const glyphs = NUMERALS[count ?? 0]?.[0] ?? '';
        assert.ok(
          out.glyphs.endsWith(SEAL_SIGN + glyphs),
          `seal is not the final sign group in ${where}`,
        );
        assert.ok(out.gloss.includes('Recited'), `seal missing from the gloss in ${where}`);
      }
    }
  }
});

test('protection clauses are verb initial, with r before the target and in before the agent', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('protection', difficulty, seed);
      const list = egyptianWords('protection', difficulty, seed);
      const line = list.map((w) => w.spoken);
      // Every verb of a protection clause carries the first person suffix.
      const expected = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
      const suffixed = list.filter((w) => w.suffix !== '');
      assert.strictEqual(suffixed.length, expected, `suffixed verbs in ${where}`);
      list.forEach((word, index) => {
        if (word.suffix === '') return;
        assert.ok(word.glyphs.endsWith(A1_MAN), `suffix is not the seated man in ${where}`);
        assert.strictEqual(line[index + 1], 'er', `r does not follow the verb in ${where}`);
      });
      assert.strictEqual(
        line.filter((w) => w === 'in').length,
        expected,
        `in-agent count in ${where}`,
      );
      line.forEach((word, index) => {
        if (word !== 'in') return;
        assert.ok(
          BRIGHT_SPOKEN.includes(line[index + 1] ?? ''),
          `in is not followed by a divine name in ${where}`,
        );
      });
      // Below tier 6 the opener is the whole preamble, so the verb of the one
      // clause has to be the very next word: the clause is verb initial.
      if (difficulty <= 5) {
        const opener = difficulty <= 4 ? 3 : 2;
        assert.notStrictEqual(list[opener]?.suffix, '', `clause not verb initial in ${where}`);
      }
    }
  }
});

test('curse clauses topicalize with ir and let the verb take the third person suffix', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('curse', difficulty, seed);
      const list = egyptianWords('curse', difficulty, seed);
      const line = list.map((w) => w.spoken);
      const irCount = line.filter((w) => w === 'ir').length;
      const expected = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
      assert.strictEqual(irCount, expected, `clause count via ir in ${where}`);
      const suffixed = list.filter((w) => w.suffix !== '');
      assert.strictEqual(suffixed.length, expected, `suffixed verbs in ${where}`);
      for (const verb of suffixed) {
        assert.ok(verb.glyphs.endsWith('\u{13191}'), `suffix is not the viper in ${where}`);
      }
      // The topicalizer heads the target, an adjective may follow it, and the
      // verb closes the group. Nothing else stands between ir and the verb.
      line.forEach((word, index) => {
        if (word !== 'ir') return;
        const next = list[index + 1];
        assert.strictEqual(next?.role, 'content', `ir does not head a noun in ${where}`);
        const verbAt = list.findIndex((w, i) => i > index && w.suffix !== '');
        assert.ok(verbAt - index <= 3, `too much material after ir in ${where}`);
        for (let i = index + 1; i < verbAt; i += 1) {
          assert.strictEqual(list[i]?.role, 'content', `function word inside the ir group in ${where}`);
        }
      });
    }
  }
});

test('invocation clauses open on the vocative and reach my before the power word', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('invocation', difficulty, seed);
      const line = words('invocation', difficulty, seed);
      const expected = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
      assert.strictEqual(
        line.filter((w) => w === 'mi').length,
        expected,
        `my count in ${where}`,
      );
      line.forEach((word, index) => {
        if (word !== 'mi') return;
        assert.ok(
          BRIGHT_SPOKEN.includes(line[index + 1] ?? ''),
          `my is not followed by a power word in ${where}`,
        );
      });
    }
  }
});

test('the epithet chain grows with the tier', () => {
  for (const difficulty of [3, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('invocation', difficulty, seed);
      const line = words('invocation', difficulty, seed);
      // Each clause opens on the vocative i and stacks n-genitive epithets.
      const perClause = difficulty >= 8 ? 3 : difficulty >= 6 ? 2 : 1;
      const clauses = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
      const genitives = line.filter((w) => w === 'en').length;
      // The EO2 title line also spends one n at tiers 3, 4, 8 and 9, and each
      // gate name of the tier 8 litany spends one more.
      const titleN = difficulty <= 4 || difficulty >= 8 ? 1 : 0;
      const litanyN = difficulty >= 8 ? 3 : 0;
      assert.strictEqual(
        genitives,
        clauses * (perClause - 1) + titleN + litanyN,
        `n-genitive count in ${where}`,
      );
    }
  }
});

test('the name knowledge line enters at tier 6 for protection and invocation only', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4, 5]) {
      for (const school of BRIGHT_SCHOOLS) {
        const line = words(school, difficulty, seed);
        assert.ok(!line.includes('rekhi'), `early gate address in ${label(school, difficulty, seed)}`);
      }
    }
    for (const difficulty of [6, 7]) {
      for (const school of ['protection', 'invocation'] as const) {
        const line = words(school, difficulty, seed);
        assert.strictEqual(line.filter((w) => w === 'rekhi').length, 1, label(school, difficulty, seed));
        const at = line.indexOf('rekhi');
        assert.strictEqual(line[at + 1], 'renek', label(school, difficulty, seed));
      }
      const curse = words('curse', difficulty, seed);
      assert.ok(!curse.includes('rekhi'), `curse took a gate address at d${difficulty}`);
    }
  }
});

test('tiers 8 and 9 open a litany of three gate addresses with distinct head nouns', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const difficulty of [8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const list = egyptianWords(school, difficulty, seed);
        const line = list.map((w) => w.spoken);
        assert.strictEqual(line.filter((w) => w === 'rekhi').length, 3, `litany size in ${where}`);
        const heads: string[] = [];
        line.forEach((word, index) => {
          if (word !== 'i') return;
          const head = list[index + 1];
          if (head?.field !== 'gates') return;
          heads.push(head.spoken);
        });
        assert.strictEqual(heads.length, 3, `gate head nouns in ${where}`);
        assert.strictEqual(new Set(heads).size, 3, `repeated gate head noun in ${where}`);
      }
    }
  }
});

test('gloss is plain english and reflects the school', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const out = egyptian(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        assert.match(out.gloss, /^[A-Za-z][A-Za-z ,.!-]*[.!]$/, `gloss shape in ${where}`);
        if (difficulty < 3) continue;
        if (school === 'protection') {
          assert.ok(out.gloss.includes('against'), `protection gloss in ${where}`);
          assert.ok(out.gloss.includes(' by '), `no in-agent in the gloss of ${where}`);
        }
        if (school === 'curse') assert.ok(out.gloss.includes('May the'), `curse gloss in ${where}`);
        if (school === 'invocation' || school === 'eldritch') {
          assert.ok(out.gloss.includes('O '), `vocative gloss in ${where}`);
        }
      }
    }
  }
});

test('the modifier is absent below tier 4 and mandatory at tier 4', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const three = egyptianWords(school, 3, seed).filter((w) => w.role === 'content');
      const four = egyptianWords(school, 4, seed).filter((w) => w.role === 'content');
      assert.ok(four.length > three.length, `no modifier at tier 4 in ${label(school, 4, seed)}`);
    }
  }
});

test('the seal count is written with repeated strokes, exempt from collapse', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [7, 8, 9]) {
      for (const seed of SEEDS) {
        const out = egyptian(school, difficulty, seed);
        const at = out.glyphs.indexOf(SEAL_SIGN);
        const strokes = codePoints(out.glyphs.slice(at + SEAL_SIGN.length));
        assert.ok(strokes.length >= 2, `seal without a count in ${label(school, difficulty, seed)}`);
      }
    }
  }
});
