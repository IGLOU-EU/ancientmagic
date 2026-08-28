// Renders the social preview composition once per UI language, into .og-build
// for tools/og-images.sh to screenshot. The copy comes from src/strings, so an
// image and the page it belongs to quote one source.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderComposition } from './render-page.js';
import { readLanguages, readShared, REPO_ROOT } from './sources.js';

const templateFile = join(REPO_ROOT, 'src', 'html', 'og-image.html');
const outDir = join(REPO_ROOT, '.og-build');

async function renderCompositions(): Promise<void> {
  const template = readFileSync(templateFile, 'utf8');
  const shared = readShared();

  mkdirSync(outDir, { recursive: true });

  for (const { name, strings } of await readLanguages()) {
    writeFileSync(
      join(outDir, `${name}.html`),
      renderComposition(template, shared, strings, name),
    );
  }
}

await renderCompositions();
