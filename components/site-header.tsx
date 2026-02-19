'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { brazilianStates } from '@/content/curated/states';
import { copy } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import { cn } from '@/lib/utils';

import { LanguageSwitcher } from './language-switcher';

type MenuLink = {
  href: string;
  label: string;
};

type MenuSection = {
  title: string;
  links: MenuLink[];
  dense?: boolean;
};

type MegaMenu = {
  id: string;
  label: string;
  href: string;
  sections: MenuSection[];
};

interface SiteHeaderProps {
  locale: Locale;
}

function menuCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      aboutOverview: 'Sobre y Empresa',
      servicesCore: 'Servicios Principales',
      servicesLegacy: 'Archivos Históricos',
      servicesStates: 'Servicios por Estado',
      resourcesHubs: 'Centros de Recursos',
      resourcesLibraries: 'Bibliotecas de Contenido',
      insightsHubs: 'Blog y FAQ',
      insightsStates: 'Guías por Estado',
      contactChannels: 'Canales de Contacto',
      contactStates: 'Contacto por Estado',
      allPages: 'Todas las páginas',
      consultation: 'Consulta estratégica',
    };
  }

  if (locale === 'pt') {
    return {
      aboutOverview: 'Sobre e Empresa',
      servicesCore: 'Serviços Principais',
      servicesLegacy: 'Arquivos Legados',
      servicesStates: 'Serviços por Estado',
      resourcesHubs: 'Hubs de Recursos',
      resourcesLibraries: 'Bibliotecas de Conteúdo',
      insightsHubs: 'Blog e FAQ',
      insightsStates: 'Guias por Estado',
      contactChannels: 'Canais de Contato',
      contactStates: 'Contato por Estado',
      allPages: 'Todas as páginas',
      consultation: 'Consulta estratégica',
    };
  }

  return {
    aboutOverview: 'About and Company',
    servicesCore: 'Core Services',
    servicesLegacy: 'Legacy Service Archives',
    servicesStates: 'Service Pages by State',
    resourcesHubs: 'Resource Hubs',
    resourcesLibraries: 'Content Libraries',
    insightsHubs: 'Blog and FAQ',
    insightsStates: 'Guides by State',
    contactChannels: 'Contact Channels',
    contactStates: 'Contact by State',
    allPages: 'All pages',
    consultation: 'Strategy consultation',
  };
}

function desktopLinkClass(active: boolean) {
  return cn(
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    active ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
  );
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const t = copy[locale];
  const labels = menuCopy(locale);
  const pathname = usePathname() || `/${locale}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const stateServiceLinks = useMemo(
    () => brazilianStates.map((state) => ({ href: `/${locale}/services/immigrate-to-${state.slug}`, label: state[locale] })),
    [locale],
  );

  const stateBlogLinks = useMemo(
    () => brazilianStates.map((state) => ({ href: `/${locale}/blog/blog-${state.slug}`, label: state[locale] })),
    [locale],
  );

  const stateContactLinks = useMemo(
    () => brazilianStates.map((state) => ({ href: `/${locale}/contact/contact-${state.slug}`, label: state[locale] })),
    [locale],
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
        sections: [
          {
            title: labels.aboutOverview,
            links: [
              { href: `/${locale}/about`, label: t.nav.about },
              { href: `/${locale}/about/about-brazil`, label: 'About Brazil' },
              { href: `/${locale}/about/about-states`, label: 'About States' },
              { href: `/${locale}/about/about-us`, label: 'About Us' },
              { href: `/${locale}/accessibility`, label: 'Accessibility' },
            ],
          },
        ],
      },
      {
        id: 'services',
        label: t.nav.services,
        href: `/${locale}/services`,
        sections: [
          {
            title: labels.servicesCore,
            links: [
              { href: `/${locale}/services`, label: t.nav.services },
              { href: `/${locale}/services/visa`, label: 'Visa Services' },
              { href: `/${locale}/services/visas`, label: 'Visa Categories' },
              { href: `/${locale}/services/residencies`, label: 'Residency Services' },
              { href: `/${locale}/services/naturalisation`, label: 'Naturalisation Services' },
              { href: `/${locale}/services/legal`, label: 'Legal Services' },
            ],
          },
          {
            title: labels.servicesLegacy,
            links: [
              { href: `/${locale}/services/immigration-law-services/visas/work`, label: 'Immigration Law: Work Visa' },
              { href: `/${locale}/services/immigration-law-services/residencies/permanent`, label: 'Immigration Law: Permanent Residency' },
              { href: `/${locale}/services/immigration-law-services/naturalisation/ordinary`, label: 'Immigration Law: Ordinary Naturalisation' },
              { href: `/${locale}/services/travel-services/guided-trips/north`, label: 'Travel Services: Guided Trips' },
              { href: `/${locale}/services/services-acre/visas/work-visa`, label: 'State Archive: Work Visa' },
              { href: `/${locale}/services/services-sao-paulo/visas/work`, label: 'Sao Paulo Archive: Work Visa' },
            ],
          },
          {
            title: labels.servicesStates,
            links: stateServiceLinks,
            dense: true,
          },
        ],
      },
      {
        id: 'resources',
        label: t.nav.resources,
        href: `/${locale}/resources-guides-brazil`,
        sections: [
          {
            title: labels.resourcesHubs,
            links: [
              { href: `/${locale}/resources-guides-brazil`, label: t.nav.resources },
              { href: `/${locale}/discover/brazilian-states`, label: 'Discover Brazilian States' },
              { href: `/${locale}/discover/brazilian-regions`, label: 'Discover Brazilian Regions' },
              { href: `/${locale}/home`, label: 'Home Archive' },
              { href: `/${locale}/about/about-brazil`, label: 'Brazil Knowledge Hub' },
            ],
          },
          {
            title: labels.resourcesLibraries,
            links: [
              { href: `/${locale}/library`, label: t.nav.library },
              { href: '/sitemap.xml', label: 'XML Sitemap' },
            ],
          },
        ],
      },
      {
        id: 'insights',
        label: t.nav.blog,
        href: `/${locale}/blog`,
        sections: [
          {
            title: labels.insightsHubs,
            links: [
              { href: `/${locale}/blog`, label: t.nav.blog },
              { href: `/${locale}/faq`, label: t.nav.faq },
            ],
          },
          {
            title: labels.insightsStates,
            links: stateBlogLinks,
            dense: true,
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
            links: stateContactLinks,
            dense: true,
          },
        ],
      },
    ],
    [
      labels.aboutOverview,
      labels.contactChannels,
      labels.contactStates,
      labels.consultation,
      labels.insightsHubs,
      labels.insightsStates,
      labels.resourcesHubs,
      labels.resourcesLibraries,
      labels.servicesCore,
      labels.servicesLegacy,
      labels.servicesStates,
      locale,
      stateBlogLinks,
      stateContactLinks,
      stateServiceLinks,
      t.nav.about,
      t.nav.blog,
      t.nav.contact,
      t.nav.faq,
      t.nav.library,
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
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={desktopLinkClass(active)} aria-current={active ? 'page' : undefined}>
                {link.label}
              </Link>
            );
          })}

          {menus.map((menu) => {
            const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
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
                    'absolute left-1/2 top-full mt-3 w-[min(92vw,980px)] -translate-x-1/2 rounded-2xl border border-sand-200 bg-white p-5 shadow-card transition',
                    isOpen ? 'visible opacity-100' : 'invisible opacity-0',
                  )}
                >
                  <div className={cn('grid gap-5', menu.sections.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
                    {menu.sections.map((section) => (
                      <div key={`${menu.id}-${section.title}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-700">{section.title}</p>
                        <div className={cn('mt-3 grid gap-1.5', section.dense ? 'max-h-56 overflow-y-auto pr-1' : '')}>
                          {section.links.map((link) => {
                            const sectionActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                              <Link
                                key={link.href}
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
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
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
                    <div className={cn('mt-2 grid gap-1', section.dense ? 'max-h-40 overflow-y-auto pr-1' : '')}>
                      {section.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="rounded-md border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-ink-800"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
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
