import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { Hero } from '@/components/hero';
import { ProcessTimeline } from '@/components/process-timeline';
import { ServiceGrid } from '@/components/service-grid';
import { TrustStrip } from '@/components/trust-strip';
import { copy, resolveLocale } from '@/lib/i18n';
import { getSiteCmsCopy } from '@/lib/site-cms-content';
import { createMetadata } from '@/lib/seo';
import { localizedPath } from '@/lib/routes';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}`,
    title: `${t.brand} | Premium Immigration Advisory`,
    description: t.hero.subtitle,
  });
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const site = getSiteCmsCopy(locale);

  return (
    <>
      <Hero locale={locale} />
      <TrustStrip locale={locale} />
      <ServiceGrid locale={locale} />
      <ProcessTimeline locale={locale} />
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{site.homeContentMap.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl text-ink-900">{site.homeContentMap.heading}</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {site.homeContentMap.links.map((item) => (
              <Link
                key={item.href}
                href={localizedPath(locale, item.href)}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaCard locale={locale} />
    </>
  );
}
