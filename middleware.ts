import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAdminCredentials } from '@/lib/admin-auth';
import { applySecurityHeaders } from '@/lib/security-headers';

const LOCALES = new Set(['en', 'es', 'pt']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isFileRequest = /\.[a-zA-Z0-9]+$/.test(pathname);
  const isHtmlRequest = pathname.endsWith('.html');

  if (isAdminRoute) {
    const authResult = checkAdminCredentials(request);

    if (!authResult.ok) {
      if (authResult.reason === 'missing_config') {
        return applySecurityHeaders(
          new NextResponse('Admin access is locked: missing ADMIN_BASIC_AUTH_USER/ADMIN_BASIC_AUTH_PASS', {
            status: 503,
            headers: {
              'Cache-Control': 'no-store, max-age=0',
            },
          }),
        );
      }

      return applySecurityHeaders(
        new NextResponse('Authentication required', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm=\"Immigrate to Brazil Admin\", charset=\"UTF-8\"',
            'Cache-Control': 'no-store, max-age=0',
          },
        }),
      );
    }

    return applySecurityHeaders(NextResponse.next());
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/legacy-assets') ||
    pathname.startsWith('/assets') ||
    (isFileRequest && !isHtmlRequest)
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = segments.length > 0 && LOCALES.has(segments[0]);

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    const normalizedPath = pathname === '/' ? '' : pathname;
    url.pathname = `/en${normalizedPath}`;
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
