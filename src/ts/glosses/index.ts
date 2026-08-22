import { baseLanguage } from '../locale.js';
import type { GlossPack } from './types.js';
import { enGlosses } from './en/index.js';
import { frGlosses } from './fr/index.js';

// Every pack that ships. The completeness tests sweep this list, so a pack
// added here is checked against all three genomes without touching the tests.
export const GLOSS_PACKS: ReadonlyArray<GlossPack> = [enGlosses, frGlosses];

const REGISTRY = new Map<string, GlossPack>(GLOSS_PACKS.map((pack) => [pack.language, pack]));

// A language ships a gloss pack or it does not. There is no partial pack: the
// completeness tests reject one that misses a single form, so a pack that is
// registered here is whole. A language with no pack of its own falls back to
// English wholesale, which is the recorded design while translations land.
export function resolveGlosses(tag: string): GlossPack {
  return REGISTRY.get(baseLanguage(tag)) ?? enGlosses;
}
