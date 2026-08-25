import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  A1_MAN,
  BRIGHT_SPOKEN,
  DIRECTION_SPOKEN,
  DIVINATION_SPOKEN,
  EC1_SPOKEN,
  EC2_SPOKEN,
  EC4_SPOKEN,
  EO1_SPOKEN,
  EO2_HEAD_SPOKEN,
  EO4_SPOKEN,
  INIW_SPOKEN,
  IMEN_ROW,
  NUMERALS,
  POWER_TABLE,
  SEAL_SIGN,
  SEDJEM_EN_EF_SUFFIX,
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

// Spec 3.9: the AGENT chain counted in nouns, a head plus its n-genitives.
const AGENT_CHAIN: Readonly<Record<number, number>> = {
  3: 1,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
  8: 3,
  9: 4,
};

test('the epithet chain grows with the tier, four nouns at tier 9', () => {
  for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('invocation', difficulty, seed);
      const line = words('invocation', difficulty, seed);
      // Each clause opens on the vocative i and stacks n-genitive epithets.
      const perClause = AGENT_CHAIN[difficulty] ?? 0;
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

test('every vocative heads a chain of exactly its tier length', () => {
  for (const school of ['invocation', 'eldritch'] as const) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const list = egyptianWords(school, difficulty, seed);
        const expected = AGENT_CHAIN[difficulty] ?? 0;
        // The vocatives of the school clauses are the ones that reach my. The
        // gate addresses of the litany run to rekhi or rekhek instead.
        const chains: number[] = [];
        list.forEach((word, index) => {
          if (word.spoken !== 'i') return;
          let nouns = 0;
          for (let at = index + 1; at < list.length; at += 1) {
            const here = list[at];
            if (here === undefined) break;
            if (here.role === 'content') nouns += 1;
            else if (here.spoken !== 'en') break;
          }
          const stop = list.findIndex((w, at) => at > index && w.role !== 'content' && w.spoken !== 'en');
          if (list[stop]?.spoken !== 'mi') return;
          chains.push(nouns);
        });
        assert.strictEqual(chains.length, difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3, `clause count in ${where}`);
        for (const nouns of chains) {
          assert.strictEqual(nouns, expected, `agent chain length in ${where}`);
        }
      }
    }
  }
});

test('the agent pools never run dry across a wide seed sweep', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [8, 9]) {
      for (let seed = 0; seed < 400; seed += 1) {
        // A dry pool makes pick throw, which fails the test here.
        const out = egyptian(school, difficulty, seed);
        assert.ok(out.glyphs.length > 0, `empty draw for ${label(school, difficulty, seed)}`);
      }
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
        // The question mark joins the shape with Divination, whose asking
        // clause is the only place any script here can put one.
        assert.match(out.gloss, /^[A-Za-z][A-Za-z ,.!?-]*[.!?]$/, `gloss shape in ${where}`);
        if (difficulty < 3) continue;
        if (school === 'protection') {
          assert.ok(out.gloss.includes('against'), `protection gloss in ${where}`);
          assert.ok(out.gloss.includes(' by '), `no in-agent in the gloss of ${where}`);
        }
        if (school === 'curse') assert.ok(out.gloss.includes('May the'), `curse gloss in ${where}`);
        if (school === 'invocation' || school === 'eldritch') {
          assert.ok(out.gloss.includes('O '), `vocative gloss in ${where}`);
        }
        if (school === 'divination') {
          assert.ok(out.gloss.includes('?'), `no question in the gloss of ${where}`);
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

// --- Divination (spec 3.11) -------------------------------------------------

const DIVINATION_TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

const divinationClauses = (difficulty: number): number =>
  difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;

test('the question particle opens the asking clause and stands first in it', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const list = egyptianWords('divination', difficulty, seed);
      const line = list.map((w) => w.spoken);
      const at = line.indexOf(INIW_SPOKEN);
      assert.ok(at >= 0, `no question particle in ${where}`);
      assert.strictEqual(
        line.filter((w) => w === INIW_SPOKEN).length,
        1,
        `one question per formula in ${where}`,
      );
      // The verb follows the particle, bare: no suffix pronoun rides it.
      const verb = list[at + 1];
      assert.strictEqual(verb?.role, 'content', `no verb after the particle in ${where}`);
      assert.strictEqual(verb?.suffix, '', `asking verb takes a suffix in ${where}`);
      // Then the divine name as a full noun subject, written with its flag.
      assert.ok(
        DIVINATION_SPOKEN.includes(line[at + 2] ?? ''),
        `no questioned power after the verb in ${where}`,
      );
      // A Divination asking clause carries no in agent phrase at all.
      assert.ok(!line.includes('in'), `in-agent phrase in ${where}`);
    }
  }
});

test('every seeing clause carries the caster suffix and no nominal subject', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const list = egyptianWords('divination', difficulty, seed);
      const suffixed = list.filter((w) => w.suffix !== '');
      assert.strictEqual(
        suffixed.length,
        divinationClauses(difficulty) - 1,
        `seeing clause count in ${where}`,
      );
      for (const verb of suffixed) {
        assert.ok(verb.glyphs.endsWith(A1_MAN), `suffix is not the seated man in ${where}`);
      }
    }
  }
});

test('divination openers, closers and seals follow its own tier table', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const line = words('divination', difficulty, seed);
      if (difficulty <= 7) {
        assert.deepStrictEqual(line.slice(0, 4), [...EO4_SPOKEN], `opener in ${where}`);
      } else {
        // The title line takes over at the top, and titles the spell by what
        // it reads: a signs noun, written with the scribe's kit.
        assert.deepStrictEqual(line.slice(0, 2), [...EO1_SPOKEN], `opener in ${where}`);
        const list = egyptianWords('divination', difficulty, seed);
        assert.strictEqual(list[4]?.field, 'signs', `title noun in ${where}`);
      }
      if (difficulty <= 4) {
        // Read on the last word, not on membership: maa opens the dream and
        // also closes EC2, and the lexicon holds a sight adjective spoken
        // alike. Where a closer would be is the only place that settles it.
        assert.ok(
          !['pu', 'kheru', 'seneb'].includes(line[line.length - 1] ?? ''),
          `closer at d${difficulty}`,
        );
        continue;
      }
      // The lexicon holds a time root spoken sep, so the seal word is only
      // the last one, and only from the tier where a seal exists.
      const seal = difficulty >= 7 ? line.lastIndexOf('sep') : -1;
      const end = seal > 0 ? seal : line.length;
      const closers = difficulty >= 9 ? [...EC4_SPOKEN, ...EC2_SPOKEN] : [...EC4_SPOKEN];
      assert.deepStrictEqual(line.slice(end - closers.length, end), closers, `closer in ${where}`);
      if (difficulty === 7) {
        // The oracle received its question on two tickets.
        assert.deepStrictEqual(line.slice(seal + 1), ['senu'], `tier 7 seal in ${where}`);
      }
    }
  }
});

test('the oracle litany reads three different heads, each over a fate or a time noun', () => {
  for (const difficulty of [8, 9]) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const list = egyptianWords('divination', difficulty, seed);
      const heads: string[] = [];
      list.forEach((word, index) => {
        if (word.spoken !== 'i' || index === 0) return;
        const head = list[index + 1];
        if (head?.field !== 'signs' && head?.field !== 'sight') return;
        heads.push(head.spoken);
        assert.strictEqual(list[index + 2]?.spoken, 'en', `genitive in ${where}`);
        const tail = list[index + 3]?.field;
        assert.ok(tail === 'fate' || tail === 'time', `oracle tail field in ${where}`);
      });
      assert.strictEqual(heads.length, 3, `litany size in ${where}`);
      assert.strictEqual(new Set(heads).size, 3, `repeated oracle head in ${where}`);
    }
  }
});

// --- Chronomancy (spec 3.12) ------------------------------------------------

const CHRONOMANCY_TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

test('the crossing clause is verb initial with its direction straight behind', () => {
  const directions = new Set(Object.values(DIRECTION_SPOKEN));
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const list = egyptianWords('chronomancy', difficulty, seed);
      const line = list.map((w) => w.spoken);
      const at = line.findIndex((word) => directions.has(word));
      assert.ok(at > 0, `no direction word in ${where}`);
      assert.strictEqual(
        line.filter((word) => directions.has(word)).length,
        1,
        `one direction per formula in ${where}`,
      );
      // The verb stands in front of it, bare: no suffix rides a command.
      const verb = list[at - 1];
      assert.strictEqual(verb?.role, 'content', `no verb before the direction in ${where}`);
      assert.strictEqual(verb?.suffix, '', `crossing verb takes a suffix in ${where}`);
      // A direction word is a function word and carries no determinative.
      assert.strictEqual(list[at]?.determinatives, '', `direction with a determinative`);
      // The school names no god, so no agent marker and no power word. Read
      // on the sign groups, never on the spoken line: rA the opener and ra
      // the god are spoken alike, and only the god carries the flag.
      assert.ok(!line.includes('in'), `in-agent phrase in ${where}`);
      const names = new Set([...POWER_TABLE.map(([, glyphs]) => glyphs), IMEN_ROW[1]]);
      for (const word of list) {
        assert.ok(!names.has(word.glyphs), `a divine name in ${where}`);
      }
    }
  }
});

test('every binding clause writes the sedjem-en-ef and no other clause does', () => {
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const list = egyptianWords('chronomancy', difficulty, seed);
      const performative = list.filter((w) => w.suffix === SEDJEM_EN_EF_SUFFIX);
      const clauses = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
      assert.strictEqual(performative.length, clauses - 1, `binding clause count in ${where}`);
      for (const verb of performative) {
        // The water ripple stands between the determinative and the suffix,
        // which is the one sign that keeps this form apart from a seeing
        // clause on the page.
        assert.ok(
          verb.glyphs.endsWith(verb.determinatives + SEDJEM_EN_EF_SUFFIX),
          `the ripple is misplaced in ${where}`,
        );
        assert.match(verb.spoken, /eni$|ni$/u, `spoken sedjem-en-ef in ${where}`);
      }
      // Every suffix of this school is that one: no =i, no =f, no =sn.
      for (const word of list) {
        if (word.suffix === '') continue;
        assert.strictEqual(word.suffix, SEDJEM_EN_EF_SUFFIX, `another suffix in ${where}`);
      }
    }
  }
  for (const school of ALL_SCHOOLS) {
    if (school === 'chronomancy') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        for (const word of egyptianWords(school, difficulty, seed)) {
          assert.notStrictEqual(
            word.suffix,
            SEDJEM_EN_EF_SUFFIX,
            `sedjem-en-ef in ${label(school, difficulty, seed)}`,
          );
        }
      }
    }
  }
});

test('an address in a chronomantic formula names an hour-gate, never a god', () => {
  for (const difficulty of [6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const list = egyptianWords('chronomancy', difficulty, seed);
      const line = list.map((w) => w.spoken);
      const gates = difficulty >= 9 ? 4 : difficulty >= 8 ? 3 : 1;
      assert.strictEqual(line.filter((w) => w === 'rekhi').length, gates, `litany size in ${where}`);
      const heads: string[] = [];
      line.forEach((word, index) => {
        if (word !== 'i') return;
        const head = list[index + 1];
        if (head?.field !== 'gates') return;
        heads.push(head.spoken);
        assert.strictEqual(list[index + 2]?.spoken, 'en', `genitive in ${where}`);
        // The tail is drawn from time, which is the Book of Gates rather than
        // the Book of the Dead (spec 3.12).
        assert.strictEqual(list[index + 3]?.field, 'time', `hour-gate tail in ${where}`);
      });
      assert.strictEqual(heads.length, gates, `hour-gate count in ${where}`);
      assert.strictEqual(new Set(heads).size, gates, `repeated hour-gate head in ${where}`);
    }
  }
});

test('chronomantic openers, closers and seals follow its own tier table', () => {
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const line = words('chronomancy', difficulty, seed);
      const list = egyptianWords('chronomancy', difficulty, seed);
      if (difficulty <= 4) {
        // The title line names the stretch of time the spell works on.
        assert.deepStrictEqual(line.slice(0, 2), [...EO2_HEAD_SPOKEN], `opener in ${where}`);
        assert.strictEqual(list[2]?.field, 'time', `title noun in ${where}`);
      } else if (difficulty <= 7) {
        assert.deepStrictEqual(line.slice(0, 2), [...EO1_SPOKEN], `opener in ${where}`);
      } else {
        assert.deepStrictEqual(
          line.slice(0, 4),
          [...EO1_SPOKEN, ...EO2_HEAD_SPOKEN],
          `opener in ${where}`,
        );
        assert.strictEqual(list[4]?.field, 'time', `title noun in ${where}`);
      }
      if (difficulty <= 4) {
        assert.ok(!line.includes('peret'), `anchor at d${difficulty}`);
        continue;
      }
      const seal = difficulty >= 7 ? line.lastIndexOf('sep') : -1;
      const end = seal > 0 ? seal : line.length;
      // The anchor closes the formula, with the health formula behind it at
      // tier 9 and nothing else ever.
      const stacked = difficulty >= 9 ? EC1_SPOKEN.length : 0;
      assert.deepStrictEqual(
        line.slice(end - stacked, end),
        difficulty >= 9 ? [...EC1_SPOKEN] : [],
        `closer in ${where}`,
      );
      assert.ok(line.includes('peret'), `no anchor in ${where}`);
      assert.ok(!line.includes('kheru'), `justification in ${where}`);
      if (difficulty >= 7 && difficulty <= 8) {
        assert.deepStrictEqual(line.slice(seal + 1), ['medj', 'senu'], `seal in ${where}`);
      }
    }
  }
});
