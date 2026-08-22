// Pipeline entry: seed plus settings in, three aligned lines out.

import { mulberry32 } from './rng.js';
import { buildPlan } from './plan.js';
import { genomes } from '../languages/index.js';
import type { GlossPack } from '../glosses/types.js';
import type { FormulaOutput, Settings } from './types.js';

export function generate(
  settings: Settings,
  seed: number,
  glosses: GlossPack,
): FormulaOutput {
  const genome = genomes[settings.language];
  if (genome === undefined) {
    throw new Error(`genome not available yet: ${settings.language}`);
  }
  const difficulty = Math.min(9, Math.max(1, Math.trunc(settings.difficulty)));
  const rng = mulberry32(seed >>> 0);
  const plan = buildPlan(settings.school, difficulty, rng);
  return genome.realize(plan, rng, glosses);
}
