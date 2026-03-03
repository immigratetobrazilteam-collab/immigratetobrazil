import { loadMergedEnv, isPlaceholder } from './env-utils.mjs';

const API_BASE = 'https://api.cloudflare.com/client/v4';

function required(name, value) {
  if (!value || isPlaceholder(value)) {
    throw new Error(`Missing or placeholder value: ${name}`);
  }
  return String(value).trim();
}

async function cfRequest({ token, path, method = 'GET', body }) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    ok: Boolean(data?.success),
    status: response.status,
    data,
  };
}

function formatApiError(result) {
  const errors = result?.data?.errors || [];
  if (!Array.isArray(errors) || errors.length === 0) return `HTTP ${result.status}`;
  return errors.map((e) => `${e.code ?? 'unknown'}: ${e.message ?? 'Unknown error'}`).join('; ');
}

function pass(msg) {
  console.log(`PASS ${msg}`);
}

function fail(msg) {
  console.error(`FAIL ${msg}`);
}

async function verifyToken(token, accountId) {
  const userVerify = await cfRequest({ token, path: '/user/tokens/verify' });
  if (userVerify.ok) return { mode: 'user' };

  const accountVerify = await cfRequest({
    token,
    path: `/accounts/${accountId}/tokens/verify`,
  });
  if (accountVerify.ok) return { mode: 'account' };

  throw new Error(
    `Token verification failed. user/tokens/verify => ${formatApiError(userVerify)}; accounts/${accountId}/tokens/verify => ${formatApiError(accountVerify)}`,
  );
}

async function main() {
  const env = await loadMergedEnv();
  const token = required('CLOUDFLARE_API_TOKEN', env.CLOUDFLARE_API_TOKEN);
  const accountId = required('CLOUDFLARE_ACCOUNT_ID', env.CLOUDFLARE_ACCOUNT_ID);
  const zoneId = required('CLOUDFLARE_ZONE_ID', env.CLOUDFLARE_ZONE_ID);
  const workerName = required('CLOUDFLARE_WORKER_NAME or wrangler name', env.CLOUDFLARE_WORKER_NAME || 'immigratetobrazil');

  const masked = `${token.slice(0, 4)}...${token.slice(-4)}`;
  console.log(`Cloudflare preflight starting (token ${masked}, account ${accountId}, zone ${zoneId}, worker ${workerName})`);

  const tokenMode = await verifyToken(token, accountId);
  pass(`Token is valid (${tokenMode.mode} token verify)`);

  const account = await cfRequest({ token, path: `/accounts/${accountId}` });
  if (!account.ok) {
    throw new Error(`Account access failed for ${accountId}: ${formatApiError(account)}`);
  }
  pass(`Account access works (${accountId})`);

  const zone = await cfRequest({ token, path: `/zones/${zoneId}` });
  if (!zone.ok) {
    throw new Error(`Zone access failed for ${zoneId}: ${formatApiError(zone)}`);
  }
  pass(`Zone access works (${zoneId})`);

  const workerService = await cfRequest({
    token,
    path: `/accounts/${accountId}/workers/services/${workerName}`,
  });
  if (!workerService.ok) {
    throw new Error(`Workers service access failed for ${workerName}: ${formatApiError(workerService)}`);
  }
  pass(`Workers service access works (${workerName})`);

  console.log('Cloudflare preflight completed successfully.');
}

main().catch((error) => {
  fail(error.message || String(error));
  process.exit(1);
});

