import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

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
              placeholder="Search visas, residency, states, naturalisation, process..."
              className="h-12 w-full rounded-xl border border-sand-300 bg-sand-50 px-4 text-sm text-ink-900 placeholder:text-ink-500 focus:border-civic-500 focus:outline-none"
            />
            <button type="submit" className="h-12 rounded-xl bg-civic-700 px-5 text-sm font-semibold text-white hover:bg-civic-800">
              Search
            </button>
          </form>

          <div className="mt-4 text-sm text-ink-700">Static mode: use the quick links below to navigate site sections.</div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
