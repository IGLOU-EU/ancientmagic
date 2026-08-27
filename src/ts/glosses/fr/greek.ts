// French glosses for the Greek genome. The meanings are docs/genomes.md
// section 8 and the English pack, the wordings are French: nothing here is a
// calque of the English word order.
//
// Every noun declares its gender, every adjective and participle a clause can
// hang on a feminine head declares its feminine wording, and every verb
// wording is a first-group one (or of the ouvrir family), because one stored
// form has to serve the four moods this genome draws: the first person of a
// Protection or a seeing clause, the third person of an interrogative
// inversion, the second person imperative of an Invocation or a crossing
// clause, and the performative of a binding clause.
//
// The vocative takes « Ô » and a bare noun, with no article and no capital,
// exactly as the three older packs address an epithet. French has no vocative
// case to echo, so the Greek -Ε ending stays a fact of the transliteration.

import { form, lookup, power } from '../table.js';
import type {
  GreekChronomancyBind,
  GreekChronomancyCross,
  GreekCurse,
  GreekDivination,
  GreekGlosses,
  GreekInvocation,
  GreekProtection,
} from '../../languages/greek-glosses.js';
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
  phulak: { gloss: 'garde', forms: { noun: 'gardien', verb: 'garde' }, gender: 'm' },
  alek: { gloss: 'repousser', forms: { verb: 'repousse' } },
  skep: { gloss: 'abri', forms: { noun: 'abri', verb: 'abrite' }, gender: 'm' },
  teikh: { gloss: 'muraille', forms: { noun: 'muraille' }, gender: 'f' },
  thoorak: { gloss: 'cuirasse', forms: { noun: 'cuirasse' }, gender: 'f' },
  erk: { gloss: 'barrière', forms: { noun: 'barrière' }, gender: 'f' },
  sooteer: { gloss: 'sauveur', forms: { noun: 'sauveur' }, gender: 'm' },
  amun: { gloss: 'défendre', forms: { verb: 'protège' } },
  steph: { gloss: 'couronne', forms: { noun: 'couronne', verb: 'couronne' }, gender: 'f' },
  alk: { gloss: 'défense', forms: { noun: 'défense' }, gender: 'f' },
  // harm
  blab: {
    gloss: 'dommage',
    forms: { noun: 'dommage', verb: 'endommage', pp: 'endommagé' },
    gender: 'm',
    feminine: { pp: 'endommagée' },
  },
  pleeg: {
    gloss: 'coup',
    forms: { noun: 'coup', verb: 'frappe', pp: 'frappé' },
    gender: 'm',
    feminine: { pp: 'frappée' },
  },
  nos: { gloss: 'maladie', forms: { noun: 'maladie' }, gender: 'f' },
  alg: { gloss: 'douleur', forms: { noun: 'douleur' }, gender: 'f' },
  phthor: {
    gloss: 'ruine',
    forms: { noun: 'ruine', verb: 'ruine', pp: 'ruiné' },
    gender: 'f',
    feminine: { pp: 'ruinée' },
  },
  traumat: {
    gloss: 'blessure',
    forms: { noun: 'blessure', verb: 'blesse', pp: 'blessé' },
    gender: 'f',
    feminine: { pp: 'blessée' },
  },
  lup: {
    gloss: 'chagrin',
    forms: { noun: 'chagrin', verb: 'afflige', pp: 'affligé' },
    gender: 'm',
    feminine: { pp: 'affligée' },
  },
  olethr: { gloss: 'destruction', forms: { noun: 'destruction' }, gender: 'f' },
  mastig: {
    gloss: 'fouet',
    forms: { noun: 'fouet', verb: 'fouette', pp: 'fouetté' },
    gender: 'm',
    feminine: { pp: 'fouettée' },
  },
  pikr: {
    gloss: 'amer',
    forms: { adj: 'amer', adv: 'amèrement' },
    feminine: { adj: 'amère' },
  },
  // summoning
  kal: { gloss: 'appel', forms: { noun: 'appel', verb: 'appelle' }, gender: 'm' },
  kleez: { gloss: 'nommer à voix haute', forms: { verb: 'nomme' } },
  kraug: { gloss: 'cri', forms: { noun: 'cri', verb: 'crie' }, gender: 'm' },
  // Drawn as an imperative addressed to the invoked power and nowhere else,
  // which is what lets an irregular verb stand here.
  elth: { gloss: 'venir', forms: { verb: 'viens' } },
  ik: { gloss: 'arriver', forms: { verb: 'arrive' } },
  zeet: { gloss: 'chercher', forms: { verb: 'cherche' } },
  eukh: { gloss: 'prière', forms: { noun: 'prière', verb: 'prie' }, gender: 'f' },
  phoon: { gloss: 'voix', forms: { noun: 'voix' }, gender: 'f' },
  orm: { gloss: 'élan', forms: { noun: 'élan', verb: 'pousse' }, gender: 'm' },
  aggel: { gloss: 'messager', forms: { noun: 'messager', verb: 'annonce' }, gender: 'm' },
  // hidden
  krupt: { gloss: 'cacher', forms: { verb: 'cache' } },
  lathr: { gloss: 'secrètement', forms: { adv: 'secrètement' } },
  musteer: { gloss: 'mystère', forms: { noun: 'mystère' }, gender: 'm' },
  aporreet: { gloss: 'chose interdite', forms: { noun: 'chose interdite' }, gender: 'f' },
  kruph: {
    gloss: 'dissimulation',
    forms: { noun: 'dissimulation', adv: 'en secret' },
    gender: 'f',
  },
  kalupt: { gloss: 'voile', forms: { noun: 'voile', verb: 'voile' }, gender: 'm' },
  sioop: { gloss: 'silence', forms: { noun: 'silence', verb: 'étouffe' }, gender: 'm' },
  ainigm: { gloss: 'énigme', forms: { noun: 'énigme' }, gender: 'f' },
  buth: { gloss: 'abîme', forms: { noun: 'abîme' }, gender: 'm' },
  amaur: { gloss: 'obscurcir', forms: { verb: 'estompe' } },
  // binding
  desm: { gloss: 'lien', forms: { noun: 'lien', verb: 'lie' }, gender: 'm' },
  sphrag: { gloss: 'sceau', forms: { noun: 'sceau', verb: 'scelle' }, gender: 'm' },
  plek: { gloss: 'tresser', forms: { verb: 'tresse' } },
  zug: { gloss: 'joug', forms: { noun: 'joug', verb: 'attelle' }, gender: 'm' },
  alus: { gloss: 'chaîne', forms: { noun: 'chaîne' }, gender: 'f' },
  sphigg: { gloss: 'serrer', forms: { verb: 'serre' } },
  ped: { gloss: 'entrave', forms: { noun: 'entrave', verb: 'entrave' }, gender: 'f' },
  katokh: {
    gloss: 'charme de contrainte',
    forms: { noun: 'charme de contrainte', verb: 'immobilise' },
    gender: 'm',
  },
  kleithr: { gloss: 'verrou', forms: { noun: 'verrou', verb: 'verrouille' }, gender: 'm' },
  sunekh: { gloss: 'tenir ensemble', forms: { verb: 'assemble' } },
  // fire
  pur: { gloss: 'feu', forms: { noun: 'feu' }, gender: 'm' },
  phlog: { gloss: 'flamme', forms: { noun: 'flamme', verb: 'embrase' }, gender: 'f' },
  kaus: { gloss: 'consumer', forms: { verb: 'consume' } },
  anthrak: { gloss: 'charbon', forms: { noun: 'charbon' }, gender: 'm' },
  lamp: { gloss: 'lampe', forms: { noun: 'lampe', verb: 'illumine' }, gender: 'f' },
  aithal: { gloss: 'fumée', forms: { noun: 'fumée' }, gender: 'f' },
  phleg: { gloss: 'brûler', forms: { verb: 'brûle' } },
  therm: { gloss: 'chaleur', forms: { noun: 'chaleur' }, gender: 'f' },
  spintheer: { gloss: 'étincelle', forms: { noun: 'étincelle' }, gender: 'f' },
  keraun: { gloss: 'foudre', forms: { noun: 'foudre', verb: 'foudroie' }, gender: 'f' },
  // night
  nukt: { gloss: 'nuit', forms: { noun: 'nuit' }, gender: 'f' },
  skot: {
    gloss: 'obscurité',
    forms: { noun: 'obscurité', adj: 'sombre', adv: 'sombrement' },
    gender: 'f',
  },
  seleen: { gloss: 'lune', forms: { noun: 'lune' }, gender: 'f' },
  zoph: {
    gloss: 'pénombre',
    forms: { noun: 'pénombre', adj: 'ténébreux' },
    gender: 'f',
    feminine: { adj: 'ténébreuse' },
  },
  oneir: { gloss: 'songe', forms: { noun: 'songe' }, gender: 'm' },
  melan: { gloss: 'noir', forms: { adj: 'noir' }, feminine: { adj: 'noire' } },
  esper: { gloss: 'soir', forms: { noun: 'soir' }, gender: 'm' },
  kneph: { gloss: 'crépuscule', forms: { noun: 'crépuscule' }, gender: 'm' },
  astr: { gloss: 'astre', forms: { noun: 'astre' }, gender: 'm' },
  upn: { gloss: 'sommeil', forms: { noun: 'sommeil', verb: 'berce' }, gender: 'm' },
  // death
  thanat: { gloss: 'mort', forms: { noun: 'mort' }, gender: 'f' },
  nekr: {
    gloss: 'cadavre',
    forms: { noun: 'cadavre', adj: 'mort' },
    gender: 'm',
    feminine: { adj: 'morte' },
  },
  taph: { gloss: 'tombeau', forms: { noun: 'tombeau', verb: 'enterre' }, gender: 'm' },
  aid: { gloss: 'demeure des morts', forms: { noun: 'demeure des morts' }, gender: 'f' },
  phthin: { gloss: 'dépérir', forms: { verb: 'décline' } },
  keer: { gloss: 'esprit de mort', forms: { noun: 'esprit de mort' }, gender: 'm' },
  psukh: { gloss: 'ombre', forms: { noun: 'ombre' }, gender: 'f' },
  sphag: { gloss: 'égorgement', forms: { noun: 'égorgement', verb: 'égorge' }, gender: 'm' },
  tumb: { gloss: 'tertre funéraire', forms: { noun: 'tertre funéraire' }, gender: 'm' },
  leipsan: { gloss: 'reste', forms: { noun: 'reste' }, gender: 'm' },
  // gates
  pul: { gloss: 'portail', forms: { noun: 'portail' }, gender: 'm' },
  thur: { gloss: 'porte', forms: { noun: 'porte' }, gender: 'f' },
  od: { gloss: 'route', forms: { noun: 'route' }, gender: 'f' },
  por: { gloss: 'passage', forms: { noun: 'passage' }, gender: 'm' },
  katabas: { gloss: 'descente', forms: { noun: 'descente' }, gender: 'f' },
  stom: { gloss: 'bouche', forms: { noun: 'bouche' }, gender: 'f' },
  khasm: { gloss: 'gouffre', forms: { noun: 'gouffre' }, gender: 'm' },
  gephur: { gloss: 'pont', forms: { noun: 'pont' }, gender: 'm' },
  oud: { gloss: 'seuil', forms: { noun: 'seuil' }, gender: 'm' },
  anoig: { gloss: 'ouvrir', forms: { verb: 'ouvre' } },
  // time
  khron: { gloss: 'temps', forms: { noun: 'temps' }, gender: 'm' },
  oor: { gloss: 'heure', forms: { noun: 'heure' }, gender: 'f' },
  aioon: { gloss: 'âge', forms: { noun: 'âge' }, gender: 'm' },
  et: { gloss: 'année', forms: { noun: 'année' }, gender: 'f' },
  eemer: { gloss: 'jour', forms: { noun: 'jour' }, gender: 'm' },
  kair: { gloss: 'moment opportun', forms: { noun: 'moment opportun' }, gender: 'm' },
  arkh: { gloss: 'commencement', forms: { noun: 'commencement' }, gender: 'm' },
  tel: { gloss: 'terme', forms: { noun: 'terme' }, gender: 'm' },
  meen: { gloss: 'mois', forms: { noun: 'mois' }, gender: 'm' },
  eeoos: { gloss: 'aube', forms: { noun: 'aube' }, gender: 'f' },
  // sight
  or: { gloss: 'voir', forms: { verb: 'contemple' } },
  blep: { gloss: 'regarder', forms: { verb: 'observe' } },
  opt: { gloss: 'œil', forms: { noun: 'œil' }, gender: 'm' },
  skop: { gloss: 'guetteur', forms: { noun: 'guetteur', verb: 'scrute' }, gender: 'm' },
  mant: { gloss: 'devin', forms: { noun: 'devin' }, gender: 'm' },
  deik: { gloss: 'montrer', forms: { verb: 'montre' } },
  phain: { gloss: 'révéler', forms: { verb: 'révèle' } },
  saph: {
    gloss: 'clair',
    forms: { adj: 'clair', adv: 'clairement' },
    feminine: { adj: 'claire' },
  },
  gnoos: { gloss: 'connaissance', forms: { noun: 'connaissance' }, gender: 'f' },
  propheet: { gloss: 'prophète', forms: { noun: 'prophète' }, gender: 'm' },
  // fate
  moir: { gloss: 'part assignée', forms: { noun: 'destin assigné' }, gender: 'm' },
  eimarmen: { gloss: 'destinée', forms: { noun: 'destinée' }, gender: 'f' },
  anagk: { gloss: 'nécessité', forms: { noun: 'nécessité' }, gender: 'f' },
  kleer: { gloss: 'sort tiré', forms: { noun: 'sort tiré' }, gender: 'm' },
  tukh: { gloss: 'fortune', forms: { noun: 'fortune' }, gender: 'f' },
  aisim: { gloss: 'promis par le sort', forms: { adj: 'promis' }, feminine: { adj: 'promise' } },
  nemes: { gloss: 'répartition', forms: { noun: 'répartition' }, gender: 'f' },
  asphal: { gloss: 'infaillible', forms: { adj: 'infaillible', adv: 'infailliblement' } },
  klooth: { gloss: 'fil filé', forms: { noun: 'fil filé', verb: 'file' }, gender: 'm' },
  orism: { gloss: 'borne fixée', forms: { noun: 'borne fixée' }, gender: 'f' },
  // signs
  seem: { gloss: 'signe', forms: { noun: 'signe' }, gender: 'm' },
  terat: { gloss: 'prodige', forms: { noun: 'prodige' }, gender: 'm' },
  khreesm: { gloss: 'parole d’oracle', forms: { noun: 'parole d’oracle' }, gender: 'f' },
  sumbol: { gloss: 'symbole', forms: { noun: 'symbole' }, gender: 'm' },
  ornith: { gloss: 'oiseau de présage', forms: { noun: 'oiseau de présage' }, gender: 'm' },
  splagkhn: {
    gloss: 'entrailles',
    forms: { noun: 'augure des entrailles' },
    gender: 'm',
  },
  graph: { gloss: 'marque écrite', forms: { noun: 'marque écrite', verb: 'consigne' }, gender: 'f' },
  pheem: { gloss: 'parole', forms: { noun: 'parole' }, gender: 'f' },
  kleedon: { gloss: 'mot entendu', forms: { noun: 'mot entendu' }, gender: 'm' },
  tekmeer: { gloss: 'preuve', forms: { noun: 'preuve' }, gender: 'f' },
  // course
  diabain: { gloss: 'traverser', forms: { verb: 'traverse' } },
  streph: { gloss: 'retournement', forms: { noun: 'retournement', verb: 'ramène' }, gender: 'm' },
  speud: { gloss: 'hâter', forms: { verb: 'presse' } },
  brad: { gloss: 'ralentir', forms: { verb: 'retarde', adj: 'lent' }, feminine: { adj: 'lente' } },
  paus: { gloss: 'arrêter', forms: { verb: 'arrête' } },
  air: { gloss: 'soulever hors', forms: { verb: 'soulève' } },
  drom: { gloss: 'course', forms: { noun: 'course' }, gender: 'f' },
  beem: { gloss: 'pas', forms: { noun: 'pas' }, gender: 'm' },
  takh: {
    gloss: 'rapide',
    forms: { adj: 'prompt', adv: 'promptement' },
    feminine: { adj: 'prompte' },
  },
  kain: {
    gloss: 'renouveler',
    forms: { verb: 'renouvelle', adj: 'neuf' },
    feminine: { adj: 'neuve' },
  },
};

// The voces magicae keep their own tongue, in the French orthography of the
// papyri's editors, and the French frames them.
const powers: NamedPowerTable = {
  iaoo: { name: 'Iaô', gloss: 'Iaô, le grand nom.' },
  abrasaks: { name: 'Abrasax', gloss: 'Abrasax, dont les lettres comptent l’année.' },
  sabaooth: { name: 'Sabaôth', gloss: 'Sabaôth, le nom des armées.' },
  adoonai: { name: 'Adônaï', gloss: 'Adônaï, nommé aux côtés de Iaô.' },
  ablanathanalba: { name: 'Ablanathanalba', gloss: 'Ablanathanalba, le palindrome.' },
  semeseilam: { name: 'Semeseilam', gloss: 'Semeseilam, la voix des amulettes.' },
  akrammakhamarei: {
    name: 'Akrammachamareï',
    gloss: 'Akrammachamareï, la voix des papyrus.',
  },
  damnameneus: {
    name: 'Damnameneus',
    gloss: 'Damnameneus, le mot d’Éphèse qui se tient seul.',
  },
  ereskhigal: { name: 'Ereschigal', gloss: 'Ereschigal, appelée d’en bas.' },
  nebutosoualeeth: {
    name: 'Nebutosoualêth',
    gloss: 'Nebutosoualêth, nommée dans les charmes de lien.',
  },
};

// Each epithet keeps the article a vocative drops.
const epithets: GlossTable = {
  ksargooth: 'la forme à la porte',
  thrugksooth: 'la gorge de l’abîme',
  borgmooth: 'le rongeur d’en dessous',
  psalkhooth: 'le murmure qui défait',
  khthonksooth: 'le poids sous la terre',
  murksathooth: 'la nuée sans nombre',
  gorguthooth: 'l’œil qui ne se ferme pas',
  sphigksooth: 'la spire qui resserre',
  nuktrapsooth: 'la nuit qui atteint',
  zophragksooth: 'la pénombre qui engloutit',
};

const idioms: GlossTable = {
  GO1: 'Amulette.',
  GO2: 'Je t’invoque.',
  GO3_SHORT: exclaim('Les mots d’Éphèse'),
  GO3_FULL: exclaim('Les six mots d’Éphèse'),
  GO4: 'Je t’adjure.',
  GO5: 'Rends-moi un oracle.',
  GO6: exclaim('Aiôn d’Aiôn'),
  GC1: 'Maintenant, maintenant, vite, vite.',
  GC2: 'Qu’il en soit ainsi.',
  GC3: 'Amen.',
  GC4: 'Ainsi cela demeure.',
  ELDRITCH_OPEN_SHORT: exclaim('Les mots d’Éphèse, prononcés contre leur ordre'),
  ELDRITCH_OPEN_FULL: exclaim('Les six mots d’Éphèse, prononcés contre leur ordre'),
  ELDRITCH_CLOSE: 'Ruine à jamais.',
};

// A seal agrees with « le sortilège », masculine singular.
const seals: GlossTable = {
  3: 'Dit trois fois.',
  7: 'Dit sept fois.',
  9: 'Dit neuf fois.',
  12: 'Dit douze fois.',
  99: 'Dit quatre-vingt-dix-neuf fois.',
};

const depths: GlossTable = {
  3: 'Trois heures de profondeur.',
  7: 'Sept heures de profondeur.',
  9: 'Neuf heures de profondeur.',
  12: 'Douze heures de profondeur.',
  99: 'Quatre-vingt-dix-neuf heures de profondeur.',
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

// An attributive adjective follows its noun in French and agrees with it.
function adjectival(rootId: string | null, headRoot: string): string {
  return after(rootId === null ? null : agreed(roots, rootId, 'adj', genderOf(roots, headRoot)));
}

// A clause joined by KAI opens on « Et » in the gloss.
function lead(joined: boolean, opening: string): string {
  return joined ? `Et ${opening.charAt(0).toLowerCase()}${opening.slice(1)}` : opening;
}

function agentName(ref: GlossRef): string {
  return ref.kind === 'epithet' ? vocative(lookup(epithets, ref.id, 'epithet')) : noun(ref.id);
}

export const greekGlosses: GreekGlosses = {
  roots,
  powers,
  epithets,
  idioms,
  seals,
  depths,
  directions,

  ...genomeMethods({ idioms, seals, depths, directions }),

  protectionClause: (p: GreekProtection) =>
    `${lead(p.joined, 'Moi')}, ${theNoun(p.agentRoot)}, ` +
    `${speaker(form(roots, p.intentRoot, 'verb'))}${adverbial(p.adverbRoot)} contre ` +
    `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}.` +
    `${p.powerWord === null ? '' : ` ${exclaim(power(powers, p.powerWord).name)}`}`,

  curseClause: (p: GreekCurse) =>
    `${lead(p.joined, 'Que')} ${theNoun(p.targetRoot)}` +
    `${adjectival(p.adjectiveRoot, p.targetRoot)} soit ` +
    `${agreed(roots, p.intentRoot, 'pp', genderOf(roots, p.targetRoot))}` +
    `${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: GreekInvocation) => {
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

  // The particle ARA opens the question in the script, and French asks by
  // inverting: the subject stands first and a pronoun resumes it.
  divinationAsk: (p: GreekDivination) =>
    ask(
      `${lead(p.joined, capitalize(theNoun(p.agentRoot)))} ` +
        `${inverted(form(roots, p.intentRoot, 'verb'), genderOf(roots, p.agentRoot))}` +
        `${adverbial(p.adverbRoot)} ${theNoun(p.targetRoot)}` +
        `${adjectival(p.adjectiveRoot, p.targetRoot)}`,
    ),

  divinationSee: (p: GreekDivination) =>
    `${lead(p.joined, 'Moi')}, ${theNoun(p.agentRoot)}, ` +
    `${speaker(form(roots, p.intentRoot, 'verb'))}${adverbial(p.adverbRoot)} ` +
    `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}.`,

  chronomancyCross: (p: GreekChronomancyCross) =>
    exclaim(
      `${lead(p.joined, capitalize(lookup(directions, p.direction, 'direction')))}, ` +
        `${form(roots, p.intentRoot, 'verb')}${adverbial(p.adverbRoot)} ` +
        `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}`,
    ),

  // The French performative present already performs, but every school of this
  // pack speaks in it, so the deed is named as done by the saying.
  chronomancyBind: (p: GreekChronomancyBind) =>
    `${lead(p.joined, 'Par')} ces mots, ${speaker(form(roots, p.intentRoot, 'verb'))}` +
    `${adverbial(p.adverbRoot)} ${theNoun(p.targetRoot)}` +
    `${adjectival(p.adjectiveRoot, p.targetRoot)}.`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `Je suis venu ${toPhrase(theNoun(anchorRoot))}` +
    `${genitiveRoot === null ? '' : ` ${ofDefinite(noun(genitiveRoot), genderOf(roots, genitiveRoot))}`}.`,

  litanyTriple: (word, eldritch) =>
    `${eldritch ? capitalize(word) : power(powers, word).name}, prononcé trois fois.`,
  litanyShrink: (word, eldritch) =>
    `${eldritch ? capitalize(word) : power(powers, word).name}, réduit à une seule lettre.`,

  tierOne: (word, eldritch) =>
    eldritch
      ? `${capitalize(word)}, ${lookup(epithets, word, 'epithet')}.`
      : power(powers, word).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    exclaim(`${capitalize(form(roots, intentRoot, 'verb'))} ${theNoun(targetRoot)}`),
};
