export function mulberry32(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function pick(rng, items) {
    if (items.length === 0)
        throw new Error('pick from an empty pool');
    const item = items[Math.floor(rng() * items.length)];
    if (item === undefined)
        throw new Error('pick indexed out of range');
    return item;
}
export function chance(rng, probability) {
    return rng() < probability;
}
