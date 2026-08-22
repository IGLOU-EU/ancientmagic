export const enGlosses = {
    language: 'en',
    runic: () => import('./runic.js').then((m) => m.runicGlosses),
    egyptian: () => import('./egyptian.js').then((m) => m.egyptianGlosses),
    phoenician: () => import('./phoenician.js').then((m) => m.phoenicianGlosses),
};
