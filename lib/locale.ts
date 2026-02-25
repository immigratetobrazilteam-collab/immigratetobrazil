import type { Locale } from '@/lib/types';

export const locales: Locale[] = ['en', 'es', 'pt', 'fr'];
export const defaultLocale: Locale = 'en';

export function resolveLocale(input?: string): Locale {
  if (!input) return defaultLocale;
  return locales.includes(input as Locale) ? (input as Locale) : defaultLocale;
}
