// English glosses for the Ogham genome. Root wordings, power glosses and idiom
// glosses are docs/genomes.md section 10, verbatim. The clause methods are the
// English gloss grammar: another language rewrites them and touches nothing
// else.
//
// Two things in this pack exist nowhere else. A new rod opens a new sentence
// with no conjunction word, so no clause here is ever told it stands second
// and nothing writes "And": the reader counts the deeds the way a hand counts
// the rods. And the kenning table glosses letters rather than words, which is
// the one place in this project where the attested layer is the gloss and the
// coined layer is the glyph.

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
import { after, before, capitalize, genomeMethods, vocative } from './text.js';

const roots: RootGlossTable = {
  // warding
  dit: { gloss: 'shield', forms: { verb: 'shield' } },
  anect: { gloss: 'protect', forms: { verb: 'protect' } },
  dun: { gloss: 'fort', forms: { noun: 'fort' } },
  rat: { gloss: 'rampart', forms: { noun: 'rampart' } },
  scet: { gloss: 'shield', forms: { noun: 'shield' } },
  cur: { gloss: 'champion', forms: { noun: 'champion' } },
  les: { gloss: 'enclosure', forms: { noun: 'enclosure' } },
  imdit: { gloss: 'gird', forms: { verb: 'gird' } },
  nert: { gloss: 'strength', forms: { noun: 'strength' } },
  cing: { gloss: 'warrior', forms: { noun: 'warrior' } },
  // harm
  bris: { gloss: 'break', forms: { verb: 'break', pp: 'broken' } },
  lot: { gloss: 'wound', forms: { noun: 'wound', verb: 'wound', pp: 'wounded' } },
  gon: { gloss: 'pierce', forms: { verb: 'pierce', pp: 'pierced' } },
  mill: { gloss: 'spoil', forms: { verb: 'spoil', pp: 'spoiled' } },
  crad: { gloss: 'torment', forms: { verb: 'torment', pp: 'tormented' } },
  galar: { gloss: 'sickness', forms: { noun: 'sickness' } },
  serb: { gloss: 'bitter', forms: { adj: 'bitter', adv: 'bitterly' } },
  bron: { gloss: 'grief', forms: { noun: 'grief' } },
  coll: {
    gloss: 'destruction',
    forms: { noun: 'destruction', verb: 'despoil', pp: 'despoiled' },
  },
  amnas: { gloss: 'cruel', forms: { adj: 'cruel' } },
  // summoning
  gar: { gloss: 'call', forms: { verb: 'call' } },
  toc: { gloss: 'summon', forms: { verb: 'summon' } },
  congar: { gloss: 'convoke', forms: { verb: 'convoke' } },
  tic: { gloss: 'come', forms: { verb: 'come' } },
  ling: { gloss: 'leap hither', forms: { verb: 'leap hither' } },
  guid: { gloss: 'beseech', forms: { verb: 'beseech' } },
  // hidden
  run: { gloss: 'secret', forms: { noun: 'secret' } },
  ruin: { gloss: 'mystery', forms: { noun: 'mystery' } },
  clet: { gloss: 'covert', forms: { noun: 'covert', adv: 'covertly' } },
  tost: { gloss: 'silence', forms: { noun: 'silence' } },
  sanas: { gloss: 'whisper', forms: { noun: 'whisper' } },
  celt: { gloss: 'veil', forms: { noun: 'veil' } },
  elad: { gloss: 'secret craft', forms: { noun: 'secret craft' } },
  ogom: { gloss: 'secret writing', forms: { noun: 'secret writing' } },
  // binding
  nasc: { gloss: 'bond', forms: { verb: 'bind' } },
  cengal: { gloss: 'fetter', forms: { verb: 'fetter' } },
  glas: { gloss: 'lock', forms: { verb: 'lock' } },
  drut: { gloss: 'shut', forms: { verb: 'shut fast' } },
  snim: { gloss: 'twist', forms: { verb: 'twist' } },
  timarc: { gloss: 'constrain', forms: { verb: 'constrain' } },
  // fire
  ten: { gloss: 'fire', forms: { noun: 'fire' } },
  adand: { gloss: 'kindle', forms: { verb: 'kindle', pp: 'kindled' } },
  brut: { gloss: 'blaze', forms: { noun: 'blaze' } },
  losc: { gloss: 'burn', forms: { verb: 'burn', pp: 'burned' } },
  gris: { gloss: 'embers', forms: { noun: 'embers' } },
  grisc: { gloss: 'spark', forms: { noun: 'spark' } },
  deg: { gloss: 'fire-brand', forms: { noun: 'fire-brand' } },
  gred: { gloss: 'scorch', forms: { verb: 'scorch', pp: 'scorched' } },
  tellac: { gloss: 'hearth', forms: { noun: 'hearth' } },
  lasar: { gloss: 'flame', forms: { noun: 'flame', verb: 'set ablaze', pp: 'set ablaze' } },
  // night
  adag: { gloss: 'night', forms: { noun: 'night' } },
  dorc: { gloss: 'dark', forms: { adj: 'dark', adv: 'darkly' } },
  dub: { gloss: 'black', forms: { adj: 'black' } },
  esc: { gloss: 'moon', forms: { noun: 'moon' } },
  reann: { gloss: 'star', forms: { noun: 'star' } },
  temel: { gloss: 'darkness', forms: { noun: 'darkness' } },
  cotlud: { gloss: 'sleep', forms: { noun: 'sleep' } },
  brat: { gloss: 'cloak', forms: { noun: 'cloak of night' } },
  gorm: { gloss: 'murky', forms: { adj: 'murky' } },
  noct: { gloss: 'dead of night', forms: { noun: 'dead of night' } },
  // death
  bas: { gloss: 'death', forms: { noun: 'death' } },
  marb: { gloss: 'dead', forms: { adj: 'dead' } },
  lig: { gloss: 'grave-bed', forms: { noun: 'grave-bed' } },
  vert: { gloss: 'grave-mound', forms: { noun: 'grave-mound' } },
  scal: { gloss: 'phantom', forms: { noun: 'phantom' } },
  ec: { gloss: 'dying', forms: { noun: 'dying' } },
  cnam: { gloss: 'bone', forms: { noun: 'bone' } },
  tam: { gloss: 'plague', forms: { noun: 'plague' } },
  // gates
  dor: { gloss: 'door', forms: { noun: 'door' } },
  bel: { gloss: 'mouth', forms: { noun: 'mouth' } },
  set: { gloss: 'path', forms: { noun: 'path' } },
  sid: { gloss: 'hollow hill', forms: { noun: 'hollow hill' } },
  comlad: { gloss: 'door-leaf', forms: { noun: 'door-leaf' } },
  tarsec: { gloss: 'threshold', forms: { noun: 'threshold' } },
  bern: { gloss: 'breach', forms: { noun: 'breach' } },
  rod: { gloss: 'road', forms: { noun: 'road' } },
  glenn: { gloss: 'defile', forms: { noun: 'defile' } },
  // time
  tan: { gloss: 'time', forms: { noun: 'time' } },
  trat: { gloss: 'hour', forms: { noun: 'hour' } },
  matan: { gloss: 'morning', forms: { noun: 'morning' } },
  bledan: { gloss: 'year', forms: { noun: 'year' } },
  amser: { gloss: 'season', forms: { noun: 'season' } },
  gam: { gloss: 'winter', forms: { noun: 'winter' } },
  vescor: { gloss: 'evening', forms: { noun: 'evening' } },
  cet: { gloss: 'beginning', forms: { noun: 'beginning' } },
  vorcenn: { gloss: 'end', forms: { noun: 'end' } },
  sior: { gloss: 'everlasting age', forms: { noun: 'everlasting age' } },
  // sight
  derc: { gloss: 'eye', forms: { noun: 'eye', verb: 'behold' } },
  sell: { gloss: 'gaze', forms: { verb: 'gaze upon' } },
  dec: { gloss: 'look', forms: { verb: 'look upon' } },
  adbat: { gloss: 'show', forms: { verb: 'show' } },
  glan: { gloss: 'clear', forms: { adj: 'clear', adv: 'clearly' } },
  vat: { gloss: 'seer', forms: { noun: 'seer' } },
  druid: { gloss: 'druid', forms: { noun: 'druid' } },
  rosc: { gloss: 'vision', forms: { noun: 'vision' } },
  mes: { gloss: 'judge', forms: { verb: 'judge' } },
  amarc: { gloss: 'sight', forms: { noun: 'sight' } },
  // fate
  toic: { gloss: 'allotted portion', forms: { noun: 'allotted portion' } },
  dan: { gloss: 'destiny', forms: { noun: 'destiny' } },
  cinned: { gloss: 'decree', forms: { noun: 'decree' } },
  tocad: { gloss: 'fortune', forms: { noun: 'fortune' } },
  dal: { gloss: 'appointed doom', forms: { noun: 'appointed doom' } },
  derb: { gloss: 'certain', forms: { adj: 'certain' } },
  rand: { gloss: 'share', forms: { noun: 'share' } },
  crandcor: { gloss: 'cast lot', forms: { noun: 'cast lot' } },
  bret: { gloss: 'judgment', forms: { noun: 'judgment' } },
  ges: { gloss: 'taboo', forms: { noun: 'taboo' } },
  // signs
  sen: { gloss: 'omen', forms: { noun: 'omen' } },
  comard: { gloss: 'token', forms: { noun: 'token' } },
  man: { gloss: 'portent', forms: { noun: 'portent' } },
  bran: { gloss: 'raven', forms: { noun: 'raven' } },
  irar: { gloss: 'eagle', forms: { noun: 'eagle' } },
  en: { gloss: 'bird', forms: { noun: 'bird' } },
  vis: { gloss: 'foreknowledge', forms: { noun: 'foreknowledge' } },
  celman: { gloss: 'augury', forms: { noun: 'augury' } },
  tarngir: { gloss: 'foretell', forms: { noun: 'prophecy' } },
  brig: { gloss: 'meaning', forms: { noun: 'meaning' } },
  // course
  tect: { gloss: 'traverse', forms: { verb: 'traverse' } },
  cor: { gloss: 'turning', forms: { verb: 'turn back' } },
  brost: { gloss: 'hasten', forms: { verb: 'hasten' } },
  cosc: { gloss: 'check', forms: { verb: 'check' } },
  mall: { gloss: 'slow', forms: { adj: 'slow', verb: 'slow' } },
  grib: { gloss: 'swift', forms: { adj: 'swift', adv: 'swiftly' } },
  gen: { gloss: 'renew', forms: { verb: 'renew' } },
  // beings
  dev: { gloss: 'god', forms: { noun: 'god' } },
  rig: { gloss: 'king', forms: { noun: 'king' } },
  tigern: { gloss: 'lord', forms: { noun: 'lord' } },
  tren: { gloss: 'hero', forms: { noun: 'hero' } },
  sinser: { gloss: 'ancestor', forms: { noun: 'ancestor' } },
  bard: { gloss: 'poet', forms: { noun: 'poet' } },
  goban: { gloss: 'smith', forms: { noun: 'smith' } },
  bansid: { gloss: 'woman of the mound', forms: { noun: 'woman of the mound' } },
  luct: { gloss: 'folk of the mound', forms: { noun: 'folk of the mound' } },
  mordev: { gloss: 'sea-god', forms: { noun: 'sea-god' } },
};

// The attested names of spec 10.7. The name is how a sentence spells the word,
// the gloss is what tier 1 says when the formula is that name alone. The
// reading line keeps the pre-apocope spelling the stones point to, so lugus
// and Lugus stand one above the other and neither is the other's misprint.
const powers: NamedPowerTable = {
  lugus: { name: 'Lugus', gloss: 'Lugus, the many-skilled, whose stem the stones already cut.' },
  dovvinias: {
    name: 'Dovvinias',
    gloss: 'Dovvinias, the ancestress cut in ogham on the stones of her people.',
  },
  lugudeccas: {
    name: 'Lugudeccas',
    gloss: 'Lugudeccas, the name of a man carrying the god inside it.',
  },
  ogmios: { name: 'Ogmios', gloss: 'Ogmios, the god of eloquence, who stands beside Ogma.' },
  brigantia: {
    name: 'Brigantia',
    gloss: 'Brigantia, the goddess the altars attest and the later tongue calls Brigit.',
  },
  dagodevos: { name: 'Dagodevos', gloss: 'Dagodevos, the good god, the Dagda under an older name.' },
  manannan: {
    name: 'Manannán',
    gloss: 'Manannán of the sea, lord of the mists and of the isle where time runs otherwise.',
  },
  danu: { name: 'Danu', gloss: 'Danu, the mother the Túatha Dé Danann are named from.' },
  morrigan: { name: 'Morrigan', gloss: 'Morrigan, the great queen, battle-crow and prophetess.' },
  donn: { name: 'Donn', gloss: 'Donn, the dark one, in whose house the dead gather.' },
  bodua: { name: 'Bodua', gloss: 'Bodua, the battle-crow, cut on a Gaulish altar.' },
  macha: { name: 'Macha', gloss: 'Macha, second of the three, whose name the ground still keeps.' },
  nemain: { name: 'Nemain', gloss: 'Nemain, the frenzy that breaks a host.' },
};

// Dread epithets of the Eldritch register (spec 10.10), each glossed with the
// article a vocative drops.
const epithets: GlossTable = {
  pethagg: 'the mouth beneath the tide',
  prusc: 'the crawler along the stem',
  moppad: 'the swarm beneath the sand',
  dolp: 'the hunger under the wave',
  prugg: 'the eye below the keel',
  hnapp: 'the breath from under the threshold',
  scradap: 'the tally that counts the living',
  golp: 'the gullet of the deep',
  thulp: 'the sleeper below the ninth wave',
  pemnag: 'the mist that unmakes names',
};

// The kenning vox of spec 10.7: the glyph line holds one letter that says
// nothing, and the gloss speaks the lore the letter carries. Each wording
// names the letter and then its kenning, because a reader who sees a single
// stroke has to be told which letter answered.
const kennings: GlossTable = {
  beith: 'Beithe, whitest of barks',
  sail: 'Sail, palest of withies',
  dair: 'Dair, stoutest of doors',
  coll: 'Coll, wisest of woods',
  ruis: 'Ruis, deepest of blushes',
};

const idioms: GlossTable = {
  OO1: 'The birch cut seven times, a warning that guards.',
  OO2: 'Your follower calls!',
  OO3_SHORT: 'The aicme of the birch!',
  OO3_FULL: 'The four aicmí, recited whole!',
  OO4: 'The name of the accursed!',
  OO5: 'Four rods of yew are cut.',
  OO6: 'O door of the hollow hill!',
  OC1: 'Here it stands.',
  OC2: 'Whole and safe.',
  OC3: 'The ogham of Ogma.',
  OC4: 'It is certain.',
  ELDRITCH_OPEN_SHORT: 'The vowels, recited against their order!',
  ELDRITCH_OPEN_FULL: 'The four aicmí, recited against their order!',
  ELDRITCH_CLOSE: 'Ruin in the dark.',
};

// The seal glosses the instruction it writes: snad is an order to the cutter,
// and the numeral tells him how often (spec 10.8).
const seals: GlossTable = {
  3: 'Cut it three times.',
  4: 'Cut it four times.',
  5: 'Cut it five times.',
  7: 'Cut it seven times.',
  9: 'Cut it nine times.',
  27: 'Cut it twenty-seven times.',
};

// The crossing is a voyage here, so the depth of this genome is not hours but
// water, and nine waves out is where the otherworld begins (spec 10.8).
const depths: GlossTable = {
  3: 'Three waves deep.',
  4: 'Four waves deep.',
  5: 'Five waves deep.',
  7: 'Seven waves deep.',
  9: 'Nine waves deep.',
  27: 'Twenty-seven waves deep.',
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

function agentName(ref: GlossRef): string {
  return ref.kind === 'epithet' ? vocative(lookup(epithets, ref.id, 'epithet')) : noun(ref.id);
}

// What a free POWER-WORD slot reads as: a name, a dread epithet spoken as one,
// or a letter answering with its kenning.
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
    `I, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} against the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.` +
    `${p.powerWord === null ? '' : ` ${voxName(p.powerWord)}!`}`,

  // The jussive lays a command on no one in particular, which English can only
  // manage as a wish, so the clause is built on the participle wordings of the
  // harm field while the glyph line keeps the active -etu (spec 10.13).
  curseClause: (p: OghamCurse) =>
    `May the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)} be ` +
    `${form(roots, p.intentRoot, 'pp')}${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: OghamInvocation) => {
    const names = p.agents.map(agentName);
    const head = names[0] ?? '';
    const stacked = names.slice(1).map((name) => ` of the ${name}`).join('');
    return (
      `O ${head}${stacked}, ${form(roots, p.intentRoot, 'verb')}` +
      `${adverbial(p.adverbRoot)}! ${voxName(p.powerWord)}!`
    );
  },

  divinationAsk: (p: OghamDivination) =>
    `Does the ${noun(p.agentRoot)} ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}?`,

  divinationSee: (p: OghamDivination) =>
    `I, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.`,

  chronomancyCross: (p: OghamChronomancyCross) =>
    `${capitalize(form(roots, p.intentRoot, 'verb'))} ` +
    `${lookup(directions, p.direction, 'direction')}${adverbial(p.adverbRoot)} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}!`,

  // English has no performative verb form and marks the mood with an adverb.
  chronomancyBind: (p: OghamChronomancyBind) =>
    `I hereby ${form(roots, p.intentRoot, 'verb')}` +
    `${adverbial(p.adverbRoot)} the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.`,

  // The anchor phrase keeps its deed last, as the school declares it: even the
  // gloss of this genome lands the verb where the glyph line does.
  returnAnchor: (anchorRoot, genitiveRoot) =>
    `To the ${noun(anchorRoot)}` +
    `${genitiveRoot === null ? '' : ` of the ${noun(genitiveRoot)}`} I have come.`,

  litanyTriple: (word) => `${repeatName(word)}, spoken three times.`,

  // The bright four shrink a count rather than a name: seven strokes of beith
  // losing one at each step, a tally counting itself out (spec 10.9).
  litanyShrink: (word) =>
    word.kind === 'birch'
      ? 'The birch warning, cut down stroke by stroke.'
      : `${repeatName(word)}, cut away letter by letter.`,

  tierOne: (word) =>
    word.kind === 'epithet'
      ? `${capitalize(word.id)}, ${lookup(epithets, word.id, 'epithet')}.`
      : power(powers, word.id).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    `${capitalize(form(roots, intentRoot, 'verb'))} the ${noun(targetRoot)}!`,
};
