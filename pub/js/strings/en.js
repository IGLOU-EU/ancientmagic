export const en = {
    difficultyTiers: {
        low: 'Whisper',
        mid: 'Rite',
        high: 'Invocation',
        peak: 'Great Work',
    },
    difficultyValueText: (value, tier) => `${value}, ${tier}`,
    glyphLineLabel: (languageLabel) => `Incantation in ${languageLabel}`,
    printCaption: (languageLabel, schoolLabel, difficulty) => `${languageLabel} · ${schoolLabel} · Power ${difficulty}`,
};
