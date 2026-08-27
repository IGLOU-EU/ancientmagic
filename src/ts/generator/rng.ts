// Seeded deterministic randomness so the same seed and settings always
// rebuild the same formula, which also makes seed sharing possible later.

export type Rng = () => number;

// The widest seed there is, an unsigned 32 bit number: the state mulberry32
// keeps, so anything above it seeds the same stream as something below it. A
// draw and a link both name a seed, and neither may name one the rng cannot
// take.
export const MAX_SEED = 4294967295;

// Mulberry32: tiny, fast, good enough distribution for content generation.
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / (MAX_SEED + 1);
  };
}

export function pick<T>(rng: Rng, items: ReadonlyArray<T>): T {
  if (items.length === 0) throw new Error('pick from an empty pool');
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error('pick indexed out of range');
  return item;
}

export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}
