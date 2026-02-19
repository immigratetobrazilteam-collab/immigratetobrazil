import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const STATE_COOKIE = 'decap_oauth_state';

function callbackHtml(status: 'success' | 'error', payload: Record<string, string>) {
  const jsonPayload = JSON.stringify(payload);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Decap OAuth</title>
    <script>
      (function () {
        function receiveMessage() {
          window.opener.postMessage(
            'authorization:github:${status}:' + ${JSON.stringify(jsonPayload)},
            window.location.origin
          );
          window.removeEventListener('message', receiveMessage, false);
          window.close();
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', window.location.origin);
      })();
    </script>
  </head>
  <body>Authorizing Decap CMS...</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider') ?? 'github';
  if (provider !== 'github') {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code) {
    return new NextResponse(
      callbackHtml('error', { error: 'Missing OAuth code from GitHub callback' }),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  if (!state || !cookieState || state !== cookieState) {
    return new NextResponse(callbackHtml('error', { error: 'Invalid OAuth state' }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const clientId = process.env.DECAP_GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.DECAP_GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new NextResponse(
      callbackHtml('error', { error: 'Missing GitHub OAuth runtime secrets' }),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  const callbackUrl = new URL('/api/admin/oauth/callback', request.nextUrl.origin);
  callbackUrl.searchParams.set('provider', 'github');

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'immigratetobrazil-decap-oauth',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackUrl.toString(),
      state,
    }),
  });

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  const response = new NextResponse(
    tokenJson.access_token
      ? callbackHtml('success', { token: tokenJson.access_token })
      : callbackHtml('error', {
          error:
            tokenJson.error_description ||
            tokenJson.error ||
            `GitHub token exchange failed with status ${tokenRes.status}`,
        }),
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

  response.cookies.set(STATE_COOKIE, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });

  return response;
}
