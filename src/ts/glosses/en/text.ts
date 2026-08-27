// English orthography and grammar helpers shared by every genome pack of this
// language. They belong to the pack, not to the genomes: another language
// capitalizes differently and has no definite article to strip. Where one of
// them reads like another pack's, letter for letter, that is two European
// languages agreeing and not a rule above either: a pack is reauthored whole,
// so it must own every decision it takes.

import { lookup } from '../table.js';
import type { GenomeGlosses, GenomeTables } from '../types.js';

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

// What every genome pack of this language answers alike: the four lookups into
// its own tables, and the way English strings its sentences together. A genome
// that joins otherwise restates `sentences` after this, where the difference
// stays readable next to the clauses it belongs to.
export function genomeMethods(tables: GenomeTables): GenomeGlosses {
  return {
    idiom: (id) => lookup(tables.idioms, id, 'idiom'),
    seal: (count) => lookup(tables.seals, String(count), 'seal'),
    sealDepth: (count) => lookup(tables.depths, String(count), 'depth'),
    direction: (id) => lookup(tables.directions, id, 'direction'),
    sentences: (parts) => parts.join(' '),
  };
}
