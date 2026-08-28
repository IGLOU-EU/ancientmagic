// The entry module, run against a page.
//
// Everything below the entry is pure and swept elsewhere. What lives only here
// is the wiring: one conjuration at a time whoever asks, an arrival replayed
// through that same one flow, and a page left exactly as served when a link
// says nothing. None of the three can be stated without a page, so they are
// stated on the one tests/dom.ts builds, and the entry module is loaded on it
// the way a browser loads it.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { generate } from '../src/ts/generator/pipeline.js';
import type { FormulaOutput, Settings } from '../src/ts/generator/types.js';
import { resolveGlosses } from '../src/ts/glosses/index.js';
import { greekGenome } from '../src/ts/languages/greek.js';
import { bindGenome } from '../src/ts/languages/index.js';
import { en } from '../src/ts/strings/en.js';
import { difficultyTier } from '../src/ts/strings/index.js';
import { breakSegments } from '../src/ts/ui/manifestation.js';
import { FakeInputElement, installPage, settle, until, type Page } from './dom.js';

const ADDRESS = 'https://example.test/';

// A formula the served page is not already showing: a different script, a
// different school and a different level of power, so what the altar and the
// well hold afterwards can only have come from the link.
const ARRIVAL = '#greek.curse.9.4242';
const ARRIVED: Settings = { language: 'greek', school: 'curse', difficulty: 9 };

// A module is loaded once per process, and each case needs the entry module as
// a browser meets it: on a page nothing has run against yet.
let instances = 0;
async function loadEntry(): Promise<void> {
  instances += 1;
  const specifier = `../src/ts/main.js?case=${instances}`;
  await import(specifier);
}

async function greek(settings: Settings, seed: number): Promise<FormulaOutput> {
  const glosses = await (await resolveGlosses('en')).greek();
  return generate(bindGenome(greekGenome, glosses), settings, seed);
}

function hrefs(page: Page): string[] {
  return page.findAll('.share-link').map((link) => link.getAttribute('href') ?? '');
}

function glyphLineNodes(page: Page): string[] {
  return page
    .byId('glyph-line')
    .nodes.map((node) => (typeof node === 'string' ? node : node.tagName));
}

// What a reader does to the level of power, which the browser reports as one
// input event per value it lands on.
function moveSlider(page: Page, value: string): void {
  const slider = page.byId('difficulty');
  if (!(slider instanceof FakeInputElement)) throw new Error('the page double has no slider');
  slider.value = value;
  slider.dispatch('input');
}

test('entry: an idle page shows the level of power it was served with', async () => {
  const page = installPage();
  await loadEntry();
  await settle();

  assert.strictEqual(page.byId('difficulty-tier').textContent, difficultyTier(en, 5));
  assert.strictEqual(page.byId('difficulty-value').textContent, '5');
  assert.strictEqual(page.find('.manifestation').hidden, true, 'the well opened with no formula');
  assert.deepStrictEqual(page.written, [], 'an idle page named a formula in the address');
});

// Everything the level of power shows moves with the slider, in the same
// breath as the reader's own gesture: the number, the tier, the fill of the
// track, what a screen reader is told, and the mark under the thumb.
test('entry: moving the slider rewrites everything the level of power shows', async () => {
  const page = installPage();
  await loadEntry();
  await settle();

  moveSlider(page, '8');

  const tier = difficultyTier(en, 8);
  const slider = page.byId('difficulty');
  assert.strictEqual(page.byId('difficulty-value').textContent, '8');
  assert.strictEqual(page.byId('difficulty-tier').textContent, tier);
  assert.strictEqual(slider.style.properties.get('--fill-ratio'), '0.8750');
  assert.strictEqual(slider.getAttribute('aria-valuetext'), en.difficultyValueText(8, tier));
  assert.ok(
    page.byId('difficulty-ticks').children[7].classes.has('tick--current'),
    'the mark stayed where the thumb no longer is',
  );
});

// A level of power the page is already showing is nothing to show again, and
// writing it anyway would restyle the track and the ticks for no change.
test('entry: a level of power the page already shows is not written again', async () => {
  const page = installPage();
  await loadEntry();
  await settle();

  const valueOut = page.byId('difficulty-value');
  valueOut.textContent = 'left alone';
  moveSlider(page, '5');

  assert.strictEqual(valueOut.textContent, 'left alone');
});

// The guard the loading contract rests on: the first click has modules to
// fetch, and the well is one atomic live region, so a second click during that
// wait would write and announce a second formula over the first.
test('entry: a second conjuration during the first is refused', async () => {
  const page = installPage();
  await loadEntry();

  page.click('generate');
  page.click('generate');

  await until(() => page.written.length > 0, 'the first conjuration');
  await settle();

  assert.strictEqual(page.written.length, 1, 'two clicks wrote two formulas');
  assert.notStrictEqual(page.byId('glyph-line').textContent, 'served glyphs');
});

// And it lets go: the guard is a queue of one, not a door that shuts.
test('entry: a conjuration after the first one lands is granted', async () => {
  const page = installPage();
  await loadEntry();

  page.click('generate');
  await until(() => page.written.length > 0, 'the first conjuration');
  await settle();

  page.click('generate');
  await until(() => page.written.length > 1, 'the second conjuration');

  assert.strictEqual(page.written.length, 2);
});

// Restarting an animation costs one reading of the page's geometry, and the
// well restarts four of them at once. They share that one reading: the whole
// strike is taken down, the page is read, and the whole strike is put back.
test('entry: a conjuration reads the page once, whatever it has to replay', async () => {
  const page = installPage();
  await loadEntry();

  page.click('generate');
  await until(() => page.written.length > 0, 'the conjuration');
  await settle();

  assert.strictEqual(page.reflows(), 1, 'the strike was replayed one element at a time');
  assert.strictEqual(page.byId('glyph-line').style.animation, '', 'the formula never re-armed');
  assert.strictEqual(page.find('.well-stage').getAttribute('data-forge'), 'struck');
});

// An arrival is the click's flow with the seed already chosen, so everything a
// click leaves behind has to be there: the altar set to what the link names,
// the well opened and written, the address rewritten, the share row sealed.
test('entry: a link is replayed into the altar, the well, the address and the row', async () => {
  const page = installPage({ hash: ARRIVAL, canonical: ADDRESS });
  await loadEntry();
  await until(() => page.written.length > 0, 'the arriving formula');

  const formula = await greek(ARRIVED, 4242);

  assert.strictEqual(page.chosen('language'), 'greek');
  assert.strictEqual(page.chosen('school'), 'curse');
  assert.strictEqual(page.byId('difficulty-value').textContent, '9');
  assert.strictEqual(page.byId('difficulty-tier').textContent, difficultyTier(en, 9));
  assert.ok(
    page.byId('difficulty-ticks').children[8].classes.has('tick--current'),
    'the ticks still mark the level the page was served with',
  );

  assert.strictEqual(page.find('.manifestation').hidden, false, 'the well stayed shut');
  assert.strictEqual(page.byId('glyph-line').textContent, formula.glyphs);
  assert.strictEqual(page.find('.translit').textContent, formula.transliteration);
  assert.strictEqual(page.find('.gloss').textContent, formula.gloss);
  assert.strictEqual(
    page.byId('glyph-line').getAttribute('aria-label'),
    en.glyphLineLabel('Greek'),
  );
  assert.strictEqual(page.byId('output').getAttribute('data-script'), 'greek');
  assert.strictEqual(
    page.find('.print-caption').textContent,
    en.printCaption('Greek', 'Curse', 9),
  );

  // The break hints ride with the run: one wbr between two segments, and the
  // text between them is the pipeline's own output, unchanged.
  const segments = breakSegments(formula.glyphs, greekGenome.separators);
  assert.deepStrictEqual(
    glyphLineNodes(page),
    segments.flatMap((segment, index) => (index === 0 ? [segment] : ['wbr', segment])),
  );

  assert.deepStrictEqual(page.written, [ARRIVAL]);
  for (const href of hrefs(page)) {
    assert.ok(
      href.includes(encodeURIComponent(`${ADDRESS}${ARRIVAL}`)),
      `the row still hands over the bare page in ${href}`,
    );
  }
});

// The link's settings become the ones a reroll replays, which is the other
// half of "an arrival is a click": the reader who lands on a formula can turn
// it over without touching the altar first.
test('entry: a reroll after an arrival rerolls what the link named', async () => {
  const page = installPage({ hash: ARRIVAL, canonical: ADDRESS });
  await loadEntry();
  await until(() => page.written.length > 0, 'the arriving formula');
  await settle();

  page.click('reroll');
  await until(() => page.written.length > 1, 'the reroll');

  assert.match(page.written[1], /^#greek\.curse\.9\.\d+$/u);
  assert.notStrictEqual(page.written[1], page.written[0], 'the reroll drew the same seed again');
});

// A fragment that is not a formula is somebody else's link, or a typo. The
// page anyone else gets is the page it stays.
test('entry: a fragment that names no formula changes nothing at all', async () => {
  const page = installPage({ hash: '#not-a-formula', canonical: ADDRESS });
  const served = hrefs(page);
  await loadEntry();
  await settle();

  assert.deepStrictEqual(page.written, [], 'a fragment nobody can read named a formula');
  assert.strictEqual(page.find('.manifestation').hidden, true, 'the well opened on nothing');
  assert.strictEqual(page.byId('glyph-line').textContent, 'served glyphs');
  assert.strictEqual(page.chosen('language'), 'runic', 'the altar moved');
  assert.deepStrictEqual(hrefs(page), served);
});
