import type { UiStrings } from './types.js';
import { en } from './en.js';

const REGISTRY = new Map<string, UiStrings>([['en', en]]);

// The page states its own language, one static page per language, so this only
// has to turn that declaration into the matching strings. A regional tag resolves
// to its base language, and anything unknown falls back to the default rather
// than leaving the page wordless.
export function resolveStrings(tag: string): UiStrings {
  return REGISTRY.get(tag.toLowerCase().split('-')[0]) ?? en;
}
