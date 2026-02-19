'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { copy, localeNavLinks } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import { cn } from '@/lib/utils';

import { LanguageSwitcher } from './language-switcher';

interface SiteHeaderProps {
  locale: Locale;
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const t = copy[locale];
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);

  const links = useMemo(() => localeNavLinks(locale), [locale]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="group inline-flex items-center gap-3">
          <span className="inline-flex h-11 w-11 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-civic-700 to-ink-800 text-sm font-black uppercase tracking-[0.12em] text-sand-50 shadow-glow">
            ITB
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg text-ink-900">{t.brand}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-civic-700">Premium Advisory</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  active
                    ? 'bg-ink-900 text-sand-50'
                    : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/contact`}
            className="rounded-full bg-civic-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-civic-800"
          >
            {t.nav.contact}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-200 bg-white text-ink-800 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? '×' : '≡'}</span>
        </button>
      </div>

      <div className={cn('border-t border-sand-200 bg-sand-50 lg:hidden', open ? 'block' : 'hidden')}>
        <div className="space-y-2 px-4 py-4">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block rounded-xl px-3 py-2 text-sm font-semibold',
                  active ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
