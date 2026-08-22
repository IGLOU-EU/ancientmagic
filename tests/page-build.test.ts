// Contract of the page build tool. Every case here is a build failure on
// purpose: a substitution that fails quietly is how a translation gets lost.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertTypographicQuotes,
  mergeStrings,
  renderComposition,
  renderLanguage,
  renderPage,
  renderSite,
  type LanguagePage,
} from '../tools/render-page.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// A template small enough to read, carrying every value the site render
// derives, so a failure names the derivation rather than the real page.
const MINI = [
  '<html lang="{{html.lang}}">',
  '<link rel="canonical" href="{{page.url}}">',
  '{{page.alternates}}',
  '<link rel="alternate" hreflang="x-default" href="{{site.url}}">',
  '<meta property="og:image" content="{{page.ogImage}}">',
  '<p>{{lang.code}} {{lang.name}}</p>',
  '<ul>{{lang.links}}</ul>',
].join('\n');

const MINI_SHARED = { 'site.url': 'https://example.test/' };

const MINI_LANGUAGES: ReadonlyArray<LanguagePage> = [
  { name: 'en', strings: { 'lang.name': 'English' } },
  { name: 'fr', strings: { 'lang.name': 'Français' } },
];

function miniSite(): Map<string, string> {
  return renderSite(MINI, MINI_SHARED, MINI_LANGUAGES, 'en');
}

function read(...parts: string[]): string {
  return readFileSync(join(root, ...parts), 'utf8');
}

function readJson(...parts: string[]): Record<string, string> {
  return JSON.parse(read(...parts)) as Record<string, string>;
}

test('page build: substitutes every placeholder', () => {
  const page = renderPage('<h1>{{a}}</h1><p>{{b}} {{a}}</p>', { a: 'one', b: 'two' }, 'test');
  assert.strictEqual(page, '<h1>one</h1><p>two one</p>');
});

test('page build: a value is inserted verbatim, never re-scanned', () => {
  const page = renderPage('<p>{{a}}</p>', { a: '$& $1 <wbr>' }, 'test');
  assert.strictEqual(page, '<p>$& $1 <wbr></p>');
});

test('page build: fails on a key missing from the language file', () => {
  assert.throws(
    () => renderPage('<title>{{meta.title}}</title>', {}, 'test'),
    /meta\.title/,
  );
});

test('page build: fails on a key no placeholder uses', () => {
  assert.throws(
    () => renderPage('<title>{{meta.title}}</title>', { 'meta.title': 'x', 'meta.gone': 'y' }, 'test'),
    /meta\.gone/,
  );
});

test('page build: fails on a placeholder left unresolved in the output', () => {
  // A value that carries a placeholder of its own survives substitution, since
  // the replacement is never re-scanned. The output check is what catches it.
  assert.throws(
    () => renderPage('<p>{{a}}</p>', { a: 'see {{b}}' }, 'test'),
    /unresolved/,
  );
});

test('page build: fails on a placeholder the template misspells', () => {
  // Spaces put the token outside the placeholder grammar, so it is neither
  // collected nor substituted. It must not reach the page.
  assert.throws(() => renderPage('<p>{{ a }}</p>', {}, 'test'), /unresolved/);
});

test('page build: the error names the language it failed on', () => {
  assert.throws(() => renderPage('<p>{{a}}</p>', {}, 'fr'), /^Error: fr:/);
});

test('page build: shared strings merge into the language strings', () => {
  assert.deepStrictEqual(mergeStrings({ 'site.url': 'u' }, { 'meta.title': 't' }, 'test'), {
    'site.url': 'u',
    'meta.title': 't',
  });
});

test('page build: fails when a language file redefines a shared key', () => {
  assert.throws(
    () => mergeStrings({ 'site.url': 'u' }, { 'site.url': 'other' }, 'test'),
    /site\.url/,
  );
});

test('page build: the language declaration comes from the language name', () => {
  const page = renderLanguage('<html lang="{{html.lang}}">', {}, {}, 'fr');
  assert.strictEqual(page, '<html lang="fr">');
});

test('page build: a language file cannot redefine the language declaration', () => {
  assert.throws(
    () => renderLanguage('<html lang="{{html.lang}}">', {}, { 'html.lang': 'de' }, 'fr'),
    /html\.lang/,
  );
});

test('page build: the template carries no bare human-readable text', () => {
  const template = read('src', 'html', 'index.html');
  const body = template.slice(template.indexOf('<body>'));
  // Anything between tags must be a placeholder or nothing at all.
  for (const [, between] of body.matchAll(/>([^<>]+)</g)) {
    const rest = between.replace(/\{\{[A-Za-z0-9_.-]+\}\}/g, '').trim();
    assert.strictEqual(rest, '', `bare text in the template: ${JSON.stringify(between)}`);
  }
});

// ------------------------------------------------------- typographic quotes
// Values are inserted verbatim, so a straight double quote in one of them cuts
// an HTML attribute short in plain sight and breaks the JSON-LD in silence.

test('page build: fails on a straight double quote in a value', () => {
  assert.throws(
    () => assertTypographicQuotes({ 'meta.title': 'the "old" magic' }, 'en'),
    /^Error: en: .*meta\.title/,
  );
});

test('page build: names every value carrying a straight double quote', () => {
  assert.throws(
    () => assertTypographicQuotes({ a: '"x"', b: 'clean', c: 'y"' }, 'en'),
    /a, c/,
  );
});

// A straight apostrophe breaks nothing technically, only the typography rule.
// The owner ruled it mechanical: he never wants to proofread for it.
test('page build: fails on a straight apostrophe in a value', () => {
  assert.throws(
    () => assertTypographicQuotes({ 'footer.disclaimer': "l'ancienne magie" }, 'fr'),
    /^Error: fr: .*footer\.disclaimer.*U\+2019/,
  );
});

test('page build: names every value carrying a straight apostrophe', () => {
  assert.throws(
    () => assertTypographicQuotes({ a: "l'un", b: 'clean', c: "l'autre" }, 'fr'),
    /a, c/,
  );
});

test('page build: accepts typographic quotes, guillemets and apostrophes', () => {
  assert.doesNotThrow(() =>
    assertTypographicQuotes(
      { a: '“old” magic', b: '« la vieille magie »', c: 'l’Autel' },
      'fr',
    ),
  );
});

test('page build: accepts the markup a value is allowed to carry', () => {
  assert.doesNotThrow(() => assertTypographicQuotes({ 'sample.glyphs': 'ᚨᛚᚢ<wbr>ᚹᚨᚱ' }, 'en'));
});

test('page build: the site render rejects a straight double quote in a language file', () => {
  const languages = [{ name: 'en', strings: { 'lang.name': 'the "old" tongue' } }];
  assert.throws(() => renderSite(MINI, MINI_SHARED, languages, 'en'), /^Error: en: /);
});

test('page build: the site render rejects a straight double quote in the shared file', () => {
  assert.throws(
    () => renderSite(MINI, { ...MINI_SHARED, 'x.y': '"' }, MINI_LANGUAGES, 'en'),
    /^Error: common: /,
  );
});

// ---------------------------------------------------------- the site render

test('page build: the default language takes index.html, the others their own file', () => {
  assert.deepStrictEqual(Array.from(miniSite().keys()), ['index.html', 'fr.html']);
});

test('page build: the canonical of the default language is the site root', () => {
  const page = miniSite().get('index.html') ?? '';
  assert.match(page, /<link rel="canonical" href="https:\/\/example\.test\/">/);
});

test('page build: another language is canonical at its own page', () => {
  const page = miniSite().get('fr.html') ?? '';
  assert.match(page, /<link rel="canonical" href="https:\/\/example\.test\/fr\.html">/);
});

test('page build: the alternates cover every language and are the same on every page', () => {
  const site = miniSite();
  const block = [
    '<link rel="alternate" hreflang="en" href="https://example.test/">',
    '<link rel="alternate" hreflang="fr" href="https://example.test/fr.html">',
  ].join('\n');
  for (const page of site.values()) assert.ok(page.includes(block), page);
});

test('page build: the switcher lists the other languages, never the current one', () => {
  const site = miniSite();
  assert.match(site.get('index.html') ?? '', /<ul><li[^>]*><a[^>]*>Français<\/a><\/li><\/ul>/);
  assert.match(site.get('fr.html') ?? '', /<ul><li[^>]*><a[^>]*>English<\/a><\/li><\/ul>/);
});

test('page build: a switcher link points at the other page and declares its language', () => {
  const page = miniSite().get('index.html') ?? '';
  assert.match(page, /href="fr\.html" hreflang="fr" lang="fr"/);
});

test('page build: the switcher link of the default language points at index.html', () => {
  const page = miniSite().get('fr.html') ?? '';
  assert.match(page, /href="index\.html" hreflang="en" lang="en"/);
});

test('page build: every language points at a social preview of its own', () => {
  const site = miniSite();
  assert.match(site.get('index.html') ?? '', /content="https:\/\/example\.test\/media\/og-en\.png"/);
  assert.match(site.get('fr.html') ?? '', /content="https:\/\/example\.test\/media\/og-fr\.png"/);
});

test('page build: the collapsed code comes from the language name', () => {
  assert.match(miniSite().get('fr.html') ?? '', /<p>FR Français<\/p>/);
});

test('page build: fails when a language file declares no language name', () => {
  assert.throws(
    () => renderSite(MINI, MINI_SHARED, [{ name: 'en', strings: {} }], 'en'),
    /lang\.name/,
  );
});

test('page build: fails when the shared file declares no site url', () => {
  assert.throws(() => renderSite(MINI, {}, MINI_LANGUAGES, 'en'), /site\.url/);
});

// --------------------------------------------------------- the real pages

function site(): Map<string, string> {
  const stringsDir = join(root, 'src', 'strings');
  const languages = readdirSync(stringsDir)
    .sort()
    .filter((file) => file !== 'common.json' && file.endsWith('.json'))
    .map((file) => ({
      name: file.slice(0, -'.json'.length),
      strings: readJson('src', 'strings', file),
    }));
  return renderSite(
    read('src', 'html', 'index.html'),
    readJson('src', 'strings', 'common.json'),
    languages,
    'en',
  );
}

test('page build: every published page is what the template and its strings render', () => {
  const rendered = site();
  assert.ok(rendered.size >= 2, 'the site is down to a single language');
  for (const [file, page] of rendered) assert.strictEqual(page, read('pub', file), file);
});

test('page build: every language ships the social preview its page points at', () => {
  for (const page of site().values()) {
    const match = /<meta property="og:image" content="[^"]*\/media\/([^"/]+)">/.exec(page);
    assert.ok(match !== null, 'no og:image on a page');
    const image = match?.[1] ?? '';
    assert.doesNotThrow(() => read('pub', 'media', image), image);
  }
});

// ------------------------------------------------------- the og composition
// The social preview bakes the promise line in, so it is a translation surface
// like the page, and it fails the same way when a language falls behind.

function languageFiles(): string[] {
  return readdirSync(join(root, 'src', 'strings'))
    .sort()
    .filter((file) => file !== 'common.json' && file.endsWith('.json'));
}

test('og composition: renders for every language', () => {
  const template = read('src', 'html', 'og-image.html');
  const shared = readJson('src', 'strings', 'common.json');

  for (const file of languageFiles()) {
    const name = file.slice(0, -'.json'.length);
    const image = renderComposition(template, shared, readJson('src', 'strings', file), name);
    assert.ok(image.includes(`<html lang="${name}">`), name);
    assert.ok(!image.includes('{{'), `unresolved placeholder for ${name}`);
  }
});

test('og composition: the promise line is the one its page shows', () => {
  const template = read('src', 'html', 'og-image.html');
  const shared = readJson('src', 'strings', 'common.json');

  for (const file of languageFiles()) {
    const name = file.slice(0, -'.json'.length);
    const strings = readJson('src', 'strings', file);
    const image = renderComposition(template, shared, strings, name);
    assert.ok(image.includes(strings['header.promise']), name);
  }
});

test('og composition: the glyph run is the sample formula, break hints aside', () => {
  // The composition breaks the run with a <br> tuned to its 1200x630 canvas
  // while the page leaves soft <wbr> hints. The glyphs themselves must not
  // drift apart, so they are compared with both kinds of hint stripped.
  const template = read('src', 'html', 'og-image.html');
  const expected = readJson('src', 'strings', 'common.json')['sample.glyphs'].replaceAll(
    '<wbr>',
    '',
  );

  const runs = Array.from(template.matchAll(/<p class="glyph-line[^"]*"[^>]*>(.*?)<\/p>/gs));
  assert.strictEqual(runs.length, 2, 'the composition lost its vapor twin');
  for (const [, run] of runs) assert.strictEqual(run.replaceAll('<br>', ''), expected);
});
