// French glosses for the Latin genome. The meanings are docs/genomes.md
// section 9 and the dictionary sense each root is cut from, the wordings are
// French: nothing here is a calque of the English word order.
//
// This genome is read directly by part of its audience, so the French sentence
// answers to the same stricter contract the English one does. It says what the
// capitals say, in French, and takes no liberty the letters above it do not
// allow.
//
// Every noun declares its gender, every adjective and participle a clause can
// hang on a feminine head declares its feminine wording, and every verb
// wording is a first-group one, because one stored form has to serve the four
// moods this genome draws: the first person of a Protection or a seeing
// clause, the third person of an interrogative inversion, the second person
// imperative of an Invocation, a crossing clause or tier 2, and the
// performative of a binding clause.
//
// The vocative takes « Ô » and a bare noun, with no article and no capital, as
// the four older packs address a power. French has no vocative case to echo,
// so the Latin -E ending stays a fact of the reading line.

import { form, lookup, power } from '../table.js';
import type {
  LatinChronomancyBind,
  LatinChronomancyCross,
  LatinCurse,
  LatinDivination,
  LatinGlosses,
  LatinInvocation,
  LatinProtection,
} from '../../languages/latin-glosses.js';
import type { GlossRef, GlossTable, NamedPowerTable, RootGlossTable } from '../types.js';
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
  toPhrase,
  vocative,
} from './text.js';

const roots: RootGlossTable = {
  // warding
  serv: { gloss: 'garder', forms: { verb: 'garde' } },
  tutel: { gloss: 'gardien', forms: { noun: 'gardien' }, gender: 'm' },
  geni: { gloss: 'génie tutélaire', forms: { noun: 'génie tutélaire' }, gender: 'm' },
  mur: { gloss: 'mur', forms: { noun: 'mur' }, gender: 'm' },
  clipe: { gloss: 'bouclier', forms: { noun: 'bouclier' }, gender: 'm' },
  vall: { gloss: 'palissade', forms: { noun: 'palissade' }, gender: 'f' },
  praesidi: { gloss: 'place forte', forms: { noun: 'place forte' }, gender: 'f' },
  firm: { gloss: 'affermir', forms: { verb: 'consolide' } },
  arm: { gloss: 'armer', forms: { verb: 'arme' } },
  obser: { gloss: 'verrouiller', forms: { verb: 'verrouille' } },
  // harm
  vex: {
    gloss: 'tourmenter',
    forms: { verb: 'tourmente', pp: 'tourmenté' },
    feminine: { pp: 'tourmentée' },
  },
  damn: {
    gloss: 'condamner',
    forms: { verb: 'condamne', pp: 'condamné' },
    feminine: { pp: 'condamnée' },
  },
  vulner: {
    gloss: 'blesser',
    forms: { verb: 'blesse', pp: 'blessé' },
    feminine: { pp: 'blessée' },
  },
  nec: { gloss: 'tuer', forms: { verb: 'tue', pp: 'tué' }, feminine: { pp: 'tuée' } },
  flagell: {
    gloss: 'flageller',
    forms: { verb: 'flagelle', pp: 'flagellé' },
    feminine: { pp: 'flagellée' },
  },
  morb: { gloss: 'maladie', forms: { noun: 'maladie' }, gender: 'f' },
  ruin: { gloss: 'ruine', forms: { noun: 'ruine' }, gender: 'f' },
  nox: { gloss: 'dommage', forms: { noun: 'dommage' }, gender: 'm' },
  amar: {
    gloss: 'amer',
    forms: { adj: 'amer', adv: 'amèrement' },
    feminine: { adj: 'amère' },
  },
  dir: { gloss: 'redoutable', forms: { adj: 'redoutable' } },
  // summoning
  voc: { gloss: 'appeler', forms: { verb: 'appelle' } },
  evoc: { gloss: 'évoquer', forms: { verb: 'évoque' } },
  clam: { gloss: 'proclamer', forms: { verb: 'proclame' } },
  invit: { gloss: 'inviter', forms: { verb: 'invite' } },
  rog: { gloss: 'implorer', forms: { verb: 'implore' } },
  flagit: { gloss: 'exiger', forms: { verb: 'exige' } },
  incant: { gloss: 'enchanter', forms: { verb: 'enchante' } },
  nunti: { gloss: 'messager', forms: { noun: 'messager', verb: 'annonce' }, gender: 'm' },
  proper: { gloss: 'approcher en hâte', forms: { verb: 'approche' } },
  // Drawn as an imperative addressed to the invoked power and nowhere else,
  // which is what lets a wording carry its own direction.
  advol: { gloss: 'voler jusqu’ici', forms: { verb: 'vole ici' } },
  // hidden
  cel: { gloss: 'cacher', forms: { verb: 'cache' } },
  occult: { gloss: 'dissimuler', forms: { verb: 'dissimule', adv: 'secrètement' } },
  vel: { gloss: 'voile', forms: { noun: 'voile', verb: 'voile' }, gender: 'm' },
  latebr: { gloss: 'cachette', forms: { noun: 'cachette' }, gender: 'f' },
  cavern: { gloss: 'caverne', forms: { noun: 'caverne' }, gender: 'f' },
  susurr: { gloss: 'murmure', forms: { noun: 'murmure', verb: 'murmure' }, gender: 'm' },
  secret: { gloss: 'secret', forms: { noun: 'secret' }, gender: 'm' },
  arcan: { gloss: 'arcane', forms: { noun: 'arcane' }, gender: 'm' },
  silenti: { gloss: 'silence', forms: { noun: 'silence' }, gender: 'm' },
  profund: { gloss: 'la profondeur', forms: { noun: 'profondeur' }, gender: 'f' },
  // binding
  lig: { gloss: 'lier', forms: { verb: 'lie' } },
  oblig: { gloss: 'ligoter', forms: { verb: 'ligote' } },
  nod: { gloss: 'nœud', forms: { noun: 'nœud', verb: 'noue' }, gender: 'm' },
  vincul: { gloss: 'lien', forms: { noun: 'lien' }, gender: 'm' },
  caten: { gloss: 'chaîne', forms: { noun: 'chaîne' }, gender: 'f' },
  obsign: { gloss: 'sceller', forms: { verb: 'scelle' } },
  sigill: { gloss: 'sceau', forms: { noun: 'sceau' }, gender: 'm' },
  fren: { gloss: 'bride', forms: { noun: 'bride', verb: 'refrène' }, gender: 'f' },
  ser: { gloss: 'barre de porte', forms: { noun: 'barre de porte' }, gender: 'f' },
  clav: { gloss: 'clou', forms: { noun: 'clou' }, gender: 'm' },
  // fire
  flamm: { gloss: 'flamme', forms: { noun: 'flamme', verb: 'embrase' }, gender: 'f' },
  crem: { gloss: 'consumer', forms: { verb: 'consume' } },
  ustul: { gloss: 'brûler', forms: { verb: 'brûle' } },
  flagr: { gloss: 'flamboyer', forms: { verb: 'flamboie' } },
  favill: { gloss: 'braise', forms: { noun: 'braise' }, gender: 'f' },
  scintill: { gloss: 'étincelle', forms: { noun: 'étincelle' }, gender: 'f' },
  prun: { gloss: 'charbon ardent', forms: { noun: 'charbon ardent' }, gender: 'm' },
  fum: { gloss: 'fumée', forms: { noun: 'fumée' }, gender: 'f' },
  lucern: { gloss: 'lampe', forms: { noun: 'lampe' }, gender: 'f' },
  bust: { gloss: 'bûcher', forms: { noun: 'bûcher' }, gender: 'm' },
  // night
  lun: { gloss: 'lune', forms: { noun: 'lune' }, gender: 'f' },
  stell: { gloss: 'étoile', forms: { noun: 'étoile' }, gender: 'f' },
  umbr: { gloss: 'ombre', forms: { noun: 'ombre' }, gender: 'f' },
  nebul: { gloss: 'brume', forms: { noun: 'brume' }, gender: 'f' },
  somn: { gloss: 'sommeil', forms: { noun: 'sommeil' }, gender: 'm' },
  crepuscul: { gloss: 'crépuscule', forms: { noun: 'crépuscule' }, gender: 'm' },
  brum: { gloss: 'nuit du solstice', forms: { noun: 'nuit du solstice' }, gender: 'f' },
  obscur: {
    gloss: 'obscur',
    forms: { adj: 'obscur', adv: 'obscurément' },
    feminine: { adj: 'obscure' },
  },
  furv: { gloss: 'noir', forms: { adj: 'noir' }, feminine: { adj: 'noire' } },
  nocturn: { gloss: 'nocturne', forms: { adj: 'nocturne' } },
  // death
  let: { gloss: 'mort', forms: { noun: 'mort' }, gender: 'f' },
  sepulcr: { gloss: 'sépulcre', forms: { noun: 'sépulcre' }, gender: 'm' },
  larv: { gloss: 'spectre', forms: { noun: 'spectre' }, gender: 'm' },
  tumul: { gloss: 'tertre funéraire', forms: { noun: 'tertre funéraire' }, gender: 'm' },
  simulacr: { gloss: 'fantôme', forms: { noun: 'fantôme' }, gender: 'm' },
  urn: { gloss: 'urne', forms: { noun: 'urne funéraire' }, gender: 'f' },
  defunct: { gloss: 'défunt', forms: { adj: 'défunt' }, feminine: { adj: 'défunte' } },
  funest: { gloss: 'funeste', forms: { adj: 'funeste' } },
  trucid: { gloss: 'massacrer', forms: { verb: 'massacre' } },
  immol: { gloss: 'immoler', forms: { verb: 'immole' } },
  // gates
  port: { gloss: 'portail', forms: { noun: 'portail' }, gender: 'm' },
  ianu: { gloss: 'porte', forms: { noun: 'porte' }, gender: 'f' },
  osti: { gloss: 'embrasure', forms: { noun: 'embrasure' }, gender: 'f' },
  vi: { gloss: 'route', forms: { noun: 'route' }, gender: 'f' },
  semit: { gloss: 'sentier', forms: { noun: 'sentier' }, gender: 'm' },
  fenestr: { gloss: 'fenêtre', forms: { noun: 'fenêtre' }, gender: 'f' },
  claustr: { gloss: 'passage barré', forms: { noun: 'passage barré' }, gender: 'm' },
  vestibul: { gloss: 'avant-cour', forms: { noun: 'avant-cour' }, gender: 'f' },
  postic: { gloss: 'porte de derrière', forms: { noun: 'porte de derrière' }, gender: 'f' },
  reser: { gloss: 'déverrouiller', forms: { verb: 'déverrouille' } },
  // time
  hor: { gloss: 'heure', forms: { noun: 'heure' }, gender: 'f' },
  auror: { gloss: 'aurore', forms: { noun: 'aurore' }, gender: 'f' },
  ann: { gloss: 'année', forms: { noun: 'année' }, gender: 'f' },
  saecul: { gloss: 'siècle', forms: { noun: 'siècle' }, gender: 'm' },
  aev: { gloss: 'âge sans fin', forms: { noun: 'âge sans fin' }, gender: 'm' },
  moment: { gloss: 'instant', forms: { noun: 'instant' }, gender: 'm' },
  crastin: { gloss: 'lendemain', forms: { noun: 'lendemain' }, gender: 'm' },
  initi: { gloss: 'commencement', forms: { noun: 'commencement' }, gender: 'm' },
  termin: { gloss: 'terme', forms: { noun: 'terme' }, gender: 'm' },
  aetern: { gloss: 'éternité', forms: { noun: 'éternité' }, gender: 'f' },
  // sight
  spect: { gloss: 'regarder', forms: { verb: 'regarde' } },
  observ: { gloss: 'observer', forms: { verb: 'observe' } },
  monstr: { gloss: 'montrer', forms: { verb: 'montre' } },
  revel: { gloss: 'dévoiler', forms: { verb: 'dévoile' } },
  lustr: { gloss: 'inspecter', forms: { verb: 'inspecte' } },
  explor: { gloss: 'explorer', forms: { verb: 'explore' } },
  divin: { gloss: 'devin', forms: { noun: 'devin' }, gender: 'm' },
  sortileg: { gloss: 'tireur de sorts', forms: { noun: 'tireur de sorts' }, gender: 'm' },
  ocul: { gloss: 'œil', forms: { noun: 'œil' }, gender: 'm' },
  clar: {
    gloss: 'clair',
    forms: { adj: 'clair', adv: 'clairement' },
    feminine: { adj: 'claire' },
  },
  // fate
  fat: { gloss: 'destin', forms: { noun: 'destin' }, gender: 'm' },
  fortun: { gloss: 'fortune', forms: { noun: 'fortune' }, gender: 'f' },
  fil: { gloss: 'fil', forms: { noun: 'fil filé' }, gender: 'm' },
  pens: { gloss: 'part assignée', forms: { noun: 'part assignée' }, gender: 'f' },
  decret: { gloss: 'décret', forms: { noun: 'décret' }, gender: 'm' },
  iudici: { gloss: 'jugement', forms: { noun: 'jugement' }, gender: 'm' },
  genitur: { gloss: 'astre natal', forms: { noun: 'astre natal' }, gender: 'm' },
  destin: { gloss: 'destiné', forms: { adj: 'destiné' }, feminine: { adj: 'destinée' } },
  cert: {
    gloss: 'certain',
    forms: { adj: 'certain', adv: 'assurément' },
    feminine: { adj: 'certaine' },
  },
  fatidic: { gloss: 'fatidique', forms: { adj: 'fatidique' } },
  // signs
  sign: { gloss: 'signe', forms: { noun: 'signe', verb: 'marque' }, gender: 'm' },
  portent: { gloss: 'prodige', forms: { noun: 'prodige' }, gender: 'm' },
  oracul: { gloss: 'oracle', forms: { noun: 'oracle' }, gender: 'm' },
  auguri: { gloss: 'augure', forms: { noun: 'augure' }, gender: 'm' },
  praesagi: { gloss: 'présage', forms: { noun: 'présage' }, gender: 'm' },
  respons: { gloss: 'réponse', forms: { noun: 'réponse' }, gender: 'f' },
  aquil: { gloss: 'aigle', forms: { noun: 'aigle' }, gender: 'm' },
  corv: { gloss: 'corbeau', forms: { noun: 'corbeau' }, gender: 'm' },
  fibr: { gloss: 'signe des entrailles', forms: { noun: 'signe des entrailles' }, gender: 'm' },
  astr: { gloss: 'signe astral', forms: { noun: 'signe astral' }, gender: 'm' },
  // course
  super: { gloss: 'dépasser', forms: { verb: 'dépasse' } },
  revoc: { gloss: 'rappeler', forms: { verb: 'rappelle' } },
  festin: { gloss: 'presser', forms: { verb: 'presse' } },
  tard: { gloss: 'retarder', forms: { verb: 'retarde', adj: 'lent' }, feminine: { adj: 'lente' } },
  retent: { gloss: 'endiguer', forms: { verb: 'endigue' } },
  nov: {
    gloss: 'renouveler',
    forms: { verb: 'renouvelle', adj: 'neuf' },
    feminine: { adj: 'neuve' },
  },
  rapid: { gloss: 'rapide', forms: { adj: 'rapide', adv: 'rapidement' } },
  curricul: { gloss: 'course', forms: { noun: 'course' }, gender: 'f' },
  vestigi: { gloss: 'empreinte', forms: { noun: 'empreinte' }, gender: 'f' },
  orbit: { gloss: 'ornière', forms: { noun: 'ornière' }, gender: 'f' },
};

// The attested powers keep their own tongue, in the French orthography the
// scholarship of each name settled on, and the French frames them. The two
// chants carry a gloss they can never show: tier 1 writes no separator and a
// chant needs one, so the table stays whole rather than minimal.
const powers: NamedPowerTable = {
  abracadabra: {
    name: 'Abracadabra',
    gloss: 'Abracadabra, le mot porté contre la fièvre.',
  },
  motas: {
    name: 'Motas vaeta daries dardares astataries dissunapiter',
    gloss:
      'Motas vaeta daries dardares astataries dissunapiter, le plus ancien charme de Rome.',
  },
  huat: {
    name: 'Huat hauat huat ista pista sista dannabo dannaustra',
    gloss:
      'Huat hauat huat ista pista sista dannabo dannaustra, le second chant de la même page.',
  },
  fascinus: { name: 'Fascinus', gloss: 'Fascinus, la puissance qui détourne l’œil envieux.' },
  angitia: { name: 'Angitia', gloss: 'Angitia, qui charme les serpents.' },
  carmenta: { name: 'Carmenta', gloss: 'Carmenta, dont le nom porte le chant.' },
  egeria: { name: 'Égérie', gloss: 'Égérie, la source que le roi consultait de nuit.' },
  proserpina: { name: 'Proserpine', gloss: 'Proserpine, la reine d’en bas.' },
  dispater: { name: 'Dis Pater', gloss: 'Dis Pater, le maître des morts.' },
};

// Each epithet keeps the article a vocative drops.
const epithets: GlossTable = {
  xulgoth: 'la gueule sous le seuil',
  sthulvorn: 'l’étendue derrière le mur',
  gnorvath: 'la faim qui apprend',
  throxul: 'la roue qui broie les astres',
  mroguth: 'l’essaim sans maître',
  gvortha: 'la porte qui respire',
  sthanox: 'l’œil sous l’année',
  thulcron: 'le dormeur sous les âges',
  vrixoth: 'le murmure contre la lumière',
  ulthrax: 'la nuit qui compte les morts',
};

const idioms: GlossTable = {
  LO1: 'Amulette.',
  LO2: 'Je te prie et te supplie.',
  LO3_SHORT: exclaim('Le carré'),
  LO3_FULL: exclaim('Les cinq mots du carré'),
  LO4: 'Je le cloue au sol.',
  LO5: 'Je tire le sort.',
  LO6: exclaim('Ô Janus père'),
  LC1: 'Maintenant, maintenant, vite, vite.',
  LC2: 'Qu’il en soit ainsi.',
  LC3: 'J’ai acquitté le vœu.',
  LC4: 'Il en est ainsi.',
  ELDRITCH_OPEN_SHORT: exclaim('Le carré, lu contre son ordre'),
  ELDRITCH_OPEN_FULL: exclaim('Les cinq mots du carré, lus contre leur ordre'),
  ELDRITCH_CLOSE: 'Ruine éternelle.',
};

// The seal writes an order, not a report: DICITO tells the sayer how often.
const seals: GlossTable = {
  3: 'Dis-le trois fois.',
  7: 'Dis-le sept fois.',
  9: 'Dis-le neuf fois.',
  12: 'Dis-le douze fois.',
  27: 'Dis-le vingt-sept fois.',
};

const depths: GlossTable = {
  3: 'Trois heures de profondeur.',
  7: 'Sept heures de profondeur.',
  9: 'Neuf heures de profondeur.',
  12: 'Douze heures de profondeur.',
  27: 'Vingt-sept heures de profondeur.',
};

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

function adverbial(rootId: string | null): string {
  return after(rootId === null ? null : form(roots, rootId, 'adv'));
}

// An attributive adjective follows its noun in French and agrees with it. The
// Latin line sets it in front of its noun, which is the one place where the
// two orders part, and the agreement is real on both sides.
function adjectival(rootId: string | null, headRoot: string): string {
  return after(rootId === null ? null : agreed(roots, rootId, 'adj', genderOf(roots, headRoot)));
}

// A clause joined by ET opens on « Et » in the gloss.
function lead(joined: boolean, opening: string): string {
  return joined ? `Et ${opening.charAt(0).toLowerCase()}${opening.slice(1)}` : opening;
}

function agentName(ref: GlossRef): string {
  return ref.kind === 'epithet' ? vocative(lookup(epithets, ref.id, 'epithet')) : noun(ref.id);
}

export const latinGlosses: LatinGlosses = {
  roots,
  powers,
  epithets,
  idioms,
  seals,
  depths,
  directions,

  ...genomeMethods({ idioms, seals, depths, directions }),

  protectionClause: (p: LatinProtection) =>
    `${lead(p.joined, 'Moi')}, ${theNoun(p.agentRoot)}, ` +
    `${speaker(form(roots, p.intentRoot, 'verb'))}${adverbial(p.adverbRoot)} contre ` +
    `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}.` +
    `${p.powerWord === null ? '' : ` ${exclaim(power(powers, p.powerWord).name)}`}`,

  // The future imperative lays a standing command, which French says with the
  // subjunctive of the wish, built on the participle the harm field declares.
  curseClause: (p: LatinCurse) =>
    `${lead(p.joined, 'Que')} ${theNoun(p.targetRoot)}` +
    `${adjectival(p.adjectiveRoot, p.targetRoot)} soit ` +
    `${agreed(roots, p.intentRoot, 'pp', genderOf(roots, p.targetRoot))}` +
    `${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: LatinInvocation) => {
    const head = p.agents[0];
    // A stacked agent hangs behind the one before it. An epithet keeps the
    // article its gloss carries, so the preposition contracts against the
    // text rather than against a gender.
    const chain = p.agents
      .slice(1)
      .map((ref) =>
        ref.kind === 'root'
          ? ` ${ofDefinite(noun(ref.id), genderOf(roots, ref.id))}`
          : ` ${ofPhrase(lookup(epithets, ref.id, 'epithet'))}`,
      )
      .join('');
    const spoken = p.eldritch
      ? capitalize(p.powerWord)
      : power(powers, p.powerWord).name;
    return (
      exclaim(
        `${lead(p.joined, 'Ô')} ${head === undefined ? '' : agentName(head)}${chain}, ` +
          `${form(roots, p.intentRoot, 'verb')}${adverbial(p.adverbRoot)}`,
      ) + ` ${exclaim(spoken)}`
    );
  },

  // The enclitic asks the question in the script, and French asks by
  // inverting: the subject stands first and a pronoun resumes it.
  divinationAsk: (p: LatinDivination) =>
    ask(
      `${lead(p.joined, capitalize(theNoun(p.agentRoot)))} ` +
        `${inverted(form(roots, p.intentRoot, 'verb'), genderOf(roots, p.agentRoot))}` +
        `${adverbial(p.adverbRoot)} ${theNoun(p.targetRoot)}` +
        `${adjectival(p.adjectiveRoot, p.targetRoot)}`,
    ),

  divinationSee: (p: LatinDivination) =>
    `${lead(p.joined, 'Moi')}, ${theNoun(p.agentRoot)}, ` +
    `${speaker(form(roots, p.intentRoot, 'verb'))}${adverbial(p.adverbRoot)} ` +
    `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}.`,

  chronomancyCross: (p: LatinChronomancyCross) =>
    exclaim(
      `${lead(p.joined, capitalize(lookup(directions, p.direction, 'direction')))}, ` +
        `${form(roots, p.intentRoot, 'verb')}${adverbial(p.adverbRoot)} ` +
        `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}`,
    ),

  // The French performative present already performs, but every school of this
  // pack speaks in it, so the deed is named as done by the saying.
  chronomancyBind: (p: LatinChronomancyBind) =>
    `${lead(p.joined, 'Par')} ces mots, ${speaker(form(roots, p.intentRoot, 'verb'))}` +
    `${adverbial(p.adverbRoot)} ${theNoun(p.targetRoot)}` +
    `${adjectival(p.adjectiveRoot, p.targetRoot)}.`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `Je suis venu ${toPhrase(theNoun(anchorRoot))}` +
    `${genitiveRoot === null ? '' : ` ${ofDefinite(noun(genitiveRoot), genderOf(roots, genitiveRoot))}`}.`,

  litanyTriple: (word, eldritch) =>
    `${eldritch ? capitalize(word) : power(powers, word).name}, prononcé trois fois.`,
  // The register speaks no shrinking word, so this one is never dread.
  litanyShrink: (word) => `${power(powers, word).name}, réduit à une seule lettre.`,

  tierOne: (word, eldritch) =>
    eldritch
      ? `${capitalize(word)}, ${lookup(epithets, word, 'epithet')}.`
      : power(powers, word).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    exclaim(`${capitalize(form(roots, intentRoot, 'verb'))} ${theNoun(targetRoot)}`),
};
