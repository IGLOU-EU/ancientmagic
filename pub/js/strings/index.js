import { baseLanguage } from '../locale.js';
import { en } from './en.js';
import { fr } from './fr.js';
export const UI_STRINGS = new Map([
    ['en', en],
    ['fr', fr],
]);
export function resolveStrings(tag) {
    return UI_STRINGS.get(baseLanguage(tag)) ?? en;
}
