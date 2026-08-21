// Renders a generated formula into the manifestation well.

import type { FormulaOutput, LanguageId } from '../generator/types.js';

export interface FormulaMeta {
  // Drives the font stack the stylesheet picks per script.
  languageId: LanguageId;
  languageLabel: string;
  schoolLabel: string;
  difficulty: number;
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
// reattach. The reveal and flare then replay from their start.
function replayAnimations(element: HTMLElement): void {
  element.style.animation = 'none';
  void element.offsetWidth;
  element.style.animation = '';
}

export function renderFormula(output: FormulaOutput, meta: FormulaMeta): void {
  const well = document.getElementById('output');
  const glyphLine = document.getElementById('glyph-line');
  if (well === null || glyphLine === null) return;

  const vapor = well.querySelector<HTMLElement>('.glyph-line--vapor');
  const translit = well.querySelector<HTMLElement>('.translit');
  const gloss = well.querySelector<HTMLElement>('.gloss');
  const caption = document.querySelector<HTMLElement>('.print-caption');

  glyphLine.textContent = output.glyphs;
  // The transliteration is the accessible name of the glyph block, since
  // supplementary-plane glyphs read as noise in a screen reader.
  glyphLine.setAttribute('aria-label', output.transliteration);
  // The vapor twin must stay in text sync with the visible line (design 13.2).
  if (vapor !== null) vapor.textContent = output.glyphs;
  if (translit !== null) translit.textContent = output.transliteration;
  if (gloss !== null) gloss.textContent = output.gloss;

  well.dataset.script = meta.languageId;
  well.dataset.size = sizeTier(output.glyphs);

  if (caption !== null) {
    caption.textContent = `${meta.languageLabel} · ${meta.schoolLabel} · Difficulty ${meta.difficulty}`;
  }

  replayAnimations(glyphLine);
  if (translit !== null) replayAnimations(translit);
  if (gloss !== null) replayAnimations(gloss);
}
