// French orthography and grammar helpers shared by every genome pack of this
// language. They belong to the pack, not to the genomes: English has one
// article and no agreement, French chooses an article, contracts it behind a
// preposition and bends what it hangs on a noun. The few that read like the
// English ones, letter for letter, are restated here rather than shared: a
// pack is reauthored whole, and a language that capitalizes or spaces words
// otherwise must be free to say so without touching another.
//
// Two conventions the whole pack rests on.
//
// Elision. A word opening on a vowel takes l', de l', j'. The pack ships no
// noun on an aspirate h, so a leading h is always treated as mute (l'heure,
// l'héritage) and no wording needs a flag of its own.
//
// Verb forms. One stored verb wording has to serve three moods: the first
// person of a Protection clause, the second person imperative of an Invocation
// and of tier 2, and the third person subjunctive of a Phoenician jussive. The
// pack therefore only ever names verbs whose three forms coincide, which is the
// whole first group plus the ouvrir family (je lie, qu'il lie, lie). No
// conjugator, and no wording that would need one.

import { form, lookup } from '../table.js';
import type {
  Gender,
  GenomeGlosses,
  GenomeTables,
  RootForm,
  RootGlossTable,
} from '../types.js';

const APOSTROPHE = '’';

// U+202F. Written as an escape and never typed inline, so the character that
// carries French punctuation spacing is visible in the source instead of
// hiding as a blank nobody can tell from a space.
const NARROW_NO_BREAK = '\u202F';

// Vowels plus the mute h, the openings that force elision. The ligature is
// listed with them because a word that opens on it elides like its vowel
// (l’œil).
const ELIDES = /^[aàâeéèêëiîïoôöuùûüyhœ]/iu;

// The articles a vocative drops off an epithet, longest first so les never
// matches as le.
const ARTICLE = new RegExp(`^(?:les |le |la |l${APOSTROPHE})`, 'u');

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// « le rongeur », « la nuit », « l'heure ».
export function definite(word: string, gender: Gender): string {
  if (ELIDES.test(word)) return `l${APOSTROPHE}${word}`;
  return gender === 'f' ? `la ${word}` : `le ${word}`;
}

// « du rongeur », « de la nuit », « de l'heure ».
export function ofDefinite(word: string, gender: Gender): string {
  if (ELIDES.test(word)) return `de l${APOSTROPHE}${word}`;
  return gender === 'f' ? `de la ${word}` : `du ${word}`;
}

// An epithet gloss carries its own article, so a preposition in front of one
// contracts against text rather than against a gender.
export function ofPhrase(articled: string): string {
  if (articled.startsWith('les ')) return `des ${articled.slice(4)}`;
  if (articled.startsWith('le ')) return `du ${articled.slice(3)}`;
  return `de ${articled}`;
}

export function toPhrase(articled: string): string {
  if (articled.startsWith('les ')) return `aux ${articled.slice(4)}`;
  if (articled.startsWith('le ')) return `au ${articled.slice(3)}`;
  return `à ${articled}`;
}

// A dread epithet is glossed with its article (« le rongeur des profondeurs »),
// which a vocative drops: « Ô rongeur des profondeurs ».
export function vocative(epithetGloss: string): string {
  return epithetGloss.replace(ARTICLE, '');
}

// The speaker of a Protection clause: « je lie », « j'ouvre ».
export function speaker(verb: string): string {
  return ELIDES.test(verb) ? `j${APOSTROPHE}${verb}` : `je ${verb}`;
}

// The conjunction a jussive opens on: « que Baal », « qu'Astarté ».
export function that(word: string): string {
  return ELIDES.test(word) ? `qu${APOSTROPHE}${word}` : `que ${word}`;
}

// An optional piece, ready to sit after what it modifies.
export function after(word: string | null): string {
  return word === null ? '' : ` ${word}`;
}

// French sets a narrow no-break space before an exclamation mark. Every mark
// in the pack goes through here, so none of them can be written without one.
export function exclaim(text: string): string {
  return `${text}${NARROW_NO_BREAK}!`;
}

// The question mark takes the same narrow no-break space, and only a
// Divination asking clause ever reaches it.
export function ask(text: string): string {
  return `${text}${NARROW_NO_BREAK}?`;
}

// The interrogative inversion, which is how elevated French asks: the subject
// pronoun rides behind the verb, with the euphonic t between two vowels
// (« le fanal proclame-t-il », « dévoile-t-elle »).
export function inverted(verb: string, gender: Gender): string {
  const pronoun = gender === 'f' ? 'elle' : 'il';
  return /[aeiouyéèêà]$/iu.test(verb) ? `${verb}-t-${pronoun}` : `${verb}-${pronoun}`;
}

// The gender a clause agrees with. A root reached as a noun always declares
// one, so a gap is a hole in the pack and must be loud like every other.
export function genderOf(roots: RootGlossTable, id: string): Gender {
  const gender = roots[id]?.gender;
  if (gender === undefined) throw new Error(`no gender for root ${id}`);
  return gender;
}

// A wording bent to the head it hangs on. Feminine wordings are stored, not
// derived; a form the pack leaves out of `feminine` is invariable.
export function agreed(
  roots: RootGlossTable,
  id: string,
  wanted: RootForm,
  gender: Gender,
): string {
  const feminine = gender === 'f' ? roots[id]?.feminine?.[wanted] : undefined;
  return feminine ?? form(roots, id, wanted);
}

// The plural of an adjective, the one place a clause qualifies a plural noun.
// French marks it with an s unless the word already ends in a sibilant that
// carries the plural on its own, and the pack names no adjective in -al.
export function plural(word: string): string {
  return /[sxz]$/u.test(word) ? word : `${word}s`;
}

// What every genome pack of this language answers alike: the four lookups into
// its own tables, and the way French strings its sentences together. A genome
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
