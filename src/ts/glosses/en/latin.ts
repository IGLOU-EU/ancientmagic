// English glosses for the Latin genome. Root wordings, power glosses and idiom
// glosses are docs/genomes.md section 9, verbatim. The clause methods are the
// English gloss grammar: another language rewrites them and touches nothing
// else.
//
// This pack answers to a reader who can read the glyph line, so every wording
// below is the dictionary sense of a real Latin word and the sentence has to
// agree with the letters above it. Where the other packs word a fiction, this
// one words what is written.

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
import { after, before, capitalize, genomeMethods, vocative } from './text.js';

const roots: RootGlossTable = {
  // warding
  serv: { gloss: 'guard', forms: { verb: 'guard' } },
  tutel: { gloss: 'guardian', forms: { noun: 'guardian' } },
  geni: { gloss: 'guardian spirit', forms: { noun: 'guardian spirit' } },
  mur: { gloss: 'wall', forms: { noun: 'wall' } },
  clipe: { gloss: 'shield', forms: { noun: 'shield' } },
  vall: { gloss: 'palisade', forms: { noun: 'palisade' } },
  praesidi: { gloss: 'stronghold', forms: { noun: 'stronghold' } },
  firm: { gloss: 'make fast', forms: { verb: 'make fast' } },
  arm: { gloss: 'arm', forms: { verb: 'arm' } },
  obser: { gloss: 'bolt shut', forms: { verb: 'bolt shut' } },
  // harm
  vex: { gloss: 'torment', forms: { verb: 'torment', pp: 'tormented' } },
  damn: { gloss: 'condemn', forms: { verb: 'condemn', pp: 'condemned' } },
  vulner: { gloss: 'wound', forms: { verb: 'wound', pp: 'wounded' } },
  nec: { gloss: 'slay', forms: { verb: 'slay', pp: 'slain' } },
  flagell: { gloss: 'scourge', forms: { verb: 'scourge', pp: 'scourged' } },
  morb: { gloss: 'sickness', forms: { noun: 'sickness' } },
  ruin: { gloss: 'ruin', forms: { noun: 'ruin' } },
  nox: { gloss: 'harm', forms: { noun: 'harm' } },
  amar: { gloss: 'bitter', forms: { adj: 'bitter', adv: 'bitterly' } },
  dir: { gloss: 'dread', forms: { adj: 'dread' } },
  // summoning
  voc: { gloss: 'call', forms: { verb: 'call' } },
  evoc: { gloss: 'call forth', forms: { verb: 'call forth' } },
  clam: { gloss: 'proclaim', forms: { verb: 'proclaim' } },
  invit: { gloss: 'invite', forms: { verb: 'invite' } },
  rog: { gloss: 'entreat', forms: { verb: 'entreat' } },
  flagit: { gloss: 'demand', forms: { verb: 'demand' } },
  incant: { gloss: 'chant over', forms: { verb: 'chant over' } },
  nunti: { gloss: 'messenger', forms: { verb: 'announce' } },
  proper: { gloss: 'hasten near', forms: { verb: 'hasten near' } },
  advol: { gloss: 'fly hither', forms: { verb: 'fly hither' } },
  // hidden
  occult: { gloss: 'conceal', forms: { adv: 'secretly' } },
  vel: { gloss: 'veil', forms: { noun: 'veil' } },
  latebr: { gloss: 'hiding place', forms: { noun: 'hiding place' } },
  cavern: { gloss: 'hollow', forms: { noun: 'hollow' } },
  susurr: { gloss: 'whisper', forms: { noun: 'whisper' } },
  secret: { gloss: 'secret', forms: { noun: 'secret' } },
  arcan: { gloss: 'mystery', forms: { noun: 'mystery' } },
  silenti: { gloss: 'silence', forms: { noun: 'silence' } },
  profund: { gloss: 'the deep', forms: { noun: 'deep' } },
  // binding
  lig: { gloss: 'bind', forms: { verb: 'bind' } },
  oblig: { gloss: 'bind fast', forms: { verb: 'bind fast' } },
  nod: { gloss: 'knot', forms: { verb: 'knot' } },
  obsign: { gloss: 'seal', forms: { verb: 'seal' } },
  fren: { gloss: 'bridle', forms: { verb: 'curb' } },
  // fire
  flamm: { gloss: 'flame', forms: { noun: 'flame', verb: 'set ablaze', pp: 'set ablaze' } },
  crem: { gloss: 'burn up', forms: { verb: 'burn up', pp: 'burned up' } },
  ustul: { gloss: 'scorch', forms: { verb: 'scorch', pp: 'scorched' } },
  favill: { gloss: 'ember', forms: { noun: 'ember' } },
  scintill: { gloss: 'spark', forms: { noun: 'spark' } },
  prun: { gloss: 'live coal', forms: { noun: 'live coal' } },
  fum: { gloss: 'smoke', forms: { noun: 'smoke' } },
  lucern: { gloss: 'lamp', forms: { noun: 'lamp' } },
  bust: { gloss: 'pyre', forms: { noun: 'pyre' } },
  // night
  lun: { gloss: 'moon', forms: { noun: 'moon' } },
  stell: { gloss: 'star', forms: { noun: 'star' } },
  umbr: { gloss: 'shadow', forms: { noun: 'shadow' } },
  nebul: { gloss: 'mist', forms: { noun: 'mist' } },
  somn: { gloss: 'sleep', forms: { noun: 'sleep' } },
  crepuscul: { gloss: 'twilight', forms: { noun: 'twilight' } },
  brum: { gloss: 'midwinter night', forms: { noun: 'midwinter night' } },
  obscur: { gloss: 'dark', forms: { adj: 'dark', adv: 'darkly' } },
  furv: { gloss: 'black', forms: { adj: 'black' } },
  nocturn: { gloss: 'nocturnal', forms: { adj: 'nocturnal' } },
  // death
  let: { gloss: 'death', forms: { noun: 'death' } },
  sepulcr: { gloss: 'tomb', forms: { noun: 'tomb' } },
  larv: { gloss: 'ghost', forms: { noun: 'ghost' } },
  tumul: { gloss: 'burial mound', forms: { noun: 'burial mound' } },
  simulacr: { gloss: 'phantom', forms: { noun: 'phantom' } },
  urn: { gloss: 'urn', forms: { noun: 'funeral urn' } },
  defunct: { gloss: 'dead', forms: { adj: 'dead' } },
  funest: { gloss: 'deathly', forms: { adj: 'deathly' } },
  // gates
  port: { gloss: 'gate', forms: { noun: 'gate' } },
  ianu: { gloss: 'door', forms: { noun: 'door' } },
  osti: { gloss: 'doorway', forms: { noun: 'doorway' } },
  vi: { gloss: 'road', forms: { noun: 'road' } },
  semit: { gloss: 'path', forms: { noun: 'path' } },
  fenestr: { gloss: 'window', forms: { noun: 'window' } },
  claustr: { gloss: 'barred passage', forms: { noun: 'barred passage' } },
  vestibul: { gloss: 'forecourt', forms: { noun: 'forecourt' } },
  postic: { gloss: 'back door', forms: { noun: 'back door' } },
  // time
  hor: { gloss: 'hour', forms: { noun: 'hour' } },
  auror: { gloss: 'dawn', forms: { noun: 'dawn' } },
  ann: { gloss: 'year', forms: { noun: 'year' } },
  saecul: { gloss: 'age', forms: { noun: 'age' } },
  aev: { gloss: 'unending age', forms: { noun: 'unending age' } },
  moment: { gloss: 'moment', forms: { noun: 'moment' } },
  crastin: { gloss: 'morrow', forms: { noun: 'morrow' } },
  initi: { gloss: 'beginning', forms: { noun: 'beginning' } },
  termin: { gloss: 'end', forms: { noun: 'end' } },
  aetern: { gloss: 'eternity', forms: { noun: 'eternity' } },
  // sight
  spect: { gloss: 'watch', forms: { verb: 'watch' } },
  observ: { gloss: 'observe', forms: { verb: 'observe' } },
  monstr: { gloss: 'show', forms: { verb: 'show' } },
  revel: { gloss: 'unveil', forms: { verb: 'unveil' } },
  lustr: { gloss: 'survey', forms: { verb: 'survey' } },
  explor: { gloss: 'search out', forms: { verb: 'search out' } },
  divin: { gloss: 'diviner', forms: { noun: 'diviner', verb: 'foretell' } },
  sortileg: { gloss: 'lot-reader', forms: { noun: 'lot-reader' } },
  ocul: { gloss: 'eye', forms: { noun: 'eye' } },
  hariol: { gloss: 'soothsayer', forms: { noun: 'soothsayer' } },
  clar: { gloss: 'clear', forms: { adj: 'clear', adv: 'clearly' } },
  laev: { gloss: 'left-hand', forms: { adj: 'left-hand' } },
  faust: { gloss: 'auspicious', forms: { adj: 'auspicious', adv: 'auspiciously' } },
  // fate
  fat: { gloss: 'fate', forms: { noun: 'fate' } },
  fortun: { gloss: 'fortune', forms: { noun: 'fortune' } },
  fil: { gloss: 'thread', forms: { noun: 'spun thread' } },
  pens: { gloss: 'allotted portion', forms: { noun: 'allotted portion' } },
  decret: { gloss: 'decree', forms: { noun: 'decree' } },
  iudici: { gloss: 'judgment', forms: { noun: 'judgment' } },
  genitur: { gloss: 'birth-star', forms: { noun: 'birth-star' } },
  destin: { gloss: 'destined', forms: { adj: 'destined' } },
  cert: { gloss: 'certain', forms: { adj: 'certain' } },
  fatidic: { gloss: 'fate-speaking', forms: { adj: 'fate-speaking' } },
  // signs
  sign: { gloss: 'sign', forms: { noun: 'sign' } },
  portent: { gloss: 'portent', forms: { noun: 'portent' } },
  oracul: { gloss: 'oracle', forms: { noun: 'oracle' } },
  auguri: { gloss: 'augury', forms: { noun: 'augury' } },
  praesagi: { gloss: 'presage', forms: { noun: 'presage' } },
  respons: { gloss: 'answer', forms: { noun: 'answer' } },
  aquil: { gloss: 'eagle', forms: { noun: 'eagle' } },
  corv: { gloss: 'raven', forms: { noun: 'raven' } },
  fibr: { gloss: 'entrail-sign', forms: { noun: 'entrail-sign' } },
  fiss: { gloss: 'cleft', forms: { noun: 'cleft' } },
  hosti: { gloss: 'sacrificial victim', forms: { noun: 'sacrificial victim' } },
  astr: { gloss: 'star-sign', forms: { noun: 'star-sign' } },
  cael: { gloss: 'sky', forms: { noun: 'sky' } },
  // course
  super: { gloss: 'overpass', forms: { verb: 'overpass' } },
  revoc: { gloss: 'call back', forms: { verb: 'call back' } },
  festin: { gloss: 'hasten', forms: { verb: 'hasten' } },
  tard: { gloss: 'slow', forms: { verb: 'slow', adj: 'slow' } },
  retent: { gloss: 'hold back', forms: { verb: 'hold back' } },
  nov: { gloss: 'renew', forms: { verb: 'renew', adj: 'new' } },
  rapid: { gloss: 'swift', forms: { adj: 'swift', adv: 'swiftly' } },
  // beings
  div: { gloss: 'god', forms: { noun: 'god' } },
  domin: { gloss: 'lord', forms: { noun: 'lord' } },
  regin: { gloss: 'queen', forms: { noun: 'queen' } },
  patron: { gloss: 'protector', forms: { noun: 'protector' } },
  atav: { gloss: 'forefather', forms: { noun: 'forefather' } },
  anim: { gloss: 'soul', forms: { noun: 'soul' } },
  antistit: { gloss: 'priestess', forms: { noun: 'priestess' } },
  mag: { gloss: 'magician', forms: { noun: 'magician' } },
  famul: { gloss: 'servant', forms: { noun: 'servant' } },
  soci: { gloss: 'companion', forms: { noun: 'companion' } },
};

// The attested powers of spec 9.7. The name is how a sentence spells the word,
// the gloss is what tier 1 says when the formula is that word alone. The two
// chants carry a gloss they can never show, because tier 1 writes no separator
// and a chant needs one: the table stays whole rather than minimal.
const powers: NamedPowerTable = {
  abracadabra: {
    name: 'Abracadabra',
    gloss: 'Abracadabra, the word worn against the fever.',
  },
  motas: {
    name: 'Motas vaeta daries dardares astataries dissunapiter',
    gloss: 'Motas vaeta daries dardares astataries dissunapiter, the oldest Roman spell.',
  },
  huat: {
    name: 'Huat hauat huat ista pista sista dannabo dannaustra',
    gloss: 'Huat hauat huat ista pista sista dannabo dannaustra, the second chant of that page.',
  },
  fascinus: { name: 'Fascinus', gloss: 'Fascinus, the power that turns the envious eye.' },
  angitia: { name: 'Angitia', gloss: 'Angitia, who charms the serpents.' },
  carmenta: { name: 'Carmenta', gloss: 'Carmenta, whose name carries the chant.' },
  egeria: { name: 'Egeria', gloss: 'Egeria, the spring consulted by night.' },
  proserpina: { name: 'Proserpina', gloss: 'Proserpina, the queen below.' },
  dispater: { name: 'Dis Pater', gloss: 'Dis Pater, the lord of the dead.' },
};

// Dread epithets of the Eldritch register (spec 9.10), each glossed with the
// article a vocative drops.
const epithets: GlossTable = {
  xulgoth: 'the maw beneath the threshold',
  sthulvorn: 'the sprawl behind the wall',
  gnorvath: 'the hunger that learns',
  throxul: 'the wheel that grinds the stars',
  mroguth: 'the swarm without a master',
  gvortha: 'the door that breathes',
  sthanox: 'the eye beneath the year',
  thulcron: 'the sleeper under the ages',
  vrixoth: 'the whisper against the light',
  ulthrax: 'the night that counts the dead',
};

const idioms: GlossTable = {
  LO1: 'Amulet.',
  LO2: 'I pray and beseech you.',
  LO3_SHORT: 'The square!',
  LO3_FULL: 'The five words of the square!',
  LO4: 'I nail it down.',
  LO5: 'I draw the lot.',
  LO6: 'Father Janus!',
  LO7: 'I inspect the entrails.',
  LC1: 'Now, now, quickly, quickly.',
  LC2: 'So be it.',
  LC3: 'I have paid the vow.',
  LC4: 'So it is.',
  ELDRITCH_OPEN_SHORT: 'The square, read against its order!',
  ELDRITCH_OPEN_FULL: 'The five words of the square, read against their order!',
  ELDRITCH_CLOSE: 'Everlasting ruin.',
};

// The seal glosses the instruction it writes, not a count of what was said:
// DICITO is an order, and the numeral tells the sayer how often (spec 9.8).
const seals: GlossTable = {
  3: 'Say it three times.',
  7: 'Say it seven times.',
  9: 'Say it nine times.',
  12: 'Say it twelve times.',
  27: 'Say it twenty-seven times.',
};

// The same counts read as how far a crossing went (spec 1.6), worded for all
// five although Chronomancy reaches only two of them.
const depths: GlossTable = {
  3: 'Three hours deep.',
  7: 'Seven hours deep.',
  9: 'Nine hours deep.',
  12: 'Twelve hours deep.',
  27: 'Twenty-seven hours deep.',
};

const directions: GlossTable = {
  back: 'backward',
  forth: 'forward',
  again: 'again',
  still: 'still',
};

function noun(id: string): string {
  return form(roots, id, 'noun');
}

function adjectival(rootId: string | null): string {
  return before(rootId === null ? null : form(roots, rootId, 'adj'));
}

function adverbial(rootId: string | null): string {
  return after(rootId === null ? null : form(roots, rootId, 'adv'));
}

// A clause joined by ET opens on "And" in the gloss (spec 9.11), and what
// followed the full stop lowercases behind it. Two English words keep their
// capital in mid-sentence: the first person, and the vocative particle.
function lead(joined: boolean, opening: string): string {
  if (!joined) return opening;
  if (opening === 'I' || opening === 'O') return `And ${opening}`;
  return `And ${opening.charAt(0).toLowerCase()}${opening.slice(1)}`;
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
    `${lead(p.joined, 'I')}, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} against the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.` +
    `${p.powerWord === null ? '' : ` ${power(powers, p.powerWord).name}!`}`,

  // The future imperative is law pronounced, which English can only manage as
  // a wish, so the clause is built on the participle wordings of the harm
  // field while the glyph line keeps the active -ATO (spec 9.13).
  curseClause: (p: LatinCurse) =>
    `${lead(p.joined, 'May')} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)} be ` +
    `${form(roots, p.intentRoot, 'pp')}${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: LatinInvocation) => {
    const names = p.agents.map(agentName);
    const head = names[0] ?? '';
    const stacked = names.slice(1).map((name) => ` of the ${name}`).join('');
    const spoken = p.eldritch
      ? capitalize(p.powerWord)
      : power(powers, p.powerWord).name;
    return (
      `${lead(p.joined, 'O')} ${head}${stacked}, ${form(roots, p.intentRoot, 'verb')}` +
      `${adverbial(p.adverbRoot)}! ${spoken}!`
    );
  },

  divinationAsk: (p: LatinDivination) =>
    `${lead(p.joined, 'Does')} the ${noun(p.agentRoot)} ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}?`,

  divinationSee: (p: LatinDivination) =>
    `${lead(p.joined, 'I')}, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.`,

  chronomancyCross: (p: LatinChronomancyCross) =>
    `${lead(p.joined, capitalize(form(roots, p.intentRoot, 'verb')))} ` +
    `${lookup(directions, p.direction, 'direction')}${adverbial(p.adverbRoot)} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}!`,

  // English has no performative verb form and marks the mood with an adverb.
  chronomancyBind: (p: LatinChronomancyBind) =>
    `${lead(p.joined, 'I')} hereby ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `I have come to the ${noun(anchorRoot)}` +
    `${genitiveRoot === null ? '' : ` of the ${noun(genitiveRoot)}`}.`,

  litanyTriple: (word, eldritch) =>
    `${eldritch ? capitalize(word) : power(powers, word).name}, spoken three times.`,
  litanyShrink: (word, eldritch) =>
    `${eldritch ? capitalize(word) : power(powers, word).name}, shrinking to a single letter.`,

  tierOne: (word, eldritch) =>
    eldritch
      ? `${capitalize(word)}, ${lookup(epithets, word, 'epithet')}.`
      : power(powers, word).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    `${capitalize(form(roots, intentRoot, 'verb'))} the ${noun(targetRoot)}!`,
};
