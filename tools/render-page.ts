// Renders the page template with one language's strings.
//
// Every mismatch between the template and a language file is raised, never
// patched. An edit that silently drops a string is exactly how a translation
// gets lost, so the build stops instead.

export type PageStrings = Readonly<Record<string, string>>;

// One language of the site: the name its file carries, and its page strings.
export interface LanguagePage {
  readonly name: string;
  readonly strings: PageStrings;
}

// A placeholder is a key between double braces. The grammar is deliberately
// narrow: anything looser stays untouched and is caught by the output check.
const PLACEHOLDER = /\{\{([A-Za-z0-9_.-]+)\}\}/g;

const OPENER = '{{';

// Where the site root lives, the base every page URL is measured from.
const SITE_URL = 'site.url';

// A language names itself, so no translator ever writes another language's
// name and the switcher of every other page picks this one up.
const LANGUAGE_NAME = 'lang.name';

const SHARED_LABEL = 'common';

const STRAIGHT_QUOTE = '"';
const STRAIGHT_APOSTROPHE = "'";

// The indent the template gives the switcher list, so a second alternate lines
// up under the first instead of hanging off the left margin.
const LIST_INDENT = '\n        ';

// Where the images the pages point at are published.
const MEDIA_DIR = 'media/';

// The line every share link carries, authored per language.
const SHARE_MESSAGE = 'share.message';

// The networks the site shares to, and the address each one documents for it.
// A sharing address holds nothing readable, so these are machine values like
// an option id: a translator has nothing to say about them, and they stay out
// of the strings files. What a language writes is the message and the name of
// each link.
//
// {url} is the page, {message} the authored line, {post} the two of them
// together, which is what a network expects when it offers a single field.
const SHARE_TARGETS: ReadonlyMap<string, string> = new Map([
  ['bluesky', 'https://bsky.app/intent/compose?text={post}'],
  ['facebook', 'https://www.facebook.com/sharer/sharer.php?u={url}'],
  ['x', 'https://x.com/intent/post?text={message}&url={url}'],
  ['linkedin', 'https://www.linkedin.com/sharing/share-offsite/?url={url}'],
  ['whatsapp', 'https://api.whatsapp.com/send?text={post}'],
  ['mail', 'mailto:?subject={message}&body={url}'],
]);

export const SHARE_NETWORKS: ReadonlyArray<string> = Array.from(SHARE_TARGETS.keys());

const SHARE_TOKEN = /\{([a-z]+)\}/gu;

function listed(keys: Iterable<string>): string {
  return Array.from(keys).sort().join(', ');
}

function placeholderKeys(template: string): Set<string> {
  const keys = new Set<string>();
  for (const match of template.matchAll(PLACEHOLDER)) keys.add(match[1]);
  return keys;
}

// Shared strings (URLs, the sample formula) are held once and layered under the
// language strings, so an invariant cannot drift from one language to the next.
export function mergeStrings(
  shared: PageStrings,
  language: PageStrings,
  label: string,
): PageStrings {
  const redefined = Object.keys(language).filter((key) => key in shared);
  if (redefined.length > 0) {
    throw new Error(`${label}: redefines shared strings: ${listed(redefined)}`);
  }
  return { ...shared, ...language };
}

export function renderPage(template: string, strings: PageStrings, label: string): string {
  const used = placeholderKeys(template);
  const known = new Set(Object.keys(strings));

  const missing = Array.from(used).filter((key) => !known.has(key));
  if (missing.length > 0) {
    throw new Error(`${label}: no string for the placeholders ${listed(missing)}`);
  }

  const unused = Array.from(known).filter((key) => !used.has(key));
  if (unused.length > 0) {
    throw new Error(`${label}: no placeholder uses the strings ${listed(unused)}`);
  }

  const page = template.replace(PLACEHOLDER, (_match, key: string) => strings[key]);

  const left = page.indexOf(OPENER);
  if (left >= 0) {
    throw new Error(`${label}: unresolved placeholder near "${page.slice(left, left + 40)}"`);
  }
  return page;
}

// The language name is the declaration the page carries, so no language file can
// state a language of its own and no two sources can fall out of sync.
export function renderLanguage(
  template: string,
  shared: PageStrings,
  language: PageStrings,
  name: string,
): string {
  const declared = mergeStrings(shared, { 'html.lang': name }, name);
  return renderPage(template, mergeStrings(declared, language, name), name);
}

// A composition places a few of the strings, not all of them: the social
// preview shows the wordmark, the promise and the transliteration. So the
// strings are narrowed to what it places, which drops the unused-key failure
// (meaningless for a partial view) and keeps the missing-key one, the failure
// that catches a language which never wrote its promise line.
export function renderComposition(
  template: string,
  shared: PageStrings,
  language: PageStrings,
  name: string,
): string {
  const declared = mergeStrings(shared, { 'html.lang': name }, name);
  const strings = mergeStrings(declared, language, name);
  const used = placeholderKeys(template);

  return renderPage(
    template,
    Object.fromEntries(Object.entries(strings).filter(([key]) => used.has(key))),
    name,
  );
}

// Values reach the page verbatim, there is no escaping pass, so a straight
// double quote inside one cuts an attribute short in plain sight and breaks the
// JSON-LD in silence. Typographic quotes and guillemets carry the meaning
// everywhere a value could want one.
export function assertTypographicQuotes(strings: PageStrings, label: string): void {
  const offenders = Object.keys(strings).filter((key) =>
    strings[key].includes(STRAIGHT_QUOTE),
  );
  if (offenders.length > 0) {
    throw new Error(
      `${label}: straight double quotes in ${listed(offenders)}, use typographic quotes`,
    );
  }
  // Harmless technically, but typography is a build concern by owner ruling.
  const apostrophes = Object.keys(strings).filter((key) =>
    strings[key].includes(STRAIGHT_APOSTROPHE),
  );
  if (apostrophes.length > 0) {
    throw new Error(
      `${label}: straight apostrophes in ${listed(apostrophes)}, use U+2019`,
    );
  }
}

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

// One share address per network, ready to be dropped into an href.
//
// The message is authored, the encoding is derived. A strings file never holds
// a percent-encoded value: it would be unreadable to the translator who has to
// write it, and it would carry its straight quotes and its apostrophes past
// the checks that read authored words.
export function shareLinks(message: string, url: string): PageStrings {
  const values: Readonly<Record<string, string>> = {
    url: encodeURIComponent(url),
    message: encodeURIComponent(message),
    post: encodeURIComponent(`${message} ${url}`),
  };

  const links: Record<string, string> = {};
  for (const [network, target] of SHARE_TARGETS) {
    links[`share.${network}.href`] = target
      .replace(SHARE_TOKEN, (_token, name: string) => {
        const value = values[name];
        if (value === undefined) {
          throw new Error(`share: ${network} asks for {${name}}, which a link does not carry`);
        }
        return value;
      })
      // The address lands in an attribute of a page inserted verbatim, and its
      // parameter separator is the one character HTML reads as its own.
      .replaceAll('&', '&amp;');
  }
  return links;
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
