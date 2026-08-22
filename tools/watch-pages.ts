// Rebuilds the static pages when the template or a strings file changes, so a
// watch session shows copy edits without a manual build. Runs the full
// build:html script rather than an in-process render, so the watcher can never
// disagree with what the real build produces.

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { dirname, join } from 'node:path';
import { clearTimeout, setTimeout } from 'node:timers';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WATCHED = [join(root, 'src', 'html'), join(root, 'src', 'strings')];

// Editors fire several events per save, one settle window folds them into a
// single rebuild.
const SETTLE_MS = 150;

let timer: object | undefined;
let running = false;
let queued = false;

function build(): void {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  spawn('npm', ['run', 'build:html'], { stdio: 'inherit' }).on('exit', () => {
    running = false;
    if (queued) {
      queued = false;
      build();
    }
  });
}

function schedule(): void {
  clearTimeout(timer);
  timer = setTimeout(build, SETTLE_MS);
}

// The initial build's own output is the liveness signal, no banner needed.
for (const dir of WATCHED) watch(dir, schedule);
build();
