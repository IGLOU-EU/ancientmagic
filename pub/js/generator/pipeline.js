import { mulberry32 } from './rng.js';
import { buildPlan } from './plan.js';
export function generate(genome, settings, seed) {
    const difficulty = Math.min(9, Math.max(1, Math.trunc(settings.difficulty)));
    const rng = mulberry32(seed >>> 0);
    const plan = buildPlan(settings.school, difficulty, rng);
    return genome.realize(plan, rng);
}
