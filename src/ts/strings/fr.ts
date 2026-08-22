import type { UiStrings } from './types.js';

export const fr: UiStrings = {
  difficultyTiers: {
    low: 'Murmure',
    mid: 'Rite',
    // Held apart from the Invocation school, which the altar already names.
    high: 'Conjuration',
    peak: 'Grand Œuvre',
  },

  difficultyValueText: (value, tier) => `${value}, ${tier}`,

  glyphLineLabel: (languageLabel) => `Incantation en ${languageLabel}`,

  printCaption: (languageLabel, schoolLabel, difficulty) =>
    `${languageLabel} · ${schoolLabel} · Puissance ${difficulty}`,
};
