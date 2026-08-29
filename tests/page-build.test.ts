// Contract of the page build tool. Every case here is a build failure on
// purpose: a substitution that fails quietly is how a translation gets lost.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MAX_DIFFICULTY, MIN_DIFFICULTY } from '../src/ts/generator/pipeline.js';
import { LANGUAGES, SCHOOLS } from '../src/ts/generator/types.js';
import { en } from '../src/ts/strings/en.js';
import { fr } from '../src/ts/strings/fr.js';
import { difficultyTier } from '../src/ts/strings/index.js';
import {
  assertTypographicQuotes,
  mergeStrings,
  renderComposition,
  renderLanguage,
  renderPage,
} from '../tools/render-page.js';
import { renderSite, sitemap, type LanguagePage } from '../tools/render-site.js';
import { shareLinks, SHARE_NETWORKS } from '../tools/share-targets.js';
import { readLanguages, readShared, REPO_ROOT } from '../tools/sources.js';

// The share row of the mini template, built from the network set instead of
// spelled out, so adding a network is one edit in the tool and none here.
const MINI_SHARE = SHARE_NETWORKS.map(
  (network) => `<a href="{{share.${network}.href}}">{{share.${network}.label}}</a>`,
).join('\n');

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
  '<select><option>{{language.runic}}</option><option>{{school.protection}}</option></select>',
  '<p>{{difficulty.initialValue}} {{difficulty.initialTier}}</p>',
  '<input aria-valuetext="{{difficulty.initialValueText}}">',
  '<p aria-label="{{sample.glyphLabel}}">{{print.caption}}</p>',
  MINI_SHARE,
].join('\n');

const MINI_SHARED = { 'site.url': 'https://example.test/' };

const MINI_MESSAGE = 'Pronounce it.';

// What a language has to write for its share links: the line they carry, and
// the name each one answers to.
function shareStrings(): Record<string, string> {
  const strings: Record<string, string> = { 'share.message': MINI_MESSAGE };
  for (const network of SHARE_NETWORKS) {
    strings[`share.${network}.label`] = `Share on ${network}`;
  }
  return strings;
}

// What the composed readouts are made of: the level the altar opens on, and the
// names of the genome and the school the served sample was written in.
const SAMPLE_STRINGS: Readonly<Record<string, string>> = {
  'difficulty.initialValue': '5',
  'language.runic': 'Runic',
  'school.protection': 'Protection',
};

const MINI_LANGUAGES: ReadonlyArray<LanguagePage> = [
  { name: 'en', strings: { 'lang.name': 'English', ...SAMPLE_STRINGS, ...shareStrings() }, ui: en },
  {
    name: 'fr',
    strings: { 'lang.name': 'Français', ...SAMPLE_STRINGS, ...shareStrings() },
    ui: fr,
  },
];

function miniSite(): Map<string, string> {
  return renderSite(MINI, MINI_SHARED, MINI_LANGUAGES, 'en');
}

function read(...parts: string[]): string {
  return readFileSync(join(REPO_ROOT, ...parts), 'utf8');
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

// ------------------------------------------------------------------ the altar
// The altar is the only way to a formula, so what it offers has to be what the
// generator declares. An option nothing realizes is a dead control, a genome or
// a school with no option of its own is unreachable, and neither shows.

// One select's options, in the order the template lists them, each with the
// mark that says whether a reader can choose it.
function options(template: string, selectId: string): Array<{ value: string; live: boolean }> {
  const select = new RegExp(`<select[^>]*id="${selectId}"[^>]*>(.*?)</select>`, 's').exec(
    template,
  );
  assert.ok(select !== null, `no ${selectId} select in the template`);
  return Array.from(select?.[1].matchAll(/<option value="([^"]+)"([^>]*)>/g) ?? [], (match) => ({
    value: match[1],
    live: !match[2].includes('disabled'),
  }));
}

test('page build: the language select offers every genome that ships, and offers no other', () => {
  const offered = options(read('src', 'html', 'index.html'), 'language');
  const live = offered.filter((option) => option.live).map((option) => option.value);
  assert.deepStrictEqual(live.sort(), [...LANGUAGES].sort());
});

test('page build: a genome still to come is offered disabled, never selectable', () => {
  for (const option of options(read('src', 'html', 'index.html'), 'language')) {
    const shipped = [...LANGUAGES].some((id) => id === option.value);
    assert.strictEqual(option.live, shipped, `${option.value} is offered against its state`);
  }
});

// The two tests above hold whether an option can be chosen. They say nothing
// about what it is called, and the two are edited in different files: the
// template disables the option, a strings file names it "(soon)". Shipping a
// genome means undoing both, and forgetting the second offers a playable
// option that still calls itself unfinished. Nothing caught that until here.
//
// The rule reads the mark rather than the word, so it holds in every page
// language without knowing what any of them writes for "soon". No script in
// the inventory is named with a parenthesis, so a trailing one can only be
// that mark.
test('page build: a shipped genome is named without the mark of one still to come', () => {
  const files = readdirSync(join(REPO_ROOT, 'src', 'strings')).filter(
    (name) => name.endsWith('.json') && name !== 'common.json',
  );
  assert.ok(files.length > 0, 'no page strings to check');

  for (const file of files) {
    const strings: Record<string, string> = JSON.parse(read('src', 'strings', file));
    for (const [key, label] of Object.entries(strings)) {
      if (!key.startsWith('language.')) continue;
      const id = key.slice('language.'.length);
      const shipped = [...LANGUAGES].some((language) => language === id);
      const marked = label.trimEnd().endsWith(')');
      assert.strictEqual(
        marked,
        !shipped,
        shipped
          ? `${file} still calls the shipped ${id} "${label}"`
          : `${file} offers ${id} as ready when no genome ships it`,
      );
    }
  }
});

test('page build: the school select offers every school the site teaches', () => {
  const offered = options(read('src', 'html', 'index.html'), 'school');
  assert.deepStrictEqual(
    offered.map((option) => option.value).sort(),
    [...SCHOOLS].sort(),
  );
  for (const option of offered) assert.ok(option.live, `${option.value} cannot be chosen`);
});

test('page build: the power slider spans the tiers the pipeline reads, one tick each', () => {
  const template = read('src', 'html', 'index.html');
  const slider = /<input class="slider"[^>]*>/.exec(template)?.[0] ?? '';
  assert.match(slider, new RegExp(`\\bmin="${MIN_DIFFICULTY}"`), slider);
  assert.match(slider, new RegExp(`\\bmax="${MAX_DIFFICULTY}"`), slider);
  assert.strictEqual(
    (template.match(/<span class="tick[^"]*"><\/span>/g) ?? []).length,
    MAX_DIFFICULTY - MIN_DIFFICULTY + 1,
    'the tick row no longer marks one tier each',
  );
});

// -------------------------------------------------- the first-paint skeleton
// The head restates a few stylesheet values so a cold load opens on the dark
// page instead of the white canvas, before the stylesheet has landed. A
// restatement drifting from what it restates is a flash of the wrong colour on
// every first visit, so each one is read here against the token it copies.

// A value written in a Sass partial, read where it is declared rather than
// transcribed, so moving the token moves what the head is held to.
function token(file: string, pattern: RegExp): string {
  const match = pattern.exec(read('src', 'scss', file));
  assert.ok(match !== null, `no match for ${pattern} in ${file}`);
  return (match?.[1] ?? '').toLowerCase();
}

function head(): string {
  const template = read('src', 'html', 'index.html');
  return template.slice(0, template.indexOf('</head>'));
}

function skeleton(): string {
  return /<style>(.*?)<\/style>/s.exec(head())?.[1] ?? '';
}

// The value the head restates, read out of the markup that restates it.
function restated(source: string, pattern: RegExp): string {
  return (pattern.exec(source)?.[1] ?? '').toLowerCase();
}

test('first paint: the skeleton paints the surface the stylesheet paints', () => {
  assert.strictEqual(
    restated(skeleton(), /background-color:\s*(#[0-9A-Fa-f]{6})/),
    token('_tokens.scss', /^\$surface:\s*(#[0-9A-Fa-f]{6});/m),
  );
});

test('first paint: the skeleton caps the column where the stylesheet caps it', () => {
  assert.strictEqual(
    restated(skeleton(), /max-width:\s*(\d+px)/),
    token('_base.scss', /\.page \{[^}]*?max-width:\s*(\d+px);/s),
  );
});

// The browser paints the theme colour around the page before the page exists,
// so it answers to the darkest token rather than to the surface one.
test('first paint: the theme colour is the void the page sits in', () => {
  assert.strictEqual(
    restated(head(), /<meta name="theme-color" content="(#[0-9A-Fa-f]{6})">/),
    token('_tokens.scss', /^\$void:\s*(#[0-9A-Fa-f]{6});/m),
  );
});

// A media query adds no specificity, so from below the stylesheet the skeleton
// would outrank the print rule that drops the column cap.
test('first paint: the skeleton is served above the stylesheet it precedes', () => {
  const above = head();
  assert.ok(above.indexOf('<style>') < above.indexOf('<link rel="stylesheet"'), above);
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
  const languages = [
    { name: 'en', strings: { 'lang.name': 'the "old" tongue', ...shareStrings() }, ui: en },
  ];
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
  const languages = [{ name: 'en', strings: { ...SAMPLE_STRINGS, ...shareStrings() }, ui: en }];
  assert.throws(() => renderSite(MINI, MINI_SHARED, languages, 'en'), /lang\.name/);
});

test('page build: fails when the shared file declares no site url', () => {
  assert.throws(() => renderSite(MINI, {}, MINI_LANGUAGES, 'en'), /site\.url/);
});

// -------------------------------------------------- the pre-rendered readouts
// The page is served with its power readout, its glyph label and its print
// caption already written, so a cold load reads before any script runs. The
// script then writes those same lines again. They are composed here from the
// module that will recompute them, which is what makes the wording one wording
// rather than two copies of it.

test('page build: the served readouts are the ones the script recomputes', () => {
  const page = miniSite().get('fr.html') ?? '';
  const value = Number(SAMPLE_STRINGS['difficulty.initialValue']);
  const genome = SAMPLE_STRINGS['language.runic'];
  const school = SAMPLE_STRINGS['school.protection'];
  const tier = difficultyTier(fr, value);

  assert.ok(page.includes(`<p>${value} ${tier}</p>`), page);
  assert.ok(page.includes(`aria-valuetext="${fr.difficultyValueText(value, tier)}"`), page);
  assert.ok(page.includes(`aria-label="${fr.glyphLineLabel(genome)}"`), page);
  assert.ok(page.includes(fr.printCaption(genome, school, value)), page);
});

// Each page reads the tier of its own level of power, so a language shipping a
// different opening level is served the tier that level names.
test('page build: the served tier follows the level of power the page opens on', () => {
  const strings = { ...SAMPLE_STRINGS, 'difficulty.initialValue': '9' };
  const languages = [
    { name: 'en', strings: { 'lang.name': 'English', ...strings, ...shareStrings() }, ui: en },
  ];
  const page = renderSite(MINI, MINI_SHARED, languages, 'en').get('index.html') ?? '';
  assert.ok(page.includes(`<p>9 ${en.difficultyTiers.peak}</p>`), page);
});

test('page build: fails when a language file states no level of power', () => {
  const strings = { 'lang.name': 'English', ...shareStrings() };
  const languages = [{ name: 'en', strings, ui: en }];
  assert.throws(
    () => renderSite(MINI, MINI_SHARED, languages, 'en'),
    /difficulty\.initialValue/,
  );
});

test('page build: fails when a language file states a level of power that is not one', () => {
  const strings = { ...SAMPLE_STRINGS, 'difficulty.initialValue': 'five' };
  const languages = [
    { name: 'en', strings: { 'lang.name': 'English', ...strings, ...shareStrings() }, ui: en },
  ];
  assert.throws(() => renderSite(MINI, MINI_SHARED, languages, 'en'), /whole level of power/);
});

// The composed readouts have one home, and it is not the strings file. A
// language writing one of them back is the duplication returning, so it fails
// the build rather than quietly outranking what the script will say.
test('page build: fails when a language file writes a readout the build composes', () => {
  for (const key of ['difficulty.initialTier', 'sample.glyphLabel', 'print.caption']) {
    const strings = { 'lang.name': 'English', ...SAMPLE_STRINGS, ...shareStrings(), [key]: 'x' };
    const languages = [{ name: 'en', strings, ui: en }];
    assert.throws(
      () => renderSite(MINI, MINI_SHARED, languages, 'en'),
      new RegExp(key.replace('.', '\\.')),
      key,
    );
  }
});

// -------------------------------------------------------------- share links
// A sharing address holds nothing readable, so the networks and their url
// shapes are machine values like an option id and live in the tool. What a
// language authors is the line its links carry. Putting that line into an
// address is percent-encoding, which is derivation work: a strings file that
// held an encoded value would be unreadable to a translator and would slip
// straight past the quote checks.

test('share links: one link per network, none missing and none invented', () => {
  assert.deepStrictEqual(
    Object.keys(shareLinks(MINI_MESSAGE, 'https://example.test/')).sort(),
    SHARE_NETWORKS.map((network) => `share.${network}.href`).sort(),
  );
});

test('share links: the page address travels percent-encoded', () => {
  const links = shareLinks(MINI_MESSAGE, 'https://example.test/fr.html');
  assert.strictEqual(
    links['share.facebook.href'],
    'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.test%2Ffr.html',
  );
});

test('share links: a network with one text field takes the line and the address together', () => {
  const links = shareLinks(MINI_MESSAGE, 'https://example.test/');
  assert.strictEqual(
    links['share.bluesky.href'],
    'https://bsky.app/intent/compose?text=Pronounce%20it.%20https%3A%2F%2Fexample.test%2F',
  );
});

test('share links: the authored line is encoded by the derivation, never by hand', () => {
  const links = shareLinks('L’incantation, dite « ainsi »', 'https://example.test/');
  const href = links['share.mail.href'] ?? '';
  assert.match(href, /^mailto:\?subject=L%E2%80%99incantation%2C%20dite%20%C2%AB%20ainsi%20%C2%BB/);
  assert.doesNotMatch(href, /[ «’]/, 'a character left raw in an address');
});

test('share links: the parameter separator is written for the attribute it lands in', () => {
  // Values reach the page verbatim, there is no escaping pass, so a bare
  // ampersand in an href would hand the parser a character reference to guess.
  const links = shareLinks(MINI_MESSAGE, 'https://example.test/');
  for (const href of Object.values(links)) assert.doesNotMatch(href, /&(?!amp;)/, href);
  assert.match(links['share.x.href'] ?? '', /&amp;url=/);
});

test('page build: every page seals its own address into its share links', () => {
  const site = miniSite();
  assert.match(site.get('index.html') ?? '', /u=https%3A%2F%2Fexample\.test%2F"/);
  assert.match(site.get('fr.html') ?? '', /u=https%3A%2F%2Fexample\.test%2Ffr\.html"/);
});

test('page build: the share message reaches the page inside the links, never as text', () => {
  const page = miniSite().get('index.html') ?? '';
  assert.ok(!page.includes(MINI_MESSAGE), 'the share message is on the page as readable text');
  assert.ok(page.includes(encodeURIComponent(MINI_MESSAGE)), 'no link carries the share message');
});

test('page build: fails when a language writes no share message', () => {
  const languages = [{ name: 'en', strings: { 'lang.name': 'English', ...SAMPLE_STRINGS }, ui: en }];
  assert.throws(() => renderSite(MINI, MINI_SHARED, languages, 'en'), /share\.message/);
});

test('page build: the page ships a link for every network the tool knows', () => {
  const template = read('src', 'html', 'index.html');
  for (const network of SHARE_NETWORKS) {
    assert.ok(template.includes(`{{share.${network}.href}}`), `no ${network} link on the page`);
    assert.ok(template.includes(`{{share.${network}.label}}`), `the ${network} link has no name`);
  }
});

// ------------------------------------------------------------------ sitemap
// Hand-maintained before, so it would have rotted at the third language. Now
// derived from the language set like everything else, and loc-only so the
// build output is byte-stable (no lastmod churn in git).

test('sitemap: lists the root for the default language and flat files for the rest', () => {
  const xml = sitemap(MINI_LANGUAGES, 'en', 'https://example.test/');
  assert.match(xml, /<loc>https:\/\/example\.test\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/example\.test\/fr\.html<\/loc>/);
});

test('sitemap: one url per language and nothing volatile', () => {
  const xml = sitemap(MINI_LANGUAGES, 'en', 'https://example.test/');
  assert.strictEqual([...xml.matchAll(/<url>/g)].length, MINI_LANGUAGES.length);
  assert.doesNotMatch(xml, /lastmod|changefreq|priority/);
});

// --------------------------------------------------------- the real pages

async function site(): Promise<Map<string, string>> {
  return renderSite(read('src', 'html', 'index.html'), readShared(), await readLanguages(), 'en');
}

test('page build: every published page is what the template and its strings render', async () => {
  const rendered = await site();
  assert.ok(rendered.size >= 2, 'the site is down to a single language');
  for (const [file, page] of rendered) assert.strictEqual(page, read('pub', file), file);
});

test('page build: the published sitemap is what the language set derives', async () => {
  assert.strictEqual(
    read('pub', 'sitemap.xml'),
    sitemap(await readLanguages(), 'en', readShared()['site.url'] ?? ''),
  );
});

test('page build: every language ships the social preview its page points at', async () => {
  for (const page of (await site()).values()) {
    const match = /<meta property="og:image" content="[^"]*\/media\/([^"/]+)">/.exec(page);
    assert.ok(match !== null, 'no og:image on a page');
    const image = match?.[1] ?? '';
    assert.doesNotThrow(() => read('pub', 'media', image), image);
  }
});

// The Emanation belongs to a conjuration. Served open it would show every
// arrival a formula nobody asked for, with a reroll that replays nothing and a
// copy that hands over the sample. The attribute is what the served page
// carries, and the conjuration flow is the only thing that lifts it. The text
// underneath is untouched: it is still what a crawler reads and what the
// pre-rendered equality tests hold to the replay of its own link.
test('page build: every page serves the Emanation hidden, sample and all', async () => {
  const glyphs = readShared()['sample.glyphs'];

  for (const page of (await site()).values()) {
    const tag = /<section class="manifestation"[^>]*>/.exec(page)?.[0] ?? '';
    assert.match(tag, /\bhidden\b/, tag);
    assert.ok(page.includes(glyphs), 'the served sample left the document');
  }
});

// An icon carries no name, so each link states its own, and the drawing is
// hidden from anything that reads. Both are what makes the row usable without
// the icons ever being recognized, and neither is visible on screen.
test('page build: every share link names itself and hides its icon', async () => {
  for (const page of (await site()).values()) {
    const row = /<div class="share-row">(.*?)<\/div>/s.exec(page)?.[1] ?? '';
    const links = Array.from(row.matchAll(/<a\b[^>]*>/g));
    assert.strictEqual(links.length, SHARE_NETWORKS.length, 'the share row lost a link');
    for (const [tag] of links) assert.match(tag, /aria-label="[^"]+"/, tag);
    assert.strictEqual(
      (row.match(/aria-hidden="true"/g) ?? []).length,
      SHARE_NETWORKS.length,
      'an icon is exposed to a reader',
    );
  }
});

// ------------------------------------------------------- the og composition
// The social preview bakes the promise line in, so it is a translation surface
// like the page, and it fails the same way when a language falls behind.

test('og composition: renders for every language', async () => {
  const template = read('src', 'html', 'og-image.html');
  const shared = readShared();

  for (const { name, strings } of await readLanguages()) {
    const image = renderComposition(template, shared, strings, name);
    assert.ok(image.includes(`<html lang="${name}">`), name);
    assert.ok(!image.includes('{{'), `unresolved placeholder for ${name}`);
  }
});

test('og composition: the promise line is the one its page shows', async () => {
  const template = read('src', 'html', 'og-image.html');
  const shared = readShared();

  for (const { name, strings } of await readLanguages()) {
    const image = renderComposition(template, shared, strings, name);
    assert.ok(image.includes(strings['header.promise']), name);
  }
});

test('og composition: the glyph run is the sample formula, break hints aside', () => {
  // The composition breaks the run with a <br> tuned to its 1200x630 canvas
  // while the page leaves soft <wbr> hints. The glyphs themselves must not
  // drift apart, so they are compared with both kinds of hint stripped.
  const template = read('src', 'html', 'og-image.html');
  const expected = readShared()['sample.glyphs'].replaceAll('<wbr>', '');

  const runs = Array.from(template.matchAll(/<p class="glyph-line[^"]*"[^>]*>(.*?)<\/p>/gs));
  assert.strictEqual(runs.length, 2, 'the composition lost its vapor twin');
  for (const [, run] of runs) assert.strictEqual(run.replaceAll('<br>', ''), expected);
});
