import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
  tokenizeRunic,
  runesFor,
  nounForm,
  verbForm,
  adjectiveForm,
  adverbForm,
} from '../src/ts/languages/runic.js';
import { RUNE_TABLE } from './spec.js';

test('rune table: every token maps to the spec codepoint', () => {
  for (const [token, glyph] of RUNE_TABLE) {
    assert.strictEqual(runesFor(token), glyph, `token ${token}`);
  }
});

test('tokenizer: greedy digraphs across the full futhark row', () => {
  assert.deepStrictEqual(tokenizeRunic('futharkgwhnijeipzstbemlngdo'), [
    'f', 'u', 'th', 'a', 'r', 'k', 'g', 'w', 'h', 'n', 'i', 'j',
    'ei', 'p', 'z', 's', 't', 'b', 'e', 'm', 'l', 'ng', 'd', 'o',
  ]);
  assert.deepStrictEqual(tokenizeRunic('withra'), ['w', 'i', 'th', 'r', 'a']);
  assert.deepStrictEqual(tokenizeRunic('odnglmebtszpeijinhwgkrathuf'), [
    'o', 'd', 'ng', 'l', 'm', 'e', 'b', 't', 's', 'z', 'p', 'ei',
    'j', 'i', 'n', 'h', 'w', 'g', 'k', 'r', 'a', 'th', 'u', 'f',
  ]);
});

test('tokenizer: rejects letters outside the futhark romanization', () => {
  assert.throws(() => tokenizeRunic('cat'));
  assert.throws(() => tokenizeRunic('vex'));
  assert.throws(() => tokenizeRunic('a b'));
});

test('glyph rendering: full row and reversed row match the spec strings', () => {
  assert.strictEqual(
    runesFor('futharkgwhnijeipzstbemlngdo'),
    '\u{16A0}\u{16A2}\u{16A6}\u{16A8}\u{16B1}\u{16B2}\u{16B7}\u{16B9}\u{16BA}\u{16BE}\u{16C1}\u{16C3}\u{16C7}\u{16C8}\u{16C9}\u{16CA}\u{16CF}\u{16D2}\u{16D6}\u{16D7}\u{16DA}\u{16DC}\u{16DE}\u{16DF}',
  );
  assert.strictEqual(
    runesFor('odnglmebtszpeijinhwgkrathuf'),
    '\u{16DF}\u{16DE}\u{16DC}\u{16DA}\u{16D7}\u{16D6}\u{16D2}\u{16CF}\u{16CA}\u{16C9}\u{16C8}\u{16C7}\u{16C3}\u{16C1}\u{16BE}\u{16BA}\u{16B9}\u{16B7}\u{16B2}\u{16B1}\u{16A8}\u{16A6}\u{16A2}\u{16A0}',
  );
});

test('glyph rendering: doubles collapse in glyphs, not in romanization', () => {
  // spann + -an keeps nn in the transliteration but carves a single naudiz.
  assert.strictEqual(nounForm('spann', 'an'), 'spannan');
  assert.strictEqual(runesFor('spannan'), '\u{16CA}\u{16C8}\u{16A8}\u{16BE}\u{16A8}\u{16BE}');
});

test('glyph rendering: section 5 sample words', () => {
  assert.strictEqual(runesFor('alu'), '\u{16A8}\u{16DA}\u{16A2}');
  assert.strictEqual(runesFor('wardaz'), '\u{16B9}\u{16A8}\u{16B1}\u{16DE}\u{16A8}\u{16C9}');
  assert.strictEqual(runesFor('withra'), '\u{16B9}\u{16C1}\u{16A6}\u{16B1}\u{16A8}');
  assert.strictEqual(runesFor('thursan'), '\u{16A6}\u{16A2}\u{16B1}\u{16CA}\u{16A8}\u{16BE}');
  assert.strictEqual(runesFor('bindo'), '\u{16D2}\u{16C1}\u{16BE}\u{16DE}\u{16DF}');
  assert.strictEqual(runesFor('runoz'), '\u{16B1}\u{16A2}\u{16BE}\u{16DF}\u{16C9}');
  assert.strictEqual(runesFor('faihido'), '\u{16A0}\u{16A8}\u{16C1}\u{16BA}\u{16C1}\u{16DE}\u{16DF}');
  assert.strictEqual(runesFor('erilaz'), '\u{16D6}\u{16B1}\u{16C1}\u{16DA}\u{16A8}\u{16C9}');
  assert.strictEqual(runesFor('tawido'), '\u{16CF}\u{16A8}\u{16B9}\u{16C1}\u{16DE}\u{16DF}');
  assert.strictEqual(runesFor('gnagido'), '\u{16B7}\u{16BE}\u{16A8}\u{16B7}\u{16C1}\u{16DE}\u{16DF}');
});

test('morphology: noun endings per the spec paradigm', () => {
  assert.strictEqual(nounForm('ward', 'az'), 'wardaz');
  assert.strictEqual(nounForm('thurs', 'an'), 'thursan');
  assert.strictEqual(nounForm('run', 'oz'), 'runoz');
  assert.strictEqual(nounForm('naht', 'as'), 'nahtas');
  // The spec's dative example is mene, so a stem-final vowel elides before a
  // vowel-initial ending.
  assert.strictEqual(nounForm('mena', 'e'), 'mene');
  assert.strictEqual(nounForm('mena', 'an'), 'menan');
});

test('morphology: verb forms per the spec paradigm', () => {
  assert.strictEqual(verbForm('bind', 'o'), 'bindo');
  assert.strictEqual(verbForm('bind', 'ith'), 'bindith');
  assert.strictEqual(verbForm('bind', 'bare'), 'bind');
  assert.strictEqual(verbForm('bind', 'ai'), 'bindai');
  assert.strictEqual(verbForm('faih', 'ido'), 'faihido');
});

test('morphology: adjective copies the noun ending, adverb takes -o', () => {
  assert.strictEqual(adjectiveForm('derk', 'an'), 'derkan');
  assert.strictEqual(adjectiveForm('derk', 'az'), 'derkaz');
  assert.strictEqual(adverbForm('mirk'), 'mirko');
});
