import test from 'node:test';
import * as assert from 'node:assert/strict';
import { egyptian, greek, latin, ogham, phoenician, runic } from './gen.js';

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

// --- Greek ------------------------------------------------------------------
// Section 8.13 asks for one Greek fixture per school, six in all, by the rule
// section 7 states for the other genomes: reproduce a worked example when a
// seed yields one, record the draw when none does. Five of the six do, which is
// the strongest statement this suite makes about the genome: the author wrote
// those lines by hand before any seed existed, and the generator finds them.
//
// Greek glyphs are written as literals rather than as codepoint escapes: the
// reason the other three genomes escape theirs is that their blocks render as
// tofu in a terminal, and this one does not.

// Difficulty 5: the section 5 plan rendered a fourth time (spec 8.13). Opener
// GO1, the agent in -ΟΣ, the threat behind ΚΑΤΑ in the genitive, the verb last,
// the free vox, closer GC1.
const GREEK_PROTECTION_SEED = 78253;

test('greek fixture: the amulet of section 8.13, letter for letter', () => {
  const out = greek('protection', 5, GREEK_PROTECTION_SEED);
  assert.strictEqual(
    out.glyphs,
    'ΦΥΛΑΚΤΗΡΙΟΝ·ΦΥΛΑΚΟΣ·ΚΑΤΑ·ΝΕΚΡΟΥ·ΔΕΣΜΩ·ΙΑΩ·ΗΔΗ·ΗΔΗ·ΤΑΧΥ·ΤΑΧΥ',
  );
  assert.strictEqual(
    out.transliteration,
    'phulakteerion phulakos kata nekrou desmoo iaoo eedee eedee takhu takhu',
  );
  assert.strictEqual(
    out.gloss,
    'Amulet. I, the guard, bind against the corpse. Iao! Now, now, quickly, quickly.',
  );
});

// Difficulty 6: the tablet opens on its verb and lets the victim fall straight
// after it, twice, each clause carrying an adverb, joined by ΚΑΙ. The spec's
// own Curse example is out of reach of a seed, so this fixture records its own
// draw in the same shape.
const GREEK_CURSE_SEED = 12;

test('greek fixture: the binding tablet and its two commands', () => {
  const out = greek('curse', 6, GREEK_CURSE_SEED);
  assert.strictEqual(
    out.glyphs,
    'ΟΡΚΙΖΩ·ΣΕ·ΛΥΠΕΤΩ·ΟΝΕΙΡΟΝ·ΠΙΚΡΩΣ·ΚΑΙ·ΠΛΗΓΕΤΩ·ΛΕΙΨΑΝΟΝ·ΣΚΟΤΩΣ·ΗΔΗ·ΗΔΗ·ΤΑΧΥ·ΤΑΧΥ',
  );
  assert.strictEqual(
    out.transliteration,
    'orkizoo se lupetoo oneiron pikroos kai pleegetoo leipsanon skotoos eedee eedee takhu takhu',
  );
  assert.strictEqual(
    out.gloss,
    'I adjure you. May the dream be grieved bitterly. And may the remains be struck ' +
      'darkly. Now, now, quickly, quickly.',
  );
});

// Difficulty 5: the hymn of spec 8.13. The vocative heads the clause, the
// intransitive come is legal here and nowhere else, and the vox closes it.
const GREEK_INVOCATION_SEED = 3790;

test('greek fixture: the hymn of section 8.13', () => {
  const out = greek('invocation', 5, GREEK_INVOCATION_SEED);
  assert.strictEqual(out.glyphs, 'ΕΠΙΚΑΛΟΥΜΑΙ·ΣΕ·ΑΙΩΝΕ·ΕΛΘΕ·ΑΒΡΑΣΑΞ·ΗΔΗ·ΗΔΗ·ΤΑΧΥ·ΤΑΧΥ');
  assert.strictEqual(
    out.transliteration,
    'epikaloumai se aioone elthe abrasaks eedee eedee takhu takhu',
  );
  assert.strictEqual(
    out.gloss,
    'I call upon you. O age, come! Abrasax! Now, now, quickly, quickly.',
  );
});

// Difficulty 3: the question ticket of spec 8.11. ΑΡΑ turns the statement into
// a yes-or-no question and leaves the rest of the clause where it stood.
const GREEK_DIVINATION_SEED = 795;

test('greek fixture: the question ticket of section 8.11', () => {
  const out = greek('divination', 3, GREEK_DIVINATION_SEED);
  assert.strictEqual(out.glyphs, 'ΧΡΗΣΟΝ·ΜΟΙ·ΑΡΑ·ΔΕΙΚΕΙ·ΣΗΜΟΣ·ΜΟΙΡΟΝ');
  assert.strictEqual(out.transliteration, 'khreeson moi ara deikei seemos moiron');
  assert.strictEqual(out.gloss, 'Give me an oracle. Does the sign show the allotted fate?');
});

// Difficulty 3: the crossing of spec 8.12, opened by the Aion pair the frame
// reserved for this genome.
const GREEK_CHRONOMANCY_SEED = 1152;

test('greek fixture: the crossing of section 8.12', () => {
  const out = greek('chronomancy', 3, GREEK_CHRONOMANCY_SEED);
  assert.strictEqual(out.glyphs, 'ΑΙΩΝ·ΑΙΩΝΟΣ·ΔΙΑΒΑΙΝΕ·ΟΠΙΣΩ·ΩΡΟΝ');
  assert.strictEqual(out.transliteration, 'aioon aioonos diabaine opisoo ooron');
  assert.strictEqual(out.gloss, 'Aion of Aion! Cross backward the hour!');
});

// Difficulty 5: the register of spec 8.10. The Ephesian row read against its
// order, a dread epithet in the vocative, another as the vox, the fixed dread
// closer, and the verb showing the lengthening at work: ΕΛΘΕ becomes ΗΛΘΕ.
const GREEK_ELDRITCH_SEED = 1161;

test('greek fixture: the register of section 8.10', () => {
  const out = greek('eldritch', 5, GREEK_ELDRITCH_SEED);
  assert.strictEqual(out.glyphs, 'ΚΑΤΑΣΚΙ·ΑΣΚΙ·ΞΑΡΓΩΘ·ΗΛΘΕ·ΘΡΥΓΞΩΘ·ΦΘΟΡΩΘ·ΑΙΩΝΩΘ');
  assert.strictEqual(
    out.transliteration,
    'kataski aski ksargooth eelthe thrugksooth phthorooth aioonooth',
  );
  assert.strictEqual(
    out.gloss,
    'The Ephesian words, spoken against their order! O shape at the door, come! ' +
      'Thrugksooth! Ruin forever.',
  );
});

// --- Latin ------------------------------------------------------------------
// Section 9.13 asks for one Latin fixture per school, six in all, targeting the
// school-and-difficulty pairs of the section's short worked examples so that a
// seed has something to land on. All six land: this is the first genome whose
// every pinned fixture reproduces a worked example byte for byte, glyph line,
// reading line and gloss, and the author wrote those lines by hand before any
// seed existed.
//
// Latin glyphs are written as literals, as the Greek ones are: the reason the
// first three genomes escape theirs is that their blocks render as tofu in a
// terminal, and this one is the alphabet the terminal is already in. The
// separator is the one exception, escaped everywhere, because U+00B7 and
// U+0387 draw the same picture and this suite writes both.
const SEP = '\u{00B7}';

// Difficulty 5: the section 5 plan rendered a fifth time (spec 9.13). Opener
// LO1, the agent in the nominative, the threat behind CONTRA in the
// accusative, the verb last, the free power word, closer LC1.
const LATIN_PROTECTION_SEED = 25842;

test('latin fixture: the amulet of section 9.13, letter for letter', () => {
  const out = latin('protection', 5, LATIN_PROTECTION_SEED);
  assert.strictEqual(
    out.glyphs,
    ['AMVLETVM', 'TVTELA', 'CONTRA', 'LARVAM', 'LIGO', 'FASCINVS', 'IAM', 'IAM', 'CITO', 'CITO'].join(SEP),
  );
  assert.strictEqual(
    out.transliteration,
    'amuletum tutela contra larvam ligo fascinus iam iam cito cito',
  );
  assert.strictEqual(
    out.gloss,
    'Amulet. I, the guardian, bind against the ghost. Fascinus! Now, now, quickly, quickly.',
  );
});

// Difficulty 6: the tablet of spec 9.13. The victim is named first and the law
// pronounced on him, twice, the second carrying its adverb clause-final, which
// is where the school order puts it against the general rule.
const LATIN_CURSE_SEED = 376508;

test('latin fixture: the defixio of section 9.13', () => {
  const out = latin('curse', 6, LATIN_CURSE_SEED);
  assert.strictEqual(
    out.glyphs,
    ['DEFIGO', 'SIMVLACRVM', 'VEXATO', 'ET', 'LARVAM', 'FLAGELLATO', 'AMARE', 'IAM', 'IAM', 'CITO', 'CITO'].join(SEP),
  );
  assert.strictEqual(
    out.transliteration,
    'defigo simulacrum vexato et larvam flagellato amare iam iam cito cito',
  );
  assert.strictEqual(
    out.gloss,
    'I nail it down. May the phantom be tormented. And may the ghost be scourged ' +
      'bitterly. Now, now, quickly, quickly.',
  );
});

// Difficulty 5: the prayer of spec 9.13, Cato's opening word for word. The
// -um class vocative stands identical to its nominative, which is what real
// Latin neuters do, and the intransitive proper is legal here and nowhere else.
const LATIN_INVOCATION_SEED = 883;

test('latin fixture: the prayer of section 9.13', () => {
  const out = latin('invocation', 5, LATIN_INVOCATION_SEED);
  assert.strictEqual(
    out.glyphs,
    ['TE', 'PRECOR', 'QVAESOQVE', 'SAECVLVM', 'PROPERA', 'ANGITIA', 'IAM', 'IAM', 'CITO', 'CITO'].join(SEP),
  );
  assert.strictEqual(
    out.transliteration,
    'te precor quaesoque saeculum propera angitia iam iam cito cito',
  );
  assert.strictEqual(
    out.gloss,
    'I pray and beseech you. O age, hasten near! Angitia! Now, now, quickly, quickly.',
  );
});

// Difficulty 3: the lot of spec 9.11. The enclitic hangs on the verb, which is
// what makes the verb the first word of its clause. Re-pinned when the
// Etruscan pour widened the signs field: the smallest divination formula of
// this genome now reads the sky, which is the fulgural half of the discipline
// asking its own question.
const LATIN_DIVINATION_SEED = 1999;

test('latin fixture: the sortes of section 9.11', () => {
  const out = latin('divination', 3, LATIN_DIVINATION_SEED);
  assert.strictEqual(
    out.glyphs,
    ['SORTEM', 'DVCO', 'MONSTRATNE', 'CAELVM', 'FATVM'].join(SEP),
  );
  assert.strictEqual(out.transliteration, 'sortem duco monstratne caelum fatum');
  assert.strictEqual(out.gloss, 'I draw the lot. Does the sky show the fate?');
});

// Difficulty 8: the consultation of spec 9.11, and the second fixture this
// school carries. Divination is the one school pinned twice, because it is the
// one the Etruscan material was poured into and a fixture is what holds a pour
// still: the haruspex's opener, the cleft of the liver asking, the augural
// left and the augural verdict agreeing in two different classes, and the
// soothsayer speaking last.
const LATIN_HARUSPEX_SEED = 289;

test('latin fixture: the consultation of section 9.11', () => {
  const out = latin('divination', 8, LATIN_HARUSPEX_SEED);
  assert.strictEqual(
    out.glyphs,
    [
      'SATOR', 'AREPO', 'TENET', 'OPERA', 'ROTAS', 'EXTA', 'INSPICIO',
      'LVSTRATNE', 'FISSVM', 'LAEVVM', 'AEVVM', 'ET', 'DIVINVS', 'FAVSTAM',
      'FORTVNAM', 'EVOCO', 'ET', 'HARIOLVS', 'ANNVM', 'MONSTRO', 'ANGITIA',
      'ANGITIA', 'ANGITIA', 'ITA', 'EST', 'VOTVM', 'SOLVI', 'VIIII', 'DICITO',
    ].join(SEP),
  );
  assert.strictEqual(
    out.transliteration,
    'sator arepo tenet opera rotas exta inspicio lustratne fissum laevum aevum ' +
      'et divinus faustam fortunam evoco et hariolus annum monstro angitia ' +
      'angitia angitia ita est votum solvi novies dicito',
  );
  assert.strictEqual(
    out.gloss,
    'The five words of the square! I inspect the entrails. Does the cleft ' +
      'survey the left-hand unending age? And I, the diviner, call forth the ' +
      'auspicious fortune. And I, the soothsayer, show the year. Angitia, ' +
      'spoken three times. So it is. I have paid the vow. Say it nine times.',
  );
});

// Difficulty 3: the crossing of spec 9.12, opened by the attested first-named
// of Roman prayer order.
const LATIN_CHRONOMANCY_SEED = 2898;

test('latin fixture: the crossing of section 9.12', () => {
  const out = latin('chronomancy', 3, LATIN_CHRONOMANCY_SEED);
  assert.strictEqual(out.glyphs, ['IANE', 'PATER', 'SVPERA', 'RETRO', 'HORAM'].join(SEP));
  assert.strictEqual(out.transliteration, 'iane pater supera retro horam');
  assert.strictEqual(out.gloss, 'Father Janus! Overpass backward the hour!');
});

// Difficulty 5: the register of spec 9.10, whose whole face is what it does not
// do. ADVOLA is unbroken Latin, the square is attested letters in an attested
// order, and everything alien in the line arrived whole, as a name.
const LATIN_ELDRITCH_SEED = 308;

test('latin fixture: the register of section 9.10', () => {
  const out = latin('eldritch', 5, LATIN_ELDRITCH_SEED);
  assert.strictEqual(
    out.glyphs,
    ['ROTAS', 'OPERA', 'XVLGOTH', 'ADVOLA', 'THROXVL', 'RVINA', 'AETERNA'].join(SEP),
  );
  assert.strictEqual(out.transliteration, 'rotas opera xulgoth advola throxul ruina aeterna');
  assert.strictEqual(
    out.gloss,
    'The square, read against its order! O maw beneath the threshold, fly hither! ' +
      'Throxul! Everlasting ruin.',
  );
});

test('latin fixture: the fifth genome renders the section 5 plan its own way', () => {
  const a = runic('protection', 5, SECTION5_SEED);
  const b = greek('protection', 5, GREEK_PROTECTION_SEED);
  const c = latin('protection', 5, LATIN_PROTECTION_SEED);
  // Against Greek, the closest twin, three things move: CONTRA governs the
  // accusative where KATA governs the genitive, the epithet shows the feminine
  // -A where Greek showed -OS, and the reading line is the same language as
  // the glyph line rather than a romanization of another script (spec 9.13).
  assert.ok(c.glyphs.includes(`CONTRA${SEP}LARVAM`), 'latin lost its accusative phrase');
  assert.ok(b.glyphs.includes('ΚΑΤΑ'), 'greek lost its preposition');
  assert.ok(!/[\u{0370}-\u{03FF}\u{16A0}-\u{16F8}]/u.test(c.glyphs), 'latin leaked a foreign codepoint');
  // The one genome whose reading line is its glyph line lowercased, letter for
  // letter, once u and v are told apart again.
  assert.strictEqual(
    c.glyphs.split(SEP).join(' '),
    c.transliteration.toUpperCase().replace(/U/gu, 'V'),
    'the two latin lines came apart',
  );
  assert.notStrictEqual(a.glyphs, c.glyphs);
});

// --- Ogham ------------------------------------------------------------------
// The sixth genome, and the first whose glyph line carries Unicode whitespace:
// U+1680 OGHAM SPACE MARK parts the words from difficulty 3 up, and it is a
// bare length of stem rather than a blank. Every glyph below is written as an
// escape, and not for the reason the first three genomes escape theirs. Here
// the block renders, and that is the danger: neighbouring letters of an aicme
// differ by one stroke in five, the two feather marks are mirror twins, and
// the separator looks like nothing at all. A fixture copied off a rendered
// page would pass every proof by eye and be wrong (spec 10.1).

// Difficulty 5: the section 5 plan (spec 10.13). Opener OO1, the agent in the
// nominative, the threat behind vrit in the accusative, the verb last as the
// votive order asks, the free power word, closer OC1.
const OGHAM_PROTECTION_SEED = 61879;

test('ogham fixture: the section 5 plan rendered a sixth time', () => {
  const out = ogham('protection', 5, OGHAM_PROTECTION_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{169B}\u{1681}\u{1681}\u{1681}\u{1681}\u{1681}\u{1681}\u{1681}\u{1680}\u{1689}\u{1692}\u{168F}\u{1690}\u{1684}\u{1680}\u{1683}\u{168F}\u{1694}\u{1688}\u{1680}\u{1684}\u{1689}\u{1690}\u{1682}\u{1690}\u{1685}\u{1680}\u{1685}\u{1690}\u{1684}\u{1689}\u{1692}\u{1680}\u{1682}\u{1692}\u{168C}\u{1692}\u{1684}\u{1680}\u{1689}\u{1691}\u{1694}\u{169C}',
  );
  assert.strictEqual(
    out.transliteration,
    'bbbbbbb curas vrit scalan nascu lugus coi',
  );
  assert.strictEqual(
    out.gloss,
    'The birch cut seven times, a warning that guards. I, the champion, bind against the phantom. Lugus! Here it stands.',
  );
});

// Difficulty 6: two clauses as two rods, which is this genome's joint. Where
// Greek writes KAI and Latin ET, an ogham formula is a bundle of rods and the
// reader sees how many. The adverb trails the second clause, per the school
// override of 10.5.
const OGHAM_CURSE_SEED = 2805986;

test('ogham fixture: the two rods of section 10.13', () => {
  const out = ogham('curse', 6, OGHAM_CURSE_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{169B}\u{1690}\u{1685}\u{168B}\u{1680}\u{1689}\u{168F}\u{1690}\u{1687}\u{1693}\u{1688}\u{1692}\u{1680}\u{1684}\u{1689}\u{1690}\u{1682}\u{1690}\u{1685}\u{169C}\u{169B}\u{168C}\u{1691}\u{1685}\u{1693}\u{1688}\u{1692}\u{1680}\u{1689}\u{1685}\u{1690}\u{168B}\u{1690}\u{1685}\u{1680}\u{1689}\u{1691}\u{1684}\u{1693}\u{168F}\u{1681}\u{1680}\u{1689}\u{1691}\u{1694}\u{169C}',
  );
  assert.strictEqual(
    out.transliteration,
    'anm cradetu scalan gonetu cnaman coserb coi',
  );
  assert.strictEqual(
    out.gloss,
    'The name of the accursed! May the phantom be tormented. May the bone be pierced bitterly. Here it stands.',
  );
});

// Difficulty 5: the shortest full sentence this genome writes, a vocative, a
// bare command and a name. The intransitive tic is legal here and nowhere
// else, the exemption 10.3 states.
//
// This is the one fixture of the six that does not reproduce its worked
// example. The example addresses cur, a warding root, and the Invocation
// AGENT is drawn from night, fire, time and death (spec 1.3), so no seed can
// reach it. The draw below is the same shape with a reachable agent: opener
// OO2, one vocative, tic, the same name, closer OC1.
const OGHAM_INVOCATION_SEED = 26;

test('ogham fixture: the prayer of section 10.13', () => {
  const out = ogham('invocation', 5, OGHAM_INVOCATION_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{169B}\u{1689}\u{1693}\u{1682}\u{1694}\u{1680}\u{1690}\u{168B}\u{1684}\u{1693}\u{168F}\u{1693}\u{1680}\u{1688}\u{1694}\u{1689}\u{1680}\u{168B}\u{1690}\u{1685}\u{1690}\u{1685}\u{1685}\u{1690}\u{1685}\u{1680}\u{1689}\u{1691}\u{1694}\u{169C}',
  );
  assert.strictEqual(
    out.transliteration,
    'celi amsere tic manannan coi',
  );
  assert.strictEqual(
    out.gloss,
    'Your follower calls! O season, come! Manannán! Here it stands.',
  );
});

// Difficulty 3: opener OO5, the four rods of yew, then the asking clause behind
// the particle in, with the verb in -it as its second word.
const OGHAM_DIVINATION_SEED = 3965;

test('ogham fixture: the four rods of yew of section 10.11', () => {
  const out = ogham('divination', 3, OGHAM_DIVINATION_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{169B}\u{1689}\u{1693}\u{1688}\u{168F}\u{1694}\u{1680}\u{1683}\u{1682}\u{1693}\u{1684}\u{1689}\u{1690}\u{1680}\u{1694}\u{1681}\u{1690}\u{168F}\u{1694}\u{1680}\u{1694}\u{1685}\u{1680}\u{1690}\u{1687}\u{1681}\u{1690}\u{1688}\u{1694}\u{1688}\u{1680}\u{1681}\u{168F}\u{1690}\u{1685}\u{1690}\u{1684}\u{1680}\u{1687}\u{1690}\u{1685}\u{1690}\u{1685}\u{169C}',
  );
  assert.strictEqual(
    out.transliteration,
    'cetri vlesca ibari in adbatit branas danan',
  );
  assert.strictEqual(
    out.gloss,
    'Four rods of yew are cut. Does the raven show the destiny?',
  );
});

// Difficulty 3: opener OO6 addressing the door of the hollow hill, then the
// bare imperative with its direction word immediately behind it.
const OGHAM_CHRONOMANCY_SEED = 1152;

test('ogham fixture: the crossing of section 10.12', () => {
  const out = ogham('chronomancy', 3, OGHAM_CHRONOMANCY_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{169B}\u{1687}\u{1691}\u{168F}\u{1693}\u{1680}\u{1684}\u{1694}\u{1687}\u{1694}\u{1680}\u{1688}\u{1693}\u{1689}\u{1688}\u{1680}\u{1689}\u{1692}\u{1682}\u{1680}\u{1688}\u{168F}\u{1690}\u{1688}\u{1690}\u{1685}\u{169C}',
  );
  assert.strictEqual(
    out.transliteration,
    'dore sidi tect cul tratan',
  );
  assert.strictEqual(
    out.gloss,
    'O door of the hollow hill! Traverse backward the hour!',
  );
});

// Difficulty 5: the register, whose brand is the letter the language lost. The
// row runs backward, the epithets arrive whole, and the one drawn word shows
// both rules at once: tic drowns its bright vowel and stutters its final cut,
// coming out tucc.
const OGHAM_ELDRITCH_SEED = 629;

test('ogham fixture: the register of section 10.10', () => {
  const out = ogham('eldritch', 5, OGHAM_ELDRITCH_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{169B}\u{1694}\u{1680}\u{1693}\u{1680}\u{1692}\u{1680}\u{1691}\u{1680}\u{1690}\u{1680}\u{1688}\u{1686}\u{1692}\u{1682}\u{169A}\u{1680}\u{1688}\u{1692}\u{1689}\u{1689}\u{1680}\u{168C}\u{1691}\u{1682}\u{169A}\u{1680}\u{1689}\u{1691}\u{1682}\u{1682}\u{1680}\u{1688}\u{1693}\u{168B}\u{1693}\u{1682}\u{1682}\u{169C}',
  );
  assert.strictEqual(
    out.transliteration,
    'idad edad ur onn ailm thulp tucc golp coll temell',
  );
  assert.strictEqual(
    out.gloss,
    'The vowels, recited against their order! O sleeper below the ninth wave, come! Golp! Ruin in the dark.',
  );
});

test('ogham fixture: the sixth genome writes an object rather than a line', () => {
  const a = runic('protection', 5, SECTION5_SEED);
  const f = ogham('protection', 5, OGHAM_PROTECTION_SEED);
  // Five genomes write a line of text and this one writes a thing with two
  // ends: framed feather to feather, its words standing on one welded stem
  // (spec 10.13).
  assert.ok(f.glyphs.startsWith('\u{169B}'), 'ogham lost its opening feather');
  assert.ok(f.glyphs.endsWith('\u{169C}'), 'ogham lost its closing feather');
  // Its separator is Unicode whitespace, which no other genome writes, and its
  // presence is asserted by codepoint because nothing else would catch its
  // loss: a line missing it still reads plausibly.
  assert.ok(f.glyphs.includes('\u{1680}'), 'ogham lost its space mark');
  assert.strictEqual(
    Array.from(f.glyphs).filter((character) => character === '\u{1680}').length,
    f.transliteration.split(' ').length - 1,
    'a space mark went missing between two words',
  );
  // And the brand of its register is an absence here: no p stands anywhere in
  // a bright ogham formula, because the letter the language lost belongs to
  // the Eldritch school alone (spec 10.13).
  assert.ok(!f.glyphs.includes('\u{169A}'), 'peith reached a bright formula');
  assert.ok(!/[\u{16A0}-\u{16F8}]/u.test(f.glyphs), 'ogham leaked a runic codepoint');
  assert.notStrictEqual(a.glyphs, f.glyphs);
});

// --- The Norse layer of the Runic genome ------------------------------------
// The two worked examples of genomes.md 2.7, byte for byte. Unlike the
// divination and chronomancy examples of that section, these two were found by
// search and then pinned, so the spec and the generator agree letter for
// letter rather than only in shape.

// Difficulty 5: opening RO2 then RO5, one invocation clause on a fire agent,
// the world-axis released, closing RC1. The count and the axis in one breath,
// which is the whole of what the layer had to do.
const NORSE_RUNIC_D5_SEED = 18;

test('norse fixture: the count of the worlds and the axis that holds them', () => {
  const out = runic('invocation', 5, NORSE_RUNIC_D5_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{16D6}\u{16B2}\u{16EB}\u{16D6}\u{16B1}\u{16C1}\u{16DA}\u{16A8}\u{16C9}\u{16EB}\u{16BE}\u{16C1}\u{16A2}\u{16BE}\u{16EB}\u{16BA}\u{16A8}\u{16C1}\u{16D7}\u{16DF}\u{16C9}\u{16EB}\u{16D2}\u{16A8}\u{16D6}\u{16DA}\u{16A8}\u{16C9}\u{16EB}\u{16B2}\u{16A2}\u{16D7}\u{16EB}\u{16D6}\u{16B1}\u{16D7}\u{16C1}\u{16BE}\u{16A8}\u{16CA}\u{16A2}\u{16DA}\u{16EC}\u{16B1}\u{16A2}\u{16BE}\u{16DF}\u{16C9}\u{16EB}\u{16A0}\u{16A8}\u{16C1}\u{16BA}\u{16C1}\u{16DE}\u{16DF}',
  );
  assert.strictEqual(
    out.transliteration,
    'ek erilaz niun haimoz baelaz kum erminasul runoz faihido',
  );
  assert.strictEqual(
    out.gloss,
    'I, the rune-master! The nine worlds! O pyre, come! Erminasul, the pillar ' +
      'that holds all up! I painted these runes.',
  );
});

// Difficulty 8: full-row RO3 then RO5, three clauses of three agents, the last
// carrying an adverb, the triple laukaz, stacked closings, seal seven. The
// three released words descend the cosmology: the axis, the world under the
// mist, the covered place at the bottom of it.
const NORSE_RUNIC_D8_SEED = 47;

test('norse fixture: three clauses descend the layer', () => {
  const out = runic('invocation', 8, NORSE_RUNIC_D8_SEED);
  assert.strictEqual(
    out.transliteration,
    'futharkgwhnijeipzstbemlngdo niun haimoz morganaz menaz baelaz wek ' +
      'erminasul abandaz fornaz stundaz kum nibulahaimaz hrimaz abandaz rokaz ' +
      'dimo wek halja laukaz laukaz laukaz runoz faihido alu sebun',
  );
  assert.strictEqual(
    out.gloss,
    'The full row of the futhark! The nine worlds! O morrow, O moon, O pyre, ' +
      'wake! Erminasul, the pillar that holds all up! O evening of days, O ' +
      'ancient time, O hour, come! Nibulahaimaz, the world under the mist! O ' +
      'hoarfrost, O evening of days, O twilight, wake dimly! Halja, the ' +
      'covered place of the hidden dead! Laukaz, spoken three times. I painted ' +
      'these runes. Alu! Sealed seven times.',
  );
  assert.strictEqual(
    out.glyphs,
    '\u{16A0}\u{16A2}\u{16A6}\u{16A8}\u{16B1}\u{16B2}\u{16B7}\u{16B9}\u{16BA}\u{16BE}\u{16C1}\u{16C3}\u{16C7}\u{16C8}\u{16C9}\u{16CA}\u{16CF}\u{16D2}\u{16D6}\u{16D7}\u{16DA}\u{16DC}\u{16DE}\u{16DF}\u{16EB}\u{16BE}\u{16C1}\u{16A2}\u{16BE}\u{16EB}\u{16BA}\u{16A8}\u{16C1}\u{16D7}\u{16DF}\u{16C9}\u{16EB}\u{16D7}\u{16DF}\u{16B1}\u{16B7}\u{16A8}\u{16BE}\u{16A8}\u{16C9}\u{16EB}\u{16D7}\u{16D6}\u{16BE}\u{16A8}\u{16C9}\u{16EB}\u{16D2}\u{16A8}\u{16D6}\u{16DA}\u{16A8}\u{16C9}\u{16EB}\u{16B9}\u{16D6}\u{16B2}\u{16EB}\u{16D6}\u{16B1}\u{16D7}\u{16C1}\u{16BE}\u{16A8}\u{16CA}\u{16A2}\u{16DA}\u{16EC}\u{16A8}\u{16D2}\u{16A8}\u{16BE}\u{16DE}\u{16A8}\u{16C9}\u{16EB}\u{16A0}\u{16DF}\u{16B1}\u{16BE}\u{16A8}\u{16C9}\u{16EB}\u{16CA}\u{16CF}\u{16A2}\u{16BE}\u{16DE}\u{16A8}\u{16C9}\u{16EB}\u{16B2}\u{16A2}\u{16D7}\u{16EB}\u{16BE}\u{16C1}\u{16D2}\u{16A2}\u{16DA}\u{16A8}\u{16BA}\u{16A8}\u{16C1}\u{16D7}\u{16A8}\u{16C9}\u{16EC}\u{16BA}\u{16B1}\u{16C1}\u{16D7}\u{16A8}\u{16C9}\u{16EB}\u{16A8}\u{16D2}\u{16A8}\u{16BE}\u{16DE}\u{16A8}\u{16C9}\u{16EB}\u{16B1}\u{16DF}\u{16B2}\u{16A8}\u{16C9}\u{16EB}\u{16DE}\u{16C1}\u{16D7}\u{16DF}\u{16EB}\u{16B9}\u{16D6}\u{16B2}\u{16EB}\u{16BA}\u{16A8}\u{16DA}\u{16C3}\u{16A8}\u{16EC}\u{16DA}\u{16A8}\u{16A2}\u{16B2}\u{16A8}\u{16C9}\u{16EB}\u{16DA}\u{16A8}\u{16A2}\u{16B2}\u{16A8}\u{16C9}\u{16EB}\u{16DA}\u{16A8}\u{16A2}\u{16B2}\u{16A8}\u{16C9}\u{16EC}\u{16B1}\u{16A2}\u{16BE}\u{16DF}\u{16C9}\u{16EB}\u{16A0}\u{16A8}\u{16C1}\u{16BA}\u{16C1}\u{16DE}\u{16DF}\u{16EC}\u{16A8}\u{16DA}\u{16A2}\u{16ED}\u{1010D}\u{16ED}',
  );
});

// The worked example of genomes.md 3.7, byte for byte. The Coptic ruling
// poured one line and one name, and this is the smallest formula that shows
// both: the declaration at the head, Horus in it, and the address and the two
// in-agents drawn from what the declaration left behind.
const COPTIC_EGYPTIAN_D6_SEED = 1;

test('coptic fixture: the caster declares himself and the name is spent', () => {
  const out = egyptian('protection', 6, COPTIC_EGYPTIAN_D6_SEED);
  assert.strictEqual(
    out.glyphs,
    '\u{13193}\u{130A7}\u{13303}\u{131CB}\u{13216}\u{133A1}\u{1339B}\u{1308B}\u{132B9}\u{131CB}\u{13001}\u{1313F}\u{132F4}\u{133CF}\u{132B9}\u{1308B}\u{1340D}\u{133DB}\u{13000}\u{1308B}\u{13216}\u{133E4}\u{133A1}\u{1340D}\u{133CF}\u{13153}\u{132BD}\u{13000}\u{1308B}\u{132F4}\u{1320E}\u{1308B}\u{130A1}\u{131CB}\u{13216}\u{13193}\u{1339B}\u{13171}\u{133CF}\u{131CC}\u{132B9}\u{1308B}\u{1309D}\u{131F3}\u{132F4}\u{13216}\u{1339B}\u{132BD}\u{13000}\u{1308B}\u{1308B}\u{133A1}\u{1339B}\u{132AE}\u{131CB}\u{13216}\u{13193}\u{1339B}\u{13171}\u{133CF}\u{131CC}\u{132B9}\u{132F4}\u{1340D}\u{13153}\u{133CF}\u{132B9}\u{13153}\u{132F4}\u{1320E}\u{1308B}\u{130A1}\u{13419}\u{132A4}',
  );
  assert.strictEqual(
    out.transliteration,
    'djed medu inek hor i aset rekhi renek khetemi er seqer in djehuty ra ' +
      'senehi er rekeh in djehuty sekhmet em seqer maa kheru',
  );
  assert.strictEqual(
    out.gloss,
    'Recitation. I am Hor. O Aset, I know your name. I seal against the blow, ' +
      'by Djehuty. Ra! I fetter against the burning in the blow, by Djehuty. ' +
      'Sekhmet! True of voice.',
  );
});
