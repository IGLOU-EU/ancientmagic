// Compresses the compiled JS in pub/js the way sass compresses the CSS: the
// same files, smaller. Silent on success, like the other build tools.
//
// File for file, in place. The loading contract counts requests (docs/i18n.md),
// and a bundler would break it, so nothing here concatenates, splits or moves a
// module. Every import specifier, static and dynamic, comes out as it went in.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jsRoot = join(root, 'pub', 'js');

for (const entry of readdirSync(jsRoot, { recursive: true })) {
  if (!entry.endsWith('.js')) continue;

  const file = join(jsRoot, entry);
  const result = await minify(readFileSync(file, 'utf8'), {
    // ES module semantics: the output stays a module, and terser knows an
    // exported binding is read from outside this file.
    module: true,
    // Renaming a property would rename a registry key, a gloss id or a genome's
    // own `id`, every one of which is looked up by name at runtime.
    mangle: { properties: false },
    format: { comments: false },
    // The project ships none, and a map would be a fourth artifact to keep in
    // step with the two pages.
    sourceMap: false,
  });

  const code = result.code;
  if (code === undefined) throw new Error(`terser returned no code for ${entry}`);

  writeFileSync(file, code);
}
