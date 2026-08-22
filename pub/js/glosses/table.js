export function lookup(table, key, what) {
    const value = table[key];
    if (value === undefined)
        throw new Error(`no ${what} gloss for ${key}`);
    return value;
}
export function power(table, key) {
    const value = table[key];
    if (value === undefined)
        throw new Error(`no power gloss for ${key}`);
    return value;
}
export function form(roots, key, wanted) {
    const entry = roots[key];
    if (entry === undefined)
        throw new Error(`no gloss for root ${key}`);
    const value = entry.forms[wanted];
    if (value === undefined)
        throw new Error(`root ${key} has no ${wanted} form`);
    return value;
}
