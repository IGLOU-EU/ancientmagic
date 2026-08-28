// Writes one static page per UI language, so nothing has to be localized in the
// browser. The default language takes index.html, any other language is written
// as a flat sibling next to it.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderSite, sitemap } from './render-site.js';
import { readLanguages, readShared, REPO_ROOT } from './sources.js';

const DEFAULT_LANGUAGE = 'en';

const templateFile = join(REPO_ROOT, 'src', 'html', 'index.html');
const outDir = join(REPO_ROOT, 'pub');

async function buildPages(): Promise<void> {
  const template = readFileSync(templateFile, 'utf8');
  const shared = readShared();
  const languages = await readLanguages();

  for (const [file, page] of renderSite(template, shared, languages, DEFAULT_LANGUAGE)) {
    writeFileSync(join(outDir, file), page);
  }

  const siteUrl = shared['site.url'];
  if (siteUrl === undefined) throw new Error('common: no site.url');
  writeFileSync(join(outDir, 'sitemap.xml'), sitemap(languages, DEFAULT_LANGUAGE, siteUrl));
}

await buildPages();
