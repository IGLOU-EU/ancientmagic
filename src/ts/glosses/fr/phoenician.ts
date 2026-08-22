// French glosses for the Phoenician genome. The meanings are docs/genomes.md
// section 4 and the English pack, the wordings are French.
//
// Divine names take the French Punic-scholarship orthography (Baal, Astarté,
// Eshmoun, Melqart, Tanit, Reshef), and each one declares its gender because
// the PO3 opener hails its bearer by a title.
//
// No clause of this genome renders a past participle: the jussive and the
// imperative both call for the verb wording, and the opener calls for the
// plural. The pp forms the genome declares therefore carry no feminine, unlike
// the adjectives, which a target noun does bend.

import { form, lookup, power } from '../table.js';
import type {
  GlossRef,
  GlossTable,
  NamedPowerTable,
  PhoenicianGlosses,
  PhoenicianInvocation,
  PhoenicianJussive,
  RootGlossTable,
} from '../types.js';
import {
  agreed,
  capitalize,
  definite,
  exclaim,
  genderOf,
  ofPhrase,
  plural,
  that,
  toPhrase,
  vocative,
} from './text.js';

const roots: RootGlossTable = {
  // warding
  mgn: {
    gloss: 'bouclier',
    forms: { noun: 'bouclier', plural: 'boucliers', verb: 'protège', pp: 'protégé' },
    gender: 'm',
  },
  ntsr: {
    gloss: 'garder',
    forms: { noun: 'gardien', plural: 'gardiens', verb: 'garde', pp: 'gardé' },
    gender: 'm',
  },
  shmr: {
    gloss: 'veiller sur',
    forms: { noun: 'veilleur', plural: 'veilleurs', verb: 'surveille', pp: 'surveillé' },
    gender: 'm',
  },
  gdr: {
    gloss: 'murer',
    forms: { noun: 'muraille', plural: 'murailles', verb: 'emmure', pp: 'emmuré' },
    gender: 'f',
  },
  skk: {
    gloss: 'faire écran, ombrager',
    forms: { noun: 'écran', plural: 'écrans', verb: 'ombrage', pp: 'ombragé' },
    gender: 'm',
  },
  smk: {
    gloss: 'soutenir',
    forms: { noun: 'appui', plural: 'appuis', verb: 'étaie', pp: 'étayé' },
    gender: 'm',
  },
  ghzr: {
    gloss: 'ceindre',
    forms: { noun: 'ceinture', plural: 'ceintures', verb: 'ceinture', pp: 'ceinturé' },
    gender: 'f',
  },
  khsn: {
    gloss: 'fortifier',
    forms: {
      noun: 'place forte',
      plural: 'places fortes',
      verb: 'fortifie',
      pp: 'fortifié',
    },
    gender: 'f',
  },
  khpp: {
    gloss: 'couvrir d’un dais',
    forms: { noun: 'dais', plural: 'dais', verb: 'couvre', pp: 'couvert' },
    gender: 'm',
  },
  swg: {
    gloss: 'clore',
    forms: { noun: 'clôture', plural: 'clôtures', verb: 'clôture', pp: 'clôturé' },
    gender: 'f',
  },
  // harm
  "'rr": {
    gloss: 'maudire',
    forms: {
      noun: 'malédiction',
      plural: 'malédictions',
      verb: 'accable',
      pp: 'accablé',
    },
    gender: 'f',
  },
  qll: {
    gloss: 'vilipender',
    forms: { verb: 'vilipende', pp: 'vilipendé', adj: 'vilipendé' },
    feminine: { adj: 'vilipendée' },
  },
  ngp: {
    gloss: 'frapper de peste',
    forms: { noun: 'peste', plural: 'pestes', verb: 'infeste', pp: 'infesté' },
    gender: 'f',
  },
  shbr: {
    gloss: 'fracasser',
    forms: { noun: 'fracas', plural: 'fracas', verb: 'fracasse', pp: 'fracassé' },
    gender: 'm',
  },
  mkhts: { gloss: 'foudroyer', forms: { verb: 'foudroie', pp: 'foudroyé' } },
  khbl: {
    gloss: 'ruiner',
    forms: { noun: 'ruine', plural: 'ruines', verb: 'ruine', pp: 'ruiné' },
    gender: 'f',
  },
  hdp: { gloss: 'précipiter à bas', forms: { verb: 'précipite', pp: 'précipité' } },
  "'bd": {
    gloss: 'détruire',
    forms: {
      noun: 'destruction',
      plural: 'destructions',
      verb: 'extermine',
      pp: 'exterminé',
    },
    gender: 'f',
  },
  khrb: {
    gloss: 'dévaster',
    forms: { verb: 'dévaste', pp: 'dévasté', adj: 'dévasté' },
    feminine: { adj: 'dévastée' },
  },
  rtsts: {
    gloss: 'broyer',
    forms: { verb: 'broie', pp: 'broyé', adj: 'broyé' },
    feminine: { adj: 'broyée' },
  },
  // summoning
  "qr'": {
    gloss: 'appeler',
    forms: { noun: 'appel', plural: 'appels', verb: 'appelle', pp: 'appelé' },
    gender: 'm',
  },
  zghq: {
    gloss: 'crier',
    forms: { noun: 'clameur', plural: 'clameurs', verb: 'clame', pp: 'clamé' },
    gender: 'f',
  },
  shlkh: { gloss: 'envoyer quérir', forms: { verb: 'mande', pp: 'mandé' } },
  "bw'": {
    gloss: 'faire venir',
    forms: { noun: 'venue', plural: 'venues', verb: 'approche', pp: 'approché' },
    gender: 'f',
  },
  ngd: { gloss: 'annoncer', forms: { verb: 'annonce', pp: 'annoncé' } },
  pqd: { gloss: 'rassembler', forms: { verb: 'rassemble', pp: 'rassemblé' } },
  "'sp": { gloss: 'recueillir', forms: { verb: 'recueille', pp: 'recueilli' } },
  ghny: { gloss: 'exaucer', forms: { verb: 'exauce', pp: 'exaucé' } },
  drsh: { gloss: 'rechercher', forms: { verb: 'recherche', pp: 'recherché' } },
  qbts: { gloss: 'assembler', forms: { verb: 'assemble', pp: 'assemblé' } },
  // hidden
  str: {
    gloss: 'cacher',
    forms: { noun: 'cachette', plural: 'cachettes', verb: 'cache', pp: 'caché' },
    gender: 'f',
  },
  ghlm: {
    gloss: 'dissimuler',
    forms: {
      noun: 'dissimulation',
      plural: 'dissimulations',
      verb: 'dissimule',
      pp: 'dissimulé',
    },
    gender: 'f',
  },
  "khb'": {
    gloss: 'abriter en secret',
    forms: { noun: 'abri', plural: 'abris', verb: 'abrite', pp: 'abrité' },
    gender: 'm',
  },
  tspn: {
    gloss: 'mettre en réserve',
    forms: {
      noun: 'trésor',
      plural: 'trésors',
      verb: 'thésaurise',
      pp: 'thésaurisé',
    },
    gender: 'm',
  },
  khshk: {
    gloss: 'obscurcir',
    forms: {
      noun: 'obscurité',
      plural: 'obscurités',
      verb: 'voile',
      pp: 'voilé',
      adj: 'voilé',
    },
    gender: 'f',
    feminine: { adj: 'voilée' },
  },
  lkhsh: {
    gloss: 'murmurer un charme',
    forms: {
      noun: 'charme murmuré',
      plural: 'charmes murmurés',
      verb: 'murmure',
      pp: 'murmuré',
    },
    gender: 'm',
  },
  ghmq: {
    gloss: 'être insondable',
    forms: { noun: 'abîme insondé', plural: 'abîmes insondés', adj: 'insondable' },
    gender: 'm',
  },
  ttmn: { gloss: 'enterrer hors de vue', forms: { verb: 'enterre', pp: 'enterré' } },
  khdr: {
    gloss: 'chambre intérieure',
    forms: { noun: 'chambre intérieure', plural: 'chambres intérieures' },
    gender: 'f',
  },
  swd: {
    gloss: 'conseil secret',
    forms: { noun: 'conseil secret', plural: 'conseils secrets' },
    gender: 'm',
  },
  // binding
  "'sr": {
    gloss: 'lier',
    forms: { noun: 'lien', plural: 'liens', verb: 'lie', pp: 'lié' },
    gender: 'm',
  },
  khtm: {
    gloss: 'sceller',
    forms: { noun: 'sceau', plural: 'sceaux', verb: 'scelle', pp: 'scellé' },
    gender: 'm',
  },
  qshr: {
    gloss: 'nouer',
    forms: { noun: 'nœud', plural: 'nœuds', verb: 'noue', pp: 'noué' },
    gender: 'm',
  },
  kbl: {
    gloss: 'entraver',
    forms: { noun: 'entrave', plural: 'entraves', verb: 'entrave', pp: 'entravé' },
    gender: 'f',
  },
  rtq: {
    gloss: 'enchaîner',
    forms: { noun: 'chaîne', plural: 'chaînes', verb: 'enchaîne', pp: 'enchaîné' },
    gender: 'f',
  },
  ghqd: { gloss: 'lier pour l’offrande', forms: { verb: 'ligote', pp: 'ligoté' } },
  khnq: { gloss: 'étrangler', forms: { verb: 'étrangle', pp: 'étranglé' } },
  tsrr: { gloss: 'envelopper serré', forms: { verb: 'emmaillote', pp: 'emmailloté' } },
  khgr: {
    gloss: 'sangler',
    forms: { noun: 'sangle', plural: 'sangles', verb: 'sangle', pp: 'sanglé' },
    gender: 'f',
  },
  zmm: {
    gloss: 'museler',
    forms: { noun: 'muselière', plural: 'muselières', verb: 'muselle', pp: 'muselé' },
    gender: 'f',
  },
  // fire
  "'sh": { gloss: 'feu', forms: { noun: 'feu', plural: 'feux' }, gender: 'm' },
  lhb: { gloss: 'flamme', forms: { noun: 'flamme', plural: 'flammes' }, gender: 'f' },
  bghr: {
    gloss: 'brûler',
    forms: { noun: 'brûlure', plural: 'brûlures', verb: 'brûle', pp: 'brûlé' },
    gender: 'f',
  },
  srp: { gloss: 'consumer', forms: { verb: 'consume', pp: 'consumé' } },
  qdkh: {
    gloss: 'allumer',
    forms: {
      noun: 'embrasement',
      plural: 'embrasements',
      verb: 'allume',
      pp: 'allumé',
    },
    gender: 'm',
  },
  zrkh: {
    gloss: 'flamboyer',
    forms: {
      noun: 'flamboiement',
      plural: 'flamboiements',
      verb: 'flamboie',
      pp: 'flamboyé',
    },
    gender: 'm',
  },
  rshp: {
    gloss: 'feu de peste',
    forms: { noun: 'feu de peste', plural: 'feux de peste' },
    gender: 'm',
  },
  gkhl: { gloss: 'braise', forms: { noun: 'braise', plural: 'braises' }, gender: 'f' },
  khrr: {
    gloss: 'calciner',
    forms: { verb: 'calcine', pp: 'calciné', adj: 'calciné' },
    feminine: { adj: 'calcinée' },
  },
  tnr: {
    gloss: 'fournaise',
    forms: { noun: 'fournaise', plural: 'fournaises' },
    gender: 'f',
  },
  // night
  lyl: { gloss: 'nuit', forms: { noun: 'nuit', plural: 'nuits' }, gender: 'f' },
  ghrb: { gloss: 'soir', forms: { noun: 'soir', plural: 'soirs' }, gender: 'm' },
  "'pl": {
    gloss: 'ténèbres épaisses',
    forms: {
      noun: 'ténèbre épaisse',
      plural: 'ténèbres épaisses',
      adj: 'ténébreux',
    },
    gender: 'f',
    feminine: { adj: 'ténébreuse' },
  },
  nshp: {
    gloss: 'crépuscule',
    forms: { noun: 'crépuscule', plural: 'crépuscules' },
    gender: 'm',
  },
  tslm: {
    gloss: 'ombre profonde',
    forms: { noun: 'ombre profonde', plural: 'ombres profondes', adj: 'ombreux' },
    gender: 'f',
    feminine: { adj: 'ombreuse' },
  },
  shkhr: {
    gloss: 'l’heure noire',
    forms: { noun: 'heure noire', plural: 'heures noires', adj: 'noir' },
    gender: 'f',
    feminine: { adj: 'noire' },
  },
  dmm: {
    gloss: 'silence',
    forms: { noun: 'silence', plural: 'silences', adj: 'silencieux' },
    gender: 'm',
    feminine: { adj: 'silencieuse' },
  },
  nwm: {
    gloss: 'sommeil',
    forms: { noun: 'sommeil', plural: 'sommeils', verb: 'sommeille', pp: 'endormi' },
    gender: 'm',
  },
  khlm: { gloss: 'rêve', forms: { noun: 'rêve', plural: 'rêves' }, gender: 'm' },
  qdr: {
    gloss: 's’assombrir',
    forms: { verb: 'enténèbre', pp: 'enténébré', adj: 'enténébré' },
    feminine: { adj: 'enténébrée' },
  },
  // death
  mwt: { gloss: 'mort', forms: { noun: 'mort', plural: 'morts' }, gender: 'f' },
  qbr: { gloss: 'tombe', forms: { noun: 'tombe', plural: 'tombes' }, gender: 'f' },
  "rp'": {
    gloss: 'ombre des morts',
    forms: { noun: 'ombre des morts', plural: 'ombres' },
    gender: 'f',
  },
  shkhb: { gloss: 'gésir dans la mort', forms: { verb: 'couche', pp: 'couché' } },
  krt: {
    gloss: 'retrancher',
    forms: {
      noun: 'retranchement',
      plural: 'retranchements',
      verb: 'retranche',
      pp: 'retranché',
    },
    gender: 'm',
  },
  shkht: {
    gloss: 'fosse de ruine',
    forms: { noun: 'fosse de ruine', plural: 'fosses de ruine' },
    gender: 'f',
  },
  dwy: {
    gloss: 'dépérir',
    forms: { verb: 'étiole', pp: 'étiolé', adj: 'étiolé' },
    feminine: { adj: 'étiolée' },
  },
  blgh: { gloss: 'engloutir', forms: { verb: 'avale', pp: 'avalé' } },
  khdl: { gloss: 'cesser', forms: { verb: 'cesse', pp: 'cessé' } },
  nbl: {
    gloss: 'se flétrir',
    forms: { verb: 'dessèche', pp: 'desséché', adj: 'desséché' },
    feminine: { adj: 'desséchée' },
  },
  // gates
  shghr: { gloss: 'porte', forms: { noun: 'porte', plural: 'portes' }, gender: 'f' },
  dl: { gloss: 'battant', forms: { noun: 'battant', plural: 'battants' }, gender: 'm' },
  ptkh: {
    gloss: 'ouvrir',
    forms: { noun: 'ouverture', plural: 'ouvertures', verb: 'ouvre', pp: 'ouvert' },
    gender: 'f',
  },
  sp: { gloss: 'seuil', forms: { noun: 'seuil', plural: 'seuils' }, gender: 'm' },
  shqp: {
    gloss: 'linteau',
    forms: { noun: 'linteau', plural: 'linteaux' },
    gender: 'm',
  },
  khln: {
    gloss: 'fenêtre',
    forms: { noun: 'fenêtre', plural: 'fenêtres' },
    gender: 'f',
  },
  shbl: { gloss: 'sentier', forms: { noun: 'sentier', plural: 'sentiers' }, gender: 'm' },
  drk: { gloss: 'route', forms: { noun: 'route', plural: 'routes' }, gender: 'f' },
  ghbr: {
    gloss: 'traverser',
    forms: { noun: 'passage', plural: 'passages', verb: 'traverse', pp: 'traversé' },
    gender: 'm',
  },
  bqgh: {
    gloss: 'percer une brèche',
    forms: { noun: 'brèche', plural: 'brèches', verb: 'perce', pp: 'percé' },
    gender: 'f',
  },
  // time
  ghd: {
    gloss: 'perpétuité',
    forms: { noun: 'perpétuité', plural: 'perpétuités' },
    gender: 'f',
  },
  zmn: {
    gloss: 'temps fixé',
    forms: { noun: 'temps fixé', plural: 'temps fixés' },
    gender: 'm',
  },
  ght: { gloss: 'instant', forms: { noun: 'instant', plural: 'instants' }, gender: 'm' },
  ym: { gloss: 'jour', forms: { noun: 'jour', plural: 'jours' }, gender: 'm' },
  shnt: { gloss: 'année', forms: { noun: 'année', plural: 'années' }, gender: 'f' },
  khdsh: {
    gloss: 'nouvelle lune',
    forms: { noun: 'nouvelle lune', plural: 'nouvelles lunes' },
    gender: 'f',
  },
  bqr: { gloss: 'matin', forms: { noun: 'matin', plural: 'matins' }, gender: 'm' },
  qdm: {
    gloss: 'temps ancien',
    forms: { noun: 'temps ancien', plural: 'temps anciens' },
    gender: 'm',
  },
  "'khr": {
    gloss: 'le temps d’après',
    forms: { noun: 'temps d’après', plural: 'temps d’après' },
    gender: 'm',
  },
  dr: { gloss: 'génération, âge', forms: { noun: 'âge', plural: 'âges' }, gender: 'm' },
};

const powers: NamedPowerTable = {
  bghl: { name: 'Baal', gloss: 'Baal, seigneur de l’orage.', gender: 'm' },
  ghshtrt: { name: 'Astarté', gloss: 'Astarté, dame de Sidon.', gender: 'f' },
  "'shmn": { name: 'Eshmoun', gloss: 'Eshmoun, guérisseur de Sidon.', gender: 'm' },
  mlqrt: { name: 'Melqart', gloss: 'Melqart, seigneur de Tyr.', gender: 'm' },
  tnt: { name: 'Tanit', gloss: 'Tanit, le visage de Baal.', gender: 'f' },
  rshp: { name: 'Reshef', gloss: 'Reshef, seigneur du feu de peste.', gender: 'm' },
  khrn: { name: 'Horon', gloss: 'Horon, du monde d’en bas.', gender: 'm' },
  ssm: { name: 'Sasam', gloss: 'Sasam, nommé dans le serment des démons.', gender: 'm' },
};

// Each epithet keeps the article an opener needs and a vocative drops.
const epithets: GlossTable = {
  ttkhmr: 'le brasseur de l’abîme',
  qlghsh: 'le murmure qui défait',
  tsrghn: 'la racine étalée d’en bas',
  mqdgh: 'le lieu saint profané',
  shqmts: 'le dévoreur englouti',
  ghqbr: 'la tombe qui marche',
  ntpl: 'le veilleur déchu',
  bghshm: 'la chair sans nom',
  dlqts: 'la flamme qui ronge en bas',
  khnqsh: 'le serpent qui étrangle',
};

const idioms: GlossTable = {
  PC1: 'Car il a entendu la voix, qu’il bénisse.',
  PC2: 'Qu’ils n’aient plus de racine en bas.',
  PC3: 'À jamais.',
  ELDRITCH_CLOSE: 'La porte demeure ouverte à jamais.',
};

const seals: GlossTable = {
  3: 'Trois fois de suite.',
  7: 'Sept fois de suite.',
  9: 'Neuf fois de suite.',
  12: 'Douze fois de suite.',
};

function noun(id: string): string {
  return form(roots, id, 'noun');
}

function theNoun(id: string): string {
  return definite(noun(id), genderOf(roots, id));
}

// The adverbial modifier reads as its own short sentence at clause end.
function adverbial(rootId: string | null): string {
  return rootId === null ? '' : ` Dans ${theNoun(rootId)}.`;
}

// An attributive adjective follows its noun and agrees with it.
function adjectival(rootId: string | null, headRoot: string): string {
  return rootId === null ? '' : ` ${agreed(roots, rootId, 'adj', genderOf(roots, headRoot))}`;
}

// How a participant is addressed at the head of a vocative.
function agentName(ref: GlossRef): string {
  if (ref.kind === 'epithet') return vocative(lookup(epithets, ref.id, 'epithet'));
  if (ref.kind === 'power') return power(powers, ref.id).name;
  return noun(ref.id);
}

// How a participant reads behind the one before it. A stacked root is a plural
// genitive, and French contracts « de les » into « des ».
function stacked(ref: GlossRef): string {
  if (ref.kind === 'epithet') return ofPhrase(lookup(epithets, ref.id, 'epithet'));
  if (ref.kind === 'power') return `de ${power(powers, ref.id).name}`;
  return `des ${form(roots, ref.id, 'plural')}`;
}

export const phoenicianGlosses: PhoenicianGlosses = {
  roots,
  powers,
  epithets,
  idioms,
  seals,

  idiom: (id) => lookup(idioms, id, 'idiom'),
  seal: (count) => lookup(seals, String(count), 'seal'),
  // Ordinary spaces only: collapsing every whitespace would eat the narrow
  // no-break space French sets before an exclamation mark.
  sentences: (parts) => parts.join(' ').replace(/ +/gu, ' ').trim(),

  jussiveClause: (p: PhoenicianJussive) => {
    const chain = p.chainRoots.map((id) => ` des ${form(roots, id, 'plural')}`).join('');
    const object =
      p.targetRoot === null
        ? ''
        : ` ${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}`;
    const called =
      p.freePower === null ? '' : ` ${exclaim(power(powers, p.freePower).name)}`;
    return (
      `${capitalize(that(power(powers, p.agentPower).name))}${chain} ` +
      `${form(roots, p.intentRoot, 'verb')}${object}.${called}${adverbial(p.adverbRoot)}`
    );
  },

  invocationClause: (p: PhoenicianInvocation) => {
    const head = p.agents[0];
    const chain = p.agents.slice(1).map((ref) => ` ${stacked(ref)}`).join('');
    const spoken = p.power.kind === 'epithet' ? capitalize(p.power.spoken) : agentName(p.power);
    return (
      exclaim(
        `Ô ${head === undefined ? '' : agentName(head)}${chain}, ` +
          `${form(roots, p.intentRoot, 'verb')}`,
      ) + ` ${exclaim(spoken)}${adverbial(p.adverbRoot)}`
    );
  },

  selfPresentationByName: (spokenName) => `Je suis ${capitalize(spokenName)}.`,
  selfPresentationByEpithet: (id) =>
    `J’appartiens ${toPhrase(lookup(epithets, id, 'epithet'))}.`,

  openerByEpithet: (id) => `Incantation par ${lookup(epithets, id, 'epithet')}.`,
  openerToLord: (id) => {
    const god = power(powers, id);
    return `${god.gender === 'f' ? 'À la dame' : 'Au seigneur'}, à ${god.name}.`;
  },
  openerAgainst: (targetRoot, adjectiveRoot) => {
    const qualifier =
      adjectiveRoot === null
        ? ''
        : ` ${plural(agreed(roots, adjectiveRoot, 'adj', genderOf(roots, targetRoot)))}`;
    return `Incantation contre les ${form(roots, targetRoot, 'plural')}${qualifier}.`;
  },

  // A name quoted rather than used is masculine in French, so the participle
  // stays in the masculine whoever the name belongs to.
  litanyTriple: (subject) =>
    subject.kind === 'epithet'
      ? `${capitalize(subject.spoken)}, prononcé trois fois.`
      : `${agentName(subject)}, prononcé trois fois.`,

  litanyTriangle: (spoken) => `${capitalize(spoken)}, réduit à une seule lettre.`,

  tierOne: (subject) =>
    subject.kind === 'epithet'
      ? `${capitalize(subject.spoken)}, ${lookup(epithets, subject.id, 'epithet')}.`
      : power(powers, subject.id).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    exclaim(`${capitalize(form(roots, intentRoot, 'verb'))} ${theNoun(targetRoot)}`),
};
