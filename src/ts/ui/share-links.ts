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

// What the build wrote in a link, remembered against the link itself the first
// time that link is sealed. Every seal is applied to that, so a second
// conjuration replaces the formula in a link instead of stacking behind it,
// and the only thing this module keeps is a word per link it has already
// rewritten: never a page, never a moment.
const baked = new WeakMap<Element, string>();

export function sealShareLinks(fragment: string): void {
  // The address the build wrote into the links, read from the page that
  // declares it rather than rebuilt from the location, so no local origin, no
  // query and no formula already in the bar can make the two spellings
  // disagree. Read here, with a formula in hand, so what is sealed is the page
  // as it stands and not as it stood when this module happened to load.
  const address = document.querySelector(CANONICAL)?.getAttribute(HREF) ?? '';
  if (address === '') return;

  for (const link of document.querySelectorAll(SHARE_LINK)) {
    const href = baked.get(link) ?? link.getAttribute(HREF) ?? '';
    baked.set(link, href);
    link.setAttribute(HREF, sealLink(href, address, fragment));
  }
}
