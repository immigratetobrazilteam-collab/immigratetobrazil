import type { Metadata } from 'next';
import Link from 'next/link';

import { getBlogHighlights } from '@/lib/content';
import { copy, resolveLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';
import { getAllStateGuides, stateGuidePathBySlug } from '@/lib/state-guides-content';

type BlogHubManagedCopy = {
  stateArchiveCountLabel: string;
  stateArchiveTitle: string;
  stateArchiveSubtitle: string;
};

const blogHubFallback: BlogHubManagedCopy = {
  stateArchiveCountLabel: '{{count}} state blog pages indexed',
  stateArchiveTitle: 'State blog archives',
  stateArchiveSubtitle:
    'Legacy state-specific blog pages are now linked here as part of the redesigned information architecture.',
};

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
  const pageCopy = getManagedPageCopyWithFallback<BlogHubManagedCopy>(locale, 'blogHubPage', blogHubFallback);
  const articles = getBlogHighlights(locale);
  const stateGuides = getAllStateGuides(locale);
  const stateArchiveCount = stateGuides.length;

  return (
    <>
      <section className="bg-sand-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.blog}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.sections.blogTitle}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.sections.blogSubtitle}</p>
          <p className="mt-6 inline-flex rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
            {pageCopy.stateArchiveCountLabel.replace('{{count}}', String(stateArchiveCount))}
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
          <h2 className="font-display text-3xl text-ink-900">{pageCopy.stateArchiveTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.stateArchiveSubtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stateGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={localizedPath(locale, stateGuidePathBySlug(guide.slug))}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
