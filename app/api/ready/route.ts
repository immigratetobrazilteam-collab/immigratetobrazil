import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const requiredChecks = {
    runtimeBooted: true,
  };

  const optionalChecks = {
    siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    adminAuthConfigured:
      Boolean(process.env.ADMIN_BASIC_AUTH_USER) &&
      Boolean(process.env.ADMIN_BASIC_AUTH_PASS),
  };

  const ready = Object.values(requiredChecks).every(Boolean);

  return NextResponse.json(
    {
      status: ready ? 'ready' : 'not_ready',
      checks: requiredChecks,
      optionalChecks,
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
