export const fr = {
    difficultyTiers: {
        low: 'Murmure',
        mid: 'Rite',
        high: 'Conjuration',
        peak: 'Grand Œuvre',
    },
    difficultyValueText: (value, tier) => `${value}, ${tier}`,
    glyphLineLabel: (languageLabel) => `Incantation en ${languageLabel}`,
    printCaption: (languageLabel, schoolLabel, difficulty) => `${languageLabel} · ${schoolLabel} · Puissance ${difficulty}`,
};
