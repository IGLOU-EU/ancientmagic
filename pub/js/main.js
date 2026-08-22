import { generate } from './generator/pipeline.js';
import { resolveStrings } from './strings/index.js';
import { renderFormula } from './ui/manifestation.js';
const COPY_HOLD_MS = 1600;
const strings = resolveStrings(document.documentElement.lang);
const SHIPPED_LANGUAGES = ['runic', 'egyptian', 'phoenician'];
const SHIPPED_SCHOOLS = [
    'protection',
    'curse',
    'invocation',
    'eldritch',
];
function tierWord(value) {
    const tiers = strings.difficultyTiers;
    if (value <= 2)
        return tiers.low;
    if (value <= 5)
        return tiers.mid;
    if (value <= 7)
        return tiers.high;
    return tiers.peak;
}
function optionLabel(selectId, value) {
    const select = document.getElementById(selectId);
    if (!(select instanceof HTMLSelectElement))
        return value;
    const option = select.querySelector(`option[value="${value}"]`);
    return option?.textContent?.trim() ?? value;
}
function syncDifficulty(slider, valueOut, tierOut, ticks) {
    const value = Number(slider.value);
    const min = Number(slider.min);
    const max = Number(slider.max);
    const ratio = max > min ? (value - min) / (max - min) : 0;
    const tier = tierWord(value);
    slider.style.setProperty('--fill-ratio', ratio.toFixed(4));
    slider.setAttribute('aria-valuetext', strings.difficultyValueText(value, tier));
    if (valueOut !== null)
        valueOut.textContent = String(value);
    if (tierOut !== null)
        tierOut.textContent = tier;
    if (ticks !== null) {
        const marks = ticks.children;
        for (let i = 0; i < marks.length; i += 1) {
            marks[i].classList.toggle('tick--current', i === value - min);
        }
    }
}
function setCopyState(button, state) {
    button.dataset.state = state;
}
function copyAnnouncement(button, state) {
    if (state === 'idle')
        return '';
    const label = button.querySelector(`.copy-label[data-label="${state}"]`);
    return label?.textContent?.trim() ?? '';
}
async function writeToClipboard(text) {
    const clipboard = navigator.clipboard;
    if (clipboard === undefined)
        return false;
    try {
        await clipboard.writeText(text);
        return true;
    }
    catch {
        return false;
    }
}
function wireDifficulty() {
    const slider = document.getElementById('difficulty');
    if (!(slider instanceof HTMLInputElement))
        return;
    const valueOut = document.getElementById('difficulty-value');
    const tierOut = document.getElementById('difficulty-tier');
    const ticks = document.getElementById('difficulty-ticks');
    const update = () => syncDifficulty(slider, valueOut, tierOut, ticks);
    update();
    slider.addEventListener('input', update);
}
function wireCopy() {
    const button = document.getElementById('copy');
    const glyphs = document.getElementById('glyph-line');
    const status = document.getElementById('copy-status');
    if (button === null || glyphs === null)
        return;
    let resetTimer = 0;
    const announce = (state) => {
        if (status !== null)
            status.textContent = copyAnnouncement(button, state);
    };
    const finish = (state) => {
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
function isSchool(value) {
    return SHIPPED_SCHOOLS.some((id) => id === value);
}
function isLanguage(value) {
    return SHIPPED_LANGUAGES.some((id) => id === value);
}
function freshSeed() {
    return Math.floor(Math.random() * 4294967296) >>> 0;
}
function readSettings() {
    const language = document.getElementById('language');
    const school = document.getElementById('school');
    const difficulty = document.getElementById('difficulty');
    const languageValue = language instanceof HTMLSelectElement && isLanguage(language.value)
        ? language.value
        : 'runic';
    const schoolValue = school instanceof HTMLSelectElement && isSchool(school.value)
        ? school.value
        : 'protection';
    const level = difficulty instanceof HTMLInputElement ? Number(difficulty.value) : 5;
    return { language: languageValue, school: schoolValue, difficulty: level };
}
function conjure(settings) {
    const output = generate(settings, freshSeed());
    const languageLabel = optionLabel('language', settings.language);
    const schoolLabel = optionLabel('school', settings.school);
    renderFormula(output, {
        languageId: settings.language,
        glyphLabel: strings.glyphLineLabel(languageLabel),
        printCaption: strings.printCaption(languageLabel, schoolLabel, settings.difficulty),
    });
}
function wireGenerator() {
    const generateButton = document.getElementById('generate');
    const rerollButton = document.getElementById('reroll');
    let lastSettings = null;
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
