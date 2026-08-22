import { baseLanguage } from '../locale.js';
import type { UiStrings } from './types.js';
import { en } from './en.js';
import { fr } from './fr.js';

// Every language whose page ships. The equality tests sweep this registry
// against the matching src/strings file, so a language added here is checked
// against its own page without touching the tests.
export const UI_STRINGS: ReadonlyMap<string, UiStrings> = new Map([
  ['en', en],
  ['fr', fr],
]);

// The page states its own language, one static page per language, so this only
// has to turn that declaration into the matching strings. A regional tag resolves
// to its base language, and anything unknown falls back to the default rather
// than leaving the page wordless.
export function resolveStrings(tag: string): UiStrings {
  return UI_STRINGS.get(baseLanguage(tag)) ?? en;
}
