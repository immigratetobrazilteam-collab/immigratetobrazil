const BASE_URL = (process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const checks = [
  { path: '/en', expect: 200, type: 'text/html' },
  { path: '/es', expect: 200, type: 'text/html' },
  { path: '/pt', expect: 200, type: 'text/html' },
  { path: '/api/health', expect: 200, type: 'application/json' },
  { path: '/api/ready', expect: 200, type: 'application/json' },
];

async function run() {
  let failed = false;

  for (const check of checks) {
    const url = `${BASE_URL}${check.path}`;

    try {
      const response = await fetch(url, { redirect: 'follow' });
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
      console.error(`FAIL ${url} network_error=${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failed) {
    process.exit(1);
  }
}

run();
