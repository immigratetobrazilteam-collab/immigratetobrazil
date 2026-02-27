import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArticleSchema } from '@/components/article-schema';
import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { copy, resolveLocale } from '@/lib/i18n';
import {
  discoverPathFromSlug,
  getDiscoverHubCopy,
  getDiscoverManifest,
  getDiscoverPage,
  type DiscoverContentBlock,
} from '@/lib/discover-pages-content';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export const revalidate = 3600;

type Params = {
  locale: string;
  slug: string[];
};

function segmentLabel(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveGuideHref(locale: Locale, href: string) {
  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  ) {
    return href;
  }

  return localizedPath(locale, href);
}

function renderBlock(block: DiscoverContentBlock, key: string) {
  if (block.type === 'subheading') {
    return (
      <h3 key={key} className="mt-6 text-xl font-semibold text-ink-900">
        {block.text}
      </h3>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <p key={key} className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink-700">
        {block.text}
      </p>
    );
  }

  if (block.type === 'list') {
    return (
      <ul key={key} className="mt-4 space-y-2">
        {block.items.map((item, index) => (
          <li
            key={`${key}-${index}`}
            className="whitespace-pre-line rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-ink-800"
          >
            {item}
          </li>
        ))}
      </ul>
    );
  }

  const toneClass =
    block.tone === 'tip'
      ? 'border-civic-300 bg-civic-50 text-civic-900'
      : block.tone === 'highlight'
        ? 'border-amber-300 bg-amber-50 text-amber-900'
        : block.tone === 'compliance'
          ? 'border-rose-300 bg-rose-50 text-rose-900'
          : 'border-sand-300 bg-sand-50 text-ink-800';

  return (
    <aside key={key} className={`mt-5 whitespace-pre-line rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      {block.text}
    </aside>
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const page = await getDiscoverPage(locale, slug);

  if (!page) {
    return createMetadata({
      locale,
      pathname: `/${locale}/discover/${slug.join('/')}`,
      title: 'Discover',
      description: 'Discover pages for Brazil migration and relocation.',
    });
  }

  return createMetadata({
    locale,
    pathname: `/${locale}${page.pathname}`,
    title: page.seo.metaTitle,
    description: page.seo.metaDescription,
  });
}

export default async function DiscoverManagedPage({ params }: { params: Promise<Params> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);

  const [page, hub, manifest] = await Promise.all([
    getDiscoverPage(locale, slug),
    getDiscoverHubCopy(locale),
    getDiscoverManifest(locale),
  ]);

  if (!page) notFound();

  const titleBySlug = new Map(manifest.pages.map((entry) => [entry.slug, entry.title]));
  const cumulative = [];
  for (let idx = 0; idx < slug.length; idx += 1) {
    cumulative.push(slug.slice(0, idx + 1).join('/'));
  }

  const breadcrumbItems = [
    { name: copy[locale].nav.home, href: `/${locale}` },
    { name: hub.title, href: `/${locale}/discover` },
    ...cumulative.map((item) => ({
      name: titleBySlug.get(item) || segmentLabel(item.split('/').pop() || item),
      href: `/${locale}${discoverPathFromSlug(item)}`,
    })),
  ];

  const toc = page.tableOfContents.length
    ? page.tableOfContents
    : page.sections.map((section) => ({ id: section.id, label: section.heading }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ArticleSchema
        locale={locale}
        pathname={`/${locale}${page.pathname}`}
        headline={page.title}
        description={page.seo.metaDescription}
        section="Discover"
        keywords={page.seo.keywords}
      />
      {page.faq.length ? <FaqSchema items={page.faq} /> : null}

      <section className="relative overflow-hidden border-b border-sand-200 bg-gradient-to-br from-ink-950 via-ink-900 to-civic-900 text-sand-50">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-civic-400/20 blur-2xl" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sand-100/10 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-civic-200">{hub.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight text-white lg:text-6xl">{page.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-sand-100/90">{page.heroIntro}</p>

          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em]">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">{page.taxonomy.type}</span>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">{page.sourceUpdatedLabel}</span>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">Reviewed {page.lastReviewedAt}</span>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-8">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-700">On this page</p>
              <nav className="mt-4 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-800 transition hover:border-civic-300 hover:bg-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-700">Source</p>
              <p className="mt-2 text-xs text-ink-600">{page.sourcePath}</p>
              <p className="mt-3 text-xs text-ink-600">Owner: {page.owner}</p>
              <p className="mt-1 text-xs text-ink-600">Review cadence: every {page.reviewEveryDays} days</p>
            </div>
          </aside>

          <div className="space-y-6">
            {page.sections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-28 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-civic-700">{page.taxonomy.type}</p>
                <h2 className="mt-2 font-display text-3xl text-ink-900">{section.heading}</h2>
                <p className="mt-3 text-base leading-relaxed text-ink-700">{section.summary}</p>

                {section.blocks.map((block, index) => renderBlock(block, `${section.id}-${index}`))}
              </article>
            ))}
          </div>
        </div>
      </section>

      {page.faq.length ? (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl text-ink-900">Frequently asked questions</h2>
            <div className="mt-6 space-y-3">
              {page.faq.map((item) => (
                <details key={item.question} className="rounded-xl border border-sand-200 bg-sand-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-ink-900">{item.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-sand-50">
        <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
            <h2 className="font-display text-3xl text-ink-900">{page.cta.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-700">{page.cta.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={resolveGuideHref(locale, page.cta.primaryHref)}
                className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-sand-50"
              >
                {page.cta.primaryLabel}
              </Link>
              <Link
                href={resolveGuideHref(locale, page.cta.secondaryHref)}
                className="rounded-full border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900"
              >
                {page.cta.secondaryLabel}
              </Link>
              <Link
                href={localizedPath(locale, '/discover')}
                className="rounded-full border border-civic-300 bg-civic-50 px-5 py-2.5 text-sm font-semibold text-civic-900"
              >
                Back to Discover
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
