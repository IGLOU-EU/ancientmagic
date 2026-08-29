// French glosses for the Runic genome. The meanings are docs/genomes.md
// section 2 and the English pack, the wordings are French: nothing here is a
// calque of the English word order.
//
// Power words stay in their own tongue (alu, laukaz), the French frames them.
// Every noun declares its gender, every adjective and participle that a clause
// can hang on a feminine head declares its feminine wording.

import { form, lookup } from '../table.js';
import type {
  RunicCurse,
  RunicDivination,
  RunicGlosses,
  RunicInvocation,
  RunicProtection,
  RunicVox,
} from '../../languages/runic-glosses.js';
import type {
  ChronomancyBind,
  ChronomancyCross,
  GlossRef,
  GlossTable,
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
  speaker,
  toPhrase,
  vocative,
} from './text.js';

const roots: RootGlossTable = {
  // warding
  ward: { gloss: 'guet, garde', forms: { noun: 'gardien', verb: 'garde' }, gender: 'm' },
  skild: { gloss: 'bouclier', forms: { noun: 'bouclier', verb: 'protège' }, gender: 'm' },
  burg: { gloss: 'forteresse', forms: { noun: 'forteresse' }, gender: 'f' },
  helm: { gloss: 'couverture', forms: { noun: 'couverture', verb: 'couvre' }, gender: 'f' },
  gard: { gloss: 'enclos', forms: { noun: 'enclos', verb: 'entoure' }, gender: 'm' },
  frith: { gloss: 'pacte de paix', forms: { noun: 'pacte de paix' }, gender: 'm' },
  mund: { gloss: 'main protectrice', forms: { noun: 'main protectrice' }, gender: 'f' },
  wern: { gloss: 'repousser', forms: { verb: 'repousse' } },
  halg: { gloss: 'consacrer', forms: { verb: 'consacre' } },
  skerm: { gloss: 'faire écran', forms: { verb: 'abrite' } },
  wunj: { gloss: 'joie', forms: { noun: 'joie' }, gender: 'f' },
  lauk: { gloss: 'poireau', forms: { noun: 'poireau' }, gender: 'm' },
  alg: { gloss: 'garde de l’élan', forms: { noun: 'garde de l’élan' }, gender: 'f' },
  tiw: { gloss: 'le dieu du ciel', forms: { noun: 'dieu du ciel' }, gender: 'm' },
  berk: { gloss: 'bouleau', forms: { noun: 'bouleau' }, gender: 'm' },
  othal: { gloss: 'héritage', forms: { noun: 'héritage' }, gender: 'm' },
  // harm
  skath: {
    gloss: 'ravager',
    forms: { verb: 'ravage', pp: 'ravagé' },
    feminine: { pp: 'ravagée' },
  },
  bal: { gloss: 'malheur, mal', forms: { noun: 'malheur' }, gender: 'm' },
  sair: {
    gloss: 'blessure',
    forms: { noun: 'blessure', verb: 'blesse', pp: 'blessé' },
    gender: 'f',
    feminine: { pp: 'blessée' },
  },
  agl: { gloss: 'affliction', forms: { noun: 'affliction' }, gender: 'f' },
  wund: {
    gloss: 'entaille',
    forms: { noun: 'entaille', verb: 'entaille', pp: 'entaillé' },
    gender: 'f',
    feminine: { pp: 'entaillée' },
  },
  slah: {
    gloss: 'frapper',
    forms: { verb: 'frappe', pp: 'frappé' },
    feminine: { pp: 'frappée' },
  },
  brek: {
    gloss: 'briser',
    forms: { verb: 'brise', pp: 'brisé' },
    feminine: { pp: 'brisée' },
  },
  ait: {
    gloss: 'poison',
    forms: { noun: 'poison', verb: 'empoisonne', pp: 'empoisonné' },
    gender: 'm',
    feminine: { pp: 'empoisonnée' },
  },
  grim: {
    gloss: 'farouche, cruel',
    forms: { adj: 'cruel', adv: 'cruellement' },
    feminine: { adj: 'cruelle' },
  },
  harm: {
    gloss: 'douleur, mal',
    forms: { noun: 'douleur', verb: 'tourmente', pp: 'tourmenté' },
    gender: 'f',
    feminine: { pp: 'tourmentée' },
  },
  kaun: { gloss: 'plaie', forms: { noun: 'plaie' }, gender: 'f' },
  hagl: { gloss: 'grêle', forms: { noun: 'grêle' }, gender: 'f' },
  // summoning
  lath: { gloss: 'convoquer, inviter', forms: { verb: 'convoque' } },
  kall: { gloss: 'appeler', forms: { verb: 'appelle' } },
  bud: { gloss: 'mander', forms: { verb: 'mande' } },
  hait: { gloss: 'commander par le nom', forms: { verb: 'ordonne' } },
  // Drawn as an imperative addressed to the invoked power, and as a
  // transitive imperative at tier 2, so the wording has to read both ways.
  wek: { gloss: 'éveiller, veiller', forms: { verb: 'veille' } },
  gal: { gloss: 'chanter, clamer', forms: { verb: 'chante' } },
  sok: { gloss: 'chercher', forms: { verb: 'cherche' } },
  kum: { gloss: 'venir', forms: { verb: 'viens' } },
  lok: { gloss: 'attirer', forms: { verb: 'attire' } },
  stefn: {
    gloss: 'appel de la voix',
    forms: { noun: 'appel de la voix', verb: 'invoque' },
    gender: 'm',
  },
  ur: { gloss: 'bête primordiale', forms: { noun: 'bête primordiale' }, gender: 'f' },
  ans: { gloss: 'dieu', forms: { noun: 'dieu' }, gender: 'm' },
  ehw: { gloss: 'cheval', forms: { noun: 'cheval' }, gender: 'm' },
  ingw: { gloss: 'le dieu Ing', forms: { noun: 'dieu Ing' }, gender: 'm' },
  // hidden
  run: { gloss: 'secret', forms: { noun: 'secret' }, gender: 'm' },
  laun: { gloss: 'dissimulation', forms: { noun: 'dissimulation' }, gender: 'f' },
  hel: { gloss: 'cacher', forms: {} },
  hul: { gloss: 'couvrir', forms: {} },
  dul: { gloss: 'chose voilée', forms: { noun: 'chose voilée' }, gender: 'f' },
  mirk: {
    gloss: 'obscurité',
    forms: { noun: 'obscurité', adv: 'obscurément' },
    gender: 'f',
  },
  felh: { gloss: 'confier au secret', forms: {} },
  grub: { gloss: 'creuser en secret', forms: {} },
  huld: { gloss: 'l’être caché', forms: { noun: 'être caché' }, gender: 'm' },
  swik: { gloss: 'tromperie', forms: { noun: 'tromperie' }, gender: 'f' },
  feh: { gloss: 'richesse amassée', forms: { noun: 'richesse amassée' }, gender: 'f' },
  perth: { gloss: 'cornet à sorts', forms: { noun: 'cornet à sorts' }, gender: 'm' },
  // binding
  bind: {
    gloss: 'lier',
    forms: { verb: 'lie', pp: 'lié' },
    feminine: { pp: 'liée' },
  },
  band: { gloss: 'lien', forms: { noun: 'lien' }, gender: 'm' },
  haft: { gloss: 'emprise', forms: { noun: 'emprise', verb: 'entrave' }, gender: 'f' },
  fetur: { gloss: 'chaîne', forms: { noun: 'chaîne', verb: 'enchaîne' }, gender: 'f' },
  knut: { gloss: 'nœud', forms: { noun: 'nœud', verb: 'noue' }, gender: 'm' },
  wrid: { gloss: 'tordre', forms: { verb: 'vrille' } },
  spann: { gloss: 'enserrer', forms: { verb: 'enserre' } },
  tug: { gloss: 'corde', forms: { noun: 'corde' }, gender: 'f' },
  hald: {
    gloss: 'tenir',
    forms: { verb: 'immobilise', pp: 'immobilisé' },
    feminine: { pp: 'immobilisée' },
  },
  luk: {
    gloss: 'verrouiller',
    forms: { verb: 'verrouille', pp: 'verrouillé' },
    feminine: { pp: 'verrouillée' },
  },
  geb: { gloss: 'don qui lie', forms: { noun: 'don qui lie' }, gender: 'm' },
  naud: {
    gloss: 'entrave de nécessité',
    forms: { noun: 'entrave de nécessité' },
    gender: 'f',
  },
  is: { gloss: 'glace', forms: { noun: 'glace' }, gender: 'f' },
  // fire
  fur: { gloss: 'feu', forms: { noun: 'feu' }, gender: 'm' },
  brand: { gloss: 'tison ardent', forms: { noun: 'tison ardent' }, gender: 'm' },
  log: { gloss: 'flamme', forms: { noun: 'flamme' }, gender: 'f' },
  eim: { gloss: 'fumée du feu', forms: { noun: 'fumée du feu' }, gender: 'f' },
  glod: { gloss: 'braise', forms: { noun: 'braise' }, gender: 'f' },
  brin: { gloss: 'brûler', forms: {} },
  tand: { gloss: 'feu allumé', forms: { noun: 'feu allumé' }, gender: 'm' },
  swid: { gloss: 'roussir', forms: {} },
  funk: { gloss: 'étincelle', forms: { noun: 'étincelle' }, gender: 'f' },
  bael: { gloss: 'bûcher', forms: { noun: 'bûcher' }, gender: 'm' },
  sowil: { gloss: 'soleil', forms: { noun: 'soleil' }, gender: 'm' },
  // night
  naht: { gloss: 'nuit', forms: { noun: 'nuit' }, gender: 'f' },
  derk: { gloss: 'sombre', forms: { adj: 'sombre' } },
  skad: { gloss: 'ombre', forms: { noun: 'ombre' }, gender: 'f' },
  kweld: { gloss: 'soir', forms: { noun: 'soir' }, gender: 'm' },
  swart: { gloss: 'noir', forms: { adj: 'noir' }, feminine: { adj: 'noire' } },
  dim: { gloss: 'terne', forms: { adj: 'terne', adv: 'faiblement' } },
  mena: { gloss: 'lune', forms: { noun: 'lune' }, gender: 'f' },
  rok: { gloss: 'crépuscule', forms: { noun: 'crépuscule' }, gender: 'm' },
  hrim: { gloss: 'givre', forms: { noun: 'givre' }, gender: 'm' },
  draum: { gloss: 'rêve', forms: { noun: 'rêve' }, gender: 'm' },
  // death
  dauth: { gloss: 'mort', forms: { noun: 'mort' }, gender: 'f' },
  wal: {
    gloss: 'les guerriers tombés',
    forms: { noun: 'guerrier tombé' },
    gender: 'm',
  },
  faig: {
    gloss: 'condamné',
    forms: { adj: 'condamné' },
    feminine: { adj: 'condamnée' },
  },
  grab: { gloss: 'tombe', forms: { noun: 'tombe' }, gender: 'f' },
  ban: { gloss: 'fléau, tueur', forms: { noun: 'fléau' }, gender: 'm' },
  lik: { gloss: 'cadavre', forms: { noun: 'cadavre' }, gender: 'm' },
  mold: { gloss: 'terre de tombe', forms: { noun: 'terre de tombe' }, gender: 'f' },
  draug: { gloss: 'revenant', forms: { noun: 'revenant' }, gender: 'm' },
  swelt: { gloss: 'mourir', forms: { verb: 'expire' } },
  naw: { gloss: 'les défunts', forms: { noun: 'défunt' }, gender: 'm' },
  thurs: { gloss: 'esprit hostile', forms: { noun: 'esprit hostile' }, gender: 'm' },
  iw: { gloss: 'if', forms: { noun: 'if' }, gender: 'm' },
  mann: { gloss: 'homme mortel', forms: { noun: 'homme mortel' }, gender: 'm' },
  // gates
  dur: { gloss: 'porte', forms: { noun: 'porte' }, gender: 'f' },
  gat: { gloss: 'ouverture', forms: { noun: 'ouverture' }, gender: 'f' },
  hlid: { gloss: 'portail', forms: { noun: 'portail' }, gender: 'm' },
  grind: { gloss: 'grille du portail', forms: { noun: 'grille du portail' }, gender: 'f' },
  brug: { gloss: 'pont', forms: { noun: 'pont' }, gender: 'm' },
  munth: { gloss: 'bouche, entrée', forms: { noun: 'bouche' }, gender: 'f' },
  stig: { gloss: 'sentier', forms: { noun: 'sentier' }, gender: 'm' },
  weg: { gloss: 'chemin', forms: { noun: 'chemin' }, gender: 'm' },
  bor: { gloss: 'passage percé', forms: { noun: 'passage percé' }, gender: 'm' },
  gap: { gloss: 'brèche, gouffre', forms: { noun: 'gouffre' }, gender: 'm' },
  raid: { gloss: 'chevauchée, voyage', forms: { noun: 'voyage' }, gender: 'm' },
  // time
  tid: { gloss: 'temps, marée', forms: { noun: 'marée du temps' }, gender: 'f' },
  stund: { gloss: 'heure, moment', forms: { noun: 'heure' }, gender: 'f' },
  sumar: { gloss: 'été, saison claire', forms: { noun: 'été' }, gender: 'm' },
  ald: { gloss: 'âge', forms: { noun: 'âge' }, gender: 'm' },
  wurd: { gloss: 'destin tissé', forms: { noun: 'destin tissé' }, gender: 'm' },
  skap: { gloss: 'destinée façonnée', forms: { noun: 'destinée façonnée' }, gender: 'f' },
  morgan: { gloss: 'lendemain', forms: { noun: 'lendemain' }, gender: 'm' },
  aband: { gloss: 'soir des jours', forms: { noun: 'soir des jours' }, gender: 'm' },
  aiw: { gloss: 'éternité', forms: { noun: 'éternité' }, gender: 'f' },
  forn: { gloss: 'temps ancien', forms: { noun: 'temps ancien' }, gender: 'm' },
  dag: { gloss: 'jour', forms: { noun: 'jour' }, gender: 'm' },
  jer: { gloss: 'année de récolte', forms: { noun: 'année de récolte' }, gender: 'f' },
  // sight. Every verb here is a first-group one, so the single stored form
  // serves the question, the first person and the imperative alike.
  seh: { gloss: 'voir', forms: { verb: 'contemple' } },
  spah: {
    gloss: 'prévoir, prophétiser',
    forms: { noun: 'voyant', verb: 'présage' },
    gender: 'm',
  },
  skaw: {
    gloss: 'contempler, fixer du regard',
    forms: { noun: 'guetteur', verb: 'observe' },
    gender: 'm',
  },
  wit: {
    gloss: 'savoir, avoir connaissance de',
    forms: { noun: 'savant', verb: 'discerne' },
    gender: 'm',
  },
  witag: { gloss: 'celui qui sait', forms: { noun: 'prophète' }, gender: 'm' },
  aug: { gloss: 'œil', forms: { noun: 'œil' }, gender: 'm' },
  birt: {
    gloss: 'éclairer, mettre en lumière',
    forms: { verb: 'révèle', adj: 'lumineux' },
    feminine: { adj: 'lumineuse' },
  },
  bar: { gloss: 'mettre à nu, découvrir', forms: { verb: 'dévoile', adj: 'à découvert' } },
  kuth: { gloss: 'faire connaître', forms: { verb: 'proclame', adj: 'manifeste' } },
  glog: {
    gloss: 'à la vue claire',
    forms: { adj: 'clair', adv: 'clairement' },
    feminine: { adj: 'claire' },
  },
  // fate
  urlag: { gloss: 'destin fixé', forms: { noun: 'destin fixé' }, gender: 'm' },
  hlaut: { gloss: 'le lot tombé', forms: { noun: 'lot échu' }, gender: 'm' },
  dom: { gloss: 'arrêt, jugement', forms: { noun: 'jugement' }, gender: 'm' },
  skuld: { gloss: 'ce qui adviendra', forms: { noun: 'chose à venir' }, gender: 'f' },
  norn: { gloss: 'femme du destin', forms: { noun: 'fileuse du destin' }, gender: 'f' },
  metud: { gloss: 'celui qui mesure', forms: { noun: 'mesureur' }, gender: 'm' },
  hail: {
    gloss: 'heureux sort',
    forms: { noun: 'bonne fortune', adj: 'intact' },
    gender: 'f',
    feminine: { adj: 'intacte' },
  },
  end: { gloss: 'fin assignée', forms: { noun: 'fin assignée' }, gender: 'f' },
  thrad: { gloss: 'fil filé', forms: { noun: 'fil filé' }, gender: 'm' },
  wis: {
    gloss: 'certain, fixé',
    forms: { adj: 'certain', adv: 'assurément' },
    feminine: { adj: 'certaine' },
  },
  // signs
  tein: { gloss: 'baguette de sort', forms: { noun: 'baguette du sort' }, gender: 'f' },
  taik: { gloss: 'signe', forms: { noun: 'signe' }, gender: 'm' },
  mark: { gloss: 'marque entaillée', forms: { noun: 'marque entaillée' }, gender: 'f' },
  bauk: { gloss: 'balise', forms: { noun: 'fanal' }, gender: 'm' },
  fugl: { gloss: 'oiseau', forms: { noun: 'oiseau' }, gender: 'm' },
  hraf: { gloss: 'corbeau', forms: { noun: 'corbeau' }, gender: 'm' },
  spor: { gloss: 'trace', forms: { noun: 'trace' }, gender: 'f' },
  frag: { gloss: 'question', forms: { noun: 'question' }, gender: 'f' },
  andswar: { gloss: 'réponse', forms: { noun: 'réponse' }, gender: 'f' },
  rist: { gloss: 'trait entaillé', forms: { noun: 'trait tracé' }, gender: 'm' },
  // course. First-group verbs again, so one stored form serves the command of
  // a crossing clause and the first person of a binding one.
  far: { gloss: 'traverser, voyager', forms: { verb: 'traverse' } },
  wend: {
    gloss: 'faire demi-tour',
    forms: { noun: 'retour', verb: 'ramène' },
    gender: 'm',
  },
  skund: { gloss: 'hâter', forms: { verb: 'presse' } },
  lat: {
    gloss: 'ralentir',
    forms: { verb: 'retarde', adj: 'tardif' },
    feminine: { adj: 'tardive' },
  },
  stand: { gloss: 'arrêter, tenir ferme', forms: { verb: 'arrête' } },
  hef: { gloss: 'soulever hors', forms: { verb: 'soulève' } },
  gang: { gloss: 'marche, cours', forms: { noun: 'cours' }, gender: 'm' },
  stap: { gloss: 'pas', forms: { noun: 'pas' }, gender: 'm' },
  rath: {
    gloss: 'rapide',
    forms: { adj: 'prompt', adv: 'promptement' },
    feminine: { adj: 'prompte' },
  },
  niw: {
    gloss: 'renouveler',
    forms: { verb: 'renouvelle', adj: 'neuf' },
    feminine: { adj: 'neuve' },
  },
  // beings
  dis: { gloss: 'déesse du lignage', forms: { noun: 'déesse du lignage' }, gender: 'f' },
  walkur: {
    gloss: 'celle qui choisit les morts',
    forms: { noun: 'guerrière qui choisit les tombés' },
    gender: 'f',
  },
  haugsit: {
    gloss: 'habitant du tertre',
    forms: { noun: 'habitant du tertre' },
    gender: 'm',
  },
  drohtin: {
    gloss: 'seigneur de la troupe armée',
    forms: { noun: 'seigneur de la troupe' },
    gender: 'm',
  },
  helith: { gloss: 'champion', forms: { noun: 'preux' }, gender: 'm' },
  thul: {
    gloss: 'diseur du savoir ancien',
    forms: { noun: 'diseur du savoir ancien' },
    gender: 'm',
  },
  nith: { gloss: 'parent par le sang', forms: { noun: 'parent par le sang' }, gender: 'm' },
  landwiht: {
    gloss: 'esprit de la terre',
    forms: { noun: 'esprit de la terre' },
    gender: 'm',
  },
  etun: {
    gloss: 'géant des premiers âges',
    forms: { noun: 'géant des premiers âges' },
    gender: 'm',
  },
  alba: { gloss: 'elfe', forms: { noun: 'elfe' }, gender: 'm' },
};

const powers: GlossTable = {
  // Bright power words (spec 2.7).
  alu: 'Alu, le cri de garde.',
  laukaz: 'Laukaz, le poireau de vitalité.',
  lathu: 'Lathu, la convocation.',
  auja: 'Auja, le mot de chance.',
  ota: 'Ota, le cri du compagnon.',
  gagaga: 'Gagaga, le chant de la lance.',
  tuwatuwa: 'Tuwatuwa, le chant des bractéates.',
  // Dread epithets (spec 2.10), each glossed with the article a vocative drops.
  thruznaz: 'le rongeur des profondeurs',
  gulzoth: 'la gueule des ténèbres',
  wuzgrim: 'le froid qui rampe',
  skulthogn: 'l’ombre qui attend',
  hruzbanaz: 'le fléau d’en bas',
  nuthkolaz: 'le froid par-delà les étoiles',
  zguwald: 'le maître du vide',
  muznaht: 'la nuit qui a faim',
  thulgzar: 'le dormeur sous les portes',
  kruthmol: 'le broyeur des âges',
};

// The Norse layer of spec 2.7. La ligne de glyphes dit exactement ce que ces
// gloses disent, donc rien ici n’est un mot tardif glissé dans une bouche plus
// ancienne. Ce qui est tardif, c’est seulement le tableau que les onze
// composent, d’où le nom prononcé puis dit.
const norse: GlossTable = {
  wodanaz: 'Wodanaz, pendu à l’arbre pour gagner les runes',
  thunraz: 'Thunraz, qui consacre au marteau',
  frijjo: 'Frijjo, qui lie et qui délie',
  wulthuz: 'Wulthuz, la gloire',
  ginarunaz: 'Ginarunaz, les runes de puissance',
  erminasul: 'Erminasul, le pilier qui soutient tout',
  ansugardaz: 'Ansugardaz, l’enclos des dieux',
  midjagardaz: 'Midjagardaz, l’enclos du milieu où vivent les hommes',
  nibulahaimaz: 'Nibulahaimaz, le monde sous la brume',
  muspellaz: 'Muspellaz, le feu qui met fin aux mondes',
  halja: 'Halja, le lieu couvert des morts cachés',
};

const idioms: GlossTable = {
  RO1: exclaim('Alu'),
  RO2: exclaim('Moi, le maître des runes'),
  RO3_FIRST_AETT: exclaim('Le premier aett du futhark'),
  RO3_FULL_ROW: exclaim('La rangée entière du futhark'),
  RO4: 'J’ai levé trois baguettes de sort.',
  RO5: exclaim('Les neuf mondes'),
  RC1: 'J’ai peint ces runes.',
  RC2: 'J’ai fait ces runes.',
  RC3: exclaim('Alu'),
  RC4: 'J’ai lu les runes.',
  ELDRITCH_OPEN_SHORT: exclaim('Le premier aett, prononcé contre son ordre'),
  ELDRITCH_OPEN_FULL: exclaim('La rangée des runes, prononcée contre son ordre'),
  ELDRITCH_CLOSE: 'Cela a rongé les runes.',
};

// A seal agrees with « le sortilège », masculine singular.
const seals: GlossTable = {
  3: 'Scellé trois fois.',
  7: 'Scellé sept fois.',
  9: 'Scellé neuf fois.',
  12: 'Scellé douze fois.',
};

// The same counts read as how far a crossing went (spec 1.6).
const depths: GlossTable = {
  3: 'Trois heures de profondeur.',
  7: 'Sept heures de profondeur.',
  9: 'Neuf heures de profondeur.',
  12: 'Douze heures de profondeur.',
};

// French says a direction with an adverbial phrase, which the crossing clause
// fronts: « En arrière, traverse l'heure ! »
const directions: GlossTable = {
  back: 'en arrière',
  forth: 'en avant',
  again: 'de nouveau',
  still: 'en suspens',
};

function noun(id: string): string {
  return form(roots, id, 'noun');
}

function theNoun(id: string): string {
  return definite(noun(id), genderOf(roots, id));
}

function adverb(rootId: string | null): string | null {
  return rootId === null ? null : form(roots, rootId, 'adv');
}

// An attributive adjective follows its noun in French and agrees with it.
function adjective(rootId: string | null, headRoot: string): string | null {
  return rootId === null ? null : agreed(roots, rootId, 'adj', genderOf(roots, headRoot));
}

function agentName(ref: GlossRef): string {
  return ref.kind === 'epithet' ? vocative(lookup(powers, ref.id, 'power')) : noun(ref.id);
}

// Un mot libéré : un cri ou une épithète prononcés tels quels, ou un mot de la
// couche norroise, prononcé puis dit (spec 2.7).
function voxName(vox: RunicVox): string {
  return vox.kind === 'norse' ? lookup(norse, vox.id, 'norse word') : capitalize(vox.id);
}

export const runicGlosses: RunicGlosses = {
  roots,
  powers,
  norse,
  idioms,
  seals,
  depths,
  directions,

  ...genomeMethods({ idioms, seals, depths, directions }),

  protectionClause: (p: RunicProtection) =>
    `Moi, ${theNoun(p.agentRoot)}, ` +
    `${speaker(form(roots, p.intentRoot, 'verb'))}${after(adverb(p.adverbRoot))}` +
    ` contre ${theNoun(p.targetRoot)}` +
    `${after(adjective(p.adjectiveRoot, p.targetRoot))}.`,

  curseClause: (p: RunicCurse) =>
    `Que ${theNoun(p.targetRoot)}${after(adjective(p.adjectiveRoot, p.targetRoot))}` +
    ` soit${after(adverb(p.adverbRoot))} ` +
    `${agreed(roots, p.intentRoot, 'pp', genderOf(roots, p.targetRoot))}.`,

  invocationClause: (p: RunicInvocation) =>
    exclaim(
      `${p.agents.map((ref) => `Ô ${agentName(ref)}`).join(', ')}, ` +
        `${form(roots, p.intentRoot, 'verb')}${after(adverb(p.adverbRoot))}`,
    ) +
    ` ${exclaim(voxName(p.powerWord))}`,

  // The question fronts its verb in the runes, and French asks by inverting
  // its own way: the subject stands first and a pronoun resumes it behind the
  // verb.
  divinationAsk: (p: RunicDivination) =>
    ask(
      `${capitalize(theNoun(p.agentRoot))} ` +
        `${inverted(form(roots, p.intentRoot, 'verb'), genderOf(roots, p.agentRoot))}` +
        `${after(adverb(p.adverbRoot))} ${theNoun(p.targetRoot)}` +
        `${after(adjective(p.adjectiveRoot, p.targetRoot))}`,
    ),

  divinationSee: (p: RunicDivination) =>
    `Moi, ${theNoun(p.agentRoot)}, ` +
    `${speaker(form(roots, p.intentRoot, 'verb'))}${after(adverb(p.adverbRoot))}` +
    ` ${theNoun(p.targetRoot)}${after(adjective(p.adjectiveRoot, p.targetRoot))}.`,

  // The direction opens the command, where French puts an adverbial it wants
  // heard first. The binding clause is marked « Par ces mots »: the French
  // performative present already performs, but every other school of this
  // pack speaks in it too, so the deed is named as done by the saying.
  chronomancyCross: (p: ChronomancyCross) =>
    exclaim(
      `${capitalize(lookup(directions, p.direction, 'direction'))}, ` +
        `${form(roots, p.intentRoot, 'verb')}${after(adverb(p.adverbRoot))} ` +
        `${theNoun(p.targetRoot)}${after(adjective(p.adjectiveRoot, p.targetRoot))}`,
    ),

  chronomancyBind: (p: ChronomancyBind) =>
    `Par ces mots, ${speaker(form(roots, p.intentRoot, 'verb'))}` +
    `${after(adverb(p.adverbRoot))} ${theNoun(p.targetRoot)}` +
    `${after(adjective(p.adjectiveRoot, p.targetRoot))}.`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `Je reviens ${toPhrase(theNoun(anchorRoot))}` +
    `${genitiveRoot === null ? '' : ` ${ofDefinite(noun(genitiveRoot), genderOf(roots, genitiveRoot))}`}.`,

  litanyTriple: (word) => `${capitalize(word)}, prononcé trois fois.`,
  litanyTriangle: (word) => `${capitalize(word)}, réduit à une seule rune.`,

  tierOne: (word, eldritch) => {
    const gloss = lookup(powers, word, 'power');
    return eldritch ? `${capitalize(word)}, ${gloss}.` : gloss;
  },

  tierTwo: (intentRoot, targetRoot) =>
    exclaim(`${capitalize(form(roots, intentRoot, 'verb'))} ${theNoun(targetRoot)}`),
};
