// Genome registry. A genome plugs in here without touching the pipeline,
// which only realizes the genome it is handed.
//
// One line per genome, and that line loads two things at once: the rules of
// the script, and the wordings that script needs in the page's language. The
// grain of a conjuration is the pair, so the grain of loading is too. Nothing
// here reaches a page that never conjures, and conjuring in one script never
// fetches another script's rules, data or glosses, in any language.

import type { BoundGenome, Genome, LanguageId } from '../generator/types.js';
import type { GlossPack } from '../glosses/types.js';

export type GenomeLoader = (glosses: GlossPack) => Promise<BoundGenome>;

// The slice a genome writes with is its own type, and every genome's is
// different, so the pairing can only be checked where both are named. That is
// here, and binding is what lets one loader shape answer for all of them.
export function bindGenome<G>(genome: Genome<G>, glosses: G): BoundGenome {
  return {
    id: genome.id,
    realize: (plan, rng) => genome.realize(plan, rng, glosses),
  };
}

function fetchBound<G>(
  rules: Promise<Genome<G>>,
  slice: () => Promise<G>,
): Promise<BoundGenome> {
  return Promise.all([rules, slice()]).then(([genome, glosses]) =>
    bindGenome(genome, glosses),
  );
}

export const GENOME_LOADERS: Readonly<Partial<Record<LanguageId, GenomeLoader>>> = {
  runic: (pack) => fetchBound(import('./runic.js').then((m) => m.runicGenome), pack.runic),
  egyptian: (pack) =>
    fetchBound(import('./egyptian.js').then((m) => m.egyptianGenome), pack.egyptian),
  phoenician: (pack) =>
    fetchBound(import('./phoenician.js').then((m) => m.phoenicianGenome), pack.phoenician),
  greek: (pack) => fetchBound(import('./greek.js').then((m) => m.greekGenome), pack.greek),
};

export async function loadGenome(id: LanguageId, glosses: GlossPack): Promise<BoundGenome> {
  const load = GENOME_LOADERS[id];
  if (load === undefined) {
    throw new Error(`genome not available yet: ${id}`);
  }
  return load(glosses);
}
