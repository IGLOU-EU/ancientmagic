import { pick } from '../generator/rng.js';
import { A14_ENEMY, AGENT_POWER, BRIGHT_POWER, DREAD_POWER, EO2_HEAD, FIELD_DET, FIELDS, FN_I, FN_IN, FN_IR, FN_M, FN_MY, FN_N, FN_R, G37_EVIL, IDIOM_WORDS, NUMERAL_WORDS, RN_I, RN_K, RX_I, RX_K, SEAL_HEAD, SIGN_MAP, SUFFIX_GLYPHS, SUFFIX_SKELETON, } from './egyptian-data.js';
export { speakSkeleton, glyphsFor, joinSpoken, degradeSpoken, eldritchSkeleton, composeEgyptian, };
const VOWEL_SIGNS = new Set(['A', 'a', 'i']);
const SPOKEN_VALUE = {
    A: 'a',
    i: 'i',
    y: 'y',
    a: 'a',
    w: 'w',
    b: 'b',
    p: 'p',
    f: 'f',
    m: 'm',
    n: 'n',
    r: 'r',
    h: 'h',
    H: 'h',
    x: 'kh',
    s: 's',
    S: 'sh',
    q: 'q',
    k: 'k',
    g: 'g',
    t: 't',
    T: 'tj',
    d: 'd',
    D: 'dj',
};
const VOWEL_LETTERS = new Set(['a', 'e', 'i', 'o', 'u']);
function signs(skeleton) {
    return Array.from(skeleton);
}
function isConsonantSign(sign) {
    return sign !== undefined && !VOWEL_SIGNS.has(sign);
}
function spokenUnits(skeleton) {
    const tokens = signs(skeleton);
    return tokens.map((sign, index) => {
        if (sign === 'w') {
            const wordFinal = index === tokens.length - 1;
            const between = index > 0 &&
                !wordFinal &&
                isConsonantSign(tokens[index - 1]) &&
                isConsonantSign(tokens[index + 1]);
            if (wordFinal || between)
                return { text: 'u', soft: true };
            return { text: 'w', soft: false };
        }
        const value = SPOKEN_VALUE[sign];
        if (value === undefined) {
            throw new Error(`sign outside the egyptian working set: ${sign} in ${skeleton}`);
        }
        return { text: value, soft: VOWEL_SIGNS.has(sign) || sign === 'y' };
    });
}
function speakUnits(units) {
    let out = '';
    units.forEach((unit, index) => {
        const previous = units[index - 1];
        if (previous !== undefined && !previous.soft && !unit.soft)
            out += 'e';
        out += unit.text;
    });
    return out;
}
function speakSkeleton(skeleton) {
    const spoken = speakUnits(spokenUnits(skeleton));
    const voweled = Array.from(spoken).some((letter) => VOWEL_LETTERS.has(letter));
    return voweled ? spoken : `e${spoken}`;
}
function endsInConsonant(spoken) {
    const last = spoken.charAt(spoken.length - 1);
    return last !== '' && !VOWEL_LETTERS.has(last);
}
function startsWithConsonant(spoken) {
    const first = spoken.charAt(0);
    return first !== '' && !VOWEL_LETTERS.has(first);
}
function joinSpoken(stem, suffixSkeleton) {
    const tail = speakUnits(spokenUnits(suffixSkeleton));
    const bridge = endsInConsonant(stem) && startsWithConsonant(tail) ? 'e' : '';
    return `${stem}${bridge}${tail}`;
}
function glyphsFor(skeleton) {
    const out = [];
    for (const sign of signs(skeleton)) {
        const glyph = SIGN_MAP[sign];
        if (glyph === undefined) {
            throw new Error(`sign outside the egyptian working set: ${sign} in ${skeleton}`);
        }
        if (out[out.length - 1] !== glyph)
            out.push(glyph);
    }
    return out.join('');
}
function eldritchSkeleton(skeleton) {
    const last = skeleton.charAt(skeleton.length - 1);
    return last === 'x' || last === 'q' ? skeleton : `${skeleton}x`;
}
function degradeSpoken(spoken) {
    return Array.from(spoken)
        .map((letter, index) => {
        if (letter === 'e')
            return 'u';
        if (letter === 'a' && index > 0)
            return 'o';
        return letter;
    })
        .join('');
}
function fixed(word) {
    return { role: 'function', glyphs: word.glyphs, spoken: word.spoken, determinatives: '', suffix: '', field: null };
}
function idiomWord(word) {
    return { role: 'idiom', glyphs: word.glyphs, spoken: word.spoken, determinatives: '', suffix: '', field: null };
}
function contentWord(options) {
    const skeleton = options.eldritch ? eldritchSkeleton(options.skeleton) : options.skeleton;
    let spoken = options.spoken;
    if (skeleton !== options.skeleton)
        spoken = joinSpoken(spoken, 'x');
    if (options.suffix !== undefined) {
        spoken = joinSpoken(spoken, SUFFIX_SKELETON[options.suffix]);
    }
    if (options.eldritch)
        spoken = degradeSpoken(spoken);
    let determinatives = FIELD_DET[options.field];
    if (options.eldritch)
        determinatives += options.verb ? A14_ENEMY : G37_EVIL;
    const suffix = options.suffix === undefined ? '' : SUFFIX_GLYPHS[options.suffix];
    return {
        role: 'content',
        glyphs: glyphsFor(skeleton) + determinatives + suffix,
        spoken,
        determinatives,
        suffix,
        field: options.field,
    };
}
function dreadWord(epithet) {
    const determinatives = A14_ENEMY + G37_EVIL;
    return {
        role: 'content',
        glyphs: glyphsFor(epithet.skeleton) + determinatives,
        spoken: epithet.spoken,
        determinatives,
        suffix: '',
        field: 'death',
    };
}
function powerWord(power) {
    return {
        role: 'idiom',
        glyphs: power.glyphs,
        spoken: power.spoken,
        determinatives: '',
        suffix: '',
        field: null,
    };
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
function adjectivesOf(field) {
    return FIELDS[field].filter((r) => fills(r, 'adj'));
}
function requireField(field) {
    if (field === null)
        throw new Error('gene is missing its semantic field');
    return field;
}
function geneField(clause, role) {
    return requireField(clause.genes.find((g) => g.role === role)?.field ?? null);
}
function drawModifier(clause, rng) {
    const field = clause.modifierField;
    if (clause.modifier === null || field === null)
        return { adjective: null, adverb: null };
    if (clause.modifier === 'adjective') {
        return { adjective: pick(rng, adjectivesOf(field)), adverb: null };
    }
    return { adjective: null, adverb: pick(rng, nounsOf(field)) };
}
function adverbPhrase(modifier, clause, eldritch) {
    const root = modifier.adverb;
    if (root === null || clause.modifierField === null)
        return { words: [], root: null };
    return {
        words: [
            fixed(FN_M),
            contentWord({
                skeleton: root.skeleton,
                spoken: root.spoken,
                field: clause.modifierField,
                eldritch,
                verb: false,
            }),
        ],
        root: root.skeleton,
    };
}
function adjectiveWord(modifier, headField, eldritch) {
    const root = modifier.adjective;
    if (root === null)
        return [];
    return [
        contentWord({
            skeleton: root.skeleton,
            spoken: root.spoken,
            field: headField,
            eldritch,
            verb: false,
        }),
    ];
}
function realizeProtectionClause(clause, rng, usedPowers, glosses) {
    const intent = pick(rng, verbsOf(geneField(clause, 'INTENT')));
    const targetField = geneField(clause, 'TARGET');
    const target = pick(rng, nounsOf(targetField));
    const modifier = drawModifier(clause, rng);
    const agent = pick(rng, AGENT_POWER.filter((p) => !usedPowers.has(p.skeleton)));
    usedPowers.add(agent.skeleton);
    const power = pick(rng, BRIGHT_POWER.filter((p) => !usedPowers.has(p.skeleton)));
    usedPowers.add(power.skeleton);
    const adverb = adverbPhrase(modifier, clause, false);
    const words = [
        contentWord({
            skeleton: intent.skeleton,
            spoken: intent.spoken,
            field: geneField(clause, 'INTENT'),
            eldritch: false,
            verb: true,
            suffix: 'i',
        }),
        fixed(FN_R),
        contentWord({
            skeleton: target.skeleton,
            spoken: target.spoken,
            field: targetField,
            eldritch: false,
            verb: false,
        }),
        ...adjectiveWord(modifier, targetField, false),
        fixed(FN_IN),
        powerWord(agent),
        powerWord(power),
        ...adverb.words,
    ];
    return {
        words,
        gloss: glosses.protectionClause({
            intentRoot: intent.skeleton,
            targetRoot: target.skeleton,
            adjectiveRoot: modifier.adjective?.skeleton ?? null,
            adverbRoot: adverb.root,
            agentPower: agent.skeleton,
            freePower: power.skeleton,
        }),
    };
}
function realizeCurseClause(clause, rng, glosses) {
    const targetField = geneField(clause, 'TARGET');
    const target = pick(rng, nounsOf(targetField));
    const intent = pick(rng, verbsOf('harm'));
    const modifier = drawModifier(clause, rng);
    const adverb = adverbPhrase(modifier, clause, false);
    const words = [
        fixed(FN_IR),
        contentWord({
            skeleton: target.skeleton,
            spoken: target.spoken,
            field: targetField,
            eldritch: false,
            verb: false,
        }),
        ...adjectiveWord(modifier, targetField, false),
        contentWord({
            skeleton: intent.skeleton,
            spoken: intent.spoken,
            field: 'harm',
            eldritch: false,
            verb: true,
            suffix: 'f',
        }),
        ...adverb.words,
    ];
    return {
        words,
        gloss: glosses.curseClause({
            targetRoot: target.skeleton,
            intentRoot: intent.skeleton,
            adjectiveRoot: modifier.adjective?.skeleton ?? null,
            adverbRoot: adverb.root,
        }),
    };
}
function realizeInvocationClause(clause, rng, plan, used, glosses) {
    const eldritch = plan.eldritch;
    const agentGenes = clause.genes.filter((g) => g.role === 'AGENT');
    const lastGene = agentGenes[agentGenes.length - 1];
    const chain = plan.difficulty >= 9 && lastGene !== undefined ? [...agentGenes, lastGene] : agentGenes;
    const words = [fixed(FN_I)];
    const agents = [];
    chain.forEach((gene, index) => {
        if (index > 0)
            words.push(fixed(FN_N));
        if (eldritch) {
            const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
            used.add(epithet.skeleton);
            words.push(dreadWord(epithet));
            agents.push({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken });
        }
        else {
            const field = requireField(gene.field);
            const root = pick(rng, nounsOf(field).filter((r) => !used.has(r.skeleton)));
            used.add(root.skeleton);
            words.push(contentWord({
                skeleton: root.skeleton,
                spoken: root.spoken,
                field,
                eldritch: false,
                verb: false,
            }));
            agents.push({ kind: 'root', id: root.skeleton });
        }
    });
    words.push(fixed(FN_MY));
    let invoked;
    if (eldritch) {
        const power = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
        used.add(power.skeleton);
        words.push(dreadWord(power));
        invoked = { kind: 'epithet', id: power.skeleton, spoken: power.spoken };
    }
    else {
        const power = pick(rng, BRIGHT_POWER.filter((p) => !used.has(p.skeleton)));
        used.add(power.skeleton);
        words.push(powerWord(power));
        invoked = { kind: 'power', id: power.skeleton };
    }
    const modifier = drawModifier(clause, rng);
    const adverb = adverbPhrase(modifier, clause, eldritch);
    words.push(...adverb.words);
    return {
        words,
        gloss: glosses.invocationClause({ agents, adverbRoot: adverb.root, power: invoked }),
    };
}
function openingWords(plan, rng, used, glosses) {
    const words = [];
    const glossParts = [];
    const difficulty = plan.difficulty;
    const pushIdiom = (id) => {
        for (const word of IDIOM_WORDS[id])
            words.push(idiomWord(word));
        glossParts.push(glosses.idiom(id));
    };
    const pushTitle = () => {
        for (const word of EO2_HEAD)
            words.push(idiomWord(word));
        if (plan.eldritch) {
            const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
            used.add(epithet.skeleton);
            words.push(dreadWord(epithet));
            glossParts.push(glosses.spellTitle({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken }));
            return;
        }
        const clause = plan.clauses[0];
        const gene = clause?.genes.find((g) => g.role === 'TARGET') ?? clause?.genes.find((g) => g.role === 'AGENT');
        const field = requireField(gene?.field ?? null);
        const root = pick(rng, nounsOf(field));
        words.push(contentWord({
            skeleton: root.skeleton,
            spoken: root.spoken,
            field,
            eldritch: false,
            verb: false,
        }));
        glossParts.push(glosses.spellTitle({ kind: 'root', id: root.skeleton }));
    };
    if (difficulty <= 4) {
        pushTitle();
    }
    else if (difficulty <= 7) {
        pushIdiom(plan.eldritch ? 'ELDRITCH_OPEN' : 'EO1');
    }
    else {
        pushIdiom(plan.eldritch ? 'ELDRITCH_OPEN' : 'EO1');
        pushTitle();
    }
    return { words, gloss: glosses.sentences(glossParts) };
}
function nameKnowledgeLine(plan, address, addressed, glosses) {
    const words = [fixed(FN_I), ...address];
    words.push(...(plan.eldritch ? [fixed(RX_K), fixed(RN_I)] : [fixed(RX_I), fixed(RN_K)]));
    return { words, gloss: glosses.nameKnowledge(addressed, plan.eldritch) };
}
function singleAddress(plan, rng, used, glosses) {
    if (plan.school === 'curse')
        return null;
    if (plan.eldritch) {
        const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
        used.add(epithet.skeleton);
        return nameKnowledgeLine(plan, [dreadWord(epithet)], { kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken }, glosses);
    }
    if (plan.school === 'protection') {
        const god = pick(rng, AGENT_POWER);
        return nameKnowledgeLine(plan, [powerWord(god)], { kind: 'power', id: god.skeleton }, glosses);
    }
    const field = requireField(plan.clauses[0]?.genes.find((g) => g.role === 'AGENT')?.field ?? null);
    const root = pick(rng, nounsOf(field));
    return nameKnowledgeLine(plan, [
        contentWord({
            skeleton: root.skeleton,
            spoken: root.spoken,
            field,
            eldritch: false,
            verb: false,
        }),
    ], { kind: 'root', id: root.skeleton }, glosses);
}
function gateLitany(plan, rng, used, glosses) {
    const words = [];
    const glossParts = [];
    const heads = new Set();
    for (let i = 0; i < 3; i += 1) {
        if (plan.eldritch) {
            const epithet = pick(rng, DREAD_POWER.filter((p) => !used.has(p.skeleton)));
            used.add(epithet.skeleton);
            const line = nameKnowledgeLine(plan, [dreadWord(epithet)], { kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken }, glosses);
            words.push(...line.words);
            glossParts.push(line.gloss);
            continue;
        }
        const head = pick(rng, nounsOf('gates').filter((r) => !heads.has(r.skeleton)));
        heads.add(head.skeleton);
        const tailField = pick(rng, ['night', 'death']);
        const tail = pick(rng, nounsOf(tailField));
        const line = nameKnowledgeLine(plan, [
            contentWord({
                skeleton: head.skeleton,
                spoken: head.spoken,
                field: 'gates',
                eldritch: false,
                verb: false,
            }),
            fixed(FN_N),
            contentWord({
                skeleton: tail.skeleton,
                spoken: tail.spoken,
                field: tailField,
                eldritch: false,
                verb: false,
            }),
        ], { kind: 'gate', headRoot: head.skeleton, tailRoot: tail.skeleton }, glosses);
        words.push(...line.words);
        glossParts.push(line.gloss);
    }
    return { words, gloss: glosses.sentences(glossParts) };
}
function closingIdioms(plan) {
    if (plan.eldritch)
        return ['ELDRITCH_CLOSE'];
    if (plan.difficulty <= 6)
        return ['EC2'];
    if (plan.difficulty <= 8)
        return ['EC1'];
    return ['EC1', 'EC2'];
}
function sealCountFor(plan, rng) {
    if (plan.eldritch)
        return 9;
    if (plan.difficulty === 7)
        return pick(rng, [2, 4]);
    if (plan.difficulty === 8)
        return 7;
    return pick(rng, [9, 12]);
}
function realizeTierOne(plan, rng, glosses) {
    if (plan.eldritch) {
        const epithet = pick(rng, DREAD_POWER);
        return {
            words: [dreadWord(epithet)],
            gloss: glosses.tierOne({ kind: 'epithet', id: epithet.skeleton, spoken: epithet.spoken }),
        };
    }
    const power = pick(rng, BRIGHT_POWER);
    return {
        words: [powerWord(power)],
        gloss: glosses.tierOne({ kind: 'power', id: power.skeleton }),
    };
}
function realizeTierTwo(plan, rng, glosses) {
    const clause = plan.clauses[0];
    if (clause === undefined)
        throw new Error('tier 2 plan has no clause');
    const intentField = geneField(clause, 'INTENT');
    const targetField = geneField(clause, 'TARGET');
    const intent = pick(rng, verbsOf(intentField));
    const target = pick(rng, nounsOf(targetField));
    return {
        words: [
            contentWord({
                skeleton: intent.skeleton,
                spoken: intent.spoken,
                field: intentField,
                eldritch: plan.eldritch,
                verb: true,
            }),
            contentWord({
                skeleton: target.skeleton,
                spoken: target.spoken,
                field: targetField,
                eldritch: plan.eldritch,
                verb: false,
            }),
        ],
        gloss: glosses.tierTwo(intent.skeleton, target.skeleton),
    };
}
function composeEgyptian(plan, rng, glosses) {
    if (plan.difficulty === 1)
        return realizeTierOne(plan, rng, glosses);
    if (plan.difficulty === 2)
        return realizeTierTwo(plan, rng, glosses);
    const words = [];
    const glossParts = [];
    const used = new Set();
    const opening = openingWords(plan, rng, used, glosses);
    words.push(...opening.words);
    glossParts.push(opening.gloss);
    if (plan.difficulty >= 8) {
        const litany = gateLitany(plan, rng, used, glosses);
        words.push(...litany.words);
        glossParts.push(litany.gloss);
    }
    else if (plan.difficulty >= 6) {
        const address = singleAddress(plan, rng, used, glosses);
        if (address !== null) {
            words.push(...address.words);
            glossParts.push(address.gloss);
        }
    }
    for (const clause of plan.clauses) {
        const clauseUsed = new Set(used);
        let realized;
        if (plan.school === 'protection') {
            realized = realizeProtectionClause(clause, rng, clauseUsed, glosses);
        }
        else if (plan.school === 'curse') {
            realized = realizeCurseClause(clause, rng, glosses);
        }
        else {
            realized = realizeInvocationClause(clause, rng, plan, clauseUsed, glosses);
        }
        words.push(...realized.words);
        glossParts.push(realized.gloss);
    }
    if (plan.closing) {
        for (const id of closingIdioms(plan)) {
            for (const word of IDIOM_WORDS[id])
                words.push(idiomWord(word));
            glossParts.push(glosses.idiom(id));
        }
    }
    if (plan.seal) {
        const count = sealCountFor(plan, rng);
        words.push(idiomWord(SEAL_HEAD));
        for (const numeral of NUMERAL_WORDS[count])
            words.push(idiomWord(numeral));
        glossParts.push(glosses.seal(count));
    }
    return { words, gloss: glosses.sentences(glossParts) };
}
function realizeFormula(plan, rng, pack) {
    const { words, gloss } = composeEgyptian(plan, rng, pack.egyptian);
    return {
        glyphs: words.map((word) => word.glyphs).join(''),
        transliteration: words.map((word) => word.spoken).join(' '),
        gloss,
    };
}
export const egyptianGenome = {
    id: 'egyptian',
    realize: realizeFormula,
};
