// French glosses for the Egyptian genome. The meanings are docs/genomes.md
// section 3 and the English pack, the wordings are French.
//
// Divine names take the French Egyptological orthography (Rê, Djéhouty, Ousir,
// Inpou), which is the pack's own choice of spelling and not a translation of
// the English one. Each one carries a gender, because a Divination question
// resumes the power it names with a pronoun.

import { form, lookup, power } from '../table.js';
import type {
  EgyptianAddress,
  EgyptianCurse,
  EgyptianDivinationAsk,
  EgyptianDivinationSee,
  EgyptianGlosses,
  EgyptianInvocation,
  EgyptianProtection,
} from '../../languages/egyptian-glosses.js';
import type {
  ChronomancyBind,
  ChronomancyCross,
  GlossRef,
  GlossTable,
  NamedPowerTable,
  RootGlossTable,
} from '../types.js';
import {
  after,
  agreed,
  ask,
  capitalize,
  definite,
  exclaim,
  genderOf,
  genomeMethods,
  inverted,
  ofDefinite,
  ofPhrase,
  speaker,
  vocative,
} from './text.js';

const roots: RootGlossTable = {
  // warding
  mkA: {
    gloss: 'protéger',
    forms: { verb: 'protège', pp: 'protégé' },
    gender: 'f',
    feminine: { pp: 'protégée' },
  },
  sAq: {
    gloss: 'veiller sur',
    forms: { verb: 'surveille', pp: 'surveillé' },
    gender: 'f',
    feminine: { pp: 'surveillée' },
  },
  xwf: {
    gloss: 'couvrir du bouclier',
    forms: { verb: 'couvre', pp: 'couvert' },
    gender: 'm',
    feminine: { pp: 'couverte' },
  },
  nbT: {
    gloss: 'encercler',
    forms: { verb: 'encercle', pp: 'encerclé' },
    gender: 'm',
    feminine: { pp: 'encerclée' },
  },
  dnH: {
    gloss: 'couvrir de l’aile',
    forms: { verb: 'ombrage', pp: 'ombragé' },
    gender: 'f',
    feminine: { pp: 'ombragée' },
  },
  Hsb: {
    gloss: 'barrer la voie',
    forms: { verb: 'barre', pp: 'barré' },
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
  // harm
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
  // summoning
  nis: {
    gloss: 'appeler par le nom',
    forms: { verb: 'nomme', pp: 'nommé' },
    gender: 'f',
    feminine: { pp: 'nommée' },
  },
  aS: {
    gloss: 'crier vers',
    forms: { verb: 'clame', pp: 'clamé' },
    gender: 'm',
    feminine: { pp: 'clamée' },
  },
  dbH: {
    gloss: 'supplier',
    forms: { verb: 'supplie', pp: 'supplié' },
    gender: 'f',
    feminine: { pp: 'suppliée' },
  },
  sxpr: {
    gloss: 'faire advenir',
    forms: { verb: 'suscite', pp: 'suscité' },
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
    forms: { verb: 'recherche', pp: 'recherché' },
    gender: 'f',
    feminine: { pp: 'recherchée' },
  },
  spr: {
    gloss: 'adresser une requête',
    forms: { verb: 'sollicite', pp: 'sollicité' },
    gender: 'f',
    feminine: { pp: 'sollicitée' },
  },
  sHn: {
    gloss: 'mandater',
    forms: { verb: 'mandate', pp: 'mandaté' },
    gender: 'm',
    feminine: { pp: 'mandatée' },
  },
  mAT: {
    gloss: 'proclamer',
    forms: { verb: 'proclame', pp: 'proclamé' },
    gender: 'f',
    feminine: { pp: 'proclamée' },
  },
  qmA: {
    gloss: 'faire venir',
    forms: { verb: 'évoque', pp: 'évoqué' },
    gender: 'f',
    feminine: { pp: 'évoquée' },
  },
  // hidden
  imn: { gloss: 'caché', forms: { noun: 'chose cachée' }, gender: 'f' },
  StA: { gloss: 'secret', forms: { noun: 'secret' }, gender: 'm' },
  HAp: { gloss: 'dissimuler', forms: { noun: 'dissimulation' }, gender: 'f' },
  kAp: { gloss: 'recouvrir', forms: { noun: 'couverture' }, gender: 'f' },
  sdx: { gloss: 'envelopper d’un linceul', forms: { noun: 'linceul' }, gender: 'm' },
  bsy: { gloss: 'initier au mystère', forms: { noun: 'mystère' }, gender: 'm' },
  sStA: { gloss: 'rendre secret', forms: { noun: 'rite secret' }, gender: 'm' },
  qrf: { gloss: 'envelopper de ténèbres', forms: { noun: 'ténèbre enveloppante' }, gender: 'f' },
  // binding
  qAs: {
    gloss: 'lier',
    forms: { verb: 'lie', pp: 'lié' },
    gender: 'm',
    feminine: { pp: 'liée' },
  },
  snH: {
    gloss: 'entraver',
    forms: { verb: 'entrave', pp: 'entravé' },
    gender: 'f',
    feminine: { pp: 'entravée' },
  },
  arq: {
    gloss: 'lier par serment',
    forms: { verb: 'lie par serment', pp: 'lié par serment' },
    gender: 'm',
    feminine: { pp: 'liée par serment' },
  },
  dmA: {
    gloss: 'lier ensemble',
    forms: { verb: 'assemble', pp: 'assemblé' },
    gender: 'm',
    feminine: { pp: 'assemblée' },
  },
  xtm: {
    gloss: 'sceller',
    forms: { verb: 'scelle', pp: 'scellé' },
    gender: 'm',
    feminine: { pp: 'scellée' },
  },
  mny: {
    gloss: 'amarrer',
    forms: { verb: 'amarre', pp: 'amarré' },
    gender: 'm',
    feminine: { pp: 'amarrée' },
  },
  TAs: {
    gloss: 'nouer',
    forms: { verb: 'noue', pp: 'noué' },
    gender: 'm',
    feminine: { pp: 'nouée' },
  },
  inH: {
    gloss: 'entourer',
    forms: { verb: 'entoure', pp: 'entouré' },
    gender: 'm',
    feminine: { pp: 'entourée' },
  },
  gAf: {
    gloss: 'serrer',
    forms: { verb: 'serre', pp: 'serré' },
    gender: 'f',
    feminine: { pp: 'serrée' },
  },
  ndb: {
    gloss: 'river',
    forms: { verb: 'rive', pp: 'rivé' },
    gender: 'm',
    feminine: { pp: 'rivée' },
  },
  // fire
  xt: { gloss: 'feu', forms: { noun: 'feu' }, gender: 'm' },
  sDt: { gloss: 'flamme', forms: { noun: 'flamme' }, gender: 'f' },
  nsr: { gloss: 'flamboyer', forms: { noun: 'brasier' }, gender: 'm' },
  rkH: {
    gloss: 'brûler',
    forms: { noun: 'brûlure', verb: 'brûle', pp: 'brûlé' },
    gender: 'f',
    feminine: { pp: 'brûlée' },
  },
  nby: { gloss: 'flamber', forms: { noun: 'flambée' }, gender: 'f' },
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
    forms: { noun: 'braise fumante' },
    gender: 'f',
  },
  psy: {
    gloss: 'dessécher par le feu',
    forms: { verb: 'dessèche', pp: 'desséché' },
    feminine: { pp: 'desséchée' },
  },
  // night
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
  // Named by its own adjective rather than by a genitive, so a genitive chain
  // stacking the night behind it does not say the night twice.
  mskt: { gloss: 'barque nocturne', forms: { noun: 'barque nocturne' }, gender: 'f' },
  qnH: {
    gloss: 'obscurité du sanctuaire',
    forms: { noun: 'ombre du naos', adj: 'obscur' },
    gender: 'f',
    feminine: { adj: 'obscure' },
  },
  // death
  mwt: {
    gloss: 'mort',
    forms: { noun: 'mort', adj: 'mort' },
    gender: 'f',
    feminine: { adj: 'morte' },
  },
  qrs: {
    gloss: 'ensevelir',
    forms: { noun: 'sépulture', adj: 'inhumé' },
    gender: 'f',
    feminine: { adj: 'inhumée' },
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
  Htm: { gloss: 'anéantir', forms: { noun: 'anéantissement' }, gender: 'm' },
  // gates
  sbA: { gloss: 'portail', forms: { noun: 'portail' }, gender: 'm' },
  sbxt: { gloss: 'porche', forms: { noun: 'porche' }, gender: 'm' },
  aA: { gloss: 'porte', forms: { noun: 'porte' }, gender: 'f' },
  rwty: { gloss: 'double porte', forms: { noun: 'double porte' }, gender: 'f' },
  arwt: { gloss: 'cour du portail', forms: { noun: 'cour du portail' }, gender: 'f' },
  TpHt: { gloss: 'bouche de caverne', forms: { noun: 'bouche de caverne' }, gender: 'f' },
  wAt: { gloss: 'route', forms: { noun: 'route' }, gender: 'f' },
  xnd: { gloss: 'seuil', forms: { noun: 'seuil' }, gender: 'm' },
  // time
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
  // sight. Every verb is a first-group one, so one stored form serves the
  // question, the first person and the imperative alike.
  gmH: { gloss: 'entrevoir', forms: { verb: 'décèle' } },
  sSm: { gloss: 'montrer', forms: { noun: 'guide', verb: 'montre' }, gender: 'm' },
  sHD: { gloss: 'illuminer', forms: { verb: 'illumine' } },
  wbA: { gloss: 'dévoiler', forms: { verb: 'dévoile' } },
  irt: { gloss: 'œil', forms: { noun: 'œil' }, gender: 'm' },
  rswt: { gloss: 'rêve', forms: { noun: 'rêve' }, gender: 'm' },
  sxA: { gloss: 'rappeler à la mémoire', forms: { verb: 'remémore' } },
  nwty: { gloss: 'veilleur', forms: { noun: 'veilleur' }, gender: 'm' },
  wHa: { gloss: 'déchiffrer', forms: { verb: 'déchiffre' } },
  mAa: { gloss: 'véridique', forms: { adj: 'véridique' } },
  // fate
  SAy: {
    gloss: 'destin',
    forms: { noun: 'destin', adj: 'promis' },
    gender: 'm',
    feminine: { adj: 'promise' },
  },
  wD: { gloss: 'décret', forms: { noun: 'décret' }, gender: 'm' },
  mxAt: { gloss: 'balance', forms: { noun: 'balance' }, gender: 'f' },
  ip: { gloss: 'compte', forms: { noun: 'compte' }, gender: 'm' },
  nHb: { gloss: 'part assignée', forms: { noun: 'part assignée' }, gender: 'f' },
  pHwy: { gloss: 'le terme de la chose', forms: { noun: 'terme' }, gender: 'm' },
  bAw: { gloss: 'puissance manifeste', forms: { noun: 'puissance manifeste' }, gender: 'f' },
  xpr: { gloss: 'ce qui advient', forms: { noun: 'chose qui advient' }, gender: 'f' },
  mty: { gloss: 'infaillible', forms: { adj: 'infaillible' } },
  wpwt: { gloss: 'verdict transmis', forms: { noun: 'verdict transmis' }, gender: 'm' },
  // signs
  sS: { gloss: 'signe écrit', forms: { noun: 'signe écrit' }, gender: 'm' },
  mtr: { gloss: 'témoin', forms: { noun: 'témoin' }, gender: 'm' },
  bik: { gloss: 'faucon', forms: { noun: 'faucon' }, gender: 'm' },
  Sdy: { gloss: 'lecture à voix haute', forms: { noun: 'lecture à voix haute' }, gender: 'f' },
  wSd: { gloss: 'question posée', forms: { noun: 'question posée' }, gender: 'f' },
  wSb: { gloss: 'réponse', forms: { noun: 'réponse' }, gender: 'f' },
  smi: { gloss: 'rapport', forms: { noun: 'rapport' }, gender: 'm' },
  psS: { gloss: 'lot partagé', forms: { noun: 'lot partagé' }, gender: 'm' },
  xAy: { gloss: 'mesure prise', forms: { noun: 'mesure prise' }, gender: 'f' },
  hn: { gloss: 'assentiment', forms: { noun: 'assentiment' }, gender: 'm' },
  // course. First-group verbs, so one stored form serves the command and the
  // first person alike.
  DA: { gloss: 'traverser', forms: { verb: 'traverse' } },
  an: { gloss: 'faire demi-tour', forms: { verb: 'ramène' } },
  As: { gloss: 'hâter', forms: { verb: 'presse' } },
  wsf: { gloss: 'ralentir', forms: { verb: 'retarde' } },
  aHa: { gloss: 'arrêter', forms: { verb: 'arrête' } },
  Ts: { gloss: 'soulever hors', forms: { verb: 'soulève' } },
  nmt: { gloss: 'pas', forms: { noun: 'pas' }, gender: 'm' },
  Smt: { gloss: 'cours', forms: { noun: 'cours' }, gender: 'm' },
  xAx: { gloss: 'rapide', forms: { adj: 'prompt' }, feminine: { adj: 'prompte' } },
  mAwy: {
    gloss: 'renouveler',
    forms: { verb: 'renouvelle', adj: 'neuf' },
    feminine: { adj: 'neuve' },
  },
  // beings
  nTr: { gloss: 'dieu', forms: { noun: 'dieu' }, gender: 'm' },
  kA: { gloss: 'le double qui survit au corps', forms: { noun: 'double' }, gender: 'm' },
  bA: { gloss: 'l’âme qui voyage', forms: { noun: 'âme voyageuse' }, gender: 'f' },
  Ax: { gloss: 'le mort transfiguré', forms: { noun: 'esprit transfiguré' }, gender: 'm' },
  Hm: { gloss: 'majesté', forms: { noun: 'majesté' }, gender: 'f' },
  Sms: { gloss: 'suivant d’un dieu', forms: { noun: 'suivant' }, gender: 'm' },
  wr: { gloss: 'le grand', forms: { noun: 'grand' }, gender: 'm' },
  Hnwt: { gloss: 'maîtresse', forms: { noun: 'maîtresse' }, gender: 'f' },
  sAw: { gloss: 'gardien', forms: { noun: 'gardien' }, gender: 'm' },
  tpy: { gloss: 'celui qui fut avant', forms: { noun: 'ancêtre' }, gender: 'm' },
};

// A gender rides every name because the interrogative inversion of a
// Divination clause resumes its subject with a pronoun.
const powers: NamedPowerTable = {
  HkA: { name: 'Héka', gloss: 'Héka, la magie même.', gender: 'm' },
  ra: { name: 'Rê', gloss: 'Rê, le soleil d’en haut.', gender: 'm' },
  DHwty: { name: 'Djéhouty', gloss: 'Djéhouty, maître de l’écriture.', gender: 'm' },
  Ast: { name: 'Aset', gloss: 'Aset, grande de magie.', gender: 'f' },
  wsir: { name: 'Ousir', gloss: 'Ousir, maître des morts.', gender: 'm' },
  inpw: { name: 'Inpou', gloss: 'Inpou, ouvreur des chemins.', gender: 'm' },
  sxmt: { name: 'Sekhmet', gloss: 'Sekhmet, la peste et le bouclier.', gender: 'f' },
  aApp: { name: 'Apep', gloss: 'Apep, le serpent adversaire.', gender: 'm' },
  imn: { name: 'Imen', gloss: 'Imen, le caché qui répond.', gender: 'm' },
  Hr: { name: 'Hor', gloss: 'Hor, l’enfant faucon guéri de la piqûre.', gender: 'm' },
};

// Each epithet keeps the article a title needs and a vocative drops.
const epithets: GlossTable = {
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

const idioms: GlossTable = {
  EO1: 'Récitation.',
  EO4: 'Quant à ce qui est vu en rêve.',
  ELDRITCH_OPEN: 'Le rite prononcé à rebours.',
  EC1: 'Vie, prospérité, santé.',
  EC2: 'Juste de voix.',
  EC4: 'Ainsi en est-il.',
  ELDRITCH_CLOSE: 'Dissolution à jamais.',
};

// The same counts read as how far a crossing went (spec 1.6).
const depths: GlossTable = {
  2: 'Deux heures de profondeur.',
  3: 'Trois heures de profondeur.',
  4: 'Quatre heures de profondeur.',
  7: 'Sept heures de profondeur.',
  9: 'Neuf heures de profondeur.',
  12: 'Douze heures de profondeur.',
};

const directions: GlossTable = {
  back: 'en arrière',
  forth: 'en avant',
  again: 'de nouveau',
  still: 'en suspens',
};

const seals: GlossTable = {
  2: 'Récité deux fois.',
  3: 'Récité trois fois.',
  4: 'Récité quatre fois.',
  7: 'Récité sept fois.',
  9: 'Récité neuf fois.',
  12: 'Récité douze fois.',
};

function noun(id: string): string {
  return form(roots, id, 'noun');
}

function theNoun(id: string): string {
  return definite(noun(id), genderOf(roots, id));
}

// The adverbial modifier reads as a prepositional phrase at clause end.
function adverbial(rootId: string | null): string {
  return rootId === null ? '' : ` dans ${theNoun(rootId)}`;
}

// An attributive adjective follows its noun in French and agrees with it.
function adjectival(rootId: string | null, headRoot: string): string {
  return after(rootId === null ? null : agreed(roots, rootId, 'adj', genderOf(roots, headRoot)));
}

// How a participant is named when it is addressed or spoken on its own.
function named(ref: GlossRef): string {
  if (ref.kind === 'epithet') return vocative(lookup(epithets, ref.id, 'epithet'));
  if (ref.kind === 'power') return power(powers, ref.id).name;
  return noun(ref.id);
}

// How a participant reads when it hangs off the one before it, the genitive
// chain of an Invocation. French contracts the preposition with the article.
function stacked(ref: GlossRef): string {
  if (ref.kind === 'epithet') return ofPhrase(lookup(epithets, ref.id, 'epithet'));
  if (ref.kind === 'power') return `de ${power(powers, ref.id).name}`;
  return ofDefinite(noun(ref.id), genderOf(roots, ref.id));
}

export const egyptianGlosses: EgyptianGlosses = {
  roots,
  powers,
  epithets,
  idioms,
  seals,
  depths,
  directions,

  ...genomeMethods({ idioms, seals, depths, directions }),

  protectionClause: (p: EgyptianProtection) =>
    `${capitalize(speaker(form(roots, p.intentRoot, 'verb')))} contre ` +
    `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}` +
    `${adverbial(p.adverbRoot)}, par ${power(powers, p.agentPower).name}. ` +
    `${exclaim(power(powers, p.freePower).name)}`,

  curseClause: (p: EgyptianCurse) =>
    `Que ${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)} soit ` +
    `${agreed(roots, p.intentRoot, 'pp', genderOf(roots, p.targetRoot))}` +
    `${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: EgyptianInvocation) => {
    const head = p.agents[0];
    const chain = p.agents.slice(1).map((ref) => ` ${stacked(ref)}`).join('');
    const spoken = p.power.kind === 'epithet' ? capitalize(p.power.spoken) : named(p.power);
    return (
      exclaim(
        `Ô ${head === undefined ? '' : named(head)}${chain}, viens${adverbial(p.adverbRoot)}`,
      ) + ` ${exclaim(spoken)}`
    );
  },

  // The particle in-iw opens the question in the script, and French asks by
  // inverting: the named power stands first and a pronoun resumes it behind
  // the verb.
  divinationAsk: (p: EgyptianDivinationAsk) => {
    const god = power(powers, p.agentPower);
    const chain = p.chainRoots
      .map((id) => ` ${ofDefinite(noun(id), genderOf(roots, id))}`)
      .join('');
    return ask(
      `${god.name}${chain} ` +
        `${inverted(form(roots, p.intentRoot, 'verb'), god.gender === 'f' ? 'f' : 'm')} ` +
        `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}` +
        `${adverbial(p.adverbRoot)}`,
    );
  },

  divinationSee: (p: EgyptianDivinationSee) =>
    `${capitalize(speaker(form(roots, p.intentRoot, 'verb')))} ` +
    `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}` +
    `${adverbial(p.adverbRoot)}.`,

  // French fronts the direction, where it wants an adverbial heard first.
  chronomancyCross: (p: ChronomancyCross) =>
    exclaim(
      `${capitalize(lookup(directions, p.direction, 'direction'))}, ` +
        `${form(roots, p.intentRoot, 'verb')} ${theNoun(p.targetRoot)}` +
        `${adjectival(p.adjectiveRoot, p.targetRoot)}${adverbial(p.adverbRoot)}`,
    ),

  // The performative present already performs in French, but every school of
  // this pack speaks in it, so the deed is named as done by the saying.
  chronomancyBind: (p: ChronomancyBind) =>
    `Par ces mots, ${speaker(form(roots, p.intentRoot, 'verb'))} ` +
    `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}` +
    `${adverbial(p.adverbRoot)}.`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `Sortie dans ${theNoun(anchorRoot)}` +
    `${genitiveRoot === null ? '' : ` ${ofDefinite(noun(genitiveRoot), genderOf(roots, genitiveRoot))}`}.`,

  selfDeclaration: (nameId) => `Je suis ${power(powers, nameId).name}.`,

  // The title keeps the epithet's own article, unlike a vocative.
  spellTitle: (subject) =>
    subject.kind === 'epithet'
      ? `Formule ${ofPhrase(lookup(epithets, subject.id, 'epithet'))}.`
      : `Formule ${ofDefinite(noun(subject.id), genderOf(roots, subject.id))}.`,

  nameKnowledge: (address: EgyptianAddress, eldritch) => {
    const who =
      address.kind === 'gate'
        ? `${noun(address.headRoot)} ${ofDefinite(noun(address.tailRoot), genderOf(roots, address.tailRoot))}`
        : named(address);
    return eldritch ? `Ô ${who}, tu connais mon nom.` : `Ô ${who}, je connais ton nom.`;
  },

  tierOne: (subject) =>
    subject.kind === 'epithet'
      ? `${capitalize(subject.spoken)}, ${lookup(epithets, subject.id, 'epithet')}.`
      : power(powers, subject.id).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    exclaim(`${capitalize(form(roots, intentRoot, 'verb'))} ${theNoun(targetRoot)}`),
};
