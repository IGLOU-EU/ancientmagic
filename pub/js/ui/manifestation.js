function sizeTier(glyphs) {
    const count = Array.from(glyphs).length;
    if (count <= 24)
        return 'large';
    if (count <= 80)
        return 'medium';
    return 'small';
}
function replayAnimations(element) {
    element.style.animation = 'none';
    void element.offsetWidth;
    element.style.animation = '';
}
export function renderFormula(output, meta) {
    const well = document.getElementById('output');
    const glyphLine = document.getElementById('glyph-line');
    if (well === null || glyphLine === null)
        return;
    const vapor = well.querySelector('.glyph-line--vapor');
    const translit = well.querySelector('.translit');
    const gloss = well.querySelector('.gloss');
    const caption = document.querySelector('.print-caption');
    glyphLine.textContent = output.glyphs;
    glyphLine.setAttribute('aria-label', `Incantation in ${meta.languageLabel}`);
    if (vapor !== null)
        vapor.textContent = output.glyphs;
    if (translit !== null)
        translit.textContent = output.transliteration;
    if (gloss !== null)
        gloss.textContent = output.gloss;
    well.dataset.script = meta.languageId;
    well.dataset.size = sizeTier(output.glyphs);
    if (caption !== null) {
        caption.textContent = `${meta.languageLabel} · ${meta.schoolLabel} · Difficulty ${meta.difficulty}`;
    }
    replayAnimations(glyphLine);
    if (translit !== null)
        replayAnimations(translit);
    if (gloss !== null)
        replayAnimations(gloss);
}
