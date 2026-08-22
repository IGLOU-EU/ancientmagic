// The share row, once a formula exists.
//
// The links are addressed at build time with the page's own address and are
// handed over complete by the server: they need no script to work, and the
// idle page loads nothing for them. This module rides the conjuration, and all
// it does is add the formula on screen to the address the links already carry,
// so what is handed to someone else is the formula they were shown rather than
// the page they would land on.

import { sealLink } from '../share.js';

const SHARE_LINK = '.share-link';
const CANONICAL = 'link[rel="canonical"]';
const HREF = 'href';

// The address the build wrote into the links, taken from the page that
// declares it rather than rebuilt from the location, so no local origin, no
// query and no formula already in the bar can make the two spellings disagree.
const address = document.querySelector(CANONICAL)?.getAttribute(HREF) ?? '';

// The links as they were baked. Every seal is applied to those, so a second
// conjuration replaces the formula in them instead of stacking behind it.
const baked = new Map<Element, string>();
for (const link of document.querySelectorAll(SHARE_LINK)) {
  baked.set(link, link.getAttribute(HREF) ?? '');
}

export function sealShareLinks(fragment: string): void {
  if (address === '') return;
  for (const [link, href] of baked) link.setAttribute(HREF, sealLink(href, address, fragment));
}
