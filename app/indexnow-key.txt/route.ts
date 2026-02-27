export const runtime = 'nodejs';

function clean(value: string | undefined) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET() {
  const key = clean(process.env.INDEXNOW_API_KEY);
  if (!key) {
    return new Response('INDEXNOW_API_KEY is not configured.\n', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return new Response(`${key}\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
