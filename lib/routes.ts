import type { Locale } from '@/lib/types';

export function localizedPath(locale: Locale, path = '') {
  if (!path || path === '/') return `/${locale}`;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

export function stripLocaleFromPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'en' || segments[0] === 'es' || segments[0] === 'pt') {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}
