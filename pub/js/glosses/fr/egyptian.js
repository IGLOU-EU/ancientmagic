import { form, lookup, power } from '../table.js';
import { after, agreed, capitalize, definite, exclaim, genderOf, ofDefinite, ofPhrase, speaker, vocative, } from './text.js';
const roots = {
    mkA: {
        gloss: 'protéger',
        forms: { noun: 'protection', verb: 'protège', pp: 'protégé' },
        gender: 'f',
        feminine: { pp: 'protégée' },
    },
    sAq: {
        gloss: 'veiller sur',
        forms: { noun: 'garde', verb: 'surveille', pp: 'surveillé' },
        gender: 'f',
        feminine: { pp: 'surveillée' },
    },
    xwf: {
        gloss: 'couvrir du bouclier',
        forms: { noun: 'bouclier', verb: 'couvre', pp: 'couvert' },
        gender: 'm',
        feminine: { pp: 'couverte' },
    },
    nbT: {
        gloss: 'encercler',
        forms: { noun: 'encerclement', verb: 'encercle', pp: 'encerclé' },
        gender: 'm',
        feminine: { pp: 'encerclée' },
    },
    dnH: {
        gloss: 'couvrir de l’aile',
        forms: { noun: 'aile', verb: 'ombrage', pp: 'ombragé' },
        gender: 'f',
        feminine: { pp: 'ombragée' },
    },
    Hsb: {
        gloss: 'barrer la voie',
        forms: { noun: 'barrière', verb: 'barre', pp: 'barré' },
        gender: 'f',
        feminine: { pp: 'barrée' },
    },
    twr: {
        gloss: 'repousser en pureté',
        forms: { verb: 'repousse', pp: 'repoussé' },
        feminine: { pp: 'repoussée' },
    },
    xsf: {
        gloss: 'refouler',
        forms: { verb: 'refoule', pp: 'refoulé' },
        feminine: { pp: 'refoulée' },
    },
    mnq: {
        gloss: 'affermir',
        forms: { verb: 'consolide', pp: 'consolidé' },
        feminine: { pp: 'consolidée' },
    },
    wDb: {
        gloss: 'détourner',
        forms: { verb: 'détourne', pp: 'détourné' },
        feminine: { pp: 'détournée' },
    },
    sqr: {
        gloss: 'abattre',
        forms: { noun: 'coup', verb: 'terrasse', pp: 'terrassé' },
        gender: 'm',
        feminine: { pp: 'terrassée' },
    },
    xbd: {
        gloss: 'affliger',
        forms: { noun: 'affliction', verb: 'afflige', pp: 'affligé', adj: 'affligé' },
        gender: 'f',
        feminine: { pp: 'affligée', adj: 'affligée' },
    },
    dSr: {
        gloss: 'faire saigner',
        forms: {
            noun: 'saignement',
            verb: 'ensanglante',
            pp: 'ensanglanté',
            adj: 'ensanglanté',
        },
        gender: 'm',
        feminine: { pp: 'ensanglantée', adj: 'ensanglantée' },
    },
    nkn: {
        gloss: 'blesser',
        forms: { noun: 'blessure', verb: 'blesse', pp: 'blessé', adj: 'blessé' },
        gender: 'f',
        feminine: { pp: 'blessée', adj: 'blessée' },
    },
    smA: {
        gloss: 'tuer',
        forms: { noun: 'massacre', verb: 'massacre', pp: 'massacré' },
        gender: 'm',
        feminine: { pp: 'massacrée' },
    },
    Hwy: {
        gloss: 'frapper',
        forms: { noun: 'bastonnade', verb: 'frappe', pp: 'frappé' },
        gender: 'f',
        feminine: { pp: 'frappée' },
    },
    xAd: {
        gloss: 'saisir cruellement',
        forms: { verb: 'empoigne', pp: 'empoigné' },
        feminine: { pp: 'empoignée' },
    },
    ptx: {
        gloss: 'jeter à bas',
        forms: { verb: 'renverse', pp: 'renversé' },
        feminine: { pp: 'renversée' },
    },
    gbA: {
        gloss: 'estropier',
        forms: { verb: 'estropie', pp: 'estropié', adj: 'estropié' },
        feminine: { pp: 'estropiée', adj: 'estropiée' },
    },
    tks: {
        gloss: 'percer',
        forms: { noun: 'percée', verb: 'transperce', pp: 'transpercé' },
        gender: 'f',
        feminine: { pp: 'transpercée' },
    },
    nis: {
        gloss: 'appeler par le nom',
        forms: { noun: 'nomination', verb: 'nomme', pp: 'nommé' },
        gender: 'f',
        feminine: { pp: 'nommée' },
    },
    aS: {
        gloss: 'crier vers',
        forms: { noun: 'cri', verb: 'clame', pp: 'clamé' },
        gender: 'm',
        feminine: { pp: 'clamée' },
    },
    dbH: {
        gloss: 'supplier',
        forms: { noun: 'supplication', verb: 'supplie', pp: 'supplié' },
        gender: 'f',
        feminine: { pp: 'suppliée' },
    },
    sxpr: {
        gloss: 'faire advenir',
        forms: { noun: 'avènement', verb: 'suscite', pp: 'suscité' },
        gender: 'm',
        feminine: { pp: 'suscitée' },
    },
    iny: {
        gloss: 'aller quérir',
        forms: { verb: 'ramène', pp: 'ramené' },
        feminine: { pp: 'ramenée' },
    },
    wxr: {
        gloss: 'rechercher',
        forms: { noun: 'recherche', verb: 'recherche', pp: 'recherché' },
        gender: 'f',
        feminine: { pp: 'recherchée' },
    },
    spr: {
        gloss: 'adresser une requête',
        forms: { noun: 'requête', verb: 'sollicite', pp: 'sollicité' },
        gender: 'f',
        feminine: { pp: 'sollicitée' },
    },
    sHn: {
        gloss: 'mandater',
        forms: { noun: 'mandat', verb: 'mandate', pp: 'mandaté' },
        gender: 'm',
        feminine: { pp: 'mandatée' },
    },
    mAT: {
        gloss: 'proclamer',
        forms: { noun: 'proclamation', verb: 'proclame', pp: 'proclamé' },
        gender: 'f',
        feminine: { pp: 'proclamée' },
    },
    qmA: {
        gloss: 'faire venir',
        forms: { noun: 'évocation', verb: 'évoque', pp: 'évoqué' },
        gender: 'f',
        feminine: { pp: 'évoquée' },
    },
    imn: {
        gloss: 'caché',
        forms: { noun: 'chose cachée', verb: 'cache', pp: 'caché', adj: 'caché' },
        gender: 'f',
        feminine: { pp: 'cachée', adj: 'cachée' },
    },
    StA: {
        gloss: 'secret',
        forms: { noun: 'secret', adj: 'secret' },
        gender: 'm',
        feminine: { adj: 'secrète' },
    },
    HAp: {
        gloss: 'dissimuler',
        forms: { noun: 'dissimulation', verb: 'dissimule', pp: 'dissimulé' },
        gender: 'f',
        feminine: { pp: 'dissimulée' },
    },
    dgy: {
        gloss: 'soustraire aux regards',
        forms: { verb: 'dérobe', pp: 'dérobé' },
        feminine: { pp: 'dérobée' },
    },
    kAp: {
        gloss: 'recouvrir',
        forms: { noun: 'couverture', verb: 'recouvre', pp: 'recouvert' },
        gender: 'f',
        feminine: { pp: 'recouverte' },
    },
    sdx: {
        gloss: 'envelopper d’un linceul',
        forms: { noun: 'linceul', verb: 'enveloppe', pp: 'enveloppé' },
        gender: 'm',
        feminine: { pp: 'enveloppée' },
    },
    bsy: {
        gloss: 'initier au mystère',
        forms: { noun: 'mystère', verb: 'initie', pp: 'initié' },
        gender: 'm',
        feminine: { pp: 'initiée' },
    },
    sStA: {
        gloss: 'rendre secret',
        forms: { noun: 'rite secret', verb: 'voile', pp: 'voilé' },
        gender: 'm',
        feminine: { pp: 'voilée' },
    },
    Tms: {
        gloss: 'enterrer hors de vue',
        forms: { verb: 'enterre', pp: 'enterré' },
        feminine: { pp: 'enterrée' },
    },
    qrf: {
        gloss: 'envelopper de ténèbres',
        forms: { noun: 'ténèbre enveloppante', verb: 'enténèbre', pp: 'enténébré' },
        gender: 'f',
        feminine: { pp: 'enténébrée' },
    },
    qAs: {
        gloss: 'lier',
        forms: { noun: 'lien', verb: 'lie', pp: 'lié' },
        gender: 'm',
        feminine: { pp: 'liée' },
    },
    snH: {
        gloss: 'entraver',
        forms: { noun: 'entrave', verb: 'entrave', pp: 'entravé' },
        gender: 'f',
        feminine: { pp: 'entravée' },
    },
    arq: {
        gloss: 'lier par serment',
        forms: { noun: 'serment', verb: 'lie par serment', pp: 'lié par serment' },
        gender: 'm',
        feminine: { pp: 'liée par serment' },
    },
    dmA: {
        gloss: 'lier ensemble',
        forms: { noun: 'faisceau', verb: 'assemble', pp: 'assemblé' },
        gender: 'm',
        feminine: { pp: 'assemblée' },
    },
    xtm: {
        gloss: 'sceller',
        forms: { noun: 'sceau', verb: 'scelle', pp: 'scellé' },
        gender: 'm',
        feminine: { pp: 'scellée' },
    },
    mny: {
        gloss: 'amarrer',
        forms: { noun: 'pieu d’amarrage', verb: 'amarre', pp: 'amarré' },
        gender: 'm',
        feminine: { pp: 'amarrée' },
    },
    TAs: {
        gloss: 'nouer',
        forms: { noun: 'nœud', verb: 'noue', pp: 'noué' },
        gender: 'm',
        feminine: { pp: 'nouée' },
    },
    inH: {
        gloss: 'entourer',
        forms: { noun: 'enveloppement', verb: 'entoure', pp: 'entouré' },
        gender: 'm',
        feminine: { pp: 'entourée' },
    },
    gAf: {
        gloss: 'serrer',
        forms: { noun: 'étreinte', verb: 'serre', pp: 'serré' },
        gender: 'f',
        feminine: { pp: 'serrée' },
    },
    ndb: {
        gloss: 'river',
        forms: { noun: 'rivet', verb: 'rive', pp: 'rivé' },
        gender: 'm',
        feminine: { pp: 'rivée' },
    },
    xt: { gloss: 'feu', forms: { noun: 'feu' }, gender: 'm' },
    sDt: { gloss: 'flamme', forms: { noun: 'flamme' }, gender: 'f' },
    nsr: {
        gloss: 'flamboyer',
        forms: { noun: 'brasier', verb: 'embrase', pp: 'embrasé' },
        gender: 'm',
        feminine: { pp: 'embrasée' },
    },
    rkH: {
        gloss: 'brûler',
        forms: { noun: 'brûlure', verb: 'brûle', pp: 'brûlé' },
        gender: 'f',
        feminine: { pp: 'brûlée' },
    },
    nby: {
        gloss: 'flamber',
        forms: { noun: 'flambée', verb: 'flambe', pp: 'flambé' },
        gender: 'f',
        feminine: { pp: 'flambée' },
    },
    Am: {
        gloss: 'consumer',
        forms: { verb: 'consume', pp: 'consumé' },
        feminine: { pp: 'consumée' },
    },
    wbd: {
        gloss: 'calciner',
        forms: { noun: 'calcination', verb: 'calcine', pp: 'calciné' },
        gender: 'f',
        feminine: { pp: 'calcinée' },
    },
    tkA: { gloss: 'torche', forms: { noun: 'torche' }, gender: 'f' },
    qrH: {
        gloss: 'couver sous la cendre',
        forms: { noun: 'braise fumante', verb: 'couve', pp: 'couvé' },
        gender: 'f',
        feminine: { pp: 'couvée' },
    },
    psy: {
        gloss: 'dessécher par le feu',
        forms: { verb: 'dessèche', pp: 'desséché' },
        feminine: { pp: 'desséchée' },
    },
    grH: { gloss: 'nuit', forms: { noun: 'nuit' }, gender: 'f' },
    snk: {
        gloss: 'obscurité',
        forms: { noun: 'obscurité', adj: 'sombre' },
        gender: 'f',
    },
    wSA: { gloss: 'nuit profonde', forms: { noun: 'nuit profonde' }, gender: 'f' },
    xAwy: { gloss: 'soir', forms: { noun: 'soir' }, gender: 'm' },
    dwAt: { gloss: 'le monde d’en bas', forms: { noun: 'monde d’en bas' }, gender: 'm' },
    iwx: {
        gloss: 'pénombre',
        forms: { noun: 'pénombre', adj: 'lugubre' },
        gender: 'f',
    },
    Sna: { gloss: 'nuée d’orage', forms: { noun: 'nuée d’orage' }, gender: 'f' },
    mskt: { gloss: 'barque nocturne', forms: { noun: 'barque nocturne' }, gender: 'f' },
    sDr: {
        gloss: 'passer la nuit couché',
        forms: { verb: 'repose', pp: 'reposé' },
        feminine: { pp: 'reposée' },
    },
    qnH: {
        gloss: 'obscurité du sanctuaire',
        forms: { noun: 'ombre du naos', adj: 'obscur' },
        gender: 'f',
        feminine: { adj: 'obscure' },
    },
    mwt: {
        gloss: 'mort',
        forms: { noun: 'mort', adj: 'mort' },
        gender: 'f',
        feminine: { adj: 'morte' },
    },
    xpy: {
        gloss: 'trépasser',
        forms: { verb: 'trépasse', pp: 'trépassé' },
        feminine: { pp: 'trépassée' },
    },
    sxr: {
        gloss: 'coucher à terre',
        forms: { verb: 'couche', pp: 'couché' },
        feminine: { pp: 'couchée' },
    },
    qrs: {
        gloss: 'ensevelir',
        forms: { noun: 'sépulture', verb: 'inhume', pp: 'inhumé', adj: 'inhumé' },
        gender: 'f',
        feminine: { pp: 'inhumée', adj: 'inhumée' },
    },
    imAx: {
        gloss: 'les morts vénérés',
        forms: { noun: 'mort vénéré', adj: 'vénéré' },
        gender: 'm',
        feminine: { adj: 'vénérée' },
    },
    HfAw: { gloss: 'ver de la tombe', forms: { noun: 'ver de la tombe' }, gender: 'm' },
    isft: { gloss: 'dissolution', forms: { noun: 'dissolution' }, gender: 'f' },
    nSp: { gloss: 'dernier souffle', forms: { noun: 'dernier souffle' }, gender: 'm' },
    igrt: { gloss: 'la terre du silence', forms: { noun: 'terre du silence' }, gender: 'f' },
    Htm: {
        gloss: 'anéantir',
        forms: { noun: 'anéantissement', verb: 'annihile', pp: 'annihilé' },
        gender: 'm',
        feminine: { pp: 'annihilée' },
    },
    sbA: { gloss: 'portail', forms: { noun: 'portail' }, gender: 'm' },
    sbxt: { gloss: 'porche', forms: { noun: 'porche' }, gender: 'm' },
    aA: { gloss: 'porte', forms: { noun: 'porte' }, gender: 'f' },
    rwty: { gloss: 'double porte', forms: { noun: 'double porte' }, gender: 'f' },
    arwt: { gloss: 'cour du portail', forms: { noun: 'cour du portail' }, gender: 'f' },
    TpHt: { gloss: 'bouche de caverne', forms: { noun: 'bouche de caverne' }, gender: 'f' },
    wAt: { gloss: 'route', forms: { noun: 'route' }, gender: 'f' },
    xnd: { gloss: 'seuil', forms: { noun: 'seuil' }, gender: 'm' },
    wpy: {
        gloss: 'ouvrir',
        forms: { verb: 'ouvre', pp: 'ouvert' },
        feminine: { pp: 'ouverte' },
    },
    snS: {
        gloss: 'ouvrir en grand',
        forms: { verb: 'écarte', pp: 'écarté' },
        feminine: { pp: 'écartée' },
    },
    wnwt: { gloss: 'heure', forms: { noun: 'heure' }, gender: 'f' },
    nHH: { gloss: 'temps sans fin', forms: { noun: 'temps sans fin' }, gender: 'm' },
    Dt: { gloss: 'éternité', forms: { noun: 'éternité' }, gender: 'f' },
    rk: { gloss: 'ère', forms: { noun: 'ère' }, gender: 'f' },
    hAw: { gloss: 'époque', forms: { noun: 'époque' }, gender: 'f' },
    sp: { gloss: 'occasion', forms: { noun: 'occasion' }, gender: 'f' },
    tr: { gloss: 'saison', forms: { noun: 'saison' }, gender: 'f' },
    aHaw: { gloss: 'durée de vie', forms: { noun: 'durée de vie' }, gender: 'f' },
    pAwt: { gloss: 'temps primordial', forms: { noun: 'temps primordial' }, gender: 'm' },
    sf: { gloss: 'hier', forms: { noun: 'jour d’hier' }, gender: 'm' },
};
const powers = {
    HkA: { name: 'Héka', gloss: 'Héka, la magie même.' },
    ra: { name: 'Rê', gloss: 'Rê, le soleil d’en haut.' },
    DHwty: { name: 'Djéhouty', gloss: 'Djéhouty, maître de l’écriture.' },
    Ast: { name: 'Aset', gloss: 'Aset, grande de magie.' },
    wsir: { name: 'Ousir', gloss: 'Ousir, maître des morts.' },
    inpw: { name: 'Inpou', gloss: 'Inpou, ouvreur des chemins.' },
    sxmt: { name: 'Sekhmet', gloss: 'Sekhmet, la peste et le bouclier.' },
    aApp: { name: 'Apep', gloss: 'Apep, le serpent adversaire.' },
};
const epithets = {
    xAxr: 'le dévoreur du seuil',
    nqrx: 'le rongeur dans les ténèbres',
    TmAx: 'la faim ensevelie',
    sSdx: 'l’éclair qui aveugle',
    qbHx: 'le froid sous le fleuve',
    wgpx: 'le briseur de noms',
    Hnbx: 'la masse étalée aux portes',
    dSrx: 'la soif rouge',
    iApx: 'la ténèbre lovée',
    gnwx: 'le silence qui guette',
};
const idioms = {
    EO1: 'Récitation.',
    ELDRITCH_OPEN: 'Le rite prononcé à rebours.',
    EC1: 'Vie, prospérité, santé.',
    EC2: 'Juste de voix.',
    ELDRITCH_CLOSE: 'Dissolution à jamais.',
};
const seals = {
    2: 'Récité deux fois.',
    3: 'Récité trois fois.',
    4: 'Récité quatre fois.',
    7: 'Récité sept fois.',
    9: 'Récité neuf fois.',
    12: 'Récité douze fois.',
};
function noun(id) {
    return form(roots, id, 'noun');
}
function theNoun(id) {
    return definite(noun(id), genderOf(roots, id));
}
function adverbial(rootId) {
    return rootId === null ? '' : ` dans ${theNoun(rootId)}`;
}
function adjectival(rootId, headRoot) {
    return after(rootId === null ? null : agreed(roots, rootId, 'adj', genderOf(roots, headRoot)));
}
function named(ref) {
    if (ref.kind === 'epithet')
        return vocative(lookup(epithets, ref.id, 'epithet'));
    if (ref.kind === 'power')
        return power(powers, ref.id).name;
    return noun(ref.id);
}
function stacked(ref) {
    if (ref.kind === 'epithet')
        return ofPhrase(lookup(epithets, ref.id, 'epithet'));
    if (ref.kind === 'power')
        return `de ${power(powers, ref.id).name}`;
    return ofDefinite(noun(ref.id), genderOf(roots, ref.id));
}
export const egyptianGlosses = {
    roots,
    powers,
    epithets,
    idioms,
    seals,
    idiom: (id) => lookup(idioms, id, 'idiom'),
    seal: (count) => lookup(seals, String(count), 'seal'),
    sentences: (parts) => parts.join(' '),
    protectionClause: (p) => `${capitalize(speaker(form(roots, p.intentRoot, 'verb')))} contre ` +
        `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}` +
        `${adverbial(p.adverbRoot)}, par ${power(powers, p.agentPower).name}. ` +
        `${exclaim(power(powers, p.freePower).name)}`,
    curseClause: (p) => `Que ${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)} soit ` +
        `${agreed(roots, p.intentRoot, 'pp', genderOf(roots, p.targetRoot))}` +
        `${adverbial(p.adverbRoot)}.`,
    invocationClause: (p) => {
        const head = p.agents[0];
        const chain = p.agents.slice(1).map((ref) => ` ${stacked(ref)}`).join('');
        const spoken = p.power.kind === 'epithet' ? capitalize(p.power.spoken) : named(p.power);
        return (exclaim(`Ô ${head === undefined ? '' : named(head)}${chain}, viens${adverbial(p.adverbRoot)}`) + ` ${exclaim(spoken)}`);
    },
    spellTitle: (subject) => subject.kind === 'epithet'
        ? `Formule ${ofPhrase(lookup(epithets, subject.id, 'epithet'))}.`
        : `Formule ${ofDefinite(noun(subject.id), genderOf(roots, subject.id))}.`,
    nameKnowledge: (address, eldritch) => {
        const who = address.kind === 'gate'
            ? `${noun(address.headRoot)} ${ofDefinite(noun(address.tailRoot), genderOf(roots, address.tailRoot))}`
            : named(address);
        return eldritch ? `Ô ${who}, tu connais mon nom.` : `Ô ${who}, je connais ton nom.`;
    },
    tierOne: (subject) => subject.kind === 'epithet'
        ? `${capitalize(subject.spoken)}, ${lookup(epithets, subject.id, 'epithet')}.`
        : power(powers, subject.id).gloss,
    tierTwo: (intentRoot, targetRoot) => exclaim(`${capitalize(form(roots, intentRoot, 'verb'))} ${theNoun(targetRoot)}`),
};
