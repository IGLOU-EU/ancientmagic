import { baseLanguage } from '../locale.js';
import type { UiStrings } from './types.js';

export type StringsLoader = () => Promise<UiStrings>;

// English is also the fallback, so its loader is named: a page whose language
// nobody registered still reads, in whole English, never half of it.
const enStrings: StringsLoader = () => import('./en.js').then((m) => m.en);

// Every language whose page ships, behind its own loader. A page pulls the
// words of its own language and no other, which is the point of one static
// page per language. The equality tests sweep this registry against the
// matching src/strings file, so a language added here is checked against its
// own page without touching the tests.
export const UI_STRINGS: ReadonlyMap<string, StringsLoader> = new Map([
  ['en', enStrings],
  ['fr', () => import('./fr.js').then((m) => m.fr)],
]);

// The page states its own language, one static page per language, so this only
// has to turn that declaration into the matching strings. A regional tag resolves
// to its base language, and anything unknown falls back to the default rather
// than leaving the page wordless.
export async function resolveStrings(tag: string): Promise<UiStrings> {
  return (UI_STRINGS.get(baseLanguage(tag)) ?? enStrings)();
}

// Which of the four tier words names a level of power. The page ships the tier
// of its initial level pre-rendered and the runtime writes the tier of every
// level after it, so where one tier ends and the next begins has to be one
// reading both sides can be held to.
export function difficultyTier(strings: UiStrings, value: number): string {
  const tiers = strings.difficultyTiers;
  if (value <= 2) return tiers.low;
  if (value <= 5) return tiers.mid;
  if (value <= 7) return tiers.high;
  return tiers.peak;
}
