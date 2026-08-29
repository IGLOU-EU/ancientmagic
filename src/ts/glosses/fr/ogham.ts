// French glosses for the Ogham genome. The meanings are docs/genomes.md
// section 10 and the sense each coined root is built to, the wordings are
// French: nothing here is a calque of the English word order.
//
// Every noun declares its gender, every adjective and participle a clause can
// hang on a feminine head declares its feminine wording, and every verb
// wording is a first-group one, because one stored form has to serve the moods
// this genome draws: the first person of a Protection or a seeing clause, the
// third person of an interrogative inversion, the second person imperative of
// an Invocation, a crossing clause or tier 2, and the performative of a
// binding clause. The two summoning verbs the Invocation alone reaches are the
// stated exception, as the Latin pack already spends one.
//
// The vocative takes « Ô » and a bare noun, with no article and no capital, as
// the five older packs address a power.
//
// No clause here is ever told it stands second: a new rod opens a new sentence
// with no conjunction word, so this pack writes no « Et » anywhere.

import { form, lookup, power } from '../table.js';
import type {
  OghamChronomancyBind,
  OghamChronomancyCross,
  OghamCurse,
  OghamDivination,
  OghamGlosses,
  OghamInvocation,
  OghamProtection,
  OghamNamedRepeat,
  OghamVox,
} from '../../languages/ogham-glosses.js';
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
  dit: { gloss: 'abriter', forms: { verb: 'abrite' } },
  anect: { gloss: 'protéger', forms: { verb: 'protège' } },
  dun: { gloss: 'fort', forms: { noun: 'fort' }, gender: 'm' },
  rat: { gloss: 'rempart', forms: { noun: 'rempart' }, gender: 'm' },
  scet: { gloss: 'bouclier', forms: { noun: 'bouclier' }, gender: 'm' },
  cur: { gloss: 'champion', forms: { noun: 'champion' }, gender: 'm' },
  les: { gloss: 'enclos', forms: { noun: 'enclos' }, gender: 'm' },
  imdit: { gloss: 'cuirasser', forms: { verb: 'cuirasse' } },
  nert: { gloss: 'force', forms: { noun: 'force' }, gender: 'f' },
  cing: { gloss: 'guerrier', forms: { noun: 'guerrier' }, gender: 'm' },
  // harm
  bris: { gloss: 'briser', forms: { verb: 'brise', pp: 'brisé' }, feminine: { pp: 'brisée' } },
  lot: {
    gloss: 'blessure',
    forms: { noun: 'blessure', verb: 'blesse', pp: 'blessé' },
    gender: 'f',
    feminine: { pp: 'blessée' },
  },
  gon: { gloss: 'percer', forms: { verb: 'perce', pp: 'percé' }, feminine: { pp: 'percée' } },
  mill: { gloss: 'gâter', forms: { verb: 'gâte', pp: 'gâté' }, feminine: { pp: 'gâtée' } },
  crad: {
    gloss: 'tourmenter',
    forms: { verb: 'tourmente', pp: 'tourmenté' },
    feminine: { pp: 'tourmentée' },
  },
  galar: { gloss: 'maladie', forms: { noun: 'maladie' }, gender: 'f' },
  serb: {
    gloss: 'amer',
    forms: { adj: 'amer', adv: 'amèrement' },
    feminine: { adj: 'amère' },
  },
  bron: { gloss: 'chagrin', forms: { noun: 'chagrin' }, gender: 'm' },
  coll: {
    gloss: 'destruction',
    forms: { noun: 'destruction', verb: 'dévaste', pp: 'dévasté' },
    gender: 'f',
    feminine: { pp: 'dévastée' },
  },
  amnas: { gloss: 'cruel', forms: { adj: 'cruel' }, feminine: { adj: 'cruelle' } },
  // summoning
  gar: { gloss: 'appeler', forms: { verb: 'appelle' } },
  garm: { gloss: 'sommation', forms: { noun: 'sommation' }, gender: 'f' },
  toc: { gloss: 'invoquer', forms: { verb: 'invoque' } },
  congar: { gloss: 'convoquer', forms: { verb: 'convoque' } },
  // Drawn as an imperative addressed to the invoked power and nowhere else,
  // which is what lets a wording stand outside the first group.
  tic: { gloss: 'venir', forms: { verb: 'viens' } },
  ling: { gloss: 'bondir jusqu’ici', forms: { verb: 'bondis ici' } },
  guid: { gloss: 'implorer', forms: { verb: 'implore' } },
  scol: { gloss: 'cri', forms: { noun: 'cri' }, gender: 'm' },
  gut: { gloss: 'voix', forms: { noun: 'voix' }, gender: 'f' },
  dord: { gloss: 'chant', forms: { noun: 'chant' }, gender: 'm' },
  // hidden
  cel: { gloss: 'cacher', forms: { verb: 'cache' } },
  run: { gloss: 'secret', forms: { noun: 'secret' }, gender: 'm' },
  ruin: { gloss: 'mystère', forms: { noun: 'mystère' }, gender: 'm' },
  clet: { gloss: 'couvert', forms: { noun: 'couvert', adv: 'furtivement' }, gender: 'm' },
  tost: { gloss: 'silence', forms: { noun: 'silence' }, gender: 'm' },
  sanas: { gloss: 'murmure', forms: { noun: 'murmure', verb: 'murmure' }, gender: 'm' },
  celt: { gloss: 'voile', forms: { noun: 'voile', verb: 'voile' }, gender: 'm' },
  elad: { gloss: 'art secret', forms: { noun: 'art secret' }, gender: 'm' },
  ogom: { gloss: 'écriture secrète', forms: { noun: 'écriture secrète' }, gender: 'f' },
  dall: { gloss: 'aveugler', forms: { verb: 'aveugle' } },
  // binding
  nasc: { gloss: 'lien', forms: { noun: 'lien', verb: 'lie' }, gender: 'm' },
  cengal: { gloss: 'entrave', forms: { noun: 'entrave', verb: 'entrave' }, gender: 'f' },
  cumrec: { gloss: 'carcan', forms: { noun: 'carcan' }, gender: 'm' },
  glas: { gloss: 'serrure', forms: { noun: 'serrure', verb: 'verrouille' }, gender: 'f' },
  drut: { gloss: 'barricader', forms: { verb: 'barricade' } },
  snim: { gloss: 'torsader', forms: { verb: 'torsade' } },
  tet: { gloss: 'corde', forms: { noun: 'corde' }, gender: 'f' },
  slabrad: { gloss: 'chaîne', forms: { noun: 'chaîne' }, gender: 'f' },
  gell: { gloss: 'gage', forms: { noun: 'gage' }, gender: 'm' },
  timarc: { gloss: 'enserrer', forms: { verb: 'enserre' } },
  // fire
  ten: { gloss: 'feu', forms: { noun: 'feu' }, gender: 'm' },
  adand: { gloss: 'allumer', forms: { verb: 'allume' } },
  brut: { gloss: 'brasier', forms: { noun: 'brasier' }, gender: 'm' },
  losc: { gloss: 'brûler', forms: { verb: 'brûle' } },
  gris: { gloss: 'braise', forms: { noun: 'braise' }, gender: 'f' },
  grisc: { gloss: 'étincelle', forms: { noun: 'étincelle' }, gender: 'f' },
  deg: { gloss: 'tison', forms: { noun: 'tison' }, gender: 'm' },
  gred: { gloss: 'calciner', forms: { verb: 'calcine' } },
  tellac: { gloss: 'foyer', forms: { noun: 'foyer' }, gender: 'm' },
  lasar: { gloss: 'flamme', forms: { noun: 'flamme', verb: 'embrase' }, gender: 'f' },
  // night
  adag: { gloss: 'nuit', forms: { noun: 'nuit' }, gender: 'f' },
  dorc: {
    gloss: 'obscur',
    forms: { adj: 'obscur', adv: 'obscurément' },
    feminine: { adj: 'obscure' },
  },
  dub: { gloss: 'noir', forms: { adj: 'noir' }, feminine: { adj: 'noire' } },
  esc: { gloss: 'lune', forms: { noun: 'lune' }, gender: 'f' },
  reann: { gloss: 'étoile', forms: { noun: 'étoile' }, gender: 'f' },
  temel: { gloss: 'obscurité', forms: { noun: 'obscurité' }, gender: 'f' },
  cotlud: { gloss: 'sommeil', forms: { noun: 'sommeil' }, gender: 'm' },
  brat: { gloss: 'manteau de nuit', forms: { noun: 'manteau de nuit' }, gender: 'm' },
  gorm: { gloss: 'trouble', forms: { adj: 'trouble' } },
  noct: { gloss: 'cœur de la nuit', forms: { noun: 'cœur de la nuit' }, gender: 'm' },
  // death
  bas: { gloss: 'mort', forms: { noun: 'mort' }, gender: 'f' },
  marb: { gloss: 'mort', forms: { adj: 'mort', verb: 'tue' }, feminine: { adj: 'morte' } },
  lig: { gloss: 'lit funéraire', forms: { noun: 'lit funéraire' }, gender: 'm' },
  vert: { gloss: 'tertre funéraire', forms: { noun: 'tertre funéraire' }, gender: 'm' },
  scal: { gloss: 'fantôme', forms: { noun: 'fantôme' }, gender: 'm' },
  crin: { gloss: 'faner', forms: { verb: 'fane' } },
  ec: { gloss: 'agonie', forms: { noun: 'agonie' }, gender: 'f' },
  adnac: { gloss: 'enterrer', forms: { verb: 'enterre' } },
  cnam: { gloss: 'os', forms: { noun: 'os' }, gender: 'm' },
  tam: { gloss: 'peste', forms: { noun: 'peste' }, gender: 'f' },
  // gates
  dor: { gloss: 'porte', forms: { noun: 'porte' }, gender: 'f' },
  bel: { gloss: 'bouche', forms: { noun: 'bouche' }, gender: 'f' },
  set: { gloss: 'sentier', forms: { noun: 'sentier' }, gender: 'm' },
  sid: { gloss: 'colline creuse', forms: { noun: 'colline creuse' }, gender: 'f' },
  comlad: { gloss: 'battant', forms: { noun: 'battant' }, gender: 'm' },
  tarsec: { gloss: 'seuil', forms: { noun: 'seuil' }, gender: 'm' },
  bern: { gloss: 'brèche', forms: { noun: 'brèche' }, gender: 'f' },
  oslac: { gloss: 'ouvrir', forms: { verb: 'ouvre' } },
  rod: { gloss: 'route', forms: { noun: 'route' }, gender: 'f' },
  glenn: { gloss: 'défilé', forms: { noun: 'défilé' }, gender: 'm' },
  // time
  tan: { gloss: 'temps', forms: { noun: 'temps' }, gender: 'm' },
  trat: { gloss: 'heure', forms: { noun: 'heure' }, gender: 'f' },
  matan: { gloss: 'matin', forms: { noun: 'matin' }, gender: 'm' },
  bledan: { gloss: 'année', forms: { noun: 'année' }, gender: 'f' },
  amser: { gloss: 'saison', forms: { noun: 'saison' }, gender: 'f' },
  gam: { gloss: 'hiver', forms: { noun: 'hiver' }, gender: 'm' },
  vescor: { gloss: 'soir', forms: { noun: 'soir' }, gender: 'm' },
  cet: { gloss: 'commencement', forms: { noun: 'commencement' }, gender: 'm' },
  vorcenn: { gloss: 'fin', forms: { noun: 'fin' }, gender: 'f' },
  sior: { gloss: 'âge sans fin', forms: { noun: 'âge sans fin' }, gender: 'm' },
  // sight
  derc: { gloss: 'œil', forms: { noun: 'œil', verb: 'contemple' }, gender: 'm' },
  sell: { gloss: 'scruter', forms: { verb: 'scrute' } },
  dec: { gloss: 'regarder', forms: { verb: 'regarde' } },
  adbat: { gloss: 'montrer', forms: { verb: 'montre' } },
  glan: {
    gloss: 'clair',
    forms: { adj: 'clair', adv: 'clairement' },
    feminine: { adj: 'claire' },
  },
  vat: { gloss: 'voyant', forms: { noun: 'voyant' }, gender: 'm' },
  druid: { gloss: 'druide', forms: { noun: 'druide' }, gender: 'm' },
  rosc: { gloss: 'vision', forms: { noun: 'vision' }, gender: 'f' },
  mes: { gloss: 'juger', forms: { verb: 'juge' } },
  amarc: { gloss: 'vue', forms: { noun: 'vue' }, gender: 'f' },
  // fate
  toic: { gloss: 'part assignée', forms: { noun: 'part assignée' }, gender: 'f' },
  dan: { gloss: 'destin', forms: { noun: 'destin' }, gender: 'm' },
  cinned: { gloss: 'décret', forms: { noun: 'décret' }, gender: 'm' },
  tocad: { gloss: 'fortune', forms: { noun: 'fortune' }, gender: 'f' },
  dal: { gloss: 'échéance fixée', forms: { noun: 'échéance fixée' }, gender: 'f' },
  derb: {
    gloss: 'certain',
    forms: { adj: 'certain', adv: 'assurément' },
    feminine: { adj: 'certaine' },
  },
  rand: { gloss: 'part', forms: { noun: 'part' }, gender: 'f' },
  crandcor: { gloss: 'sort jeté', forms: { noun: 'sort jeté' }, gender: 'm' },
  bret: { gloss: 'jugement', forms: { noun: 'jugement' }, gender: 'm' },
  ges: { gloss: 'interdit', forms: { noun: 'interdit' }, gender: 'm' },
  // signs
  sen: { gloss: 'présage', forms: { noun: 'présage' }, gender: 'm' },
  comard: { gloss: 'signe', forms: { noun: 'signe' }, gender: 'm' },
  man: { gloss: 'prodige', forms: { noun: 'prodige' }, gender: 'm' },
  bran: { gloss: 'corbeau', forms: { noun: 'corbeau' }, gender: 'm' },
  irar: { gloss: 'aigle', forms: { noun: 'aigle' }, gender: 'm' },
  en: { gloss: 'oiseau', forms: { noun: 'oiseau' }, gender: 'm' },
  vis: { gloss: 'prescience', forms: { noun: 'prescience' }, gender: 'f' },
  celman: { gloss: 'augure', forms: { noun: 'augure' }, gender: 'm' },
  tarngir: {
    gloss: 'prédire',
    forms: { noun: 'prophétie', verb: 'annonce' },
    gender: 'f',
  },
  brig: { gloss: 'sens', forms: { noun: 'sens' }, gender: 'm' },
  // course
  tect: { gloss: 'traverser', forms: { verb: 'traverse' } },
  cem: { gloss: 'pas', forms: { noun: 'pas' }, gender: 'm' },
  cor: { gloss: 'tournant', forms: { noun: 'tournant', verb: 'ramène' }, gender: 'm' },
  brost: { gloss: 'presser', forms: { verb: 'presse' } },
  cosc: { gloss: 'endiguer', forms: { verb: 'endigue' } },
  mall: {
    gloss: 'lent',
    forms: { adj: 'lent', verb: 'retarde' },
    feminine: { adj: 'lente' },
  },
  grib: { gloss: 'rapide', forms: { adj: 'rapide', adv: 'rapidement' } },
  gen: { gloss: 'renouveler', forms: { verb: 'renouvelle' } },
  rit: { gloss: 'course', forms: { noun: 'course' }, gender: 'f' },
  lorg: { gloss: 'trace', forms: { noun: 'trace' }, gender: 'f' },
};

// The attested names keep their own tongue, in the French orthography the
// scholarship of each name settled on, and the French frames them.
const powers: NamedPowerTable = {
  lugus: {
    name: 'Lugus',
    gloss: 'Lugus, l’habile en tous arts, dont les pierres gravent déjà le nom.',
  },
  dovvinias: {
    name: 'Dovvinias',
    gloss: 'Dovvinias, l’aïeule divine gravée en ogham sur les pierres des siens.',
  },
  lugudeccas: {
    name: 'Lugudeccas',
    gloss: 'Lugudeccas, le nom d’un homme qui porte le dieu en lui.',
  },
  ogmios: {
    name: 'Ogmios',
    gloss: 'Ogmios, le dieu de l’éloquence, qui se tient auprès d’Ogma.',
  },
  brigantia: {
    name: 'Brigantia',
    gloss: 'Brigantia, la déesse que les autels attestent et que la langue d’après nomme Brigit.',
  },
  dagodevos: {
    name: 'Dagodevos',
    gloss: 'Dagodevos, le dieu bon, le Dagda sous un nom plus ancien.',
  },
  manannan: {
    name: 'Manannán',
    gloss: 'Manannán de la mer, maître des brumes et de l’île où le temps va autrement.',
  },
  danu: { name: 'Danu', gloss: 'Danu, la mère dont les Túatha Dé Danann tirent leur nom.' },
  morrigan: {
    name: 'Morrigan',
    gloss: 'Morrigan, la grande reine, corneille de bataille et prophétesse.',
  },
  donn: { name: 'Donn', gloss: 'Donn, le sombre, dans la maison de qui les morts se rassemblent.' },
};

// Each epithet keeps the article a vocative drops.
const epithets: GlossTable = {
  pethagg: 'la bouche sous la marée',
  prusc: 'le rampant le long du fût',
  moppad: 'l’essaim sous le sable',
  dolp: 'la faim sous la vague',
  prugg: 'l’œil sous la quille',
  hnapp: 'le souffle venu de sous le seuil',
  scradap: 'l’encoche qui compte les vivants',
  golp: 'le gosier des abysses',
  thulp: 'le dormeur sous la neuvième vague',
  pemnag: 'la brume qui défait les noms',
};

// The kenning vox of spec 10.7: la ligne de glyphes ne porte qu’une lettre, et
// la glose dit le savoir que cette lettre traîne avec elle. Chaque formule
// nomme la lettre avant sa devinette, sans quoi un seul trait ne dirait rien.
const kennings: GlossTable = {
  beith: 'Beithe, la plus blanche des écorces',
  sail: 'Sail, le plus pâle des osiers',
  dair: 'Dair, la plus solide des portes',
  coll: 'Coll, le plus sage des bois',
  ruis: 'Ruis, la plus profonde des rougeurs',
};

const idioms: GlossTable = {
  OO1: 'Le bouleau taillé sept fois, un avertissement qui garde.',
  OO2: exclaim('Ton fidèle appelle'),
  OO3_SHORT: exclaim('L’aicme du bouleau'),
  OO3_FULL: exclaim('Les quatre aicmí, récitées en entier'),
  OO4: exclaim('Le nom du maudit'),
  OO5: 'Quatre baguettes d’if sont taillées.',
  OO6: exclaim('Ô porte de la colline creuse'),
  OC1: 'Ici cela tient.',
  OC2: 'Sain et sauf.',
  OC3: 'L’ogham d’Ogma.',
  OC4: 'C’est certain.',
  ELDRITCH_OPEN_SHORT: exclaim('Les voyelles, récitées contre leur ordre'),
  ELDRITCH_OPEN_FULL: exclaim('Les quatre aicmí, récitées contre leur ordre'),
  ELDRITCH_CLOSE: 'Ruine dans le noir.',
};

// Le sceau écrit un ordre au graveur : snad dit de tailler, le mot de compte
// dit combien de fois.
const seals: GlossTable = {
  3: 'Taille-le trois fois.',
  4: 'Taille-le quatre fois.',
  5: 'Taille-le cinq fois.',
  7: 'Taille-le sept fois.',
  9: 'Taille-le neuf fois.',
  27: 'Taille-le vingt-sept fois.',
};

// La traversée est ici une navigation, donc la profondeur se compte en vagues,
// et la neuvième est celle où commence l’autre monde.
const depths: GlossTable = {
  3: 'Trois vagues de profondeur.',
  4: 'Quatre vagues de profondeur.',
  5: 'Cinq vagues de profondeur.',
  7: 'Sept vagues de profondeur.',
  9: 'Neuf vagues de profondeur.',
  27: 'Vingt-sept vagues de profondeur.',
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

// L’épithète suit son nom en français comme en ogham, et s’accorde avec lui :
// pour une fois les deux lignes rangent leurs mots dans le même ordre.
function adjectival(rootId: string | null, headRoot: string): string {
  return after(rootId === null ? null : agreed(roots, rootId, 'adj', genderOf(roots, headRoot)));
}

function agentName(ref: GlossRef): string {
  return ref.kind === 'epithet' ? vocative(lookup(epithets, ref.id, 'epithet')) : noun(ref.id);
}

function voxName(vox: OghamVox): string {
  if (vox.kind === 'power') return power(powers, vox.id).name;
  if (vox.kind === 'kenning') return lookup(kennings, vox.id, 'kenning');
  return capitalize(vox.id);
}

// The birch warning has no name of its own, so it never reaches here: it is an
// idiom, and litanyShrink answers for it before asking.
function repeatName(word: OghamNamedRepeat): string {
  return word.kind === 'power' ? power(powers, word.id).name : capitalize(word.id);
}

export const oghamGlosses: OghamGlosses = {
  roots,
  powers,
  epithets,
  kennings,
  idioms,
  seals,
  depths,
  directions,

  ...genomeMethods({ idioms, seals, depths, directions }),

  protectionClause: (p: OghamProtection) =>
    `Moi, ${theNoun(p.agentRoot)}, ${speaker(form(roots, p.intentRoot, 'verb'))}` +
    `${adverbial(p.adverbRoot)} contre ${theNoun(p.targetRoot)}` +
    `${adjectival(p.adjectiveRoot, p.targetRoot)}.` +
    `${p.powerWord === null ? '' : ` ${exclaim(voxName(p.powerWord))}`}`,

  // Le jussif pose un ordre adressé à personne, que le français dit au
  // subjonctif du souhait, bâti sur le participe que le champ du mal déclare.
  curseClause: (p: OghamCurse) =>
    `Que ${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)} soit ` +
    `${agreed(roots, p.intentRoot, 'pp', genderOf(roots, p.targetRoot))}` +
    `${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: OghamInvocation) => {
    const head = p.agents[0];
    // Un agent empilé se suspend derrière celui d’avant. Une épithète garde
    // l’article de sa glose, donc la préposition se contracte sur le texte et
    // non sur un genre.
    const chain = p.agents
      .slice(1)
      .map((ref) =>
        ref.kind === 'root'
          ? ` ${ofDefinite(noun(ref.id), genderOf(roots, ref.id))}`
          : ` ${ofPhrase(lookup(epithets, ref.id, 'epithet'))}`,
      )
      .join('');
    return (
      exclaim(
        `Ô ${head === undefined ? '' : agentName(head)}${chain}, ` +
          `${form(roots, p.intentRoot, 'verb')}${adverbial(p.adverbRoot)}`,
      ) + ` ${exclaim(voxName(p.powerWord))}`
    );
  },

  // La particule in pose la question dans la ligne gravée, et le français
  // interroge par inversion : le sujet d’abord, un pronom qui le reprend.
  divinationAsk: (p: OghamDivination) =>
    ask(
      `${capitalize(theNoun(p.agentRoot))} ` +
        `${inverted(form(roots, p.intentRoot, 'verb'), genderOf(roots, p.agentRoot))}` +
        `${adverbial(p.adverbRoot)} ${theNoun(p.targetRoot)}` +
        `${adjectival(p.adjectiveRoot, p.targetRoot)}`,
    ),

  divinationSee: (p: OghamDivination) =>
    `Moi, ${theNoun(p.agentRoot)}, ${speaker(form(roots, p.intentRoot, 'verb'))}` +
    `${adverbial(p.adverbRoot)} ${theNoun(p.targetRoot)}` +
    `${adjectival(p.adjectiveRoot, p.targetRoot)}.`,

  chronomancyCross: (p: OghamChronomancyCross) =>
    exclaim(
      `${capitalize(lookup(directions, p.direction, 'direction'))}, ` +
        `${form(roots, p.intentRoot, 'verb')}${adverbial(p.adverbRoot)} ` +
        `${theNoun(p.targetRoot)}${adjectival(p.adjectiveRoot, p.targetRoot)}`,
    ),

  chronomancyBind: (p: OghamChronomancyBind) =>
    `Par ces mots, ${speaker(form(roots, p.intentRoot, 'verb'))}` +
    `${adverbial(p.adverbRoot)} ${theNoun(p.targetRoot)}` +
    `${adjectival(p.adjectiveRoot, p.targetRoot)}.`,

  // L’ancre garde son verbe à la fin, comme l’école le déclare : même la glose
  // de ce génome pose l’acte en dernier.
  returnAnchor: (anchorRoot, genitiveRoot) =>
    `${capitalize(toPhrase(theNoun(anchorRoot)))}` +
    `${genitiveRoot === null ? '' : ` ${ofDefinite(noun(genitiveRoot), genderOf(roots, genitiveRoot))}`}` +
    `, je suis venu.`,

  litanyTriple: (word) => `${repeatName(word)}, prononcé trois fois.`,

  // Les quatre écoles claires réduisent un compte et non un nom : sept traits
  // de bouleau qui en perdent un à chaque pas. Une mention autonymique reste
  // au masculin, le mot étant nommé plutôt que la chose.
  litanyShrink: (word) =>
    word.kind === 'birch'
      ? 'L’avertissement du bouleau, taillé trait après trait.'
      : `${repeatName(word)}, réduit lettre après lettre.`,

  tierOne: (word) =>
    word.kind === 'epithet'
      ? `${capitalize(word.id)}, ${lookup(epithets, word.id, 'epithet')}.`
      : power(powers, word.id).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    exclaim(`${capitalize(form(roots, intentRoot, 'verb'))} ${theNoun(targetRoot)}`),
};
