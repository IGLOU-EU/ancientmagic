import { form } from '../table.js';
const APOSTROPHE = '’';
const NARROW_NO_BREAK = '\u202F';
const ELIDES = /^[aàâeéèêëiîïoôöuùûüyh]/iu;
const ARTICLE = new RegExp(`^(?:les |le |la |l${APOSTROPHE})`, 'u');
export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
export function definite(word, gender) {
    if (ELIDES.test(word))
        return `l${APOSTROPHE}${word}`;
    return gender === 'f' ? `la ${word}` : `le ${word}`;
}
export function ofDefinite(word, gender) {
    if (ELIDES.test(word))
        return `de l${APOSTROPHE}${word}`;
    return gender === 'f' ? `de la ${word}` : `du ${word}`;
}
export function ofPhrase(articled) {
    if (articled.startsWith('les '))
        return `des ${articled.slice(4)}`;
    if (articled.startsWith('le '))
        return `du ${articled.slice(3)}`;
    return `de ${articled}`;
}
export function toPhrase(articled) {
    if (articled.startsWith('les '))
        return `aux ${articled.slice(4)}`;
    if (articled.startsWith('le '))
        return `au ${articled.slice(3)}`;
    return `à ${articled}`;
}
export function vocative(epithetGloss) {
    return epithetGloss.replace(ARTICLE, '');
}
export function speaker(verb) {
    return ELIDES.test(verb) ? `j${APOSTROPHE}${verb}` : `je ${verb}`;
}
export function that(word) {
    return ELIDES.test(word) ? `qu${APOSTROPHE}${word}` : `que ${word}`;
}
export function after(word) {
    return word === null ? '' : ` ${word}`;
}
export function exclaim(text) {
    return `${text}${NARROW_NO_BREAK}!`;
}
export function genderOf(roots, id) {
    const gender = roots[id]?.gender;
    if (gender === undefined)
        throw new Error(`no gender for root ${id}`);
    return gender;
}
export function agreed(roots, id, wanted, gender) {
    const feminine = gender === 'f' ? roots[id]?.feminine?.[wanted] : undefined;
    return feminine ?? form(roots, id, wanted);
}
export function plural(word) {
    return /[sxz]$/u.test(word) ? word : `${word}s`;
}
