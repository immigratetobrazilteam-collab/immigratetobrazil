import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { RouteLinkGrid } from '@/components/legacy-route-cards';
import { copy, resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix, getRouteLinksByPrefix } from '@/lib/route-index';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type HomeArchiveManagedCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  countLabel: string;
  libraryButtonLabel: string;
};

const homeArchiveFallback: HomeArchiveManagedCopy = {
  eyebrow: 'Home Archive',
  title: 'Legacy home pages',
  subtitle: 'This archive centralizes old homepage variants and state-focused entry pages so they are not lost in migration.',
  countLabel: '{{count}} home pages',
  libraryButtonLabel: 'Open full library',
};

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
  const pageCopy = getManagedPageCopyWithFallback<HomeArchiveManagedCopy>(locale, 'homeArchivePage', homeArchiveFallback);

  const [links, total] = await Promise.all([
    getRouteLinksByPrefix(locale, 'home', { includePrefixEntry: false, limit: 120 }),
    countRoutesByPrefix(locale, 'home', false),
  ]);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{pageCopy.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{pageCopy.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {pageCopy.countLabel.replace('{{count}}', String(total))}
            </span>
            <Link
              href={localizedPath(locale, '/library')}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              {pageCopy.libraryButtonLabel}
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
