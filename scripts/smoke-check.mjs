const BASE_URL = (process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ATTEMPTS = Number(process.env.SMOKE_MAX_ATTEMPTS || 1);
const RETRY_DELAY_MS = Number(process.env.SMOKE_RETRY_DELAY_MS || 0);
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || 15000);

const checks = [
  { path: '/en', expect: 200, type: 'text/html' },
  { path: '/es', expect: 200, type: 'text/html' },
  { path: '/pt', expect: 200, type: 'text/html' },
  { path: '/api/health', expect: 200, type: 'application/json' },
  { path: '/api/ready', expect: 200, type: 'application/json' },
];

async function runSingleAttempt(attempt) {
  const results = await Promise.all(
    checks.map(async (check) => {
      let failed = false;
      const sep = check.path.includes('?') ? '&' : '?';
      const url = `${BASE_URL}${check.path}${sep}smoke_attempt=${attempt}&ts=${Date.now()}`;

      try {
        const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const contentType = response.headers.get('content-type') || '';
      const statusOk = response.status === check.expect;
      const typeOk = contentType.includes(check.type);

      if (!statusOk || !typeOk) {
        failed = true;
        console.error(`FAIL ${url} status=${response.status} type=${contentType}`);
      } else {
        console.log(`OK   ${url} status=${response.status}`);
      }
    } catch (error) {
      failed = true;
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`FAIL ${url} network_error=${reason}`);
    }
      return !failed;
    }),
  );

  return results.every(Boolean);
}

async function sleep(ms) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  for (let i = 1; i <= ATTEMPTS; i += 1) {
    const ok = await runSingleAttempt(i);
    if (ok) {
      return;
    }

    if (i < ATTEMPTS) {
      console.log(`Smoke attempt ${i} failed; retrying in ${RETRY_DELAY_MS}ms...`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  process.exit(1);
}

run();
