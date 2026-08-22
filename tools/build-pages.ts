// Writes one static page per UI language, so nothing has to be localized in the
// browser. The default language takes index.html, any other language is written
// as a flat sibling next to it.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLanguage, type PageStrings } from './render-page.js';

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

function buildPages(): void {
  const template = readFileSync(templateFile, 'utf8');
  const shared = readJson(join(stringsDir, SHARED_FILE));

  for (const file of readdirSync(stringsDir).sort()) {
    if (file === SHARED_FILE || !file.endsWith(SUFFIX)) continue;

    const name = file.slice(0, -SUFFIX.length);
    const page = renderLanguage(template, shared, readJson(join(stringsDir, file)), name);
    writeFileSync(join(outDir, name === DEFAULT_LANGUAGE ? 'index.html' : `${name}.html`), page);
  }
}

buildPages();
