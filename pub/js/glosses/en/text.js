export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
export function vocative(epithetGloss) {
    return epithetGloss.replace(/^the /u, '');
}
export function before(word) {
    return word === null ? '' : `${word} `;
}
export function after(word) {
    return word === null ? '' : ` ${word}`;
}
