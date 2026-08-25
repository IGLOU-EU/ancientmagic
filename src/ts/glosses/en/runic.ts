// English glosses for the Runic genome. Root wordings and idiom glosses are
// docs/genomes.md section 2, verbatim. The clause methods are the English
// gloss grammar: another language rewrites them and touches nothing else.

import { form, lookup } from '../table.js';
import type {
  ChronomancyBind,
  ChronomancyCross,
  GlossRef,
  RunicCurse,
  RunicDivination,
  RunicGlosses,
  RunicInvocation,
  RunicProtection,
  RootGlossTable,
  GlossTable,
} from '../types.js';
import { after, before, capitalize, vocative } from './text.js';

const roots: RootGlossTable = {
  // warding
  ward: { gloss: 'watch, guard', forms: { noun: 'warder', verb: 'ward' } },
  skild: { gloss: 'shield', forms: { noun: 'shield', verb: 'shield' } },
  burg: { gloss: 'stronghold', forms: { noun: 'stronghold' } },
  helm: { gloss: 'covering', forms: { noun: 'covering', verb: 'cover' } },
  gard: { gloss: 'enclosure', forms: { noun: 'enclosure', verb: 'enclose' } },
  frith: { gloss: 'peace-bond', forms: { noun: 'peace-bond' } },
  mund: { gloss: 'protecting hand', forms: { noun: 'protecting hand' } },
  wern: { gloss: 'fend off', forms: { verb: 'fend' } },
  halg: { gloss: 'hallow', forms: { verb: 'hallow' } },
  skerm: { gloss: 'screen', forms: { verb: 'screen' } },
  wunj: { gloss: 'joy', forms: { noun: 'joy' } },
  lauk: { gloss: 'leek', forms: { noun: 'leek' } },
  alg: { gloss: 'elk-guard', forms: { noun: 'elk-guard' } },
  tiw: { gloss: 'the sky god', forms: { noun: 'sky god' } },
  berk: { gloss: 'birch', forms: { noun: 'birch' } },
  othal: { gloss: 'heritage', forms: { noun: 'heritage' } },
  // harm
  skath: { gloss: 'scathe', forms: { verb: 'scathe', pp: 'scathed' } },
  bal: { gloss: 'bale, evil', forms: { noun: 'bale' } },
  sair: { gloss: 'wound', forms: { noun: 'wound', verb: 'wound', pp: 'wounded' } },
  agl: { gloss: 'affliction', forms: { noun: 'affliction' } },
  wund: { gloss: 'gash', forms: { noun: 'gash', verb: 'gash', pp: 'gashed' } },
  slah: { gloss: 'strike', forms: { verb: 'strike', pp: 'struck' } },
  brek: { gloss: 'break', forms: { verb: 'break', pp: 'broken' } },
  ait: { gloss: 'poison', forms: { noun: 'poison', verb: 'poison', pp: 'poisoned' } },
  grim: { gloss: 'fierce, cruel', forms: { adj: 'cruel', adv: 'grimly' } },
  harm: { gloss: 'grief, hurt', forms: { noun: 'grief', verb: 'harm', pp: 'harmed' } },
  kaun: { gloss: 'sore', forms: { noun: 'sore' } },
  hagl: { gloss: 'hail', forms: { noun: 'hail' } },
  // summoning
  lath: { gloss: 'summon, invite', forms: { verb: 'summon' } },
  kall: { gloss: 'call', forms: { verb: 'call' } },
  bud: { gloss: 'bid', forms: { verb: 'bid' } },
  hait: { gloss: 'command by name', forms: { verb: 'command' } },
  wek: { gloss: 'wake', forms: { verb: 'wake' } },
  gal: { gloss: 'chant, crow', forms: { verb: 'chant' } },
  sok: { gloss: 'seek', forms: { verb: 'seek' } },
  kum: { gloss: 'come', forms: { verb: 'come' } },
  lok: { gloss: 'lure', forms: { verb: 'lure' } },
  stefn: { gloss: 'voice-summons', forms: { noun: 'voice-summons', verb: 'call forth' } },
  ur: { gloss: 'primal beast', forms: { noun: 'primal beast' } },
  ans: { gloss: 'god', forms: { noun: 'god' } },
  ehw: { gloss: 'horse', forms: { noun: 'horse' } },
  ingw: { gloss: 'the god Ing', forms: { noun: 'god Ing' } },
  // hidden
  run: { gloss: 'secret', forms: { noun: 'secret' } },
  laun: { gloss: 'concealment', forms: { noun: 'concealment' } },
  hel: { gloss: 'hide', forms: {} },
  hul: { gloss: 'cover', forms: {} },
  dul: { gloss: 'veiled thing', forms: { noun: 'veiled thing' } },
  mirk: { gloss: 'murk', forms: { noun: 'murk', adv: 'darkly' } },
  felh: { gloss: 'commit to hiding', forms: {} },
  grub: { gloss: 'dig hidden', forms: {} },
  huld: { gloss: 'the hidden one', forms: { noun: 'hidden one' } },
  swik: { gloss: 'deceit', forms: { noun: 'deceit' } },
  feh: { gloss: 'hoarded wealth', forms: { noun: 'hoarded wealth' } },
  perth: { gloss: 'lot-cup', forms: { noun: 'lot-cup' } },
  // binding
  bind: { gloss: 'bind', forms: { verb: 'bind', pp: 'bound' } },
  band: { gloss: 'bond', forms: { noun: 'bond' } },
  haft: { gloss: 'fetter-hold', forms: { noun: 'fetter-hold', verb: 'fetter' } },
  fetur: { gloss: 'shackle', forms: { noun: 'shackle', verb: 'shackle' } },
  knut: { gloss: 'knot', forms: { noun: 'knot', verb: 'knot' } },
  wrid: { gloss: 'twist, writhe', forms: { verb: 'twist' } },
  spann: { gloss: 'clasp', forms: { verb: 'clasp' } },
  tug: { gloss: 'rope', forms: { noun: 'rope' } },
  hald: { gloss: 'hold', forms: { verb: 'hold', pp: 'held' } },
  luk: { gloss: 'lock shut', forms: { verb: 'lock', pp: 'locked' } },
  geb: { gloss: 'binding gift', forms: { noun: 'binding gift' } },
  naud: { gloss: 'need-fetter', forms: { noun: 'need-fetter' } },
  is: { gloss: 'ice', forms: { noun: 'ice' } },
  // fire
  fur: { gloss: 'fire', forms: { noun: 'fire' } },
  brand: { gloss: 'burning brand', forms: { noun: 'burning brand' } },
  log: { gloss: 'flame', forms: { noun: 'flame' } },
  eim: { gloss: 'fire-reek', forms: { noun: 'fire-reek' } },
  glod: { gloss: 'ember', forms: { noun: 'ember' } },
  brin: { gloss: 'burn', forms: {} },
  tand: { gloss: 'kindled fire', forms: { noun: 'kindled fire' } },
  swid: { gloss: 'singe', forms: {} },
  funk: { gloss: 'spark', forms: { noun: 'spark' } },
  bael: { gloss: 'pyre', forms: { noun: 'pyre' } },
  sowil: { gloss: 'sun', forms: { noun: 'sun' } },
  // night
  naht: { gloss: 'night', forms: { noun: 'night' } },
  derk: { gloss: 'dark', forms: { adj: 'dark' } },
  skad: { gloss: 'shadow', forms: { noun: 'shadow' } },
  kweld: { gloss: 'evening', forms: { noun: 'evening' } },
  swart: { gloss: 'black', forms: { adj: 'black' } },
  dim: { gloss: 'dim', forms: { adj: 'dim', adv: 'dimly' } },
  mena: { gloss: 'moon', forms: { noun: 'moon' } },
  rok: { gloss: 'twilight', forms: { noun: 'twilight' } },
  hrim: { gloss: 'hoarfrost', forms: { noun: 'hoarfrost' } },
  draum: { gloss: 'dream', forms: { noun: 'dream' } },
  // death
  dauth: { gloss: 'death', forms: { noun: 'death' } },
  wal: { gloss: 'the slain', forms: { noun: 'slain' } },
  faig: { gloss: 'doomed', forms: { adj: 'doomed' } },
  grab: { gloss: 'grave', forms: { noun: 'grave' } },
  ban: { gloss: 'bane, slayer', forms: { noun: 'bane' } },
  lik: { gloss: 'corpse', forms: { noun: 'corpse' } },
  mold: { gloss: 'grave-earth', forms: { noun: 'grave-earth' } },
  draug: { gloss: 'walker-again', forms: { noun: 'walker-again' } },
  swelt: { gloss: 'die', forms: { verb: 'die' } },
  naw: { gloss: 'the dead', forms: { noun: 'dead one' } },
  thurs: { gloss: 'hostile wight', forms: { noun: 'hostile wight' } },
  iw: { gloss: 'yew', forms: { noun: 'yew' } },
  mann: { gloss: 'mortal man', forms: { noun: 'mortal man' } },
  // gates
  dur: { gloss: 'door', forms: { noun: 'door' } },
  gat: { gloss: 'opening', forms: { noun: 'opening' } },
  hlid: { gloss: 'gate', forms: { noun: 'gate' } },
  grind: { gloss: 'gate-lattice', forms: { noun: 'gate-lattice' } },
  brug: { gloss: 'bridge', forms: { noun: 'bridge' } },
  munth: { gloss: 'mouth, entry', forms: { noun: 'mouth' } },
  stig: { gloss: 'path', forms: { noun: 'path' } },
  weg: { gloss: 'way', forms: { noun: 'way' } },
  bor: { gloss: 'bored passage', forms: { noun: 'bored passage' } },
  gap: { gloss: 'gap, chasm', forms: { noun: 'chasm' } },
  raid: { gloss: 'ride, journey', forms: { noun: 'journey' } },
  // time
  tid: { gloss: 'time, tide', forms: { noun: 'tide of time' } },
  stund: { gloss: 'hour, while', forms: { noun: 'hour' } },
  sumar: { gloss: 'summer, bright season', forms: { noun: 'summer' } },
  ald: { gloss: 'age', forms: { noun: 'age' } },
  wurd: { gloss: 'woven fate', forms: { noun: 'woven fate' } },
  skap: { gloss: 'shaped destiny', forms: { noun: 'shaped destiny' } },
  morgan: { gloss: 'morrow', forms: { noun: 'morrow' } },
  aband: { gloss: 'evening of days', forms: { noun: 'evening of days' } },
  aiw: { gloss: 'eternity', forms: { noun: 'eternity' } },
  forn: { gloss: 'ancient time', forms: { noun: 'ancient time' } },
  dag: { gloss: 'day', forms: { noun: 'day' } },
  jer: { gloss: 'harvest-year', forms: { noun: 'harvest-year' } },
  // sight
  seh: { gloss: 'see', forms: { verb: 'see' } },
  spah: { gloss: 'foresee, prophesy', forms: { noun: 'seer', verb: 'foresee' } },
  skaw: { gloss: 'behold, gaze on', forms: { noun: 'watcher', verb: 'behold' } },
  wit: { gloss: 'know, be aware of', forms: { noun: 'knower', verb: 'know' } },
  witag: { gloss: 'the knowing one', forms: { noun: 'prophet' } },
  aug: { gloss: 'eye', forms: { noun: 'eye' } },
  birt: { gloss: 'make bright, bring to light', forms: { verb: 'bring to light', adj: 'bright' } },
  bar: { gloss: 'lay bare, uncover', forms: { verb: 'lay bare', adj: 'bare' } },
  kuth: { gloss: 'make known', forms: { verb: 'make known', adj: 'manifest' } },
  glog: { gloss: 'clear-sighted', forms: { adj: 'clear', adv: 'clearly' } },
  // fate
  urlag: { gloss: 'fate laid down', forms: { noun: 'fate laid down' } },
  hlaut: { gloss: 'the lot fallen', forms: { noun: 'fallen lot' } },
  dom: { gloss: 'doom, judgment', forms: { noun: 'doom' } },
  skuld: { gloss: 'what shall be', forms: { noun: 'thing that shall be' } },
  norn: { gloss: 'fate-woman', forms: { noun: 'fate-woman' } },
  metud: { gloss: 'the measurer', forms: { noun: 'measurer' } },
  hail: { gloss: 'good hap', forms: { noun: 'good hap', adj: 'whole' } },
  end: { gloss: 'appointed end', forms: { noun: 'appointed end' } },
  thrad: { gloss: 'spun thread', forms: { noun: 'spun thread' } },
  wis: { gloss: 'certain, fated', forms: { adj: 'certain', adv: 'surely' } },
  // signs
  tein: { gloss: 'lot-stave', forms: { noun: 'lot-stave' } },
  taik: { gloss: 'token', forms: { noun: 'token' } },
  mark: { gloss: 'mark cut in', forms: { noun: 'mark' } },
  bauk: { gloss: 'beacon', forms: { noun: 'beacon' } },
  fugl: { gloss: 'bird', forms: { noun: 'bird' } },
  hraf: { gloss: 'raven', forms: { noun: 'raven' } },
  spor: { gloss: 'trace', forms: { noun: 'trace' } },
  frag: { gloss: 'question', forms: { noun: 'question' } },
  andswar: { gloss: 'answer', forms: { noun: 'answer' } },
  rist: { gloss: 'cut line', forms: { noun: 'cut line' } },
  // course
  far: { gloss: 'cross, travel', forms: { verb: 'cross' } },
  wend: { gloss: 'turn back', forms: { noun: 'turning', verb: 'turn back' } },
  skund: { gloss: 'hasten', forms: { verb: 'hasten' } },
  lat: { gloss: 'slow', forms: { verb: 'slow', adj: 'late' } },
  stand: { gloss: 'halt, stand fast', forms: { verb: 'halt' } },
  hef: { gloss: 'lift out', forms: { verb: 'lift out' } },
  gang: { gloss: 'going, course', forms: { noun: 'course' } },
  stap: { gloss: 'step', forms: { noun: 'step' } },
  rath: { gloss: 'swift', forms: { adj: 'swift', adv: 'swiftly' } },
  niw: { gloss: 'renew', forms: { verb: 'renew', adj: 'new' } },
};

const powers: GlossTable = {
  // Bright power words (spec 2.7).
  alu: 'Alu, the warding cry.',
  laukaz: 'Laukaz, the leek of vitality.',
  lathu: 'Lathu, the summons.',
  auja: 'Auja, the luck word.',
  ota: 'Ota, the companion cry.',
  gagaga: 'Gagaga, the spear chant.',
  tuwatuwa: 'Tuwatuwa, the chant of the bracteates.',
  // Dread epithets (spec 2.10).
  thruznaz: 'the gnawer beneath',
  gulzoth: 'the maw of the dark',
  wuzgrim: 'the cold that creeps',
  skulthogn: 'the shadow that waits',
  hruzbanaz: 'the bane from below',
  nuthkolaz: 'the cold beyond the stars',
  zguwald: 'the wielder in the void',
  muznaht: 'the night that hungers',
  thulgzar: 'the sleeper under the gates',
  kruthmol: 'the grinder of ages',
};

const idioms: GlossTable = {
  RO1: 'Alu!',
  RO2: 'I, the rune-master!',
  RO3_FIRST_AETT: 'The first aett of the futhark!',
  RO3_FULL_ROW: 'The full row of the futhark!',
  RO4: 'I took up three lot-staves.',
  RC1: 'I painted these runes.',
  RC2: 'I made these runes.',
  RC3: 'Alu!',
  RC4: 'I read the runes.',
  ELDRITCH_OPEN_SHORT: 'The first aett, spoken against its order!',
  ELDRITCH_OPEN_FULL: 'The rune row, spoken against its order!',
  ELDRITCH_CLOSE: 'It gnawed the runes.',
};

const seals: GlossTable = {
  3: 'Sealed three times.',
  7: 'Sealed seven times.',
  9: 'Sealed nine times.',
  12: 'Sealed twelve times.',
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

function noun(id: string): string {
  return form(roots, id, 'noun');
}

function agentName(ref: GlossRef): string {
  return ref.kind === 'epithet' ? vocative(lookup(powers, ref.id, 'power')) : noun(ref.id);
}

export const runicGlosses: RunicGlosses = {
  roots,
  powers,
  idioms,
  seals,
  depths,
  directions,

  idiom: (id) => lookup(idioms, id, 'idiom'),
  seal: (count) => lookup(seals, String(count), 'seal'),
  sealDepth: (count) => lookup(depths, String(count), 'depth'),
  direction: (id) => lookup(directions, id, 'direction'),
  sentences: (parts) => parts.join(' '),

  protectionClause: (p: RunicProtection) =>
    `I, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${after(p.adverbRoot === null ? null : form(roots, p.adverbRoot, 'adv'))}` +
    ` against the ${before(p.adjectiveRoot === null ? null : form(roots, p.adjectiveRoot, 'adj'))}` +
    `${noun(p.targetRoot)}.`,

  curseClause: (p: RunicCurse) =>
    `May the ${before(p.adjectiveRoot === null ? null : form(roots, p.adjectiveRoot, 'adj'))}` +
    `${noun(p.targetRoot)} be ` +
    `${before(p.adverbRoot === null ? null : form(roots, p.adverbRoot, 'adv'))}` +
    `${form(roots, p.intentRoot, 'pp')}.`,

  invocationClause: (p: RunicInvocation) =>
    `${p.agents.map((ref) => `O ${agentName(ref)}`).join(', ')}, ` +
    `${form(roots, p.intentRoot, 'verb')}` +
    `${after(p.adverbRoot === null ? null : form(roots, p.adverbRoot, 'adv'))}! ` +
    `${capitalize(p.powerWord)}!`,

  divinationAsk: (p: RunicDivination) =>
    `Does the ${noun(p.agentRoot)} ${form(roots, p.intentRoot, 'verb')}` +
    `${after(p.adverbRoot === null ? null : form(roots, p.adverbRoot, 'adv'))}` +
    ` the ${before(p.adjectiveRoot === null ? null : form(roots, p.adjectiveRoot, 'adj'))}` +
    `${noun(p.targetRoot)}?`,

  divinationSee: (p: RunicDivination) =>
    `I, the ${noun(p.agentRoot)}, ${form(roots, p.intentRoot, 'verb')}` +
    `${after(p.adverbRoot === null ? null : form(roots, p.adverbRoot, 'adv'))}` +
    ` the ${before(p.adjectiveRoot === null ? null : form(roots, p.adjectiveRoot, 'adj'))}` +
    `${noun(p.targetRoot)}.`,

  // English has no performative verb form, so the mood is marked with an
  // adverb: a binding clause that reads like a plain report has lost the
  // school (spec 1.6).
  chronomancyCross: (p: ChronomancyCross) =>
    `${capitalize(form(roots, p.intentRoot, 'verb'))} ${directions[p.direction] ?? ''}` +
    `${after(p.adverbRoot === null ? null : form(roots, p.adverbRoot, 'adv'))}` +
    ` the ${before(p.adjectiveRoot === null ? null : form(roots, p.adjectiveRoot, 'adj'))}` +
    `${noun(p.targetRoot)}!`,

  chronomancyBind: (p: ChronomancyBind) =>
    `I hereby ${form(roots, p.intentRoot, 'verb')}` +
    `${after(p.adverbRoot === null ? null : form(roots, p.adverbRoot, 'adv'))}` +
    ` the ${before(p.adjectiveRoot === null ? null : form(roots, p.adjectiveRoot, 'adj'))}` +
    `${noun(p.targetRoot)}.`,

  returnAnchor: (anchorRoot, genitiveRoot) =>
    `I turn back to the ${noun(anchorRoot)}` +
    `${genitiveRoot === null ? '' : ` of the ${noun(genitiveRoot)}`}.`,

  litanyTriple: (word) => `${capitalize(word)}, spoken three times.`,
  litanyTriangle: (word) => `${capitalize(word)}, shrinking to a single rune.`,

  tierOne: (word, eldritch) => {
    const gloss = lookup(powers, word, 'power');
    return eldritch ? `${capitalize(word)}, ${gloss}.` : gloss;
  },

  tierTwo: (intentRoot, targetRoot) =>
    `${capitalize(form(roots, intentRoot, 'verb'))} the ${noun(targetRoot)}!`,
};
