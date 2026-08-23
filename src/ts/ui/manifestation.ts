// Renders a generated formula into the manifestation well.

import type { FormulaOutput, LanguageId } from '../generator/types.js';

export interface FormulaMeta {
  // Drives the font stack the stylesheet picks per script.
  languageId: LanguageId;
  // Text arrives already localized, so this module holds no wording of its own.
  glyphLabel: string;
  printCaption: string;
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
// reattach. The reveal and the forge then replay from their start.
function replayAnimations(element: HTMLElement): void {
  element.style.animation = 'none';
  void element.offsetWidth;
  element.style.animation = '';
}

// The spark fields of design 13.6 are pseudo-elements, and an inline animation
// set on an element never reaches its ::before, so what is dropped and put
// back for them is the attribute that declares them. It rides the stage rather
// than anything inside the well, which keeps every attribute change out of the
// live region the well announces.
function replaySparks(stage: HTMLElement): void {
  stage.removeAttribute('data-forge');
  void stage.offsetWidth;
  stage.dataset.forge = 'struck';
}

export function renderFormula(output: FormulaOutput, meta: FormulaMeta): void {
  const well = document.getElementById('output');
  const glyphLine = document.getElementById('glyph-line');
  if (well === null || glyphLine === null) return;

  const stage = document.querySelector<HTMLElement>('.well-stage');
  const vapor = well.querySelector<HTMLElement>('.glyph-line--vapor');
  const translit = well.querySelector<HTMLElement>('.translit');
  const gloss = well.querySelector<HTMLElement>('.gloss');
  const caption = document.querySelector<HTMLElement>('.print-caption');

  glyphLine.textContent = output.glyphs;
  // The glyph block is named for what it is, not for what it says: the well is
  // one atomic live region, and naming it with the transliteration made the
  // region announce that same line twice, once here and once below.
  glyphLine.setAttribute('aria-label', meta.glyphLabel);
  // The vapor twin must stay in text sync with the visible line (design 13.2).
  if (vapor !== null) vapor.textContent = output.glyphs;
  if (translit !== null) translit.textContent = output.transliteration;
  if (gloss !== null) gloss.textContent = output.gloss;

  well.dataset.script = meta.languageId;
  well.dataset.size = sizeTier(output.glyphs);

  if (caption !== null) caption.textContent = meta.printCaption;

  replayAnimations(glyphLine);
  if (translit !== null) replayAnimations(translit);
  if (gloss !== null) replayAnimations(gloss);
  if (stage !== null) replaySparks(stage);
}
