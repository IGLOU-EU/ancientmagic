// The shape of the shipped JS.
//
// pub/js is compiled then compressed in place, and the page's loading contract
// (docs/i18n.md) counts requests: so many files at load, so many at the first
// conjure, so many at a change of script. A step that bundled, split, inlined
// or renamed a module would keep every test above green and quietly rewrite
// that contract. These two hold the graph itself: one module per source file,
// and every specifier pointing at a file that ships.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jsRoot = join(root, 'pub', 'js');
const tsRoot = join(root, 'src', 'ts');

function modules(dir: string, extension: string): string[] {
  return readdirSync(dir, { recursive: true })
    .filter((entry) => entry.endsWith(extension))
    .map((entry) => entry.slice(0, -extension.length))
    .sort();
}

// Both quote styles, because the readable output of a watch session and the
// compressed output of a build spell them differently. The static form covers
// the bare side-effect import too, which is what an inlining pass leaves
// behind, and misses the dynamic one because a paren follows the keyword.
const STATIC_IMPORT = /(?:from|import)\s*['"](\.[^'"]*)['"]/gu;
const DYNAMIC_IMPORT = /import\s*\(\s*['"](\.[^'"]*)['"]/gu;

function specifiers(source: string, pattern: RegExp): string[] {
  return Array.from(source.matchAll(pattern), (match) => match[1]);
}

test('js build: pub/js holds one module per source file, no more and no fewer', () => {
  assert.deepStrictEqual(modules(jsRoot, '.js'), modules(tsRoot, '.ts'));
});

test('js build: every import specifier in pub/js points at a file that ships', () => {
  const shipped = new Set(modules(jsRoot, '.js').map((name) => `${name}.js`));
  assert.ok(shipped.size > 0, 'nothing is built');

  for (const entry of shipped) {
    const source = readFileSync(join(jsRoot, entry), 'utf8');
    for (const pattern of [STATIC_IMPORT, DYNAMIC_IMPORT]) {
      for (const specifier of specifiers(source, pattern)) {
        const target = join(dirname(entry), specifier);
        assert.ok(shipped.has(target), `${entry} imports ${specifier}, which does not ship`);
      }
    }
  }
});

// The whole loading contract rests on this one property of the entry module.
// Inlining, bundling or hoisting a dynamic import would leave every other test
// green while the idle page went back to carrying the generator.
test('js build: the entry module defers the generator, the genomes and the glosses', () => {
  const main = readFileSync(join(jsRoot, 'main.js'), 'utf8');

  for (const specifier of specifiers(main, STATIC_IMPORT)) {
    assert.doesNotMatch(
      specifier,
      /generator|languages|glosses/u,
      `${specifier} is fetched at page load`,
    );
  }
  assert.ok(
    specifiers(main, DYNAMIC_IMPORT).length > 0,
    'the entry module fetches everything up front',
  );
});
