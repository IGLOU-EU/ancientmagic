// The share row, sealed.
//
// Two promises hold this module: the formula it seals into a link is added to
// the address the build wrote there, and it is added to the link as the build
// wrote it, so a second conjuration replaces a formula instead of stacking
// behind it. Both are about hrefs on a page, so both are checked on one
// (tests/dom.ts).
//
// The third is about time: the page is read when a formula asks for it, not
// when the module happens to be imported. That one is the reason this file
// loads the module more than once.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { installPage, type Page } from './dom.js';

const ADDRESS = 'https://example.test/';
const FIRST = 'runic.protection.5.66238';
const SECOND = 'greek.curse.9.4242';

// One link carrying the address on its own, one carrying it inside a message,
// which are the two shapes the build writes.
const BAKED = [
  `https://one.example/post?u=${encodeURIComponent(ADDRESS)}`,
  `https://two.example/send?text=${encodeURIComponent(`a word ${ADDRESS}`)}`,
];

function sealed(fragment: string): string[] {
  const named = encodeURIComponent(`${ADDRESS}#${fragment}`);
  return [
    `https://one.example/post?u=${named}`,
    `https://two.example/send?text=${encodeURIComponent('a word ')}${named}`,
  ];
}

function hrefs(page: Page): string[] {
  return page.findAll('.share-link').map((link) => link.getAttribute('href') ?? '');
}

// Each case needs the module as a page's first formula finds it, and a module
// is loaded once per process, so each one asks for its own instance.
let instances = 0;
async function loadShareLinks(): Promise<{ sealShareLinks(fragment: string): void }> {
  instances += 1;
  const specifier = `../src/ts/ui/share-links.js?case=${instances}`;
  return import(specifier);
}

test('share links: a seal names the formula in the address the build wrote', async () => {
  const page = installPage({ canonical: ADDRESS, shareLinks: BAKED });
  const shareLinks = await loadShareLinks();

  shareLinks.sealShareLinks(FIRST);

  assert.deepStrictEqual(hrefs(page), sealed(FIRST));
});

test('share links: a second formula replaces the first instead of stacking', async () => {
  const page = installPage({ canonical: ADDRESS, shareLinks: BAKED });
  const shareLinks = await loadShareLinks();

  shareLinks.sealShareLinks(FIRST);
  shareLinks.sealShareLinks(SECOND);

  assert.deepStrictEqual(hrefs(page), sealed(SECOND));
  for (const href of hrefs(page)) {
    assert.ok(!href.includes('66238'), `the first formula is still in ${href}`);
  }
});

// The finding this file was written for: the module used to read the page as
// it was at import, which made it right only because of when the entry module
// happened to ask for it. Here it is imported against a page that carries
// neither address nor links, and the page it seals is the one standing when
// the formula arrives.
test('share links: the page is read at the seal, not at the import', async () => {
  installPage({ canonical: null, shareLinks: [] });
  const shareLinks = await loadShareLinks();

  const page = installPage({ canonical: ADDRESS, shareLinks: BAKED });
  shareLinks.sealShareLinks(FIRST);

  assert.deepStrictEqual(hrefs(page), sealed(FIRST));
});

// Nothing to seal against is a page the build never addressed. Half an address
// in a link that hands a formula to someone else is worse than the link the
// server sent, so the row is left as it was served.
test('share links: a page without a canonical address is left alone', async () => {
  const page = installPage({ canonical: null, shareLinks: BAKED });
  const shareLinks = await loadShareLinks();

  shareLinks.sealShareLinks(FIRST);

  assert.deepStrictEqual(hrefs(page), BAKED);
});
