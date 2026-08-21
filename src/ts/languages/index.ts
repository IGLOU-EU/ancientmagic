// Genome registry. Egyptian and Phoenician arrive as further data modules
// in later phases and plug in here without touching the pipeline.

import type { Genome, LanguageId } from '../generator/types.js';
import { runicGenome } from './runic.js';

export const genomes: Partial<Record<LanguageId, Genome>> = {
  runic: runicGenome,
};
