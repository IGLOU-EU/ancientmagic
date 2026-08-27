// Renders the whole site, and derives what each page knows about the others.
//
// Where a page sits (its address, its file name, its social preview, its
// alternates, its switcher and the sitemap) is a fact about the language set,
// never something a translator writes. Stating such a fact twice is stating a
// fact that drifts, so every one of them is derived here.

import {
  assertTypographicQuotes,
  mergeStrings,
  renderLanguage,
  type PageStrings,
} from './render-page.js';
import { shareLinks } from './share-targets.js';

// One language of the site: the name its file carries, and its page strings.
export interface LanguagePage {
  readonly name: string;
  readonly strings: PageStrings;
}

// Where the site root lives, the base every page URL is measured from.
const SITE_URL = 'site.url';

// A language names itself, so no translator ever writes another language's
// name and the switcher of every other page picks this one up.
const LANGUAGE_NAME = 'lang.name';

const SHARED_LABEL = 'common';

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

function languageName(page: LanguagePage): string {
  const name = page.strings[LANGUAGE_NAME];
  if (name === undefined) {
    throw new Error(`${page.name}: no ${LANGUAGE_NAME}, the name the other pages link it by`);
  }
  return name;
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
    const message = page.strings[SHARE_MESSAGE];
    if (message === undefined) {
      throw new Error(`${page.name}: no ${SHARE_MESSAGE}, the line its share links carry`);
    }

    // Derived, never authored: every one of these is a fact about where the
    // page sits in the site, and a fact stated twice is a fact that drifts.
    // A share address is the same kind of fact, once the line is written.
    const derived: PageStrings = {
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
