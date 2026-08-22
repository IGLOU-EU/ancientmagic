// Renders the social preview composition once per UI language, into .og-build
// for tools/og-images.sh to screenshot. The copy comes from src/strings, so an
// image and the page it belongs to quote one source.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderComposition, type PageStrings } from './render-page.js';

const SHARED_FILE = 'common.json';
const SUFFIX = '.json';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const templateFile = join(root, 'src', 'html', 'og-image.html');
const stringsDir = join(root, 'src', 'strings');
const outDir = join(root, '.og-build');

function readJson(file: string): PageStrings {
  return JSON.parse(readFileSync(file, 'utf8')) as PageStrings;
}

function renderCompositions(): void {
  const template = readFileSync(templateFile, 'utf8');
  const shared = readJson(join(stringsDir, SHARED_FILE));

  mkdirSync(outDir, { recursive: true });

  for (const file of readdirSync(stringsDir).sort()) {
    if (file === SHARED_FILE || !file.endsWith(SUFFIX)) continue;

    const name = file.slice(0, -SUFFIX.length);
    const page = renderComposition(template, shared, readJson(join(stringsDir, file)), name);
    writeFileSync(join(outDir, `${name}.html`), page);
  }
}

renderCompositions();
