// The seam between the page and its picture. The composition of
// src/html/og-image.html is shot on its own in a headless browser and carries
// no stylesheet, so it draws the site atmosphere again in inline CSS. What it
// draws is derived here rather than trusted: every shared rule must be the
// stylesheet's rule with a declared list of retunes applied, so a value that
// moves on one side and not on the other fails with the value named.
//
// The stylesheet is read compiled, as a browser gets it, because Sass
// functions, lists and mixins have no textual form a rule can be compared
// against. pub/css/main.css is versioned beside the pages it serves, so it is
// the stylesheet of the site as shipped.

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../tools/sources.js';

function read(...parts: string[]): string {
  return readFileSync(join(REPO_ROOT, ...parts), 'utf8');
}

const SITE = read('pub', 'css', 'main.css');
const COMPOSITION = read('src', 'html', 'og-image.html');
// Comments out: a rule is found by what precedes its brace, and the
// composition is commented where the stylesheet, minified, is not.
const OG = (/<style>(.*?)<\/style>/s.exec(COMPOSITION)?.[1] ?? '').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

// ------------------------------------------------------------------ reading

// Whitespace and the shape of a number are the author's, not the value's: the
// stylesheet is written by Sass and the composition by hand, and they disagree
// on both. Everything else is compared as written.
function normalize(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*([:;,])\s*/g, '$1')
    .replace(/(^|[^\w.])0\.(\d)/g, '$1.$2')
    .replace(/;$/, '')
    .trim();
}

// Every body declared for one selector, in the order the sheet declares them.
// A rest state written under a media query is a second body for the same
// selector, which is why the caller can ask for a later one.
function bodies(css: string, selector: string): string[] {
  return Array.from(css.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter((match) => match[1].trim() === selector)
    .map((match) => normalize(match[2]));
}

function rule(css: string, selector: string, index = 0): string {
  const found = bodies(css, selector);
  assert.ok(found.length > index, `no rule ${index} for ${selector}`);
  return found[index] ?? '';
}

// The colours the composition names for itself, so a rule of its own reads the
// way the stylesheet's does once the names are spent.
function palette(): Map<string, string> {
  const declared = new Map<string, string>();
  for (const [, name, value] of rule(OG, ':root').matchAll(/(--[\w-]+):([^;]+)/g)) {
    declared.set(name ?? '', (value ?? '').trim());
  }
  return declared;
}

function ogRule(selector: string): string {
  const named = palette();
  return rule(OG, selector).replace(
    /var\((--[\w-]+)\)/g,
    (whole, name: string) => named.get(name) ?? whole,
  );
}

// Split so a failure points at the one declaration that moved instead of at a
// wall of gradients.
function declarations(body: string): string[] {
  return body.split(';').filter((declaration) => declaration !== '');
}

function value(body: string, property: string): string {
  const found = declarations(body).find((declaration) =>
    declaration.startsWith(`${property}:`),
  );
  assert.ok(found !== undefined, `no ${property} in ${body}`);
  return (found ?? '').slice(property.length + 1);
}

// ----------------------------------------------------------------- the palette
// The composition names the palette in its own words, because a fixed frame
// has no light mode, no print sheet and no state to switch. Each name answers
// to the token it borrows.

const PALETTE: Readonly<Record<string, string>> = {
  '--ink': 'void',
  '--ink-deep': 'abyss',
  '--gold': 'gold',
  '--gold-hi': 'gold-pale',
  '--gold-lo': 'gold-deep',
  '--violet-soft': 'control-border',
  '--lilac-text': 'text-secondary',
  '--paper': 'text-primary',
};

// A mask states an opacity in the shape of a colour. It paints nothing, so it
// answers to no token.
const MASK_STENCIL = '#000';

function tokens(): Map<string, string> {
  const declared = new Map<string, string>();
  for (const [, name, hex] of read('src', 'scss', '_tokens.scss').matchAll(
    /^\$([\w-]+): *(#[0-9a-fA-F]{6});/gm,
  )) {
    declared.set(name ?? '', (hex ?? '').toLowerCase());
  }
  return declared;
}

// Both notations the composition writes, brought to the one the tokens use.
function hex(colour: string): string {
  const channels = /^rgba?\((\d+),(\d+),(\d+)/.exec(colour);
  if (channels === null) return colour.toLowerCase();
  return `#${channels.slice(1, 4).map((c) => Number(c).toString(16).padStart(2, '0')).join('')}`;
}

test('og palette: every colour the composition names is a token of the site', () => {
  assert.deepStrictEqual(Array.from(palette().keys()).sort(), Object.keys(PALETTE).sort());
});

test('og palette: each name carries the colour its token declares', () => {
  const declared = tokens();
  for (const [name, tokenName] of Object.entries(PALETTE)) {
    assert.strictEqual(
      palette().get(name)?.toLowerCase(),
      declared.get(tokenName),
      `${name} no longer carries $${tokenName}`,
    );
  }
});

// The named palette covers what the composition says out loud. The rest of its
// colours are written channel by channel inside gradients, where a name cannot
// go, and this is what holds those: a colour the token sheet does not declare
// is a colour that drifted.
test('og palette: the composition paints in no colour the token sheet lacks', () => {
  const declared = new Set(tokens().values());
  for (const [colour] of normalize(OG).matchAll(/#[0-9a-fA-F]{3,6}\b|rgba?\([\d,.]+\)/g)) {
    if (colour === MASK_STENCIL) continue;
    assert.ok(declared.has(hex(colour)), `${colour} is painted by no token`);
  }
});

// ------------------------------------------------------------- the retunes
// A decision taken for the 1200x630 frame, and every value it moves. The left
// side of a move is what the stylesheet writes today: it is looked for there
// before anything is compared, so the day the stylesheet stops writing it the
// decision comes back on the table instead of drifting out of reach.

type Retune = {
  readonly decision: string;
  readonly moves: ReadonlyArray<readonly [string, string]>;
};

function escape(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function retuned(body: string, retunes: readonly Retune[]): string {
  const moves = new Map<string, string>();
  for (const retune of retunes) {
    for (const [from, to] of retune.moves) {
      assert.ok(body.includes(from), `the stylesheet no longer writes ${from}: ${retune.decision}`);
      moves.set(from, to);
    }
  }

  // One pass, longest first, so no move can land on what another just wrote
  // and the list stays a set of decisions rather than a sequence.
  const pattern = Array.from(moves.keys())
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|');
  return body.replace(new RegExp(pattern, 'g'), (found) => moves.get(found) ?? found);
}

function holds(title: string, selector: string, retunes: readonly Retune[]): void {
  test(`og ${title}: the composition draws what the stylesheet draws, retuned`, () => {
    assert.deepStrictEqual(
      declarations(ogRule(selector)),
      declarations(retuned(rule(SITE, selector), retunes)),
    );
  });
}

// Nothing scrolls under a picture and nothing is layered below it, so the two
// atmosphere layers are ordinary layers of the composition.
const ON_THE_CANVAS: Retune = {
  decision: 'the atmosphere sits in the picture, not behind a scrolling page',
  moves: [['position:fixed;z-index:-1', 'position:absolute;z-index:0']],
};

// A dot that survives on screen is lost once the picture is quantized to 256
// colours and shown at the size a timeline gives it, so every dot is grown a
// notch and the faint tiers are lifted with it. Each field states the rungs of
// the ladder it uses, the two fields not carrying the same star sizes.
const SURVIVING_DOTS = 'a star has to come through the 256-colour palette';

holds('starfield', 'body::before', [
  ON_THE_CANVAS,
  {
    decision: 'a frame twice as wide as it is tall needs the vignette closed earlier and harder',
    moves: [
      [
        'farthest-corner at 50% 38%,rgba(7,4,14,0) 0,rgba(7,4,14,0) 45%,rgba(7,4,14,.35) 75%,rgba(7,4,14,.85) 100%',
        'farthest-corner at 50% 46%,rgba(7,4,14,0) 0,rgba(7,4,14,0) 30%,rgba(7,4,14,.55) 68%,rgba(7,4,14,.96) 100%',
      ],
    ],
  },
  {
    decision: SURVIVING_DOTS,
    moves: [
      ['circle 1.5px', 'circle 1.6px'],
      ['circle 1px', 'circle 1.1px'],
      ['circle .5px', 'circle .6px'],
      ['rgba(239,233,251,.35)', 'rgba(239,233,251,.42)'],
      ['rgba(201,184,240,.22)', 'rgba(201,184,240,.28)'],
    ],
  },
  {
    decision: 'the three washes are laid out again for a frame with no page above or below it',
    moves: [
      [
        'ellipse 30% 22.5% at 50% 96%,rgba(42,30,94,.45) 0,rgba(42,30,94,.18) 55%',
        'ellipse 40% 34% at 50% 104%,rgba(42,30,94,.34) 0,rgba(42,30,94,.12) 55%',
      ],
      [
        'ellipse 42.5% 30% at 88% 42%,rgba(92,60,163,.3) 0,rgba(92,60,163,.12) 55%',
        'ellipse 34% 40% at 100% 52%,rgba(92,60,163,.18) 0,rgba(92,60,163,.06) 55%',
      ],
      [
        'ellipse 35% 27.5% at 18% 12%,rgba(74,47,134,.38) 0,rgba(74,47,134,.16) 55%',
        'ellipse 32% 40% at 2% 22%,rgba(74,47,134,.24) 0,rgba(74,47,134,.08) 55%',
      ],
    ],
  },
]);

holds('milky way', 'body::after', [
  ON_THE_CANVAS,
  {
    decision: SURVIVING_DOTS,
    moves: [
      ['circle 1.5px', 'circle 1.6px'],
      ['circle 1.25px', 'circle 1.3px'],
      ['circle 1px', 'circle 1.1px'],
      ['circle .75px', 'circle .8px'],
    ],
  },
  {
    decision:
      'the haze comes down a notch everywhere, so nothing soft competes with ' +
      'the glyph glow',
    moves: [
      ['rgba(92,60,163,.4)', 'rgba(92,60,163,.34)'],
      ['rgba(201,184,240,.25)', 'rgba(201,184,240,.2)'],
      ['rgba(201,184,240,.09)', 'rgba(201,184,240,.08)'],
      ['rgba(201,184,240,.1)', 'rgba(201,184,240,.09)'],
      ['rgba(201,184,240,.08)', 'rgba(201,184,240,.06)'],
      ['rgba(201,184,240,.03)', 'rgba(201,184,240,.02)'],
    ],
  },
]);

holds('sigil band', '.sigil-band', [
  {
    decision:
      'the band is placed on the frame instead of flowing in a column, and a ' +
      'frame this short carries a thinner rule',
    moves: [
      [
        'height:14px;margin-block:var(--sp-band)',
        'position:relative;z-index:2;width:880px;height:12px;margin:34px 0 0',
      ],
    ],
  },
  {
    decision:
      'both hatchings are opened out and dimmed, a lattice this tight reading ' +
      'as grey at the size a timeline shows',
    moves: [
      [
        'rgba(232,196,106,.35) 0 1px,transparent 1px 23px',
        'rgba(232,196,106,.24) 0 1px,transparent 1px 30px',
      ],
      [
        'rgba(123,98,190,.45) 0 2px,transparent 2px 12px',
        'rgba(123,98,190,.26) 0 1px,transparent 1px 15px',
      ],
    ],
  },
]);

holds('circle bloom', '.mc-bloom', [
  {
    decision: 'one frame is shot, so nothing on it moves',
    moves: [[';animation:am-bloom 9s cubic-bezier(.33,1,.68,1) infinite alternate', '']],
  },
]);

holds('circle rings', '.mc-rings', [
  {
    decision: 'the inner ring runs right under the wordmark here, so it is taken down',
    moves: [['rgba(232,196,106,.18)', 'rgba(232,196,106,.14)']],
  },
]);

holds('circle ticks', '.mc-ticks', [
  {
    decision: 'one frame is shot, held at the angle the still page rests the ticks on',
    moves: [['animation:am-spin-ccw 160s linear infinite', 'rotate:8deg']],
  },
  {
    decision: 'the ticks come down with the ring they ride',
    moves: [['rgba(232,196,106,.18)', 'rgba(232,196,106,.16)']],
  },
]);

holds('circle spokes', '.mc-spokes', [
  {
    decision: 'one frame is shot, so nothing on it moves',
    moves: [[';animation:am-spin-cw 240s linear infinite', '']],
  },
  {
    decision:
      'hair-thin violet rays, gold being spent on the wordmark and the runes ' +
      'alone, and 3deg rays closing into a disc at this size',
    moves: [
      [
        'repeating-conic-gradient(from 0deg,rgba(232,196,106,.26) 0deg 3deg,transparent 3deg 15deg)',
        'repeating-conic-gradient(from 0deg,rgba(123,98,190,.34) 0deg .9deg,transparent .9deg 15deg)',
      ],
    ],
  },
  {
    decision:
      'the rays are given a wider band to cross, the circle being larger than ' +
      'the frame is tall',
    moves: [
      [
        'transparent 0 42%,#000 44% 48%,transparent 50%',
        'transparent 0 36%,#000 40% 47%,transparent 50%',
      ],
    ],
  },
]);

// ------------------------------------------------------------- the circle box
// Where the circle sits is the composition's own business: a page centres it on
// a column of unknown height, a picture pins it to a point of a fixed frame.
// Its diameter is not, and neither is the stack its layers make.

test('og magic circle: the circle is drawn at the size the desktop page draws it', () => {
  const cap = /--mc-size: *min\([^,]+, *(\d+px)\)/.exec(read('src', 'scss', '_base.scss'));
  assert.ok(cap !== null, 'the page no longer caps the circle');
  assert.strictEqual(value(ogRule('.circle'), 'width'), cap?.[1]);
});

test('og magic circle: the layers stack the way the page stacks them', () => {
  assert.strictEqual(ogRule('.circle>span'), rule(SITE, '.magic-circle>span'));
});

// The picture is a still frame and the page has one of its own, the rule that
// answers a reader who asked for no motion. The tick ring is frozen at the
// angle that rest state gives it, read from there rather than chosen here.
test('og magic circle: the ticks rest at the angle the still page gives them', () => {
  assert.strictEqual(
    value(ogRule('.mc-ticks'), 'rotate'),
    value(rule(SITE, '.mc-ticks', 1), 'rotate'),
  );
});
