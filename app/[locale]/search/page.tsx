import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLocaleRoutes, routeTitle, type RouteIndexEntry } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';

type SearchParams = {
  q?: string;
};

function toHref(locale: string, slug: string) {
  if (!slug) return `/${locale}`;
  return `/${locale}/${slug}`;
}

function scoreMatch(entry: RouteIndexEntry, query: string) {
  const title = routeTitle(entry).toLowerCase();
  const slug = entry.slug.toLowerCase();
  if (!title.includes(query) && !slug.includes(query)) return -1;

  let score = 0;
  if (title === query) score += 120;
  if (slug === query) score += 110;
  if (title.startsWith(query)) score += 80;
  if (slug.startsWith(query)) score += 70;
  if (title.includes(query)) score += 30;
  if (slug.includes(query)) score += 20;
  return score;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/search`,
    title: `Search | ${copy[locale].brand}`,
    description: 'Search all immigration, process, state, and legal pages.',
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const resolvedSearch = await searchParams;

  const query = (resolvedSearch.q || '').trim().slice(0, 120);
  const normalizedQuery = query.toLowerCase();

  let results: RouteIndexEntry[] = [];

  if (normalizedQuery) {
    const routes = await getLocaleRoutes(locale);
    results = routes
      .map((entry) => ({ entry, score: scoreMatch(entry, normalizedQuery) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return routeTitle(a.entry).localeCompare(routeTitle(b.entry));
      })
      .slice(0, 80)
      .map((item) => item.entry);
  }

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Site Search</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Find any page fast</h1>
          <p className="mt-6 text-lg text-ink-700">Search all services, process pages, states, legal policies, blog archives, and resources.</p>

          <form action={`/${locale}/search`} method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search visas, residency, states, naturalisation, process..."
              className="h-12 w-full rounded-xl border border-sand-300 bg-sand-50 px-4 text-sm text-ink-900 placeholder:text-ink-500 focus:border-civic-500 focus:outline-none"
            />
            <button type="submit" className="h-12 rounded-xl bg-civic-700 px-5 text-sm font-semibold text-white hover:bg-civic-800">
              Search
            </button>
          </form>

          <div className="mt-4 text-sm text-ink-700">
            {normalizedQuery ? `${results.length} result(s) for "${query}"` : 'Enter a query to search the full site archive.'}
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {normalizedQuery ? (
            results.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((entry) => (
                  <article key={entry.slug} className="rounded-2xl border border-sand-200 bg-white p-5">
                    <h2 className="font-display text-2xl text-ink-900">{routeTitle(entry)}</h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-civic-700">/{entry.slug}</p>
                    <p className="mt-3 text-sm text-ink-700">{entry.description || 'Legacy page in the modernized route map.'}</p>
                    <Link
                      href={toHref(locale, entry.slug)}
                      className="mt-4 inline-flex rounded-full border border-sand-300 bg-sand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800 hover:border-civic-300"
                    >
                      Open page
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-sand-200 bg-white p-6 text-sm text-ink-700">
                No matches found. Try broader terms like &quot;visa&quot;, &quot;residency&quot;, &quot;state&quot;, or
                &quot;naturalisation&quot;.
              </div>
            )
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Link href={`/${locale}/services`} className="rounded-2xl border border-sand-200 bg-white p-5 text-ink-800 hover:border-civic-300">
                Explore Services
              </Link>
              <Link href={`/${locale}/discover/brazilian-states`} className="rounded-2xl border border-sand-200 bg-white p-5 text-ink-800 hover:border-civic-300">
                Browse All States
              </Link>
              <Link href={`/${locale}/library`} className="rounded-2xl border border-sand-200 bg-white p-5 text-ink-800 hover:border-civic-300">
                Open Full Library
              </Link>
            </div>
          )}
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
