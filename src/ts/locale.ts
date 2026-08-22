// One rule for reading the page's language declaration, shared by the UI
// strings registry and the gloss pack registry so the two can never disagree
// on what "en-GB" resolves to.

export function baseLanguage(tag: string): string {
  return tag.toLowerCase().split('-')[0];
}
