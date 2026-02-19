import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const checks = {
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  };

  const ready = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: ready ? 'ready' : 'not_ready',
      checks,
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
