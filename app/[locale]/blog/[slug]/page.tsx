import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { brazilianStates } from '@/content/curated/states';
import { CtaCard } from '@/components/cta-card';
import { LegacyContent } from '@/components/legacy-content';
import { copy, locales, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks } from '@/lib/route-index';
import { blogStateCopy, getStateOrNull } from '@/lib/phase2-content';
import { extractStateSlug } from '@/lib/phase2-routes';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    brazilianStates.map((state) => ({
      locale,
      slug: `blog-${state.slug}`,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const legacy = await getLegacyDocument(locale, ['blog', slug]);

  if (legacy) {
    return createMetadata({
      locale,
      pathname: `/${locale}/blog/${slug}`,
      title: legacy.title,
      description: legacy.description,
    });
  }

  const stateSlug = extractStateSlug('blog', slug);
  const state = stateSlug ? getStateOrNull(stateSlug) : null;

  if (!state) {
    return createMetadata({
      locale,
      pathname: `/${locale}/blog/${slug}`,
      title: 'Blog',
      description: 'State blog page.',
    });
  }

  const t = blogStateCopy(locale, state);

  return createMetadata({
    locale,
    pathname: `/${locale}/blog/${slug}`,
    title: `${t.title} | ${copy[locale].brand}`,
    description: t.subtitle,
  });
}

export default async function BlogStatePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const legacy = await getLegacyDocument(locale, ['blog', slug]);

  if (legacy) {
    const relatedLinks = await getRelatedRouteLinks(locale, `blog/${slug}`, 16);
    return <LegacyContent locale={locale} document={legacy} slug={`blog/${slug}`} relatedLinks={relatedLinks} />;
  }

  const stateSlug = extractStateSlug('blog', slug);
  if (!stateSlug) notFound();

  const state = getStateOrNull(stateSlug);
  if (!state) notFound();

  const t = blogStateCopy(locale, state);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">State guide</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {t.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{section.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{section.detail}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <Link
            href={localizedPath(locale, '/blog')}
            className="rounded-full border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900"
          >
            {copy[locale].nav.blog}
          </Link>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
