import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { Hero } from '@/components/hero';
import { ProcessTimeline } from '@/components/process-timeline';
import { ServiceGrid } from '@/components/service-grid';
import { TrustStrip } from '@/components/trust-strip';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

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

  return (
    <>
      <Hero locale={locale} />
      <TrustStrip locale={locale} />
      <ServiceGrid locale={locale} />
      <ProcessTimeline locale={locale} />
      <CtaCard locale={locale} />
    </>
  );
}
