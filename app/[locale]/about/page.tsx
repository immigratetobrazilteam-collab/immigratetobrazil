import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { ManagedSeoLinks } from '@/components/managed-seo-links';
import { copy, resolveLocale } from '@/lib/i18n';
import { renderMetaTitle, type ManagedSeoCopy } from '@/lib/managed-seo';
import { countRoutesByPrefix } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type AboutCardKey = 'aboutBrazil' | 'aboutStates' | 'aboutUs' | 'values' | 'mission' | 'story' | 'accessibility';

type AboutCardCopy = {
  title: string;
  description: string;
  countLabel: string;
  ctaLabel: string;
  href: string;
};

type AboutPageManagedCopy = {
  seo: ManagedSeoCopy;
  heroTitle: string;
  heroSubtitle: string;
  libraryButtonLabel: string;
  cards: Record<AboutCardKey, AboutCardCopy>;
};

const aboutPageFallback: AboutPageManagedCopy = {
  seo: {
    metaTitleTemplate: '{{aboutLabel}} | {{brand}}',
    metaDescription:
      'Built to replace static duplication with a modern architecture that improves performance, governance, and long-term content scaling.',
    keywords: ['about immigrate to brazil', 'brazil relocation planning', 'immigration advisory'],
    faq: [
      {
        question: 'What can I find on the About section?',
        answer: 'You can browse Brazil guides, state guides, firm profile pages, and migration methodology content.',
      },
    ],
    internalLinksTitle: 'Recommended next steps',
    internalLinks: [
      { href: '/services', label: 'Explore services' },
      { href: '/process', label: 'View migration process' },
      { href: '/contact', label: 'Start consultation' },
    ],
  },
  heroTitle: 'Architecture-first redesign for long-term growth',
  heroSubtitle:
    'Your historical content is now mapped into reusable route families. Instead of losing old pages, this layer turns them into structured hubs that are easier to navigate, audit, and expand.',
  libraryButtonLabel: 'Open full page library',
  cards: {
    aboutBrazil: {
      title: 'About Brazil',
      description: 'Core guides for living in Brazil, with food, festivals, and high-level orientation topics.',
      countLabel: '{{count}} pages',
      ctaLabel: 'Open hub',
      href: '/about/about-brazil',
    },
    aboutStates: {
      title: 'About States',
      description: 'State-by-state informational pages migrated from the old architecture.',
      countLabel: '{{count}} pages',
      ctaLabel: 'Open hub',
      href: '/about/about-states',
    },
    aboutUs: {
      title: 'About Us',
      description: 'Mission, legal positioning, expertise, trust indicators, and outcome pages.',
      countLabel: '{{count}} pages',
      ctaLabel: 'Open hub',
      href: '/about/about-us',
    },
    values: {
      title: 'Values',
      description: 'Core principles that guide how the firm communicates, advises, and executes.',
      countLabel: 'Brand identity page',
      ctaLabel: 'Open values',
      href: '/about/values',
    },
    mission: {
      title: 'Mission',
      description: "The operating mission behind the firm's immigration strategy model.",
      countLabel: 'Brand identity page',
      ctaLabel: 'Open mission',
      href: '/about/mission',
    },
    story: {
      title: 'Story',
      description: 'How the advisory started and expanded into a national support model.',
      countLabel: 'Brand identity page',
      ctaLabel: 'Open story',
      href: '/about/story',
    },
    accessibility: {
      title: 'Accessibility',
      description: 'Accessibility and inclusive-use documentation migrated into the new structure.',
      countLabel: '{{count}} page',
      ctaLabel: 'Open accessibility center',
      href: '/accessibility',
    },
  },
};

function renderCountLabel(template: string, count: number) {
  return template.includes('{{count}}') ? template.replace('{{count}}', String(count)) : template;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<AboutPageManagedCopy>(locale, 'aboutPage', aboutPageFallback);
  const nav = copy[locale].nav;
  const brand = copy[locale].brand;

  return createMetadata({
    locale,
    pathname: `/${locale}/about`,
    title: renderMetaTitle(pageCopy.seo.metaTitleTemplate, { aboutLabel: nav.about, brand }, `${nav.about} | ${brand}`),
    description: pageCopy.seo.metaDescription,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];
  const pageCopy = getManagedPageCopyWithFallback<AboutPageManagedCopy>(locale, 'aboutPage', aboutPageFallback);

  const [aboutBrazilCount, aboutStatesCount, aboutUsCount, accessibilityCount] = await Promise.all([
    countRoutesByPrefix(locale, 'about/about-brazil', false),
    countRoutesByPrefix(locale, 'about/about-states', false),
    countRoutesByPrefix(locale, 'about/about-us', true),
    countRoutesByPrefix(locale, 'accessibility', true),
  ]);

  return (
    <>
      <FaqSchema items={pageCopy.seo.faq.map((item) => ({ question: item.question, answer: item.answer }))} />
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.about}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{pageCopy.heroTitle}</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">{pageCopy.heroSubtitle}</p>
          <div className="mt-8">
            <Link
              href={`/${locale}/library`}
              className="inline-flex rounded-full bg-ink-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-sand-50"
            >
              {pageCopy.libraryButtonLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{pageCopy.cards.aboutBrazil.title}</h2>
            <p className="mt-3 text-sm text-ink-700">{pageCopy.cards.aboutBrazil.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {renderCountLabel(pageCopy.cards.aboutBrazil.countLabel, aboutBrazilCount)}
            </p>
            <Link href={`/${locale}${pageCopy.cards.aboutBrazil.href}`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {pageCopy.cards.aboutBrazil.ctaLabel}
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{pageCopy.cards.aboutStates.title}</h2>
            <p className="mt-3 text-sm text-ink-700">{pageCopy.cards.aboutStates.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {renderCountLabel(pageCopy.cards.aboutStates.countLabel, aboutStatesCount)}
            </p>
            <Link href={`/${locale}${pageCopy.cards.aboutStates.href}`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {pageCopy.cards.aboutStates.ctaLabel}
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{pageCopy.cards.aboutUs.title}</h2>
            <p className="mt-3 text-sm text-ink-700">{pageCopy.cards.aboutUs.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {renderCountLabel(pageCopy.cards.aboutUs.countLabel, aboutUsCount)}
            </p>
            <Link href={`/${locale}${pageCopy.cards.aboutUs.href}`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {pageCopy.cards.aboutUs.ctaLabel}
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{pageCopy.cards.values.title}</h2>
            <p className="mt-3 text-sm text-ink-700">{pageCopy.cards.values.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {renderCountLabel(pageCopy.cards.values.countLabel, 0)}
            </p>
            <Link href={`/${locale}${pageCopy.cards.values.href}`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {pageCopy.cards.values.ctaLabel}
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{pageCopy.cards.mission.title}</h2>
            <p className="mt-3 text-sm text-ink-700">{pageCopy.cards.mission.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {renderCountLabel(pageCopy.cards.mission.countLabel, 0)}
            </p>
            <Link href={`/${locale}${pageCopy.cards.mission.href}`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {pageCopy.cards.mission.ctaLabel}
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{pageCopy.cards.story.title}</h2>
            <p className="mt-3 text-sm text-ink-700">{pageCopy.cards.story.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {renderCountLabel(pageCopy.cards.story.countLabel, 0)}
            </p>
            <Link href={`/${locale}${pageCopy.cards.story.href}`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {pageCopy.cards.story.ctaLabel}
            </Link>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{pageCopy.cards.accessibility.title}</h2>
            <p className="mt-3 text-sm text-ink-700">{pageCopy.cards.accessibility.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {renderCountLabel(pageCopy.cards.accessibility.countLabel, accessibilityCount)}
            </p>
            <Link href={`/${locale}${pageCopy.cards.accessibility.href}`} className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
              {pageCopy.cards.accessibility.ctaLabel}
            </Link>
          </article>
        </div>
      </section>

      <ManagedSeoLinks locale={locale} title={pageCopy.seo.internalLinksTitle} links={pageCopy.seo.internalLinks} />

      <CtaCard locale={locale} />
    </>
  );
}
