// The shipped script faces against the genomes they draw for.
//
// tools/subset-fonts.sh cuts each Noto release down to the codepoints the site
// writes, and src/scss/_fonts.scss routes every codepoint to the file that
// carries it. Held by comment alone, a sign added to a lexicon and to neither
// of those ships a font with a hole in it, and the page draws tofu where a
// glyph should stand: nothing else in the suite would notice, because the
// generator is right and only the font is short. These tests are that hold.
//
// Only the missing direction fails. A codepoint listed and never written costs
// a few bytes in a file, a codepoint written and never listed costs a reader
// the formula.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LANGUAGES, type LanguageId } from '../src/ts/generator/types.js';
import * as egyptianData from '../src/ts/languages/egyptian-data.js';
import * as greekData from '../src/ts/languages/greek-data.js';
import * as phoenicianData from '../src/ts/languages/phoenician-data.js';
import * as runicData from '../src/ts/languages/runic-data.js';
import { REPO_ROOT } from '../tools/sources.js';

const script = readFileSync(join(REPO_ROOT, 'tools', 'subset-fonts.sh'), 'utf8');
const stylesheet = readFileSync(join(REPO_ROOT, 'src', 'scss', '_fonts.scss'), 'utf8');

// The data module of every shipped genome, keyed by the shipped set itself, so
// a genome that arrives without its signs reaching the font pipeline is a
// compile error here rather than a hole discovered by a reader.
const DATA: Readonly<Record<LanguageId, object>> = {
  runic: runicData,
  egyptian: egyptianData,
  phoenician: phoenicianData,
  greek: greekData,
};

// A genome writes its scripts in strings and nothing else, so the whole module
// is read rather than a list of its tables: a sign added to any table is seen,
// and no second inventory has to be kept beside the first.
function codepointsOf(value: unknown, found: Set<number>): Set<number> {
  if (typeof value === 'string') {
    for (const character of value) {
      const codepoint = character.codePointAt(0);
      // Romanization, roles and ids are written in ASCII, which the page draws
      // in its own text face and no subset ever has to carry.
      if (codepoint !== undefined && codepoint > 0x7f) found.add(codepoint);
    }
  } else if (Array.isArray(value)) {
    for (const entry of value) codepointsOf(entry, found);
  } else if (value !== null && typeof value === 'object') {
    for (const entry of Object.values(value)) codepointsOf(entry, found);
  }
  return found;
}

function name(codepoint: number): string {
  return `U+${codepoint.toString(16).toUpperCase().padStart(4, '0')}`;
}

// Both halves of the contract spell their sets the same way, a comma separated
// list of codepoints and ranges, so one reader serves the script and the
// stylesheet.
function expand(list: string): Set<number> {
  const found = new Set<number>();
  for (const part of list.split(',')) {
    const [first, last] = part.trim().replace(/^u\+/iu, '').split('-');
    const from = Number.parseInt(first ?? '', 16);
    const to = last === undefined ? from : Number.parseInt(last, 16);
    assert.ok(Number.isFinite(from) && Number.isFinite(to), `unreadable codepoint set: ${part}`);
    for (let codepoint = from; codepoint <= to; codepoint += 1) found.add(codepoint);
  }
  return found;
}

// Which codepoints each shell variable of the pipeline names.
const SETS = new Map(
  Array.from(script.matchAll(/^(\w+)_unicodes='([^']+)'$/gmu), ([, variable, list]) => [
    variable as string,
    expand(list as string),
  ]),
);

// Which set each produced file is cut with, read off the calls themselves.
const SUBSETS = new Map(
  Array.from(
    script.matchAll(/^subset (\S+) \\\n\s*"[^"]*" \\\n\s*"\$(\w+)_unicodes"$/gmu),
    ([, file, variable]) => [file as string, SETS.get(variable as string)],
  ),
);

// Which range each face claims, read off the stylesheet's own registrations.
const FACES = new Map(
  Array.from(
    stylesheet.matchAll(/@include glyph-face\('([^']+)',\s*'([^']+)'/gu),
    ([, file, range]) => [file as string, expand(range as string)],
  ),
);

test('font subsets: the pipeline reads as the five faces the site registers', () => {
  assert.strictEqual(SETS.size, 5, 'the codepoint sets of the pipeline no longer read');
  assert.strictEqual(SUBSETS.size, 5, 'the subset calls of the pipeline no longer read');
  assert.strictEqual(FACES.size, 5, 'the faces of the stylesheet no longer read');
  for (const [file, set] of SUBSETS) {
    assert.ok(set !== undefined, `${file} is cut with a set the pipeline never names`);
  }
});

test('font subsets: every codepoint a genome writes is carried by a subset', () => {
  const carried = new Set<number>();
  for (const set of SUBSETS.values()) {
    for (const codepoint of set ?? []) carried.add(codepoint);
  }

  for (const id of LANGUAGES) {
    const written = codepointsOf(DATA[id], new Set<number>());
    assert.ok(written.size > 0, `the ${id} data module writes no script at all`);
    const missing = Array.from(written)
      .filter((codepoint) => !carried.has(codepoint))
      .map(name);
    assert.deepStrictEqual(
      missing,
      [],
      `${id} writes ${missing.join(' ')}, which tools/subset-fonts.sh cuts out of every font`,
    );
  }
});

test('font subsets: every file the pipeline cuts is registered and ships', () => {
  for (const file of SUBSETS.keys()) {
    assert.ok(FACES.has(file), `${file} is cut but src/scss/_fonts.scss registers no face for it`);
    assert.ok(
      existsSync(join(REPO_ROOT, 'pub', 'fonts', `${file}.woff2`)),
      `${file} is cut but no such file ships in pub/fonts`,
    );
  }
  for (const file of FACES.keys()) {
    assert.ok(SUBSETS.has(file), `src/scss/_fonts.scss registers ${file}, which nothing cuts`);
  }
});

test('font subsets: the stylesheet routes every codepoint its file carries', () => {
  for (const [file, set] of SUBSETS) {
    const range = FACES.get(file);
    if (range === undefined || set === undefined) continue;
    const unrouted = Array.from(set)
      .filter((codepoint) => !range.has(codepoint))
      .map(name);
    assert.deepStrictEqual(
      unrouted,
      [],
      `${file} carries ${unrouted.join(' ')}, which its unicode-range sends elsewhere`,
    );
  }
});
