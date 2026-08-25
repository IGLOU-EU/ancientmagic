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

// --- Divination -------------------------------------------------------------
// Section 7 asks for one pinned divination fixture per genome. The six worked
// examples of sections 2.11, 3.11 and 4.11 were composed by hand before any
// seed existed, and no seed reproduces one, so each fixture below records its
// own draw. Every one of them carries the school's signature: an asking clause
// first, then at least one seeing clause.

// Difficulty 6: opening RO2 then RO4 as one clause, an asking clause, a seeing
// clause carrying an adjective, closing RC4. The verb opens the question in
// -ith and closes the answer in -o, which is the whole contrast of the school.
const DIVINATION_RUNIC_SEED = 7;

test('divination fixture: the runic question and its answer', () => {
  const out = runic('divination', 6, DIVINATION_RUNIC_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{16D6}\u{16B2}\u{16EB}\u{16D6}\u{16B1}\u{16C1}\u{16DA}\u{16A8}\u{16C9}\u{16EB}\u{16A6}\u{16B1}\u{16C1}\u{16EB}\u{16CF}\u{16C7}\u{16BE}\u{16DF}\u{16C9}\u{16EB}\u{16BE}\u{16D6}\u{16D7}\u{16C1}\u{16DE}\u{16DF}\u{16EC}\u{16D2}\u{16A8}\u{16B1}\u{16C1}\u{16A6}\u{16EB}\u{16BA}\u{16B1}\u{16A8}\u{16A0}\u{16A8}\u{16C9}\u{16EB}\u{16DE}\u{16DF}\u{16D7}\u{16A8}\u{16BE}\u{16EC}\u{16CA}\u{16C8}\u{16A8}\u{16BA}\u{16A8}\u{16C9}\u{16EB}\u{16DE}\u{16D6}\u{16B1}\u{16B2}\u{16A8}\u{16BE}\u{16EB}\u{16BA}\u{16A2}\u{16DA}\u{16DE}\u{16A8}\u{16BE}\u{16EB}\u{16CA}\u{16DF}\u{16B2}\u{16DF}\u{16EC}\u{16B1}\u{16A2}\u{16BE}\u{16DF}\u{16C9}\u{16EB}\u{16B1}\u{16A8}\u{16DE}\u{16C1}\u{16DE}\u{16DF}',
  );
  assert.strictEqual(
    out.transliteration,
    'ek erilaz thri teinoz nemido barith hrafaz doman spahaz derkan huldan soko runoz radido',
  );
  assert.strictEqual(
    out.gloss,
    'I, the rune-master! I took up three lot-staves. Does the raven lay bare the ' +
      'doom? I, the seer, seek the dark hidden one. I read the runes.',
  );
});

// Difficulty 7: opener EO4, one EO3 address to the power questioned, an asking
// clause on the particle in-iw, a seeing clause carrying the =i suffix, closer
// EC4, seal sp 2. The draw also settles the pun of spec 3.7: the god imn and
// the hidden-things root imn stand side by side, spoken alike and written
// apart, the god on the flag and the root on the papyrus roll of its field.
const DIVINATION_EGYPTIAN_SEED = 54;

test('divination fixture: the egyptian question and its answer', () => {
  const out = egyptian('divination', 7, DIVINATION_EGYPTIAN_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{131CB}\u{1308B}\u{13079}\u{133E4}\u{13153}\u{1308B}\u{132F4}\u{13171}\u{133CF}\u{13079}\u{131CB}\u{13001}\u{131CB}\u{13153}\u{13216}\u{132B9}\u{1308B}\u{1340D}\u{133DB}\u{13000}\u{1308B}\u{13216}\u{133E4}\u{133A1}\u{131CB}\u{13216}\u{131CB}\u{13171}\u{132F4}\u{1339B}\u{13193}\u{13079}\u{131CB}\u{13153}\u{13216}\u{132B9}\u{131CB}\u{13153}\u{13216}\u{133DB}\u{1320E}\u{13216}\u{1339B}\u{133DB}\u{132F4}\u{132AA}\u{1308B}\u{13001}\u{13000}\u{133A1}\u{1313F}\u{132AA}\u{133DB}\u{131CB}\u{13171}\u{13191}\u{132AA}\u{13171}\u{13297}\u{133E4}\u{133E4}',
  );
  assert.strictEqual(
    out.transliteration,
    'ir maa em resut i imen rekhi renek iniu sehedj imen imen qeneh seperi kap iuef pu sep senu',
  );
  assert.strictEqual(
    out.gloss,
    'As for what is seen in a dream. O Imen, I know your name. Does Imen illumine ' +
      'the shrine-dark hidden thing? I petition the cover. So it is. Recited two times.',
  );
});

// Difficulty 9: the PO2 self presentation on a sight root, opener PO4 naming
// the goddess questioned, an asking clause with her name written out over a
// chain of two plural signs nouns and resumed by the feminine prefix, two
// seeing clauses in the imperfect 1sg joined by w-, the shrinking Tinnit,
// closers PC4 then PC3, seal nine.
const DIVINATION_PHOENICIAN_SEED = 1;

test('divination fixture: the phoenician question and its answers', () => {
  const out = phoenician('divination', 9, DIVINATION_PHOENICIAN_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{10900}\u{1090D}\u{1090A}\u{1091F}\u{10900}\u{10905}\u{10913}\u{10901}\u{1090F}\u{1090B}\u{1091F}\u{10914}\u{10900}\u{1090B}\u{10915}\u{1091F}\u{1090B}\u{1090F}\u{10914}\u{10915}\u{10913}\u{10915}\u{1091F}\u{10904}\u{10915}\u{10906}\u{1090F}\u{10912}\u{1091F}\u{1090F}\u{10914}\u{10915}\u{10913}\u{10915}\u{1091F}\u{10900}\u{10915}\u{1090C}\u{1091F}\u{10904}\u{1090B}\u{1090C}\u{1091F}\u{10900}\u{10909}\u{10915}\u{1091F}\u{10904}\u{1090C}\u{1090D}\u{10909}\u{1091F}\u{10905}\u{10900}\u{1090F}\u{1090D}\u{10909}\u{1091F}\u{10900}\u{10909}\u{10915}\u{1091F}\u{10904}\u{1090F}\u{10915}\u{1091F}\u{10901}\u{1090F}\u{1090B}\u{1090C}\u{1091F}\u{10905}\u{10900}\u{10907}\u{10906}\u{10904}\u{1091F}\u{10900}\u{10909}\u{10915}\u{1091F}\u{10904}\u{10914}\u{1090D}\u{10915}\u{1091F}\u{10904}\u{10914}\u{10907}\u{10913}\u{1091F}\u{10915}\u{1090D}\u{10915}\u{1091F}\u{10915}\u{1090D}\u{1091F}\u{10915}\u{1091F}\u{1090A}\u{1091F}\u{10914}\u{1090C}\u{1090F}\u{1091F}\u{10912}\u{1090B}\u{1091F}\u{1090B}\u{1090F}\u{1090B}\u{1090C}\u{1091F}\u{10910}\u{1090F}\u{1090C}\u{1091F}\u{1091B}\u{1091B}\u{1091B}',
  );
  assert.strictEqual(
    out.transliteration,
    'anok aworbaal shaolat leashtart hitazghuq ashtart otim halolim et hamanoy ' +
      'weaghnoy et haghot beghalom weakhzoh et hashanot hashakhor tinnit ton ta ki ' +
      'shama qol leolam paghom tesha',
  );
  assert.strictEqual(
    out.gloss,
    'I am Aworbaal. A question to Ashtart. Does Ashtart of the tokens of the ' +
      'morning stars cry out the thing appointed? And I answer the moment. In the ' +
      'concealment. And I behold in vision the black year. Tinnit, shrinking to a ' +
      'single letter. For the voice has been heard. Forever. Nine times over.',
  );
});

// --- Chronomancy ------------------------------------------------------------
// Section 7 asks for one pinned chronomancy fixture per genome, by the rule the
// divination ones follow. No seed reproduces a worked example, so each records
// its own draw, and each carries the school's signature: a crossing clause with
// its direction, a binding clause, and the return anchor.

// Difficulty 6: opening RO2, a crossing clause with its direction and an
// adjective, a binding clause on ek with an adverb, closing RC5. The command
// opens the way and the performative does the deed.
const CHRONOMANCY_RUNIC_SEED = 0;

test('chronomancy fixture: the runic crossing and its binding', () => {
  const out = runic('chronomancy', 6, CHRONOMANCY_RUNIC_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{16D6}\u{16B2}\u{16EB}\u{16D6}\u{16B1}\u{16C1}\u{16DA}\u{16A8}\u{16C9}\u{16EB}\u{16A0}\u{16A8}\u{16B1}\u{16EB}\u{16A8}\u{16A0}\u{16CF}\u{16A8}\u{16B1}\u{16EB}\u{16CA}\u{16B9}\u{16A8}\u{16B1}\u{16CF}\u{16A8}\u{16BE}\u{16EB}\u{16DE}\u{16A8}\u{16B7}\u{16A8}\u{16BE}\u{16EC}\u{16D6}\u{16B2}\u{16EB}\u{16B9}\u{16D6}\u{16B7}\u{16A8}\u{16BE}\u{16EB}\u{16B1}\u{16A8}\u{16A6}\u{16DF}\u{16EB}\u{16CA}\u{16C8}\u{16A8}\u{16BE}\u{16DF}\u{16EC}\u{16A8}\u{16D2}\u{16A8}\u{16BE}\u{16DE}\u{16A8}\u{16BE}\u{16EB}\u{16A8}\u{16A0}\u{16CF}\u{16A8}\u{16B1}\u{16EB}\u{16B9}\u{16D6}\u{16BE}\u{16DE}\u{16DF}',
  );
  assert.strictEqual(
    out.transliteration,
    'ek erilaz far aftar swartan dagan ek wegan ratho spanno abandan aftar wendo',
  );
  assert.strictEqual(
    out.gloss,
    'I, the rune-master! Cross backward the black day! I hereby clasp swiftly ' +
      'the way. I turn back to the evening of days.',
  );
});

// Difficulty 7: opener EO1, one EO3 address to an hour-gate, a crossing clause
// carrying an adverbial m-phrase, a binding clause in the sedjem-en-ef, closer
// EC5, seal sp 12 for the twelve hours the barque passes.
const CHRONOMANCY_EGYPTIAN_SEED = 3;

test('chronomancy fixture: the egyptian crossing and its binding', () => {
  const out = egyptian('chronomancy', 7, CHRONOMANCY_EGYPTIAN_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{13193}\u{130A7}\u{13303}\u{131CB}\u{13001}\u{132F4}\u{130C0}\u{1313F}\u{13280}\u{13216}\u{1309D}\u{1339B}\u{1309D}\u{13171}\u{131F3}\u{1308B}\u{1340D}\u{133DB}\u{13000}\u{1308B}\u{13216}\u{133E4}\u{133A1}\u{1340D}\u{133CF}\u{13153}\u{132BD}\u{13153}\u{1340D}\u{133CF}\u{1309D}\u{1339B}\u{1309D}\u{13171}\u{131F3}\u{13153}\u{13153}\u{132F4}\u{133A1}\u{133CF}\u{131FC}\u{1313F}\u{132F4}\u{130BB}\u{13216}\u{13000}\u{133CF}\u{1308B}\u{131F3}\u{13153}\u{13216}\u{13153}\u{133CF}\u{130BB}\u{132AA}\u{1308B}\u{133CF}\u{130BB}\u{13153}\u{133CF}\u{1308B}\u{131F3}\u{13297}\u{13386}\u{133E4}\u{133E4}',
  );
  assert.strictEqual(
    out.transliteration,
    'djed medu i seba en ahau rekhi renek khetem emkhet ahau em mesket aseni ' +
      'ter em nemet peret em ter sep medj senu',
  );
  assert.strictEqual(
    out.gloss,
    'Recitation. O portal of the lifetime, I know your name. Seal forward the ' +
      'lifetime in the night-barque! I hereby hasten the season in the step. ' +
      'Coming forth in the season. Twelve hours deep.',
  );
});

// Difficulty 9: the PO2 self presentation on a course root, opener PO5 dating
// the formula, a crossing clause, two binding clauses in the perfect 1sg joined
// by w-, the shrinking Baal, the anchor as a construct pair, PC3, seal twelve.
const CHRONOMANCY_PHOENICIAN_SEED = 0;

test('chronomancy fixture: the phoenician crossing and its bindings', () => {
  const out = phoenician('chronomancy', 9, CHRONOMANCY_PHOENICIAN_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{10900}\u{1090D}\u{1090A}\u{1091F}\u{10904}\u{1090B}\u{1090A}\u{10901}\u{1090F}\u{1090B}\u{1091F}\u{10901}\u{10914}\u{1090D}\u{10915}\u{1091F}\u{10901}\u{10912}\u{10913}\u{1091F}\u{1090C}\u{10914}\u{1090A}\u{1091F}\u{1090B}\u{10912}\u{10903}\u{1090C}\u{1091F}\u{10900}\u{10909}\u{10915}\u{1091F}\u{10904}\u{10906}\u{1090C}\u{1090D}\u{1091F}\u{10904}\u{10911}\u{1090B}\u{1090C}\u{1091F}\u{10905}\u{10907}\u{10902}\u{10913}\u{10915}\u{1091F}\u{10900}\u{10909}\u{10915}\u{1091F}\u{10904}\u{1090E}\u{10910}\u{1091F}\u{10901}\u{10911}\u{1090F}\u{10903}\u{1091F}\u{10905}\u{1090D}\u{1090E}\u{1090F}\u{10915}\u{1091F}\u{10900}\u{10909}\u{10915}\u{1091F}\u{10904}\u{1090D}\u{10907}\u{1090B}\u{1091F}\u{10901}\u{10911}\u{1090B}\u{1090C}\u{1091F}\u{10901}\u{1090F}\u{1090B}\u{1091F}\u{10901}\u{1090F}\u{1091F}\u{10901}\u{1091F}\u{10901}\u{10905}\u{10900}\u{10915}\u{1091F}\u{1090B}\u{10909}\u{1090C}\u{1091F}\u{1090F}\u{10903}\u{1091F}\u{1090B}\u{1090F}\u{1090B}\u{1090C}\u{1091F}\u{10910}\u{1090F}\u{1090C}\u{1091F}\u{10917}\u{1091A}',
  );
  assert.strictEqual(
    out.transliteration,
    'anok halokbaal beshanot baqor meshok leqadom et hazamon hatsalom wekhagarti ' +
      'et hasop betsaghod wenasaghti et hanakhol betsalom baal bogh ba bawati ' +
      'leyom ghod leolam paghom shenem asar',
  );
  assert.strictEqual(
    out.gloss,
    'I am Halokbaal. In the year of the morning. Draw out backward the shadowed ' +
      'appointed time! And I hereby gird the threshold. In the step. And I hereby ' +
      'lift out the share that falls to one. In the deep shadow. Baal, shrinking ' +
      'to a single letter. I have come to the day of the perpetuity. Forever. ' +
      'Twelve hours deep.',
  );
});
