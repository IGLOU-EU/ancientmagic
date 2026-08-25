// Renders a generated formula into the manifestation well.

import type { FormulaOutput, LanguageId } from '../generator/types.js';

export interface FormulaMeta {
  // Drives the font stack the stylesheet picks per script.
  languageId: LanguageId;
  // Text arrives already localized, so this module holds no wording of its own.
  glyphLabel: string;
  printCaption: string;
}

// The word separators the shipped genomes write. Measured in the browser
// rather than assumed: the Runic three (᛫ ᛬ ᛭) and the Phoenician 𐤟 already
// offer the line breaker an opportunity of their own, and the Greek ano teleia
// offers none, so a Greek run is one unbreakable word and wraps in the middle
// of it. Egyptian writes continuously and has no separator at all, which is
// the script's own doing and not something to hint around.
//
// The mechanism reads separators, never languages: a hint after one that
// already breaks changes nothing, and a genome added later inherits the
// behaviour by declaring its separator here.
const WORD_SEPARATORS: ReadonlySet<string> = new Set([
  '\u{16EB}',
  '\u{16EC}',
  '\u{16ED}',
  '\u{1091F}',
  '\u{0387}',
]);

// The glyph run cut after every separator. Joining the pieces gives the input
// back character for character, which is what keeps the copied text, the
// accessible name and the announcement equal to the pipeline's own output.
export function breakSegments(glyphs: string): string[] {
  const segments: string[] = [];
  let current = '';
  for (const character of glyphs) {
    current += character;
    if (WORD_SEPARATORS.has(character)) {
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
function writeGlyphs(target: HTMLElement, glyphs: string): void {
  const segments = breakSegments(glyphs);
  target.replaceChildren();
  segments.forEach((segment, index) => {
    target.append(segment);
    if (index < segments.length - 1) target.append(document.createElement('wbr'));
  });
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

  writeGlyphs(glyphLine, output.glyphs);
  // The glyph block is named for what it is, not for what it says: the well is
  // one atomic live region, and naming it with the transliteration made the
  // region announce that same line twice, once here and once below.
  glyphLine.setAttribute('aria-label', meta.glyphLabel);
  // The vapor twin must stay in text sync with the visible line (design 13.2),
  // and that includes where the line may break, or the two wrap apart.
  if (vapor !== null) writeGlyphs(vapor, output.glyphs);
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
