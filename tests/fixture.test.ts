import test from 'node:test';
import * as assert from 'node:assert/strict';
import { egyptian, runic } from './gen.js';

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

test('section 5 fixture: the two genomes diverge on one plan', () => {
  const a = runic('protection', 5, SECTION5_SEED);
  const b = egyptian('protection', 5, SECTION5_EGYPTIAN_SEED);
  // Runic separates its words and closes on the carver, Egyptian runs
  // continuous and hangs the caster off the verb as a suffix.
  assert.ok(a.glyphs.includes('\u{16EB}'), 'runic lost its word separator');
  assert.ok(!/[\u{16A0}-\u{16F8}]/u.test(b.glyphs), 'egyptian leaked a runic codepoint');
  assert.ok(!b.transliteration.includes('withra'), 'egyptian leaked a runic preposition');
});
