// Two readings of a string the whole suite takes, and neither is a transcription
// of anything: they belong to no genome and to no spec section.

// Every script the site writes has astral signs, and half of them are astral
// throughout, so an assertion that counts, slices or compares signs has to read
// code points rather than the UTF-16 units a string indexes by.
export function codePoints(text: string): string[] {
  return Array.from(text);
}

// Registry keys and coverage sets are compared as lists, and the order a table
// happens to be written in is not part of what is being held.
export function sorted(values: Iterable<string>): string[] {
  return Array.from(values).sort();
}
