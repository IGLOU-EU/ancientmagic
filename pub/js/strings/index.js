import { baseLanguage } from '../locale.js';
const enStrings = () => import('./en.js').then((m) => m.en);
export const UI_STRINGS = new Map([
    ['en', enStrings],
    ['fr', () => import('./fr.js').then((m) => m.fr)],
]);
export async function resolveStrings(tag) {
    return (UI_STRINGS.get(baseLanguage(tag)) ?? enStrings)();
}
