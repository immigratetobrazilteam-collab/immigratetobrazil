#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = (process.env.SEO_FINAL_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://immigratetobrazil.com').replace(/\/$/, '');
const SAMPLE_SIZE = Number(process.env.SEO_FINAL_SAMPLE_SIZE || 80);
const FAIL_ON_ERROR = process.env.SEO_FINAL_FAIL_ON_ERROR !== 'false';

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return value.replace(/\/+$/, '');
  }
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

function pickSample(urls, size) {
  const unique = Array.from(new Set(urls.map(normalizeUrl)));
  if (unique.length <= size) return unique;
  const step = Math.max(1, Math.floor(unique.length / size));
  const selected = [];
  for (let idx = 0; idx < unique.length && selected.length < size; idx += step) {
    selected.push(unique[idx]);
  }
  return selected.slice(0, size);
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || '';
}

function extractMetaDescription(html) {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match?.[1] || '';
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (match?.[1] || '').trim();
}

function extractJsonLdBlocks(html) {
  return Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)).map(
    (match) => (match[1] || '').trim(),
  );
}

function safeJsonParse(raw) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  return { status: res.status, text, headers: res.headers };
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(process.cwd(), 'artifacts', 'seo-final', stamp);
  await mkdir(outDir, { recursive: true });

  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const sitemapRes = await fetchText(sitemapUrl);
  if (sitemapRes.status < 200 || sitemapRes.status >= 400) {
    throw new Error(`Could not fetch sitemap ${sitemapUrl} (status ${sitemapRes.status}).`);
  }

  const sitemapLocs = extractLocs(sitemapRes.text);
  const sampleUrls = pickSample(sitemapLocs, SAMPLE_SIZE);
  const failures = [];
  const checks = [];

  for (const url of sampleUrls) {
    try {
      const res = await fetchText(url);
      const normalizedUrl = normalizeUrl(url);
      const canonical = normalizeUrl(extractCanonical(res.text));
      const title = extractTitle(res.text);
      const metaDescription = extractMetaDescription(res.text);
      const jsonLdRaw = extractJsonLdBlocks(res.text);
      const jsonLdParsed = jsonLdRaw.map((block) => safeJsonParse(block));

      const rowFailures = [];

      if (res.status < 200 || res.status >= 400) rowFailures.push(`status ${res.status}`);
      if (!canonical) rowFailures.push('missing canonical');
      if (canonical && canonical !== normalizedUrl) rowFailures.push(`canonical mismatch (${canonical})`);
      if (!title) rowFailures.push('missing title');
      if (!metaDescription) rowFailures.push('missing meta description');
      if (!jsonLdRaw.length) rowFailures.push('missing structured data');
      if (jsonLdParsed.some((entry) => !entry.ok)) rowFailures.push('invalid structured data JSON');

      const hasContext = jsonLdParsed.some((entry) => entry.ok && entry.value && typeof entry.value === 'object' && '@context' in entry.value);
      if (jsonLdRaw.length && !hasContext) rowFailures.push('structured data missing @context');

      const check = {
        url: normalizedUrl,
        status: res.status,
        canonical,
        title,
        metaDescriptionLength: metaDescription.length,
        jsonLdCount: jsonLdRaw.length,
        failures: rowFailures,
      };
      checks.push(check);

      for (const failure of rowFailures) {
        failures.push({ url: normalizedUrl, failure });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      checks.push({
        url,
        status: 0,
        canonical: '',
        title: '',
        metaDescriptionLength: 0,
        jsonLdCount: 0,
        failures: [message],
      });
      failures.push({ url, failure: message });
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    sitemapUrl,
    sitemapUrlCount: sitemapLocs.length,
    sampleSize: sampleUrls.length,
    failures: failures.length,
    checks,
  };

  await writeFile(path.join(outDir, 'seo-final-check.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const md = [];
  md.push('# SEO Final Check');
  md.push('');
  md.push(`- Generated: ${summary.generatedAt}`);
  md.push(`- Base URL: ${summary.baseUrl}`);
  md.push(`- Sitemap URLs: ${summary.sitemapUrlCount}`);
  md.push(`- Sampled URLs: ${summary.sampleSize}`);
  md.push(`- Failures: ${summary.failures}`);
  md.push('');
  md.push('| URL | Status | Canonical | JSON-LD | Failures |');
  md.push('|---|---:|---|---:|---|');
  for (const check of checks) {
    md.push(`| ${check.url} | ${check.status} | ${check.canonical || '-'} | ${check.jsonLdCount} | ${check.failures.join('; ') || '-'} |`);
  }

  await writeFile(path.join(outDir, 'seo-final-check.md'), `${md.join('\n')}\n`, 'utf8');
  console.log(`SEO final check exported to ${path.relative(process.cwd(), outDir)}`);

  if (FAIL_ON_ERROR && failures.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('seo final check failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

