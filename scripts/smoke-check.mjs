const BASE_URL = (process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ATTEMPTS = Number(process.env.SMOKE_MAX_ATTEMPTS || 1);
const RETRY_DELAY_MS = Number(process.env.SMOKE_RETRY_DELAY_MS || 0);
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || 15000);
const USER_AGENT =
  process.env.SMOKE_USER_AGENT ||
  'Mozilla/5.0 (compatible; ImmigrateToBrazilSmoke/1.0; +https://immigratetobrazil.com)';

const locales = ['en', 'es', 'pt', 'fr'];
const localeLandingChecks = locales.map((locale) => ({ path: `/${locale}`, expect: 200, type: 'text/html' }));
const keyRouteChecks = [
  { path: '/en/about', expect: 200, type: 'text/html' },
  { path: '/en/services', expect: 200, type: 'text/html' },
  { path: '/en/contact', expect: 200, type: 'text/html' },
  { path: '/en/about/about-brazil/apply-brazil', expect: 200, type: 'text/html' },
  { path: '/fr/about', expect: 200, type: 'text/html' },
];

const checks = [
  ...localeLandingChecks,
  ...keyRouteChecks,
  { path: '/api/health', expect: 200, type: 'application/json' },
  { path: '/api/ready', expect: 200, type: 'application/json' },
  { path: '/api/ops/summary', expect: 200, type: 'application/json' },
];

async function runSingleAttempt(attempt) {
  let allPassed = true;

  for (const check of checks) {
    let failed = false;
    const sep = check.path.includes('?') ? '&' : '?';
    const url = `${BASE_URL}${check.path}${sep}smoke_attempt=${attempt}&ts=${Date.now()}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: check.type === 'application/json' ? 'application/json,*/*;q=0.8' : 'text/html,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);
      const contentType = response.headers.get('content-type') || '';
      const statusOk = response.status === check.expect;
      const typeOk = contentType.includes(check.type);

      if (!statusOk || !typeOk) {
        failed = true;
        let bodySnippet = '';
        try {
          bodySnippet = (await response.text()).slice(0, 140).replace(/\s+/g, ' ');
        } catch {
          bodySnippet = '';
        }
        console.error(
          `FAIL ${url} status=${response.status} type=${contentType}${bodySnippet ? ` body="${bodySnippet}"` : ''}`,
        );
      } else {
        console.log(`OK   ${url} status=${response.status}`);
      }
    } catch (error) {
      failed = true;
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`FAIL ${url} network_error=${reason}`);
    }

    if (failed) {
      allPassed = false;
    }
  }

  return allPassed;
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
