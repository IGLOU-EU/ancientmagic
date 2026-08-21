import { generate } from './generator/pipeline.js';
import type { School, Settings } from './generator/types.js';
import { renderFormula } from './ui/manifestation.js';

const COPY_HOLD_MS = 1600;

const SCHOOL_LABELS: Record<School, string> = {
  protection: 'Protection',
  curse: 'Curse',
  invocation: 'Invocation',
  eldritch: 'Eldritch',
};

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_ANNOUNCEMENT: Record<CopyState, string> = {
  idle: '',
  copied: 'Copied',
  failed: 'Copy failed',
};

function tierWord(value: number): string {
  if (value <= 2) return 'Whisper';
  if (value <= 5) return 'Rite';
  if (value <= 7) return 'Invocation';
  return 'Great Work';
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

  slider.style.setProperty('--fill-ratio', ratio.toFixed(4));

  if (valueOut !== null) valueOut.textContent = String(value);
  if (tierOut !== null) tierOut.textContent = tierWord(value);

  if (ticks !== null) {
    const marks = ticks.children;
    for (let i = 0; i < marks.length; i += 1) {
      marks[i].classList.toggle('tick--current', i === value - min);
    }
  }
}

function setCopyState(button: HTMLElement, state: CopyState): void {
  button.dataset.state = state;

  // Exactly one label is exposed to assistive technology, the other two stay
  // in the layout only to reserve the button's width.
  button.querySelectorAll<HTMLElement>('.copy-label').forEach((label) => {
    if (label.dataset.label === state) {
      label.removeAttribute('aria-hidden');
    } else {
      label.setAttribute('aria-hidden', 'true');
    }
  });
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
    if (status !== null) status.textContent = COPY_ANNOUNCEMENT[state];
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
  return value in SCHOOL_LABELS;
}

function freshSeed(): number {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}

function readSettings(): Settings {
  const school = document.getElementById('school');
  const difficulty = document.getElementById('difficulty');
  const schoolValue =
    school instanceof HTMLSelectElement && isSchool(school.value)
      ? school.value
      : 'protection';
  const level = difficulty instanceof HTMLInputElement ? Number(difficulty.value) : 5;
  // Only the Runic genome ships in this phase, the other language options
  // stay disabled in the select.
  return { language: 'runic', school: schoolValue, difficulty: level };
}

function conjure(settings: Settings): void {
  const output = generate(settings, freshSeed());
  renderFormula(output, {
    languageLabel: 'Runic',
    schoolLabel: SCHOOL_LABELS[settings.school],
    difficulty: settings.difficulty,
  });
}

function wireGenerator(): void {
  const generateButton = document.getElementById('generate');
  const rerollButton = document.getElementById('reroll');

  // Reroll replays the settings of the last conjuration with a fresh seed.
  // Before any conjuration it reads the altar like Conjure does.
  let lastSettings: Settings | null = null;

  if (generateButton !== null) {
    generateButton.addEventListener('click', () => {
      lastSettings = readSettings();
      conjure(lastSettings);
    });
  }
  if (rerollButton !== null) {
    rerollButton.addEventListener('click', () => {
      conjure(lastSettings ?? readSettings());
    });
  }
}

wireDifficulty();
wireCopy();
wireGenerator();

export {};
