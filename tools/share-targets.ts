// The networks the site shares to, and the address each one documents for it.
//
// A sharing address holds nothing readable, so these are machine values like an
// option id: a translator has nothing to say about them, and they stay out of
// the strings files. What a language writes is the message and the name of each
// link.
//
// {url} is the page, {message} the authored line, {post} the two of them
// together, which is what a network expects when it offers a single field.

import type { PageStrings } from './render-page.js';

// The order is the row's order, and it is an editorial one: free software
// before proprietary, personal before public, least harmful before most.
// Mastodon shares through the project's own service, which asks the reader
// for their instance instead of assuming one, and it rides the fragment
// rather than a query, so the address never reaches that service's server.
//
// This map is the one place the set and its order are stated: the template, the
// tests and the row on the page all follow it.
const SHARE_TARGETS: ReadonlyMap<string, string> = new Map([
  ['mastodon', 'https://share.joinmastodon.org/#text={post}'],
  ['mail', 'mailto:?subject={message}&body={url}'],
  ['bluesky', 'https://bsky.app/intent/compose?text={post}'],
  ['whatsapp', 'https://api.whatsapp.com/send?text={post}'],
  ['linkedin', 'https://www.linkedin.com/sharing/share-offsite/?url={url}'],
  ['facebook', 'https://www.facebook.com/sharer/sharer.php?u={url}'],
  ['x', 'https://x.com/intent/post?text={message}&url={url}'],
]);

export const SHARE_NETWORKS: ReadonlyArray<string> = Array.from(SHARE_TARGETS.keys());

const SHARE_TOKEN = /\{([a-z]+)\}/gu;

// One share address per network, ready to be dropped into an href.
//
// The message is authored, the encoding is derived. A strings file never holds
// a percent-encoded value: it would be unreadable to the translator who has to
// write it, and it would carry its straight quotes and its apostrophes past
// the checks that read authored words.
export function shareLinks(message: string, url: string): PageStrings {
  const values: Readonly<Record<string, string>> = {
    url: encodeURIComponent(url),
    message: encodeURIComponent(message),
    post: encodeURIComponent(`${message} ${url}`),
  };

  const links: Record<string, string> = {};
  for (const [network, target] of SHARE_TARGETS) {
    links[`share.${network}.href`] = target
      .replace(SHARE_TOKEN, (_token, name: string) => {
        const value = values[name];
        if (value === undefined) {
          throw new Error(`share: ${network} asks for {${name}}, which a link does not carry`);
        }
        return value;
      })
      // The address lands in an attribute of a page inserted verbatim, and its
      // parameter separator is the one character HTML reads as its own.
      .replaceAll('&', '&amp;');
  }
  return links;
}
