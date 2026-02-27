import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import { getAllStateGuides, getStateGuideHubCopy, stateGuidePathBySlug } from '@/lib/state-guides-content';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const hubCopy = getStateGuideHubCopy(locale);

  return createMetadata({
    locale,
    pathname: `/${locale}/state-guides`,
    title: `${hubCopy.title} | ${copy[locale].brand}`,
    description: hubCopy.subtitle,
  });
}

export default async function StateGuidesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const hubCopy = getStateGuideHubCopy(locale);
  const guides = getAllStateGuides(locale);

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand-200 bg-gradient-to-br from-ink-950 via-ink-900 to-civic-900 text-sand-50">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-civic-300/20 blur-2xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sand-100/10 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-civic-200">{hubCopy.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight text-white lg:text-6xl">{hubCopy.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-sand-100/90">{hubCopy.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
              {hubCopy.countLabel.replace('{{count}}', String(guides.length))}
            </span>
            <Link
              href={localizedPath(locale, '/blog')}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              {hubCopy.backToBlogLabel}
            </Link>
            <Link
              href={localizedPath(locale, '/visa-consultation')}
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-900"
            >
              {hubCopy.consultationLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {guides.map((guide) => (
            <article key={guide.slug} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-civic-700">State Guide</p>
              <h2 className="mt-2 font-display text-2xl text-ink-900">{guide.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">{guide.heroIntro}</p>

              {guide.tableOfContents.length ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">
                  {guide.tableOfContents.length} content sections
                </p>
              ) : null}

              <p className="mt-2 text-xs text-ink-500">{guide.sourceUpdatedLabel}</p>

              <Link
                href={localizedPath(locale, stateGuidePathBySlug(guide.slug))}
                className="mt-5 inline-flex rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-900 transition hover:border-civic-500"
              >
                Open guide
              </Link>
            </article>
          ))}
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
