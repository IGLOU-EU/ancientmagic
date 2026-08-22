// The French gloss pack. Same three genomes, same ids, French wordings and a
// French clause grammar: articles, elision and agreement live here and nowhere
// in the genome code.

import type { GlossPack } from '../types.js';
import { egyptianGlosses } from './egyptian.js';
import { phoenicianGlosses } from './phoenician.js';
import { runicGlosses } from './runic.js';

export const frGlosses: GlossPack = {
  language: 'fr',
  runic: runicGlosses,
  egyptian: egyptianGlosses,
  phoenician: phoenicianGlosses,
};
