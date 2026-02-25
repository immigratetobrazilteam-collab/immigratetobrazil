import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type AccessibilityManagedCopy = {
  metaTitleTemplate: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  libraryButtonLabel: string;
  fallbackCardTitle: string;
  fallbackCardBody: string;
};

const accessibilityFallback: AccessibilityManagedCopy = {
  metaTitleTemplate: 'Accessibility | {{brand}}',
  metaDescription: 'Accessibility center and migrated legacy accessibility statement.',
  eyebrow: 'Accessibility',
  title: 'Accessibility center',
  subtitle:
    'Accessibility content from your legacy site is now part of the modern route map. This section provides direct access to the original policy and supporting pages.',
  libraryButtonLabel: 'Open full library',
  fallbackCardTitle: 'Accessibility statement',
  fallbackCardBody:
    'The accessibility content is being consolidated. Contact us if you need any support in accessing documents or using this website.',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<AccessibilityManagedCopy>(locale, 'accessibilityPage', accessibilityFallback);

  return createMetadata({
    locale,
    pathname: `/${locale}/accessibility`,
    title: pageCopy.metaTitleTemplate.replace('{{brand}}', copy[locale].brand),
    description: pageCopy.metaDescription,
  });
}

export default async function AccessibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<AccessibilityManagedCopy>(locale, 'accessibilityPage', accessibilityFallback);
  const legacy = await getLegacyDocument(locale, ['accessibility']);
  const sections = legacy?.sections.slice(0, 6) || [];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{pageCopy.title}</h1>
          <p className="mt-6 text-lg text-ink-700">{pageCopy.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/library`}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              {pageCopy.libraryButtonLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          {sections.length ? (
            sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-2xl text-ink-900">{section.title}</h2>
                <div className="mt-3 space-y-2 text-sm text-ink-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{pageCopy.fallbackCardTitle}</h2>
              <p className="mt-3 text-sm text-ink-700">{pageCopy.fallbackCardBody}</p>
            </article>
          )}
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
