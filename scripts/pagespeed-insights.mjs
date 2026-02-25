#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = (process.env.PSI_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const STRATEGIES = ['mobile', 'desktop'];
const API_KEY = process.env.PAGESPEED_API_KEY || '';
const FAIL_ON_ERROR = process.env.PSI_FAIL_ON_ERROR !== 'false';

const PERFORMANCE_MIN = Number(process.env.PSI_MIN_PERFORMANCE || 0.6);
const ACCESSIBILITY_MIN = Number(process.env.PSI_MIN_ACCESSIBILITY || 0.85);
const BEST_PRACTICES_MIN = Number(process.env.PSI_MIN_BEST_PRACTICES || 0.85);
const SEO_MIN = Number(process.env.PSI_MIN_SEO || 0.85);

const MAX_FCP_MS = Number(process.env.PSI_MAX_FCP_MS || 2500);
const MAX_LCP_MS = Number(process.env.PSI_MAX_LCP_MS || 3000);
const MAX_TBT_MS = Number(process.env.PSI_MAX_TBT_MS || 300);
const MAX_CLS = Number(process.env.PSI_MAX_CLS || 0.1);
const MAX_INP_MS = Number(process.env.PSI_MAX_INP_MS || 250);

const PAGE_PATHS = (process.env.PSI_PATHS || '/en,/en/about,/en/services,/en/contact,/en/blog,/fr/about')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const REPORT_ROOT = path.join(process.cwd(), 'artifacts', 'seo-psi');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportDir = path.join(REPORT_ROOT, stamp);

function formatMs(value) {
  return `${Math.round(value)}ms`;
}

function formatScore(value) {
  return (value * 100).toFixed(0);
}

function getAuditValue(audit, fallback = 0) {
  return typeof audit?.numericValue === 'number' ? audit.numericValue : fallback;
}

function classifyFailure(failure) {
  if (failure.startsWith('performance')) return 'performance';
  if (failure.startsWith('accessibility')) return 'accessibility';
  if (failure.startsWith('best-practices')) return 'best-practices';
  if (failure.startsWith('seo')) return 'seo';
  if (failure.startsWith('FCP')) return 'fcp';
  if (failure.startsWith('LCP')) return 'lcp';
  if (failure.startsWith('TBT')) return 'tbt';
  if (failure.startsWith('CLS')) return 'cls';
  if (failure.startsWith('INP')) return 'inp';
  if (failure.includes('quota')) return 'quota';
  return 'request';
}

async function runPsi(url, strategy) {
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('strategy', strategy);
  endpoint.searchParams.set('category', 'performance');
  endpoint.searchParams.set('category', 'accessibility');
  endpoint.searchParams.set('category', 'best-practices');
  endpoint.searchParams.set('category', 'seo');
  if (API_KEY) {
    endpoint.searchParams.set('key', API_KEY);
  }

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ImmigrateToBrazil-PSI-Check/2.0',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    const quotaExceeded = response.status === 429 && body.toLowerCase().includes('quota');
    const error = new Error(`PSI request failed (${strategy}) ${response.status}: ${body.slice(0, 240)}`);
    error.code = quotaExceeded ? 'PSI_QUOTA_EXCEEDED' : 'PSI_HTTP_ERROR';
    throw error;
  }

  return response.json();
}

function evaluateResult(pathname, strategy, data) {
  const categories = data?.lighthouseResult?.categories || {};
  const audits = data?.lighthouseResult?.audits || {};

  const scores = {
    performance: Number(categories.performance?.score || 0),
    accessibility: Number(categories.accessibility?.score || 0),
    bestPractices: Number(categories['best-practices']?.score || 0),
    seo: Number(categories.seo?.score || 0),
  };

  const metrics = {
    fcp: getAuditValue(audits['first-contentful-paint']),
    lcp: getAuditValue(audits['largest-contentful-paint']),
    tbt: getAuditValue(audits['total-blocking-time']),
    cls: getAuditValue(audits['cumulative-layout-shift']),
    inp: getAuditValue(audits['interaction-to-next-paint']),
  };

  const failures = [];

  if (scores.performance < PERFORMANCE_MIN) failures.push(`performance ${formatScore(scores.performance)} < ${formatScore(PERFORMANCE_MIN)}`);
  if (scores.accessibility < ACCESSIBILITY_MIN) failures.push(`accessibility ${formatScore(scores.accessibility)} < ${formatScore(ACCESSIBILITY_MIN)}`);
  if (scores.bestPractices < BEST_PRACTICES_MIN) failures.push(`best-practices ${formatScore(scores.bestPractices)} < ${formatScore(BEST_PRACTICES_MIN)}`);
  if (scores.seo < SEO_MIN) failures.push(`seo ${formatScore(scores.seo)} < ${formatScore(SEO_MIN)}`);

  if (metrics.fcp > MAX_FCP_MS) failures.push(`FCP ${formatMs(metrics.fcp)} > ${formatMs(MAX_FCP_MS)}`);
  if (metrics.lcp > MAX_LCP_MS) failures.push(`LCP ${formatMs(metrics.lcp)} > ${formatMs(MAX_LCP_MS)}`);
  if (metrics.tbt > MAX_TBT_MS) failures.push(`TBT ${formatMs(metrics.tbt)} > ${formatMs(MAX_TBT_MS)}`);
  if (metrics.cls > MAX_CLS) failures.push(`CLS ${metrics.cls.toFixed(3)} > ${MAX_CLS}`);
  if (metrics.inp > MAX_INP_MS) failures.push(`INP ${formatMs(metrics.inp)} > ${formatMs(MAX_INP_MS)}`);

  const status = failures.length ? 'FAIL' : 'PASS';
  console.log(
    `${status} ${strategy.toUpperCase()} ${pathname} perf=${formatScore(scores.performance)} acc=${formatScore(scores.accessibility)} bp=${formatScore(scores.bestPractices)} seo=${formatScore(scores.seo)} fcp=${formatMs(metrics.fcp)} lcp=${formatMs(metrics.lcp)} tbt=${formatMs(metrics.tbt)} cls=${metrics.cls.toFixed(3)} inp=${formatMs(metrics.inp)}`,
  );

  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }

  return {
    path: pathname,
    strategy,
    scores,
    metrics,
    failures,
  };
}

async function writeReport(results, failures) {
  await mkdir(reportDir, { recursive: true });

  const failureCategoryCounts = {};
  for (const failure of failures) {
    const key = classifyFailure(failure.failure);
    failureCategoryCounts[key] = (failureCategoryCounts[key] || 0) + 1;
  }

  const ranked = Object.entries(failureCategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    paths: PAGE_PATHS,
    strategies: STRATEGIES,
    thresholds: {
      performance: PERFORMANCE_MIN,
      accessibility: ACCESSIBILITY_MIN,
      bestPractices: BEST_PRACTICES_MIN,
      seo: SEO_MIN,
      fcp: MAX_FCP_MS,
      lcp: MAX_LCP_MS,
      tbt: MAX_TBT_MS,
      cls: MAX_CLS,
      inp: MAX_INP_MS,
    },
    totals: {
      checks: results.length,
      failedChecks: results.filter((result) => result.failures.length > 0).length,
      failures: failures.length,
    },
    topFailureCategories: ranked,
    failures,
    results,
  };

  const lines = [
    '# PageSpeed Insights Report',
    '',
    `- Generated: ${summary.generatedAt}`,
    `- Base URL: ${summary.baseUrl}`,
    `- Checks: ${summary.totals.checks}`,
    `- Failed checks: ${summary.totals.failedChecks}`,
    `- Total failure rules: ${summary.totals.failures}`,
    '',
    '## Priority categories',
  ];

  if (ranked.length === 0) {
    lines.push('- None');
  } else {
    for (const item of ranked) {
      lines.push(`- ${item.category}: ${item.count}`);
    }
  }

  lines.push('', '## Detailed failures');
  if (failures.length === 0) {
    lines.push('- None');
  } else {
    for (const failure of failures.slice(0, 120)) {
      lines.push(`- ${failure.strategy.toUpperCase()} ${failure.path}: ${failure.failure}`);
    }
  }

  await writeFile(path.join(reportDir, 'pagespeed-report.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(reportDir, 'pagespeed-report.md'), `${lines.join('\n')}\n`);

  console.log(`PageSpeed report exported to ${path.relative(process.cwd(), reportDir)}`);
}

async function main() {
  const results = [];
  const failures = [];
  let quotaFailures = 0;

  for (const pathname of PAGE_PATHS) {
    const url = `${BASE_URL}${pathname}`;

    for (const strategy of STRATEGIES) {
      try {
        const data = await runPsi(url, strategy);
        const result = evaluateResult(pathname, strategy, data);
        results.push(result);

        for (const failure of result.failures) {
          failures.push({ path: pathname, strategy, failure });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error && typeof error === 'object' && error.code === 'PSI_QUOTA_EXCEEDED') {
          quotaFailures += 1;
        }
        const synthetic = {
          path: pathname,
          strategy,
          scores: {
            performance: 0,
            accessibility: 0,
            bestPractices: 0,
            seo: 0,
          },
          metrics: {
            fcp: 0,
            lcp: 0,
            tbt: 0,
            cls: 0,
            inp: 0,
          },
          failures: [message],
        };
        results.push(synthetic);
        failures.push({ path: pathname, strategy, failure: message });
        console.error(`FAIL ${strategy.toUpperCase()} ${pathname} ${message}`);
      }
    }
  }

  await writeReport(results, failures);

  if (failures.length > 0) {
    if (quotaFailures === failures.length) {
      console.error('\nAll failures are PageSpeed API quota errors.');
      console.error('Set PAGESPEED_API_KEY to your own API key and re-run `npm run seo:psi`.');
    }

    console.error(`\nPageSpeed checks failed: ${failures.length} issue(s).`);
    if (FAIL_ON_ERROR) {
      process.exit(1);
    }
    return;
  }

  console.log('\nAll PageSpeed checks passed.');
}

main().catch((error) => {
  console.error('seo:psi failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
