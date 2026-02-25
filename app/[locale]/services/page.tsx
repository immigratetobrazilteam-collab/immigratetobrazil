import type { Metadata } from 'next';
import Link from 'next/link';

import { brazilianStates } from '@/content/curated/states';
import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { RouteGroupCards } from '@/components/legacy-route-cards';
import { ManagedSeoLinks } from '@/components/managed-seo-links';
import { ServiceGrid } from '@/components/service-grid';
import { copy, resolveLocale } from '@/lib/i18n';
import { renderMetaTitle, type ManagedSeoCopy } from '@/lib/managed-seo';
import { countRoutesByPrefix, getPrefixGroups } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type ServicesPageManagedCopy = {
  seo: ManagedSeoCopy;
  heroTitle: string;
  heroSubtitle: string;
  serviceCountLabel: string;
  legacySectionTitle: string;
  legacySectionSubtitle: string;
  stateSectionTitle: string;
  stateSectionSubtitle: string;
};

const servicesPageFallback: ServicesPageManagedCopy = {
  seo: {
    metaTitleTemplate: '{{servicesLabel}} | {{brand}}',
    metaDescription: 'Legal immigration services, visa planning, and state-specific migration execution support in Brazil.',
    keywords: ['brazil immigration services', 'brazil visa lawyer', 'residency brazil'],
    faq: [
      {
        question: 'Do you handle both strategy and full-case execution?',
        answer: 'Yes. Service scope ranges from advisory strategy sessions to full execution and post-arrival compliance support.',
      },
    ],
    internalLinksTitle: 'Related service pages',
    internalLinks: [
      { href: '/visa-consultation', label: 'Visa consultation' },
      { href: '/process', label: 'Migration process' },
      { href: '/contact', label: 'Talk to the team' },
    ],
  },
  heroTitle: 'Structured services for every immigration stage',
  heroSubtitle: 'Choose a clear scope: strategic planning, full-case handling, or post-arrival continuity support.',
  serviceCountLabel: '{{count}} service routes indexed',
  legacySectionTitle: 'Legacy service archives by family',
  legacySectionSubtitle:
    'This section exposes full service categories from the old website, including state archive folders and legal/visa/residency families.',
  stateSectionTitle: 'State service hubs',
  stateSectionSubtitle:
    'Each state now has a dedicated modern route that links to migration services and localized guidance.',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<ServicesPageManagedCopy>(locale, 'servicesPage', servicesPageFallback);
  const brand = copy[locale].brand;
  const servicesLabel = copy[locale].nav.services;

  return createMetadata({
    locale,
    pathname: `/${locale}/services`,
    title: renderMetaTitle(pageCopy.seo.metaTitleTemplate, { servicesLabel, brand }, `${servicesLabel} | ${brand}`),
    description: pageCopy.seo.metaDescription,
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];
  const pageCopy = getManagedPageCopyWithFallback<ServicesPageManagedCopy>(locale, 'servicesPage', servicesPageFallback);

  const [allServiceGroups, serviceCount] = await Promise.all([
    getPrefixGroups(locale, 'services', { maxGroups: 24, sampleSize: 3 }),
    countRoutesByPrefix(locale, 'services', true),
  ]);
  const serviceGroups = allServiceGroups.filter((group) => !group.key.startsWith('immigrate-to-'));

  return (
    <>
      <FaqSchema items={pageCopy.seo.faq.map((item) => ({ question: item.question, answer: item.answer }))} />
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.services}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{pageCopy.heroTitle}</h1>
          <p className="mt-6 text-lg text-ink-700">{pageCopy.heroSubtitle}</p>
          <p className="mt-6 inline-flex rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
            {pageCopy.serviceCountLabel.replace('{{count}}', String(serviceCount))}
          </p>
        </div>
      </section>

      <ServiceGrid locale={locale} />

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{pageCopy.legacySectionTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.legacySectionSubtitle}</p>
          <div className="mt-8">
            <RouteGroupCards groups={serviceGroups} />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{pageCopy.stateSectionTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.stateSectionSubtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brazilianStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${locale}/services/immigrate-to-${state.slug}`}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {state[locale]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ManagedSeoLinks locale={locale} title={pageCopy.seo.internalLinksTitle} links={pageCopy.seo.internalLinks} />

      <CtaCard locale={locale} />
    </>
  );
}
