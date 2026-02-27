import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CtaCard } from '@/components/cta-card';
import { brazilianStates } from '@/content/curated/states';
import { copy, resolveLocale } from '@/lib/i18n';
import { getDiscoverHubIndex } from '@/lib/discover-pages-content';
import { createMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

type RegionSlug = 'north-region' | 'northeast-region' | 'central-west-region' | 'southeast-region' | 'south-region';

const REGION_MAP: Record<
  RegionSlug,
  {
    label: string;
    stateRegion: 'north' | 'northeast' | 'central-west' | 'southeast' | 'south';
  }
> = {
  'north-region': { label: 'North', stateRegion: 'north' },
  'northeast-region': { label: 'Northeast', stateRegion: 'northeast' },
  'central-west-region': { label: 'Central-West', stateRegion: 'central-west' },
  'southeast-region': { label: 'Southeast', stateRegion: 'southeast' },
  'south-region': { label: 'South', stateRegion: 'south' },
};

function isRegionSlug(value: string): value is RegionSlug {
  return value in REGION_MAP;
}

function stateHref(locale: Locale, code: string) {
  return `/${locale}/discover/brazilian-states/${code.toLowerCase()}`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; region: string }> }): Promise<Metadata> {
  const { locale: rawLocale, region } = await params;
  const locale = resolveLocale(rawLocale);

  if (!isRegionSlug(region)) {
    return createMetadata({
      locale,
      pathname: `/${locale}/discover/brazilian-regions/${region}`,
      title: `Region | ${copy[locale].brand}`,
      description: 'Region guide for Brazil discover pages.',
    });
  }

  const regionLabel = REGION_MAP[region].label;

  return createMetadata({
    locale,
    pathname: `/${locale}/discover/brazilian-regions/${region}`,
    title: `${regionLabel} Region | ${copy[locale].brand}`,
    description: `State and city discover routes for Brazil's ${regionLabel} region.`,
  });
}

export default async function DiscoverRegionPage({ params }: { params: Promise<{ locale: string; region: string }> }) {
  const { locale: rawLocale, region } = await params;
  const locale = resolveLocale(rawLocale);

  if (!isRegionSlug(region)) {
    notFound();
  }

  const regionMeta = REGION_MAP[region];
  const hubIndex = await getDiscoverHubIndex(locale);

  const states = brazilianStates
    .filter((state) => state.region === regionMeta.stateRegion)
    .sort((a, b) => a[locale].localeCompare(b[locale]))
    .map((state) => ({
      label: state[locale],
      href: stateHref(locale, state.code),
    }));

  const cityPages = hubIndex.citySamples
    .filter((page) => page.taxonomy.segments[1] === region)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 120);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Brazil Region</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{regionMeta.label} Region</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">
            Explore state overviews and city-level relocation pages for the {regionMeta.label.toLowerCase()} of Brazil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em]">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-civic-800">{states.length} states</span>
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-civic-800">{cityPages.length} city pages</span>
            <Link href={`/${locale}/discover/brazilian-regions`} className="rounded-full border border-sand-300 bg-sand-50 px-3 py-1 text-ink-800">
              All regions
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">States in this region</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {states.map((state) => (
              <Link
                key={state.href}
                href={state.href}
                className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {state.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">City guides</h2>
          <p className="mt-3 text-sm text-ink-700">City pages in the managed discover archive for this region.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cityPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${locale}/discover/${page.slug}`}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-ink-800 transition hover:border-civic-300 hover:bg-white"
              >
                {page.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
