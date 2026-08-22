// Pipeline entry: a genome, a seed and settings in, three aligned lines out.

import { mulberry32 } from './rng.js';
import { buildPlan } from './plan.js';
import type { GlossPack } from '../glosses/types.js';
import type { FormulaOutput, Genome, Settings } from './types.js';

// The genome arrives resolved instead of being looked up here, so that which
// script is loaded, and when, stays the caller's decision and the core never
// drags the whole registry of genomes behind it.
export function generate(
  genome: Genome,
  settings: Settings,
  seed: number,
  glosses: GlossPack,
): FormulaOutput {
  const difficulty = Math.min(9, Math.max(1, Math.trunc(settings.difficulty)));
  const rng = mulberry32(seed >>> 0);
  const plan = buildPlan(settings.school, difficulty, rng);
  return genome.realize(plan, rng, glosses);
}
