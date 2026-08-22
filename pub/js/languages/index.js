export function bindGenome(genome, glosses) {
    return {
        id: genome.id,
        realize: (plan, rng) => genome.realize(plan, rng, glosses),
    };
}
function fetchBound(rules, slice) {
    return Promise.all([rules, slice()]).then(([genome, glosses]) => bindGenome(genome, glosses));
}
export const GENOME_LOADERS = {
    runic: (pack) => fetchBound(import('./runic.js').then((m) => m.runicGenome), pack.runic),
    egyptian: (pack) => fetchBound(import('./egyptian.js').then((m) => m.egyptianGenome), pack.egyptian),
    phoenician: (pack) => fetchBound(import('./phoenician.js').then((m) => m.phoenicianGenome), pack.phoenician),
};
export async function loadGenome(id, glosses) {
    const load = GENOME_LOADERS[id];
    if (load === undefined) {
        throw new Error(`genome not available yet: ${id}`);
    }
    return load(glosses);
}
