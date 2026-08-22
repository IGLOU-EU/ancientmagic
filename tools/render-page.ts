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

// The indent the template gives the switcher list, so a second alternate lines
// up under the first instead of hanging off the left margin.
const LIST_INDENT = '\n        ';

// Where the images the pages point at are published.
const MEDIA_DIR = 'media/';

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
}

// The default language is served at the site root, so its file name only ever
// shows up in a relative link, never in a canonical or an alternate.
export function pageFile(name: string, defaultLanguage: string): string {
  return name === defaultLanguage ? 'index.html' : `${name}.html`;
}

function pageUrl(name: string, defaultLanguage: string, siteUrl: string): string {
  return name === defaultLanguage ? siteUrl : `${siteUrl}${pageFile(name, defaultLanguage)}`;
}

// One social preview per language, since the image bakes the promise line in.
// The default language takes no privilege here: every page names its own file,
// so the set of images is the set of languages with nothing to remember.
export function ogImageFile(name: string): string {
  return `og-${name}.png`;
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

    // Derived, never authored: every one of these is a fact about where the
    // page sits in the site, and a fact stated twice is a fact that drifts.
    const derived: PageStrings = {
      'page.url': pageUrl(page.name, defaultLanguage, siteUrl),
      'page.ogImage': `${siteUrl}${MEDIA_DIR}${ogImageFile(page.name)}`,
      'page.alternates': alternates,
      'lang.code': page.name.toUpperCase(),
      'lang.links': languageLinks(languages, page.name, defaultLanguage),
    };

    pages.set(
      pageFile(page.name, defaultLanguage),
      renderLanguage(
        template,
        mergeStrings(shared, derived, page.name),
        page.strings,
        page.name,
      ),
    );
  }

  return pages;
}
