// Lookups every pack shares. They throw rather than return a blank, because a
// gap in a pack must never reach the page as a hole in a sentence.
//
// Each one takes the table it reads, so a pack binds it to its own wordings in
// a one-line helper (`noun`, `theNoun`, `adjectival`, `named`). Those helpers
// look alike from pack to pack and belong there: a shared version would have
// to carry the pack's tables through every clause that calls it, and a clause
// is meant to read as a sentence rather than as a lookup.

import type { GlossTable, NamedPower, NamedPowerTable, RootForm, RootGlossTable } from './types.js';

export function lookup(table: GlossTable, key: string, what: string): string {
  const value = table[key];
  if (value === undefined) throw new Error(`no ${what} gloss for ${key}`);
  return value;
}

export function power(table: NamedPowerTable, key: string): NamedPower {
  const value = table[key];
  if (value === undefined) throw new Error(`no power gloss for ${key}`);
  return value;
}

export function form(roots: RootGlossTable, key: string, wanted: RootForm): string {
  const entry = roots[key];
  if (entry === undefined) throw new Error(`no gloss for root ${key}`);
  const value = entry.forms[wanted];
  if (value === undefined) throw new Error(`root ${key} has no ${wanted} form`);
  return value;
}
