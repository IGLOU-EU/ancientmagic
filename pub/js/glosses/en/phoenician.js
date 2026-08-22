import { form, lookup, power } from '../table.js';
import { before, capitalize, vocative } from './text.js';
const roots = {
    mgn: { gloss: 'shield', forms: { noun: 'shield', plural: 'shields', verb: 'shield', pp: 'shielded' } },
    ntsr: { gloss: 'guard', forms: { noun: 'guard', plural: 'guards', verb: 'guard', pp: 'guarded' } },
    shmr: { gloss: 'watch over', forms: { noun: 'watcher', plural: 'watchers', verb: 'watch over', pp: 'watched over' } },
    gdr: { gloss: 'wall in', forms: { noun: 'wall', plural: 'walls', verb: 'wall in', pp: 'walled in' } },
    skk: { gloss: 'screen, overshadow', forms: { noun: 'screen', plural: 'screens', verb: 'overshadow', pp: 'overshadowed' } },
    smk: { gloss: 'uphold', forms: { noun: 'support', plural: 'supports', verb: 'uphold', pp: 'upheld' } },
    ghzr: { gloss: 'gird round', forms: { noun: 'girdle', plural: 'girdles', verb: 'gird round', pp: 'girded round' } },
    khsn: { gloss: 'make strong', forms: { noun: 'stronghold', plural: 'strongholds', verb: 'make strong', pp: 'made strong' } },
    khpp: { gloss: 'canopy over', forms: { noun: 'canopy', plural: 'canopies', verb: 'canopy over', pp: 'canopied' } },
    swg: { gloss: 'fence about', forms: { noun: 'fence', plural: 'fences', verb: 'fence about', pp: 'fenced about' } },
    "'rr": { gloss: 'curse', forms: { noun: 'curse', plural: 'curses', verb: 'curse', pp: 'cursed' } },
    qll: { gloss: 'revile', forms: { verb: 'revile', pp: 'reviled', adj: 'reviled' } },
    ngp: { gloss: 'strike with plague', forms: { noun: 'plague', plural: 'plagues', verb: 'strike with plague', pp: 'plague-struck' } },
    shbr: { gloss: 'shatter', forms: { noun: 'shattering', plural: 'shatterings', verb: 'shatter', pp: 'shattered' } },
    mkhts: { gloss: 'smite', forms: { verb: 'smite', pp: 'smitten' } },
    khbl: { gloss: 'ruin', forms: { noun: 'ruin', plural: 'ruins', verb: 'ruin', pp: 'ruined' } },
    hdp: { gloss: 'thrust down', forms: { verb: 'thrust down', pp: 'thrust down' } },
    "'bd": { gloss: 'destroy', forms: { noun: 'destruction', plural: 'destructions', verb: 'destroy', pp: 'destroyed' } },
    khrb: { gloss: 'lay waste', forms: { verb: 'lay waste', pp: 'laid waste', adj: 'wasted' } },
    rtsts: { gloss: 'crush', forms: { verb: 'crush', pp: 'crushed', adj: 'crushed' } },
    "qr'": { gloss: 'call', forms: { noun: 'call', plural: 'calls', verb: 'call', pp: 'called' } },
    zghq: { gloss: 'cry out', forms: { noun: 'outcry', plural: 'outcries', verb: 'cry out', pp: 'cried out to' } },
    shlkh: { gloss: 'send for', forms: { verb: 'send for', pp: 'sent for' } },
    "bw'": { gloss: 'bring in', forms: { noun: 'coming', plural: 'comings', verb: 'come in', pp: 'brought in' } },
    ngd: { gloss: 'announce', forms: { verb: 'announce', pp: 'announced' } },
    pqd: { gloss: 'muster', forms: { verb: 'muster', pp: 'mustered' } },
    "'sp": { gloss: 'gather', forms: { verb: 'gather', pp: 'gathered' } },
    ghny: { gloss: 'answer', forms: { verb: 'answer', pp: 'answered' } },
    drsh: { gloss: 'seek out', forms: { verb: 'seek out', pp: 'sought out' } },
    qbts: { gloss: 'assemble', forms: { verb: 'assemble', pp: 'assembled' } },
    str: { gloss: 'hide', forms: { noun: 'hiding place', plural: 'hiding places', verb: 'hide', pp: 'hidden' } },
    ghlm: { gloss: 'conceal', forms: { noun: 'concealment', plural: 'concealments', verb: 'conceal', pp: 'concealed' } },
    "khb'": { gloss: 'shelter in secret', forms: { noun: 'shelter', plural: 'shelters', verb: 'shelter', pp: 'sheltered' } },
    tspn: { gloss: 'treasure away', forms: { noun: 'hoard', plural: 'hoards', verb: 'treasure away', pp: 'treasured away' } },
    khshk: { gloss: 'obscure', forms: { noun: 'obscurity', plural: 'obscurities', verb: 'obscure', pp: 'obscured', adj: 'obscured' } },
    lkhsh: { gloss: 'whisper a charm', forms: { noun: 'whispered charm', plural: 'whispered charms', verb: 'whisper a charm', pp: 'whispered over' } },
    ghmq: { gloss: 'be unfathomed', forms: { noun: 'unfathomed deep', plural: 'unfathomed deeps', adj: 'unfathomed' } },
    ttmn: { gloss: 'bury from sight', forms: { verb: 'bury from sight', pp: 'buried from sight' } },
    khdr: { gloss: 'inner chamber', forms: { noun: 'inner chamber', plural: 'inner chambers' } },
    swd: { gloss: 'secret council', forms: { noun: 'secret council', plural: 'secret councils' } },
    "'sr": { gloss: 'bind', forms: { noun: 'bond', plural: 'bonds', verb: 'bind', pp: 'bound' } },
    khtm: { gloss: 'seal', forms: { noun: 'seal', plural: 'seals', verb: 'seal', pp: 'sealed' } },
    qshr: { gloss: 'knot', forms: { noun: 'knot', plural: 'knots', verb: 'knot', pp: 'knotted' } },
    kbl: { gloss: 'fetter', forms: { noun: 'fetter', plural: 'fetters', verb: 'fetter', pp: 'fettered' } },
    rtq: { gloss: 'chain fast', forms: { noun: 'chain', plural: 'chains', verb: 'chain fast', pp: 'chained fast' } },
    ghqd: { gloss: 'bind for offering', forms: { verb: 'bind for offering', pp: 'bound for offering' } },
    khnq: { gloss: 'constrict', forms: { verb: 'constrict', pp: 'constricted' } },
    tsrr: { gloss: 'wrap tight', forms: { verb: 'wrap tight', pp: 'wrapped tight' } },
    khgr: { gloss: 'gird', forms: { noun: 'girding', plural: 'girdings', verb: 'gird', pp: 'girded' } },
    zmm: { gloss: 'muzzle', forms: { noun: 'muzzle', plural: 'muzzles', verb: 'muzzle', pp: 'muzzled' } },
    "'sh": { gloss: 'fire', forms: { noun: 'fire', plural: 'fires' } },
    lhb: { gloss: 'flame', forms: { noun: 'flame', plural: 'flames' } },
    bghr: { gloss: 'burn', forms: { noun: 'burning', plural: 'burnings', verb: 'burn', pp: 'burned' } },
    srp: { gloss: 'burn up', forms: { verb: 'burn up', pp: 'burned up' } },
    qdkh: { gloss: 'kindle', forms: { noun: 'kindling', plural: 'kindlings', verb: 'kindle', pp: 'kindled' } },
    zrkh: { gloss: 'blaze forth', forms: { noun: 'blaze', plural: 'blazes', verb: 'blaze forth', pp: 'blazed forth' } },
    rshp: { gloss: 'plague-fire', forms: { noun: 'plague-fire', plural: 'plague-fires' } },
    gkhl: { gloss: 'ember', forms: { noun: 'ember', plural: 'embers' } },
    khrr: { gloss: 'scorch', forms: { verb: 'scorch', pp: 'scorched', adj: 'scorched' } },
    tnr: { gloss: 'furnace', forms: { noun: 'furnace', plural: 'furnaces' } },
    lyl: { gloss: 'night', forms: { noun: 'night', plural: 'nights' } },
    ghrb: { gloss: 'evening', forms: { noun: 'evening', plural: 'evenings' } },
    "'pl": { gloss: 'thick darkness', forms: { noun: 'thick darkness', plural: 'thick darknesses', adj: 'pitch-dark' } },
    nshp: { gloss: 'twilight', forms: { noun: 'twilight', plural: 'twilights' } },
    tslm: { gloss: 'deep shadow', forms: { noun: 'deep shadow', plural: 'deep shadows', adj: 'shadowed' } },
    shkhr: { gloss: 'the black hour', forms: { noun: 'black hour', plural: 'black hours', adj: 'black' } },
    dmm: { gloss: 'stillness', forms: { noun: 'stillness', plural: 'stillnesses', adj: 'still' } },
    nwm: { gloss: 'slumber', forms: { noun: 'slumber', plural: 'slumbers', verb: 'slumber', pp: 'slumbering' } },
    khlm: { gloss: 'dream', forms: { noun: 'dream', plural: 'dreams' } },
    qdr: { gloss: 'grow dark', forms: { verb: 'grow dark', pp: 'grown dark', adj: 'darkened' } },
    mwt: { gloss: 'death', forms: { noun: 'death', plural: 'deaths' } },
    qbr: { gloss: 'grave', forms: { noun: 'grave', plural: 'graves' } },
    "rp'": { gloss: 'shade of the dead', forms: { noun: 'shade of the dead', plural: 'shades' } },
    shkhb: { gloss: 'lie in death', forms: { verb: 'lie in death', pp: 'laid in death' } },
    krt: { gloss: 'cut off', forms: { noun: 'cutting off', plural: 'cuttings off', verb: 'cut off', pp: 'cut off' } },
    shkht: { gloss: 'pit of ruin', forms: { noun: 'pit of ruin', plural: 'pits of ruin' } },
    dwy: { gloss: 'waste away', forms: { verb: 'waste away', pp: 'wasted away', adj: 'wasted' } },
    blgh: { gloss: 'swallow up', forms: { verb: 'swallow up', pp: 'swallowed up' } },
    khdl: { gloss: 'cease', forms: { verb: 'cease', pp: 'ceased' } },
    nbl: { gloss: 'wither', forms: { verb: 'wither', pp: 'withered', adj: 'withered' } },
    shghr: { gloss: 'gate', forms: { noun: 'gate', plural: 'gates' } },
    dl: { gloss: 'door', forms: { noun: 'door', plural: 'doors' } },
    ptkh: { gloss: 'opening', forms: { noun: 'opening', plural: 'openings', verb: 'open', pp: 'opened' } },
    sp: { gloss: 'threshold', forms: { noun: 'threshold', plural: 'thresholds' } },
    shqp: { gloss: 'lintel', forms: { noun: 'lintel', plural: 'lintels' } },
    khln: { gloss: 'window', forms: { noun: 'window', plural: 'windows' } },
    shbl: { gloss: 'path', forms: { noun: 'path', plural: 'paths' } },
    drk: { gloss: 'road', forms: { noun: 'road', plural: 'roads' } },
    ghbr: { gloss: 'cross over', forms: { noun: 'crossing', plural: 'crossings', verb: 'cross over', pp: 'crossed over' } },
    bqgh: { gloss: 'breach open', forms: { noun: 'breach', plural: 'breaches', verb: 'breach open', pp: 'breached open' } },
    ghd: { gloss: 'perpetuity', forms: { noun: 'perpetuity', plural: 'perpetuities' } },
    zmn: { gloss: 'appointed time', forms: { noun: 'appointed time', plural: 'appointed times' } },
    ght: { gloss: 'moment', forms: { noun: 'moment', plural: 'moments' } },
    ym: { gloss: 'day', forms: { noun: 'day', plural: 'days' } },
    shnt: { gloss: 'year', forms: { noun: 'year', plural: 'years' } },
    khdsh: { gloss: 'new moon', forms: { noun: 'new moon', plural: 'new moons' } },
    bqr: { gloss: 'morning', forms: { noun: 'morning', plural: 'mornings' } },
    qdm: { gloss: 'ancient time', forms: { noun: 'ancient time', plural: 'ancient times' } },
    "'khr": { gloss: 'the after-time', forms: { noun: 'after-time', plural: 'after-times' } },
    dr: { gloss: 'generation, age', forms: { noun: 'age', plural: 'ages' } },
};
const powers = {
    bghl: { name: 'Baal', gloss: 'Baal, lord of the storm.' },
    ghshtrt: { name: 'Ashtart', gloss: 'Ashtart, lady of Sidon.' },
    "'shmn": { name: 'Eshmun', gloss: 'Eshmun, healer of Sidon.' },
    mlqrt: { name: 'Milqart', gloss: 'Milqart, lord of Tyre.' },
    tnt: { name: 'Tinnit', gloss: 'Tinnit, the face of Baal.' },
    rshp: { name: 'Reshep', gloss: 'Reshep, lord of the plague-fire.' },
    khrn: { name: 'Horon', gloss: 'Horon, of the world below.' },
    ssm: { name: 'Sasam', gloss: 'Sasam, named in the demon oath.' },
};
const epithets = {
    ttkhmr: 'the churner of the deep',
    qlghsh: 'the whisper that unmakes',
    tsrghn: 'the sprawling root below',
    mqdgh: 'the profaned holy place',
    shqmts: 'the sunken devourer',
    ghqbr: 'the grave that walks',
    ntpl: 'the fallen watcher',
    bghshm: 'the nameless flesh',
    dlqts: 'the gnawing flame below',
    khnqsh: 'the strangling serpent',
};
const idioms = {
    PC1: 'For he has heard the voice, may he bless.',
    PC2: 'May they have no root below.',
    PC3: 'Forever.',
    ELDRITCH_CLOSE: 'The gate stands open forever.',
};
const seals = {
    3: 'Three times over.',
    7: 'Seven times over.',
    9: 'Nine times over.',
    12: 'Twelve times over.',
};
function noun(id) {
    return form(roots, id, 'noun');
}
function adverbial(rootId) {
    return rootId === null ? '' : ` In the ${noun(rootId)}.`;
}
function adjectival(rootId) {
    return before(rootId === null ? null : form(roots, rootId, 'adj'));
}
function agentName(ref, index) {
    if (ref.kind === 'epithet')
        return vocative(lookup(epithets, ref.id, 'epithet'));
    if (ref.kind === 'power')
        return power(powers, ref.id).name;
    return index === 0 ? noun(ref.id) : form(roots, ref.id, 'plural');
}
export const phoenicianGlosses = {
    roots,
    powers,
    epithets,
    idioms,
    seals,
    idiom: (id) => lookup(idioms, id, 'idiom'),
    seal: (count) => lookup(seals, String(count), 'seal'),
    sentences: (parts) => parts.join(' ').replace(/\s+/gu, ' ').trim(),
    jussiveClause: (p) => {
        const chain = p.chainRoots.map((id) => ` of the ${form(roots, id, 'plural')}`).join('');
        const object = p.targetRoot === null ? '' : ` the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}`;
        const called = p.freePower === null ? '' : ` ${power(powers, p.freePower).name}!`;
        return (`May ${power(powers, p.agentPower).name}${chain} ` +
            `${form(roots, p.intentRoot, 'verb')}${object}.${called}${adverbial(p.adverbRoot)}`);
    },
    invocationClause: (p) => {
        const names = p.agents.map(agentName);
        const head = names[0] ?? '';
        const stacked = names.slice(1).map((name) => ` of the ${name}`).join('');
        const spoken = p.power.kind === 'epithet' ? capitalize(p.power.spoken) : agentName(p.power, 0);
        return (`O ${head}${stacked}, ${form(roots, p.intentRoot, 'verb')}! ` +
            `${spoken}!${adverbial(p.adverbRoot)}`);
    },
    selfPresentationByName: (spokenName) => `I am ${capitalize(spokenName)}.`,
    selfPresentationByEpithet: (id) => `I belong to ${lookup(epithets, id, 'epithet')}.`,
    openerByEpithet: (id) => `Incantation by ${lookup(epithets, id, 'epithet')}.`,
    openerToLord: (id) => `To the lord, to ${power(powers, id).name}.`,
    openerAgainst: (targetRoot, adjectiveRoot) => `Incantation against the ${adjectival(adjectiveRoot)}${form(roots, targetRoot, 'plural')}.`,
    litanyTriple: (subject) => subject.kind === 'epithet'
        ? `${capitalize(subject.spoken)}, spoken three times.`
        : `${agentName(subject, 0)}, spoken three times.`,
    litanyTriangle: (spoken) => `${capitalize(spoken)}, shrinking to a single letter.`,
    tierOne: (subject) => subject.kind === 'epithet'
        ? `${capitalize(subject.spoken)}, ${lookup(epithets, subject.id, 'epithet')}.`
        : power(powers, subject.id).gloss,
    tierTwo: (intentRoot, targetRoot) => `${capitalize(form(roots, intentRoot, 'verb'))} the ${noun(targetRoot)}!`,
};
