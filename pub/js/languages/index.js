export const GENOME_LOADERS = {
    runic: () => import('./runic.js').then((m) => m.runicGenome),
    egyptian: () => import('./egyptian.js').then((m) => m.egyptianGenome),
    phoenician: () => import('./phoenician.js').then((m) => m.phoenicianGenome),
};
export async function loadGenome(id) {
    const load = GENOME_LOADERS[id];
    if (load === undefined) {
        throw new Error(`genome not available yet: ${id}`);
    }
    return load();
}
