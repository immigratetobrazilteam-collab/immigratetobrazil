import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security-headers';

const LOCALES = new Set(['en', 'es', 'pt']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isFileRequest = /\.[a-zA-Z0-9]+$/.test(pathname);
  const isHtmlRequest = pathname.endsWith('.html');

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
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
