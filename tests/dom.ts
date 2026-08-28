// A page the interface layer can be run against, built by hand.
//
// The wiring is the part of this codebase no pure function can prove: an
// element found by id, a listener bound to it, an attribute written back. The
// project ships zero test dependency, so rather than a browser engine, what
// stands in here is exactly the handful of members src/ts/main.ts,
// src/ts/ui/manifestation.ts and src/ts/ui/share-links.ts call, and no more:
// anything else is absent, so a call this file does not answer fails on the
// spot instead of returning something plausible.

type Listener = () => void;

// A tag, one class and one attribute equality, which is every selector the
// interface layer writes. A richer one is refused by name rather than quietly
// matching nothing.
const SELECTOR =
  /^(?<tag>[a-z]+)?(?:\.(?<className>[\w-]+))?(?:\[(?<attribute>[\w-]+)="(?<value>[^"]*)"\])?$/u;

interface Selector {
  readonly tag: string | undefined;
  readonly className: string | undefined;
  readonly attribute: string | undefined;
  readonly value: string | undefined;
}

function parseSelector(selector: string): Selector {
  const parts = SELECTOR.exec(selector)?.groups;
  if (parts === undefined) {
    throw new Error(`the page double was asked for the selector ${selector}, which it cannot read`);
  }
  return parts as unknown as Selector;
}

// data-* is one storage in a browser, read either as an attribute or through
// the dataset, and the renderer uses both on the same element.
function attributeName(key: string): string {
  return `data-${key.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}`;
}

function datasetOf(element: FakeElement): Record<string, string> {
  return new Proxy<Record<string, string>>(
    {},
    {
      get: (_target, key) => {
        if (typeof key !== 'string') return undefined;
        return element.getAttribute(attributeName(key)) ?? undefined;
      },
      set: (_target, key, value) => {
        if (typeof key === 'string') element.setAttribute(attributeName(key), String(value));
        return true;
      },
    },
  );
}

class FakeStyle {
  readonly properties = new Map<string, string>();

  // Every value the animation shorthand was written, in order. Re-arming an
  // animation is a pair of writes and nothing else, so the trail they leave is
  // the only place an element being struck is visible from.
  readonly animations: string[] = [];

  get animation(): string {
    return this.animations.at(-1) ?? '';
  }

  set animation(value: string) {
    this.animations.push(value);
  }

  setProperty(name: string, value: string): void {
    this.properties.set(name, value);
  }
}

export class FakeElement {
  readonly attributes = new Map<string, string>();
  readonly classes = new Set<string>();
  readonly style = new FakeStyle();
  readonly dataset: Record<string, string>;
  readonly listeners = new Map<string, Listener[]>();
  nodes: Array<string | FakeElement> = [];
  hidden = false;
  lang = '';
  reads = 0;

  // Read to force a reflow before an animation replays. The number itself is
  // never wanted, so what the page answers is a count of how many times it was
  // asked, which is the cost the reading is done for.
  get offsetWidth(): number {
    this.reads += 1;
    return 0;
  }

  constructor(
    readonly tagName: string,
    attributes: Record<string, string> = {},
    classes: ReadonlyArray<string> = [],
  ) {
    for (const [name, value] of Object.entries(attributes)) this.attributes.set(name, value);
    for (const name of classes) this.classes.add(name);
    this.dataset = datasetOf(this);
  }

  get children(): FakeElement[] {
    return this.nodes.filter((node): node is FakeElement => typeof node !== 'string');
  }

  get classList(): { toggle(name: string, force: boolean): void } {
    return {
      toggle: (name: string, force: boolean): void => {
        if (force) this.classes.add(name);
        else this.classes.delete(name);
      },
    };
  }

  get textContent(): string {
    return this.nodes.map((node) => (typeof node === 'string' ? node : node.textContent)).join('');
  }

  set textContent(text: string) {
    this.nodes = text === '' ? [] : [text];
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  append(...nodes: Array<string | FakeElement>): void {
    this.nodes.push(...nodes);
  }

  replaceChildren(...nodes: Array<string | FakeElement>): void {
    this.nodes = [...nodes];
  }

  addEventListener(type: string, listener: Listener): void {
    const bound = this.listeners.get(type) ?? [];
    bound.push(listener);
    this.listeners.set(type, bound);
  }

  // What a reader does, from the test's side of the page.
  dispatch(type: string): void {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener();
  }

  *descendants(): Generator<FakeElement> {
    for (const node of this.nodes) {
      if (typeof node === 'string') continue;
      yield node;
      yield* node.descendants();
    }
  }

  matches(selector: Selector): boolean {
    if (selector.tag !== undefined && selector.tag !== this.tagName) return false;
    if (selector.className !== undefined && !this.classes.has(selector.className)) return false;
    if (selector.attribute !== undefined) {
      return this.getAttribute(selector.attribute) === selector.value;
    }
    return true;
  }

  querySelector(selector: string): FakeElement | null {
    const wanted = parseSelector(selector);
    for (const element of this.descendants()) {
      if (element.matches(wanted)) return element;
    }
    return null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const wanted = parseSelector(selector);
    return Array.from(this.descendants()).filter((element) => element.matches(wanted));
  }
}

export class FakeInputElement extends FakeElement {
  value = '';
  min = '';
  max = '';

  constructor(attributes: Record<string, string> = {}, classes: ReadonlyArray<string> = []) {
    super('input', attributes, classes);
  }
}

export class FakeOptionElement extends FakeElement {
  disabled = false;

  constructor(value: string, label: string) {
    super('option', { value }, []);
    this.textContent = label;
  }

  get value(): string {
    return this.getAttribute('value') ?? '';
  }
}

export class FakeSelectElement extends FakeElement {
  private selected: FakeOptionElement | null = null;

  constructor(attributes: Record<string, string> = {}, classes: ReadonlyArray<string> = []) {
    super('select', attributes, classes);
  }

  get options(): FakeOptionElement[] {
    return this.children.filter(
      (child): child is FakeOptionElement => child instanceof FakeOptionElement,
    );
  }

  get selectedOptions(): FakeOptionElement[] {
    return this.selected === null ? [] : [this.selected];
  }

  get value(): string {
    return this.selected?.value ?? '';
  }

  set value(wanted: string) {
    this.selected = this.options.find((option) => option.value === wanted) ?? null;
  }
}

class FakeDocument {
  readonly documentElement = new FakeElement('html');

  constructor(lang: string, head: FakeElement, body: FakeElement) {
    this.documentElement.lang = lang;
    this.documentElement.append(head, body);
  }

  getElementById(id: string): FakeElement | null {
    for (const element of this.documentElement.descendants()) {
      if (element.getAttribute('id') === id) return element;
    }
    return null;
  }

  querySelector(selector: string): FakeElement | null {
    return this.documentElement.querySelector(selector);
  }

  querySelectorAll(selector: string): FakeElement[] {
    return this.documentElement.querySelectorAll(selector);
  }

  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName);
  }
}

function option(value: string, label: string, enabled = true): FakeOptionElement {
  const built = new FakeOptionElement(value, label);
  built.disabled = !enabled;
  return built;
}

function select(id: string, options: FakeOptionElement[]): FakeSelectElement {
  const built = new FakeSelectElement({ id });
  built.append(...options);
  built.value = options[0].value;
  return built;
}

function element(
  tagName: string,
  attributes: Record<string, string>,
  classes: ReadonlyArray<string>,
  children: Array<string | FakeElement> = [],
): FakeElement {
  const built = new FakeElement(tagName, attributes, classes);
  built.append(...children);
  return built;
}

export interface PageOptions {
  // What the page declares itself to be, which is what picks the strings.
  readonly lang?: string;
  // What the reader arrived on.
  readonly hash?: string;
  // Absent on a page the build did not address, which is the case the share
  // row has to refuse rather than seal against nothing.
  readonly canonical?: string | null;
  readonly shareLinks?: ReadonlyArray<string>;
}

export interface Page {
  readonly document: FakeDocument;
  // Every address history.replaceState was given, in order.
  readonly written: string[];
  byId(id: string): FakeElement;
  chosen(id: string): string;
  find(selector: string): FakeElement;
  findAll(selector: string): FakeElement[];
  click(id: string): void;
  // What the geometry the page was asked for cost it, counted over the whole
  // document because one read anywhere lays the whole of it out.
  reflows(): number;
}

// The served page, reduced to what the interface layer reaches for: the ids it
// looks up, the classes it queries, the options it reads labels off, and the
// share row it seals. Structure mirrors src/html/index.html.
export function installPage(options: PageOptions = {}): Page {
  const canonical = options.canonical === undefined ? 'https://example.test/' : options.canonical;
  const hrefs = options.shareLinks ?? [
    `https://one.example/post?u=${encodeURIComponent('https://example.test/')}`,
    `https://two.example/send?text=${encodeURIComponent('a word https://example.test/')}`,
  ];

  const head = element('head', {}, []);
  if (canonical !== null) head.append(element('link', { rel: 'canonical', href: canonical }, []));

  const ticks = element(
    'div',
    { id: 'difficulty-ticks' },
    ['ticks'],
    Array.from({ length: 9 }, (_unused, index) =>
      element('span', {}, index === 4 ? ['tick', 'tick--current'] : ['tick']),
    ),
  );

  const slider = new FakeInputElement({ id: 'difficulty', type: 'range' }, ['slider']);
  slider.value = '5';
  slider.min = '1';
  slider.max = '9';

  const altar = element('section', {}, ['altar'], [
    select('language', [
      option('runic', 'Runic'),
      option('egyptian', 'Egyptian'),
      option('phoenician', 'Phoenician'),
      option('greek', 'Greek'),
      option('ogham', 'Ogham', false),
    ]),
    select('school', [
      option('protection', 'Protection'),
      option('curse', 'Curse'),
      option('invocation', 'Invocation'),
      option('eldritch', 'Eldritch'),
      option('divination', 'Divination'),
      option('chronomancy', 'Chronomancy'),
    ]),
    element('span', { id: 'difficulty-value' }, ['difficulty-value'], ['5']),
    element('span', { id: 'difficulty-tier' }, ['difficulty-tier'], ['served tier']),
    slider,
    ticks,
    element('button', { id: 'generate', type: 'button' }, ['btn']),
  ]);

  const well = element('div', { id: 'output', 'data-script': 'runic', 'data-size': 'medium' }, [
    'output',
  ], [
    element('p', {}, ['glyph-line', 'glyph-line--vapor'], ['served glyphs']),
    element('p', {}, ['glyph-line', 'glyph-glow', 'glyph-glow--aura'], ['served glyphs']),
    element('p', {}, ['glyph-line', 'glyph-glow', 'glyph-glow--bloom'], ['served glyphs']),
    element('p', {}, ['glyph-line', 'glyph-glow', 'glyph-glow--halo'], ['served glyphs']),
    element('p', {}, ['glyph-line', 'glyph-glow', 'glyph-glow--strike'], ['served glyphs']),
    element('p', { id: 'glyph-line', 'aria-label': 'served label' }, ['glyph-line'], [
      'served glyphs',
    ]),
    element('p', {}, ['translit'], ['served translit']),
    element('p', {}, ['gloss'], ['served gloss']),
  ]);

  const manifestation = element('section', {}, ['manifestation'], [
    element('div', {}, ['well-stage'], [element('div', {}, ['well'], [well])]),
    element('button', { id: 'reroll', type: 'button' }, ['btn']),
    element('button', { id: 'copy', type: 'button', 'data-state': 'idle' }, ['copy'], [
      element('span', { 'data-label': 'idle' }, ['copy-label'], ['Copy']),
      element('span', { 'data-label': 'copied' }, ['copy-label'], ['Copied']),
      element('span', { 'data-label': 'failed' }, ['copy-label'], ['Copy failed']),
    ]),
    element('div', {}, ['share-row'], hrefs.map((href) => element('a', { href }, ['share-link']))),
    element('p', { id: 'copy-status' }, ['visually-hidden']),
    element('p', {}, ['print-caption'], ['served caption']),
  ]);
  manifestation.hidden = true;

  const body = element('body', {}, [], [altar, manifestation]);
  const document = new FakeDocument(options.lang ?? 'en', head, body);

  const written: string[] = [];
  const globals = globalThis as unknown as Record<string, unknown>;
  globals.document = document;
  globals.window = { setTimeout, clearTimeout };
  globals.location = { hash: options.hash ?? '' };
  globals.history = {
    replaceState: (_state: unknown, _title: string, url: string): void => {
      written.push(url);
      (globals.location as { hash: string }).hash = url;
    },
  };
  globals.HTMLElement = FakeElement;
  globals.HTMLInputElement = FakeInputElement;
  globals.HTMLSelectElement = FakeSelectElement;

  const byId = (id: string): FakeElement => {
    const found = document.getElementById(id);
    if (found === null) throw new Error(`the page double has no element #${id}`);
    return found;
  };
  const find = (selector: string): FakeElement => {
    const found = document.querySelector(selector);
    if (found === null) throw new Error(`the page double has no element matching ${selector}`);
    return found;
  };

  // What the altar reads as selected, which is a select's business and not an
  // element's, so it is asked for by name rather than cast for at every use.
  const chosen = (id: string): string => {
    const found = byId(id);
    if (!(found instanceof FakeSelectElement)) throw new Error(`#${id} is not a select`);
    return found.value;
  };

  return {
    document,
    written,
    byId,
    chosen,
    find,
    findAll: (selector: string) => document.querySelectorAll(selector),
    click: (id: string) => byId(id).dispatch('click'),
    reflows: () => {
      const root = document.documentElement;
      let total = root.reads;
      for (const element of root.descendants()) total += element.reads;
      return total;
    },
  };
}

// The flows under test finish on their own time, behind dynamic imports, and
// report nothing when they are done. Waiting on what they wrote is the only
// signal a caller has, and a wait that never ends says so instead of hanging.
export async function until(condition: () => boolean, what: string): Promise<void> {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error(`waited for ${what}, which never happened`);
}

// Long enough for anything already scheduled to have run, which is what makes
// "and nothing more happened" an assertion rather than a hope.
export async function settle(): Promise<void> {
  for (let turn = 0; turn < 20; turn += 1) await new Promise((resolve) => setTimeout(resolve, 1));
}
