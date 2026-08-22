import { baseLanguage } from '../locale.js';
const enPack = () => import('./en/index.js').then((m) => m.enGlosses);
export const GLOSS_PACKS = new Map([
    ['en', enPack],
    ['fr', () => import('./fr/index.js').then((m) => m.frGlosses)],
]);
export async function resolveGlosses(tag) {
    return (GLOSS_PACKS.get(baseLanguage(tag)) ?? enPack)();
}
