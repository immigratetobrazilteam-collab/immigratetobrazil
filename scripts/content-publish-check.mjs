#!/usr/bin/env node
import { spawn } from 'node:child_process';

const STEPS = [
  { name: 'CMS validate', cmd: 'npm', args: ['run', 'cms:validate'] },
  { name: 'Sync locales', cmd: 'npm', args: ['run', 'cms:sync-locales'] },
  { name: 'Regenerate route index', cmd: 'npm', args: ['run', 'migrate:routes'] },
  {
    name: 'Smoke check',
    cmd: 'npm',
    args: ['run', 'smoke'],
    env: {
      SMOKE_MAX_ATTEMPTS: process.env.SMOKE_MAX_ATTEMPTS || '2',
      SMOKE_RETRY_DELAY_MS: process.env.SMOKE_RETRY_DELAY_MS || '1000',
    },
  },
];

function runStep(step) {
  return new Promise((resolve) => {
    console.log(`\n==> ${step.name}`);
    const child = spawn(step.cmd, step.args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...(step.env || {}) },
    });

    child.on('exit', (code) => {
      resolve({ name: step.name, ok: code === 0, code: code ?? 1 });
    });
  });
}

async function main() {
  const results = [];

  for (const step of STEPS) {
    const result = await runStep(step);
    results.push(result);
    if (!result.ok) break;
  }

  console.log('\nContent publish check summary');
  for (const result of results) {
    console.log(`- ${result.ok ? 'PASS' : 'FAIL'}: ${result.name}`);
  }

  const failed = results.find((result) => !result.ok);
  if (failed) {
    console.error(`\nContent publish check failed at: ${failed.name}`);
    process.exit(failed.code);
  }

  console.log('\nAll content publish checks passed.');
}

main().catch((error) => {
  console.error('content:check failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
