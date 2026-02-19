import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { RouteLinkGrid } from '@/components/legacy-route-cards';
import { copy, resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix, getRouteLinksByPrefix } from '@/lib/route-index';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-states`,
    title: `About States Library | ${copy[locale].brand}`,
    description: 'State-by-state legacy archive redesigned into a modern, searchable route hub.',
  });
}

export default async function AboutStatesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const [links, total] = await Promise.all([
    getRouteLinksByPrefix(locale, 'about/about-states', { includePrefixEntry: false, limit: 120 }),
    countRoutesByPrefix(locale, 'about/about-states', false),
  ]);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">About States</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Brazil states archive</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">
            Every state page from your previous site is now exposed in the new design system with consistent navigation and styling.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {total} state pages
            </span>
            <Link
              href={localizedPath(locale, '/about')}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              Back to About
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <RouteLinkGrid links={links} />
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
