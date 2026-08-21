import test from 'node:test';
import * as assert from 'node:assert/strict';
import { egyptian, phoenician, runic } from './gen.js';

// A seed whose difficulty 5 Protection draws reproduce the shared plan of
// genomes.md section 5 exactly: opener RO1, agent ward, intent bind, target
// thurs, no modifier, closing RC1. Found by search, then pinned. The same
// seed must keep producing this rendering forever. Re-pinned after the
// arbitrated lexicon widened the draw pools.
const SECTION5_SEED = 66238;

test('section 5 fixture: the corrected site sample, byte for byte', () => {
  const out = runic('protection', 5, SECTION5_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{16A8}\u{16DA}\u{16A2}\u{16EB}\u{16B9}\u{16A8}\u{16B1}\u{16DE}\u{16A8}\u{16C9}\u{16EB}\u{16B9}\u{16C1}\u{16A6}\u{16B1}\u{16A8}\u{16EB}\u{16A6}\u{16A2}\u{16B1}\u{16CA}\u{16A8}\u{16BE}\u{16EB}\u{16D2}\u{16C1}\u{16BE}\u{16DE}\u{16DF}\u{16EC}\u{16B1}\u{16A2}\u{16BE}\u{16DF}\u{16C9}\u{16EB}\u{16A0}\u{16A8}\u{16C1}\u{16BA}\u{16C1}\u{16DE}\u{16DF}',
  );
  assert.strictEqual(
    out.transliteration,
    'alu wardaz withra thursan bindo runoz faihido',
  );
  assert.strictEqual(
    out.gloss,
    'Alu! I, the warder, bind against the hostile wight. I painted these runes.',
  );
});

// The same search, run on the Egyptian genome: a seed whose difficulty 5
// Protection draws reproduce the section 5 rendering exactly. Opener EO1,
// intent qAs with the first person suffix, target HfAw behind r, the god ra as
// in-agent, HkA as the free power word, no modifier, closer EC2.
const SECTION5_EGYPTIAN_SEED = 7595;

test('section 5 fixture: the egyptian rendering, sign for sign', () => {
  const out = egyptian('protection', 5, SECTION5_EGYPTIAN_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{13193}\u{130A7}\u{13303}\u{1320E}\u{1313F}\u{132F4}\u{132BD}\u{13000}\u{1308B}\u{1339B}\u{13191}\u{1313F}\u{13171}\u{13010}\u{131CB}\u{13216}\u{1308B}\u{1309D}\u{131F3}\u{1339B}\u{133A1}\u{1313F}\u{132B9}\u{13419}\u{132A4}',
  );
  assert.strictEqual(out.transliteration, 'djed medu qasi er hefau in ra heka maa kheru');
  assert.strictEqual(
    out.gloss,
    'Recitation. I bind against the grave-worm, by Ra. Heka! True of voice.',
  );
});

// The same search, run on the Phoenician genome: a seed whose difficulty 5
// Protection draws reproduce the section 5 rendering exactly. Opener PO1
// naming the target rp' in the plural, the binding root 'sr as a jussive, the
// god bghl as its subject, 'shmn as the free power word, no modifier, the
// votive closer PC1.
const SECTION5_PHOENICIAN_SEED = 709;

test('section 5 fixture: the phoenician rendering, letter for letter', () => {
  const out = phoenician('protection', 5, SECTION5_PHOENICIAN_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{1090B}\u{10907}\u{10914}\u{10915}\u{1091F}\u{1090B}\u{10913}\u{10910}\u{10900}\u{1090C}\u{1091F}\u{10909}\u{10900}\u{1090E}\u{10913}\u{1091F}\u{10901}\u{1090F}\u{1090B}\u{1091F}\u{10900}\u{10914}\u{1090C}\u{1090D}\u{1091F}\u{1090A}\u{1091F}\u{10914}\u{1090C}\u{1090F}\u{1091F}\u{10912}\u{1090B}\u{1091F}\u{10909}\u{10901}\u{10913}\u{1090A}',
  );
  assert.strictEqual(
    out.transliteration,
    'lakhashat lerapoim yasur baal eshmun ki shama qol yebarek',
  );
  assert.strictEqual(
    out.gloss,
    'Incantation against the shades. May Baal bind. Eshmun! For he has heard the voice, may he bless.',
  );
});

test('section 5 fixture: the three genomes diverge on one plan', () => {
  const a = runic('protection', 5, SECTION5_SEED);
  const b = egyptian('protection', 5, SECTION5_EGYPTIAN_SEED);
  const c = phoenician('protection', 5, SECTION5_PHOENICIAN_SEED);
  // Runic separates its words and closes on the carver, Egyptian runs
  // continuous and hangs the caster off the verb as a suffix, Phoenician runs
  // right to left and drops every vowel behind a jussive prefix.
  assert.ok(a.glyphs.includes('\u{16EB}'), 'runic lost its word separator');
  assert.ok(!/[\u{16A0}-\u{16F8}]/u.test(b.glyphs), 'egyptian leaked a runic codepoint');
  assert.ok(!b.transliteration.includes('withra'), 'egyptian leaked a runic preposition');
  assert.ok(c.glyphs.includes('\u{1091F}'), 'phoenician lost its word separator');
  assert.ok(
    !/[\u{16A0}-\u{16F8}\u{13000}-\u{1342F}]/u.test(c.glyphs),
    'phoenician leaked a foreign codepoint',
  );
  // The abjad writes no vowel, so the glyph line is shorter than its own
  // transliteration in a way the two alphabetic genomes never are.
  assert.ok(
    Array.from(c.glyphs).length < c.transliteration.replace(/ /gu, '').length,
    'phoenician wrote its vowels',
  );
});
