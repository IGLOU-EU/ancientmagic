// The runtime strings, and the seam between them and the page.
//
// The page ships a pre-rendered difficulty readout, glyph label and print
// caption so a cold load reads correctly before any script runs. The runtime
// then recomputes the same text. These tests hold the two sides equal, so the
// duplication the pre-rendering forces cannot drift in silence.
//
// The sweep runs every registered language against its own page strings,
// awaiting its loader, so a translation is checked the moment it is
// registered, without a test edit.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from '../src/ts/generator/pipeline.js';
import { resolveGlosses } from '../src/ts/glosses/index.js';
import { runicGenome } from '../src/ts/languages/runic.js';
import { en } from '../src/ts/strings/en.js';
import { fr } from '../src/ts/strings/fr.js';
import { resolveStrings, UI_STRINGS } from '../src/ts/strings/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// The seed behind the sample formula the page ships, pinned in tests/fixture.
const SAMPLE_SEED = 66238;

function pageStrings(name: string): Record<string, string> {
  return JSON.parse(
    readFileSync(join(root, 'src', 'strings', `${name}.json`), 'utf8'),
  ) as Record<string, string>;
}

test('strings: a language tag resolves to its strings', async () => {
  assert.strictEqual(await resolveStrings('en'), en);
  assert.strictEqual(await resolveStrings('fr'), fr);
});

test('strings: a regional tag resolves to its base language', async () => {
  assert.strictEqual(await resolveStrings('en-GB'), en);
  assert.strictEqual(await resolveStrings('fr-CA'), fr);
});

test('strings: an unknown tag falls back to the default language', async () => {
  assert.strictEqual(await resolveStrings('zz'), en);
  assert.strictEqual(await resolveStrings(''), en);
});

// Lazy loading must not turn one language into two objects: every route to a
// language has to end on the module the page would have imported statically.
test('strings: every route to a language reaches the same module', async () => {
  assert.strictEqual(await resolveStrings('fr'), await resolveStrings('fr-BE'));
  assert.strictEqual(await resolveStrings('zz'), await resolveStrings('en'));
});

test('strings: more than one language is registered', () => {
  assert.ok(UI_STRINGS.size >= 2, 'the site is down to a single language');
});

// The sample formula is one output of one seed. Its glyphs and its
// transliteration are the same in every language, so they stay shared; its
// gloss is written by whichever pack the language resolves to, so it cannot be.
test('strings: the sample glyph and translit lines stay shared, the gloss does not', () => {
  const shared = pageStrings('common');
  assert.ok('sample.glyphs' in shared, 'the sample glyphs left the shared file');
  assert.ok(
    'sample.transliteration' in shared,
    'the sample transliteration left the shared file',
  );
  assert.ok(
    !('sample.gloss' in shared),
    'the sample gloss is shared, so one language would show another one’s pack',
  );
});

for (const [language, loadStrings] of UI_STRINGS) {
  const page = pageStrings(language);

  test(`strings (${language}): the tiers cover the whole difficulty range`, async () => {
    const strings = await loadStrings();
    const tiers = Object.values(strings.difficultyTiers);
    assert.strictEqual(tiers.length, 4);
    assert.strictEqual(new Set(tiers).size, 4, 'two tiers share a word');
    for (const tier of tiers) assert.ok(tier.length > 0);
  });

  test(`strings (${language}): the runtime tier matches the one the page ships`, async () => {
    const strings = await loadStrings();
    assert.strictEqual(strings.difficultyTiers.mid, page['difficulty.initialTier']);
  });

  test(`strings (${language}): the runtime slider text matches the one the page ships`, async () => {
    const strings = await loadStrings();
    assert.strictEqual(
      strings.difficultyValueText(
        Number(page['difficulty.initialValue']),
        strings.difficultyTiers.mid,
      ),
      page['difficulty.initialValueText'],
    );
  });

  test(`strings (${language}): the sample gloss is this language’s own pack`, async () => {
    assert.strictEqual(
      generate(
        runicGenome,
        { language: 'runic', school: 'protection', difficulty: 5 },
        SAMPLE_SEED,
        await resolveGlosses(language),
      ).gloss,
      page['sample.gloss'],
    );
  });

  test(`strings (${language}): the runtime glyph label matches the one the page ships`, async () => {
    const strings = await loadStrings();
    assert.strictEqual(strings.glyphLineLabel(page['language.runic']), page['sample.glyphLabel']);
  });

  test(`strings (${language}): the runtime print caption matches the one the page ships`, async () => {
    const strings = await loadStrings();
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
