import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = (process.env.SEO_AUDIT_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://immigratetobrazil.com').replace(/\/$/, '');
const FAIL_ON_ERROR = process.env.SEO_AUDIT_FAIL_ON_ERROR !== 'false';
const OUT_ROOT = path.join(process.cwd(), 'artifacts', 'seo-audits');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(OUT_ROOT, stamp);

function pickSample(urls, size) {
  const unique = Array.from(new Set(urls));
  if (unique.length <= size) return unique;
  const step = Math.max(1, Math.floor(unique.length / size));
  const picked = [];
  for (let i = 0; i < unique.length && picked.length < size; i += step) {
    picked.push(unique[i]);
  }
  return picked.slice(0, size);
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    locs.push(match[1]);
  }
  return locs;
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const contentType = res.headers.get('content-type') || '';
    return {
      url,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      contentType,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      contentType: '',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function run() {
  await mkdir(outDir, { recursive: true });

  const coreChecks = ['/en', '/es', '/pt', '/robots.txt', '/sitemap.xml', '/api/health', '/api/ready', '/api/ops/summary'];
  const coreResults = await Promise.all(coreChecks.map((p) => checkUrl(`${BASE_URL}${p}`)));

  let sitemapUrls = [];
  let sitemapStatus = 'unavailable';

  try {
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    if (sitemapRes.ok) {
      sitemapStatus = 'ok';
      const xml = await sitemapRes.text();
      sitemapUrls = extractLocs(xml);
    } else {
      sitemapStatus = `http_${sitemapRes.status}`;
    }
  } catch (error) {
    sitemapStatus = `error_${error instanceof Error ? error.message : String(error)}`;
  }

  const sample = pickSample(sitemapUrls, 25);
  const sampleResults = await Promise.all(sample.map((url) => checkUrl(url)));

  const allResults = [...coreResults, ...sampleResults];
  const failed = allResults.filter((x) => !x.ok);

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    sitemapStatus,
    sitemapUrlCount: sitemapUrls.length,
    sampledUrlCount: sample.length,
    checks: {
      total: allResults.length,
      passed: allResults.length - failed.length,
      failed: failed.length,
    },
    failures: failed,
  };

  const lines = [
    '# SEO Audit Report',
    '',
    `- Generated: ${summary.generatedAt}`,
    `- Base URL: ${summary.baseUrl}`,
    `- Sitemap status: ${summary.sitemapStatus}`,
    `- Sitemap URL count: ${summary.sitemapUrlCount}`,
    `- Sampled URL count: ${summary.sampledUrlCount}`,
    `- Checks passed: ${summary.checks.passed}/${summary.checks.total}`,
    '',
    '## Core checks',
  ];

  for (const row of coreResults) {
    lines.push(`- ${row.ok ? 'OK' : 'FAIL'} ${row.url} (${row.status})`);
  }

  lines.push('', '## Sample failures');
  if (failed.length === 0) {
    lines.push('- None');
  } else {
    for (const row of failed.slice(0, 50)) {
      lines.push(`- FAIL ${row.url} (${row.status}) ${row.error || ''}`.trim());
    }
  }

  await writeFile(path.join(outDir, 'seo-audit.json'), JSON.stringify(summary, null, 2));
  await writeFile(path.join(outDir, 'seo-audit.md'), `${lines.join('\n')}\n`);

  console.log(`SEO audit exported to ${path.relative(process.cwd(), outDir)}`);

  if (failed.length > 0 && FAIL_ON_ERROR) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
