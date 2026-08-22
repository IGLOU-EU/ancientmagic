import { baseLanguage } from '../locale.js';
import type { GlossPack } from './types.js';

export type GlossPackLoader = () => Promise<GlossPack>;

// The English pack is also the fallback, so its loader is named rather than
// only registered.
const enPack: GlossPackLoader = () => import('./en/index.js').then((m) => m.enGlosses);

// Every pack that ships, behind its own loader. A pack weighs three genomes of
// wordings and nothing reads it until a conjuration asks, so it is fetched
// then, and only the one the page resolves to. The completeness tests sweep
// this registry, so a pack added here is checked against all three genomes
// without touching the tests.
export const GLOSS_PACKS: ReadonlyMap<string, GlossPackLoader> = new Map([
  ['en', enPack],
  ['fr', () => import('./fr/index.js').then((m) => m.frGlosses)],
]);

// A language ships a gloss pack or it does not. There is no partial pack: the
// completeness tests reject one that misses a single form, so a pack that is
// registered here is whole. A language with no pack of its own falls back to
// English wholesale, which is the recorded design while translations land.
export async function resolveGlosses(tag: string): Promise<GlossPack> {
  return (GLOSS_PACKS.get(baseLanguage(tag)) ?? enPack)();
}
