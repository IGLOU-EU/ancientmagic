// Pipeline entry: a genome, a seed and settings in, three aligned lines out.

import { mulberry32 } from './rng.js';
import { buildPlan } from './plan.js';
import type { BoundGenome, FormulaOutput, Settings } from './types.js';

// The genome arrives resolved, and with its glosses already bound, so that
// which script is loaded and in which language, and when, stays the caller's
// decision. The core drags neither the registry of genomes nor a pack of
// wordings behind it: it clamps, seeds, plans, and hands the plan over.
// The nine tiers the plan knows, and the only reading of a difficulty there
// is. Exported because a shared link must name the tier that was used, not the
// number the altar happened to hold.
export function clampDifficulty(value: number): number {
  return Math.min(9, Math.max(1, Math.trunc(value)));
}

export function generate(
  genome: BoundGenome,
  settings: Settings,
  seed: number,
): FormulaOutput {
  const difficulty = clampDifficulty(settings.difficulty);
  const rng = mulberry32(seed >>> 0);
  const plan = buildPlan(settings.school, difficulty, rng);
  return genome.realize(plan, rng);
}
