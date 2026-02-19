import type { Metadata } from 'next';
import Link from 'next/link';

import { brazilianStates } from '@/content/curated/states';
import { CtaCard } from '@/components/cta-card';
import { RouteGroupCards } from '@/components/legacy-route-cards';
import { ServiceGrid } from '@/components/service-grid';
import { copy, resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix, getPrefixGroups } from '@/lib/route-index';
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

  const [allServiceGroups, serviceCount] = await Promise.all([
    getPrefixGroups(locale, 'services', { maxGroups: 120, sampleSize: 3 }),
    countRoutesByPrefix(locale, 'services', true),
  ]);
  const serviceGroups = allServiceGroups.filter((group) => !group.key.startsWith('immigrate-to-'));

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.services}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Structured services for every immigration stage</h1>
          <p className="mt-6 text-lg text-ink-700">
            Choose a clear scope: strategic planning, full-case handling, or post-arrival continuity support.
          </p>
          <p className="mt-6 inline-flex rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
            {serviceCount} service routes indexed
          </p>
        </div>
      </section>

      <ServiceGrid locale={locale} />

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">Legacy service archives by family</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">
            This section exposes full service categories from the old website, including state archive folders and legal/visa/residency families.
          </p>
          <div className="mt-8">
            <RouteGroupCards groups={serviceGroups} />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">State service hubs</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">
            Each state now has a dedicated modern route that links to migration services and localized guidance.
          </p>
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

      <CtaCard locale={locale} />
    </>
  );
}
