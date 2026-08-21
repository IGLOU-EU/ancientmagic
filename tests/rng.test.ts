import test from 'node:test';
import * as assert from 'node:assert/strict';
import { mulberry32 } from '../src/ts/generator/rng.js';

test('rng: same seed yields the same sequence', () => {
  const a = mulberry32(123456789);
  const b = mulberry32(123456789);
  for (let i = 0; i < 100; i += 1) {
    assert.strictEqual(a(), b());
  }
});

test('rng: different seeds diverge', () => {
  const a = mulberry32(1);
  const b = mulberry32(2);
  const runA = Array.from({ length: 8 }, () => a()).join(',');
  const runB = Array.from({ length: 8 }, () => b()).join(',');
  assert.notStrictEqual(runA, runB);
});

test('rng: values stay in [0, 1) and vary', () => {
  const rng = mulberry32(42);
  const seen = new Set<number>();
  for (let i = 0; i < 1000; i += 1) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `value out of range: ${v}`);
    seen.add(v);
  }
  assert.ok(seen.size > 900, 'sequence looks degenerate');
});
