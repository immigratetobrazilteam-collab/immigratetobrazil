import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { Hero } from '@/components/hero';
import { ManagedSeoLinks } from '@/components/managed-seo-links';
import { ProcessTimeline } from '@/components/process-timeline';
import { ServiceGrid } from '@/components/service-grid';
import { TrustStrip } from '@/components/trust-strip';
import { copy, resolveLocale } from '@/lib/i18n';
import { renderMetaTitle, type ManagedSeoCopy } from '@/lib/managed-seo';
import { getManagedPageCopyWithFallback, getSiteCmsCopy } from '@/lib/site-cms-content';
import { createMetadata } from '@/lib/seo';
import { localizedPath } from '@/lib/routes';

const homePageSeoFallback: ManagedSeoCopy = {
  metaTitleTemplate: '{{brand}} | Premium Immigration Advisory',
  metaDescription:
    'Immigration strategy, legal planning, and relocation execution support for moving to Brazil.',
  keywords: ['immigrate to brazil', 'brazil visa', 'brazil residency'],
  faq: [
    {
      question: 'What is the first step to immigrate to Brazil?',
      answer: 'Start with eligibility mapping so visa category, documentation scope, and timeline are defined before filing.',
    },
  ],
  internalLinksTitle: 'Popular migration pathways',
  internalLinks: [
    { href: '/services', label: 'Services overview' },
    { href: '/visa-consultation', label: 'Visa consultation' },
    { href: '/contact', label: 'Contact advisors' },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];
  const seo = getManagedPageCopyWithFallback<ManagedSeoCopy>(locale, 'homePageSeo', homePageSeoFallback);

  return createMetadata({
    locale,
    pathname: `/${locale}`,
    title: renderMetaTitle(seo.metaTitleTemplate, { brand: t.brand }, `${t.brand} | Premium Immigration Advisory`),
    description: seo.metaDescription || t.hero.subtitle,
  });
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const site = getSiteCmsCopy(locale);
  const seo = getManagedPageCopyWithFallback<ManagedSeoCopy>(locale, 'homePageSeo', homePageSeoFallback);

  return (
    <>
      <FaqSchema items={seo.faq.map((item) => ({ question: item.question, answer: item.answer }))} />
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
      <ManagedSeoLinks locale={locale} title={seo.internalLinksTitle} links={seo.internalLinks} />
      <CtaCard locale={locale} />
    </>
  );
}
