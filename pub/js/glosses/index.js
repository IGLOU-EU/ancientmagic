import { baseLanguage } from '../locale.js';
import { enGlosses } from './en/index.js';
import { frGlosses } from './fr/index.js';
export const GLOSS_PACKS = [enGlosses, frGlosses];
const REGISTRY = new Map(GLOSS_PACKS.map((pack) => [pack.language, pack]));
export function resolveGlosses(tag) {
    return REGISTRY.get(baseLanguage(tag)) ?? enGlosses;
}
