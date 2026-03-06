import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { ManagedSeoLinks } from '@/components/managed-seo-links';
import { ABOUT_BRAZIL_HUB_NAV_LINK_IDS } from '@/lib/about-brazil-hub';
import { getDiscoverHubIndex } from '@/lib/discover-pages-content';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { renderMetaTitle, type ManagedSeoCopy } from '@/lib/managed-seo';
import { getNavigationMap } from '@/lib/navigation-map-content';
import { countRoutesByPrefix, getRouteLinksByPrefix } from '@/lib/route-index';
import { localizedPath, stripLocaleFromPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';
import type { Locale } from '@/lib/types';

type HeroChip = {
  label: string;
};

type HeroCta = {
  label: string;
  href: string;
};

type AboutBrazilSectionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  itemDescriptions: Record<string, string>;
};

type AboutBrazilHubManagedCopy = {
  seo: ManagedSeoCopy;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: HeroCta;
    secondaryCta: HeroCta;
    statChips: HeroChip[];
  };
  sections: {
    discover: AboutBrazilSectionCopy;
    living: AboutBrazilSectionCopy;
    regions: AboutBrazilSectionCopy;
    states: AboutBrazilSectionCopy;
    cities: AboutBrazilSectionCopy;
    culture: AboutBrazilSectionCopy;
    guides: AboutBrazilSectionCopy;
  };
  labels: {
    jumpNavTitle: string;
    updatedLabel: string;
    linksTitle: string;
    stateCountLabel: string;
    cityCountLabel: string;
    festivalsListLabel: string;
    foodListLabel: string;
    citySamplesLabel: string;
  };
  fallbacks: {
    eventsHref: string;
    housingHref: string;
  };
};

type HubCardItem = {
  id: string;
  label: string;
  href: string;
};

const aboutBrazilHubFallback: AboutBrazilHubManagedCopy = {
  seo: {
    metaTitleTemplate: 'About Brazil: Regions, Living, and Culture | {{brand}}',
    metaDescription:
      'Explore Brazil through practical relocation context: why Brazil, cost of living, regions, states, cities, and culture with direct links to deeper guides.',
    keywords: ['about brazil', 'move to brazil', 'brazil regions', 'brazil cost of living', 'brazil culture'],
    faq: [
      {
        question: 'What can I do from the About Brazil hub?',
        answer: 'You can browse regional guides, state pages, living topics, cultural guides, and relocation next steps in one place.',
      },
      {
        question: 'Does this page include links to deeper pages?',
        answer: 'Yes. Every section links to dedicated routes so you can continue into state, city, visa, and resource pages.',
      },
    ],
    internalLinksTitle: 'Key migration links',
    internalLinks: [
      { href: '/consultation', label: 'Start consultation' },
      { href: '/discover', label: 'Open discover hub' },
      { href: '/resources-guides-brazil', label: 'Resources and guides' },
      { href: '/about/about-brazil/apply-brazil', label: 'Apply to Brazil' },
      { href: '/contact', label: 'Contact advisory team' },
    ],
  },
  hero: {
    eyebrow: 'About Brazil',
    title: 'Discover Brazil with practical relocation context',
    subtitle:
      'Use this page as your Brazil homepage for discovery. Navigate living topics, regions, states, city guides, culture, and action-focused immigration resources.',
    primaryCta: {
      label: 'Start Consultation',
      href: '/consultation',
    },
    secondaryCta: {
      label: 'Open Discover Hub',
      href: '/discover',
    },
    statChips: [
      { label: '{{aboutCount}} about-brazil pages' },
      { label: '{{discoverCount}} discover pages' },
      { label: '{{stateCount}} state pages' },
    ],
  },
  sections: {
    discover: {
      eyebrow: 'Discover',
      title: 'Why Brazil and opportunity overview',
      subtitle: 'Start with the strategic reasons to choose Brazil and then move to focused pages on investment, economy, and quality context.',
      ctaLabel: 'Explore Why Brazil',
      ctaHref: '/about/about-brazil/why-brazil',
      itemDescriptions: {
        brazil_why_brazil: 'Legal pathways, lifestyle context, and planning fundamentals for prospective immigrants.',
        brazil_investment: 'Investor-oriented residency pathways and business-linked immigration options.',
        brazil_economy: 'Cost and economic context to support location and timeline decisions.',
        brazil_quality: 'Quality-oriented relocation framing tied to process quality and long-term stability.',
      },
    },
    living: {
      eyebrow: 'Living',
      title: 'Cost, housing, healthcare, education, and safety',
      subtitle: 'Review practical living topics before selecting a destination city or state and before committing to timelines.',
      ctaLabel: 'Open living resources',
      ctaHref: '/resources-guides-brazil',
      itemDescriptions: {
        brazil_cost: 'Budget planning and cost framing for relocation and first-year setup.',
        brazil_housing: 'Housing checklists and relocation operations guidance.',
        brazil_healthcare: 'Healthcare-related immigration and treatment pathway guidance.',
        brazil_education: 'Education and student pathway references for families and applicants.',
        brazil_safety: 'State-level exploration to evaluate environment, infrastructure, and fit.',
      },
    },
    regions: {
      eyebrow: 'Regions',
      title: 'Explore Brazil by region',
      subtitle: 'Compare the five macro-regions first, then drill down into states and city-level pages.',
      ctaLabel: 'Browse all regions',
      ctaHref: '/discover/brazilian-regions',
      itemDescriptions: {
        brazil_north: 'Amazon basin, frontier growth, and nature-forward destinations.',
        brazil_northeast: 'Coastal living, strong culture, and affordability tradeoffs.',
        brazil_central_west: 'Agribusiness strength, inland hubs, and federal capital dynamics.',
        brazil_southeast: 'Largest economic concentration and dense urban opportunities.',
        brazil_south: 'Cooler climate profile with strong infrastructure in key cities.',
      },
    },
    states: {
      eyebrow: 'States',
      title: 'State directory snapshot',
      subtitle: 'Quickly access state-level pages and then continue into municipality and city guidance.',
      ctaLabel: 'Open full state directory',
      ctaHref: '/discover/brazilian-states',
      itemDescriptions: {
        brazil_directory: 'Directory access to state overviews and deep links.',
      },
    },
    cities: {
      eyebrow: 'Cities',
      title: 'City guides, municipalities, and search',
      subtitle: 'Use region and city pages to narrow your destination with practical relocation checkpoints.',
      ctaLabel: 'Browse city and region guides',
      ctaHref: '/discover/brazilian-regions',
      itemDescriptions: {
        brazil_guides: 'Region and city guide hub for destination discovery.',
        brazil_municipalities: 'Municipality-focused navigation through discover archives.',
        brazil_search: 'Search across services, states, resources, and related pages.',
      },
    },
    culture: {
      eyebrow: 'Culture',
      title: 'Festivals, cuisine, events, blogs, and FAQs',
      subtitle: 'Experience cultural context through state-level festival and food pages, plus ongoing insights and FAQs.',
      ctaLabel: 'Open festivals hub',
      ctaHref: '/about/about-brazil/festivals',
      itemDescriptions: {
        brazil_festivals: 'State-by-state festivals and cultural event identity pages.',
        brazil_cuisine: 'State-level food guides to understand local cuisine traditions.',
        brazil_events: 'Event coverage currently routed through the blog hub.',
        brazil_blogs: 'Ongoing updates, analysis, and practical relocation insights.',
        brazil_faqs: 'Fast answers to common immigration and relocation questions.',
      },
    },
    guides: {
      eyebrow: 'Guides',
      title: 'Featured deep-dive guides',
      subtitle: 'Continue into execution-focused pages for why Brazil, cost planning, and the application process.',
      ctaLabel: 'Apply to Brazil',
      ctaHref: '/about/about-brazil/apply-brazil',
      itemDescriptions: {},
    },
  },
  labels: {
    jumpNavTitle: 'Jump to section',
    updatedLabel: 'JSON-driven hub with deep internal linking',
    linksTitle: 'Related planning links',
    stateCountLabel: '{{count}} state pages',
    cityCountLabel: '{{count}} city samples',
    festivalsListLabel: 'Featured festival guides',
    foodListLabel: 'Featured cuisine guides',
    citySamplesLabel: 'Popular city pages',
  },
  fallbacks: {
    eventsHref: '/blog',
    housingHref: '/resources-guides-brazil',
  },
};

const JUMP_SECTIONS: Array<{ id: keyof AboutBrazilHubManagedCopy['sections']; anchor: string }> = [
  { id: 'discover', anchor: 'discover' },
  { id: 'living', anchor: 'living' },
  { id: 'regions', anchor: 'regions' },
  { id: 'states', anchor: 'states' },
  { id: 'cities', anchor: 'cities' },
  { id: 'culture', anchor: 'culture' },
  { id: 'guides', anchor: 'guides' },
];

function replaceCountTokens(template: string, values: Record<string, string>) {
  let output = template;
  for (const [token, value] of Object.entries(values)) {
    output = output.replaceAll(`{{${token}}}`, value);
  }
  return output;
}

function isExternalHref(href: string) {
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(href.trim());
}

function cardDescription(section: AboutBrazilSectionCopy, itemId: string) {
  return section.itemDescriptions[itemId] || section.subtitle;
}

function withFallbackHref(item: HubCardItem, pageCopy: AboutBrazilHubManagedCopy) {
  const normalized = stripLocaleFromPath(item.href);
  const hubSlug = '/about/about-brazil';

  if (item.id === 'brazil_why_brazil' && normalized === hubSlug) {
    return {
      ...item,
      href: '/about/about-brazil/why-brazil',
    };
  }

  if (item.id === 'brazil_events' && normalized === hubSlug) {
    return {
      ...item,
      href: pageCopy.fallbacks.eventsHref,
    };
  }

  if (item.id === 'brazil_housing' && normalized === hubSlug) {
    return {
      ...item,
      href: pageCopy.fallbacks.housingHref,
    };
  }

  return item;
}

function toHubCard(locale: Locale, itemId: string, pageCopy: AboutBrazilHubManagedCopy) {
  const navMap = getNavigationMap(locale);
  const resolved = navMap.resolveItem(itemId);

  if (!resolved) {
    return null;
  }

  const mapped = withFallbackHref(
    {
      id: itemId,
      label: resolved.label,
      href: resolved.href,
    },
    pageCopy,
  );

  if (isExternalHref(mapped.href)) {
    return mapped;
  }

  return {
    ...mapped,
    href: localizedPath(locale, stripLocaleFromPath(mapped.href)),
  };
}

function LinkOrAnchor({ href, label, className }: { href: string; label: string; className: string }) {
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function HubCard({ title, detail, href, ctaLabel }: { title: string; detail: string; href: string; ctaLabel: string }) {
  return (
    <article className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <h3 className="font-display text-2xl text-ink-900">{title}</h3>
      <p className="mt-3 text-sm text-ink-700">{detail}</p>
      <LinkOrAnchor
        href={href}
        label={ctaLabel}
        className="mt-5 inline-flex rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-900 transition hover:border-civic-500"
      />
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<AboutBrazilHubManagedCopy>(locale, 'aboutBrazilHubPage', aboutBrazilHubFallback);

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-brazil`,
    title: renderMetaTitle(
      pageCopy.seo.metaTitleTemplate,
      { brand: copy[locale].brand },
      `${pageCopy.hero.title} | ${copy[locale].brand}`,
    ),
    description: pageCopy.seo.metaDescription || pageCopy.hero.subtitle,
  });
}

export default async function AboutBrazilHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<AboutBrazilHubManagedCopy>(locale, 'aboutBrazilHubPage', aboutBrazilHubFallback);

  const [
    aboutCount,
    discoverCount,
    stateCount,
    hubIndex,
    whyBrazilDoc,
    costDoc,
    applyDoc,
    festivalLinks,
    foodLinks,
  ] = await Promise.all([
    countRoutesByPrefix(locale, 'about/about-brazil', false),
    countRoutesByPrefix(locale, 'discover', true),
    countRoutesByPrefix(locale, 'discover/brazilian-states', false),
    getDiscoverHubIndex(locale),
    getLegacyDocument(locale, ['about', 'about-brazil', 'why-brazil']),
    getLegacyDocument(locale, ['about', 'about-brazil', 'cost-of-living-in-brazil']),
    getLegacyDocument(locale, ['about', 'about-brazil', 'apply-brazil']),
    getRouteLinksByPrefix(locale, 'about/about-brazil/festivals', { includePrefixEntry: false, limit: 8 }),
    getRouteLinksByPrefix(locale, 'about/about-brazil/food', { includePrefixEntry: false, limit: 8 }),
  ]);

  const discoverItems = ABOUT_BRAZIL_HUB_NAV_LINK_IDS.discover
    .map((id) => toHubCard(locale, id, pageCopy))
    .filter((item): item is HubCardItem => Boolean(item));
  const livingItems = ABOUT_BRAZIL_HUB_NAV_LINK_IDS.living
    .map((id) => toHubCard(locale, id, pageCopy))
    .filter((item): item is HubCardItem => Boolean(item));
  const regionItems = ABOUT_BRAZIL_HUB_NAV_LINK_IDS.regions
    .map((id) => toHubCard(locale, id, pageCopy))
    .filter((item): item is HubCardItem => Boolean(item));
  const stateNavItems = ABOUT_BRAZIL_HUB_NAV_LINK_IDS.states
    .map((id) => toHubCard(locale, id, pageCopy))
    .filter((item): item is HubCardItem => Boolean(item));
  const cityNavItems = ABOUT_BRAZIL_HUB_NAV_LINK_IDS.cities
    .map((id) => toHubCard(locale, id, pageCopy))
    .filter((item): item is HubCardItem => Boolean(item));
  const cultureItems = ABOUT_BRAZIL_HUB_NAV_LINK_IDS.culture
    .map((id) => toHubCard(locale, id, pageCopy))
    .filter((item): item is HubCardItem => Boolean(item));

  const statePages = [...hubIndex.statePages]
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 12);
  const citySamples = [...hubIndex.citySamples]
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 9);

  const heroChipValues = {
    aboutCount: String(aboutCount),
    discoverCount: String(discoverCount),
    stateCount: String(stateCount),
  };

  const livingComparison = [
    {
      title: costDoc?.heading || 'Cost planning',
      detail: costDoc?.description || 'Map baseline monthly costs before choosing a destination.',
      href: localizedPath(locale, '/about/about-brazil/cost-of-living-in-brazil'),
    },
    {
      title: applyDoc?.heading || 'Application execution',
      detail: applyDoc?.description || 'Align document preparation and filing order before travel.',
      href: localizedPath(locale, '/about/about-brazil/apply-brazil'),
    },
    {
      title: whyBrazilDoc?.heading || 'Strategic fit',
      detail: whyBrazilDoc?.description || 'Validate legal, lifestyle, and long-term relocation fit.',
      href: localizedPath(locale, '/about/about-brazil/why-brazil'),
    },
  ];

  return (
    <>
      <FaqSchema items={pageCopy.seo.faq.map((item) => ({ question: item.question, answer: item.answer }))} />

      <section className="relative overflow-hidden border-b border-sand-200 bg-gradient-to-br from-ink-950 via-ink-900 to-civic-900 text-sand-50">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-civic-300/20 blur-2xl" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-sand-100/10 blur-2xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-civic-200">{pageCopy.hero.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight text-white lg:text-6xl">{pageCopy.hero.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-sand-100/90">{pageCopy.hero.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <LinkOrAnchor
              href={localizedPath(locale, pageCopy.hero.primaryCta.href)}
              label={pageCopy.hero.primaryCta.label}
              className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-900"
            />
            <LinkOrAnchor
              href={localizedPath(locale, pageCopy.hero.secondaryCta.href)}
              label={pageCopy.hero.secondaryCta.label}
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em]">
            {pageCopy.hero.statChips.map((chip) => (
              <span key={chip.label} className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                {replaceCountTokens(chip.label, heroChipValues)}
              </span>
            ))}
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-civic-900">{pageCopy.labels.updatedLabel}</span>
          </div>
        </div>
      </section>

      <section className="sticky top-[4.5rem] z-30 border-b border-sand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-civic-700">{pageCopy.labels.jumpNavTitle}</span>
            {JUMP_SECTIONS.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                className="rounded-full border border-sand-300 bg-sand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-800"
              >
                {pageCopy.sections[item.id].eyebrow}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="discover" className="bg-sand-50 scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.sections.discover.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{pageCopy.sections.discover.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.sections.discover.subtitle}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {discoverItems.map((item) => (
              <HubCard
                key={item.id}
                title={item.label}
                detail={cardDescription(pageCopy.sections.discover, item.id)}
                href={item.href}
                ctaLabel="Open topic"
              />
            ))}
          </div>
          <Link
            href={localizedPath(locale, pageCopy.sections.discover.ctaHref)}
            className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {pageCopy.sections.discover.ctaLabel}
          </Link>
        </div>
      </section>

      <section id="living" className="bg-white scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.sections.living.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{pageCopy.sections.living.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.sections.living.subtitle}</p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {livingComparison.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-ink-700">{item.detail}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {livingItems.map((item) => (
              <HubCard
                key={item.id}
                title={item.label}
                detail={cardDescription(pageCopy.sections.living, item.id)}
                href={item.href}
                ctaLabel="Open topic"
              />
            ))}
          </div>

          <Link
            href={localizedPath(locale, pageCopy.sections.living.ctaHref)}
            className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {pageCopy.sections.living.ctaLabel}
          </Link>
        </div>
      </section>

      <section id="regions" className="bg-sand-50 scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.sections.regions.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{pageCopy.sections.regions.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.sections.regions.subtitle}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {regionItems.map((item) => (
              <HubCard
                key={item.id}
                title={item.label}
                detail={cardDescription(pageCopy.sections.regions, item.id)}
                href={item.href}
                ctaLabel="Open region"
              />
            ))}
          </div>

          <Link
            href={localizedPath(locale, pageCopy.sections.regions.ctaHref)}
            className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {pageCopy.sections.regions.ctaLabel}
          </Link>
        </div>
      </section>

      <section id="states" className="bg-white scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.sections.states.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{pageCopy.sections.states.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.sections.states.subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {replaceCountTokens(pageCopy.labels.stateCountLabel, { count: String(stateCount) })}
            </span>
            {stateNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {statePages.map((page) => (
              <Link
                key={page.slug}
                href={localizedPath(locale, page.pathname)}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300 hover:bg-white"
              >
                {page.title}
              </Link>
            ))}
          </div>

          <Link
            href={localizedPath(locale, pageCopy.sections.states.ctaHref)}
            className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {pageCopy.sections.states.ctaLabel}
          </Link>
        </div>
      </section>

      <section id="cities" className="bg-sand-50 scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.sections.cities.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{pageCopy.sections.cities.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.sections.cities.subtitle}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {cityNavItems.map((item) => (
              <HubCard
                key={item.id}
                title={item.label}
                detail={cardDescription(pageCopy.sections.cities, item.id)}
                href={item.href}
                ctaLabel="Open"
              />
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl text-ink-900">{pageCopy.labels.citySamplesLabel}</h3>
              <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
                {replaceCountTokens(pageCopy.labels.cityCountLabel, { count: String(citySamples.length) })}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {citySamples.map((page) => (
                <Link
                  key={page.slug}
                  href={localizedPath(locale, page.pathname)}
                  className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 transition hover:border-civic-300 hover:bg-white"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={localizedPath(locale, pageCopy.sections.cities.ctaHref)}
            className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {pageCopy.sections.cities.ctaLabel}
          </Link>
        </div>
      </section>

      <section id="culture" className="bg-white scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.sections.culture.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{pageCopy.sections.culture.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.sections.culture.subtitle}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cultureItems.map((item) => (
              <HubCard
                key={item.id}
                title={item.label}
                detail={cardDescription(pageCopy.sections.culture, item.id)}
                href={item.href}
                ctaLabel="Open"
              />
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <details className="rounded-2xl border border-sand-200 bg-sand-50 p-5" open>
              <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.14em] text-civic-700">
                {pageCopy.labels.festivalsListLabel}
              </summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {festivalLinks.map((link) => (
                  <Link
                    key={link.slug}
                    href={link.href}
                    className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-ink-800 transition hover:border-civic-300"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </details>

            <details className="rounded-2xl border border-sand-200 bg-sand-50 p-5" open>
              <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.14em] text-civic-700">
                {pageCopy.labels.foodListLabel}
              </summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {foodLinks.map((link) => (
                  <Link
                    key={link.slug}
                    href={link.href}
                    className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-ink-800 transition hover:border-civic-300"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <Link
            href={localizedPath(locale, pageCopy.sections.culture.ctaHref)}
            className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {pageCopy.sections.culture.ctaLabel}
          </Link>
        </div>
      </section>

      <section id="guides" className="bg-sand-50 scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.sections.guides.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{pageCopy.sections.guides.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{pageCopy.sections.guides.subtitle}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <HubCard
              title={whyBrazilDoc?.heading || 'Why Brazil'}
              detail={whyBrazilDoc?.description || 'Legal pathways, opportunity framing, and relocation fit guidance.'}
              href={localizedPath(locale, '/about/about-brazil/why-brazil')}
              ctaLabel="Open guide"
            />
            <HubCard
              title={costDoc?.heading || 'Cost of Living in Brazil'}
              detail={costDoc?.description || 'Budget and planning guidance for your first year.'}
              href={localizedPath(locale, '/about/about-brazil/cost-of-living-in-brazil')}
              ctaLabel="Open guide"
            />
            <HubCard
              title={applyDoc?.heading || 'Apply to Brazil'}
              detail={applyDoc?.description || 'Execution sequence for documents, filing, and onboarding.'}
              href={localizedPath(locale, '/about/about-brazil/apply-brazil')}
              ctaLabel="Open guide"
            />
          </div>

          <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
            <h3 className="font-display text-3xl text-ink-900">Ready to move forward?</h3>
            <p className="mt-3 max-w-3xl text-sm text-ink-700">
              Start with a consultation to convert your destination shortlist into a concrete legal and relocation execution plan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={localizedPath(locale, '/consultation')}
                className="rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
              >
                Start consultation
              </Link>
              <Link
                href={localizedPath(locale, '/contact')}
                className="rounded-full border border-ink-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-900"
              >
                Contact advisory team
              </Link>
            </div>
          </div>

          <Link
            href={localizedPath(locale, pageCopy.sections.guides.ctaHref)}
            className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {pageCopy.sections.guides.ctaLabel}
          </Link>
        </div>
      </section>

      <ManagedSeoLinks locale={locale} title={pageCopy.labels.linksTitle || pageCopy.seo.internalLinksTitle} links={pageCopy.seo.internalLinks} />

      <CtaCard locale={locale} />
    </>
  );
}
