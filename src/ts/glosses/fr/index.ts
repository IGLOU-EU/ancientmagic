// The French gloss pack. The same genomes and the same ids as any other pack,
// French wordings and a French clause grammar: articles, elision and agreement
// live here and nowhere in the genome code.

import type { GlossPack } from '../types.js';

export const frGlosses: GlossPack = {
  language: 'fr',
  runic: () => import('./runic.js').then((m) => m.runicGlosses),
  egyptian: () => import('./egyptian.js').then((m) => m.egyptianGlosses),
  phoenician: () => import('./phoenician.js').then((m) => m.phoenicianGlosses),
  greek: () => import('./greek.js').then((m) => m.greekGlosses),
  latin: () => import('./latin.js').then((m) => m.latinGlosses),
};
