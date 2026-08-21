const COPY_HOLD_MS = 1600;

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

wireDifficulty();
wireCopy();

export {};
