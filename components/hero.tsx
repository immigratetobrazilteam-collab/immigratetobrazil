import Link from 'next/link';

import { copy } from '@/lib/i18n';
import { localizedPath } from '@/lib/routes';
import type { Locale } from '@/lib/types';

interface HeroProps {
  locale: Locale;
}

export function Hero({ locale }: HeroProps) {
  const t = copy[locale];

  return (
    <section className="relative overflow-hidden border-b border-sand-200/70 bg-gradient-to-br from-sand-50 via-sand-100 to-civic-100">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-civic-300/40 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-sand-300/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div className="space-y-8 animate-fade-up">
          <span className="inline-flex rounded-full border border-civic-400/40 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-civic-800">
            {t.hero.eyebrow}
          </span>
          <h1 className="font-display text-4xl leading-tight text-ink-900 sm:text-5xl lg:text-6xl">{t.hero.title}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-700">{t.hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizedPath(locale, '/contact')}
              className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-sand-50 shadow-card transition hover:-translate-y-0.5 hover:bg-ink-800"
            >
              {t.hero.primaryCta}
            </Link>
            <Link
              href={localizedPath(locale, '/services')}
              className="rounded-full border border-ink-300 bg-white/80 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:border-ink-500"
            >
              {t.hero.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-civic-700">Modern platform highlights</p>
            <ul className="mt-6 space-y-4 text-sm text-ink-700">
              <li className="rounded-2xl border border-sand-200 bg-sand-50/80 p-4">
                Unified locale architecture with EN, ES, and PT route strategy.
              </li>
              <li className="rounded-2xl border border-sand-200 bg-sand-50/80 p-4">
                Dynamic legacy bridge that scales past thousands of existing pages.
              </li>
              <li className="rounded-2xl border border-sand-200 bg-sand-50/80 p-4">
                Structured premium UI system for trust-first immigration conversion.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
