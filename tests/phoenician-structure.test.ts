import test from 'node:test';
import * as assert from 'node:assert/strict';
import { FIELDS } from '../src/ts/languages/phoenician-data.js';
import { citation, speak, transitiveVerbsOf } from '../src/ts/languages/phoenician.js';
import {
  ALL_NAME_SPOKEN,
  ARTICLE,
  BRIGHT_SPOKEN,
  DIRECTION_SPOKEN,
  DARK_SPOKEN,
  DIVINATION_SPOKEN,
  INTERROGATIVE,
  INTRANSITIVE,
  NUMERALS,
  PC1_SPOKEN,
  PC2_SPOKEN,
  PC3_SPOKEN,
  PC4_SPOKEN,
  PC5_HEAD_SPOKEN,
  PO1_HEAD_SPOKEN,
  PO2_HEAD_SPOKEN,
  PO3_HEAD_SPOKEN,
  PO4_HEAD_SPOKEN,
  PO5_HEAD_SPOKEN,
  PROCLITIC_L,
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
  const deathVerbs = FIELDS.death.filter((r) => r.forms.includes('verb')).map((r) => r.root);
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
        const head =
          school === 'invocation'
            ? PO3_HEAD_SPOKEN
            : school === 'divination'
              ? PO4_HEAD_SPOKEN
              : school === 'chronomancy'
                ? PO5_HEAD_SPOKEN
                : PO1_HEAD_SPOKEN;
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
        // Divination writes its power out in the asking clause alone, and
        // only from tier 8, where the construct chain has to hang on it
        // (spec 4.11). Below that the verb prefix carries the subject.
        // Chronomancy builds no chain at all, having no AGENT and naming no
        // god (spec 4.9): what grows at its top tiers is the anchor.
        const expected =
          school === 'chronomancy'
            ? 0
            : school === 'divination'
              ? difficulty >= 8
                ? chain
                : 0
              : chain * clauses;
        assert.strictEqual(
          words.filter((w) => w.role === 'agent').length,
          expected,
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
        // The question mark joins the shape with Divination, whose asking
        // clause is the only place any script here can put one.
        assert.match(out.gloss, /^[A-Za-z][A-Za-z ,.!?-]*[.!?]$/, `gloss shape in ${where}`);
        if (difficulty < 3) continue;
        if (school === 'protection' || school === 'curse') {
          assert.ok(out.gloss.includes('Incantation'), `no opener in the gloss of ${where}`);
          assert.ok(out.gloss.includes('May '), `no jussive in the gloss of ${where}`);
        }
        if (school === 'invocation' || school === 'eldritch') {
          assert.ok(out.gloss.includes('O '), `no vocative in the gloss of ${where}`);
        }
        if (school === 'divination') {
          assert.ok(out.gloss.includes('A question to'), `no opener in the gloss of ${where}`);
          assert.ok(out.gloss.includes('?'), `no question in the gloss of ${where}`);
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

// --- Divination (spec 4.11) -------------------------------------------------

const DIVINATION_TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

const divinationClauses = (difficulty: number): number =>
  difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;

test('the interrogative rides the verb of the asking clause and nothing else', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const words = phoenicianWords('divination', difficulty, seed);
      const asked = words.filter((w) => (w.vocalized ?? '').startsWith(INTERROGATIVE.spoken));
      assert.strictEqual(asked.length, 1, `one question per formula in ${where}`);
      const verb = asked[0];
      assert.strictEqual(verb?.role, 'intent', `the interrogative left the verb in ${where}`);
      // It is spoken hi and never ha, so the transliteration always separates
      // it from an article even though the glyph line never does.
      assert.ok(verb?.spoken.startsWith(INTERROGATIVE.spoken), `spoken hi in ${where}`);
      assert.ok(!verb?.spoken.startsWith(ARTICLE.spoken), `spoken ha in ${where}`);
      assert.strictEqual(
        Array.from(verb?.glyphs ?? '')[0],
        INTERROGATIVE.glyph,
        `the question is not written with he in ${where}`,
      );
      // A prefix verb, whose own prefix resumes the power the opener named.
      const stem = (verb?.vocalized ?? '').slice(INTERROGATIVE.spoken.length);
      assert.match(stem, /^(?:ya|ta)/u, `no prefix verb under the question in ${where}`);
    }
  }
});

test('every seeing clause opens on the imperfect 1sg, the form no other school draws', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const words = phoenicianWords('divination', difficulty, seed);
      const intents = words.filter((w) => w.role === 'intent');
      assert.strictEqual(intents.length, divinationClauses(difficulty), `clause count in ${where}`);
      const seeing = intents.slice(1);
      for (const verb of seeing) {
        // The clause joiner rides in front of the prefix from tier 6 up.
        assert.match(
          verb.vocalized ?? '',
          new RegExp(`^(?:${PROCLITIC_W.spoken})?'a`, 'u'),
          `seeing verb is not the imperfect 1sg in ${where}`,
        );
      }
    }
  }
  // The form belongs to this school alone.
  for (const school of ALL_SCHOOLS) {
    if (school === 'divination') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        for (const word of phoenicianWords(school, difficulty, seed)) {
          if (word.role !== 'intent') continue;
          assert.ok(
            !/^(?:we)?'a/u.test(word.vocalized ?? ''),
            `imperfect 1sg in ${label(school, difficulty, seed)}`,
          );
        }
      }
    }
  }
});

test('the divination object is marked from tier 4 and takes the article from tier 5', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const words = phoenicianWords('divination', difficulty, seed);
      const spoken = words.map((w) => w.spoken);
      const markers = spoken.filter((w) => w === YT_SPOKEN).length;
      // The opener consumes the AGENT, so the object survives in every clause
      // from tier 4 up, without the delay the PO1 schools carry.
      assert.strictEqual(
        markers,
        difficulty >= 4 ? divinationClauses(difficulty) : 0,
        `object marker count in ${where}`,
      );
      spoken.forEach((word, index) => {
        if (word !== YT_SPOKEN) return;
        const object = words[index + 1];
        assert.strictEqual(object?.role, 'target', `no target after the marker in ${where}`);
        assert.strictEqual(
          object.spoken.startsWith(ARTICLE.spoken),
          difficulty >= 5,
          `article on the object in ${where}`,
        );
      });
    }
  }
});

test('divination openers and closers follow its own tier table', () => {
  for (const difficulty of DIVINATION_TIERS) {
    for (const seed of SEEDS) {
      const where = label('divination', difficulty, seed);
      const words = line('divination', difficulty, seed);
      const opener = difficulty >= 6 ? 2 : 0;
      assert.strictEqual(words[opener], PO4_HEAD_SPOKEN, `opener in ${where}`);
      // PO4 names the power the formula questions, with the l- of dedication.
      assert.ok(
        DIVINATION_SPOKEN.some((name) => words[opener + 1] === `${PROCLITIC_L.spoken}${name}`),
        `no questioned power after the opener in ${where}`,
      );
      if (difficulty <= 4) {
        for (const part of [...PC1_SPOKEN, ...PC2_SPOKEN, ...PC3_SPOKEN, ...PC4_SPOKEN]) {
          assert.ok(!words.includes(part), `closer at d${difficulty}`);
        }
        continue;
      }
      const seal = words.lastIndexOf(SEAL_HEAD_SPOKEN);
      const end = seal > 0 ? seal : words.length;
      const closers = difficulty >= 9 ? [...PC4_SPOKEN, ...PC3_SPOKEN] : [...PC4_SPOKEN];
      assert.deepStrictEqual(words.slice(end - closers.length, end), closers, `closer in ${where}`);
      // The blessing belongs to the schools that ask for one.
      assert.ok(!words.includes('yebarek'), `blessing in ${where}`);
    }
  }
});

test('the caster of a divination presents himself as a seer', () => {
  const seerNames = new Set(
    FIELDS.sight
      .filter((r) => r.forms.includes('noun'))
      .map((r) => `${speak(citation(r.root)).replace(/^gh/u, '')}baal`),
  );
  for (const difficulty of [6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const words = line('divination', difficulty, seed);
      assert.strictEqual(words[0], PO2_HEAD_SPOKEN, label('divination', difficulty, seed));
      assert.ok(
        seerNames.has(words[1] ?? ''),
        `the caster name is not built on a sight root in ${label('divination', difficulty, seed)}`,
      );
    }
  }
});

// --- Chronomancy (spec 4.12) ------------------------------------------------

const CHRONOMANCY_TIERS: ReadonlyArray<number> = [3, 4, 5, 6, 7, 8, 9];

const chronomancyClauses = (difficulty: number): number =>
  difficulty <= 5 ? 1 : difficulty <= 7 ? 2 : 3;

test('the crossing clause opens on the imperative and its direction word', () => {
  const directions = new Set(Object.values(DIRECTION_SPOKEN));
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = phoenicianWords('chronomancy', difficulty, seed);
      const at = words.findIndex((w) => w.role === 'direction');
      assert.ok(at > 0, `no direction word in ${where}`);
      assert.strictEqual(
        words.filter((w) => w.role === 'direction').length,
        1,
        `one direction per formula in ${where}`,
      );
      assert.ok(directions.has(words[at]?.spoken ?? ''), `direction off the closed set in ${where}`);
      const verb = words[at - 1];
      assert.strictEqual(verb?.role, 'intent', `no verb before the direction in ${where}`);
      // The imperative is C1eC2oC3, so it neither prefixes nor takes the tau.
      assert.doesNotMatch(verb?.vocalized ?? '', /^(?:we)?['yt]a/u, `not an imperative in ${where}`);
      assert.doesNotMatch(verb?.vocalized ?? '', /ti$/u, `a perfect 1sg in ${where}`);
    }
  }
});

test('every binding clause writes the perfect 1sg, which no other school draws', () => {
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = phoenicianWords('chronomancy', difficulty, seed);
      const intents = words.filter((w) => w.role === 'intent');
      assert.strictEqual(intents.length, chronomancyClauses(difficulty), `clause count in ${where}`);
      for (const verb of intents.slice(1)) {
        // One letter more on the written root, the tau of the suffix, which
        // keeps this form apart from the perfect 3ms on the page as well as
        // in the transliteration (spec 4.4).
        assert.match(verb.vocalized ?? '', /ti$/u, `binding verb without the tau in ${where}`);
        assert.match(verb.spoken, /ti$/u, `binding verb spoken without the tau in ${where}`);
        assert.ok(
          Array.from(verb.glyphs).at(-1) === '\u{10915}',
          `the written root does not end in tau in ${where}`,
        );
        // The clause joiner rides in front of it from tier 6 up.
        assert.match(verb.vocalized ?? '', /^(?:we)?[a-z']/u, `binding prefix in ${where}`);
      }
    }
  }
  for (const school of ALL_SCHOOLS) {
    if (school === 'chronomancy') continue;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        for (const word of phoenicianWords(school, difficulty, seed)) {
          if (word.role !== 'intent') continue;
          assert.doesNotMatch(
            word.vocalized ?? '',
            /ti$/u,
            `perfect 1sg in ${label(school, difficulty, seed)}`,
          );
        }
      }
    }
  }
});

test('chronomantic openers and closers follow its own tier table', () => {
  for (const difficulty of CHRONOMANCY_TIERS) {
    for (const seed of SEEDS) {
      const where = label('chronomancy', difficulty, seed);
      const words = line('chronomancy', difficulty, seed);
      const list = phoenicianWords('chronomancy', difficulty, seed);
      const opener = difficulty >= 6 ? 2 : 0;
      assert.strictEqual(words[opener], PO5_HEAD_SPOKEN, `opener in ${where}`);
      // The year the formula stamps itself with is a time noun.
      const year = list[opener + 1]?.root ?? '';
      assert.ok(
        FIELDS.time.some((r) => r.root === year),
        `the year is not a time noun in ${where}`,
      );
      if (difficulty <= 4) {
        assert.ok(!words.includes(PC5_HEAD_SPOKEN), `anchor at d${difficulty}`);
        continue;
      }
      assert.ok(words.includes(PC5_HEAD_SPOKEN), `no anchor in ${where}`);
      // The votive blessing belongs to the schools that ask for one.
      for (const part of [...PC1_SPOKEN, ...PC2_SPOKEN, ...PC4_SPOKEN]) {
        if (part === 'ki') continue;
        assert.ok(!words.includes(part), `another closer in ${where}`);
      }
      const seal = words.lastIndexOf(SEAL_HEAD_SPOKEN);
      const end = seal > 0 ? seal : words.length;
      if (difficulty >= 9) {
        assert.deepStrictEqual(
          words.slice(end - PC3_SPOKEN.length, end),
          [...PC3_SPOKEN],
          `forever in ${where}`,
        );
      }
      if (difficulty >= 7 && difficulty <= 8) {
        assert.deepStrictEqual(words.slice(seal + 1), ['shenem', 'asar'], `seal in ${where}`);
      }
    }
  }
});

test('the caster of a chronomancy presents himself as one who crosses', () => {
  const crosserNames = new Set(
    FIELDS.course
      .filter((r) => r.forms.includes('noun'))
      .map((r) => `${speak(citation(r.root)).replace(/^gh/u, '')}baal`),
  );
  for (const difficulty of [6, 7, 8, 9]) {
    for (const seed of SEEDS) {
      const words = line('chronomancy', difficulty, seed);
      assert.strictEqual(words[0], PO2_HEAD_SPOKEN, label('chronomancy', difficulty, seed));
      assert.ok(
        crosserNames.has(words[1] ?? ''),
        `the caster name is not built on a course root in ${label('chronomancy', difficulty, seed)}`,
      );
    }
  }
});
