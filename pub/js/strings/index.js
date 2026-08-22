import { baseLanguage } from '../locale.js';
import { en } from './en.js';
const REGISTRY = new Map([['en', en]]);
export function resolveStrings(tag) {
    return REGISTRY.get(baseLanguage(tag)) ?? en;
}
