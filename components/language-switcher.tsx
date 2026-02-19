'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { locales, resolveLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

const labels: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  pt: 'PT',
};

function buildPath(target: Locale, pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const current = resolveLocale(segments[0]);
  const tail = segments.slice(current === segments[0] ? 1 : 0).join('/');
  return `/${target}${tail ? `/${tail}` : ''}`;
}

export function LanguageSwitcher() {
  const pathname = usePathname() || '/en';
  const current = resolveLocale(pathname.split('/').filter(Boolean)[0]);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-sand-200 bg-white/85 p-1 text-xs shadow-sm backdrop-blur">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={buildPath(locale, pathname)}
            className={`rounded-full px-2.5 py-1 font-semibold transition ${
              active ? 'bg-ink-900 text-sand-50' : 'text-ink-600 hover:bg-sand-100 hover:text-ink-900'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {labels[locale]}
          </Link>
        );
      })}
    </div>
  );
}
