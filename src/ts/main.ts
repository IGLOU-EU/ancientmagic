import type { FormulaOutput, LanguageId, School, Settings } from './generator/types.js';
import type { SharedFormula } from './share.js';
import { difficultyTier, resolveStrings } from './strings/index.js';
import { renderFormula } from './ui/manifestation.js';

const COPY_HOLD_MS = 1600;

// One static page per language, so the page itself says which one it is. The
// same declaration picks the UI strings and the glosses the generator writes.
const language = document.documentElement.lang;
const strings = await resolveStrings(language);

type CopyState = 'idle' | 'copied' | 'failed';

// The page already displays every option name, so reading it back keeps one
// source per name instead of a second copy in the strings module.
function optionLabel(selectId: string, value: string): string {
  const select = document.getElementById(selectId);
  if (!(select instanceof HTMLSelectElement)) return value;
  const option = select.querySelector(`option[value="${value}"]`);
  return option?.textContent?.trim() ?? value;
}

function syncDifficulty(
  slider: HTMLInputElement,
  valueOut: Element | null,
  tierOut: Element | null,
  ticks: Element | null,
): void {
  const value = Number(slider.value);
  const min = Number(slider.min);
  const max = Number(slider.max);
  const ratio = max > min ? (value - min) / (max - min) : 0;
  const tier = difficultyTier(strings, value);

  slider.style.setProperty('--fill-ratio', ratio.toFixed(4));

  // The tier is part of the value, not a description of the control: a
  // description is spoken once on focus, so it would go stale as soon as the
  // reader moved the slider across a tier boundary.
  slider.setAttribute('aria-valuetext', strings.difficultyValueText(value, tier));

  if (valueOut !== null) valueOut.textContent = String(value);
  if (tierOut !== null) tierOut.textContent = tier;

  if (ticks !== null) {
    const marks = ticks.children;
    for (let i = 0; i < marks.length; i += 1) {
      marks[i].classList.toggle('tick--current', i === value - min);
    }
  }
}

// Only the visual state moves. "Copied" and "Copy failed" are outcomes, not
// labels of the control, so they stay out of the accessible name and are
// spoken once by the status region instead. Swapping the name here would name
// the button after its outcome, cost speech-input users their spoken target,
// and make every reader that reports a name change say the word twice.
function setCopyState(button: HTMLElement, state: CopyState): void {
  button.dataset.state = state;
}

// The outcome words are the button's own labels, so the status region borrows
// them rather than holding a second wording that could drift.
function copyAnnouncement(button: HTMLElement, state: CopyState): string {
  if (state === 'idle') return '';
  const label = button.querySelector(`.copy-label[data-label="${state}"]`);
  return label?.textContent?.trim() ?? '';
}

async function writeToClipboard(text: string): Promise<boolean> {
  // Absent on insecure origins, including a page opened from the filesystem.
  const clipboard: Clipboard | undefined = navigator.clipboard;
  if (clipboard === undefined) return false;

  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Hands back the readout sync, because the slider is moved from two places:
// by the reader, and by a link that already names a level of power.
function wireDifficulty(): () => void {
  const slider = document.getElementById('difficulty');
  if (!(slider instanceof HTMLInputElement)) return () => undefined;

  const valueOut = document.getElementById('difficulty-value');
  const tierOut = document.getElementById('difficulty-tier');
  const ticks = document.getElementById('difficulty-ticks');

  const update = (): void => syncDifficulty(slider, valueOut, tierOut, ticks);

  update();
  slider.addEventListener('input', update);
  return update;
}

function wireCopy(): void {
  const button = document.getElementById('copy');
  const glyphs = document.getElementById('glyph-line');
  const status = document.getElementById('copy-status');
  if (button === null || glyphs === null) return;

  let resetTimer = 0;

  const announce = (state: CopyState): void => {
    if (status !== null) status.textContent = copyAnnouncement(button, state);
  };

  const finish = (state: CopyState): void => {
    setCopyState(button, state);
    announce(state);

    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      setCopyState(button, 'idle');
      announce('idle');
    }, COPY_HOLD_MS);
  };

  button.addEventListener('click', () => {
    void writeToClipboard(glyphs.textContent ?? '').then((ok) => {
      finish(ok ? 'copied' : 'failed');
    });
  });
}

// What the altar offers is what the page already says it offers: one option
// per id the site carries, the ones still to come left disabled in the markup.
// So the selection is read off the option itself rather than checked against a
// second list here, which nothing would hold to the first. The build holds the
// options to the sets the generator declares (tests/page-build).
function chosen<T extends string>(selectId: string, fallback: T): T {
  const select = document.getElementById(selectId);
  if (!(select instanceof HTMLSelectElement)) return fallback;
  const option = select.selectedOptions[0];
  if (option === undefined || option.disabled) return fallback;
  return option.value as T;
}

// A seed is an unsigned 32 bit number, which is exactly what this array holds,
// so the width stays the rng's own and is never a second number to keep in step.
function freshSeed(): number {
  const draw = new Uint32Array(1);
  crypto.getRandomValues(draw);
  return draw[0];
}

function readSettings(): Settings {
  const difficulty = document.getElementById('difficulty');
  const level = difficulty instanceof HTMLInputElement ? Number(difficulty.value) : 5;
  return {
    language: chosen<LanguageId>('language', 'runic'),
    school: chosen<School>('school', 'protection'),
    difficulty: level,
  };
}

// The altar is set to what a link names before its formula is written, so the
// dials show what produced what is on screen, and a reroll starts from there.
function applySettings(settings: Settings, syncSlider: () => void): void {
  const language = document.getElementById('language');
  const school = document.getElementById('school');
  const difficulty = document.getElementById('difficulty');

  if (language instanceof HTMLSelectElement) language.value = settings.language;
  if (school instanceof HTMLSelectElement) school.value = settings.school;
  if (difficulty instanceof HTMLInputElement) {
    difficulty.value = String(settings.difficulty);
    syncSlider();
  }
}

// Writes one formula in one script. Nothing the idle page shows needs the
// generator, a genome or a gloss, so none of the three is fetched until a
// conjuration asks for them, and what is fetched then is one pair: the
// selected script, and its wordings in the page's language. The browser's
// module map keeps what it fetched, so conjuring again costs nothing and
// changing script costs that script.
type Conjurer = (settings: Settings, seed: number) => FormulaOutput;

async function loadConjurer(id: LanguageId): Promise<Conjurer> {
  const [pipeline, languages, glosses] = await Promise.all([
    import('./generator/pipeline.js'),
    import('./languages/index.js'),
    import('./glosses/index.js'),
  ]);
  const genome = await languages.loadGenome(id, await glosses.resolveGlosses(language));
  return (settings, seed) => pipeline.generate(genome, settings, seed);
}

// The panel the served page keeps hidden. Nothing opens it but a conjuration,
// and once open it stays: the page holds a formula from then on.
function revealManifestation(): void {
  const section = document.querySelector('.manifestation');
  if (section instanceof HTMLElement) section.hidden = false;
}

// The seed is the caller's: a click draws a fresh one, a link brings its own,
// and everything after this point is the same for both.
async function conjure(settings: Settings, seed: number): Promise<void> {
  // The formula's name is only wanted once a formula exists, so it rides the
  // same wave as the generation code rather than the idle page. The share row
  // rides with it: its links are complete in the served page, and what they
  // are missing until here is a formula to hand over.
  const [write, share, shareLinks] = await Promise.all([
    loadConjurer(settings.language),
    import('./share.js'),
    import('./ui/share-links.js'),
  ]);

  const output = write(settings, seed);
  const languageLabel = optionLabel('language', settings.language);
  const schoolLabel = optionLabel('school', settings.school);

  // Opened and written in the same breath, so the panel is never on screen
  // holding the served sample: no frame lays it out, no script face is fetched
  // for it, and the well is displayed and true in the same frame. A conjuration
  // that never comes back leaves the page as it was served, which is the only
  // honest thing to show when there is no formula.
  revealManifestation();
  renderFormula(output, {
    languageId: settings.language,
    glyphLabel: strings.glyphLineLabel(languageLabel),
    printCaption: strings.printCaption(languageLabel, schoolLabel, settings.difficulty),
  });

  // The formula that was just written, named in the address so it can be
  // handed to someone else. Replaced and never pushed: a conjuration is not a
  // place to go back to, and Back must still leave the page.
  const fragment = share.encode(settings, seed);
  history.replaceState(null, '', `#${fragment}`);

  // The same name, in the links that hand it to someone else's timeline.
  shareLinks.sealShareLinks(fragment);
}

// A page can be opened on a formula. The link names the script, the school,
// the level of power and the seed, which is everything a conjuration takes, so
// arriving on one is not a flow of its own: it is the click's flow with the
// seed already chosen.
//
// The fragment is read only when there is one, so a page opened without it
// fetches nothing here. A fragment that is not a formula is left alone, in
// silence: that page is the page anyone else gets.
async function arrivingFormula(): Promise<SharedFormula | null> {
  if (location.hash.length <= 1) return null;
  const share = await import('./share.js');
  return share.decode(location.hash);
}

function wireGenerator(syncSlider: () => void): void {
  const generateButton = document.getElementById('generate');
  const rerollButton = document.getElementById('reroll');

  // Reroll replays the settings of the last conjuration with a fresh seed.
  // Before any conjuration it reads the altar like Conjure does.
  let lastSettings: Settings | null = null;

  // The well is one atomic live region and the first click has modules to
  // fetch, so an impatient second click would race the first: two formulas
  // written over each other and announced twice. One conjuration at a time,
  // arrivals included.
  let conjuring = false;

  const request = (settings: Settings, seed: number): void => {
    if (conjuring) return;
    conjuring = true;
    lastSettings = settings;
    void conjure(settings, seed).finally(() => {
      conjuring = false;
    });
  };

  if (generateButton !== null) {
    generateButton.addEventListener('click', () => request(readSettings(), freshSeed()));
  }
  if (rerollButton !== null) {
    rerollButton.addEventListener('click', () =>
      request(lastSettings ?? readSettings(), freshSeed()),
    );
  }

  // Through the same guarded path as a click, so a visitor who conjures while
  // the link is on its way is served their own formula and not overruled by
  // it, and a reroll afterwards rerolls what the link named.
  void arrivingFormula().then((formula) => {
    if (formula === null) return;
    applySettings(formula.settings, syncSlider);
    request(formula.settings, formula.seed);
  });
}

wireCopy();
wireGenerator(wireDifficulty());

export {};
