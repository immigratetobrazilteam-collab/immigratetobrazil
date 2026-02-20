'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { brazilianStates, type BrazilianState } from '@/content/curated/states';
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

function menuCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      aboutBrazil: 'Brasil en profundidad',
      aboutStates: 'Estados por región',
      servicesCore: 'Servicios principales',
      servicesStates: 'Servicios por estado',
      resourcesHubs: 'Centros de recursos',
      resourcesPolicy: 'Políticas y legal',
      discoverRegions: 'Regiones de Brasil',
      discoverStates: 'Estados de Brasil',
      blogStates: 'Blog por región',
      faqStates: 'FAQ por región',
      contactChannels: 'Canales de contacto',
      contactStates: 'Contacto por región',
      allPages: 'Todas las páginas',
      regionNorth: 'Norte',
      regionNortheast: 'Nordeste',
      regionCentralWest: 'Centro-Oeste',
      regionSoutheast: 'Sudeste',
      regionSouth: 'Sur',
    };
  }

  if (locale === 'pt') {
    return {
      aboutBrazil: 'Brasil em profundidade',
      aboutStates: 'Estados por região',
      servicesCore: 'Serviços principais',
      servicesStates: 'Serviços por estado',
      resourcesHubs: 'Centros de recursos',
      resourcesPolicy: 'Políticas e legal',
      discoverRegions: 'Regiões do Brasil',
      discoverStates: 'Estados do Brasil',
      blogStates: 'Blog por região',
      faqStates: 'FAQ por região',
      contactChannels: 'Canais de contato',
      contactStates: 'Contato por região',
      allPages: 'Todas as páginas',
      regionNorth: 'Norte',
      regionNortheast: 'Nordeste',
      regionCentralWest: 'Centro-Oeste',
      regionSoutheast: 'Sudeste',
      regionSouth: 'Sul',
    };
  }

  if (locale === 'fr') {
    return {
      aboutBrazil: 'Brésil en profondeur',
      aboutStates: 'États par région',
      servicesCore: 'Services principaux',
      servicesStates: 'Services par État',
      resourcesHubs: 'Hubs de ressources',
      resourcesPolicy: 'Politiques et juridique',
      discoverRegions: 'Régions du Brésil',
      discoverStates: 'États du Brésil',
      blogStates: 'Blog par région',
      faqStates: 'FAQ par région',
      contactChannels: 'Canaux de contact',
      contactStates: 'Contact par région',
      allPages: 'Toutes les pages',
      regionNorth: 'Nord',
      regionNortheast: 'Nord-Est',
      regionCentralWest: 'Centre-Ouest',
      regionSoutheast: 'Sud-Est',
      regionSouth: 'Sud',
    };
  }

  return {
    aboutBrazil: 'About Brazil',
    aboutStates: 'About states by region',
    servicesCore: 'Core services',
    servicesStates: 'Services by state',
    resourcesHubs: 'Resource hubs',
    resourcesPolicy: 'Policies and legal',
    discoverRegions: 'Brazil regions',
    discoverStates: 'Brazil states',
    blogStates: 'Blog by region',
    faqStates: 'FAQ by region',
    contactChannels: 'Contact channels',
    contactStates: 'Contact by region',
    allPages: 'All Pages',
    regionNorth: 'North',
    regionNortheast: 'Northeast',
    regionCentralWest: 'Central-West',
    regionSoutheast: 'Southeast',
    regionSouth: 'South',
  };
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

function regionLabel(labels: ReturnType<typeof menuCopy>, region: BrazilianState['region']) {
  switch (region) {
    case 'north':
      return labels.regionNorth;
    case 'northeast':
      return labels.regionNortheast;
    case 'central-west':
      return labels.regionCentralWest;
    case 'southeast':
      return labels.regionSoutheast;
    case 'south':
      return labels.regionSouth;
    default:
      return region;
  }
}

function groupedStateLinks(
  locale: Locale,
  labels: ReturnType<typeof menuCopy>,
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
  const brand = copy[locale].brand;

  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <BrandLogo variant="mark" priority className={compact ? 'h-10 w-10 rounded-xl' : 'h-12 w-12 rounded-2xl'} />
      <div className="leading-tight">
        <p className={cn('font-display text-ink-900', compact ? 'text-base' : 'text-lg')}>{brand}</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-civic-700">Premium Advisory</p>
      </div>
    </Link>
  );
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const t = copy[locale];
  const labels = useMemo(() => menuCopy(locale), [locale]);
  const pathname = usePathname() || `/${locale}`;
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

  const aboutStateGroups = useMemo(
    () => groupedStateLinks(locale, labels, (state) => `/${locale}/about/about-states/about-${state.slug}`),
    [locale, labels],
  );

  const serviceStateGroups = useMemo(
    () => groupedStateLinks(locale, labels, (state) => `/${locale}/services/immigrate-to-${state.slug}`),
    [locale, labels],
  );

  const blogStateGroups = useMemo(
    () => groupedStateLinks(locale, labels, (state) => `/${locale}/blog/blog-${state.slug}`),
    [locale, labels],
  );

  const faqStateGroups = useMemo(
    () => groupedStateLinks(locale, labels, (state) => `/${locale}/faq/faq-${state.slug}`),
    [locale, labels],
  );

  const contactStateGroups = useMemo(
    () => groupedStateLinks(locale, labels, (state) => `/${locale}/contact/contact-${state.slug}`),
    [locale, labels],
  );

  const discoverStateGroups = useMemo(
    () => groupedStateLinks(locale, labels, (state) => `/${locale}/discover/brazilian-states/${state.code.toLowerCase()}`),
    [locale, labels],
  );

  const discoverRegionLinks = useMemo(
    () =>
      REGION_ORDER.map((region) => ({
        href: `/${locale}/discover/brazilian-regions/${DISCOVER_REGION_SEGMENTS[region]}`,
        label: regionLabel(labels, region),
      })),
    [locale, labels],
  );

  const quickLinks = useMemo(
    () => [
      { href: `/${locale}`, label: t.nav.home },
      { href: `/${locale}/process`, label: t.nav.process },
      { href: `/${locale}/about/about-us`, label: 'About Us' },
      { href: `/${locale}/about/values`, label: 'Values' },
      { href: `/${locale}/about/mission`, label: 'Mission' },
      { href: `/${locale}/about/story`, label: 'Story' },
      { href: `/${locale}/contact`, label: t.nav.contact },
    ],
    [locale, t.nav.contact, t.nav.home, t.nav.process],
  );

  const menus = useMemo<MegaMenu[]>(
    () => [
      {
        id: 'about-brazil',
        label: 'About Brazil',
        href: `/${locale}/about/about-brazil`,
        sections: [
          {
            title: labels.aboutBrazil,
            links: [
              { href: `/${locale}/about/about-brazil`, label: 'About Brazil' },
              { href: `/${locale}/about/about-brazil/apply-brazil`, label: 'Apply to Brazil' },
              { href: `/${locale}/about/about-brazil/cost-of-living-in-brazil`, label: 'Cost of Living in Brazil' },
            ],
          },
        ],
      },
      {
        id: 'about-states',
        label: 'About States',
        href: `/${locale}/about/about-states`,
        sections: [
          {
            title: labels.aboutStates,
            groups: aboutStateGroups,
          },
        ],
      },
      {
        id: 'services',
        label: t.nav.services,
        href: `/${locale}/services`,
        activePrefixes: [`/${locale}/visa-consultation`],
        sections: [
          {
            title: labels.servicesCore,
            links: [
              { href: `/${locale}/services`, label: t.nav.services },
              { href: `/${locale}/visa-consultation`, label: t.cta.button },
              { href: `/${locale}/services/visa`, label: 'Visa Services' },
              { href: `/${locale}/services/visas`, label: 'Visa Categories' },
              { href: `/${locale}/services/residencies`, label: 'Residency Services' },
              { href: `/${locale}/services/naturalisation`, label: 'Naturalisation Services' },
              { href: `/${locale}/services/legal`, label: 'Legal Services' },
            ],
          },
          {
            title: labels.servicesStates,
            groups: serviceStateGroups,
          },
        ],
      },
      {
        id: 'resources',
        label: t.nav.resources,
        href: `/${locale}/resources-guides-brazil`,
        activePrefixes: [`/${locale}/library`, `/${locale}/home`, `/${locale}/policies`],
        sections: [
          {
            title: labels.resourcesHubs,
            links: [
              { href: `/${locale}/resources-guides-brazil`, label: t.nav.resources },
              { href: `/${locale}/library`, label: labels.allPages },
              { href: `/${locale}/process`, label: t.nav.process },
              { href: `/${locale}/home`, label: 'Home Archive' },
              { href: `/${locale}/blog`, label: t.nav.blog },
              { href: `/${locale}/faq`, label: t.nav.faq },
            ],
          },
          {
            title: labels.resourcesPolicy,
            links: [
              { href: `/${locale}/policies`, label: 'Policies' },
              { href: `/${locale}/policies/cookies`, label: 'Cookies' },
              { href: `/${locale}/policies/disclaimers`, label: 'Disclaimers' },
              { href: `/${locale}/policies/gdpr`, label: 'GDPR' },
              { href: `/${locale}/policies/privacy`, label: 'Privacy' },
              { href: `/${locale}/policies/refund`, label: 'Refund' },
              { href: `/${locale}/policies/terms`, label: 'Terms' },
              { href: '/sitemap.xml', label: 'XML Sitemap' },
            ],
          },
        ],
      },
      {
        id: 'discover',
        label: 'Discover',
        href: `/${locale}/discover`,
        activePrefixes: [`/${locale}/discover`],
        sections: [
          {
            title: labels.discoverRegions,
            links: [
              { href: `/${locale}/discover/brazilian-regions`, label: 'Discover Regions Hub' },
              ...discoverRegionLinks,
            ],
          },
          {
            title: labels.discoverStates,
            links: [{ href: `/${locale}/discover/brazilian-states`, label: 'Discover States Hub' }],
            groups: discoverStateGroups,
          },
        ],
      },
      {
        id: 'blog',
        label: 'Blog by State',
        href: `/${locale}/blog`,
        sections: [
          {
            title: labels.blogStates,
            links: [{ href: `/${locale}/blog`, label: t.nav.blog }],
            groups: blogStateGroups,
          },
        ],
      },
      {
        id: 'faq',
        label: 'FAQ by State',
        href: `/${locale}/faq`,
        sections: [
          {
            title: labels.faqStates,
            links: [{ href: `/${locale}/faq`, label: t.nav.faq }],
            groups: faqStateGroups,
          },
        ],
      },
      {
        id: 'contact',
        label: 'Contact by State',
        href: `/${locale}/contact`,
        sections: [
          {
            title: labels.contactChannels,
            links: [
              { href: `/${locale}/contact`, label: t.nav.contact },
              { href: `/${locale}/visa-consultation`, label: t.cta.button },
              { href: `mailto:${siteConfig.contact.clientEmail}`, label: siteConfig.contact.clientEmail },
              { href: siteConfig.contact.whatsappLink, label: siteConfig.contact.whatsappNumber },
            ],
          },
          {
            title: labels.contactStates,
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
      labels.aboutBrazil,
      labels.aboutStates,
      labels.allPages,
      labels.blogStates,
      labels.contactChannels,
      labels.contactStates,
      labels.discoverRegions,
      labels.discoverStates,
      labels.faqStates,
      labels.resourcesHubs,
      labels.resourcesPolicy,
      labels.servicesCore,
      labels.servicesStates,
      locale,
      serviceStateGroups,
      t.cta.button,
      t.nav.blog,
      t.nav.contact,
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
            <HeaderLogo locale={locale} href={`/${locale}`} />

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
                className="rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-civic-300 hover:text-ink-900"
              >
                {siteConfig.contact.clientEmail}
              </a>
              <LanguageSwitcher />
              <Link
                href={`/${locale}/visa-consultation`}
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
                                        onClick={() => setOpenMenu(null)}
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
                                      onClick={() => setOpenMenu(null)}
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
                href={`/${locale}/library`}
                className={secondaryLinkClass(isActivePath(pathname, `/${locale}/library`))}
                aria-current={isActivePath(pathname, `/${locale}/library`) ? 'page' : undefined}
              >
                {labels.allPages}
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className={cn('border-t border-sand-200 bg-sand-50 lg:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div className="space-y-3 px-4 py-4">
          <div className="rounded-xl border border-sand-200 bg-white p-3">
            <a href={`mailto:${siteConfig.contact.clientEmail}`} className="block text-sm font-semibold text-ink-800 hover:text-civic-700">
              {siteConfig.contact.clientEmail}
            </a>
            <a
              href={siteConfig.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
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
                              onClick={() => setMobileOpen(false)}
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
              href={`/${locale}/library`}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink-800"
            >
              {labels.allPages}
            </Link>
            <Link
              href={`/${locale}/visa-consultation`}
              onClick={() => setMobileOpen(false)}
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
