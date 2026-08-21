import { chance, pick } from './rng.js';
const PROTECTION_INTENT = ['warding', 'binding'];
const PROTECTION_TARGET = ['harm', 'death', 'night', 'fire'];
const CURSE_TARGET = ['death', 'night', 'hidden', 'gates'];
const INVOCATION_AGENT = ['night', 'fire', 'time', 'death'];
const ELDRITCH_TARGET = ['night', 'death', 'gates'];
const ADJECTIVE_FIELDS = ['night', 'harm', 'death'];
const ADVERB_FIELDS = ['hidden', 'night', 'harm'];
function clauseCount(difficulty) {
    if (difficulty <= 5)
        return 1;
    if (difficulty <= 7)
        return 2;
    return 3;
}
function powerWordStyle(difficulty) {
    if (difficulty === 8)
        return 'triple';
    if (difficulty === 9)
        return 'triangle';
    return 'none';
}
function agentCount(difficulty) {
    return 1 + (difficulty >= 6 ? 1 : 0) + (difficulty >= 8 ? 1 : 0);
}
function buildClause(school, difficulty, rng) {
    const genes = [];
    let invocationLike = false;
    if (school === 'protection') {
        genes.push({ role: 'AGENT', field: 'warding', flavor: null });
        genes.push({ role: 'INTENT', field: pick(rng, PROTECTION_INTENT), flavor: 'first-person' });
        genes.push({ role: 'TARGET', field: pick(rng, PROTECTION_TARGET), flavor: null });
    }
    else if (school === 'curse') {
        genes.push({ role: 'TARGET', field: pick(rng, CURSE_TARGET), flavor: null });
        genes.push({ role: 'INTENT', field: 'harm', flavor: 'optative' });
    }
    else {
        invocationLike = true;
        for (let i = 0; i < agentCount(difficulty); i += 1) {
            genes.push({ role: 'AGENT', field: pick(rng, INVOCATION_AGENT), flavor: null });
        }
        genes.push({ role: 'INTENT', field: 'summoning', flavor: 'imperative' });
        genes.push({ role: 'POWER-WORD', field: null, flavor: null });
    }
    let modifier = null;
    let modifierField = null;
    const wantsModifier = difficulty === 4 || (difficulty >= 5 && chance(rng, 0.5));
    if (wantsModifier) {
        modifier = invocationLike ? 'adverb' : pick(rng, ['adjective', 'adverb']);
        modifierField = pick(rng, modifier === 'adjective' ? ADJECTIVE_FIELDS : ADVERB_FIELDS);
        genes.push({ role: 'MODIFIER', field: modifierField, flavor: null });
    }
    return {
        genes,
        modifier,
        modifierField,
        agentCount: invocationLike ? agentCount(difficulty) : 0,
    };
}
export function buildPlan(school, difficulty, rng) {
    const eldritch = school === 'eldritch';
    const base = {
        school,
        difficulty,
        eldritch,
        powerWordStyle: powerWordStyle(difficulty),
    };
    if (difficulty === 1) {
        return {
            ...base,
            opening: false,
            closing: false,
            seal: false,
            clauses: [
                {
                    genes: [{ role: 'POWER-WORD', field: null, flavor: null }],
                    modifier: null,
                    modifierField: null,
                    agentCount: 0,
                },
            ],
        };
    }
    if (difficulty === 2) {
        const genes = [];
        if (school === 'protection') {
            genes.push({ role: 'INTENT', field: pick(rng, PROTECTION_INTENT), flavor: 'imperative' });
            genes.push({ role: 'TARGET', field: pick(rng, PROTECTION_TARGET), flavor: null });
        }
        else if (school === 'curse') {
            genes.push({ role: 'INTENT', field: 'harm', flavor: 'imperative' });
            genes.push({ role: 'TARGET', field: pick(rng, CURSE_TARGET), flavor: null });
        }
        else {
            genes.push({ role: 'INTENT', field: 'summoning', flavor: 'imperative' });
            genes.push({
                role: 'TARGET',
                field: pick(rng, eldritch ? ELDRITCH_TARGET : INVOCATION_AGENT),
                flavor: null,
            });
        }
        return {
            ...base,
            opening: false,
            closing: false,
            seal: false,
            clauses: [{ genes, modifier: null, modifierField: null, agentCount: 0 }],
        };
    }
    const clauses = [];
    for (let i = 0; i < clauseCount(difficulty); i += 1) {
        clauses.push(buildClause(school, difficulty, rng));
    }
    return {
        ...base,
        opening: true,
        closing: difficulty >= 5,
        seal: difficulty >= 7,
        clauses,
    };
}
