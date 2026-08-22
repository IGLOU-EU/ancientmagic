import { en } from './en.js';
const REGISTRY = new Map([['en', en]]);
export function resolveStrings(tag) {
    return REGISTRY.get(tag.toLowerCase().split('-')[0]) ?? en;
}
