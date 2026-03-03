#!/usr/bin/env node

import { loadMergedEnv, isPlaceholder } from './env-utils.mjs';

function statusLine(kind, name, detail) {
  console.log(`${kind.padEnd(5)} ${name}${detail ? ` - ${detail}` : ''}`);
}

async function checkPageSpeed(env, results) {
  const key = String(env.PAGESPEED_API_KEY || '').trim();
  const siteUrl = String(env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');

  if (!key) {
    results.push({ name: 'PAGESPEED_API_KEY', ok: false, detail: 'missing' });
    return;
  }

  try {
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    endpoint.searchParams.set('url', `${siteUrl}/en`);
    endpoint.searchParams.set('strategy', 'mobile');
    endpoint.searchParams.set('key', key);
    endpoint.searchParams.set('category', 'performance');

    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    const body = await response.text();

    if (response.ok) {
      results.push({ name: 'PAGESPEED_API_KEY', ok: true, detail: 'request succeeded' });
      return;
    }

    if (response.status === 429) {
      results.push({ name: 'PAGESPEED_API_KEY', ok: false, detail: 'quota exceeded (key works but quota/project limit hit)' });
      return;
    }

    results.push({ name: 'PAGESPEED_API_KEY', ok: false, detail: `HTTP ${response.status}: ${body.slice(0, 120)}` });
  } catch (error) {
    results.push({ name: 'PAGESPEED_API_KEY', ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

async function checkIndexNow(env, results) {
  const siteUrl = String(env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  const key = String(env.INDEXNOW_API_KEY || '').trim();
  if (!siteUrl || !key) {
    results.push({ name: 'INDEXNOW', ok: false, detail: 'requires NEXT_PUBLIC_SITE_URL and INDEXNOW_API_KEY' });
    return;
  }

  try {
    const keyLocation = `${new URL(siteUrl).origin}/${key}.txt`;
    const response = await fetch(keyLocation, { headers: { Accept: 'text/plain, */*' } });
    const body = (await response.text()).trim();

    if (!response.ok) {
      results.push({ name: 'INDEXNOW key file', ok: false, detail: `HTTP ${response.status} at ${keyLocation}` });
      return;
    }

    if (body !== key) {
      results.push({ name: 'INDEXNOW key file', ok: false, detail: `content mismatch at ${keyLocation}` });
      return;
    }

    results.push({ name: 'INDEXNOW key file', ok: true, detail: 'live key file matches' });
  } catch (error) {
    results.push({ name: 'INDEXNOW key file', ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

async function checkCloudflare(env, results) {
  const token = String(env.CLOUDFLARE_API_TOKEN || '').trim();
  if (!token) {
    results.push({ name: 'CLOUDFLARE_API_TOKEN', ok: false, detail: 'missing' });
    return;
  }
  if (isPlaceholder(token)) {
    results.push({ name: 'CLOUDFLARE_API_TOKEN', ok: false, detail: 'placeholder value' });
    return;
  }

  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json().catch(() => null);
    if (response.ok && json?.success) {
      results.push({ name: 'CLOUDFLARE_API_TOKEN', ok: true, detail: 'token verified' });
      return;
    }
    results.push({ name: 'CLOUDFLARE_API_TOKEN', ok: false, detail: `verify failed (HTTP ${response.status})` });
  } catch (error) {
    results.push({ name: 'CLOUDFLARE_API_TOKEN', ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

function checkSentry(env, results) {
  const privateDsn = String(env.SENTRY_DSN || '').trim();
  const publicDsn = String(env.NEXT_PUBLIC_SENTRY_DSN || '').trim();
  const dsn = privateDsn || publicDsn;

  if (!dsn) {
    results.push({ name: 'SENTRY_DSN', ok: false, detail: 'missing (set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN)' });
    return;
  }

  if (isPlaceholder(dsn)) {
    results.push({ name: 'SENTRY_DSN', ok: false, detail: 'placeholder value' });
    return;
  }

  let parsed;
  try {
    parsed = new URL(dsn);
  } catch {
    results.push({ name: 'SENTRY_DSN', ok: false, detail: 'invalid URL format' });
    return;
  }

  if (!parsed.hostname.includes('sentry.io') && !parsed.hostname.includes('.ingest.sentry.io')) {
    results.push({ name: 'SENTRY_DSN', ok: false, detail: `unexpected host ${parsed.hostname}` });
    return;
  }

  results.push({ name: 'SENTRY_DSN', ok: true, detail: 'set' });
}

function checkStaticKeys(env, results) {
  const required = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_CLIENT_EMAIL',
    'NEXT_PUBLIC_CONSULTATION_EMAIL',
    'NEXT_PUBLIC_WHATSAPP_NUMBER',
    'NEXT_PUBLIC_WHATSAPP_LINK',
    'NEXT_PUBLIC_FORMSPREE_ENDPOINT',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'NEXT_PUBLIC_GTM_ID',
    'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
    'ADMIN_BASIC_AUTH_USER',
    'ADMIN_BASIC_AUTH_PASS',
  ];

  for (const key of required) {
    const value = String(env[key] || '').trim();
    if (!value || isPlaceholder(value)) {
      results.push({ name: key, ok: false, detail: !value ? 'missing' : 'placeholder value' });
    } else {
      results.push({ name: key, ok: true, detail: 'set' });
    }
  }

  const decapClientId = String(env.DECAP_GITHUB_OAUTH_CLIENT_ID || '').trim();
  const decapSecret = String(env.DECAP_GITHUB_OAUTH_CLIENT_SECRET || '').trim();
  if (!decapClientId || isPlaceholder(decapClientId)) {
    results.push({ name: 'DECAP_GITHUB_OAUTH_CLIENT_ID', ok: false, detail: 'missing/placeholder' });
  } else {
    results.push({ name: 'DECAP_GITHUB_OAUTH_CLIENT_ID', ok: true, detail: 'set' });
  }
  if (!decapSecret || isPlaceholder(decapSecret)) {
    results.push({ name: 'DECAP_GITHUB_OAUTH_CLIENT_SECRET', ok: false, detail: 'missing/placeholder' });
  } else {
    results.push({ name: 'DECAP_GITHUB_OAUTH_CLIENT_SECRET', ok: true, detail: 'set' });
  }
}

async function main() {
  const env = await loadMergedEnv();
  const results = [];

  checkStaticKeys(env, results);
  checkSentry(env, results);
  await Promise.all([checkPageSpeed(env, results), checkIndexNow(env, results), checkCloudflare(env, results)]);

  let failed = 0;
  for (const row of results) {
    if (row.ok) {
      statusLine('OK', row.name, row.detail);
    } else {
      failed += 1;
      statusLine('FAIL', row.name, row.detail);
    }
  }

  console.log(`\nEnv integration checks: ${results.length - failed}/${results.length} passed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('env validation failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
