import Link from 'next/link';

import { copy } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

interface SiteFooterProps {
  locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const t = copy[locale];

  return (
    <footer className="border-t border-sand-200 bg-ink-900 text-sand-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <p className="font-display text-2xl">{t.brand}</p>
          <p className="max-w-sm text-sm text-sand-200/90">{t.footer.tagline}</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">Navigation</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href={`/${locale}`} className="hover:text-white">
              {t.nav.home}
            </Link>
            <Link href={`/${locale}/services`} className="hover:text-white">
              {t.nav.services}
            </Link>
            <Link href={`/${locale}/process`} className="hover:text-white">
              {t.nav.process}
            </Link>
            <Link href={`/${locale}/faq`} className="hover:text-white">
              FAQ
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-white">
              {t.nav.contact}
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">Legal</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href={`/${locale}/policies/privacy`} className="hover:text-white">
              Privacy
            </Link>
            <Link href={`/${locale}/policies/terms`} className="hover:text-white">
              Terms
            </Link>
            <Link href={`/${locale}/policies/cookies`} className="hover:text-white">
              Cookies
            </Link>
          </div>
          <p className="text-sm text-sand-200/90">{t.footer.legal}</p>
        </div>
      </div>
      <div className="border-t border-ink-700/60 px-4 py-4 text-center text-xs text-sand-300">
        © {new Date().getFullYear()} Immigrate to Brazil. All rights reserved.
      </div>
    </footer>
  );
}
