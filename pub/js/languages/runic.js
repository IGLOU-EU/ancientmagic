import { chance, pick } from '../generator/rng.js';
import { BRIGHT_POWER, CLAUSE_SEP, CROSS_SEP, DREAD_POWER, ELDRITCH_CLOSE, ELDRITCH_OPEN_FULL, ELDRITCH_OPEN_SHORT, FIELDS, INVOCATION_COME, RC1, RC2, RC3, RO1, RO2, RO3_FIRST_AETT, RO3_FULL_ROW, RUNE_MAP, SEAL_GLOSS, SEAL_GLYPHS, SEAL_WORDS, WORD_SEP, } from './runic-data.js';
export { tokenizeRunic, runesFor, nounForm, verbForm, adjectiveForm, adverbForm, eldritchRoot };
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
function isVowelToken(token) {
    return token === 'ei' || VOWELS.has(token);
}
function tokenizeRunic(word) {
    const tokens = [];
    let i = 0;
    while (i < word.length) {
        const two = word.slice(i, i + 2);
        if (two.length === 2 && RUNE_MAP[two] !== undefined) {
            tokens.push(two);
            i += 2;
            continue;
        }
        const one = word.charAt(i);
        if (RUNE_MAP[one] === undefined) {
            throw new Error(`letter outside the futhark romanization: ${one} in ${word}`);
        }
        tokens.push(one);
        i += 1;
    }
    return tokens;
}
function runesFor(word) {
    const glyphs = [];
    for (const token of tokenizeRunic(word)) {
        const glyph = RUNE_MAP[token];
        if (glyph !== undefined && glyphs[glyphs.length - 1] !== glyph) {
            glyphs.push(glyph);
        }
    }
    return glyphs.join('');
}
function attach(stem, ending) {
    const last = stem.charAt(stem.length - 1);
    const first = ending.charAt(0);
    if (VOWELS.has(last) && VOWELS.has(first)) {
        return stem.slice(0, -1) + ending;
    }
    return stem + ending;
}
function nounForm(root, ending) {
    return attach(root, ending);
}
function verbForm(root, form) {
    return form === 'bare' ? root : attach(root, form);
}
function adjectiveForm(root, ending) {
    return attach(root, ending);
}
function adverbForm(root) {
    return attach(root, 'o');
}
function eldritchRoot(root) {
    const tokens = tokenizeRunic(root);
    const darkened = [];
    for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i] ?? '';
        const next = tokens[i + 1] ?? '';
        if (token === 'a' && (next === 'i' || next === 'u')) {
            darkened.push('u');
            i += 1;
            continue;
        }
        if (token === 'a' || token === 'i')
            darkened.push('u');
        else if (token === 'e')
            darkened.push('o');
        else
            darkened.push(token);
    }
    const vowelAt = darkened.findIndex(isVowelToken);
    if (vowelAt >= 0)
        darkened.splice(vowelAt + 1, 0, 'z');
    if (isVowelToken(darkened[darkened.length - 1] ?? ''))
        darkened.push('h');
    return darkened.join('');
}
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
function nounsOf(field) {
    return FIELDS[field].filter((r) => r.noun !== undefined);
}
function verbsOf(field) {
    return FIELDS[field].filter((r) => r.verb !== undefined);
}
function transitiveVerbsOf(field) {
    return verbsOf(field).filter((r) => r.intransitive !== true);
}
function adjectivesOf(field) {
    return FIELDS[field].filter((r) => r.adj !== undefined);
}
function adverbsOf(field) {
    return FIELDS[field].filter((r) => r.adv !== undefined);
}
function byNames(names) {
    return FIELDS.summoning.filter((r) => names.includes(r.root));
}
function requireField(field) {
    if (field === null)
        throw new Error('gene is missing its semantic field');
    return field;
}
function realizeModifier(clause, rng, distort) {
    const field = clause.modifierField;
    if (clause.modifier === null || field === null) {
        return { adj: null, adv: null, adjWord: '', advWord: '' };
    }
    if (clause.modifier === 'adjective') {
        const root = pick(rng, adjectivesOf(field));
        return { adj: root, adv: null, adjWord: distort(root.root), advWord: '' };
    }
    const root = pick(rng, adverbsOf(field));
    return { adj: null, adv: root, adjWord: '', advWord: adverbForm(distort(root.root)) };
}
function realizeProtectionClause(clause, rng, distort) {
    const agent = pick(rng, nounsOf('warding'));
    const intentField = requireField(clause.genes.find((g) => g.role === 'INTENT')?.field ?? null);
    const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);
    const intent = pick(rng, verbsOf(intentField));
    const target = pick(rng, nounsOf(targetField));
    const mod = realizeModifier(clause, rng, distort);
    const words = [nounForm(distort(agent.root), 'az'), 'withra'];
    if (mod.adj !== null)
        words.push(adjectiveForm(mod.adjWord, 'an'));
    words.push(nounForm(distort(target.root), 'an'));
    if (mod.adv !== null)
        words.push(mod.advWord);
    words.push(verbForm(distort(intent.root), 'o'));
    const adverb = mod.adv !== null ? ` ${mod.adv.adv ?? ''}` : '';
    const adjective = mod.adj !== null ? `${mod.adj.adj ?? ''} ` : '';
    return {
        words,
        gloss: `I, the ${agent.noun ?? ''}, ${intent.verb ?? ''}${adverb} against the ${adjective}${target.noun ?? ''}.`,
    };
}
function realizeCurseClause(clause, rng, distort) {
    const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);
    const target = pick(rng, nounsOf(targetField));
    const intent = pick(rng, verbsOf('harm'));
    const mod = realizeModifier(clause, rng, distort);
    const words = [];
    if (mod.adj !== null)
        words.push(adjectiveForm(mod.adjWord, 'az'));
    words.push(nounForm(distort(target.root), 'az'));
    if (mod.adv !== null)
        words.push(mod.advWord);
    words.push(verbForm(distort(intent.root), 'ai'));
    const adverb = mod.adv !== null ? `${mod.adv.adv ?? ''} ` : '';
    const adjective = mod.adj !== null ? `${mod.adj.adj ?? ''} ` : '';
    return {
        words,
        gloss: `May the ${adjective}${target.noun ?? ''} be ${adverb}${intent.pp ?? ''}.`,
    };
}
function realizeInvocationClause(clause, rng, eldritch, distort, usedEpithets) {
    const vocatives = [];
    const words = [];
    for (const gene of clause.genes.filter((g) => g.role === 'AGENT')) {
        if (eldritch) {
            const pool = DREAD_POWER.filter((p) => !usedEpithets.has(p.word));
            const epithet = pick(rng, pool);
            usedEpithets.add(epithet.word);
            words.push(epithet.word);
            vocatives.push(`O ${epithet.gloss.replace(/^the /, '')}`);
        }
        else {
            const pool = nounsOf(requireField(gene.field)).filter((r) => !usedEpithets.has(r.root));
            const agent = pick(rng, pool);
            usedEpithets.add(agent.root);
            words.push(nounForm(agent.root, 'az'));
            vocatives.push(`O ${agent.noun ?? ''}`);
        }
    }
    const intent = pick(rng, byNames(INVOCATION_COME));
    const mod = realizeModifier(clause, rng, distort);
    if (mod.adv !== null)
        words.push(mod.advWord);
    words.push(verbForm(distort(intent.root), 'bare'));
    let power;
    if (eldritch) {
        power = pick(rng, DREAD_POWER.filter((p) => !usedEpithets.has(p.word)));
        usedEpithets.add(power.word);
    }
    else {
        power = pick(rng, BRIGHT_POWER);
    }
    words.push(power.word);
    const adverb = mod.adv !== null ? ` ${mod.adv.adv ?? ''}` : '';
    return {
        words,
        gloss: `${vocatives.join(', ')}, ${intent.verb ?? ''}${adverb}! ${capitalize(power.word)}!`,
    };
}
function pickOpenings(plan, rng) {
    const d = plan.difficulty;
    if (plan.eldritch) {
        return [d < 6 ? ELDRITCH_OPEN_SHORT : ELDRITCH_OPEN_FULL];
    }
    if (d <= 4)
        return [RO1];
    if (d === 5)
        return [pick(rng, [RO1, RO2])];
    if (d === 6)
        return [RO2];
    if (d === 7) {
        return chance(rng, 0.5) ? [RO2, RO3_FIRST_AETT] : [RO2];
    }
    return [RO3_FULL_ROW];
}
function pickClosings(plan, rng) {
    if (plan.eldritch)
        return [ELDRITCH_CLOSE];
    if (plan.difficulty >= 8)
        return [RC1, RC3];
    return [pick(rng, [RC1, RC2])];
}
function litanySegment(plan, rng) {
    if (plan.powerWordStyle === 'none')
        return null;
    if (plan.powerWordStyle === 'triple') {
        const pool = plan.eldritch ? DREAD_POWER : BRIGHT_POWER;
        const word = pick(rng, pool).word;
        return { words: [word, word, word], gloss: `${capitalize(word)}, spoken three times.` };
    }
    const pool = plan.eldritch
        ? DREAD_POWER
        : BRIGHT_POWER.filter(({ word }) => word !== 'alu' && word !== 'ota');
    const base = pick(rng, pool).word;
    const tokens = tokenizeRunic(base);
    const words = [];
    for (let i = 0; i < tokens.length; i += 1) {
        words.push(tokens.slice(i).join(''));
    }
    return { words, gloss: `${capitalize(base)}, shrinking to a single rune.` };
}
function realizeTierOne(plan, rng) {
    const power = pick(rng, plan.eldritch ? DREAD_POWER : BRIGHT_POWER);
    const gloss = plan.eldritch ? `${capitalize(power.word)}, ${power.gloss}.` : power.gloss;
    return { glyphs: runesFor(power.word), transliteration: power.word, gloss };
}
function realizeTierTwo(plan, rng) {
    const distort = (root) => (plan.eldritch ? eldritchRoot(root) : root);
    const clause = plan.clauses[0];
    if (clause === undefined)
        throw new Error('tier 2 plan has no clause');
    const intentField = requireField(clause.genes.find((g) => g.role === 'INTENT')?.field ?? null);
    const targetField = requireField(clause.genes.find((g) => g.role === 'TARGET')?.field ?? null);
    const intent = pick(rng, transitiveVerbsOf(intentField));
    const target = pick(rng, nounsOf(targetField));
    const words = [verbForm(distort(intent.root), 'bare'), nounForm(distort(target.root), 'an')];
    return {
        glyphs: words.map(runesFor).join(''),
        transliteration: words.join(' '),
        gloss: `${capitalize(intent.verb ?? '')} the ${target.noun ?? ''}!`,
    };
}
function realizeFormula(plan, rng) {
    if (plan.difficulty === 1)
        return realizeTierOne(plan, rng);
    if (plan.difficulty === 2)
        return realizeTierTwo(plan, rng);
    const distort = (root) => (plan.eldritch ? eldritchRoot(root) : root);
    const segments = [];
    const glossParts = [];
    const openings = pickOpenings(plan, rng);
    for (const idiom of openings)
        glossParts.push(idiom.gloss);
    const openingWords = openings.flatMap((idiom) => [...idiom.words]);
    plan.clauses.forEach((clause, index) => {
        const usedEpithets = new Set();
        let realized;
        if (plan.school === 'protection') {
            realized = realizeProtectionClause(clause, rng, distort);
        }
        else if (plan.school === 'curse') {
            realized = realizeCurseClause(clause, rng, distort);
        }
        else {
            realized = realizeInvocationClause(clause, rng, plan.eldritch, distort, usedEpithets);
        }
        segments.push({ words: index === 0 ? [...openingWords, ...realized.words] : realized.words });
        glossParts.push(realized.gloss);
    });
    const litany = litanySegment(plan, rng);
    if (litany !== null) {
        segments.push({ words: litany.words });
        glossParts.push(litany.gloss);
    }
    if (plan.closing) {
        for (const idiom of pickClosings(plan, rng)) {
            segments.push({ words: [...idiom.words] });
            glossParts.push(idiom.gloss);
        }
    }
    let sealCount = null;
    if (plan.seal) {
        if (plan.eldritch)
            sealCount = 9;
        else if (plan.difficulty === 7)
            sealCount = pick(rng, [3, 7]);
        else if (plan.difficulty === 8)
            sealCount = pick(rng, [7, 9]);
        else
            sealCount = pick(rng, [9, 12]);
        glossParts.push(SEAL_GLOSS[sealCount]);
    }
    let glyphs = segments
        .map((segment) => segment.words.map(runesFor).join(WORD_SEP))
        .join(CLAUSE_SEP);
    let transliteration = segments.flatMap((segment) => segment.words).join(' ');
    if (sealCount !== null) {
        glyphs += `${CROSS_SEP}${SEAL_GLYPHS[sealCount]}${CROSS_SEP}`;
        transliteration += ` ${SEAL_WORDS[sealCount]}`;
    }
    return { glyphs, transliteration, gloss: glossParts.join(' ') };
}
export const runicGenome = {
    id: 'runic',
    realize: realizeFormula,
};
