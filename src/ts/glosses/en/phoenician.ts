// English glosses for the Phoenician genome. Root wordings, divine names and
// idiom glosses are docs/genomes.md section 4, verbatim. The clause methods are
// the English gloss grammar: another language rewrites them and nothing else.

import { form, lookup, power } from '../table.js';
import type {
  PhoenicianDivinationAsk,
  PhoenicianDivinationSee,
  PhoenicianGlosses,
  PhoenicianInvocation,
  PhoenicianJussive,
} from '../../languages/phoenician-glosses.js';
import type {
  ChronomancyBind,
  ChronomancyCross,
  GlossRef,
  GlossTable,
  NamedPowerTable,
  RootGlossTable,
} from '../types.js';
import { before, capitalize, genomeMethods, vocative } from './text.js';

const roots: RootGlossTable = {
  // warding
  mgn: { gloss: 'shield', forms: { noun: 'shield', plural: 'shields', verb: 'shield', pp: 'shielded' } },
  ntsr: { gloss: 'guard', forms: { noun: 'guard', plural: 'guards', verb: 'guard', pp: 'guarded' } },
  shmr: { gloss: 'watch over', forms: { noun: 'watcher', plural: 'watchers', verb: 'watch over', pp: 'watched over' } },
  gdr: { gloss: 'wall in', forms: { noun: 'wall', plural: 'walls', verb: 'wall in', pp: 'walled in' } },
  skk: { gloss: 'screen, overshadow', forms: { noun: 'screen', plural: 'screens', verb: 'overshadow', pp: 'overshadowed' } },
  smk: { gloss: 'uphold', forms: { noun: 'support', plural: 'supports', verb: 'uphold', pp: 'upheld' } },
  ghzr: { gloss: 'gird round', forms: { noun: 'girdle', plural: 'girdles', verb: 'gird round', pp: 'girded round' } },
  khsn: { gloss: 'make strong', forms: { noun: 'stronghold', plural: 'strongholds', verb: 'make strong', pp: 'made strong' } },
  khpp: { gloss: 'canopy over', forms: { noun: 'canopy', plural: 'canopies', verb: 'canopy over', pp: 'canopied' } },
  swg: { gloss: 'fence about', forms: { noun: 'fence', plural: 'fences', verb: 'fence about', pp: 'fenced about' } },
  // harm
  "'rr": { gloss: 'curse', forms: { noun: 'curse', plural: 'curses', verb: 'curse', pp: 'cursed' } },
  qll: { gloss: 'revile', forms: { verb: 'revile', pp: 'reviled', adj: 'reviled' } },
  ngp: { gloss: 'strike with plague', forms: { noun: 'plague', plural: 'plagues', verb: 'strike with plague', pp: 'plague-struck' } },
  shbr: { gloss: 'shatter', forms: { noun: 'shattering', plural: 'shatterings', verb: 'shatter', pp: 'shattered' } },
  mkhts: { gloss: 'smite', forms: { verb: 'smite', pp: 'smitten' } },
  khbl: { gloss: 'ruin', forms: { noun: 'ruin', plural: 'ruins', verb: 'ruin', pp: 'ruined' } },
  hdp: { gloss: 'thrust down', forms: { verb: 'thrust down', pp: 'thrust down' } },
  "'bd": { gloss: 'destroy', forms: { noun: 'destruction', plural: 'destructions', verb: 'destroy', pp: 'destroyed' } },
  khrb: { gloss: 'lay waste', forms: { verb: 'lay waste', pp: 'laid waste', adj: 'wasted' } },
  rtsts: { gloss: 'crush', forms: { verb: 'crush', pp: 'crushed', adj: 'crushed' } },
  // summoning
  "qr'": { gloss: 'call', forms: { noun: 'call', plural: 'calls', verb: 'call', pp: 'called' } },
  zghq: { gloss: 'cry out', forms: { noun: 'outcry', plural: 'outcries', verb: 'cry out', pp: 'cried out to' } },
  shlkh: { gloss: 'send for', forms: { verb: 'send for', pp: 'sent for' } },
  "bw'": { gloss: 'bring in', forms: { noun: 'coming', plural: 'comings', verb: 'come in', pp: 'brought in' } },
  ngd: { gloss: 'announce', forms: { verb: 'announce', pp: 'announced' } },
  pqd: { gloss: 'muster', forms: { verb: 'muster', pp: 'mustered' } },
  "'sp": { gloss: 'gather', forms: { verb: 'gather', pp: 'gathered' } },
  ghny: { gloss: 'answer', forms: { verb: 'answer', pp: 'answered' } },
  drsh: { gloss: 'seek out', forms: { verb: 'seek out', pp: 'sought out' } },
  qbts: { gloss: 'assemble', forms: { verb: 'assemble', pp: 'assembled' } },
  // hidden
  str: { gloss: 'hide', forms: { noun: 'hiding place', plural: 'hiding places', verb: 'hide', pp: 'hidden' } },
  ghlm: { gloss: 'conceal', forms: { noun: 'concealment', plural: 'concealments', verb: 'conceal', pp: 'concealed' } },
  "khb'": { gloss: 'shelter in secret', forms: { noun: 'shelter', plural: 'shelters', verb: 'shelter', pp: 'sheltered' } },
  tspn: { gloss: 'treasure away', forms: { noun: 'hoard', plural: 'hoards', verb: 'treasure away', pp: 'treasured away' } },
  khshk: { gloss: 'obscure', forms: { noun: 'obscurity', plural: 'obscurities', verb: 'obscure', pp: 'obscured', adj: 'obscured' } },
  lkhsh: { gloss: 'whisper a charm', forms: { noun: 'whispered charm', plural: 'whispered charms', verb: 'whisper a charm', pp: 'whispered over' } },
  ghmq: { gloss: 'be unfathomed', forms: { noun: 'unfathomed deep', plural: 'unfathomed deeps', adj: 'unfathomed' } },
  ttmn: { gloss: 'bury from sight', forms: { verb: 'bury from sight', pp: 'buried from sight' } },
  khdr: { gloss: 'inner chamber', forms: { noun: 'inner chamber', plural: 'inner chambers' } },
  swd: { gloss: 'secret council', forms: { noun: 'secret council', plural: 'secret councils' } },
  // binding
  "'sr": { gloss: 'bind', forms: { noun: 'bond', plural: 'bonds', verb: 'bind', pp: 'bound' } },
  khtm: { gloss: 'seal', forms: { noun: 'seal', plural: 'seals', verb: 'seal', pp: 'sealed' } },
  qshr: { gloss: 'knot', forms: { noun: 'knot', plural: 'knots', verb: 'knot', pp: 'knotted' } },
  kbl: { gloss: 'fetter', forms: { noun: 'fetter', plural: 'fetters', verb: 'fetter', pp: 'fettered' } },
  rtq: { gloss: 'chain fast', forms: { noun: 'chain', plural: 'chains', verb: 'chain fast', pp: 'chained fast' } },
  ghqd: { gloss: 'bind for offering', forms: { verb: 'bind for offering', pp: 'bound for offering' } },
  khnq: { gloss: 'constrict', forms: { verb: 'constrict', pp: 'constricted' } },
  tsrr: { gloss: 'wrap tight', forms: { verb: 'wrap tight', pp: 'wrapped tight' } },
  khgr: { gloss: 'gird', forms: { noun: 'girding', plural: 'girdings', verb: 'gird', pp: 'girded' } },
  zmm: { gloss: 'muzzle', forms: { noun: 'muzzle', plural: 'muzzles', verb: 'muzzle', pp: 'muzzled' } },
  // fire
  "'sh": { gloss: 'fire', forms: { noun: 'fire', plural: 'fires' } },
  lhb: { gloss: 'flame', forms: { noun: 'flame', plural: 'flames' } },
  bghr: { gloss: 'burn', forms: { noun: 'burning', plural: 'burnings', verb: 'burn', pp: 'burned' } },
  srp: { gloss: 'burn up', forms: { verb: 'burn up', pp: 'burned up' } },
  qdkh: { gloss: 'kindle', forms: { noun: 'kindling', plural: 'kindlings', verb: 'kindle', pp: 'kindled' } },
  zrkh: { gloss: 'blaze forth', forms: { noun: 'blaze', plural: 'blazes', verb: 'blaze forth', pp: 'blazed forth' } },
  rshp: { gloss: 'plague-fire', forms: { noun: 'plague-fire', plural: 'plague-fires' } },
  gkhl: { gloss: 'ember', forms: { noun: 'ember', plural: 'embers' } },
  khrr: { gloss: 'scorch', forms: { verb: 'scorch', pp: 'scorched', adj: 'scorched' } },
  tnr: { gloss: 'furnace', forms: { noun: 'furnace', plural: 'furnaces' } },
  // night
  lyl: { gloss: 'night', forms: { noun: 'night', plural: 'nights' } },
  ghrb: { gloss: 'evening', forms: { noun: 'evening', plural: 'evenings' } },
  "'pl": { gloss: 'thick darkness', forms: { noun: 'thick darkness', plural: 'thick darknesses', adj: 'pitch-dark' } },
  nshp: { gloss: 'twilight', forms: { noun: 'twilight', plural: 'twilights' } },
  tslm: { gloss: 'deep shadow', forms: { noun: 'deep shadow', plural: 'deep shadows', adj: 'shadowed' } },
  shkhr: { gloss: 'the black hour', forms: { noun: 'black hour', plural: 'black hours', adj: 'black' } },
  dmm: { gloss: 'stillness', forms: { noun: 'stillness', plural: 'stillnesses', adj: 'still' } },
  nwm: { gloss: 'slumber', forms: { noun: 'slumber', plural: 'slumbers', verb: 'slumber', pp: 'slumbering' } },
  khlm: { gloss: 'dream', forms: { noun: 'dream', plural: 'dreams' } },
  qdr: { gloss: 'grow dark', forms: { verb: 'grow dark', pp: 'grown dark', adj: 'darkened' } },
  // death
  mwt: { gloss: 'death', forms: { noun: 'death', plural: 'deaths' } },
  qbr: { gloss: 'grave', forms: { noun: 'grave', plural: 'graves' } },
  "rp'": { gloss: 'shade of the dead', forms: { noun: 'shade of the dead', plural: 'shades' } },
  shkhb: { gloss: 'lie in death', forms: { verb: 'lie in death', pp: 'laid in death' } },
  krt: { gloss: 'cut off', forms: { noun: 'cutting off', plural: 'cuttings off', verb: 'cut off', pp: 'cut off' } },
  shkht: { gloss: 'pit of ruin', forms: { noun: 'pit of ruin', plural: 'pits of ruin' } },
  dwy: { gloss: 'waste away', forms: { verb: 'waste away', pp: 'wasted away', adj: 'wasted' } },
  blgh: { gloss: 'swallow up', forms: { verb: 'swallow up', pp: 'swallowed up' } },
  khdl: { gloss: 'cease', forms: { verb: 'cease', pp: 'ceased' } },
  nbl: { gloss: 'wither', forms: { verb: 'wither', pp: 'withered', adj: 'withered' } },
  // gates
  shghr: { gloss: 'gate', forms: { noun: 'gate', plural: 'gates' } },
  dl: { gloss: 'door', forms: { noun: 'door', plural: 'doors' } },
  ptkh: { gloss: 'opening', forms: { noun: 'opening', plural: 'openings', verb: 'open', pp: 'opened' } },
  sp: { gloss: 'threshold', forms: { noun: 'threshold', plural: 'thresholds' } },
  shqp: { gloss: 'lintel', forms: { noun: 'lintel', plural: 'lintels' } },
  khln: { gloss: 'window', forms: { noun: 'window', plural: 'windows' } },
  shbl: { gloss: 'path', forms: { noun: 'path', plural: 'paths' } },
  drk: { gloss: 'road', forms: { noun: 'road', plural: 'roads' } },
  ghbr: { gloss: 'cross over', forms: { noun: 'crossing', plural: 'crossings', verb: 'cross over', pp: 'crossed over' } },
  bqgh: { gloss: 'breach open', forms: { noun: 'breach', plural: 'breaches', verb: 'breach open', pp: 'breached open' } },
  // time
  ghd: { gloss: 'perpetuity', forms: { noun: 'perpetuity', plural: 'perpetuities' } },
  zmn: { gloss: 'appointed time', forms: { noun: 'appointed time', plural: 'appointed times' } },
  ght: { gloss: 'moment', forms: { noun: 'moment', plural: 'moments' } },
  ym: { gloss: 'day', forms: { noun: 'day', plural: 'days' } },
  shnt: { gloss: 'year', forms: { noun: 'year', plural: 'years' } },
  khdsh: { gloss: 'new moon', forms: { noun: 'new moon', plural: 'new moons' } },
  bqr: { gloss: 'morning', forms: { noun: 'morning', plural: 'mornings' } },
  qdm: { gloss: 'ancient time', forms: { noun: 'ancient time', plural: 'ancient times' } },
  "'khr": { gloss: 'the after-time', forms: { noun: 'after-time', plural: 'after-times' } },
  dr: { gloss: 'generation, age', forms: { noun: 'age', plural: 'ages' } },
  // sight
  khzh: { gloss: 'see in vision', forms: { noun: 'seer', verb: 'behold in vision' } },
  nbtt: { gloss: 'look upon', forms: { verb: 'look upon' } },
  glh: { gloss: 'uncover', forms: { verb: 'uncover' } },
  "'wr": { gloss: 'light', forms: { noun: 'light' } },
  ngh: { gloss: 'shining', forms: { noun: 'shining' } },
  tsph: { gloss: 'keep watch', forms: { noun: 'watchman', verb: 'watch for' } },
  "sh'l": { gloss: 'ask after', forms: { verb: 'ask after' } },
  ghyn: { gloss: 'eye', forms: { noun: 'eye' } },
  pqkh: { gloss: 'lay open', forms: { verb: 'lay open' } },
  brr: { gloss: 'clear', forms: { adj: 'clear' } },
  // fate
  grl: { gloss: 'cast lot', forms: { noun: 'cast lot' } },
  khlq: { gloss: 'allotted portion', forms: { noun: 'allotted portion' } },
  gzr: { gloss: 'decree', forms: { noun: 'decree' } },
  dyn: { gloss: 'judgment', forms: { noun: 'judgment' } },
  mny: { gloss: 'what is appointed', forms: { noun: 'thing appointed' } },
  ghqb: { gloss: 'outcome', forms: { noun: 'outcome' } },
  gdd: { gloss: 'fortune', forms: { noun: 'fortune' } },
  ntsb: { gloss: 'fixed', forms: { adj: 'fixed' } },
  khrts: { gloss: 'what is determined', forms: { noun: 'thing determined' } },
  nkhl: { gloss: 'what falls to one', forms: { noun: 'share that falls to one' } },
  // signs
  "'t": { gloss: 'token', forms: { noun: 'token', plural: 'tokens' } },
  spr: { gloss: 'written record', forms: { noun: 'written record', plural: 'written records' } },
  nkhsh: { gloss: 'omen-reading', forms: { noun: 'omen-reading', plural: 'omen-readings' } },
  qsm: { gloss: 'lot-divining', forms: { noun: 'lot-divining', plural: 'lot-divinings' } },
  hll: { gloss: 'morning star', forms: { noun: 'morning star', plural: 'morning stars' } },
  rmz: { gloss: 'silent hint', forms: { noun: 'silent hint', plural: 'silent hints' } },
  bshr: { gloss: 'tidings', forms: { noun: 'tidings', plural: 'tidings' } },
  khqq: { gloss: 'graven mark', forms: { noun: 'graven mark', plural: 'graven marks' } },
  ghwp: { gloss: 'bird in flight', forms: { noun: 'bird in flight', plural: 'birds in flight' } },
  smn: { gloss: 'set mark', forms: { noun: 'set mark', plural: 'set marks' } },
  // course
  khlp: { gloss: 'pass over', forms: { verb: 'pass over' } },
  shwb: { gloss: 'turn back', forms: { verb: 'turn back' } },
  mhr: { gloss: 'hasten', forms: { verb: 'hasten' } },
  mshk: { gloss: 'draw out', forms: { verb: 'draw out' } },
  ghmd: { gloss: 'halt', forms: { verb: 'halt' } },
  nsgh: { gloss: 'lift out', forms: { verb: 'lift out' } },
  tsghd: { gloss: 'step', forms: { noun: 'step' } },
  hlk: { gloss: 'course', forms: { noun: 'course' } },
  khpz: { gloss: 'swift', forms: { adj: 'swift' } },
  shny: { gloss: 'repeat', forms: { verb: 'repeat' } },
};

// A gender rides every name because a Divination question that does not write
// its subject out still has to resume it with the right pronoun.
const powers: NamedPowerTable = {
  bghl: { name: 'Baal', gloss: 'Baal, lord of the storm.', gender: 'm' },
  ghshtrt: { name: 'Ashtart', gloss: 'Ashtart, lady of Sidon.', gender: 'f' },
  "'shmn": { name: 'Eshmun', gloss: 'Eshmun, healer of Sidon.', gender: 'm' },
  mlqrt: { name: 'Milqart', gloss: 'Milqart, lord of Tyre.', gender: 'm' },
  tnt: { name: 'Tinnit', gloss: 'Tinnit, the face of Baal.', gender: 'f' },
  rshp: { name: 'Reshep', gloss: 'Reshep, lord of the plague-fire.', gender: 'm' },
  khrn: { name: 'Horon', gloss: 'Horon, of the world below.', gender: 'm' },
  ssm: { name: 'Sasam', gloss: 'Sasam, named in the demon oath.', gender: 'm' },
};

const epithets: GlossTable = {
  ttkhmr: 'the churner of the deep',
  qlghsh: 'the whisper that unmakes',
  tsrghn: 'the sprawling root below',
  mqdgh: 'the profaned holy place',
  shqmts: 'the sunken devourer',
  ghqbr: 'the grave that walks',
  ntpl: 'the fallen watcher',
  bghshm: 'the nameless flesh',
  dlqts: 'the gnawing flame below',
  khnqsh: 'the strangling serpent',
};

const idioms: GlossTable = {
  PC1: 'For he has heard the voice, may he bless.',
  PC2: 'May they have no root below.',
  PC3: 'Forever.',
  // Glossed without a subject on purpose, so that no closer contradicts the
  // gender of the power the formula questioned (spec 4.11).
  PC4: 'For the voice has been heard.',
  ELDRITCH_CLOSE: 'The gate stands open forever.',
};

// The same counts read as how far a crossing went (spec 1.6).
const depths: GlossTable = {
  3: 'Three hours deep.',
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
  3: 'Three times over.',
  7: 'Seven times over.',
  9: 'Nine times over.',
  12: 'Twelve times over.',
};

function noun(id: string): string {
  return form(roots, id, 'noun');
}

// The adverbial modifier reads as its own short sentence at clause end.
function adverbial(rootId: string | null): string {
  return rootId === null ? '' : ` In the ${noun(rootId)}.`;
}

function adjectival(rootId: string | null): string {
  return before(rootId === null ? null : form(roots, rootId, 'adj'));
}

// An epithet keeps its article in a title but drops it in a vocative. Stacked
// agents behind the first one read as a plural genitive.
function agentName(ref: GlossRef, index: number): string {
  if (ref.kind === 'epithet') return vocative(lookup(epithets, ref.id, 'epithet'));
  if (ref.kind === 'power') return power(powers, ref.id).name;
  return index === 0 ? noun(ref.id) : form(roots, ref.id, 'plural');
}

export const phoenicianGlosses: PhoenicianGlosses = {
  roots,
  powers,
  epithets,
  idioms,
  seals,
  depths,
  directions,

  ...genomeMethods({ idioms, seals, depths, directions }),
  // A Phoenician clause may leave a slot empty and the join a gap behind it.
  sentences: (parts) => parts.join(' ').replace(/\s+/gu, ' ').trim(),

  jussiveClause: (p: PhoenicianJussive) => {
    const chain = p.chainRoots.map((id) => ` of the ${form(roots, id, 'plural')}`).join('');
    const object =
      p.targetRoot === null ? '' : ` the ${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}`;
    const called = p.freePower === null ? '' : ` ${power(powers, p.freePower).name}!`;
    return (
      `May ${power(powers, p.agentPower).name}${chain} ` +
      `${form(roots, p.intentRoot, 'verb')}${object}.${called}${adverbial(p.adverbRoot)}`
    );
  },

  invocationClause: (p: PhoenicianInvocation) => {
    const names = p.agents.map(agentName);
    const head = names[0] ?? '';
    const stacked = names.slice(1).map((name) => ` of the ${name}`).join('');
    const spoken = p.power.kind === 'epithet' ? capitalize(p.power.spoken) : agentName(p.power, 0);
    return (
      `O ${head}${stacked}, ${form(roots, p.intentRoot, 'verb')}! ` +
      `${spoken}!${adverbial(p.adverbRoot)}`
    );
  },

  divinationAsk: (p: PhoenicianDivinationAsk) => {
    const god = power(powers, p.agentPower);
    const chain = p.chainRoots.map((id) => ` of the ${form(roots, id, 'plural')}`).join('');
    // Below tier 8 the clause does not repeat the power's name, the verb
    // prefix resumes it, so the gloss answers with a pronoun of its gender.
    const subject = p.named ? `${god.name}${chain}` : god.gender === 'f' ? 'she' : 'he';
    return (
      `Does ${subject} ${form(roots, p.intentRoot, 'verb')} the ` +
      `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}?${adverbial(p.adverbRoot)}`
    );
  },

  divinationSee: (p: PhoenicianDivinationSee) =>
    `And I ${form(roots, p.intentRoot, 'verb')} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.${adverbial(p.adverbRoot)}`,

  chronomancyCross: (p: ChronomancyCross) =>
    `${capitalize(form(roots, p.intentRoot, 'verb'))} ${directions[p.direction] ?? ''} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}!${adverbial(p.adverbRoot)}`,

  // The clause opens on And because w- is on its verb, as the seeing clause
  // does, and English marks the performative with an adverb.
  chronomancyBind: (p: ChronomancyBind) =>
    `And I hereby ${form(roots, p.intentRoot, 'verb')} the ` +
    `${adjectival(p.adjectiveRoot)}${noun(p.targetRoot)}.${adverbial(p.adverbRoot)}`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `I have come to the ${noun(anchorRoot)}` +
    `${genitiveRoot === null ? '' : ` of the ${noun(genitiveRoot)}`}.`,

  selfPresentationByName: (spokenName) => `I am ${capitalize(spokenName)}.`,
  selfPresentationByEpithet: (id) => `I belong to ${lookup(epithets, id, 'epithet')}.`,

  openerByEpithet: (id) => `Incantation by ${lookup(epithets, id, 'epithet')}.`,
  openerToLord: (id) => `To the lord, to ${power(powers, id).name}.`,
  openerAgainst: (targetRoot, adjectiveRoot) =>
    `Incantation against the ${adjectival(adjectiveRoot)}${form(roots, targetRoot, 'plural')}.`,
  openerQuestion: (id) => `A question to ${power(powers, id).name}.`,
  openerYear: (timeRoot) => `In the year of the ${noun(timeRoot)}.`,

  litanyTriple: (subject) =>
    subject.kind === 'epithet'
      ? `${capitalize(subject.spoken)}, spoken three times.`
      : `${agentName(subject, 0)}, spoken three times.`,

  litanyTriangle: (spoken) => `${capitalize(spoken)}, shrinking to a single letter.`,

  tierOne: (subject) =>
    subject.kind === 'epithet'
      ? `${capitalize(subject.spoken)}, ${lookup(epithets, subject.id, 'epithet')}.`
      : power(powers, subject.id).gloss,

  tierTwo: (intentRoot, targetRoot) =>
    `${capitalize(form(roots, intentRoot, 'verb'))} the ${noun(targetRoot)}!`,
};
