import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { checkAdminCredentials } from '@/lib/admin-auth';

const LOCALES = new Set(['en', 'es', 'pt', 'fr']);

function unauthorizedResponse() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ImmigrateToBrazil Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

function adminConfigMissingResponse() {
  return new NextResponse('Admin auth is not configured.', {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApiRoute = pathname === '/api/admin' || pathname.startsWith('/api/admin/');
  const isFileRequest = /\.[a-zA-Z0-9]+$/.test(pathname);
  const isHtmlRequest = pathname.endsWith('.html');

  if (isAdminRoute || isAdminApiRoute) {
    const auth = checkAdminCredentials(request);
    if (!auth.ok) {
      return auth.reason === 'missing_config' ? adminConfigMissingResponse() : unauthorizedResponse();
    }
  }

  if (isAdminRoute) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/legacy-assets') ||
    pathname.startsWith('/assets') ||
    (isFileRequest && !isHtmlRequest)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = segments.length > 0 && LOCALES.has(segments[0]);

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    const normalizedPath = pathname === '/' ? '' : pathname;
    url.pathname = `/en${normalizedPath}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
