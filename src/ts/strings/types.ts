// The strings the runtime needs and the page never shows.
//
// Anything the page already displays (option labels, the copy outcome words) is
// read back from the DOM instead of being repeated here, so every visible word
// has exactly one source. What is left are the templates and the words that only
// appear once JavaScript has run.
//
// Every language implements this interface, so tsc rejects a missing key and a
// key that no longer exists.

export interface DifficultyTiers {
  // Difficulty 1 to 2.
  readonly low: string;
  // 3 to 5.
  readonly mid: string;
  // 6 to 7.
  readonly high: string;
  // 8 to 9.
  readonly peak: string;
}

export interface UiStrings {
  readonly difficultyTiers: DifficultyTiers;

  // Spoken value of the difficulty slider, value and tier together.
  difficultyValueText(value: number, tier: string): string;

  // Accessible name of the glyph block.
  glyphLineLabel(languageLabel: string): string;

  // Caption printed under the manifestation.
  printCaption(languageLabel: string, schoolLabel: string, difficulty: number): string;
}
