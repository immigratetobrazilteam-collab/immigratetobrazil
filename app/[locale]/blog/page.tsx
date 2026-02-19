import type { Metadata } from 'next';

import { getBlogHighlights } from '@/lib/content';
import { copy, resolveLocale } from '@/lib/i18n';
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

  return (
    <section className="bg-sand-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.blog}</p>
        <h1 className="mt-4 font-display text-5xl text-ink-900">{t.sections.blogTitle}</h1>
        <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.sections.blogSubtitle}</p>

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
  );
}
