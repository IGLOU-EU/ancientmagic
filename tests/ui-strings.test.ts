// The runtime strings, and the seam between them and the page.
//
// The page ships a pre-rendered difficulty readout, glyph label and print
// caption so a cold load reads correctly before any script runs. The runtime
// then recomputes the same text. These tests hold the two sides equal, so the
// duplication the pre-rendering forces cannot drift in silence.
//
// The sweep runs every registered language against its own page strings, so a
// translation is checked the moment it is registered, without a test edit.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/ts/strings/en.js';
import { fr } from '../src/ts/strings/fr.js';
import { resolveStrings, UI_STRINGS } from '../src/ts/strings/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function pageStrings(language: string): Record<string, string> {
  return JSON.parse(
    readFileSync(join(root, 'src', 'strings', `${language}.json`), 'utf8'),
  ) as Record<string, string>;
}

test('strings: a language tag resolves to its strings', () => {
  assert.strictEqual(resolveStrings('en'), en);
  assert.strictEqual(resolveStrings('fr'), fr);
});

test('strings: a regional tag resolves to its base language', () => {
  assert.strictEqual(resolveStrings('en-GB'), en);
  assert.strictEqual(resolveStrings('fr-CA'), fr);
});

test('strings: an unknown tag falls back to the default language', () => {
  assert.strictEqual(resolveStrings('zz'), en);
  assert.strictEqual(resolveStrings(''), en);
});

test('strings: more than one language is registered', () => {
  assert.ok(UI_STRINGS.size >= 2, 'the site is down to a single language');
});

for (const [language, strings] of UI_STRINGS) {
  const page = pageStrings(language);

  test(`strings (${language}): the tiers cover the whole difficulty range`, () => {
    const tiers = Object.values(strings.difficultyTiers);
    assert.strictEqual(tiers.length, 4);
    assert.strictEqual(new Set(tiers).size, 4, 'two tiers share a word');
    for (const tier of tiers) assert.ok(tier.length > 0);
  });

  test(`strings (${language}): the runtime tier matches the one the page ships`, () => {
    assert.strictEqual(strings.difficultyTiers.mid, page['difficulty.initialTier']);
  });

  test(`strings (${language}): the runtime slider text matches the one the page ships`, () => {
    assert.strictEqual(
      strings.difficultyValueText(
        Number(page['difficulty.initialValue']),
        strings.difficultyTiers.mid,
      ),
      page['difficulty.initialValueText'],
    );
  });

  test(`strings (${language}): the runtime glyph label matches the one the page ships`, () => {
    assert.strictEqual(strings.glyphLineLabel(page['language.runic']), page['sample.glyphLabel']);
  });

  test(`strings (${language}): the runtime print caption matches the one the page ships`, () => {
    assert.strictEqual(
      strings.printCaption(
        page['language.runic'],
        page['school.protection'],
        Number(page['difficulty.initialValue']),
      ),
      page['print.caption'],
    );
  });
}
