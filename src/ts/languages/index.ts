// Genome registry. The three MVP genomes plug in here without touching the
// pipeline, which only realizes the genome it is handed.
//
// Each entry is a loader rather than the genome itself: a genome carries its
// whole lexicon, and an idle page needs none of it. Conjuring in one script
// fetches that script alone, and the browser's module map keeps it.

import type { Genome, LanguageId } from '../generator/types.js';

export type GenomeLoader = () => Promise<Genome>;

export const GENOME_LOADERS: Readonly<Partial<Record<LanguageId, GenomeLoader>>> = {
  runic: () => import('./runic.js').then((m) => m.runicGenome),
  egyptian: () => import('./egyptian.js').then((m) => m.egyptianGenome),
  phoenician: () => import('./phoenician.js').then((m) => m.phoenicianGenome),
};

export async function loadGenome(id: LanguageId): Promise<Genome> {
  const load = GENOME_LOADERS[id];
  if (load === undefined) {
    throw new Error(`genome not available yet: ${id}`);
  }
  return load();
}
