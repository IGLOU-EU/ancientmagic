// Minimal ambient typings for the Node built-ins the tests and the build tools
// use, because the project ships zero dependencies and therefore no @types/node.
// Only the members actually called are declared.

interface ImportMeta {
  url: string;
}

declare module 'node:test' {
  type TestFn = () => void | Promise<void>;
  export default function test(name: string, fn: TestFn): void;
}

declare module 'node:assert/strict' {
  export function ok(value: unknown, message?: string): void;
  export function strictEqual(actual: unknown, expected: unknown, message?: string): void;
  export function notStrictEqual(actual: unknown, expected: unknown, message?: string): void;
  export function deepStrictEqual(actual: unknown, expected: unknown, message?: string): void;
  export function match(value: string, regExp: RegExp, message?: string): void;
  export function doesNotMatch(value: string, regExp: RegExp, message?: string): void;
  export function throws(fn: () => unknown, expected?: RegExp | string, message?: string): void;
  export function rejects(
    promise: Promise<unknown> | (() => Promise<unknown>),
    expected?: RegExp | string,
    message?: string,
  ): Promise<void>;
  export function doesNotThrow(fn: () => unknown, message?: string): void;
  export function fail(message?: string): never;
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function writeFileSync(path: string, data: string): void;
  export function readdirSync(path: string): string[];
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function watch(path: string, listener: () => void): void;
}

declare module 'node:child_process' {
  export function spawn(
    command: string,
    args: string[],
    options: { stdio: 'inherit' },
  ): { on(event: 'exit', listener: () => void): void };
}

// Module form rather than globals, so nothing collides with the DOM lib of
// the client tsconfig when the IDE projects this file into it.
declare module 'node:timers' {
  export function setTimeout(listener: () => void, ms: number): object;
  export function clearTimeout(id: object | undefined): void;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
  export function dirname(path: string): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string): string;
}
