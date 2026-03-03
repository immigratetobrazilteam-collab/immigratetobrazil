import { loadMergedEnv } from './env-utils.mjs';

const DEFAULT_ZONE_NAME = 'immigratetobrazil.com';
const DEFAULT_VERIFICATION_TOKEN = 'V_VZqx1NiakXTqLhWGFq83By48pnyeKglU8se9hGZIo';
const DEFAULT_TTL_SECONDS = 3600;
const API_BASE = 'https://api.cloudflare.com/client/v4';

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeRecordName(recordName, zoneName) {
  const candidate = clean(recordName);
  if (!candidate || candidate === '@') {
    return zoneName;
  }
  if (candidate === zoneName || candidate.endsWith(`.${zoneName}`)) {
    return candidate;
  }
  return `${candidate}.${zoneName}`;
}

function parseTtl(rawTtl) {
  const parsed = Number.parseInt(clean(rawTtl), 10);
  if (!Number.isFinite(parsed) || parsed < 60 || parsed > 86400) {
    return DEFAULT_TTL_SECONDS;
  }
  return parsed;
}

function buildVerificationContent(token) {
  const sanitized = clean(token).replace(/^"+|"+$/g, '');
  if (!sanitized) {
    throw new Error('Google site verification token is empty.');
  }
  return `google-site-verification=${sanitized}`;
}

function getHeaders(apiToken) {
  return {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };
}

async function cfRequest(pathname, apiToken, init = {}) {
  const response = await fetch(`${API_BASE}${pathname}`, {
    ...init,
    headers: {
      ...getHeaders(apiToken),
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const details = Array.isArray(payload?.errors)
      ? payload.errors.map((error) => error.message || JSON.stringify(error)).join('; ')
      : `HTTP ${response.status}`;
    throw new Error(`Cloudflare API request failed (${pathname}): ${details}`);
  }

  return payload.result;
}

async function resolveZoneId({ apiToken, zoneId, zoneName }) {
  if (zoneId) {
    return zoneId;
  }
  const result = await cfRequest(
    `/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=1`,
    apiToken,
  );
  const first = Array.isArray(result) ? result[0] : null;
  if (!first?.id) {
    throw new Error(`Unable to resolve Cloudflare zone id for '${zoneName}'.`);
  }
  return first.id;
}

function selectGoogleVerificationRecord(records) {
  if (!Array.isArray(records)) {
    return null;
  }
  return (
    records.find((record) => typeof record?.content === 'string' && record.content.startsWith('google-site-verification=')) ||
    null
  );
}

async function main() {
  const env = await loadMergedEnv();
  const apiToken = clean(env.CLOUDFLARE_API_TOKEN);
  if (!apiToken) {
    console.log('Skipping DNS upsert: CLOUDFLARE_API_TOKEN is not set.');
    return;
  }

  const zoneName = clean(env.CLOUDFLARE_ZONE_NAME) || DEFAULT_ZONE_NAME;
  const zoneId = clean(env.CLOUDFLARE_ZONE_ID);
  const recordName = normalizeRecordName(
    env.CLOUDFLARE_DNS_RECORD_NAME || zoneName,
    zoneName,
  );
  const ttl = parseTtl(env.CLOUDFLARE_DNS_TTL);
  const verificationToken =
    clean(env.GOOGLE_SITE_VERIFICATION) ||
    clean(env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) ||
    DEFAULT_VERIFICATION_TOKEN;
  const content = buildVerificationContent(verificationToken);

  const resolvedZoneId = await resolveZoneId({ apiToken, zoneId, zoneName });
  const records = await cfRequest(
    `/zones/${resolvedZoneId}/dns_records?type=TXT&name=${encodeURIComponent(recordName)}&per_page=100`,
    apiToken,
  );
  const existing = selectGoogleVerificationRecord(records);

  const payload = {
    type: 'TXT',
    name: recordName,
    content,
    ttl,
  };

  if (!existing) {
    const created = await cfRequest(`/zones/${resolvedZoneId}/dns_records`, apiToken, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log(
      `Created TXT record '${created?.name || recordName}' for Google Search Console verification.`,
    );
    return;
  }

  const alreadyMatches = existing.content === content && Number(existing.ttl) === ttl;
  if (alreadyMatches) {
    console.log(`TXT verification record already up to date for '${recordName}'.`);
    return;
  }

  const updated = await cfRequest(`/zones/${resolvedZoneId}/dns_records/${existing.id}`, apiToken, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  console.log(
    `Updated TXT record '${updated?.name || recordName}' for Google Search Console verification.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
