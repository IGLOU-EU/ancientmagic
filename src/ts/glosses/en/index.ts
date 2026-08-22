// The English gloss pack. One directory per UI language: a translated pack is
// a copy of this one with every wording and every clause method reauthored,
// and no change anywhere else in the codebase.

import type { GlossPack } from '../types.js';
import { egyptianGlosses } from './egyptian.js';
import { phoenicianGlosses } from './phoenician.js';
import { runicGlosses } from './runic.js';

export const enGlosses: GlossPack = {
  language: 'en',
  runic: runicGlosses,
  egyptian: egyptianGlosses,
  phoenician: phoenicianGlosses,
};
