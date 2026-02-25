#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(root, 'artifacts', 'seo-weekly', stamp);

async function latestSubdir(baseDir) {
  try {
    const entries = await readdir(baseDir, { withFileTypes: true });
    const dirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a));

    return dirs[0] ? path.join(baseDir, dirs[0]) : null;
  } catch {
    return null;
  }
}

async function readJson(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildPriorities(audit, psi) {
  const priorities = [];

  if (audit?.checks?.coreFailed > 0) {
    priorities.push({
      priority: 'P0',
      issue: `${audit.checks.coreFailed} core endpoint SEO checks failed`,
      action: 'Fix failing core routes first (/en, localized homes, robots, sitemap, health/ready endpoints).',
    });
  }

  if (audit?.checks?.sampleFailed > 0) {
    priorities.push({
      priority: 'P1',
      issue: `${audit.checks.sampleFailed} sampled sitemap URLs failed`,
      action: 'Fix these URL statuses and content-type issues to stabilize crawl quality.',
    });
  }

  const topPsiCategory = psi?.topFailureCategories?.[0];
  if (topPsiCategory) {
    priorities.push({
      priority: 'P1',
      issue: `Top PSI regression category: ${topPsiCategory.category} (${topPsiCategory.count})`,
      action: 'Address the dominant metric/category first for largest impact on page experience.',
    });
  }

  if ((psi?.totals?.failures || 0) > 0) {
    priorities.push({
      priority: 'P2',
      issue: `${psi.totals.failures} total PSI threshold failures`,
      action: 'Work through failures by page type (home, services, contact) and re-run seo:psi.',
    });
  }

  if (!priorities.length) {
    priorities.push({
      priority: 'P3',
      issue: 'No critical SEO/PSI failures detected',
      action: 'Maintain weekly monitoring and continue content quality improvements.',
    });
  }

  return priorities;
}

async function run() {
  const latestAuditDir = await latestSubdir(path.join(root, 'artifacts', 'seo-audits'));
  const latestPsiDir = await latestSubdir(path.join(root, 'artifacts', 'seo-psi'));

  const audit = latestAuditDir ? await readJson(path.join(latestAuditDir, 'seo-audit.json')) : null;
  const psi = latestPsiDir ? await readJson(path.join(latestPsiDir, 'pagespeed-report.json')) : null;
  const priorities = buildPriorities(audit, psi);

  const summary = {
    generatedAt: new Date().toISOString(),
    sources: {
      seoAudit: latestAuditDir ? path.relative(root, latestAuditDir) : null,
      pageSpeed: latestPsiDir ? path.relative(root, latestPsiDir) : null,
    },
    seoAudit: audit
      ? {
          sitemapStatus: audit.sitemapStatus,
          sitemapUrlCount: audit.sitemapUrlCount,
          sampledUrlCount: audit.sampledUrlCount,
          checks: audit.checks,
        }
      : null,
    pageSpeed: psi
      ? {
          totals: psi.totals,
          topFailureCategories: psi.topFailureCategories || [],
        }
      : null,
    priorities,
  };

  const lines = [
    '# Weekly SEO + Performance Report',
    '',
    `- Generated: ${summary.generatedAt}`,
    `- SEO audit source: ${summary.sources.seoAudit || 'not found'}`,
    `- PSI source: ${summary.sources.pageSpeed || 'not found'}`,
    '',
    '## Prioritized actions',
  ];

  for (const item of priorities) {
    lines.push(`- ${item.priority}: ${item.issue}`);
    lines.push(`  Action: ${item.action}`);
  }

  lines.push('', '## Snapshot');
  if (summary.seoAudit) {
    lines.push(`- SEO audit checks: ${summary.seoAudit.checks.passed}/${summary.seoAudit.checks.total} passed`);
    lines.push(`- SEO core failures: ${summary.seoAudit.checks.coreFailed}`);
    lines.push(`- SEO sample failures: ${summary.seoAudit.checks.sampleFailed}`);
  } else {
    lines.push('- SEO audit data unavailable');
  }

  if (summary.pageSpeed) {
    lines.push(`- PSI checks: ${summary.pageSpeed.totals.checks}`);
    lines.push(`- PSI failed checks: ${summary.pageSpeed.totals.failedChecks}`);
    lines.push(`- PSI failure rules: ${summary.pageSpeed.totals.failures}`);
  } else {
    lines.push('- PSI data unavailable');
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'weekly-report.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(outDir, 'weekly-report.md'), `${lines.join('\n')}\n`);

  console.log(`Weekly SEO report exported to ${path.relative(root, outDir)}`);
}

run().catch((error) => {
  console.error('seo-weekly-report failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
