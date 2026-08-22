// The runtime strings, and the seam between them and the page.
//
// The page ships a pre-rendered difficulty readout, glyph label and print
// caption so a cold load reads correctly before any script runs. The runtime
// then recomputes the same text. These tests hold the two sides equal, so the
// duplication the pre-rendering forces cannot drift in silence.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/ts/strings/en.js';
import { resolveStrings } from '../src/ts/strings/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const page = JSON.parse(
  readFileSync(join(root, 'src', 'strings', 'en.json'), 'utf8'),
) as Record<string, string>;

test('strings: a language tag resolves to its strings', () => {
  assert.strictEqual(resolveStrings('en'), en);
});

test('strings: a regional tag resolves to its base language', () => {
  assert.strictEqual(resolveStrings('en-GB'), en);
});

test('strings: an unknown tag falls back to the default language', () => {
  assert.strictEqual(resolveStrings('zz'), en);
  assert.strictEqual(resolveStrings(''), en);
});

test('strings: the tiers cover the whole difficulty range', () => {
  const tiers = Object.values(en.difficultyTiers);
  assert.strictEqual(tiers.length, 4);
  assert.strictEqual(new Set(tiers).size, 4, 'two tiers share a word');
  for (const tier of tiers) assert.ok(tier.length > 0);
});

test('strings: the runtime tier matches the one the page ships', () => {
  assert.strictEqual(en.difficultyTiers.mid, page['difficulty.initialTier']);
});

test('strings: the runtime slider text matches the one the page ships', () => {
  assert.strictEqual(
    en.difficultyValueText(Number(page['difficulty.initialValue']), en.difficultyTiers.mid),
    page['difficulty.initialValueText'],
  );
});

test('strings: the runtime glyph label matches the one the page ships', () => {
  assert.strictEqual(en.glyphLineLabel(page['language.runic']), page['sample.glyphLabel']);
});

test('strings: the runtime print caption matches the one the page ships', () => {
  assert.strictEqual(
    en.printCaption(
      page['language.runic'],
      page['school.protection'],
      Number(page['difficulty.initialValue']),
    ),
    page['print.caption'],
  );
});
