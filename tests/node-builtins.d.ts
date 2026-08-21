// Minimal ambient typings for the Node built-ins the tests use, because the
// project ships zero dependencies and therefore no @types/node.

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
  export function throws(fn: () => unknown, message?: string): void;
  export function fail(message?: string): never;
}
