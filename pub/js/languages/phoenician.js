import { pick } from '../generator/rng.js';
import { ALF, BRIGHT_NAMES, DARK_NAMES, DREAD_POWER, FIELDS, IDIOM_WORDS, INVOCATION_COME, LETTER_MAP, NUMERAL_GLYPHS, NUMERAL_WORDS, PLURAL_SPOKEN, PO1_HEAD, PO2_HEAD, PO3_HEAD, PROCLITIC_SPOKEN, SEAL_HEAD, THEOPHORIC_SKELETON, THEOPHORIC_SPOKEN, WORD_SEP, YT, } from './phoenician-data.js';
export { tokenize, glyphsFor, speak, citation, conjugate, degrade, eldritchRoot, transitiveVerbsOf, composePhoenician, };
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
function tokenize(word) {
    const tokens = [];
    let i = 0;
    while (i < word.length) {
        const two = word.slice(i, i + 2);
        if (two.length === 2 && LETTER_MAP[two] !== undefined) {
            tokens.push(two);
            i += 2;
            continue;
        }
        const one = word.charAt(i);
        if (LETTER_MAP[one] === undefined && !VOWELS.has(one)) {
            throw new Error(`letter outside the phoenician romanization: ${one} in ${word}`);
        }
        tokens.push(one);
        i += 1;
    }
    return tokens;
}
function glyphsFor(vocalized) {
    const glyphs = [];
    const push = (glyph) => {
        if (glyphs[glyphs.length - 1] !== glyph)
            glyphs.push(glyph);
    };
    tokenize(vocalized).forEach((token, index) => {
        if (VOWELS.has(token)) {
            if (index === 0)
                push(ALF);
            return;
        }
        const glyph = LETTER_MAP[token];
        if (glyph !== undefined)
            push(glyph);
    });
    return glyphs.join('');
}
function speak(vocalized) {
    return tokenize(vocalized)
        .map((token) => (token === "'" ? '' : token === 'tt' ? 't' : token))
        .join('');
}
function radicals(root) {
    return tokenize(root);
}
function citation(root) {
    const c = radicals(root);
    const at = (index) => c[index] ?? '';
    if (c.length === 2)
        return `${at(0)}o${at(1)}`;
    if (c.length === 3)
        return `${at(0)}a${at(1)}o${at(2)}`;
    if (c.length === 4)
        return `${at(0)}a${at(1)}${at(2)}e${at(3)}`;
    if (c.length === 1)
        return `${at(0)}a`;
    throw new Error(`root outside the one to four radical range: ${root}`);
}
const PREFIXED = {
    'jussive-3ms': ['ya', 'u'],
    'jussive-3fs': ['ta', 'u'],
    'imperfect-1sg': ["'a", 'o'],
};
const BARE = {
    imperative: ['e', 'o'],
    perfect: ['a', 'a'],
};
function conjugate(root, form) {
    const c = radicals(root);
    if (c.length < 3) {
        throw new Error(`no verb pattern below three radicals: ${root}`);
    }
    const last = c[c.length - 1] ?? '';
    const prefixed = PREFIXED[form];
    if (prefixed !== undefined) {
        const [prefix, vowel] = prefixed;
        return `${prefix}${c.slice(0, -1).join('')}${vowel}${last}`;
    }
    const bare = BARE[form];
    if (bare === undefined)
        throw new Error(`unknown verb form: ${form}`);
    const [first, second] = bare;
    return `${c[0] ?? ''}${first}${c.slice(1, -1).join('')}${second}${last}`;
}
function degrade(vocalized) {
    return vocalized.replace(/a/gu, 'o').replace(/e/gu, 'u');
}
const EMPHATIC = { t: 'tt', s: 'ts', k: 'q' };
function eldritchRoot(root) {
    const shifted = radicals(root).map((radical) => EMPHATIC[radical] ?? radical);
    return `${shifted.join('')}gh`;
}
function derived(vocalized, role, root = null) {
    return {
        glyphs: glyphsFor(vocalized),
        spoken: speak(vocalized),
        kind: 'content',
        role,
        vocalized,
        root,
    };
}
function fixed(word, role = 'idiom') {
    return { glyphs: word.glyphs, spoken: word.spoken, kind: 'idiom', role, vocalized: null, root: null };
}
function nameWord(name, role, proclitic) {
    const head = proclitic === undefined ? '' : LETTER_MAP[proclitic] ?? '';
    const spoken = proclitic === undefined ? '' : PROCLITIC_SPOKEN[proclitic];
    return {
        glyphs: head + name.glyphs,
        spoken: spoken + name.spoken,
        kind: 'power',
        role,
        vocalized: null,
        root: null,
    };
}
function dreadWord(epithet, role, proclitic) {
    const head = proclitic === undefined ? '' : proclitic;
    return {
        glyphs: glyphsFor(`${head}${head === '' ? '' : 'e'}${epithet.skeleton}`),
        spoken: (proclitic === undefined ? '' : PROCLITIC_SPOKEN[proclitic]) + epithet.spoken,
        kind: 'dread',
        role,
        vocalized: null,
        root: epithet.skeleton,
    };
}
function stemOf(root, eldritch, pattern) {
    const skeleton = eldritch ? eldritchRoot(root) : root;
    const vocalized = pattern(skeleton);
    return eldritch ? degrade(vocalized) : vocalized;
}
function affix(stem, options) {
    const proclitic = options.proclitic === undefined ? '' : PROCLITIC_SPOKEN[options.proclitic];
    const article = options.article === true ? PROCLITIC_SPOKEN.h : '';
    const plural = options.plural === true ? PLURAL_SPOKEN : '';
    return `${proclitic}${article}${stem}${plural}`;
}
function nounWord(root, role, options) {
    const skeleton = options.eldritch ? eldritchRoot(root.root) : root.root;
    const stem = stemOf(root.root, options.eldritch, citation);
    return derived(affix(stem, options), role, skeleton);
}
function verbWord(root, form, options) {
    const skeleton = options.eldritch ? eldritchRoot(root.root) : root.root;
    const stem = stemOf(root.root, options.eldritch, (s) => conjugate(s, form));
    return derived(affix(stem, options), 'intent', skeleton);
}
function requireField(field) {
    if (field === null)
        throw new Error('gene is missing its semantic field');
    return field;
}
function geneField(clause, role) {
    return requireField(clause.genes.find((g) => g.role === role)?.field ?? null);
}
function poolOf(field, eldritch) {
    const roots = FIELDS[field];
    return eldritch ? roots.filter((r) => radicals(r.root).length === 3) : [...roots];
}
function fills(root, role) {
    return root.forms.includes(role);
}
function nounsOf(field, eldritch = false) {
    return poolOf(field, eldritch).filter((r) => fills(r, 'noun'));
}
function verbsOf(field, eldritch = false) {
    return poolOf(field, eldritch).filter((r) => fills(r, 'verb'));
}
function transitiveVerbsOf(field, eldritch = false) {
    return verbsOf(field, eldritch).filter((r) => r.intransitive !== true);
}
function adjectivesOf(field, eldritch = false) {
    return poolOf(field, eldritch).filter((r) => fills(r, 'adj'));
}
function comeVerbsOf(eldritch) {
    return poolOf('summoning', eldritch).filter((r) => INVOCATION_COME.includes(r.root));
}
const NO_MODIFIER = { adjective: null, adverb: null };
function drawModifier(clause, rng, eldritch) {
    const field = clause.modifierField;
    if (clause.modifier === null || field === null)
        return NO_MODIFIER;
    if (clause.modifier === 'adjective') {
        return { adjective: pick(rng, adjectivesOf(field, eldritch)), adverb: null };
    }
    return { adjective: null, adverb: pick(rng, nounsOf(field, eldritch)) };
}
function adverbPhrase(modifier, eldritch) {
    const root = modifier.adverb;
    if (root === null)
        return { words: [], root: null };
    return {
        words: [nounWord(root, 'adverb', { eldritch, proclitic: 'b' })],
        root: root.root,
    };
}
function adjectiveWord(modifier, eldritch, options) {
    const root = modifier.adjective;
    if (root === null)
        return [];
    return [
        nounWord(root, 'modifier', {
            eldritch,
            article: options.article,
            plural: options.plural,
        }),
    ];
}
function chainLength(difficulty) {
    if (difficulty >= 9)
        return 3;
    if (difficulty >= 8)
        return 2;
    return 1;
}
function genitiveChain(field, count, rng, eldritch, used) {
    const words = [];
    const roots = [];
    for (let i = 0; i < count; i += 1) {
        const root = pick(rng, nounsOf(field, eldritch).filter((r) => !used.has(r.root)));
        used.add(root.root);
        words.push(nounWord(root, 'agent', { eldritch, plural: true }));
        roots.push(root.root);
    }
    return { words, roots };
}
function powerPool(plan) {
    return plan.school === 'curse' ? DARK_NAMES : BRIGHT_NAMES;
}
function realizeJussiveClause(plan, clause, rng, used, consumed, glosses) {
    const clauseUsed = new Set(used);
    const agent = pick(rng, powerPool(plan).filter((n) => !clauseUsed.has(n.skeleton)));
    clauseUsed.add(agent.skeleton);
    const agentField = plan.school === 'curse' ? 'harm' : geneField(clause, 'AGENT');
    const chain = genitiveChain(agentField, chainLength(plan.difficulty) - 1, rng, false, new Set());
    const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT')));
    const modifier = consumed.target ? consumed.modifier : drawModifier(clause, rng, false);
    const words = [
        verbWord(intent, agent.feminine ? 'jussive-3fs' : 'jussive-3ms', { eldritch: false }),
        nameWord(agent, 'agent'),
        ...chain.words,
    ];
    let targetRoot = null;
    if (!consumed.target) {
        const targetField = geneField(clause, 'TARGET');
        const target = pick(rng, nounsOf(targetField));
        words.push(fixed(YT, 'marker'));
        words.push(nounWord(target, 'target', { eldritch: false, article: true }));
        words.push(...adjectiveWord(modifier, false, { article: true, plural: false }));
        targetRoot = target.root;
    }
    let power = null;
    if (plan.school === 'protection') {
        power = pick(rng, powerPool(plan).filter((n) => !clauseUsed.has(n.skeleton)));
        clauseUsed.add(power.skeleton);
        words.push(nameWord(power, 'power'));
    }
    const adverb = adverbPhrase(modifier, false);
    words.push(...adverb.words);
    return {
        words,
        gloss: glosses.jussiveClause({
            agentPower: agent.skeleton,
            chainRoots: chain.roots,
            intentRoot: intent.root,
            targetRoot,
            adjectiveRoot: targetRoot === null ? null : modifier.adjective?.root ?? null,
            freePower: power?.skeleton ?? null,
            adverbRoot: adverb.root,
        }),
    };
}
function realizeInvocationClause(plan, clause, rng, used, glosses) {
    const eldritch = plan.eldritch;
    const clauseUsed = new Set(used);
    const words = [];
    const agents = [];
    const agentGenes = clause.genes.filter((g) => g.role === 'AGENT');
    for (let i = 0; i < chainLength(plan.difficulty); i += 1) {
        if (eldritch) {
            const epithet = pick(rng, DREAD_POWER.filter((e) => !clauseUsed.has(e.skeleton)));
            clauseUsed.add(epithet.skeleton);
            words.push(dreadWord(epithet, 'agent'));
            agents.push({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken });
            continue;
        }
        const field = requireField(agentGenes[i]?.field ?? agentGenes[0]?.field ?? null);
        const root = pick(rng, nounsOf(field).filter((r) => !clauseUsed.has(r.root)));
        clauseUsed.add(root.root);
        words.push(nounWord(root, 'agent', { eldritch: false, plural: i > 0 }));
        agents.push({ kind: 'root', id: root.root });
    }
    const intent = pick(rng, comeVerbsOf(eldritch));
    words.push(verbWord(intent, 'imperative', { eldritch }));
    let invoked;
    if (eldritch) {
        const epithet = pick(rng, DREAD_POWER.filter((e) => !clauseUsed.has(e.skeleton)));
        clauseUsed.add(epithet.skeleton);
        words.push(dreadWord(epithet, 'power'));
        invoked = { kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken };
    }
    else {
        const name = pick(rng, BRIGHT_NAMES.filter((n) => !clauseUsed.has(n.skeleton)));
        clauseUsed.add(name.skeleton);
        words.push(nameWord(name, 'power'));
        invoked = { kind: 'power', id: name.skeleton };
    }
    const modifier = drawModifier(clause, rng, eldritch);
    const adverb = adverbPhrase(modifier, eldritch);
    words.push(...adverb.words);
    return {
        words,
        gloss: glosses.invocationClause({
            agents,
            intentRoot: intent.root,
            power: invoked,
            adverbRoot: adverb.root,
        }),
    };
}
function selfPresentation(plan, rng, used, glosses) {
    const words = [fixed(PO2_HEAD)];
    if (plan.eldritch) {
        const epithet = pick(rng, DREAD_POWER.filter((e) => !used.has(e.skeleton)));
        used.add(epithet.skeleton);
        words.push(dreadWord(epithet, 'idiom', 'l'));
        return { words, gloss: glosses.selfPresentationByEpithet(epithet.skeleton) };
    }
    const root = pick(rng, nounsOf('warding'));
    const stem = speak(citation(root.root)).replace(/^gh/u, '');
    const spoken = `${stem}${THEOPHORIC_SPOKEN}`;
    words.push({
        glyphs: glyphsFor(`${citation(root.root)}${THEOPHORIC_SKELETON}`),
        spoken,
        kind: 'idiom',
        role: 'idiom',
        vocalized: null,
        root: null,
    });
    return { words, gloss: glosses.selfPresentationByName(spoken) };
}
function schoolOpener(plan, rng, used, glosses) {
    const clause = plan.clauses[0];
    if (clause === undefined)
        throw new Error('plan has no clause');
    if (plan.eldritch) {
        const epithet = pick(rng, DREAD_POWER.filter((e) => !used.has(e.skeleton)));
        used.add(epithet.skeleton);
        return {
            words: [fixed(PO1_HEAD), dreadWord(epithet, 'target', 'b')],
            gloss: glosses.openerByEpithet(epithet.skeleton),
            consumed: { target: false, modifier: NO_MODIFIER },
        };
    }
    if (plan.school === 'invocation') {
        const god = pick(rng, BRIGHT_NAMES);
        used.add(god.skeleton);
        return {
            words: [fixed(PO3_HEAD), nameWord(god, 'idiom', 'l')],
            gloss: glosses.openerToLord(god.skeleton),
            consumed: { target: false, modifier: NO_MODIFIER },
        };
    }
    const targetField = geneField(clause, 'TARGET');
    const target = pick(rng, nounsOf(targetField));
    const modifier = drawModifier(clause, rng, false);
    const words = [
        fixed(PO1_HEAD),
        nounWord(target, 'target', { eldritch: false, plural: true, proclitic: 'l' }),
        ...adjectiveWord(modifier, false, { article: false, plural: true }),
    ];
    return {
        words,
        gloss: glosses.openerAgainst(target.root, modifier.adjective?.root ?? null),
        consumed: { target: true, modifier },
    };
}
function shrinkSteps(skeleton, glyphs, spoken, eldritch) {
    const letters = Array.from(glyphs);
    const c = radicals(skeleton);
    const words = [];
    for (let i = 0; i < letters.length; i += 1) {
        const kept = c.slice(0, c.length - i).join('');
        const truncated = citation(kept);
        words.push({
            glyphs: letters.slice(0, letters.length - i).join(''),
            spoken: i === 0 ? spoken : speak(eldritch ? degrade(truncated) : truncated),
            kind: 'idiom',
            role: 'litany',
            vocalized: null,
            root: kept,
        });
    }
    return words;
}
function shrinkPool(plan) {
    if (plan.eldritch) {
        return DREAD_POWER.map((e) => ({
            skeleton: e.skeleton,
            glyphs: glyphsFor(e.skeleton),
            spoken: e.spoken,
        }));
    }
    return powerPool(plan)
        .filter((n) => radicals(n.skeleton).length === 3)
        .filter((n) => glyphsFor(n.skeleton).length === n.glyphs.length)
        .map((n) => ({ skeleton: n.skeleton, glyphs: n.glyphs, spoken: n.spoken }));
}
function litany(plan, rng, glosses) {
    if (plan.powerWordStyle === 'none')
        return null;
    if (plan.powerWordStyle === 'triple') {
        if (plan.eldritch) {
            const epithet = pick(rng, DREAD_POWER);
            const word = dreadWord(epithet, 'litany');
            return {
                words: [word, word, word],
                gloss: glosses.litanyTriple({
                    kind: 'epithet',
                    id: epithet.skeleton,
                    spoken: epithet.spoken,
                }),
            };
        }
        const name = pick(rng, powerPool(plan));
        const word = nameWord(name, 'litany');
        return {
            words: [word, word, word],
            gloss: glosses.litanyTriple({ kind: 'power', id: name.skeleton }),
        };
    }
    const base = pick(rng, shrinkPool(plan));
    return {
        words: shrinkSteps(base.skeleton, base.glyphs, base.spoken, plan.eldritch),
        gloss: glosses.litanyTriangle(base.spoken),
    };
}
function closingIdioms(plan) {
    if (plan.eldritch)
        return ['ELDRITCH_CLOSE'];
    const own = plan.school === 'curse' ? 'PC2' : 'PC1';
    return plan.difficulty >= 9 ? [own, 'PC3'] : [own];
}
function sealCountFor(plan, rng) {
    if (plan.eldritch)
        return 9;
    if (plan.difficulty === 7)
        return pick(rng, [3, 7]);
    if (plan.difficulty === 8)
        return pick(rng, [7, 9]);
    return pick(rng, [9, 12]);
}
function realizeTierOne(plan, rng, glosses) {
    if (plan.eldritch) {
        const epithet = pick(rng, DREAD_POWER);
        return {
            words: [dreadWord(epithet, 'power')],
            gloss: glosses.tierOne({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken }),
        };
    }
    const name = pick(rng, powerPool(plan));
    return {
        words: [nameWord(name, 'power')],
        gloss: glosses.tierOne({ kind: 'power', id: name.skeleton }),
    };
}
function realizeTierTwo(plan, rng, glosses) {
    const clause = plan.clauses[0];
    if (clause === undefined)
        throw new Error('tier 2 plan has no clause');
    const eldritch = plan.eldritch;
    const intent = pick(rng, transitiveVerbsOf(geneField(clause, 'INTENT'), eldritch));
    const target = pick(rng, nounsOf(geneField(clause, 'TARGET'), eldritch));
    return {
        words: [
            verbWord(intent, 'imperative', { eldritch }),
            nounWord(target, 'target', { eldritch }),
        ],
        gloss: glosses.tierTwo(intent.root, target.root),
    };
}
function joinWithW(word) {
    const vocalized = word.vocalized === null ? null : `${PROCLITIC_SPOKEN.w}${word.vocalized}`;
    return {
        ...word,
        glyphs: vocalized === null ? `${LETTER_MAP.w ?? ''}${word.glyphs}` : glyphsFor(vocalized),
        spoken: `${PROCLITIC_SPOKEN.w}${word.spoken}`,
        vocalized,
        joined: true,
    };
}
function composePhoenician(plan, rng, glosses) {
    if (plan.difficulty === 1)
        return realizeTierOne(plan, rng, glosses);
    if (plan.difficulty === 2)
        return realizeTierTwo(plan, rng, glosses);
    const words = [];
    const glossParts = [];
    const used = new Set();
    if (plan.difficulty >= 6) {
        const presentation = selfPresentation(plan, rng, used, glosses);
        words.push(...presentation.words);
        glossParts.push(presentation.gloss);
    }
    const opener = schoolOpener(plan, rng, used, glosses);
    words.push(...opener.words);
    glossParts.push(opener.gloss);
    const jussive = plan.school === 'protection' || plan.school === 'curse';
    plan.clauses.forEach((clause, index) => {
        const consumed = index === 0 ? opener.consumed : { target: false, modifier: NO_MODIFIER };
        const realized = jussive
            ? realizeJussiveClause(plan, clause, rng, used, consumed, glosses)
            : realizeInvocationClause(plan, clause, rng, used, glosses);
        const first = realized.words[0];
        if (index > 0 && first !== undefined) {
            realized.words[0] = joinWithW(first);
        }
        words.push(...realized.words);
        glossParts.push(realized.gloss);
    });
    const repeated = litany(plan, rng, glosses);
    if (repeated !== null) {
        words.push(...repeated.words);
        glossParts.push(repeated.gloss);
    }
    if (plan.closing) {
        for (const id of closingIdioms(plan)) {
            for (const word of IDIOM_WORDS[id])
                words.push(fixed(word));
            glossParts.push(glosses.idiom(id));
        }
    }
    if (plan.seal) {
        const count = sealCountFor(plan, rng);
        words.push(fixed(SEAL_HEAD, 'seal'));
        words.push({
            glyphs: NUMERAL_GLYPHS[count],
            spoken: NUMERAL_WORDS[count],
            kind: 'idiom',
            role: 'seal',
            vocalized: null,
            root: null,
        });
        glossParts.push(glosses.seal(count));
    }
    return { words, gloss: glosses.sentences(glossParts) };
}
function realizeFormula(plan, rng, glosses) {
    const { words, gloss } = composePhoenician(plan, rng, glosses);
    const separator = plan.difficulty <= 2 ? '' : WORD_SEP;
    return {
        glyphs: words.map((word) => word.glyphs).join(separator),
        transliteration: words.map((word) => word.spoken).join(' '),
        gloss,
    };
}
export const phoenicianGenome = {
    id: 'phoenician',
    realize: realizeFormula,
};
