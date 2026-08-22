// Lookups every pack shares. They throw rather than return a blank, because a
// gap in a pack must never reach the page as a hole in a sentence.

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
