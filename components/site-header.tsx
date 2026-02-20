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
  dense?: boolean;
};

type MenuSection = {
  title: string;
  links?: MenuLink[];
  groups?: MenuGroup[];
  dense?: boolean;
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

function menuCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      aboutCore: 'Base institucional',
      aboutBrazil: 'Brasil en profundidad',
      aboutStates: 'Estados por región',
      servicesCore: 'Servicios esenciales',
      servicesFamilies: 'Familias de servicios',
      servicesStates: 'Operación por estado',
      resourcesHubs: 'Centros principales',
      resourcesDiscover: 'Mapas de descubrimiento',
      resourcesPolicy: 'Políticas y legal',
      insightsCore: 'Centros editoriales',
      insightsBlogStates: 'Blog por región',
      insightsFaqStates: 'FAQ por región',
      contactChannels: 'Canales de contacto',
      contactStates: 'Contacto por región',
      consultation: 'Consulta estratégica',
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
      aboutCore: 'Base institucional',
      aboutBrazil: 'Brasil em profundidade',
      aboutStates: 'Estados por regiao',
      servicesCore: 'Servicos essenciais',
      servicesFamilies: 'Familias de servico',
      servicesStates: 'Operacao por estado',
      resourcesHubs: 'Centros principais',
      resourcesDiscover: 'Mapas de descoberta',
      resourcesPolicy: 'Politicas e legal',
      insightsCore: 'Centros editoriais',
      insightsBlogStates: 'Blog por regiao',
      insightsFaqStates: 'FAQ por regiao',
      contactChannels: 'Canais de contato',
      contactStates: 'Contato por regiao',
      consultation: 'Consulta estrategica',
      allPages: 'Todas as paginas',
      regionNorth: 'Norte',
      regionNortheast: 'Nordeste',
      regionCentralWest: 'Centro-Oeste',
      regionSoutheast: 'Sudeste',
      regionSouth: 'Sul',
    };
  }

  if (locale === 'fr') {
    return {
      aboutCore: 'Base institutionnelle',
      aboutBrazil: 'Brésil en profondeur',
      aboutStates: 'États par région',
      servicesCore: 'Services essentiels',
      servicesFamilies: 'Familles de services',
      servicesStates: 'Opérations par État',
      resourcesHubs: 'Hubs principaux',
      resourcesDiscover: 'Cartes de découverte',
      resourcesPolicy: 'Politiques et juridique',
      insightsCore: 'Hubs éditoriaux',
      insightsBlogStates: 'Blog par région',
      insightsFaqStates: 'FAQ par région',
      contactChannels: 'Canaux de contact',
      contactStates: 'Contact par région',
      consultation: 'Consultation stratégique',
      allPages: 'Toutes les pages',
      regionNorth: 'Nord',
      regionNortheast: 'Nord-Est',
      regionCentralWest: 'Centre-Ouest',
      regionSoutheast: 'Sud-Est',
      regionSouth: 'Sud',
    };
  }

  return {
    aboutCore: 'Company Foundation',
    aboutBrazil: 'Brazil Knowledge',
    aboutStates: 'States by Region',
    servicesCore: 'Core Services',
    servicesFamilies: 'Service Families',
    servicesStates: 'State Operations',
    resourcesHubs: 'Main Hubs',
    resourcesDiscover: 'Discovery Maps',
    resourcesPolicy: 'Policy and Legal',
    insightsCore: 'Editorial Hubs',
    insightsBlogStates: 'Blog by Region',
    insightsFaqStates: 'FAQ by Region',
    contactChannels: 'Contact Channels',
    contactStates: 'Contact by Region',
    consultation: 'Strategy consultation',
    allPages: 'All Pages',
    regionNorth: 'North',
    regionNortheast: 'Northeast',
    regionCentralWest: 'Central-West',
    regionSoutheast: 'Southeast',
    regionSouth: 'South',
  };
}

function topRowLinkClass(active: boolean) {
  return cn(
    'rounded-full px-3.5 py-2 text-sm font-semibold transition',
    active ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
  );
}

function menuButtonClass(active: boolean, open: boolean) {
  return cn(
    'inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition',
    active || open ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
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
      dense: true,
    };
  });
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const t = copy[locale];
  const labels = useMemo(() => menuCopy(locale), [locale]);
  const pathname = usePathname() || `/${locale}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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

  const quickLinks = useMemo(
    () => [
      { href: `/${locale}`, label: t.nav.home },
      { href: `/${locale}/process`, label: t.nav.process },
    ],
    [locale, t.nav.home, t.nav.process],
  );

  const menus = useMemo<MegaMenu[]>(
    () => [
      {
        id: 'about',
        label: t.nav.about,
        href: `/${locale}/about`,
        activePrefixes: [`/${locale}/accessibility`],
        sections: [
          {
            title: labels.aboutCore,
            links: [
              { href: `/${locale}/about`, label: t.nav.about },
              { href: `/${locale}/about/about-us`, label: 'About Us' },
              { href: `/${locale}/accessibility`, label: 'Accessibility' },
            ],
          },
          {
            title: labels.aboutBrazil,
            links: [
              { href: `/${locale}/about/about-brazil`, label: 'About Brazil' },
              { href: `/${locale}/about/about-brazil/apply-brazil`, label: 'Apply to Brazil' },
              { href: `/${locale}/about/about-brazil/cost-of-living-in-brazil`, label: 'Cost of Living in Brazil' },
            ],
          },
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
              { href: `/${locale}/visa-consultation`, label: labels.consultation },
              { href: `/${locale}/services/visa`, label: 'Visa Services' },
              { href: `/${locale}/services/visas`, label: 'Visa Categories' },
              { href: `/${locale}/services/residencies`, label: 'Residency Services' },
              { href: `/${locale}/services/naturalisation`, label: 'Naturalisation Services' },
              { href: `/${locale}/services/legal`, label: 'Legal Services' },
            ],
          },
          {
            title: labels.servicesFamilies,
            links: [
              { href: `/${locale}/services/immigration-law-services/visas/work`, label: 'Immigration Law: Work Visa' },
              {
                href: `/${locale}/services/immigration-law-services/residencies/permanent`,
                label: 'Immigration Law: Permanent Residency',
              },
              {
                href: `/${locale}/services/immigration-law-services/naturalisation/ordinary`,
                label: 'Immigration Law: Ordinary Naturalisation',
              },
              { href: `/${locale}/services/travel-services/guided-trips/north`, label: 'Travel Services: Guided Trips' },
              { href: `/${locale}/services/services-acre/visas/work-visa`, label: 'State Archive: Acre Work Visa' },
              { href: `/${locale}/services/services-sao-paulo/visas/work`, label: 'State Archive: Sao Paulo Work Visa' },
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
        activePrefixes: [`/${locale}/discover`, `/${locale}/home`, `/${locale}/library`, `/${locale}/policies`],
        sections: [
          {
            title: labels.resourcesHubs,
            links: [
              { href: `/${locale}/resources-guides-brazil`, label: t.nav.resources },
              { href: `/${locale}/library`, label: labels.allPages },
              { href: `/${locale}/home`, label: 'Home Archive' },
            ],
          },
          {
            title: labels.resourcesDiscover,
            links: [
              { href: `/${locale}/discover/brazilian-states`, label: 'Discover Brazilian States' },
              { href: `/${locale}/discover/brazilian-regions`, label: 'Discover Brazilian Regions' },
            ],
          },
          {
            title: labels.resourcesPolicy,
            links: [
              { href: `/${locale}/policies`, label: 'Policies' },
              { href: `/${locale}/policies/privacy`, label: 'Privacy Policy' },
              { href: `/${locale}/policies/terms`, label: 'Terms of Service' },
              { href: `/${locale}/policies/cookies`, label: 'Cookie Policy' },
              { href: '/sitemap.xml', label: 'XML Sitemap' },
            ],
          },
        ],
      },
      {
        id: 'insights',
        label: t.nav.blog,
        href: `/${locale}/blog`,
        activePrefixes: [`/${locale}/faq`],
        sections: [
          {
            title: labels.insightsCore,
            links: [
              { href: `/${locale}/blog`, label: t.nav.blog },
              { href: `/${locale}/faq`, label: t.nav.faq },
            ],
          },
          {
            title: labels.insightsBlogStates,
            groups: blogStateGroups,
          },
          {
            title: labels.insightsFaqStates,
            groups: faqStateGroups,
          },
        ],
      },
      {
        id: 'contact',
        label: t.nav.contact,
        href: `/${locale}/contact`,
        sections: [
          {
            title: labels.contactChannels,
            links: [
              { href: `/${locale}/contact`, label: t.nav.contact },
              { href: `/${locale}/visa-consultation`, label: labels.consultation },
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
      faqStateGroups,
      labels.aboutBrazil,
      labels.aboutCore,
      labels.aboutStates,
      labels.allPages,
      labels.consultation,
      labels.contactChannels,
      labels.contactStates,
      labels.insightsBlogStates,
      labels.insightsCore,
      labels.insightsFaqStates,
      labels.resourcesDiscover,
      labels.resourcesHubs,
      labels.resourcesPolicy,
      labels.servicesCore,
      labels.servicesFamilies,
      labels.servicesStates,
      locale,
      serviceStateGroups,
      t.nav.about,
      t.nav.blog,
      t.nav.contact,
      t.nav.faq,
      t.nav.resources,
      t.nav.services,
    ],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/95 backdrop-blur">
      <div className="border-b border-sand-200/70">
        <div className="mx-auto hidden h-[84px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:flex lg:px-8">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <BrandLogo variant="mark" priority />
              <div className="leading-tight">
                <p className="font-display text-lg text-ink-900">{t.brand}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-civic-700">Premium Advisory</p>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {quickLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link key={link.href} href={link.href} className={topRowLinkClass(active)} aria-current={active ? 'page' : undefined}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-3">
            <a
              href={`mailto:${siteConfig.contact.clientEmail}`}
              className="rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-civic-300"
            >
              {siteConfig.contact.clientEmail}
            </a>
            <LanguageSwitcher />
            <Link
              href={`/${locale}/visa-consultation`}
              className="rounded-full bg-civic-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-civic-800"
            >
              {t.cta.button}
            </Link>
          </div>
        </div>

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:hidden lg:px-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-3">
            <BrandLogo variant="mark" priority />
            <div className="leading-tight">
              <p className="font-display text-base text-ink-900">{t.brand}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-civic-700">Premium Advisory</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
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

      <div className="hidden border-t border-sand-200/70 bg-sand-50 lg:block">
        <div ref={desktopNavRef} className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          {menus.map((menu) => {
            const active = [menu.href, ...(menu.activePrefixes || [])].some((prefix) => isActivePath(pathname, prefix));
            const isOpen = openMenu === menu.id;

            return (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => setOpenMenu(menu.id)}
              >
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => (prev === menu.id ? null : menu.id))}
                  className={menuButtonClass(active, isOpen)}
                  aria-expanded={isOpen}
                >
                  <span>{menu.label}</span>
                  <span className={cn('text-xs transition', isOpen ? 'rotate-180' : '')}>▾</span>
                </button>

                <div
                  className={cn(
                    'absolute left-1/2 top-full mt-3 w-[min(96vw,1120px)] -translate-x-1/2 rounded-2xl border border-sand-200 bg-white p-5 shadow-card transition duration-200',
                    isOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-1 scale-[0.98] opacity-0 pointer-events-none',
                  )}
                >
                  <div className={cn('grid gap-5', menu.sections.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
                    {menu.sections.map((section) => (
                      <div key={`${menu.id}-${section.title}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-700">{section.title}</p>

                        {section.links?.length ? (
                          <div className={cn('mt-3 grid gap-1.5', section.dense ? 'max-h-56 overflow-y-auto pr-1' : '')}>
                            {section.links.map((link) => {
                              const sectionActive = link.href.startsWith(`/${locale}`) && isActivePath(pathname, link.href);
                              const external = !link.href.startsWith('/');
                              return (
                                <Link
                                  key={`${section.title}-${link.href}`}
                                  href={link.href}
                                  target={external ? '_blank' : undefined}
                                  rel={external ? 'noopener noreferrer' : undefined}
                                  className={cn(
                                    'rounded-lg border px-3 py-2 text-sm transition',
                                    sectionActive
                                      ? 'border-ink-900 bg-ink-900 text-sand-50'
                                      : 'border-sand-200 bg-sand-50 text-ink-800 hover:border-civic-300 hover:bg-white',
                                  )}
                                >
                                  {link.label}
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}

                        {section.groups?.length ? (
                          <div className="mt-3 space-y-3">
                            {section.groups.map((group) => (
                              <div key={`${section.title}-${group.title}`} className="rounded-xl border border-sand-200 bg-sand-50 p-2.5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-civic-700">{group.title}</p>
                                <div className={cn('mt-1.5 grid gap-1', group.dense ? 'max-h-28 overflow-y-auto pr-1' : '')}>
                                  {group.links.map((link) => {
                                    const sectionActive = link.href.startsWith(`/${locale}`) && isActivePath(pathname, link.href);
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
                                      >
                                        {link.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href={`/${locale}/library`}
            className={cn(
              'ml-auto rounded-full px-4 py-2 text-sm font-semibold transition',
              isActivePath(pathname, `/${locale}/library`) ? 'bg-ink-900 text-sand-50' : 'bg-white text-ink-700 hover:bg-sand-100',
            )}
          >
            {labels.allPages}
          </Link>
        </div>
      </div>

      <div className={cn('border-t border-sand-200 bg-sand-50 lg:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div className="space-y-3 px-4 py-4">
          {quickLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-xl px-3 py-2 text-sm font-semibold',
                  active ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100',
                )}
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
                      <div className={cn('mt-2 grid gap-1', section.dense ? 'max-h-44 overflow-y-auto pr-1' : '')}>
                        {section.links.map((link) => {
                          const external = !link.href.startsWith('/');
                          return (
                            <Link
                              key={`${section.title}-${link.href}`}
                              href={link.href}
                              target={external ? '_blank' : undefined}
                              rel={external ? 'noopener noreferrer' : undefined}
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
                            <div className={cn('mt-2 grid gap-1', group.dense ? 'max-h-40 overflow-y-auto pr-1' : '')}>
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

          <Link
            href={`/${locale}/library`}
            onClick={() => setMobileOpen(false)}
            className="block rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink-900"
          >
            {labels.allPages}
          </Link>

          <a
            href={`mailto:${siteConfig.contact.clientEmail}`}
            className="block rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink-900"
          >
            {siteConfig.contact.clientEmail}
          </a>

          <Link
            href={`/${locale}/visa-consultation`}
            onClick={() => setMobileOpen(false)}
            className="block rounded-xl bg-civic-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            {t.cta.button}
          </Link>
        </div>
      </div>
    </header>
  );
}
