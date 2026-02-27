'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { brazilianStates } from '@/content/curated/states';
import { trackAnalyticsEvent } from '@/lib/analytics-events';
import type { Locale } from '@/lib/types';
import { cn } from '@/lib/utils';

import { LanguageSwitcher } from './language-switcher';

type MenuLink = {
  href: string;
  label: string;
};

type MegaColumn = {
  title: string;
  links: MenuLink[];
};

type MegaMenu = {
  id: string;
  label: string;
  href: string;
  activePrefixes?: string[];
  columns: MegaColumn[];
};

interface SiteHeaderProps {
  locale: Locale;
  brand: string;
  nav: {
    services: string;
    resources: string;
    process: string;
    blog: string;
    faq: string;
  };
  ctaButton: string;
  headerNavigation: {
    brandTagline?: string;
  };
}

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

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
}

function normalizePath(href: string) {
  return href.split('?')[0]?.split('#')[0] || href;
}

function isActivePath(pathname: string, href: string) {
  const normalized = normalizePath(href);
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

function HeaderLogo({ href, brand, tagline }: { href: string; brand: string; tagline: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <BrandLogo variant="mark" priority className="h-12 w-12 rounded-2xl" />
      <div className="leading-tight">
        <p className="font-display text-lg text-ink-900">{brand}</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-civic-700">{tagline}</p>
      </div>
    </Link>
  );
}

function topLevelLinkClass(active: boolean, open: boolean) {
  return cn(
    'inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition',
    active || open ? 'bg-ink-900 text-sand-50' : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
  );
}

function dropdownLinkClass(active: boolean) {
  return cn(
    'block rounded-lg border px-3 py-2 text-sm transition',
    active ? 'border-ink-900 bg-ink-900 text-sand-50' : 'border-sand-200 bg-sand-50 text-ink-800 hover:border-civic-300 hover:bg-white',
  );
}

export function SiteHeader({ locale, brand }: SiteHeaderProps) {
  const pathname = usePathname() || `/${locale}`;
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const homeHref = resolveCmsHref(locale, '/');
  const searchHref = resolveCmsHref(locale, '/search');
  const accessibilityHref = resolveCmsHref(locale, '/accessibility');
  const portalHref = resolveCmsHref(locale, '/client-portal');
  const consultationHref = resolveCmsHref(locale, '/visa-consultation');

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

  const allStateLinks = useMemo(
    () =>
      [...brazilianStates]
        .sort((a, b) => a[locale].localeCompare(b[locale]))
        .map((state) => ({
          label: state[locale],
          href: resolveCmsHref(locale, `/discover/brazilian-states/${state.code.toLowerCase()}`),
        })),
    [locale],
  );

  const menus = useMemo<MegaMenu[]>(() => {
    const mapLinks = (entries: Array<[string, string]>) => entries.map(([label, href]) => ({ label, href: resolveCmsHref(locale, href) }));

    return [
      {
        id: 'services',
        label: 'Services',
        href: resolveCmsHref(locale, '/services'),
        activePrefixes: [resolveCmsHref(locale, '/visa-consultation')],
        columns: [
          {
            title: 'Visas',
            links: mapLinks([
              ['Artistic', '/services/immigration-law-services/visas/artistic'],
              ['Business', '/services/immigration-law-services/visas/business'],
              ['Educational', '/services/immigration-law-services/visas/educational-exchange'],
              ['Exchange', '/services/immigration-law-services/visas/educational-exchange'],
              ['Digital Nomad', '/services/immigration-law-services/visas/digital-nomad'],
              ['Diplomatic', '/services/immigration-law-services/visas/diplomatic'],
              ['Family', '/services/immigration-law-services/visas/family'],
              ['Humanitarian', '/services/immigration-law-services/visas/humanitarian'],
              ['Investor', '/services/immigration-law-services/visas/investor'],
              ['Journalist', '/services/immigration-law-services/visas/journalist'],
              ['Medical', '/services/immigration-law-services/visas/medical'],
              ['Religious', '/services/immigration-law-services/visas/religious'],
              ['Research', '/services/immigration-law-services/visas/research'],
              ['Retiree', '/services/immigration-law-services/visas/retiree'],
              ['Sports', '/services/immigration-law-services/visas/sports'],
              ['Startup', '/services/immigration-law-services/visas/startup'],
              ['Student', '/services/immigration-law-services/visas/student'],
              ['Tourist', '/services/immigration-law-services/visas/tourist'],
              ['Transit', '/services/immigration-law-services/visas/transit'],
              ['Volunteer', '/services/immigration-law-services/visas/volunteer'],
              ['Work', '/services/immigration-law-services/visas/work'],
            ]),
          },
          {
            title: 'Residencies',
            links: mapLinks([
              ['CPLP', '/services/immigration-law-services/residencies/cplp'],
              ['MERCOSUL', '/services/immigration-law-services/residencies/mercosul'],
              ['Digital Nomad', '/services/immigration-law-services/residencies/digital-nomad'],
              ['Educational', '/services/immigration-law-services/residencies/educational-exchange'],
              ['Exchange', '/services/immigration-law-services/residencies/youth-exchange'],
              ['Family Reunion', '/services/immigration-law-services/residencies/family-reunion'],
              ['Health', '/services/immigration-law-services/residencies/health-treatment'],
              ['Humanitarian', '/services/immigration-law-services/residencies/humanitarian'],
              ['Investor', '/services/immigration-law-services/residencies/investor'],
              ['Religious', '/services/immigration-law-services/residencies/religious'],
              ['Retiree', '/services/immigration-law-services/residencies/retiree'],
              ['Research', '/services/immigration-law-services/residencies/researcher'],
              ['Skilled', '/services/immigration-law-services/residencies/skilled-worker'],
              ['Study', '/services/immigration-law-services/residencies/study'],
              ['Work', '/services/immigration-law-services/residencies/work'],
              ['Youth', '/services/immigration-law-services/residencies/youth-exchange'],
              ['Volunteer', '/services/immigration-law-services/residencies/volunteer'],
            ]),
          },
          {
            title: 'Naturalisation',
            links: mapLinks([
              ['Ordinary', '/services/immigration-law-services/naturalisation/ordinary'],
              ['Extraordinary', '/services/immigration-law-services/naturalisation/extraordinary'],
              ['Provisional', '/services/immigration-law-services/naturalisation/provisional'],
              ['Special', '/services/immigration-law-services/naturalisation/special'],
              ['Renunciation', '/services/immigration-law-services/naturalisation/renouncing-citizenship'],
              ['Reacquisition', '/services/immigration-law-services/naturalisation/reacquisition-citizenship'],
            ]),
          },
          {
            title: 'Defense',
            links: mapLinks([
              ['Deportation', '/services/immigration-law-services/other-services/deportation'],
              ['Expulsion', '/services/immigration-law-services/other-services/expulsion'],
              ['Extradition', '/services/immigration-law-services/other-services/extradition'],
              ['Appeals', '/services/immigration-law-services/other-services/appeals'],
              ['Fines', '/services/immigration-law-services/other-services/fines'],
              ['Litigation', '/services/legal'],
            ]),
          },
          {
            title: 'Services',
            links: mapLinks([
              ['Consular', '/services/immigration-law-services/other-services/consular'],
              ['Criminal Records', '/services/immigration-law-services/other-services/criminal-records'],
              ['Translation', '/services/immigration-law-services/other-services/translation'],
              ['Regularization', '/services/legal'],
            ]),
          },
          {
            title: 'Advisory',
            links: mapLinks([
              ['Consultation', '/services/immigration-law-services/other-services/consultation'],
              ['Strategy', '/consultation'],
              ['Compliance', '/about/about-us/legal-compliance-standards'],
              ['Representation', '/services/legal'],
              ['Corporate', '/services/immigration-law-services/other-services/company-formation'],
            ]),
          },
        ],
      },
      {
        id: 'process',
        label: 'Process',
        href: resolveCmsHref(locale, '/process'),
        columns: [
          {
            title: 'Method',
            links: mapLinks([
              ['Consultation', '/consultation'],
              ['Assessment', '/process'],
              ['Strategy', '/about/about-us/immigration-done-right'],
              ['Filing', '/process'],
              ['Approval', '/process'],
              ['Works', '/about/about-us/how-it-works'],
            ]),
          },
          {
            title: 'Avoiding Pitfalls',
            links: mapLinks([
              ['Mistakes', '/about/about-us/common-mistakes'],
              ['Failures', '/about/about-us/common-mistakes'],
              ['Deadlines', '/process'],
              ['Obligations', '/process'],
              ['Alone', '/about/about-us/10-reasons-not-alone'],
              ['Fees', '/consultation'],
              ['Refund', '/policies/refund'],
              ['Timeline', '/process'],
              ['Responsibilities', '/process'],
              ['Right', '/about/about-us/immigration-done-right'],
            ]),
          },
          {
            title: 'Aftercare',
            links: mapLinks([
              ['Renewal', '/services/immigration-law-services/residencies/temporary-residency'],
              ['Permanent', '/services/immigration-law-services/residencies/permanent'],
              ['Naturalisation', '/services/immigration-law-services/naturalisation/ordinary'],
              ['Compliance', '/about/about-us/legal-compliance-standards'],
            ]),
          },
          {
            title: 'Lifecycle',
            links: mapLinks([
              ['Conversion', '/services/immigration-law-services/residencies/permanent-residency'],
              ['Regularization', '/services/legal'],
              ['Planning', '/consultation'],
            ]),
          },
        ],
      },
      {
        id: 'brazil',
        label: 'Brazil',
        href: resolveCmsHref(locale, '/discover'),
        activePrefixes: [
          resolveCmsHref(locale, '/discover'),
          resolveCmsHref(locale, '/about/about-brazil'),
          resolveCmsHref(locale, '/about/about-states'),
        ],
        columns: [
          {
            title: 'Discover',
            links: mapLinks([
              ['Why Brazil', '/about/about-brazil'],
              ['Investment', '/services/immigration-law-services/residencies/investor'],
              ['Economy', '/about/about-brazil/cost-of-living-in-brazil'],
              ['Quality', '/about/about-us/immigration-done-right'],
            ]),
          },
          {
            title: 'Living',
            links: mapLinks([
              ['Cost', '/about/about-brazil/cost-of-living-in-brazil'],
              ['Housing', '/resources-guides-brazil'],
              ['Healthcare', '/services/immigration-law-services/residencies/health-treatment'],
              ['Education', '/services/immigration-law-services/visas/student'],
              ['Safety', '/about/about-states'],
            ]),
          },
          {
            title: 'Regions',
            links: mapLinks([
              ['North', '/discover/brazilian-regions/north-region'],
              ['Northeast', '/discover/brazilian-regions/northeast-region'],
              ['Central-West', '/discover/brazilian-regions/central-west-region'],
              ['Southeast', '/discover/brazilian-regions/southeast-region'],
              ['South', '/discover/brazilian-regions/south-region'],
            ]),
          },
          {
            title: 'States',
            links: [
              { label: 'Directory', href: resolveCmsHref(locale, '/discover/brazilian-states') },
              ...allStateLinks,
            ],
          },
          {
            title: 'Cities',
            links: mapLinks([
              ['Guides', '/discover/brazilian-regions'],
              ['Municipalities', '/discover/brazilian-regions'],
              ['Search: Maringa', '/search?q=Maringa'],
            ]),
          },
          {
            title: 'Culture',
            links: mapLinks([
              ['Festivals', '/about/about-brazil/festivals'],
              ['Cuisine', '/about/about-brazil/food'],
              ['Events', '/about/about-brazil/festivals'],
              ['Blogs', '/blog'],
              ['FAQs', '/faq'],
            ]),
          },
        ],
      },
      {
        id: 'insights',
        label: 'Insights',
        href: resolveCmsHref(locale, '/resources-guides-brazil'),
        activePrefixes: [
          resolveCmsHref(locale, '/resources-guides-brazil'),
          resolveCmsHref(locale, '/blog'),
          resolveCmsHref(locale, '/faq'),
          resolveCmsHref(locale, '/state-guides'),
          resolveCmsHref(locale, '/policies'),
          resolveCmsHref(locale, '/search'),
          resolveCmsHref(locale, '/library'),
        ],
        columns: [
          {
            title: 'Guides',
            links: mapLinks([
              ['Immigration', '/resources-guides-brazil'],
              ['Visa', '/services/visas'],
              ['Residency', '/services/residencies'],
              ['Citizenship', '/services/naturalisation'],
              ['State', '/state-guides'],
            ]),
          },
          {
            title: 'FAQ',
            links: mapLinks([
              ['General', '/faq'],
              ['Visa', '/faq'],
              ['Residency', '/faq'],
              ['Process', '/process'],
              ['Compliance', '/about/about-us/legal-compliance-standards'],
              ['State', '/faq'],
            ]),
          },
          {
            title: 'Blog',
            links: mapLinks([
              ['Updates', '/blog'],
              ['Legal', '/blog'],
              ['Policy', '/policies'],
              ['State', '/state-guides'],
              ['Cases', '/about/about-us/10-success-stories'],
            ]),
          },
          {
            title: 'Resources',
            links: mapLinks([
              ['Process', '/process'],
              ['Mistakes', '/about/about-us/common-mistakes'],
              ['Standards', '/about/about-us/legal-compliance-standards'],
              ['Accessibility', '/accessibility'],
              ['Portal', '/client-portal'],
              ['Checklist', '/resources-guides-brazil'],
            ]),
          },
          {
            title: 'Archive',
            links: mapLinks([
              ['Policy', '/policies'],
              ['Press', '/about/about-us/10-press-mentions'],
              ['Sitemap', '/sitemap.xml'],
              ['Search: Visa Updates', '/search?q=Visa+Updates'],
            ]),
          },
        ],
      },
      {
        id: 'about-us',
        label: 'About Us',
        href: resolveCmsHref(locale, '/about/about-us'),
        activePrefixes: [resolveCmsHref(locale, '/about/about-us')],
        columns: [
          {
            title: 'Profile',
            links: mapLinks([
              ['About', '/about/about-us'],
              ['Mission', '/about/about-us/mission'],
              ['Philosophy', '/about/about-us/immigration-done-right'],
              ['Institutional', '/about/about-us/trusted-worldwide'],
              ['Story', '/about/about-us/10-success-stories'],
              ['Values', '/about/about-us/mission-values-ethics'],
            ]),
          },
          {
            title: 'Team',
            links: mapLinks([
              ['Lawyers', '/about/about-us/10-experts'],
              ['Advisors', '/about/about-us/10-experts'],
              ['Staff', '/about/about-us/10-experts'],
              ['Experts', '/about/about-us/10-experts'],
            ]),
          },
          {
            title: 'Experience',
            links: mapLinks([
              ['Years', '/about/about-us/years-experience'],
              ['Volume', '/about/about-us/10-success-stories'],
              ['Industries', '/about/about-us/trusted-worldwide'],
            ]),
          },
          {
            title: 'Recognition',
            links: mapLinks([
              ['Awards', '/about/about-us/10-awards'],
              ['Media', '/about/about-us/10-press-mentions'],
              ['Speaking', '/about/about-us/trusted-worldwide'],
              ['Mentions', '/about/about-us/10-press-mentions'],
            ]),
          },
          {
            title: 'Credibility',
            links: mapLinks([
              ['Why Us', '/about/about-us/10-reasons-choose-us'],
              ['Results', '/about/about-us/10-success-stories'],
              ['Stories', '/about/about-us/10-success-stories'],
              ['Clients', '/about/about-us/trusted-worldwide'],
              ['Testimonials', '/about/about-us/10-success-stories'],
            ]),
          },
          {
            title: 'Governance',
            links: mapLinks([
              ['Compliance', '/about/about-us/legal-compliance-standards'],
              ['Ethics', '/about/about-us/mission-values-ethics'],
              ['Standards', '/about/about-us/legal-compliance-standards'],
              ['Regulatory', '/policies'],
            ]),
          },
        ],
      },
    ];
  }, [allStateLinks, locale]);

  const openMenuData = useMemo(() => menus.find((menu) => menu.id === openMenu) || null, [menus, openMenu]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/95 backdrop-blur">
      <div className="border-b border-sand-200/80 bg-white/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Link
                href={accessibilityHref}
                className={cn(
                  'rounded-full border border-sand-300 bg-white px-3 py-1 font-semibold text-ink-700 transition',
                  'hover:border-civic-300 hover:text-ink-900',
                )}
              >
                Accessibility Switcher
              </Link>
              <Link
                href={searchHref}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-ink-700 transition hover:border-civic-300 hover:text-ink-900"
                aria-label="Search site"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <Link
                href={portalHref}
                className="rounded-full border border-sand-300 bg-white px-3 py-1 font-semibold text-ink-700 transition hover:border-civic-300 hover:text-ink-900"
              >
                Client Portal Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-sand-200 bg-sand-50/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 lg:grid-cols-3">
            <HeaderLogo href={homeHref} brand={brand} tagline="Helping Immigrants, Promoting Brazil" />

            <div className="hidden justify-self-center lg:block">
              <Link
                href={homeHref}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-semibold transition',
                  pathname === homeHref || isActivePath(pathname, resolveCmsHref(locale, '/home'))
                    ? 'bg-ink-900 text-sand-50'
                    : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
                )}
              >
                Home
              </Link>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Link
                href={consultationHref}
                onClick={() => trackCtaClick('header_desktop')}
                className="hidden rounded-full bg-civic-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-civic-800 lg:inline-flex"
              >
                Start Consultation
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-200 bg-white text-ink-800 lg:hidden"
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
          <div ref={desktopMenuRef} className="relative py-2.5" onMouseLeave={() => setOpenMenu(null)}>
            <nav className="grid grid-cols-5 items-center gap-2">
              {menus.map((menu) => {
                const active = [menu.href, ...(menu.activePrefixes || [])].some((prefix) => isActivePath(pathname, prefix));
                const isOpen = openMenuData?.id === menu.id;

                return (
                  <button
                    key={menu.id}
                    type="button"
                    onMouseEnter={() => setOpenMenu(menu.id)}
                    onClick={() => setOpenMenu((prev) => (prev === menu.id ? null : menu.id))}
                    className={topLevelLinkClass(active, isOpen)}
                    aria-expanded={isOpen}
                  >
                    <span>{menu.label}</span>
                    <span className={cn('ml-1 inline-block text-xs transition-transform', isOpen ? 'rotate-180' : '')}>▾</span>
                  </button>
                );
              })}
            </nav>

            <div
              className={cn(
                'absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-sand-200 bg-white p-5 shadow-card transition duration-200',
                openMenuData ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-1 opacity-0',
              )}
            >
              {openMenuData ? (
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${openMenuData.columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {openMenuData.columns.map((column) => (
                    <section key={`${openMenuData.id}-${column.title}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-700">{column.title}</p>
                      <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto pr-1">
                        {column.links.map((link) => {
                          const external = isExternalHref(link.href);
                          const active = !external && isActivePath(pathname, link.href);

                          if (external) {
                            return (
                              <a
                                key={`${column.title}-${link.label}-${link.href}`}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={dropdownLinkClass(false)}
                                onClick={() => setOpenMenu(null)}
                              >
                                {link.label}
                              </a>
                            );
                          }

                          return (
                            <Link
                              key={`${column.title}-${link.label}-${link.href}`}
                              href={link.href}
                              className={dropdownLinkClass(active)}
                              onClick={() => setOpenMenu(null)}
                            >
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className={cn('border-t border-sand-200 bg-sand-50 lg:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div className="space-y-3 px-4 py-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={homeHref}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-xl px-3 py-2 text-center text-sm font-semibold',
                pathname === homeHref || isActivePath(pathname, resolveCmsHref(locale, '/home'))
                  ? 'bg-ink-900 text-sand-50'
                  : 'bg-white text-ink-700 hover:bg-sand-100',
              )}
            >
              Home
            </Link>
            <Link
              href={consultationHref}
              onClick={() => {
                trackCtaClick('header_mobile');
                setMobileOpen(false);
              }}
              className="block rounded-xl bg-civic-700 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Start Consultation
            </Link>
          </div>

          {menus.map((menu) => (
            <details key={menu.id} className="rounded-xl border border-sand-200 bg-white p-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-ink-900">{menu.label}</summary>
              <div className="mt-3 space-y-3">
                {menu.columns.map((column) => (
                  <div key={`${menu.id}-${column.title}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-civic-700">{column.title}</p>
                    <div className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
                      {column.links.map((link) => {
                        const external = isExternalHref(link.href);
                        if (external) {
                          return (
                            <a
                              key={`${column.title}-${link.label}-${link.href}`}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-md border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-ink-800"
                              onClick={() => setMobileOpen(false)}
                            >
                              {link.label}
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={`${column.title}-${link.label}-${link.href}`}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-md border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-ink-800"
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </header>
  );
}
