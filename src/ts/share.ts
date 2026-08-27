// What a link says about a conjuration.
//
// Four words name everything the generator needs to write the same formula
// again: the script, the school, the level of power, and the seed. The page's
// own address already says which language the interface speaks, so the
// fragment describes the formula and never the page.
//
// The reader ships with the writer, before anything reads a link, because the
// meaning of a link has to be fixed the day the first one is copied. Nothing
// here touches the DOM or the network: it is a spelling, both ways.

import { clampDifficulty, MAX_DIFFICULTY, MIN_DIFFICULTY } from './generator/pipeline.js';
import { MAX_SEED } from './generator/rng.js';
import type { LanguageId, School, Settings } from './generator/types.js';

// What a link may name. The site's own sets live in generator/types.js, which
// no wave of the page fetches, and reading a link must cost no request beyond
// the generator core this module already pulls. So the format spells the two
// sets out, and tests/share.test.ts fails the day either one disagrees with
// the genome registry or with the schools the plan builds.
export const LANGUAGES: ReadonlyArray<LanguageId> = [
  'runic',
  'egyptian',
  'phoenician',
  'greek',
];
export const SCHOOLS: ReadonlyArray<School> = [
  'protection',
  'curse',
  'invocation',
  'eldritch',
  'divination',
  'chronomancy',
];

export interface SharedFormula {
  readonly settings: Settings;
  readonly seed: number;
}

// A dot: legal in a fragment, so nothing is ever percent-encoded, and a link
// survives being pasted into a message unchanged.
const SEPARATOR = '.';

// Exactly the decimal spelling a number gets from String(): no sign, no
// leading zero, no exponent, no hex. Anything else is a different format
// wearing this one's clothes.
const DECIMAL = /^(?:0|[1-9][0-9]*)$/u;

function wholeNumber(text: string): number | null {
  if (!DECIMAL.test(text)) return null;
  const value = Number(text);
  return Number.isSafeInteger(value) ? value : null;
}

export function encode(settings: Settings, seed: number): string {
  // Both numbers are read the way the pipeline reads them before it plans and
  // seeds, so a link can never name a formula that was not the one written.
  return [
    settings.language,
    settings.school,
    clampDifficulty(settings.difficulty),
    seed >>> 0,
  ].join(SEPARATOR);
}

// A share link is addressed at build time with the page's own address, so it
// works with the script gone. A conjuration adds the formula to that address,
// wherever the link happens to carry it: on its own in one parameter, or
// inside the message a network composes from a single text field.
// Percent-encoding maps character by character, so the encoded address is a
// literal substring of both, and the seal is one substitution.
//
// The caller seals the link the build baked, never the one it sealed last, so
// a formula replaces the one before it instead of nesting behind it.
export function sealLink(href: string, url: string, fragment: string): string {
  return href.replaceAll(encodeURIComponent(url), encodeURIComponent(`${url}#${fragment}`));
}

export function decode(text: string): SharedFormula | null {
  // The one liberty taken with the input: a location hands its fragment over
  // with the hash still on it.
  const parts = (text.startsWith('#') ? text.slice(1) : text).split(SEPARATOR);
  if (parts.length !== 4) return null;

  const [languageText, schoolText, difficultyText, seedText] = parts;
  const language = LANGUAGES.find((id) => id === languageText);
  const school = SCHOOLS.find((id) => id === schoolText);
  const difficulty = wholeNumber(difficultyText);
  const seed = wholeNumber(seedText);

  if (language === undefined || school === undefined) return null;
  if (difficulty === null || difficulty < MIN_DIFFICULTY || difficulty > MAX_DIFFICULTY) {
    return null;
  }
  if (seed === null || seed > MAX_SEED) return null;

  return { settings: { language, school, difficulty }, seed };
}
