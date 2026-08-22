import type { FormulaOutput, LanguageId, School, Settings } from './generator/types.js';
import { resolveStrings } from './strings/index.js';
import { renderFormula } from './ui/manifestation.js';

const COPY_HOLD_MS = 1600;

// One static page per language, so the page itself says which one it is. The
// same declaration picks the UI strings and the glosses the generator writes.
const language = document.documentElement.lang;
const strings = await resolveStrings(language);

// Only the genomes that ship are selectable, the other options of the selects
// stay disabled in the markup.
const SHIPPED_LANGUAGES: ReadonlyArray<LanguageId> = ['runic', 'egyptian', 'phoenician'];
const SHIPPED_SCHOOLS: ReadonlyArray<School> = [
  'protection',
  'curse',
  'invocation',
  'eldritch',
];

type CopyState = 'idle' | 'copied' | 'failed';

function tierWord(value: number): string {
  const tiers = strings.difficultyTiers;
  if (value <= 2) return tiers.low;
  if (value <= 5) return tiers.mid;
  if (value <= 7) return tiers.high;
  return tiers.peak;
}

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
  const tier = tierWord(value);

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

function wireDifficulty(): void {
  const slider = document.getElementById('difficulty');
  if (!(slider instanceof HTMLInputElement)) return;

  const valueOut = document.getElementById('difficulty-value');
  const tierOut = document.getElementById('difficulty-tier');
  const ticks = document.getElementById('difficulty-ticks');

  const update = (): void => syncDifficulty(slider, valueOut, tierOut, ticks);

  update();
  slider.addEventListener('input', update);
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

function isSchool(value: string): value is School {
  return SHIPPED_SCHOOLS.some((id) => id === value);
}

function isLanguage(value: string): value is LanguageId {
  return SHIPPED_LANGUAGES.some((id) => id === value);
}

function freshSeed(): number {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}

function readSettings(): Settings {
  const language = document.getElementById('language');
  const school = document.getElementById('school');
  const difficulty = document.getElementById('difficulty');
  const languageValue =
    language instanceof HTMLSelectElement && isLanguage(language.value)
      ? language.value
      : 'runic';
  const schoolValue =
    school instanceof HTMLSelectElement && isSchool(school.value)
      ? school.value
      : 'protection';
  const level = difficulty instanceof HTMLInputElement ? Number(difficulty.value) : 5;
  return { language: languageValue, school: schoolValue, difficulty: level };
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

async function conjure(settings: Settings): Promise<void> {
  // The formula's name is only wanted once a formula exists, so it rides the
  // same wave as the generation code rather than the idle page.
  const [write, share] = await Promise.all([
    loadConjurer(settings.language),
    import('./share.js'),
  ]);

  const seed = freshSeed();
  const output = write(settings, seed);
  const languageLabel = optionLabel('language', settings.language);
  const schoolLabel = optionLabel('school', settings.school);
  renderFormula(output, {
    languageId: settings.language,
    glyphLabel: strings.glyphLineLabel(languageLabel),
    printCaption: strings.printCaption(languageLabel, schoolLabel, settings.difficulty),
  });

  // The formula that was just written, named in the address so it can be
  // handed to someone else. Replaced and never pushed: a conjuration is not a
  // place to go back to, and Back must still leave the page.
  history.replaceState(null, '', `#${share.encode(settings, seed)}`);
}

function wireGenerator(): void {
  const generateButton = document.getElementById('generate');
  const rerollButton = document.getElementById('reroll');

  // Reroll replays the settings of the last conjuration with a fresh seed.
  // Before any conjuration it reads the altar like Conjure does.
  let lastSettings: Settings | null = null;

  // The well is one atomic live region and the first click has modules to
  // fetch, so an impatient second click would race the first: two formulas
  // written over each other and announced twice. One conjuration at a time.
  let conjuring = false;

  const request = (settings: Settings): void => {
    if (conjuring) return;
    conjuring = true;
    void conjure(settings).finally(() => {
      conjuring = false;
    });
  };

  if (generateButton !== null) {
    generateButton.addEventListener('click', () => {
      lastSettings = readSettings();
      request(lastSettings);
    });
  }
  if (rerollButton !== null) {
    rerollButton.addEventListener('click', () => {
      request(lastSettings ?? readSettings());
    });
  }
}

wireDifficulty();
wireCopy();
wireGenerator();

export {};
