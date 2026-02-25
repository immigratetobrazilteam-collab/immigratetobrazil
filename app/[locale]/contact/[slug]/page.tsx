import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { brazilianStates } from '@/content/curated/states';
import { ArticleSchema } from '@/components/article-schema';
import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { CtaCard } from '@/components/cta-card';
import { FormspreeContactForm } from '@/components/formspree-contact-form';
import { LegacyContent } from '@/components/legacy-content';
import { copy, locales, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks } from '@/lib/route-index';
import { contactStateCopy, getStateOrNull, stateName } from '@/lib/phase2-content';
import { extractStateSlug } from '@/lib/phase2-routes';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type ContactStateManagedCopy = {
  eyebrow: string;
  consultationButtonLabel: string;
  formTitleTemplate: string;
  fallbackMetaTitle: string;
  fallbackMetaDescription: string;
  schemaSectionLabel: string;
  keywordFallback: string;
};

const contactStateFallback: ContactStateManagedCopy = {
  eyebrow: 'State contact',
  consultationButtonLabel: 'Consultation',
  formTitleTemplate: 'Consultation request for {{state}}',
  fallbackMetaTitle: 'Contact',
  fallbackMetaDescription: 'Immigration contact page.',
  schemaSectionLabel: 'Contact',
  keywordFallback: 'Brazil consultation',
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    brazilianStates.map((state) => ({
      locale,
      slug: `contact-${state.slug}`,
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
  const pageCopy = getManagedPageCopyWithFallback<ContactStateManagedCopy>(locale, 'contactStatePage', contactStateFallback);
  const legacy = await getLegacyDocument(locale, ['contact', slug]);

  if (legacy) {
    return createMetadata({
      locale,
      pathname: `/${locale}/contact/${slug}`,
      title: legacy.title,
      description: legacy.description,
    });
  }

  const stateSlug = extractStateSlug('contact', slug);
  const state = stateSlug ? getStateOrNull(stateSlug) : null;

  if (!state) {
    return createMetadata({
      locale,
      pathname: `/${locale}/contact/${slug}`,
      title: pageCopy.fallbackMetaTitle,
      description: pageCopy.fallbackMetaDescription,
    });
  }

  const t = contactStateCopy(locale, state);

  return createMetadata({
    locale,
    pathname: `/${locale}/contact/${slug}`,
    title: `${t.title} | ${copy[locale].brand}`,
    description: t.subtitle,
  });
}

export default async function ContactStatePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<ContactStateManagedCopy>(locale, 'contactStatePage', contactStateFallback);
  const nav = copy[locale].nav;
  const legacy = await getLegacyDocument(locale, ['contact', slug]);

  if (legacy) {
    const relatedLinks = await getRelatedRouteLinks(locale, `contact/${slug}`, 16);
    return (
      <>
        <BreadcrumbSchema
          items={[
            { name: nav.home, href: `/${locale}` },
            { name: nav.contact, href: `/${locale}/contact` },
            { name: legacy.heading, href: `/${locale}/contact/${slug}` },
          ]}
        />
        <ArticleSchema
          locale={locale}
        pathname={`/${locale}/contact/${slug}`}
        headline={legacy.heading}
        description={legacy.description}
        section={pageCopy.schemaSectionLabel}
        keywords={[slug.replace(/^contact-/, '').replace(/-/g, ' '), 'Brazil immigration contact']}
      />
        <LegacyContent locale={locale} document={legacy} slug={`contact/${slug}`} relatedLinks={relatedLinks} />
      </>
    );
  }

  const stateSlug = extractStateSlug('contact', slug);

  if (!stateSlug) notFound();

  const state = getStateOrNull(stateSlug);
  if (!state) notFound();

  const t = contactStateCopy(locale, state);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: nav.home, href: `/${locale}` },
          { name: nav.contact, href: `/${locale}/contact` },
          { name: t.title, href: `/${locale}/contact/${slug}` },
        ]}
      />
      <ArticleSchema
        locale={locale}
        pathname={`/${locale}/contact/${slug}`}
        headline={t.title}
        description={t.subtitle}
        section={pageCopy.schemaSectionLabel}
        keywords={[state.slug.replace(/-/g, ' '), pageCopy.keywordFallback]}
      />
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
          <p className="mt-4 text-sm text-ink-500">{stateName(state, locale)} ({state.code})</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {t.cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{card.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{card.detail}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizedPath(locale, '/contact')}
              className="rounded-full border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900"
            >
              {copy[locale].nav.contact}
            </Link>
            <Link
              href={localizedPath(locale, '/visa-consultation')}
              className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-sand-50"
            >
              {pageCopy.consultationButtonLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <FormspreeContactForm
            locale={locale}
            context={`contact-${state.slug}`}
            title={pageCopy.formTitleTemplate.replace('{{state}}', stateName(state, locale))}
          />
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
