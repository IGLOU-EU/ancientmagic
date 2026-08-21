import test from 'node:test';
import * as assert from 'node:assert/strict';
import { FIELDS } from '../src/ts/languages/phoenician-data.js';
import { transitiveVerbsOf } from '../src/ts/languages/phoenician.js';
import {
  ALL_NAME_SPOKEN,
  BRIGHT_SPOKEN,
  DARK_SPOKEN,
  INTRANSITIVE,
  NUMERALS,
  PC1_SPOKEN,
  PC2_SPOKEN,
  PC3_SPOKEN,
  PO1_HEAD_SPOKEN,
  PO2_HEAD_SPOKEN,
  PO3_HEAD_SPOKEN,
  PROCLITIC_W,
  SEAL_HEAD_SPOKEN,
  YT_SPOKEN,
} from './phoenician-spec.js';
import {
  ALL_SCHOOLS,
  BRIGHT_SCHOOLS,
  DIFFICULTIES,
  SEEDS,
  phoenician,
  phoenicianWords,
} from './gen.js';

const label = (school: string, difficulty: number, seed: number): string =>
  `${school} d${difficulty} seed ${seed}`;

const line = (school: string, difficulty: number, seed: number): string[] =>
  phoenician(school as never, difficulty, seed).transliteration.split(' ');

// Spec 4.9: the closing formula assigned to each school by 4.6.
const CLOSER: Readonly<Record<string, ReadonlyArray<string>>> = {
  protection: PC1_SPOKEN,
  curse: PC2_SPOKEN,
  invocation: PC1_SPOKEN,
};

test('difficulty 1: a single divine name, bright or dark per school', () => {
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      const words = line(school, 1, seed);
      assert.strictEqual(words.length, 1, label(school, 1, seed));
      const pool = school === 'curse' ? DARK_SPOKEN : BRIGHT_SPOKEN;
      assert.ok(pool.includes(words[0] ?? ''), `off pool: ${words[0]} in ${label(school, 1, seed)}`);
    }
  }
});

test('difficulty 2: a transitive imperative then its target, two words continuous', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const where = label(school, 2, seed);
      const words = phoenicianWords(school, 2, seed);
      assert.strictEqual(words.length, 2, where);
      assert.ok(words.every((w) => w.kind === 'content'), `non content word in ${where}`);
    }
  }
});

test('an intransitive root never reaches a slot that takes a direct object', () => {
  // Spec 4.3 and 4.9: the flagged roots stay out of every transitive draw.
  for (const field of ['night', 'death'] as const) {
    const pool = transitiveVerbsOf(field).map((r) => r.root);
    for (const flagged of INTRANSITIVE) {
      assert.ok(!pool.includes(flagged), `${flagged} reached the transitive pool of ${field}`);
    }
  }
  // The filter removes the flagged roots and keeps the others.
  const deathVerbs = FIELDS.death.filter((r) => r.verb !== undefined).map((r) => r.root);
  const deathTransitive = transitiveVerbsOf('death').map((r) => r.root);
  assert.ok(deathVerbs.length > deathTransitive.length, 'the filter removed nothing');
  assert.ok(deathTransitive.includes('krt'), 'a transitive death verb was dropped');
});

test('school openers follow the tier table', () => {
  for (const seed of SEEDS) {
    for (const difficulty of [3, 4, 5]) {
      for (const school of ['protection', 'curse'] as const) {
        assert.strictEqual(
          line(school, difficulty, seed)[0],
          PO1_HEAD_SPOKEN,
          label(school, difficulty, seed),
        );
      }
      assert.strictEqual(
        line('invocation', difficulty, seed)[0],
        PO3_HEAD_SPOKEN,
        label('invocation', difficulty, seed),
      );
    }
    // From tier 6 the self presentation line precedes the school opener.
    for (const difficulty of [6, 7, 8, 9]) {
      for (const school of ALL_SCHOOLS) {
        const words = line(school, difficulty, seed);
        assert.strictEqual(words[0], PO2_HEAD_SPOKEN, label(school, difficulty, seed));
        const head = school === 'invocation' ? PO3_HEAD_SPOKEN : PO1_HEAD_SPOKEN;
        assert.strictEqual(words[2], head, `school opener in ${label(school, difficulty, seed)}`);
      }
    }
  }
});

test('closers follow the exhaustive progression of the tier table', () => {
  for (const school of BRIGHT_SCHOOLS) {
    const closer = CLOSER[school] ?? [];
    for (const seed of SEEDS) {
      for (const difficulty of [3, 4]) {
        const words = line(school, difficulty, seed);
        for (const part of [...PC1_SPOKEN, ...PC2_SPOKEN, ...PC3_SPOKEN]) {
          assert.ok(!words.includes(part), `closer at ${label(school, difficulty, seed)}`);
        }
      }
      for (const difficulty of [5, 6]) {
        assert.deepStrictEqual(
          line(school, difficulty, seed).slice(-closer.length),
          [...closer],
          label(school, difficulty, seed),
        );
      }
      for (const difficulty of [7, 8]) {
        // The seal closes the formula, the closer sits just before it.
        const words = line(school, difficulty, seed);
        const at = words.lastIndexOf(SEAL_HEAD_SPOKEN);
        assert.ok(at > 0, `no seal in ${label(school, difficulty, seed)}`);
        assert.deepStrictEqual(
          words.slice(at - closer.length, at),
          [...closer],
          label(school, difficulty, seed),
        );
      }
      const nine = line(school, 9, seed);
      const at = nine.lastIndexOf(SEAL_HEAD_SPOKEN);
      assert.deepStrictEqual(
        nine.slice(at - closer.length - PC3_SPOKEN.length, at),
        [...closer, ...PC3_SPOKEN],
        label(school, 9, seed),
      );
    }
  }
});

test('the seal word heads its numeral and closes the formula', () => {
  const allowed: Record<number, number[]> = { 7: [3, 7], 8: [7, 9], 9: [9, 12] };
  for (const school of BRIGHT_SCHOOLS) {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2, 3, 4, 5, 6]) {
        const words = line(school, difficulty, seed);
        assert.ok(
          !words.includes(SEAL_HEAD_SPOKEN),
          `unexpected seal in ${label(school, difficulty, seed)}`,
        );
      }
      for (const difficulty of [7, 8, 9]) {
        const where = label(school, difficulty, seed);
        const out = phoenician(school, difficulty, seed);
        const words = out.transliteration.split(' ');
        const at = words.lastIndexOf(SEAL_HEAD_SPOKEN);
        assert.ok(at >= 0, `no seal word in ${where}`);
        const numeral = words.slice(at + 1).join(' ');
        const count = (allowed[difficulty] ?? []).find((c) => NUMERALS[c]?.[1] === numeral);
        assert.ok(count !== undefined, `seal count out of tier in ${where}: ${numeral}`);
        assert.ok(
          out.glyphs.endsWith(NUMERALS[count ?? 0]?.[0] ?? ''),
          `seal is not the final glyph group in ${where}`,
        );
        assert.ok(out.gloss.includes('times over'), `seal missing from the gloss in ${where}`);
      }
    }
  }
});

test('protection and curse clauses run verb, divine subject, object', () => {
  for (const school of ['protection', 'curse'] as const) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        const spoken = words.map((w) => w.spoken);
        const pool = school === 'curse' ? DARK_SPOKEN : BRIGHT_SPOKEN;
        // Every jussive verb is followed directly by the divine name subject.
        const verbs = words.filter((w) => w.role === 'intent');
        const clauses = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
        assert.strictEqual(verbs.length, clauses, `clause count in ${where}`);
        words.forEach((word, index) => {
          if (word.role !== 'intent') return;
          const next = spoken[index + 1] ?? '';
          assert.ok(pool.includes(next), `no divine subject after the verb in ${where}: ${next}`);
          assert.strictEqual(words[index + 1]?.role, 'agent', `subject role in ${where}`);
        });
      }
    }
  }
});

test('the object marker enters at tier 6, when a clause keeps its own target', () => {
  // Spec 4.5: the PO1 opener consumes the first clause target, so the marker
  // only surfaces once a second clause carries one of its own.
  for (const school of ['protection', 'curse'] as const) {
    for (const seed of SEEDS) {
      for (const difficulty of [3, 4, 5]) {
        assert.ok(
          !line(school, difficulty, seed).includes(YT_SPOKEN),
          `early object marker in ${label(school, difficulty, seed)}`,
        );
      }
      for (const difficulty of [6, 7, 8, 9]) {
        const where = label(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        const spoken = words.map((w) => w.spoken);
        const clauses = difficulty <= 7 ? 2 : 3;
        assert.strictEqual(
          spoken.filter((w) => w === YT_SPOKEN).length,
          clauses - 1,
          `object marker count in ${where}`,
        );
        spoken.forEach((word, index) => {
          if (word !== YT_SPOKEN) return;
          const object = words[index + 1];
          assert.strictEqual(object?.role, 'target', `no target after the marker in ${where}`);
          // From tier 5 the article is used consistently on the object.
          assert.ok(object.spoken.startsWith('ha'), `object without the article in ${where}`);
        });
      }
    }
  }
  // The invocation skeleton carries no direct object at any tier.
  for (const school of ['invocation', 'eldritch'] as const) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        assert.ok(
          !line(school, difficulty, seed).includes(YT_SPOKEN),
          `object marker in ${label(school, difficulty, seed)}`,
        );
      }
    }
  }
});

test('invocation stacks the agent chain, then the imperative, then the power word', () => {
  for (const school of ['invocation', 'eldritch'] as const) {
    for (const difficulty of [3, 4, 5, 6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        const clauses = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
        const chain = difficulty >= 9 ? 3 : difficulty >= 8 ? 2 : 1;
        const intents = words.filter((w) => w.role === 'intent');
        assert.strictEqual(intents.length, clauses, `clause count in ${where}`);
        words.forEach((word, index) => {
          if (word.role !== 'intent') return;
          let nouns = 0;
          for (let at = index - 1; at >= 0; at -= 1) {
            if (words[at]?.role !== 'agent') break;
            nouns += 1;
          }
          assert.strictEqual(nouns, chain, `agent chain length in ${where}`);
          assert.strictEqual(words[index + 1]?.role, 'power', `no power word in ${where}`);
        });
      }
    }
  }
});

test('the agent construct chain grows with the tier in every school', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [3, 5, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        const chain = difficulty >= 9 ? 3 : difficulty >= 8 ? 2 : 1;
        const clauses = difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;
        assert.strictEqual(
          words.filter((w) => w.role === 'agent').length,
          chain * clauses,
          `agent noun count in ${where}`,
        );
      }
    }
  }
});

test('clauses after the first are joined by the w proclitic', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        const joined = words.filter((w) => w.joined === true);
        const clauses = difficulty <= 7 ? 2 : 3;
        assert.strictEqual(joined.length, clauses - 1, `join count in ${where}`);
        for (const word of joined) {
          assert.ok(word.spoken.startsWith(PROCLITIC_W.spoken), `join without w in ${where}`);
        }
      }
    }
  }
});

test('the power word litany triples at tier 8 and shrinks at tier 9', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const eight = phoenicianWords(school, 8, seed).filter((w) => w.role === 'litany');
      assert.strictEqual(eight.length, 3, label(school, 8, seed));
      assert.strictEqual(new Set(eight.map((w) => w.spoken)).size, 1, 'the triple is one word');

      const nine = phoenicianWords(school, 9, seed).filter((w) => w.role === 'litany');
      assert.ok(nine.length >= 3, `too few shrink steps in ${label(school, 9, seed)}`);
      // Each step loses its final letter, down to a single glyph.
      for (let i = 1; i < nine.length; i += 1) {
        const before = Array.from(nine[i - 1]?.glyphs ?? '');
        const after = Array.from(nine[i]?.glyphs ?? '');
        assert.strictEqual(after.length, before.length - 1, `shrink step ${i}`);
        assert.deepStrictEqual(after, before.slice(0, -1), `shrink prefix ${i}`);
      }
      assert.strictEqual(Array.from(nine[nine.length - 1]?.glyphs ?? '').length, 1, 'shrink end');
    }
  }
});

test('the modifier is absent below tier 4 and mandatory at tier 4', () => {
  for (const school of ALL_SCHOOLS) {
    for (const seed of SEEDS) {
      const isModifier = (role: string): boolean => role === 'modifier' || role === 'adverb';
      const three = phoenicianWords(school, 3, seed);
      const four = phoenicianWords(school, 4, seed);
      assert.strictEqual(
        three.filter((w) => isModifier(w.role)).length,
        0,
        `modifier at tier 3 in ${label(school, 3, seed)}`,
      );
      assert.ok(
        four.filter((w) => isModifier(w.role)).length > 0,
        `no modifier at tier 4 in ${label(school, 4, seed)}`,
      );
    }
  }
});

test('an attributive adjective agrees with its noun and repeats the article', () => {
  for (const school of ['protection', 'curse'] as const) {
    for (const difficulty of [4, 5, 6, 7, 8, 9]) {
      for (const seed of SEEDS) {
        const where = label(school, difficulty, seed);
        const words = phoenicianWords(school, difficulty, seed);
        let seen = 0;
        words.forEach((word, index) => {
          if (word.role !== 'modifier') return;
          const head = words[index - 1];
          assert.strictEqual(head?.role, 'target', `adjective without a head noun in ${where}`);
          if (head === undefined) return;
          seen += 1;
          assert.strictEqual(
            head.spoken.startsWith('ha'),
            word.spoken.startsWith('ha'),
            `article agreement in ${where}`,
          );
          assert.strictEqual(
            head.spoken.endsWith('im'),
            word.spoken.endsWith('im'),
            `number agreement in ${where}`,
          );
        });
      }
    }
  }
});

test('the draw pools never run dry across a wide seed sweep', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of [8, 9]) {
      for (let seed = 0; seed < 400; seed += 1) {
        const out = phoenician(school, difficulty, seed);
        assert.ok(out.glyphs.length > 0, `empty draw for ${label(school, difficulty, seed)}`);
      }
    }
  }
});

test('gloss is plain english and reflects the school', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const out = phoenician(school, difficulty, seed);
        const where = label(school, difficulty, seed);
        assert.match(out.gloss, /^[A-Za-z][A-Za-z ,.!-]*[.!]$/, `gloss shape in ${where}`);
        if (difficulty < 3) continue;
        if (school === 'protection' || school === 'curse') {
          assert.ok(out.gloss.includes('Incantation'), `no opener in the gloss of ${where}`);
          assert.ok(out.gloss.includes('May '), `no jussive in the gloss of ${where}`);
        }
        if (school === 'invocation' || school === 'eldritch') {
          assert.ok(out.gloss.includes('O '), `no vocative in the gloss of ${where}`);
        }
      }
    }
  }
});

test('divine names never carry the article', () => {
  for (const school of ALL_SCHOOLS) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        for (const word of phoenicianWords(school, difficulty, seed)) {
          if (word.kind !== 'power') continue;
          const bare = word.spoken.replace(/^(?:we|le|be)/, '');
          assert.ok(
            ALL_NAME_SPOKEN.includes(bare),
            `divine name off its listed form: ${word.spoken}`,
          );
        }
      }
    }
  }
});
