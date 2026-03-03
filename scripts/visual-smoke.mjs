#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = (process.env.VISUAL_SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const PAGE_TIMEOUT_MS = Number(process.env.VISUAL_SMOKE_TIMEOUT_MS || 45000);
const VIEWPORT = {
  width: Number(process.env.VISUAL_SMOKE_WIDTH || 1440),
  height: Number(process.env.VISUAL_SMOKE_HEIGHT || 1080),
};

const routes = [
  '/en',
  '/en/state-guides',
  '/en/discover',
  '/en/services',
  '/en/policies',
];

function slugFromRoute(route) {
  return route.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'root';
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(process.cwd(), 'artifacts', 'visual-smoke', stamp);
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  const results = [];
  const failures = [];

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    const pageErrors = [];
    const consoleErrors = [];

    const pageErrorHandler = (error) => pageErrors.push(String(error?.message || error));
    const consoleHandler = (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    };

    page.on('pageerror', pageErrorHandler);
    page.on('console', consoleHandler);

    let status = 0;
    let h1 = '';
    let screenshotPath = '';
    let ok = true;
    let errorMessage = '';

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT_MS });
      status = response?.status() || 0;

      if (status < 200 || status >= 400) {
        ok = false;
        errorMessage = `Unexpected HTTP status ${status}`;
      }

      const h1Locator = page.locator('h1').first();
      const hasH1 = await h1Locator.isVisible().catch(() => false);
      if (!hasH1) {
        ok = false;
        errorMessage = errorMessage || 'Missing visible h1';
      } else {
        h1 = (await h1Locator.textContent())?.trim() || '';
      }

      screenshotPath = path.join(outDir, `${slugFromRoute(route)}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (error) {
      ok = false;
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    page.off('pageerror', pageErrorHandler);
    page.off('console', consoleHandler);

    const row = {
      route,
      url,
      ok,
      status,
      h1,
      screenshot: screenshotPath,
      pageErrors,
      consoleErrors,
      error: errorMessage,
    };
    results.push(row);

    if (!ok || pageErrors.length) {
      failures.push(row);
    }
  }

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewport: VIEWPORT,
    checks: results.length,
    failures: failures.length,
    results,
  };

  await writeFile(path.join(outDir, 'visual-smoke.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const md = [];
  md.push('# Visual Smoke Report');
  md.push('');
  md.push(`- Generated: ${summary.generatedAt}`);
  md.push(`- Base URL: ${summary.baseUrl}`);
  md.push(`- Viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);
  md.push(`- Checks: ${summary.checks}`);
  md.push(`- Failures: ${summary.failures}`);
  md.push('');
  md.push('| Route | Status | H1 | Screenshot |');
  md.push('|---|---:|---|---|');
  for (const row of results) {
    const screenshotRelative = row.screenshot ? path.relative(process.cwd(), row.screenshot).replace(/\\/g, '/') : '';
    const screenshotLink = screenshotRelative ? `[image](${screenshotRelative})` : '-';
    md.push(`| ${row.route} | ${row.status} | ${row.h1 || '-'} | ${screenshotLink} |`);
  }

  if (failures.length) {
    md.push('', '## Failures');
    for (const failure of failures) {
      md.push(`- ${failure.route}: ${failure.error || 'runtime console/page errors detected'}`);
      if (failure.pageErrors.length) {
        for (const msg of failure.pageErrors.slice(0, 5)) md.push(`  - pageerror: ${msg}`);
      }
      if (failure.consoleErrors.length) {
        for (const msg of failure.consoleErrors.slice(0, 5)) md.push(`  - console.error: ${msg}`);
      }
    }
  }

  await writeFile(path.join(outDir, 'visual-smoke.md'), `${md.join('\n')}\n`, 'utf8');
  console.log(`Visual smoke report exported to ${path.relative(process.cwd(), outDir)}`);

  if (failures.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('visual-smoke failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

