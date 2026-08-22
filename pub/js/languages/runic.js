import { chance, pick } from '../generator/rng.js';
import { BRIGHT_POWER, CLAUSE_SEP, CROSS_SEP, DREAD_POWER, FIELDS, IDIOM_WORDS, INVOCATION_COME, RUNE_MAP, SEAL_GLYPHS, SEAL_WORDS, WORD_SEP, } from './runic-data.js';
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
function fills(root, role) {
    return root.forms.includes(role);
}
function nounsOf(field) {
    return FIELDS[field].filter((r) => fills(r, 'noun'));
}
function verbsOf(field) {
    return FIELDS[field].filter((r) => fills(r, 'verb'));
}
function transitiveVerbsOf(field) {
    return verbsOf(field).filter((r) => r.intransitive !== true);
}
function adjectivesOf(field) {
    return FIELDS[field].filter((r) => fills(r, 'adj'));
}
function adverbsOf(field) {
    return FIELDS[field].filter((r) => fills(r, 'adv'));
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
function realizeProtectionClause(clause, rng, distort, glosses) {
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
    return {
        words,
        gloss: glosses.protectionClause({
            agentRoot: agent.root,
            intentRoot: intent.root,
            targetRoot: target.root,
            adjectiveRoot: mod.adj?.root ?? null,
            adverbRoot: mod.adv?.root ?? null,
        }),
    };
}
function realizeCurseClause(clause, rng, distort, glosses) {
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
    return {
        words,
        gloss: glosses.curseClause({
            targetRoot: target.root,
            intentRoot: intent.root,
            adjectiveRoot: mod.adj?.root ?? null,
            adverbRoot: mod.adv?.root ?? null,
        }),
    };
}
function realizeInvocationClause(clause, rng, eldritch, distort, usedEpithets, glosses) {
    const agents = [];
    const words = [];
    for (const gene of clause.genes.filter((g) => g.role === 'AGENT')) {
        if (eldritch) {
            const pool = DREAD_POWER.filter((word) => !usedEpithets.has(word));
            const epithet = pick(rng, pool);
            usedEpithets.add(epithet);
            words.push(epithet);
            agents.push({ kind: 'epithet', id: epithet, spoken: epithet });
        }
        else {
            const pool = nounsOf(requireField(gene.field)).filter((r) => !usedEpithets.has(r.root));
            const agent = pick(rng, pool);
            usedEpithets.add(agent.root);
            words.push(nounForm(agent.root, 'az'));
            agents.push({ kind: 'root', id: agent.root });
        }
    }
    const intent = pick(rng, byNames(INVOCATION_COME));
    const mod = realizeModifier(clause, rng, distort);
    if (mod.adv !== null)
        words.push(mod.advWord);
    words.push(verbForm(distort(intent.root), 'bare'));
    let power;
    if (eldritch) {
        power = pick(rng, DREAD_POWER.filter((word) => !usedEpithets.has(word)));
        usedEpithets.add(power);
    }
    else {
        power = pick(rng, BRIGHT_POWER);
    }
    words.push(power);
    return {
        words,
        gloss: glosses.invocationClause({
            agents,
            intentRoot: intent.root,
            adverbRoot: mod.adv?.root ?? null,
            powerWord: power,
        }),
    };
}
function pickOpenings(plan, rng) {
    const d = plan.difficulty;
    if (plan.eldritch) {
        return [d < 6 ? 'ELDRITCH_OPEN_SHORT' : 'ELDRITCH_OPEN_FULL'];
    }
    if (d <= 4)
        return ['RO1'];
    if (d === 5)
        return [pick(rng, ['RO1', 'RO2'])];
    if (d === 6)
        return ['RO2'];
    if (d === 7) {
        return chance(rng, 0.5) ? ['RO2', 'RO3_FIRST_AETT'] : ['RO2'];
    }
    return ['RO3_FULL_ROW'];
}
function pickClosings(plan, rng) {
    if (plan.eldritch)
        return ['ELDRITCH_CLOSE'];
    if (plan.difficulty >= 8)
        return ['RC1', 'RC3'];
    return [pick(rng, ['RC1', 'RC2'])];
}
function litanySegment(plan, rng, glosses) {
    if (plan.powerWordStyle === 'none')
        return null;
    if (plan.powerWordStyle === 'triple') {
        const pool = plan.eldritch ? DREAD_POWER : BRIGHT_POWER;
        const word = pick(rng, pool);
        return { words: [word, word, word], gloss: glosses.litanyTriple(word) };
    }
    const pool = plan.eldritch
        ? DREAD_POWER
        : BRIGHT_POWER.filter((word) => word !== 'alu' && word !== 'ota');
    const base = pick(rng, pool);
    const tokens = tokenizeRunic(base);
    const words = [];
    for (let i = 0; i < tokens.length; i += 1) {
        words.push(tokens.slice(i).join(''));
    }
    return { words, gloss: glosses.litanyTriangle(base) };
}
function realizeTierOne(plan, rng, glosses) {
    const power = pick(rng, plan.eldritch ? DREAD_POWER : BRIGHT_POWER);
    return {
        glyphs: runesFor(power),
        transliteration: power,
        gloss: glosses.tierOne(power, plan.eldritch),
    };
}
function realizeTierTwo(plan, rng, glosses) {
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
        gloss: glosses.tierTwo(intent.root, target.root),
    };
}
function realizeFormula(plan, rng, glosses) {
    if (plan.difficulty === 1)
        return realizeTierOne(plan, rng, glosses);
    if (plan.difficulty === 2)
        return realizeTierTwo(plan, rng, glosses);
    const distort = (root) => (plan.eldritch ? eldritchRoot(root) : root);
    const segments = [];
    const glossParts = [];
    const openings = pickOpenings(plan, rng);
    for (const id of openings)
        glossParts.push(glosses.idiom(id));
    const openingWords = openings.flatMap((id) => [...IDIOM_WORDS[id]]);
    plan.clauses.forEach((clause, index) => {
        const usedEpithets = new Set();
        let realized;
        if (plan.school === 'protection') {
            realized = realizeProtectionClause(clause, rng, distort, glosses);
        }
        else if (plan.school === 'curse') {
            realized = realizeCurseClause(clause, rng, distort, glosses);
        }
        else {
            realized = realizeInvocationClause(clause, rng, plan.eldritch, distort, usedEpithets, glosses);
        }
        segments.push({ words: index === 0 ? [...openingWords, ...realized.words] : realized.words });
        glossParts.push(realized.gloss);
    });
    const litany = litanySegment(plan, rng, glosses);
    if (litany !== null) {
        segments.push({ words: litany.words });
        glossParts.push(litany.gloss);
    }
    if (plan.closing) {
        for (const id of pickClosings(plan, rng)) {
            segments.push({ words: [...IDIOM_WORDS[id]] });
            glossParts.push(glosses.idiom(id));
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
        glossParts.push(glosses.seal(sealCount));
    }
    let glyphs = segments
        .map((segment) => segment.words.map(runesFor).join(WORD_SEP))
        .join(CLAUSE_SEP);
    let transliteration = segments.flatMap((segment) => segment.words).join(' ');
    if (sealCount !== null) {
        glyphs += `${CROSS_SEP}${SEAL_GLYPHS[sealCount]}${CROSS_SEP}`;
        transliteration += ` ${SEAL_WORDS[sealCount]}`;
    }
    return { glyphs, transliteration, gloss: glosses.sentences(glossParts) };
}
export const runicGenome = {
    id: 'runic',
    realize: realizeFormula,
};
