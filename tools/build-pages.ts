// Writes one static page per UI language, so nothing has to be localized in the
// browser. The default language takes index.html, any other language is written
// as a flat sibling next to it.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite, type LanguagePage, type PageStrings } from './render-page.js';

const DEFAULT_LANGUAGE = 'en';
const SHARED_FILE = 'common.json';
const SUFFIX = '.json';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const templateFile = join(root, 'src', 'html', 'index.html');
const stringsDir = join(root, 'src', 'strings');
const outDir = join(root, 'pub');

function readJson(file: string): PageStrings {
  return JSON.parse(readFileSync(file, 'utf8')) as PageStrings;
}

// The strings directory is the register of languages. A file appearing there is
// a language of the site, listed by every other page's switcher and by every
// page's alternates, with no second place to remember to edit.
function readLanguages(): LanguagePage[] {
  return readdirSync(stringsDir)
    .sort()
    .filter((file) => file !== SHARED_FILE && file.endsWith(SUFFIX))
    .map((file) => ({
      name: file.slice(0, -SUFFIX.length),
      strings: readJson(join(stringsDir, file)),
    }));
}

function buildPages(): void {
  const template = readFileSync(templateFile, 'utf8');
  const shared = readJson(join(stringsDir, SHARED_FILE));

  for (const [file, page] of renderSite(template, shared, readLanguages(), DEFAULT_LANGUAGE)) {
    writeFileSync(join(outDir, file), page);
  }
}

buildPages();
