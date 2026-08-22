// English orthography and grammar helpers shared by the three genome packs of
// this language. They belong to the pack, not to the genomes: another language
// capitalizes differently and has no definite article to strip.

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// A dread epithet is glossed with its article ("the gnawer beneath"), which a
// vocative drops: "O gnawer beneath", not "O the gnawer beneath".
export function vocative(epithetGloss: string): string {
  return epithetGloss.replace(/^the /u, '');
}

// An optional attributive adjective, ready to sit before its noun.
export function before(word: string | null): string {
  return word === null ? '' : `${word} `;
}

// An optional adverb, ready to sit after the word it modifies.
export function after(word: string | null): string {
  return word === null ? '' : ` ${word}`;
}
