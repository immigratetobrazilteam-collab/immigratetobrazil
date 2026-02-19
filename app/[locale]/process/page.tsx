import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { ProcessTimeline } from '@/components/process-timeline';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/process`,
    title: `${copy[locale].nav.process} | ${copy[locale].brand}`,
    description: copy[locale].sections.processSubtitle,
  });
}

export default async function ProcessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.process}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Controlled workflow from intake to legal stabilization</h1>
          <p className="mt-6 text-lg text-ink-700">
            Every stage has documented inputs, quality checks, and clear owner accountability.
          </p>
        </div>
      </section>
      <ProcessTimeline locale={locale} />
      <CtaCard locale={locale} />
    </>
  );
}
