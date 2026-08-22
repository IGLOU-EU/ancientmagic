// Renders the page template with one language's strings.
//
// Every mismatch between the template and a language file is raised, never
// patched. An edit that silently drops a string is exactly how a translation
// gets lost, so the build stops instead.

export type PageStrings = Readonly<Record<string, string>>;

// A placeholder is a key between double braces. The grammar is deliberately
// narrow: anything looser stays untouched and is caught by the output check.
const PLACEHOLDER = /\{\{([A-Za-z0-9_.-]+)\}\}/g;

const OPENER = '{{';

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
