import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/about`,
    title: `${copy[locale].nav.about} | ${copy[locale].brand}`,
    description:
      'Built to replace static duplication with a modern architecture that improves performance, governance, and long-term content scaling.',
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.about}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Architecture-first redesign for long-term growth</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            The platform is now structured around reusable components, locale-aware routes, and dynamic rendering for legacy pages.
            This eliminates manual HTML duplication while keeping your historical footprint reachable.
          </p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Scalable by design</h2>
            <p className="mt-3 text-sm text-ink-700">
              Dynamic routing supports a large content inventory without maintaining separate static templates for every page.
            </p>
          </article>
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Governance-ready</h2>
            <p className="mt-3 text-sm text-ink-700">
              Shared metadata and route conventions provide consistent SEO, accessibility, and compliance structure.
            </p>
          </article>
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Migration-safe</h2>
            <p className="mt-3 text-sm text-ink-700">
              Existing pages can be loaded through the legacy bridge while you progressively migrate into structured content.
            </p>
          </article>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
