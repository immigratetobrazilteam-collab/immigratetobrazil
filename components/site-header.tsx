'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { brazilianStates, type BrazilianState } from '@/content/curated/states';
import { trackAnalyticsEvent } from '@/lib/analytics-events';
import { copy } from '@/lib/i18n';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';
import { cn } from '@/lib/utils';

import { LanguageSwitcher } from './language-switcher';

type MenuLink = {
  href: string;
  label: string;
};

type MenuGroup = {
  title: string;
  links: MenuLink[];
};

type MenuSection = {
  title: string;
  links?: MenuLink[];
  groups?: MenuGroup[];
};

type MegaMenu = {
  id: string;
  label: string;
  href: string;
  activePrefixes?: string[];
  sections: MenuSection[];
};

interface SiteHeaderProps {
  locale: Locale;
}

const REGION_ORDER: BrazilianState['region'][] = ['north', 'northeast', 'central-west', 'southeast', 'south'];

const DISCOVER_REGION_SEGMENTS: Record<BrazilianState['region'], string> = {
  north: 'north-region',
  northeast: 'northeast-region',
  'central-west': 'central-west-region',
  southeast: 'southeast-region',
  south: 'south-region',
};

function resolveCmsHref(locale: Locale, href: string) {
  if (!href) return `/${locale}`;
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return href;
  }
  if (href === '/') return `/${locale}`;
  if (href === '/sitemap.xml' || href === '/robots.txt') return href;
  if (href.startsWith(`/${locale}`)) return href;
  return `/${locale}${href.startsWith('/') ? href : `/${href}`}`;
}

function trackExternalContactClick(href: string, locale: Locale, source: string) {
  if (href.startsWith('mailto:')) {
    trackAnalyticsEvent('contact_click', { contact_method: 'email', source, locale });
    return;
  }

  const normalizedHref = href.toLowerCase();
  if (normalizedHref.includes('wa.me') || normalizedHref.includes('whatsapp')) {
    trackAnalyticsEvent('contact_click', { contact_method: 'whatsapp', source, locale });
  }
}

function isConsultationLink(href: string) {
  return href.includes('/visa-consultation');
}

function desktopLinkClass(active: boolean) {
  return cn(
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    active ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
  );
}

function secondaryLinkClass(active: boolean) {
  return cn(
    'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition',
    active
      ? 'border-ink-900 bg-ink-900 text-sand-50'
      : 'border-sand-300 bg-white text-ink-700 hover:border-civic-300 hover:text-ink-900',
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function regionLabel(labels: Record<'north' | 'northeast' | 'centralWest' | 'southeast' | 'south', string>, region: BrazilianState['region']) {
  switch (region) {
    case 'north':
      return labels.north;
    case 'northeast':
      return labels.northeast;
    case 'central-west':
      return labels.centralWest;
    case 'southeast':
      return labels.southeast;
    case 'south':
      return labels.south;
    default:
      return region;
  }
}

function groupedStateLinks(
  locale: Locale,
  labels: Record<'north' | 'northeast' | 'centralWest' | 'southeast' | 'south', string>,
  hrefBuilder: (state: BrazilianState) => string,
) {
  return REGION_ORDER.map((region) => {
    const links = brazilianStates
      .filter((state) => state.region === region)
      .map((state) => ({
        href: hrefBuilder(state),
        label: state[locale],
      }));

    return {
      title: regionLabel(labels, region),
      links,
    };
  });
}

function HeaderLogo({ locale, href, compact = false }: { locale: Locale; href: string; compact?: boolean }) {
  const brand = copy[locale];

  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <BrandLogo variant="mark" priority className={compact ? 'h-10 w-10 rounded-xl' : 'h-12 w-12 rounded-2xl'} />
      <div className="leading-tight">
        <p className={cn('font-display text-ink-900', compact ? 'text-base' : 'text-lg')}>{brand.brand}</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-civic-700">{brand.headerNavigation.brandTagline}</p>
      </div>
    </Link>
  );
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const t = copy[locale];
  const headerNav = t.headerNavigation;
  const pathname = usePathname() || `/${locale}`;
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  function trackContactClick(method: 'email' | 'whatsapp', source: string) {
    trackAnalyticsEvent('contact_click', {
      contact_method: method,
      source,
      locale,
    });
  }

  function trackCtaClick(source: string) {
    trackAnalyticsEvent('cta_click', {
      cta_location: source,
      cta_variant: 'consultation',
      locale,
    });
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!desktopMenuRef.current) return;
      if (!desktopMenuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  const regionLabels = headerNav.regionLabels;

  const aboutStateGroups = useMemo(
    () => groupedStateLinks(locale, regionLabels, (state) => resolveCmsHref(locale, `/about/about-states/about-${state.slug}`)),
    [locale, regionLabels],
  );

  const serviceStateGroups = useMemo(
    () => groupedStateLinks(locale, regionLabels, (state) => resolveCmsHref(locale, `/services/immigrate-to-${state.slug}`)),
    [locale, regionLabels],
  );

  const blogStateGroups = useMemo(
    () => groupedStateLinks(locale, regionLabels, (state) => resolveCmsHref(locale, `/blog/blog-${state.slug}`)),
    [locale, regionLabels],
  );

  const faqStateGroups = useMemo(
    () => groupedStateLinks(locale, regionLabels, (state) => resolveCmsHref(locale, `/faq/faq-${state.slug}`)),
    [locale, regionLabels],
  );

  const contactStateGroups = useMemo(
    () => groupedStateLinks(locale, regionLabels, (state) => resolveCmsHref(locale, `/contact/contact-${state.slug}`)),
    [locale, regionLabels],
  );

  const discoverStateGroups = useMemo(
    () => groupedStateLinks(locale, regionLabels, (state) => resolveCmsHref(locale, `/discover/brazilian-states/${state.code.toLowerCase()}`)),
    [locale, regionLabels],
  );

  const discoverRegionLinks = useMemo(
    () =>
      REGION_ORDER.map((region) => ({
        href: resolveCmsHref(locale, `/discover/brazilian-regions/${DISCOVER_REGION_SEGMENTS[region]}`),
        label: regionLabel(regionLabels, region),
      })),
    [locale, regionLabels],
  );

  const quickLinks = useMemo(
    () =>
      headerNav.quickLinks.map((link) => ({
        href: resolveCmsHref(locale, link.href),
        label: link.label,
      })),
    [headerNav.quickLinks, locale],
  );

  const menus = useMemo<MegaMenu[]>(
    () => [
      {
        id: 'about-brazil',
        label: headerNav.menuLabels.aboutBrazil,
        href: resolveCmsHref(locale, '/about/about-brazil'),
        sections: [
          {
            title: headerNav.sectionLabels.aboutBrazil,
            links: [
              { href: resolveCmsHref(locale, '/about/about-brazil'), label: headerNav.links.aboutBrazilHub },
              { href: resolveCmsHref(locale, '/about/about-brazil/apply-brazil'), label: headerNav.links.applyBrazil },
              { href: resolveCmsHref(locale, '/about/about-brazil/cost-of-living-in-brazil'), label: headerNav.links.costOfLiving },
            ],
          },
        ],
      },
      {
        id: 'about-states',
        label: headerNav.menuLabels.aboutStates,
        href: resolveCmsHref(locale, '/about/about-states'),
        sections: [
          {
            title: headerNav.sectionLabels.aboutStates,
            groups: aboutStateGroups,
          },
        ],
      },
      {
        id: 'services',
        label: headerNav.menuLabels.services,
        href: resolveCmsHref(locale, '/services'),
        activePrefixes: [resolveCmsHref(locale, '/visa-consultation')],
        sections: [
          {
            title: headerNav.sectionLabels.servicesCore,
            links: [
              { href: resolveCmsHref(locale, '/services'), label: t.nav.services },
              { href: resolveCmsHref(locale, '/visa-consultation'), label: t.cta.button },
              { href: resolveCmsHref(locale, '/services/visa'), label: headerNav.links.visaServices },
              { href: resolveCmsHref(locale, '/services/visas'), label: headerNav.links.visaCategories },
              { href: resolveCmsHref(locale, '/services/residencies'), label: headerNav.links.residencyServices },
              { href: resolveCmsHref(locale, '/services/naturalisation'), label: headerNav.links.naturalisationServices },
              { href: resolveCmsHref(locale, '/services/legal'), label: headerNav.links.legalServices },
            ],
          },
          {
            title: headerNav.sectionLabels.servicesStates,
            groups: serviceStateGroups,
          },
        ],
      },
      {
        id: 'resources',
        label: headerNav.menuLabels.resources,
        href: resolveCmsHref(locale, '/resources-guides-brazil'),
        activePrefixes: [resolveCmsHref(locale, '/library'), resolveCmsHref(locale, '/home'), resolveCmsHref(locale, '/policies')],
        sections: [
          {
            title: headerNav.sectionLabels.resourcesHubs,
            links: [
              { href: resolveCmsHref(locale, '/resources-guides-brazil'), label: t.nav.resources },
              { href: resolveCmsHref(locale, '/library'), label: headerNav.allPagesButton },
              { href: resolveCmsHref(locale, '/process'), label: t.nav.process },
              { href: resolveCmsHref(locale, '/home'), label: headerNav.links.homeArchive },
              { href: resolveCmsHref(locale, '/blog'), label: t.nav.blog },
              { href: resolveCmsHref(locale, '/faq'), label: t.nav.faq },
            ],
          },
          {
            title: headerNav.sectionLabels.resourcesPolicy,
            links: [
              { href: resolveCmsHref(locale, '/policies'), label: headerNav.links.policies },
              { href: resolveCmsHref(locale, '/policies/cookies'), label: headerNav.links.cookies },
              { href: resolveCmsHref(locale, '/policies/disclaimers'), label: headerNav.links.disclaimers },
              { href: resolveCmsHref(locale, '/policies/gdpr'), label: headerNav.links.gdpr },
              { href: resolveCmsHref(locale, '/policies/privacy'), label: headerNav.links.privacy },
              { href: resolveCmsHref(locale, '/policies/refund'), label: headerNav.links.refund },
              { href: resolveCmsHref(locale, '/policies/terms'), label: headerNav.links.terms },
              { href: '/sitemap.xml', label: headerNav.links.xmlSitemap },
            ],
          },
        ],
      },
      {
        id: 'discover',
        label: headerNav.menuLabels.discover,
        href: resolveCmsHref(locale, '/discover'),
        activePrefixes: [resolveCmsHref(locale, '/discover')],
        sections: [
          {
            title: headerNav.sectionLabels.discoverRegions,
            links: [
              { href: resolveCmsHref(locale, '/discover/brazilian-regions'), label: headerNav.links.discoverRegionsHub },
              ...discoverRegionLinks,
            ],
          },
          {
            title: headerNav.sectionLabels.discoverStates,
            links: [{ href: resolveCmsHref(locale, '/discover/brazilian-states'), label: headerNav.links.discoverStatesHub }],
            groups: discoverStateGroups,
          },
        ],
      },
      {
        id: 'blog',
        label: headerNav.menuLabels.blogByState,
        href: resolveCmsHref(locale, '/blog'),
        sections: [
          {
            title: headerNav.sectionLabels.blogStates,
            links: [{ href: resolveCmsHref(locale, '/blog'), label: headerNav.links.blogByStateHub }],
            groups: blogStateGroups,
          },
        ],
      },
      {
        id: 'faq',
        label: headerNav.menuLabels.faqByState,
        href: resolveCmsHref(locale, '/faq'),
        sections: [
          {
            title: headerNav.sectionLabels.faqStates,
            links: [{ href: resolveCmsHref(locale, '/faq'), label: headerNav.links.faqByStateHub }],
            groups: faqStateGroups,
          },
        ],
      },
      {
        id: 'contact',
        label: headerNav.menuLabels.contactByState,
        href: resolveCmsHref(locale, '/contact'),
        sections: [
          {
            title: headerNav.sectionLabels.contactChannels,
            links: [
              { href: resolveCmsHref(locale, '/contact'), label: headerNav.links.contactByStateHub },
              { href: resolveCmsHref(locale, '/visa-consultation'), label: t.cta.button },
              { href: `mailto:${siteConfig.contact.clientEmail}`, label: siteConfig.contact.clientEmail },
              { href: siteConfig.contact.whatsappLink, label: siteConfig.contact.whatsappNumber },
            ],
          },
          {
            title: headerNav.sectionLabels.contactStates,
            groups: contactStateGroups,
          },
        ],
      },
    ],
    [
      aboutStateGroups,
      blogStateGroups,
      contactStateGroups,
      discoverRegionLinks,
      discoverStateGroups,
      faqStateGroups,
      headerNav,
      locale,
      serviceStateGroups,
      t.cta.button,
      t.nav.blog,
      t.nav.faq,
      t.nav.process,
      t.nav.resources,
      t.nav.services,
    ],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/95 backdrop-blur">
      <div className="border-b border-sand-200/80">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-h-[5rem] flex-wrap items-center justify-between gap-3">
            <HeaderLogo locale={locale} href={resolveCmsHref(locale, '/')} />

            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex lg:flex-wrap">
              {quickLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link key={link.href} href={link.href} className={desktopLinkClass(active)} aria-current={active ? 'page' : undefined}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <a
                href={`mailto:${siteConfig.contact.clientEmail}`}
                onClick={() => trackContactClick('email', 'header_desktop')}
                className="rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-civic-300 hover:text-ink-900"
              >
                {siteConfig.contact.clientEmail}
              </a>
              <LanguageSwitcher />
              <Link
                href={resolveCmsHref(locale, '/visa-consultation')}
                onClick={() => trackCtaClick('header_desktop')}
                className="rounded-full bg-civic-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-civic-800"
              >
                {t.cta.button}
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-200 bg-white text-ink-800"
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
              >
                <span className="text-xl">{mobileOpen ? '×' : '≡'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-sand-200 bg-white/95 lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav ref={desktopMenuRef} className="relative flex flex-wrap items-center gap-2 py-3">
            {menus.map((menu) => {
              const active = [menu.href, ...(menu.activePrefixes || [])].some((prefix) => isActivePath(pathname, prefix));
              const isOpen = openMenu === menu.id;

              return (
                <div key={menu.id} className="static">
                  <button
                    type="button"
                    onClick={() => setOpenMenu((prev) => (prev === menu.id ? null : menu.id))}
                    className={desktopLinkClass(active)}
                    aria-expanded={isOpen}
                  >
                    <span>{menu.label}</span>
                    <span className={cn('ml-1 inline-block text-xs transition-transform', isOpen ? 'rotate-180' : '')}>▾</span>
                  </button>

                  <div
                    className={cn(
                      'absolute left-0 top-full z-40 mt-2 w-full rounded-2xl border border-sand-200 bg-white p-4 shadow-card transition duration-200',
                      isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0 pointer-events-none',
                    )}
                  >
                    <div className="mx-auto max-h-[70vh] max-w-3xl overflow-y-auto pr-1">
                      <div className="space-y-4">
                        {menu.sections.map((section) => (
                          <section key={`${menu.id}-${section.title}`}>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-700">{section.title}</p>

                            {section.links?.length ? (
                              <div className="mt-3 grid gap-1.5">
                                {section.links.map((link) => {
                                  const sectionActive = link.href.startsWith(`/${locale}`) && isActivePath(pathname, link.href);
                                  const external = !link.href.startsWith('/');

                                  if (external) {
                                    return (
                                      <a
                                        key={`${section.title}-${link.href}`}
                                        href={link.href}
                                        target={link.href.startsWith('http') ? '_blank' : undefined}
                                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        className="rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-ink-800 transition hover:border-civic-300 hover:bg-white"
                                        onClick={() => {
                                          trackExternalContactClick(link.href, locale, `header_mega_${menu.id}`);
                                          setOpenMenu(null);
                                        }}
                                      >
                                        {link.label}
                                      </a>
                                    );
                                  }

                                  return (
                                    <Link
                                      key={`${section.title}-${link.href}`}
                                      href={link.href}
                                      className={cn(
                                        'rounded-lg border px-3 py-2 text-sm transition',
                                        sectionActive
                                          ? 'border-ink-900 bg-ink-900 text-sand-50'
                                          : 'border-sand-200 bg-sand-50 text-ink-800 hover:border-civic-300 hover:bg-white',
                                      )}
                                      onClick={() => {
                                        if (isConsultationLink(link.href)) {
                                          trackCtaClick(`header_mega_${menu.id}`);
                                        }
                                        setOpenMenu(null);
                                      }}
                                    >
                                      {link.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            ) : null}

                            {section.groups?.length ? (
                              <div className="mt-3 space-y-2">
                                {section.groups.map((group) => (
                                  <details key={`${section.title}-${group.title}`} className="rounded-xl border border-sand-200 bg-sand-50 p-2.5">
                                    <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.12em] text-civic-700">
                                      {group.title}
                                    </summary>
                                    <div className="mt-2 grid max-h-40 gap-1 overflow-y-auto pr-1">
                                      {group.links.map((link) => {
                                        const sectionActive = isActivePath(pathname, link.href);
                                        return (
                                          <Link
                                            key={`${group.title}-${link.href}`}
                                            href={link.href}
                                            className={cn(
                                              'rounded-md border px-2.5 py-1.5 text-xs transition',
                                              sectionActive
                                                ? 'border-ink-900 bg-ink-900 text-sand-50'
                                                : 'border-sand-200 bg-white text-ink-800 hover:border-civic-300',
                                            )}
                                            onClick={() => setOpenMenu(null)}
                                          >
                                            {link.label}
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </details>
                                ))}
                              </div>
                            ) : null}
                          </section>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              <Link
                href={resolveCmsHref(locale, '/library')}
                className={secondaryLinkClass(isActivePath(pathname, resolveCmsHref(locale, '/library')))}
                aria-current={isActivePath(pathname, resolveCmsHref(locale, '/library')) ? 'page' : undefined}
              >
                {headerNav.allPagesButton}
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className={cn('border-t border-sand-200 bg-sand-50 lg:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div className="space-y-3 px-4 py-4">
          <div className="rounded-xl border border-sand-200 bg-white p-3">
            <a
              href={`mailto:${siteConfig.contact.clientEmail}`}
              onClick={() => trackContactClick('email', 'header_mobile')}
              className="block text-sm font-semibold text-ink-800 hover:text-civic-700"
            >
              {siteConfig.contact.clientEmail}
            </a>
            <a
              href={siteConfig.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContactClick('whatsapp', 'header_mobile')}
              className="mt-1 block text-xs text-ink-600 hover:text-civic-700"
            >
              {siteConfig.contact.whatsappNumber}
            </a>
          </div>

          {quickLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn('block rounded-xl px-3 py-2 text-sm font-semibold', active ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100')}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}

          {menus.map((menu) => (
            <details key={menu.id} className="rounded-xl border border-sand-200 bg-white p-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-ink-900">{menu.label}</summary>
              <div className="mt-3 space-y-3">
                {menu.sections.map((section) => (
                  <div key={`${menu.id}-${section.title}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-civic-700">{section.title}</p>

                    {section.links?.length ? (
                      <div className="mt-2 grid gap-1">
                        {section.links.map((link) => {
                          const external = !link.href.startsWith('/');
                          if (external) {
                            return (
                              <a
                                key={`${section.title}-${link.href}`}
                                href={link.href}
                                target={link.href.startsWith('http') ? '_blank' : undefined}
                                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                onClick={() => trackExternalContactClick(link.href, locale, `header_mobile_${menu.id}`)}
                                className="rounded-md border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-ink-800"
                              >
                                {link.label}
                              </a>
                            );
                          }

                          return (
                            <Link
                              key={`${section.title}-${link.href}`}
                              href={link.href}
                              onClick={() => {
                                if (isConsultationLink(link.href)) {
                                  trackCtaClick(`header_mobile_${menu.id}`);
                                }
                                setMobileOpen(false);
                              }}
                              className="rounded-md border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-ink-800"
                            >
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}

                    {section.groups?.length ? (
                      <div className="mt-2 space-y-2">
                        {section.groups.map((group) => (
                          <details key={`${section.title}-${group.title}`} className="rounded-md border border-sand-200 bg-sand-50 p-2">
                            <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.1em] text-civic-700">
                              {group.title}
                            </summary>
                            <div className="mt-2 grid max-h-40 gap-1 overflow-y-auto pr-1">
                              {group.links.map((link) => (
                                <Link
                                  key={`${group.title}-${link.href}`}
                                  href={link.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="rounded-md border border-sand-200 bg-white px-2.5 py-1.5 text-xs text-ink-800"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          ))}

          <div className="grid gap-3 pt-2">
            <Link
              href={resolveCmsHref(locale, '/library')}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink-800"
            >
              {headerNav.allPagesButton}
            </Link>
            <Link
              href={resolveCmsHref(locale, '/visa-consultation')}
              onClick={() => {
                trackCtaClick('header_mobile');
                setMobileOpen(false);
              }}
              className="block rounded-xl bg-civic-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {t.cta.button}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
