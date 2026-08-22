// The nine tiers of power, and the only reading of a difficulty there is.
//
// A leaf of its own, like locale.ts, because two sides need it and neither
// should have to carry the other: the pipeline clamps before it plans, and a
// shared link must name the tier that was used rather than the number the
// altar happened to hold. Held here, reading a link costs the reader nothing
// of the generator.

export function clampDifficulty(value: number): number {
  return Math.min(9, Math.max(1, Math.trunc(value)));
}
