// English glosses for the Egyptian genome. Root wordings, divine names and
// idiom glosses are docs/genomes.md section 3, verbatim. The clause methods are
// the English gloss grammar: another language rewrites them and nothing else.

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
import { before, capitalize, vocative } from './text.js';

const roots: RootGlossTable = {
  // warding
  mkA: { gloss: 'ward', forms: { noun: 'warding', verb: 'ward', pp: 'warded' } },
  sAq: { gloss: 'guard over', forms: { noun: 'guard', verb: 'guard', pp: 'guarded' } },
  xwf: { gloss: 'shield', forms: { noun: 'shield', verb: 'shield', pp: 'shielded' } },
  nbT: { gloss: 'encircle', forms: { noun: 'encircling', verb: 'encircle', pp: 'encircled' } },
  dnH: { gloss: 'wing over', forms: { noun: 'wing', verb: 'wing over', pp: 'winged over' } },
  Hsb: { gloss: 'bar the way', forms: { noun: 'barrier', verb: 'bar the way', pp: 'barred' } },
  twr: { gloss: 'repel in purity', forms: { verb: 'repel', pp: 'repelled' } },
  xsf: { gloss: 'drive back', forms: { verb: 'drive back', pp: 'driven back' } },
  mnq: { gloss: 'make firm', forms: { verb: 'make firm', pp: 'made firm' } },
  wDb: { gloss: 'turn aside', forms: { verb: 'turn aside', pp: 'turned aside' } },
  // harm
  sqr: { gloss: 'strike down', forms: { noun: 'blow', verb: 'strike down', pp: 'struck down' } },
  xbd: { gloss: 'afflict', forms: { noun: 'affliction', verb: 'afflict', pp: 'afflicted', adj: 'afflicted' } },
  dSr: { gloss: 'make bleed', forms: { noun: 'bleeding', verb: 'make bleed', pp: 'made to bleed', adj: 'bloodied' } },
  nkn: { gloss: 'wound', forms: { noun: 'wound', verb: 'wound', pp: 'wounded', adj: 'wounded' } },
  smA: { gloss: 'slay', forms: { noun: 'slaughter', verb: 'slay', pp: 'slain' } },
  Hwy: { gloss: 'beat', forms: { noun: 'beating', verb: 'beat', pp: 'beaten' } },
  xAd: { gloss: 'seize cruelly', forms: { verb: 'seize cruelly', pp: 'seized' } },
  ptx: { gloss: 'cast down', forms: { verb: 'cast down', pp: 'cast down' } },
  gbA: { gloss: 'cripple', forms: { verb: 'cripple', pp: 'crippled', adj: 'crippled' } },
  tks: { gloss: 'pierce', forms: { noun: 'piercing', verb: 'pierce', pp: 'pierced' } },
  // summoning
  nis: { gloss: 'call by name', forms: { noun: 'naming', verb: 'call by name', pp: 'called by name' } },
  aS: { gloss: 'cry out to', forms: { noun: 'cry', verb: 'cry out to', pp: 'cried out to' } },
  dbH: { gloss: 'entreat', forms: { noun: 'entreaty', verb: 'entreat', pp: 'entreated' } },
  sxpr: { gloss: 'bring into being', forms: { noun: 'becoming', verb: 'bring into being', pp: 'brought into being' } },
  iny: { gloss: 'fetch', forms: { verb: 'fetch', pp: 'fetched' } },
  wxr: { gloss: 'seek out', forms: { noun: 'search', verb: 'seek out', pp: 'sought out' } },
  spr: { gloss: 'petition', forms: { noun: 'petition', verb: 'petition', pp: 'petitioned' } },
  sHn: { gloss: 'commission', forms: { noun: 'commission', verb: 'commission', pp: 'commissioned' } },
  mAT: { gloss: 'proclaim', forms: { noun: 'proclamation', verb: 'proclaim', pp: 'proclaimed' } },
  qmA: { gloss: 'call forth', forms: { noun: 'calling forth', verb: 'call forth', pp: 'called forth' } },
  // hidden
  imn: { gloss: 'hidden', forms: { noun: 'hidden thing', verb: 'hide', pp: 'hidden', adj: 'hidden' } },
  StA: { gloss: 'secret', forms: { noun: 'secret', adj: 'secret' } },
  HAp: { gloss: 'conceal', forms: { noun: 'concealment', verb: 'conceal', pp: 'concealed' } },
  dgy: { gloss: 'hide away', forms: { verb: 'hide away', pp: 'hidden away' } },
  kAp: { gloss: 'cover over', forms: { noun: 'cover', verb: 'cover over', pp: 'covered over' } },
  sdx: { gloss: 'shroud', forms: { noun: 'shroud', verb: 'shroud', pp: 'shrouded' } },
  bsy: { gloss: 'initiate into mystery', forms: { noun: 'mystery', verb: 'initiate', pp: 'initiated' } },
  sStA: { gloss: 'make secret', forms: { noun: 'secret rite', verb: 'make secret', pp: 'made secret' } },
  Tms: { gloss: 'bury from sight', forms: { verb: 'bury from sight', pp: 'buried from sight' } },
  qrf: { gloss: 'enfold in dark', forms: { noun: 'enfolding dark', verb: 'enfold', pp: 'enfolded' } },
  // binding
  qAs: { gloss: 'bind', forms: { noun: 'binding', verb: 'bind', pp: 'bound' } },
  snH: { gloss: 'fetter', forms: { noun: 'fetter', verb: 'fetter', pp: 'fettered' } },
  arq: { gloss: 'bind by oath', forms: { noun: 'oath', verb: 'bind by oath', pp: 'bound by oath' } },
  dmA: { gloss: 'bind together', forms: { noun: 'bundle', verb: 'bind together', pp: 'bound together' } },
  xtm: { gloss: 'seal', forms: { noun: 'seal', verb: 'seal', pp: 'sealed' } },
  mny: { gloss: 'moor fast', forms: { noun: 'mooring post', verb: 'moor fast', pp: 'moored fast' } },
  TAs: { gloss: 'knot', forms: { noun: 'knot', verb: 'knot', pp: 'knotted' } },
  inH: { gloss: 'surround', forms: { noun: 'surrounding', verb: 'surround', pp: 'surrounded' } },
  gAf: { gloss: 'clench', forms: { noun: 'clench', verb: 'clench', pp: 'clenched' } },
  ndb: { gloss: 'rivet down', forms: { noun: 'rivet', verb: 'rivet down', pp: 'riveted down' } },
  // fire
  xt: { gloss: 'fire', forms: { noun: 'fire' } },
  sDt: { gloss: 'flame', forms: { noun: 'flame' } },
  nsr: { gloss: 'blaze', forms: { noun: 'blaze', verb: 'blaze', pp: 'blazed' } },
  rkH: { gloss: 'burn', forms: { noun: 'burning', verb: 'burn', pp: 'burned' } },
  nby: { gloss: 'flare', forms: { noun: 'flare', verb: 'flare', pp: 'flared' } },
  Am: { gloss: 'burn up', forms: { verb: 'burn up', pp: 'burned up' } },
  wbd: { gloss: 'scorch', forms: { noun: 'scorching', verb: 'scorch', pp: 'scorched' } },
  tkA: { gloss: 'torch', forms: { noun: 'torch' } },
  qrH: { gloss: 'smolder', forms: { noun: 'smoldering', verb: 'smolder', pp: 'smoldered' } },
  psy: { gloss: 'cook away', forms: { verb: 'cook away', pp: 'cooked away' } },
  // night
  grH: { gloss: 'night', forms: { noun: 'night' } },
  snk: { gloss: 'darkness', forms: { noun: 'darkness', adj: 'dark' } },
  wSA: { gloss: 'deep night', forms: { noun: 'deep night' } },
  xAwy: { gloss: 'evening', forms: { noun: 'evening' } },
  dwAt: { gloss: 'the world below', forms: { noun: 'world below' } },
  iwx: { gloss: 'gloom', forms: { noun: 'gloom', adj: 'gloomy' } },
  Sna: { gloss: 'storm-gloom', forms: { noun: 'storm-gloom' } },
  mskt: { gloss: 'night-barque', forms: { noun: 'night-barque' } },
  sDr: { gloss: 'lie through the night', forms: { verb: 'lie through the night', pp: 'laid through the night' } },
  qnH: { gloss: 'shrine-dark', forms: { noun: 'shrine-dark', adj: 'shrine-dark' } },
  // death
  mwt: { gloss: 'death', forms: { noun: 'death', adj: 'dead' } },
  xpy: { gloss: 'pass away', forms: { verb: 'pass away', pp: 'passed away' } },
  sxr: { gloss: 'lay low', forms: { verb: 'lay low', pp: 'laid low' } },
  qrs: { gloss: 'bury', forms: { noun: 'burial', verb: 'bury', pp: 'buried', adj: 'buried' } },
  imAx: { gloss: 'the honored dead', forms: { noun: 'honored dead', adj: 'honored' } },
  HfAw: { gloss: 'grave-worm', forms: { noun: 'grave-worm' } },
  isft: { gloss: 'dissolution', forms: { noun: 'dissolution' } },
  nSp: { gloss: 'last breath', forms: { noun: 'last breath' } },
  igrt: { gloss: 'the silent land', forms: { noun: 'silent land' } },
  Htm: { gloss: 'annihilate', forms: { noun: 'annihilation', verb: 'annihilate', pp: 'annihilated' } },
  // gates
  sbA: { gloss: 'portal', forms: { noun: 'portal' } },
  sbxt: { gloss: 'gateway', forms: { noun: 'gateway' } },
  aA: { gloss: 'door', forms: { noun: 'door' } },
  rwty: { gloss: 'double gate', forms: { noun: 'double gate' } },
  arwt: { gloss: 'portal court', forms: { noun: 'portal court' } },
  TpHt: { gloss: 'cavern mouth', forms: { noun: 'cavern mouth' } },
  wAt: { gloss: 'road', forms: { noun: 'road' } },
  xnd: { gloss: 'threshold', forms: { noun: 'threshold' } },
  wpy: { gloss: 'open', forms: { verb: 'open', pp: 'opened' } },
  snS: { gloss: 'throw open', forms: { verb: 'throw open', pp: 'thrown open' } },
  // time
  wnwt: { gloss: 'hour', forms: { noun: 'hour' } },
  nHH: { gloss: 'endless time', forms: { noun: 'endless time' } },
  Dt: { gloss: 'eternity', forms: { noun: 'eternity' } },
  rk: { gloss: 'era', forms: { noun: 'era' } },
  hAw: { gloss: 'epoch', forms: { noun: 'epoch' } },
  sp: { gloss: 'occasion', forms: { noun: 'occasion' } },
  tr: { gloss: 'season', forms: { noun: 'season' } },
  aHaw: { gloss: 'lifetime', forms: { noun: 'lifetime' } },
  pAwt: { gloss: 'primeval time', forms: { noun: 'primeval time' } },
  sf: { gloss: 'yesterday', forms: { noun: 'yesterday' } },
  // sight
  gmH: { gloss: 'glimpse', forms: { verb: 'glimpse' } },
  sSm: { gloss: 'show', forms: { noun: 'guide', verb: 'show' } },
  sHD: { gloss: 'illumine', forms: { verb: 'illumine' } },
  wbA: { gloss: 'disclose', forms: { verb: 'disclose' } },
  irt: { gloss: 'eye', forms: { noun: 'eye' } },
  rswt: { gloss: 'dream', forms: { noun: 'dream' } },
  sxA: { gloss: 'call to mind', forms: { verb: 'call to mind' } },
  nwty: { gloss: 'watcher', forms: { noun: 'watcher' } },
  wHa: { gloss: 'unriddle', forms: { verb: 'unriddle' } },
  mAa: { gloss: 'true', forms: { adj: 'true' } },
  // fate
  SAy: { gloss: 'fate', forms: { noun: 'fate', adj: 'fated' } },
  wD: { gloss: 'decree', forms: { noun: 'decree' } },
  mxAt: { gloss: 'balance', forms: { noun: 'balance' } },
  ip: { gloss: 'reckoning', forms: { noun: 'reckoning' } },
  nHb: { gloss: 'allotment', forms: { noun: 'allotment' } },
  pHwy: { gloss: 'the end of it', forms: { noun: 'end of it' } },
  bAw: { gloss: 'manifest power', forms: { noun: 'manifest power' } },
  xpr: { gloss: 'what comes to pass', forms: { noun: 'thing that comes to pass' } },
  mty: { gloss: 'unerring', forms: { adj: 'unerring' } },
  wpwt: { gloss: 'verdict sent', forms: { noun: 'verdict sent' } },
  // signs
  sS: { gloss: 'written sign', forms: { noun: 'written sign' } },
  mtr: { gloss: 'witness', forms: { noun: 'witness' } },
  bik: { gloss: 'falcon', forms: { noun: 'falcon' } },
  Sdy: { gloss: 'reading aloud', forms: { noun: 'reading aloud' } },
  wSd: { gloss: 'question put', forms: { noun: 'question put' } },
  wSb: { gloss: 'answer', forms: { noun: 'answer' } },
  smi: { gloss: 'report', forms: { noun: 'report' } },
  psS: { gloss: 'divided lot', forms: { noun: 'divided lot' } },
  xAy: { gloss: 'measuring out', forms: { noun: 'measuring out' } },
  hn: { gloss: 'assent', forms: { noun: 'assent' } },
  // course
  DA: { gloss: 'cross', forms: { verb: 'cross' } },
  an: { gloss: 'turn back', forms: { verb: 'turn back' } },
  As: { gloss: 'hasten', forms: { verb: 'hasten' } },
  wsf: { gloss: 'slow', forms: { verb: 'slow' } },
  aHa: { gloss: 'halt', forms: { verb: 'halt' } },
  Ts: { gloss: 'lift out', forms: { verb: 'lift out' } },
  nmt: { gloss: 'step', forms: { noun: 'step' } },
  Smt: { gloss: 'course', forms: { noun: 'course' } },
  xAx: { gloss: 'swift', forms: { adj: 'swift' } },
  mAwy: { gloss: 'renew', forms: { verb: 'renew', adj: 'new' } },
};

const powers: NamedPowerTable = {
  HkA: { name: 'Heka', gloss: 'Heka, magic itself.' },
  ra: { name: 'Ra', gloss: 'Ra, the sun above.' },
  DHwty: { name: 'Djehuty', gloss: 'Djehuty, lord of writing.' },
  Ast: { name: 'Aset', gloss: 'Aset, great of magic.' },
  wsir: { name: 'Usir', gloss: 'Usir, lord of the dead.' },
  inpw: { name: 'Inpu', gloss: 'Inpu, opener of the ways.' },
  sxmt: { name: 'Sekhmet', gloss: 'Sekhmet, plague and shield.' },
  aApp: { name: 'Aapep', gloss: 'Aapep, the serpent adversary.' },
  imn: { name: 'Imen', gloss: 'Imen, the hidden one who answers.' },
};

const epithets: GlossTable = {
  xAxr: 'the devourer at the threshold',
  nqrx: 'the gnawer in the dark',
  TmAx: 'the buried hunger',
  sSdx: 'the flash that blinds',
  qbHx: 'the cold beneath the river',
  wgpx: 'the breaker of names',
  Hnbx: 'the sprawler at the gates',
  dSrx: 'the red thirst',
  iApx: 'the coiled dark',
  gnwx: 'the silence that watches',
};

const idioms: GlossTable = {
  EO1: 'Recitation.',
  EO4: 'As for what is seen in a dream.',
  ELDRITCH_OPEN: 'The rite spoken backwards.',
  EC1: 'Life, prosperity, health.',
  EC2: 'True of voice.',
  EC4: 'So it is.',
  ELDRITCH_CLOSE: 'Dissolution forever.',
};

// The same counts read as how far a crossing went (spec 1.6).
const depths: GlossTable = {
  2: 'Two hours deep.',
  3: 'Three hours deep.',
  4: 'Four hours deep.',
  7: 'Seven hours deep.',
  9: 'Nine hours deep.',
  12: 'Twelve hours deep.',
};

const directions: GlossTable = {
  back: 'backward',
  forth: 'forward',
  again: 'again',
  still: 'still',
};

const seals: GlossTable = {
  2: 'Recited two times.',
  3: 'Recited three times.',
  4: 'Recited four times.',
  7: 'Recited seven times.',
  9: 'Recited nine times.',
  12: 'Recited twelve times.',
};

function noun(id: string): string {
  return form(roots, id, 'noun');
}

// The adverbial modifier reads as a prepositional phrase at clause end.
function adverbial(rootId: string | null): string {
  return rootId === null ? '' : ` in the ${noun(rootId)}`;
}

function adjectival(rootId: string | null): string {
  return before(rootId === null ? null : form(roots, rootId, 'adj'));
}

// How a participant is named inside a sentence.
function named(ref: GlossRef): string {
  if (ref.kind === 'epithet') return vocative(lookup(epithets, ref.id, 'epithet'));
  if (ref.kind === 'power') return power(powers, ref.id).name;
  return noun(ref.id);
}

export const egyptianGlosses: EgyptianGlosses = {
  roots,
  powers,
  epithets,
  idioms,
  seals,
  depths,
  directions,

  idiom: (id) => lookup(idioms, id, 'idiom'),
  seal: (count) => lookup(seals, String(count), 'seal'),
  sealDepth: (count) => lookup(depths, String(count), 'depth'),
  direction: (id) => lookup(directions, id, 'direction'),
  sentences: (parts) => parts.join(' '),

  protectionClause: (p: EgyptianProtection) =>
    `I ${form(roots, p.intentRoot, 'verb')} against the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}${adverbial(p.adverbRoot)}, ` +
    `by ${power(powers, p.agentPower).name}. ${power(powers, p.freePower).name}!`,

  curseClause: (p: EgyptianCurse) =>
    `May the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)} be ` +
    `${form(roots, p.intentRoot, 'pp')}${adverbial(p.adverbRoot)}.`,

  invocationClause: (p: EgyptianInvocation) => {
    const names = p.agents.map(named);
    const head = names[0] ?? '';
    const stacked = names.slice(1).map((name) => ` of the ${name}`).join('');
    const spoken = p.power.kind === 'epithet' ? capitalize(p.power.spoken) : named(p.power);
    return `O ${head}${stacked}, come${adverbial(p.adverbRoot)}! ${spoken}!`;
  },

  divinationAsk: (p: EgyptianDivinationAsk) => {
    const chain = p.chainRoots.map((id) => ` of the ${noun(id)}`).join('');
    return (
      `Does ${power(powers, p.agentPower).name}${chain} ` +
      `${form(roots, p.intentRoot, 'verb')} the ` +
      `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}${adverbial(p.adverbRoot)}?`
    );
  },

  divinationSee: (p: EgyptianDivinationSee) =>
    `I ${form(roots, p.intentRoot, 'verb')} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}${adverbial(p.adverbRoot)}.`,

  chronomancyCross: (p: ChronomancyCross) =>
    `${capitalize(form(roots, p.intentRoot, 'verb'))} ${directions[p.direction] ?? ''} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}${adverbial(p.adverbRoot)}!`,

  // English has no performative verb form and marks the mood with an adverb.
  chronomancyBind: (p: ChronomancyBind) =>
    `I hereby ${form(roots, p.intentRoot, 'verb')} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}${adverbial(p.adverbRoot)}.`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `Coming forth in the ${noun(anchorRoot)}` +
    `${genitiveRoot === null ? '' : ` of the ${noun(genitiveRoot)}`}.`,

  // The title keeps the epithet's own article, unlike a vocative.
  spellTitle: (subject) =>
    subject.kind === 'epithet'
      ? `Spell of ${lookup(epithets, subject.id, 'epithet')}.`
      : `Spell of the ${noun(subject.id)}.`,

  nameKnowledge: (address: EgyptianAddress, eldritch) => {
    const who =
      address.kind === 'gate'
        ? `${noun(address.headRoot)} of the ${noun(address.tailRoot)}`
        : named(address);
    return eldritch ? `O ${who}, you know my name.` : `O ${who}, I know your name.`;
  },

  tierOne: (subject) =>
    subject.kind === 'epithet'
      ? `${capitalize(subject.spoken)}, ${lookup(epithets, subject.id, 'epithet')}.`
      : power(powers, subject.id).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    `${capitalize(form(roots, intentRoot, 'verb'))} the ${noun(targetRoot)}!`,
};
