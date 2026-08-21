// Genome registry. Phoenician arrives as a further data module in a later
// phase and plugs in here without touching the pipeline.

import type { Genome, LanguageId } from '../generator/types.js';
import { egyptianGenome } from './egyptian.js';
import { runicGenome } from './runic.js';

export const genomes: Partial<Record<LanguageId, Genome>> = {
  runic: runicGenome,
  egyptian: egyptianGenome,
};
