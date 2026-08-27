// English glosses for the Greek genome. Root wordings, vox glosses and idiom
// glosses are docs/genomes.md section 8, verbatim. The clause methods are the
// English gloss grammar: another language rewrites them and touches nothing
// else.
//
// A vox magica carries a name and a gloss: the gloss line spells it the way
// English spells it (Iao, Abrasax), never in the genome's own romanization,
// which exists to be mapped to letters and not to be read aloud in a sentence.

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
import { after, before, capitalize, genomeMethods, vocative } from './text.js';

const roots: RootGlossTable = {
  // warding
  phulak: { gloss: 'guard', forms: { noun: 'guard', verb: 'guard' } },
  alek: { gloss: 'ward off', forms: { verb: 'ward off' } },
  skep: { gloss: 'shelter', forms: { noun: 'shelter', verb: 'shelter' } },
  teikh: { gloss: 'wall', forms: { noun: 'wall' } },
  thoorak: { gloss: 'breastplate', forms: { noun: 'breastplate' } },
  erk: { gloss: 'barrier', forms: { noun: 'barrier' } },
  sooteer: { gloss: 'savior', forms: { noun: 'savior' } },
  amun: { gloss: 'defend', forms: { verb: 'defend' } },
  steph: { gloss: 'crown', forms: { noun: 'crown', verb: 'crown' } },
  alk: { gloss: 'defense', forms: { noun: 'defense' } },
  // harm
  blab: { gloss: 'harm', forms: { noun: 'harm', verb: 'harm', pp: 'harmed' } },
  pleeg: { gloss: 'blow', forms: { noun: 'blow', verb: 'strike', pp: 'struck' } },
  nos: { gloss: 'sickness', forms: { noun: 'sickness' } },
  alg: { gloss: 'pain', forms: { noun: 'pain' } },
  phthor: { gloss: 'ruin', forms: { noun: 'ruin', verb: 'ruin', pp: 'ruined' } },
  traumat: { gloss: 'wound', forms: { noun: 'wound', verb: 'wound', pp: 'wounded' } },
  lup: { gloss: 'grief', forms: { noun: 'grief', verb: 'grieve', pp: 'grieved' } },
  olethr: { gloss: 'destruction', forms: { noun: 'destruction' } },
  mastig: { gloss: 'scourge', forms: { noun: 'scourge', verb: 'scourge', pp: 'scourged' } },
  pikr: { gloss: 'bitter', forms: { adj: 'bitter', adv: 'bitterly' } },
  // summoning
  kal: { gloss: 'call', forms: { noun: 'call', verb: 'call' } },
  kleez: { gloss: 'name aloud', forms: { verb: 'name aloud' } },
  kraug: { gloss: 'shout', forms: { noun: 'shout', verb: 'shout' } },
  elth: { gloss: 'come', forms: { verb: 'come' } },
  ik: { gloss: 'arrive', forms: { verb: 'arrive' } },
  zeet: { gloss: 'seek', forms: { verb: 'seek' } },
  eukh: { gloss: 'prayer', forms: { noun: 'prayer', verb: 'pray' } },
  phoon: { gloss: 'voice', forms: { noun: 'voice' } },
  orm: { gloss: 'onrush', forms: { noun: 'onrush', verb: 'urge' } },
  aggel: { gloss: 'messenger', forms: { noun: 'messenger', verb: 'announce' } },
  // hidden
  krupt: { gloss: 'hide', forms: { verb: 'hide' } },
  lathr: { gloss: 'secretly', forms: { adv: 'secretly' } },
  musteer: { gloss: 'mystery', forms: { noun: 'mystery' } },
  aporreet: { gloss: 'forbidden thing', forms: { noun: 'forbidden thing' } },
  kruph: { gloss: 'concealment', forms: { noun: 'concealment', adv: 'in secret' } },
  kalupt: { gloss: 'veil', forms: { noun: 'veil', verb: 'veil' } },
  sioop: { gloss: 'silence', forms: { noun: 'silence', verb: 'hush' } },
  ainigm: { gloss: 'riddle', forms: { noun: 'riddle' } },
  buth: { gloss: 'deep', forms: { noun: 'deep' } },
  amaur: { gloss: 'dim', forms: { verb: 'dim' } },
  // binding
  desm: { gloss: 'bond', forms: { noun: 'bond', verb: 'bind' } },
  sphrag: { gloss: 'seal', forms: { noun: 'seal', verb: 'seal' } },
  plek: { gloss: 'plait', forms: { verb: 'plait' } },
  zug: { gloss: 'yoke', forms: { noun: 'yoke', verb: 'yoke' } },
  alus: { gloss: 'chain', forms: { noun: 'chain' } },
  sphigg: { gloss: 'bind tight', forms: { verb: 'bind tight' } },
  ped: { gloss: 'fetter', forms: { noun: 'fetter', verb: 'fetter' } },
  katokh: { gloss: 'holding spell', forms: { noun: 'holding spell', verb: 'hold down' } },
  kleithr: { gloss: 'bolt', forms: { noun: 'bolt', verb: 'bolt' } },
  sunekh: { gloss: 'hold together', forms: { verb: 'hold together' } },
  // fire
  pur: { gloss: 'fire', forms: { noun: 'fire' } },
  phlog: { gloss: 'flame', forms: { noun: 'flame', verb: 'blaze' } },
  kaus: { gloss: 'burn up', forms: { verb: 'burn up' } },
  anthrak: { gloss: 'coal', forms: { noun: 'coal' } },
  lamp: { gloss: 'lamp', forms: { noun: 'lamp', verb: 'shine' } },
  aithal: { gloss: 'smoke', forms: { noun: 'smoke' } },
  phleg: { gloss: 'burn', forms: { verb: 'burn' } },
  therm: { gloss: 'heat', forms: { noun: 'heat' } },
  spintheer: { gloss: 'spark', forms: { noun: 'spark' } },
  keraun: {
    gloss: 'thunderbolt',
    forms: { noun: 'thunderbolt', verb: 'strike with lightning' },
  },
  // night
  nukt: { gloss: 'night', forms: { noun: 'night' } },
  skot: { gloss: 'darkness', forms: { noun: 'darkness', adj: 'dark', adv: 'darkly' } },
  seleen: { gloss: 'moon', forms: { noun: 'moon' } },
  zoph: { gloss: 'gloom', forms: { noun: 'gloom', adj: 'gloomy' } },
  oneir: { gloss: 'dream', forms: { noun: 'dream' } },
  melan: { gloss: 'black', forms: { adj: 'black' } },
  esper: { gloss: 'evening', forms: { noun: 'evening' } },
  kneph: { gloss: 'dusk', forms: { noun: 'dusk' } },
  astr: { gloss: 'star', forms: { noun: 'star' } },
  upn: { gloss: 'sleep', forms: { noun: 'sleep', verb: 'lull' } },
  // death
  thanat: { gloss: 'death', forms: { noun: 'death' } },
  nekr: { gloss: 'corpse', forms: { noun: 'corpse', adj: 'dead' } },
  taph: { gloss: 'tomb', forms: { noun: 'tomb', verb: 'bury' } },
  aid: { gloss: 'house of the dead', forms: { noun: 'house of the dead' } },
  phthin: { gloss: 'waste away', forms: { verb: 'waste' } },
  keer: { gloss: 'death-spirit', forms: { noun: 'death-spirit' } },
  psukh: { gloss: 'shade', forms: { noun: 'shade' } },
  sphag: { gloss: 'slaughter', forms: { noun: 'slaughter', verb: 'slaughter' } },
  tumb: { gloss: 'burial mound', forms: { noun: 'burial mound' } },
  leipsan: { gloss: 'remains', forms: { noun: 'remains' } },
  // gates
  pul: { gloss: 'gate', forms: { noun: 'gate' } },
  thur: { gloss: 'door', forms: { noun: 'door' } },
  od: { gloss: 'road', forms: { noun: 'road' } },
  por: { gloss: 'passage', forms: { noun: 'passage' } },
  katabas: { gloss: 'descent', forms: { noun: 'descent' } },
  stom: { gloss: 'mouth', forms: { noun: 'mouth' } },
  khasm: { gloss: 'chasm', forms: { noun: 'chasm' } },
  gephur: { gloss: 'bridge', forms: { noun: 'bridge' } },
  oud: { gloss: 'threshold', forms: { noun: 'threshold' } },
  anoig: { gloss: 'open', forms: { verb: 'open' } },
  // time
  khron: { gloss: 'time', forms: { noun: 'time' } },
  oor: { gloss: 'hour', forms: { noun: 'hour' } },
  aioon: { gloss: 'age', forms: { noun: 'age' } },
  et: { gloss: 'year', forms: { noun: 'year' } },
  eemer: { gloss: 'day', forms: { noun: 'day' } },
  kair: { gloss: 'due moment', forms: { noun: 'due moment' } },
  arkh: { gloss: 'beginning', forms: { noun: 'beginning' } },
  tel: { gloss: 'end', forms: { noun: 'end' } },
  meen: { gloss: 'month', forms: { noun: 'month' } },
  eeoos: { gloss: 'dawn', forms: { noun: 'dawn' } },
  // sight
  or: { gloss: 'see', forms: { verb: 'see' } },
  blep: { gloss: 'behold', forms: { verb: 'behold' } },
  opt: { gloss: 'eye', forms: { noun: 'eye' } },
  skop: { gloss: 'watcher', forms: { noun: 'watcher', verb: 'scan' } },
  mant: { gloss: 'seer', forms: { noun: 'seer' } },
  deik: { gloss: 'show', forms: { verb: 'show' } },
  phain: { gloss: 'reveal', forms: { verb: 'reveal' } },
  saph: { gloss: 'clear', forms: { adj: 'clear', adv: 'clearly' } },
  gnoos: { gloss: 'knowledge', forms: { noun: 'knowledge' } },
  propheet: { gloss: 'prophet', forms: { noun: 'prophet' } },
  // fate
  moir: { gloss: 'allotted fate', forms: { noun: 'allotted fate' } },
  eimarmen: { gloss: 'destiny', forms: { noun: 'destiny' } },
  anagk: { gloss: 'necessity', forms: { noun: 'necessity' } },
  kleer: { gloss: 'cast lot', forms: { noun: 'cast lot' } },
  tukh: { gloss: 'fortune', forms: { noun: 'fortune' } },
  aisim: { gloss: 'fated', forms: { adj: 'fated' } },
  nemes: { gloss: 'apportionment', forms: { noun: 'apportionment' } },
  asphal: { gloss: 'unfailing', forms: { adj: 'unfailing', adv: 'unfailingly' } },
  klooth: { gloss: 'spun thread', forms: { noun: 'spun thread', verb: 'spin' } },
  orism: { gloss: 'set bound', forms: { noun: 'set bound' } },
  // signs
  seem: { gloss: 'sign', forms: { noun: 'sign' } },
  terat: { gloss: 'portent', forms: { noun: 'portent' } },
  khreesm: { gloss: 'oracle-word', forms: { noun: 'oracle-word' } },
  sumbol: { gloss: 'token', forms: { noun: 'token' } },
  ornith: { gloss: 'bird of omen', forms: { noun: 'bird of omen' } },
  splagkhn: { gloss: 'entrails', forms: { noun: 'sign of the entrails' } },
  graph: { gloss: 'written mark', forms: { noun: 'written mark', verb: 'write down' } },
  pheem: { gloss: 'utterance', forms: { noun: 'utterance' } },
  kleedon: { gloss: 'chance word', forms: { noun: 'chance word' } },
  tekmeer: { gloss: 'proof', forms: { noun: 'proof' } },
  // course
  diabain: { gloss: 'cross', forms: { verb: 'cross' } },
  streph: { gloss: 'turning', forms: { noun: 'turning', verb: 'turn back' } },
  speud: { gloss: 'hasten', forms: { verb: 'hasten' } },
  brad: { gloss: 'slow', forms: { verb: 'slow', adj: 'slow' } },
  paus: { gloss: 'halt', forms: { verb: 'halt' } },
  air: { gloss: 'lift out', forms: { verb: 'lift out' } },
  drom: { gloss: 'course', forms: { noun: 'course' } },
  beem: { gloss: 'step', forms: { noun: 'step' } },
  takh: { gloss: 'swift', forms: { adj: 'swift', adv: 'swiftly' } },
  kain: { gloss: 'renew', forms: { verb: 'renew', adj: 'new' } },
};

// The voces magicae of spec 8.7. The name is how a sentence spells the word,
// the gloss is what tier 1 says when the formula is that word alone.
const powers: NamedPowerTable = {
  iaoo: { name: 'Iao', gloss: 'Iao, the great name.' },
  abrasaks: { name: 'Abrasax', gloss: 'Abrasax, whose letters count the year.' },
  sabaooth: { name: 'Sabaoth', gloss: 'Sabaoth, the name of hosts.' },
  adoonai: { name: 'Adonai', gloss: 'Adonai, named beside Iao.' },
  ablanathanalba: { name: 'Ablanathanalba', gloss: 'Ablanathanalba, the palindrome.' },
  semeseilam: { name: 'Semeseilam', gloss: 'Semeseilam, the vox of the amulets.' },
  akrammakhamarei: { name: 'Akrammachamarei', gloss: 'Akrammachamarei, the vox of the papyri.' },
  damnameneus: { name: 'Damnameneus', gloss: 'Damnameneus, the Ephesian word standing alone.' },
  ereskhigal: { name: 'Ereschigal', gloss: 'Ereschigal, called up from below.' },
  nebutosoualeeth: {
    name: 'Nebutosualeth',
    gloss: 'Nebutosualeth, named in the binding spells.',
  },
};

// Dread epithets of the Eldritch register (spec 8.10), each glossed with the
// article a vocative drops.
const epithets: GlossTable = {
  ksargooth: 'the shape at the door',
  thrugksooth: 'the throat of the deep',
  borgmooth: 'the gnawer beneath',
  psalkhooth: 'the whisper that unmakes',
  khthonksooth: 'the weight under the ground',
  murksathooth: 'the swarm without number',
  gorguthooth: 'the eye that does not close',
  sphigksooth: 'the coil that tightens',
  nuktrapsooth: 'the night that reaches',
  zophragksooth: 'the gloom that swallows',
};

const idioms: GlossTable = {
  GO1: 'Amulet.',
  GO2: 'I call upon you.',
  GO3_SHORT: 'The Ephesian words!',
  GO3_FULL: 'The six Ephesian words!',
  GO4: 'I adjure you.',
  GO5: 'Give me an oracle.',
  GO6: 'Aion of Aion!',
  GC1: 'Now, now, quickly, quickly.',
  GC2: 'Let it come to pass.',
  GC3: 'Amen.',
  GC4: 'So it stands.',
  ELDRITCH_OPEN_SHORT: 'The Ephesian words, spoken against their order!',
  ELDRITCH_OPEN_FULL: 'The six Ephesian words, spoken against their order!',
  ELDRITCH_CLOSE: 'Ruin forever.',
};

const seals: GlossTable = {
  3: 'Said three times.',
  7: 'Said seven times.',
  9: 'Said nine times.',
  12: 'Said twelve times.',
  99: 'Said ninety-nine times.',
};

// The same counts read as how far a crossing went (spec 1.6), worded for all
// five although Chronomancy reaches only two of them.
const depths: GlossTable = {
  3: 'Three hours deep.',
  7: 'Seven hours deep.',
  9: 'Nine hours deep.',
  12: 'Twelve hours deep.',
  99: 'Ninety-nine hours deep.',
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

// A clause joined by KAI opens on "And" in the gloss (spec 8.11), and what
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
    `${lead(p.joined, 'I')}, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} against the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.` +
    `${p.powerWord === null ? '' : ` ${power(powers, p.powerWord).name}!`}`,

  curseClause: (p: GreekCurse) =>
    `${lead(p.joined, 'May')} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)} be ` +
    `${form(roots, p.intentRoot, 'pp')}${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: GreekInvocation) => {
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

  divinationAsk: (p: GreekDivination) =>
    `${lead(p.joined, 'Does')} the ${noun(p.agentRoot)} ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}?`,

  divinationSee: (p: GreekDivination) =>
    `${lead(p.joined, 'I')}, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.`,

  chronomancyCross: (p: GreekChronomancyCross) =>
    `${lead(p.joined, capitalize(form(roots, p.intentRoot, 'verb')))} ` +
    `${lookup(directions, p.direction, 'direction')}${adverbial(p.adverbRoot)} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}!`,

  // English has no performative verb form and marks the mood with an adverb.
  chronomancyBind: (p: GreekChronomancyBind) =>
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
