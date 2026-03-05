import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { Hero } from '@/components/hero';
import { ManagedSeoLinks } from '@/components/managed-seo-links';
import { ProcessTimeline } from '@/components/process-timeline';
import { ServiceGrid } from '@/components/service-grid';
import { TrustStrip } from '@/components/trust-strip';
import { copy, resolveLocale } from '@/lib/i18n';
import { renderMetaTitle, type ManagedSeoCopy } from '@/lib/managed-seo';
import { getManagedPageCopyWithFallback, getSiteCmsCopy } from '@/lib/site-cms-content';
import { createMetadata } from '@/lib/seo';
import { localizedPath } from '@/lib/routes';
import { countRoutesByPrefix, getPrefixGroups, getRouteLinksByPrefix } from '@/lib/route-index';

const homePageSeoFallback: ManagedSeoCopy = {
  metaTitleTemplate: '{{brand}} | Premium Immigration Advisory',
  metaDescription:
    'Immigration strategy, legal planning, and relocation execution support for moving to Brazil.',
  keywords: ['immigrate to brazil', 'brazil visa', 'brazil residency'],
  faq: [
    {
      question: 'What is the first step to immigrate to Brazil?',
      answer: 'Start with eligibility mapping so visa category, documentation scope, and timeline are defined before filing.',
    },
  ],
  internalLinksTitle: 'Popular migration pathways',
  internalLinks: [
    { href: '/services', label: 'Services overview' },
    { href: '/visa-consultation', label: 'Visa consultation' },
    { href: '/contact', label: 'Contact advisors' },
  ],
};

type HomePageExperienceCopy = {
  journeyTitle: string;
  journeySubtitle: string;
  journeys: Array<{
    title: string;
    description: string;
    href: string;
    cta: string;
  }>;
  pathwaysTitle: string;
  pathwaysSubtitle: string;
  pathways: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  sectionHubsTitle: string;
  sectionHubsSubtitle: string;
  sectionHubs: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  regionExplorerTitle: string;
  regionExplorerSubtitle: string;
  regionExplorerCta: string;
  stateExplorerTitle: string;
  stateExplorerSubtitle: string;
  stateExplorerCta: string;
  knowledgeTitle: string;
  knowledgeSubtitle: string;
  knowledgeLinks: Array<{ label: string; href: string }>;
  finalBannerEyebrow: string;
  finalBannerTitle: string;
  finalBannerSubtitle: string;
  finalPrimaryCta: string;
  finalSecondaryCta: string;
};

const homePageExperienceFallback: HomePageExperienceCopy = {
  journeyTitle: 'Choose the path that matches your move',
  journeySubtitle:
    'Start from your profile and timeline, then move into the exact legal and relocation pages you need.',
  journeys: [
    {
      title: 'Family relocation',
      description: 'Family reunion, schooling, and compliant long-term settlement planning.',
      href: '/services/residencies/family-reunion',
      cta: 'Open family path',
    },
    {
      title: 'Investor and entrepreneur',
      description: 'Investor visas, company setup, and legal execution sequencing.',
      href: '/services/visas/investor',
      cta: 'Open investor path',
    },
    {
      title: 'Remote professional',
      description: 'Digital nomad options, documentation standards, and arrival setup.',
      href: '/services/visas/digital-nomad',
      cta: 'Open nomad path',
    },
    {
      title: 'Retirement transition',
      description: 'Retiree residency strategy, income proof, and compliance checkpoints.',
      href: '/services/visas/retiree',
      cta: 'Open retiree path',
    },
  ],
  pathwaysTitle: 'Visa and residency pathways',
  pathwaysSubtitle: 'Explore core pathways before diving into state-specific service archives.',
  pathways: [
    { title: 'Visa categories', description: 'Compare major visa categories and suitability signals.', href: '/services/visas' },
    { title: 'Residency routes', description: 'Understand temporary and permanent residency flows.', href: '/services/residencies' },
    { title: 'Naturalisation', description: 'Review naturalisation routes and preparation stages.', href: '/services/naturalisation' },
    { title: 'Legal services', description: 'Supporting legal operations beyond visa filing.', href: '/services/legal' },
  ],
  sectionHubsTitle: 'Core site hubs',
  sectionHubsSubtitle: 'Use these hubs to navigate strategy content, legal pages, and location guides.',
  sectionHubs: [
    { title: 'Services hub', description: 'Full advisory and execution service map.', href: '/services' },
    { title: 'Discover hub', description: 'Regional and city-level move planning pages.', href: '/discover' },
    { title: 'About Brazil', description: 'Foundational country and relocation context.', href: '/about/about-brazil' },
    { title: 'About states', description: 'State-by-state orientation and differences.', href: '/about/about-states' },
    { title: 'Resources hub', description: 'Operational guides and planning frameworks.', href: '/resources-guides-brazil' },
    { title: 'Process page', description: 'How engagement works from intake to landing.', href: '/process' },
  ],
  regionExplorerTitle: 'Regional discover coverage',
  regionExplorerSubtitle:
    'Navigate broad region hubs first, then drill into states and city-level migration pages.',
  regionExplorerCta: 'Open region',
  stateExplorerTitle: 'State-level strategy coverage',
  stateExplorerSubtitle:
    'Top-level state pages connect legal context, cost framing, and localized planning routes.',
  stateExplorerCta: 'Open state page',
  knowledgeTitle: 'Read before you decide',
  knowledgeSubtitle: 'Shortlist your move with these key guidance pages.',
  knowledgeLinks: [
    { label: 'Cost of Living in Brazil', href: '/about/about-brazil/cost-of-living-in-brazil' },
    { label: 'Apply to Brazil', href: '/about/about-brazil/apply-brazil' },
    { label: 'Visa Consultation', href: '/visa-consultation' },
    { label: 'FAQ Hub', href: '/faq' },
    { label: 'Contact Hub', href: '/contact' },
    { label: 'All Pages Library', href: '/library' },
  ],
  finalBannerEyebrow: 'Start the process',
  finalBannerTitle: 'Build your Brazil move plan with legal clarity',
  finalBannerSubtitle:
    'Book a strategy session and receive a concrete pathway, document map, and execution order for your profile.',
  finalPrimaryCta: 'Book Strategy Consultation',
  finalSecondaryCta: 'Contact Advisory Team',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];
  const seo = getManagedPageCopyWithFallback<ManagedSeoCopy>(locale, 'homePageSeo', homePageSeoFallback);

  return createMetadata({
    locale,
    pathname: `/${locale}`,
    title: renderMetaTitle(seo.metaTitleTemplate, { brand: t.brand }, `${t.brand} | Premium Immigration Advisory`),
    description: seo.metaDescription || t.hero.subtitle,
  });
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const site = getSiteCmsCopy(locale);
  const seo = getManagedPageCopyWithFallback<ManagedSeoCopy>(locale, 'homePageSeo', homePageSeoFallback);
  const experience = getManagedPageCopyWithFallback<HomePageExperienceCopy>(
    locale,
    'homePageExperience',
    homePageExperienceFallback,
  );
  const [discoverRegions, aboutStates, discoverCount, servicesCount] = await Promise.all([
    getPrefixGroups(locale, 'discover/brazilian-regions', { maxGroups: 5, sampleSize: 1 }),
    getRouteLinksByPrefix(locale, 'about/about-states', { includePrefixEntry: false, limit: 12 }),
    countRoutesByPrefix(locale, 'discover', true),
    countRoutesByPrefix(locale, 'services', true),
  ]);

  return (
    <>
      <FaqSchema items={seo.faq.map((item) => ({ question: item.question, answer: item.answer }))} />
      <Hero locale={locale} />
      <TrustStrip locale={locale} />
      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{experience.journeyTitle}</h2>
          <p className="mt-3 max-w-3xl text-ink-700">{experience.journeySubtitle}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {experience.journeys.map((journey) => (
              <article key={journey.title} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
                <h3 className="font-display text-2xl text-ink-900">{journey.title}</h3>
                <p className="mt-3 text-sm text-ink-700">{journey.description}</p>
                <Link
                  href={localizedPath(locale, journey.href)}
                  className="mt-5 inline-flex rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-900 transition hover:border-civic-500"
                >
                  {journey.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ServiceGrid locale={locale} />
      <ProcessTimeline locale={locale} />
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {`${servicesCount} service routes`}
            </span>
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {`${discoverCount} discover routes`}
            </span>
          </div>
          <h2 className="mt-5 font-display text-3xl text-ink-900">{experience.pathwaysTitle}</h2>
          <p className="mt-3 max-w-3xl text-ink-700">{experience.pathwaysSubtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {experience.pathways.map((pathway) => (
              <Link
                key={pathway.title}
                href={localizedPath(locale, pathway.href)}
                className="rounded-2xl border border-sand-200 bg-sand-50 p-5 shadow-sm transition hover:border-civic-300"
              >
                <h3 className="font-display text-2xl text-ink-900">{pathway.title}</h3>
                <p className="mt-3 text-sm text-ink-700">{pathway.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{experience.sectionHubsTitle}</h2>
          <p className="mt-3 max-w-3xl text-ink-700">{experience.sectionHubsSubtitle}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {experience.sectionHubs.map((hub) => (
              <Link
                key={hub.title}
                href={localizedPath(locale, hub.href)}
                className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm transition hover:border-civic-300"
              >
                <h3 className="font-display text-2xl text-ink-900">{hub.title}</h3>
                <p className="mt-3 text-sm text-ink-700">{hub.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{experience.regionExplorerTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{experience.regionExplorerSubtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {discoverRegions.map((region) => (
              <Link
                key={region.key}
                href={region.href}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {region.label} ({region.count}) - {experience.regionExplorerCta}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{experience.stateExplorerTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{experience.stateExplorerSubtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aboutStates.map((state) => (
              <Link
                key={state.slug}
                href={state.href}
                className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {state.title} - {experience.stateExplorerCta}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{experience.knowledgeTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{experience.knowledgeSubtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {experience.knowledgeLinks.map((item) => (
              <Link
                key={item.href}
                href={localizedPath(locale, item.href)}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{site.homeContentMap.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl text-ink-900">{site.homeContentMap.heading}</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {site.homeContentMap.links.map((item) => (
              <Link
                key={item.href}
                href={localizedPath(locale, item.href)}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-sand-200 bg-gradient-to-r from-ink-950 via-ink-900 to-civic-900 text-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-200">{experience.finalBannerEyebrow}</p>
          <h2 className="mt-4 max-w-4xl font-display text-4xl text-white sm:text-5xl">{experience.finalBannerTitle}</h2>
          <p className="mt-6 max-w-3xl text-sand-100/90">{experience.finalBannerSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizedPath(locale, '/book-strategy-consultation')}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900"
            >
              {experience.finalPrimaryCta}
            </Link>
            <Link
              href={localizedPath(locale, '/contact')}
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white"
            >
              {experience.finalSecondaryCta}
            </Link>
          </div>
        </div>
      </section>
      <ManagedSeoLinks locale={locale} title={seo.internalLinksTitle} links={seo.internalLinks} />
      <CtaCard locale={locale} />
    </>
  );
}
