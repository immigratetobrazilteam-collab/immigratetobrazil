'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { brazilianStates, type BrazilianState } from '@/content/curated/states';
import { copy } from '@/lib/i18n';
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
      regionNorth: 'Norte',
      regionNortheast: 'Nordeste',
      regionCentralWest: 'Centro-Oeste',
      regionSoutheast: 'Sudeste',
      regionSouth: 'Sul',
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

  const topLinks = useMemo(
    () => [
      { href: `/${locale}`, label: t.nav.home },
      { href: `/${locale}/process`, label: t.nav.process },
      { href: `/${locale}/library`, label: t.nav.library },
    ],
    [locale, t.nav.home, t.nav.library, t.nav.process],
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
              { href: `/${locale}/process`, label: t.nav.process },
              { href: `/${locale}/home`, label: 'Home Archive' },
              { href: `/${locale}/library`, label: t.nav.library },
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
      t.nav.library,
      t.nav.process,
      t.nav.resources,
      t.nav.services,
    ],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="group inline-flex items-center gap-3">
          <span className="inline-flex h-11 w-11 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-civic-700 to-ink-800 text-sm font-black uppercase tracking-[0.12em] text-sand-50 shadow-glow">
            ITB
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg text-ink-900">{t.brand}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-civic-700">Premium Advisory</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {topLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={desktopLinkClass(active)} aria-current={active ? 'page' : undefined}>
                {link.label}
              </Link>
            );
          })}

          {menus.map((menu) => {
            const active = [menu.href, ...(menu.activePrefixes || [])].some((prefix) => isActivePath(pathname, prefix));
            const isOpen = openMenu === menu.id;

            return (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => setOpenMenu(menu.id)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => (prev === menu.id ? null : menu.id))}
                  className={desktopLinkClass(active)}
                  aria-expanded={isOpen}
                >
                  <span>{menu.label}</span>
                  <span className="ml-1 text-xs">▾</span>
                </button>

                <div
                  className={cn(
                    'absolute left-1/2 top-full mt-3 w-[min(96vw,1120px)] -translate-x-1/2 rounded-2xl border border-sand-200 bg-white p-5 shadow-card transition',
                    isOpen ? 'visible opacity-100' : 'invisible opacity-0',
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
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/visa-consultation`}
            className="rounded-full bg-civic-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-civic-800"
          >
            {t.cta.button}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-200 bg-white text-ink-800 xl:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{mobileOpen ? '×' : '≡'}</span>
        </button>
      </div>

      <div className={cn('border-t border-sand-200 bg-sand-50 xl:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div className="space-y-3 px-4 py-4">
          {topLinks.map((link) => {
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
                        {section.links.map((link) => (
                          <Link
                            key={`${section.title}-${link.href}`}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-md border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-ink-800"
                          >
                            {link.label}
                          </Link>
                        ))}
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

          <div className="pt-2">
            <LanguageSwitcher />
          </div>

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
