import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const now = new Date().toISOString();

  return NextResponse.json(
    {
      status: 'ok',
      service: 'immigratetobrazil-web',
      environment: process.env.NEXTJS_ENV || process.env.NODE_ENV || 'unknown',
      timestamp: now,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
