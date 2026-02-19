import type { Metadata } from 'next';
import Link from 'next/link';

import { brazilianStates } from '@/content/curated/states';
import { getBlogHighlights } from '@/lib/content';
import { copy, resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/blog`,
    title: `${copy[locale].nav.blog} | ${copy[locale].brand}`,
    description: copy[locale].sections.blogSubtitle,
  });
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];
  const articles = getBlogHighlights(locale);
  const stateArchiveCount = await countRoutesByPrefix(locale, 'blog', false);

  return (
    <>
      <section className="bg-sand-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.blog}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.sections.blogTitle}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.sections.blogSubtitle}</p>
          <p className="mt-6 inline-flex rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
            {stateArchiveCount} state blog pages indexed
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <article key={article.slug} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-2xl text-ink-900">{article.title}</h2>
                <p className="mt-3 text-sm text-ink-700">{article.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">State blog archives</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">
            Legacy state-specific blog pages are now linked here as part of the redesigned information architecture.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brazilianStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${locale}/blog/blog-${state.slug}`}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {state[locale]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
