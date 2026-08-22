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

// A module can be asked for from two places, and which modules are deferred is
// a different question from how many places ask for them. One test each.
function unique(values: string[]): string[] {
  return Array.from(new Set(values));
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

// The whole loading contract rests on the entry module: what it imports is
// what an idle page pays for, what it defers is what a conjuration pays for.
// Inlining, bundling or hoisting a dynamic import would leave every other test
// green while the idle page went back to carrying the generator.
//
// Both lists are spelled out so the test fails closed. An import moving from
// one side to the other, or a new one appearing on either, is a change to the
// contract in docs/i18n.md and has to be made on purpose.
test('js build: the entry module loads the idle page and defers the rest', () => {
  const main = readFileSync(join(jsRoot, 'main.js'), 'utf8');

  assert.deepStrictEqual(
    specifiers(main, STATIC_IMPORT).sort(),
    ['./strings/index.js', './ui/manifestation.js'],
    'the idle page carries something new, or lost something',
  );
  assert.deepStrictEqual(
    unique(specifiers(main, DYNAMIC_IMPORT)).sort(),
    [
      './generator/pipeline.js',
      './glosses/index.js',
      './languages/index.js',
      './share.js',
      './ui/share-links.js',
    ],
    'a conjuration fetches something new, or fetches it too early',
  );
});

// A page opened on a formula reads the link before it can replay it, which is
// the format's second call site in the entry module: once to read an arriving
// formula, once to write the one just conjured. It is gated on the raw hash,
// which is why a page opened without one fetches nothing for it, and the
// replay itself goes through the conjuration, so nothing else is deferred.
test('js build: the entry module reads an arriving formula before it writes one', () => {
  const main = readFileSync(join(jsRoot, 'main.js'), 'utf8');
  const asked = specifiers(main, DYNAMIC_IMPORT);

  assert.strictEqual(
    asked.filter((specifier) => specifier === './share.js').length,
    2,
    'the arrival and the conjuration no longer share the format',
  );
  assert.match(main, /location\.hash/, 'the arrival no longer reads the fragment it is gated on');
});
