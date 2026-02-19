import Link from 'next/link';

import { copy } from '@/lib/i18n';
import { localizedPath } from '@/lib/routes';
import type { Locale } from '@/lib/types';

interface CtaCardProps {
  locale: Locale;
}

export function CtaCard({ locale }: CtaCardProps) {
  const t = copy[locale];

  return (
    <section className="bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-civic-600/60 bg-gradient-to-r from-civic-700 to-ink-800 p-8 text-sand-50 shadow-glow sm:p-12">
          <h2 className="font-display text-3xl sm:text-4xl">{t.cta.title}</h2>
          <p className="mt-4 max-w-3xl text-sand-100/90">{t.cta.subtitle}</p>
          <Link
            href={localizedPath(locale, '/contact')}
            className="mt-8 inline-flex rounded-full bg-sand-50 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:bg-white"
          >
            {t.cta.button}
          </Link>
        </div>
      </div>
    </section>
  );
}
