import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix } from '@/lib/route-index';
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

  const [aboutBrazilCount, aboutStatesCount, aboutUsCount, accessibilityCount] = await Promise.all([
    countRoutesByPrefix(locale, 'about/about-brazil', false),
    countRoutesByPrefix(locale, 'about/about-states', false),
    countRoutesByPrefix(locale, 'about/about-us', true),
    countRoutesByPrefix(locale, 'accessibility', true),
  ]);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.about}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Architecture-first redesign for long-term growth</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Your historical content is now mapped into reusable route families. Instead of losing old pages, this layer turns them into structured hubs that are easier to navigate, audit, and expand.
          </p>
          <div className="mt-8">
            <Link
              href={`/${locale}/library`}
              className="inline-flex rounded-full bg-ink-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-sand-50"
            >
              Open full page library
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">About Brazil</h2>
            <p className="mt-3 text-sm text-ink-700">Core guides for living in Brazil, with food, festivals, and high-level orientation topics.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">{aboutBrazilCount} pages</p>
            <Link href={`/${locale}/about/about-brazil`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              Open hub
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">About States</h2>
            <p className="mt-3 text-sm text-ink-700">State-by-state informational pages migrated from the old architecture.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">{aboutStatesCount} pages</p>
            <Link href={`/${locale}/about/about-states`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              Open hub
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">About Us</h2>
            <p className="mt-3 text-sm text-ink-700">Mission, legal positioning, expertise, trust indicators, and outcome pages.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">{aboutUsCount} pages</p>
            <Link href={`/${locale}/about/about-us`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              Open hub
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Values</h2>
            <p className="mt-3 text-sm text-ink-700">Core principles that guide how the firm communicates, advises, and executes.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">Brand identity page</p>
            <Link href={`/${locale}/about/values`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              Open values
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Mission</h2>
            <p className="mt-3 text-sm text-ink-700">The operating mission behind the firm&apos;s immigration strategy model.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">Brand identity page</p>
            <Link href={`/${locale}/about/mission`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              Open mission
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Story</h2>
            <p className="mt-3 text-sm text-ink-700">How the advisory started and expanded into a national support model.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">Brand identity page</p>
            <Link href={`/${locale}/about/story`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              Open story
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Accessibility</h2>
            <p className="mt-3 text-sm text-ink-700">Accessibility and inclusive-use documentation migrated into the new structure.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">{accessibilityCount} page</p>
            <Link href={`/${locale}/accessibility`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              Open accessibility center
            </Link>
          </article>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
