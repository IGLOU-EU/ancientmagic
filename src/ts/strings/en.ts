import type { UiStrings } from './types.js';

export const en: UiStrings = {
  difficultyTiers: {
    low: 'Whisper',
    mid: 'Rite',
    high: 'Invocation',
    peak: 'Great Work',
  },

  difficultyValueText: (value, tier) => `${value}, ${tier}`,

  glyphLineLabel: (languageLabel) => `Incantation in ${languageLabel}`,

  printCaption: (languageLabel, schoolLabel, difficulty) =>
    `${languageLabel} · ${schoolLabel} · Power ${difficulty}`,
};
