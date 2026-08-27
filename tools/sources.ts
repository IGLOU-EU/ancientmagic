// Where the site's sources sit on disk, for the tools that build from them and
// the tests that check what they produced.
//
// Every compiled module lands two directories under the repo root, since both
// build outputs keep the source tree's shape, so the climb back is the same
// from a tool and from a test.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PageStrings } from './render-page.js';
import type { LanguagePage } from './render-site.js';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// The file every page states the same way, which is why it names no language.
const SHARED = 'common';
const SUFFIX = '.json';

const stringsDir = join(REPO_ROOT, 'src', 'strings');

export function readStrings(name: string): PageStrings {
  return JSON.parse(readFileSync(join(stringsDir, `${name}${SUFFIX}`), 'utf8')) as PageStrings;
}

export function readShared(): PageStrings {
  return readStrings(SHARED);
}

// The strings directory is the register of languages. A file appearing there is
// a language of the site, listed by every other page's switcher and by every
// page's alternates, with no second place to remember to edit.
export function languageNames(): string[] {
  return readdirSync(stringsDir)
    .sort()
    .filter((file) => file !== `${SHARED}${SUFFIX}` && file.endsWith(SUFFIX))
    .map((file) => file.slice(0, -SUFFIX.length));
}

export function readLanguages(): LanguagePage[] {
  return languageNames().map((name) => ({ name, strings: readStrings(name) }));
}
