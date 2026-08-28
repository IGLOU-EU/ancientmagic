// Renders the whole site, and derives everything a page is not authored with.
//
// Where a page sits (its address, its file name, its social preview, its
// alternates, its switcher and the sitemap) is a fact about the language set,
// never something a translator writes. What the page is served already
// reading (its power tier, its glyph label, its print caption) is a
// composition of words the script itself holds. Stating either of them twice
// is stating something that drifts, so both are derived here.

import { difficultyTier } from '../src/ts/strings/index.js';
import type { UiStrings } from '../src/ts/strings/types.js';
import {
  assertTypographicQuotes,
  mergeStrings,
  renderLanguage,
  type PageStrings,
} from './render-page.js';
import { shareLinks } from './share-targets.js';

// One language of the site: the name its file carries, the strings its page is
// written with, and the words its script speaks once the page is live.
export interface LanguagePage {
  readonly name: string;
  readonly strings: PageStrings;
  readonly ui: UiStrings;
}

// Where the site root lives, the base every page URL is measured from.
const SITE_URL = 'site.url';

// A language names itself, so no translator ever writes another language's
// name and the switcher of every other page picks this one up.
const LANGUAGE_NAME = 'lang.name';

const SHARED_LABEL = 'common';

// The level of power the altar opens on, which is the one the served sample
// was written at.
const INITIAL_VALUE = 'difficulty.initialValue';

// The page is served with one conjuration already written, and the lines that
// describe it name its genome and its school. Which formula that is belongs to
// the build, the way the sharing addresses do: nothing here is a word anyone
// authors, only the two labels the composed lines quote.
const SAMPLE_LANGUAGE = 'language.runic';
const SAMPLE_SCHOOL = 'school.protection';

// The indent the template gives the switcher list, so a second alternate lines
// up under the first instead of hanging off the left margin.
const LIST_INDENT = '\n        ';

// Where the images the pages point at are published.
const MEDIA_DIR = 'media/';

// The line every share link carries, authored per language.
const SHARE_MESSAGE = 'share.message';

// The default language is served at the site root, so its file name only ever
// shows up in a relative link, never in a canonical or an alternate.
export function pageFile(name: string, defaultLanguage: string): string {
  return name === defaultLanguage ? 'index.html' : `${name}.html`;
}

function pageUrl(name: string, defaultLanguage: string, siteUrl: string): string {
  return name === defaultLanguage ? siteUrl : `${siteUrl}${pageFile(name, defaultLanguage)}`;
}

// Derived from the language set like the selector and the alternates, and
// loc-only: anything volatile (lastmod) would dirty the versioned build on
// every run without informing a crawler of anything real.
export function sitemap(
  languages: ReadonlyArray<LanguagePage>,
  defaultLanguage: string,
  siteUrl: string,
): string {
  const urls = languages
    .map((page) => `  <url><loc>${pageUrl(page.name, defaultLanguage, siteUrl)}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// One social preview per language, since the image bakes the promise line in.
// The default language takes no privilege here: every page names its own file,
// so the set of images is the set of languages with nothing to remember.
export function ogImageFile(name: string): string {
  return `og-${name}.png`;
}

// The message reaches the page inside the addresses the links carry, never as
// text of its own, so it leaves the set before the render asks which
// placeholder uses it.
function without(strings: PageStrings, key: string): PageStrings {
  const rest: Record<string, string> = { ...strings };
  delete rest[key];
  return rest;
}

// A string the render needs from a language file, named with the role it plays
// so the failure tells the author what is missing rather than which key.
function stringOf(page: LanguagePage, key: string, role: string): string {
  const value = page.strings[key];
  if (value === undefined) throw new Error(`${page.name}: no ${key}, ${role}`);
  return value;
}

function languageName(page: LanguagePage): string {
  return stringOf(page, LANGUAGE_NAME, 'the name the other pages link it by');
}

// The readouts the page is served with, composed here from the very module
// that recomputes them once the script runs: the tier of the opening level of
// power and its spoken value, the name of the glyph block, the print caption.
// Composed rather than authored, so a wording exists once instead of once per
// side of the build, and the served page can never word a line one way and the
// first slider move another.
function preRendered(page: LanguagePage): PageStrings {
  const value = Number(stringOf(page, INITIAL_VALUE, 'the level of power the altar opens on'));
  if (!Number.isInteger(value)) {
    throw new Error(`${page.name}: ${INITIAL_VALUE} is not a whole level of power`);
  }

  const genome = stringOf(page, SAMPLE_LANGUAGE, 'the genome the served sample is written in');
  const school = stringOf(page, SAMPLE_SCHOOL, 'the school the served sample belongs to');
  const tier = difficultyTier(page.ui, value);

  return {
    'difficulty.initialTier': tier,
    'difficulty.initialValueText': page.ui.difficultyValueText(value, tier),
    'sample.glyphLabel': page.ui.glyphLineLabel(genome),
    'print.caption': page.ui.printCaption(genome, school, value),
  };
}

// The whole set of languages, so search engines are told about every
// translation from every page rather than from the default one only.
export function alternateLinks(
  languages: ReadonlyArray<LanguagePage>,
  defaultLanguage: string,
  siteUrl: string,
): string {
  return languages
    .map(
      (page) =>
        `<link rel="alternate" hreflang="${page.name}" href="${pageUrl(page.name, defaultLanguage, siteUrl)}">`,
    )
    .join('\n');
}

// The switcher offers what the reader is not already reading. Each entry is a
// plain link to a static page, named in its own language and declaring it, so
// the list needs neither script nor a translator's guess at a foreign endonym.
export function languageLinks(
  languages: ReadonlyArray<LanguagePage>,
  current: string,
  defaultLanguage: string,
): string {
  return languages
    .filter((page) => page.name !== current)
    .map(
      (page) =>
        `<li><a class="lang-link" href="${pageFile(page.name, defaultLanguage)}" hreflang="${page.name}" lang="${page.name}">${languageName(page)}</a></li>`,
    )
    .join(LIST_INDENT);
}

// Renders every language of the site in one pass, keyed by the file each page
// is published as. One pass is what lets a page know about the others: the
// alternates and the switcher are derived from the whole set, so adding a
// language file is the only edit adding a language takes.
export function renderSite(
  template: string,
  shared: PageStrings,
  languages: ReadonlyArray<LanguagePage>,
  defaultLanguage: string,
): Map<string, string> {
  assertTypographicQuotes(shared, SHARED_LABEL);

  const siteUrl = shared[SITE_URL];
  if (siteUrl === undefined) throw new Error(`${SHARED_LABEL}: no ${SITE_URL}`);

  const alternates = alternateLinks(languages, defaultLanguage, siteUrl);
  const pages = new Map<string, string>();

  for (const page of languages) {
    assertTypographicQuotes(page.strings, page.name);

    const url = pageUrl(page.name, defaultLanguage, siteUrl);
    const message = stringOf(page, SHARE_MESSAGE, 'the line its share links carry');

    // The composed lines are words a reader sees, so they answer to the
    // typography rule like the authored ones, wherever they were written.
    const composed = preRendered(page);
    assertTypographicQuotes(composed, page.name);

    // Derived, never authored: every one of these is a fact about where the
    // page sits in the site, and a fact stated twice is a fact that drifts.
    // A share address is the same kind of fact, once the line is written, and
    // so is a line the script will write again from the same words.
    const derived: PageStrings = {
      ...composed,
      'page.url': url,
      'page.ogImage': `${siteUrl}${MEDIA_DIR}${ogImageFile(page.name)}`,
      'page.alternates': alternates,
      'lang.code': page.name.toUpperCase(),
      'lang.links': languageLinks(languages, page.name, defaultLanguage),
      ...shareLinks(message, url),
    };

    pages.set(
      pageFile(page.name, defaultLanguage),
      renderLanguage(
        template,
        mergeStrings(shared, derived, page.name),
        without(page.strings, SHARE_MESSAGE),
        page.name,
      ),
    );
  }

  return pages;
}
