import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { getDiscoverHubCopy, getDiscoverHubIndex } from '@/lib/discover-pages-content';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const hub = await getDiscoverHubCopy(locale);

  return createMetadata({
    locale,
    pathname: `/${locale}/discover`,
    title: `${hub.title} | ${copy[locale].brand}`,
    description: hub.subtitle,
  });
}

export default async function DiscoverHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const [hub, hubIndex] = await Promise.all([getDiscoverHubCopy(locale), getDiscoverHubIndex(locale)]);

  const statePages = hubIndex.statePages.slice(0, 27);
  const citySamples = hubIndex.citySamples.slice(0, 24);

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand-200 bg-gradient-to-br from-ink-950 via-ink-900 to-civic-900 text-sand-50">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-civic-300/20 blur-2xl" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-sand-100/10 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-civic-200">{hub.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight text-white lg:text-6xl">{hub.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-sand-100/90">{hub.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
              {hub.countLabel.replace('{{count}}', String(hubIndex.pageCount))}
            </span>
            <Link
              href={localizedPath(locale, '/discover/brazilian-states')}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              {hub.browseStatesLabel}
            </Link>
            <Link
              href={localizedPath(locale, '/discover/brazilian-regions')}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              {hub.browseRegionsLabel}
            </Link>
            <Link
              href={localizedPath(locale, '/visa-consultation')}
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-900"
            >
              {hub.consultationLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {statePages.map((page) => (
              <article key={page.slug} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-civic-700">State Overview</p>
                <h2 className="mt-2 font-display text-2xl text-ink-900">{page.title}</h2>
                <p className="mt-3 text-sm text-ink-700">{page.heroIntro}</p>
                <Link
                  href={localizedPath(locale, page.pathname)}
                  className="mt-5 inline-flex rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-900 transition hover:border-civic-500"
                >
                  Open page
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">City and Regional Guides</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">
            Managed long-tail discover pages migrated from legacy structure. Each page now renders from editable managed content.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {citySamples.map((page) => (
              <Link
                key={page.slug}
                href={localizedPath(locale, page.pathname)}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
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
