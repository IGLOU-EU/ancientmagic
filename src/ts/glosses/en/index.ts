// The English gloss pack. One directory per UI language: a translated pack is
// a copy of this one with every wording and every clause method reauthored,
// and no change anywhere else in the codebase.
//
// One line per genome, and that line is a loader: the pack names every genome
// the language must cover, and a conjuration fetches the one it writes in.

import type { GlossPack } from '../types.js';

export const enGlosses: GlossPack = {
  language: 'en',
  runic: () => import('./runic.js').then((m) => m.runicGlosses),
  egyptian: () => import('./egyptian.js').then((m) => m.egyptianGlosses),
  phoenician: () => import('./phoenician.js').then((m) => m.phoenicianGlosses),
};
