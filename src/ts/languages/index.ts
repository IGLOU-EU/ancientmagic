// Genome registry. The three MVP genomes plug in here without touching the
// pipeline, which only looks a language up and calls realize.

import type { Genome, LanguageId } from '../generator/types.js';
import { egyptianGenome } from './egyptian.js';
import { phoenicianGenome } from './phoenician.js';
import { runicGenome } from './runic.js';

export const genomes: Partial<Record<LanguageId, Genome>> = {
  runic: runicGenome,
  egyptian: egyptianGenome,
  phoenician: phoenicianGenome,
};
