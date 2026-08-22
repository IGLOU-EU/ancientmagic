// Contract of the page build tool. Every case here is a build failure on
// purpose: a substitution that fails quietly is how a translation gets lost.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeStrings, renderLanguage, renderPage } from '../tools/render-page.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(...parts: string[]): string {
  return readFileSync(join(root, ...parts), 'utf8');
}

function readJson(...parts: string[]): Record<string, string> {
  return JSON.parse(read(...parts)) as Record<string, string>;
}

test('page build: substitutes every placeholder', () => {
  const page = renderPage('<h1>{{a}}</h1><p>{{b}} {{a}}</p>', { a: 'one', b: 'two' }, 'test');
  assert.strictEqual(page, '<h1>one</h1><p>two one</p>');
});

test('page build: a value is inserted verbatim, never re-scanned', () => {
  const page = renderPage('<p>{{a}}</p>', { a: '$& $1 <wbr>' }, 'test');
  assert.strictEqual(page, '<p>$& $1 <wbr></p>');
});

test('page build: fails on a key missing from the language file', () => {
  assert.throws(
    () => renderPage('<title>{{meta.title}}</title>', {}, 'test'),
    /meta\.title/,
  );
});

test('page build: fails on a key no placeholder uses', () => {
  assert.throws(
    () => renderPage('<title>{{meta.title}}</title>', { 'meta.title': 'x', 'meta.gone': 'y' }, 'test'),
    /meta\.gone/,
  );
});

test('page build: fails on a placeholder left unresolved in the output', () => {
  // A value that carries a placeholder of its own survives substitution, since
  // the replacement is never re-scanned. The output check is what catches it.
  assert.throws(
    () => renderPage('<p>{{a}}</p>', { a: 'see {{b}}' }, 'test'),
    /unresolved/,
  );
});

test('page build: fails on a placeholder the template misspells', () => {
  // Spaces put the token outside the placeholder grammar, so it is neither
  // collected nor substituted. It must not reach the page.
  assert.throws(() => renderPage('<p>{{ a }}</p>', {}, 'test'), /unresolved/);
});

test('page build: the error names the language it failed on', () => {
  assert.throws(() => renderPage('<p>{{a}}</p>', {}, 'fr'), /^Error: fr:/);
});

test('page build: shared strings merge into the language strings', () => {
  assert.deepStrictEqual(mergeStrings({ 'site.url': 'u' }, { 'meta.title': 't' }, 'test'), {
    'site.url': 'u',
    'meta.title': 't',
  });
});

test('page build: fails when a language file redefines a shared key', () => {
  assert.throws(
    () => mergeStrings({ 'site.url': 'u' }, { 'site.url': 'other' }, 'test'),
    /site\.url/,
  );
});

test('page build: the language declaration comes from the language name', () => {
  const page = renderLanguage('<html lang="{{html.lang}}">', {}, {}, 'fr');
  assert.strictEqual(page, '<html lang="fr">');
});

test('page build: a language file cannot redefine the language declaration', () => {
  assert.throws(
    () => renderLanguage('<html lang="{{html.lang}}">', {}, { 'html.lang': 'de' }, 'fr'),
    /html\.lang/,
  );
});

test('page build: the template carries no bare human-readable text', () => {
  const template = read('src', 'html', 'index.html');
  const body = template.slice(template.indexOf('<body>'));
  // Anything between tags must be a placeholder or nothing at all.
  for (const [, between] of body.matchAll(/>([^<>]+)</g)) {
    const rest = between.replace(/\{\{[A-Za-z0-9_.-]+\}\}/g, '').trim();
    assert.strictEqual(rest, '', `bare text in the template: ${JSON.stringify(between)}`);
  }
});

test('page build: pub/index.html is what the template and the en strings render', () => {
  const page = renderLanguage(
    read('src', 'html', 'index.html'),
    readJson('src', 'strings', 'common.json'),
    readJson('src', 'strings', 'en.json'),
    'en',
  );
  assert.strictEqual(page, read('pub', 'index.html'));
});
