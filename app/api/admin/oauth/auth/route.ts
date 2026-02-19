import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const STATE_COOKIE = 'decap_oauth_state';

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider') ?? 'github';
  if (provider !== 'github') {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  }

  const clientId = process.env.DECAP_GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Missing DECAP_GITHUB_OAUTH_CLIENT_ID runtime secret' },
      { status: 500 },
    );
  }

  const state = randomUUID();
  const callbackUrl = new URL('/api/admin/oauth/callback', request.nextUrl.origin);
  callbackUrl.searchParams.set('provider', 'github');

  const scope = process.env.DECAP_GITHUB_OAUTH_SCOPE || 'repo,user';
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', callbackUrl.toString());
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authorizeUrl.toString(), { status: 302 });
  response.cookies.set(STATE_COOKIE, state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
  });
  return response;
}
