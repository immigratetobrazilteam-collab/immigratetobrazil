import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { LegacyContent } from '@/components/legacy-content';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks } from '@/lib/route-index';
import { faqStateCopy, getStateOrNull } from '@/lib/phase2-content';
import { buildFaqStateSlug, extractStateSlug, isLegacyFaqStateSlug } from '@/lib/phase2-routes';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type FaqStateManagedCopy = {
  eyebrow: string;
  backButtonLabel: string;
  fallbackMetaTitle: string;
  fallbackMetaDescription: string;
};

const faqStateFallback: FaqStateManagedCopy = {
  eyebrow: 'FAQ',
  backButtonLabel: 'Back to FAQ hub',
  fallbackMetaTitle: 'FAQ',
  fallbackMetaDescription: 'State FAQ page.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<FaqStateManagedCopy>(locale, 'faqStatePage', faqStateFallback);
  const legacy = await getLegacyDocument(locale, ['faq', slug]);

  if (legacy) {
    return createMetadata({
      locale,
      pathname: `/${locale}/faq/${slug}`,
      title: legacy.title,
      description: legacy.description,
    });
  }

  const stateSlug = extractStateSlug('faq', slug);
  const state = stateSlug ? getStateOrNull(stateSlug) : null;

  if (!state) {
    return createMetadata({
      locale,
      pathname: `/${locale}/faq/${slug}`,
      title: pageCopy.fallbackMetaTitle,
      description: pageCopy.fallbackMetaDescription,
    });
  }

  const t = faqStateCopy(locale, state);

  return createMetadata({
    locale,
    pathname: `/${locale}/faq/${slug}`,
    title: `${t.title} | ${copy[locale].brand}`,
    description: t.subtitle,
  });
}

export default async function FaqStatePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);

  if (isLegacyFaqStateSlug(slug)) {
    const stateSlug = extractStateSlug('faq', slug);
    if (stateSlug) {
      permanentRedirect(localizedPath(locale, `/faq/${buildFaqStateSlug(stateSlug)}`));
    }
  }

  const pageCopy = getManagedPageCopyWithFallback<FaqStateManagedCopy>(locale, 'faqStatePage', faqStateFallback);
  const nav = copy[locale].nav;
  const legacy = await getLegacyDocument(locale, ['faq', slug]);

  if (legacy) {
    const relatedLinks = await getRelatedRouteLinks(locale, `faq/${slug}`, 16);
    return (
      <>
        <BreadcrumbSchema
          items={[
            { name: nav.home, href: `/${locale}` },
            { name: nav.faq, href: `/${locale}/faq` },
            { name: legacy.heading, href: `/${locale}/faq/${slug}` },
          ]}
        />
        <LegacyContent locale={locale} document={legacy} slug={`faq/${slug}`} relatedLinks={relatedLinks} />
      </>
    );
  }

  const stateSlug = extractStateSlug('faq', slug);
  if (!stateSlug) notFound();

  const state = getStateOrNull(stateSlug);
  if (!state) notFound();

  const t = faqStateCopy(locale, state);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: nav.home, href: `/${locale}` },
          { name: nav.faq, href: `/${locale}/faq` },
          { name: t.title, href: `/${locale}/faq/${slug}` },
        ]}
      />
      <FaqSchema items={t.qa.map((item) => ({ question: item.q, answer: item.a }))} />

      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {t.qa.map((item) => (
            <article key={item.q} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{item.q}</h2>
              <p className="mt-3 text-sm text-ink-700">{item.a}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <Link
            href={localizedPath(locale, '/faq')}
            className="rounded-full border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900"
          >
            {pageCopy.backButtonLabel}
          </Link>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
