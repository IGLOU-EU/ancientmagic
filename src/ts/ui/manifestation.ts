// Renders a generated formula into the manifestation well, and opens the
// panel that holds it.

import type { FormulaOutput, LanguageId } from '../generator/types.js';

export interface FormulaMeta {
  // Drives the font stack the stylesheet picks per script.
  languageId: LanguageId;
  // What the genome writes between its words, handed over by the genome that
  // wrote them: a script's own knowledge is never transcribed up here, so a
  // genome added later is hinted without a line of its own in this layer.
  separators: ReadonlyArray<string>;
  // Text arrives already localized, so this module holds no wording of its own.
  glyphLabel: string;
  printCaption: string;
}

// The glyph run cut after every separator. Joining the pieces gives the input
// back character for character, which is what keeps the copied text, the
// accessible name and the announcement equal to the pipeline's own output.
//
// The cut falls after every separator the caller declares, measured in the
// browser rather than assumed: some separators already offer the line breaker
// an opportunity of their own, where the hint changes nothing, and some offer
// none, where a whole formula wraps as one unbreakable word without it.
export function breakSegments(glyphs: string, separators: ReadonlyArray<string>): string[] {
  const cut = new Set(separators);
  const segments: string[] = [];
  let current = '';
  for (const character of glyphs) {
    current += character;
    if (cut.has(character)) {
      segments.push(current);
      current = '';
    }
  }
  if (current !== '') segments.push(current);
  return segments;
}

// Writes the run with an invisible break opportunity after each separator.
// The hint is a wbr element, which is markup rather than text: it never enters
// textContent, so the copy path hands over the pipeline's exact glyphs and no
// screen reader has anything extra to say. It is the same device the served
// page already uses on its pre-rendered sample.
//
// The line is handed the run already cut, because the same cut is written
// twice, and the run goes in as one replacement, so the tree is disturbed once
// instead of once per piece.
function writeGlyphs(target: HTMLElement, segments: ReadonlyArray<string>): void {
  const run: Array<string | HTMLElement> = [];
  for (const segment of segments) {
    if (run.length > 0) run.push(document.createElement('wbr'));
    run.push(segment);
  }
  target.replaceChildren(...run);
}

// Size tiers by glyph count (design 4.2). Counted in codepoints because
// the seal numerals live outside the basic plane.
function sizeTier(glyphs: string): 'large' | 'medium' | 'small' {
  const count = Array.from(glyphs).length;
  if (count <= 24) return 'large';
  if (count <= 80) return 'medium';
  return 'small';
}

// Standard animation re-trigger: detach the animation, force one reflow,
// reattach. The reveal, the forge and the sparks then replay from their start.
//
// The strike comes down as one: everything is detached, the page is read once,
// everything is put back. A reading of any geometry lays the whole document
// out, so one read settles every detachment written before it, and asking each
// element for its own would only lay the same page out again.
//
// The spark fields of design 13.6 are pseudo-elements, and an inline animation
// set on an element never reaches its ::before, so what is dropped and put
// back for them is the attribute that declares them. It rides the stage rather
// than anything inside the well, which keeps every attribute change out of the
// live region the well announces.
function replayStrike(lines: ReadonlyArray<HTMLElement>, stage: HTMLElement | null): void {
  for (const line of lines) line.style.animation = 'none';
  if (stage !== null) stage.removeAttribute('data-forge');

  void document.documentElement.offsetWidth;

  for (const line of lines) line.style.animation = '';
  if (stage !== null) stage.dataset.forge = 'struck';
}

// The panel the served page keeps hidden. Nothing opens it but a formula, and
// once open it stays: the page holds one from then on.
function revealPanel(): void {
  const section = document.querySelector('.manifestation');
  if (section instanceof HTMLElement) section.hidden = false;
}

export function renderFormula(output: FormulaOutput, meta: FormulaMeta): void {
  // Opened and written in the same breath, so the panel is never on screen
  // holding the served sample: no frame lays it out, no script face is fetched
  // for it, and the well is displayed and true in the same frame.
  revealPanel();

  const well = document.getElementById('output');
  const glyphLine = document.getElementById('glyph-line');
  if (well === null || glyphLine === null) return;

  const stage = document.querySelector<HTMLElement>('.well-stage');
  const vapor = well.querySelector<HTMLElement>('.glyph-line--vapor');
  // The glow layers, which are copies of the line and are struck with it. The
  // vapor twin is not one of them: it breathes on its own clock and a strike
  // that restarted it would make it blink.
  const glows = Array.from(well.querySelectorAll<HTMLElement>('.glyph-glow'));
  const translit = well.querySelector<HTMLElement>('.translit');
  const gloss = well.querySelector<HTMLElement>('.gloss');
  const caption = document.querySelector<HTMLElement>('.print-caption');

  const segments = breakSegments(output.glyphs, meta.separators);

  writeGlyphs(glyphLine, segments);
  // The glyph block is named for what it is, not for what it says: the well is
  // one atomic live region, and naming it with the transliteration made the
  // region announce that same line twice, once here and once below.
  glyphLine.setAttribute('aria-label', meta.glyphLabel);
  // Every copy of the line must stay in text sync with it (design 13.2), and
  // that includes where the line may break, or a copy wraps apart from it.
  for (const copy of [vapor, ...glows]) {
    if (copy !== null) writeGlyphs(copy, segments);
  }
  if (translit !== null) translit.textContent = output.transliteration;
  if (gloss !== null) gloss.textContent = output.gloss;

  well.dataset.script = meta.languageId;
  well.dataset.size = sizeTier(output.glyphs);

  if (caption !== null) caption.textContent = meta.printCaption;

  replayStrike([glyphLine, ...glows, translit, gloss].filter((line) => line !== null), stage);
}
