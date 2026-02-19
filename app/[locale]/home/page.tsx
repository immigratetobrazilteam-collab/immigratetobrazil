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
    pathname: `/${locale}/home`,
    title: `Home Archive | ${copy[locale].brand}`,
    description: 'Legacy home-page family from the previous site, now indexed and accessible in the new structure.',
  });
}

export default async function HomeArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const [links, total] = await Promise.all([
    getRouteLinksByPrefix(locale, 'home', { includePrefixEntry: false, limit: 120 }),
    countRoutesByPrefix(locale, 'home', false),
  ]);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Home Archive</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Legacy home pages</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">
            This archive centralizes old homepage variants and state-focused entry pages so they are not lost in migration.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {total} home pages
            </span>
            <Link
              href={localizedPath(locale, '/library')}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              Open full library
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
