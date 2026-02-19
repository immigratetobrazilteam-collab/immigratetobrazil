import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { ServiceGrid } from '@/components/service-grid';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/services`,
    title: `${copy[locale].nav.services} | ${copy[locale].brand}`,
    description: copy[locale].sections.servicesSubtitle,
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.services}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Structured services for every immigration stage</h1>
          <p className="mt-6 text-lg text-ink-700">
            Choose a clear scope: strategic planning, full-case handling, or post-arrival continuity support.
          </p>
        </div>
      </section>
      <ServiceGrid locale={locale} />
      <CtaCard locale={locale} />
    </>
  );
}
