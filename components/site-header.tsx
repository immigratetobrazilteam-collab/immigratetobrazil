'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { trackAnalyticsEvent } from '@/lib/analytics-events';
import { getNavigationMap } from '@/lib/navigation-map-content';
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

export function SiteHeader({ locale, brand, headerNavigation }: SiteHeaderProps) {
  const pathname = usePathname() || `/${locale}`;
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const navMap = useMemo(() => getNavigationMap(locale), [locale]);
  const homeItem = navMap.resolveItem(navMap.header.main_menu.home_id);
  const ctaItem = navMap.resolveItem(navMap.header.main_menu.cta_id);
  const accessibilityItem = navMap.resolveItem('top_accessibility');
  const portalItem = navMap.resolveItem('top_client_portal');
  const homeHref = homeItem?.href || resolveCmsHref(locale, '/');
  const homeLabel = homeItem?.label || 'Home';
  const accessibilityLabel = accessibilityItem?.label || 'Accessibility';
  const portalHref = portalItem?.href || resolveCmsHref(locale, '/client-portal');
  const portalLabel = portalItem?.label || 'Client Portal';
  const consultationHref = ctaItem?.href || resolveCmsHref(locale, '/consultation');
  const consultationLabel = ctaItem?.label || 'Start Consultation';
  const headerTagline = headerNavigation.brandTagline || 'Helping Immigrants, Promoting Brazil';

  function openAccessibilityPanel() {
    window.dispatchEvent(new Event('itb:a11y-open'));
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

  const menus = useMemo<MegaMenu[]>(() => {
    return navMap.header.mega_menus.map((menu) => {
      const columns = menu.columns.map((column) => ({
        title: column.title,
        links: column.item_ids
          .map((itemId) => navMap.resolveItem(itemId))
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map((item) => ({ label: item.label, href: item.href })),
      }));
      const firstLink = columns.flatMap((column) => column.links)[0];

      return {
        id: menu.id,
        label: menu.label,
        href: firstLink?.href || homeHref,
        activePrefixes: [
          firstLink?.href || homeHref,
          ...columns.flatMap((column) => column.links.map((link) => link.href)),
        ],
        columns,
      };
    });
  }, [homeHref, navMap]);

  const openMenuData = useMemo(() => menus.find((menu) => menu.id === openMenu) || null, [menus, openMenu]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/95 backdrop-blur">
      <div className="border-b border-sand-200/80 bg-white/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-10 flex-wrap items-center justify-end gap-2 text-xs sm:gap-3">
            <button
              type="button"
              onClick={openAccessibilityPanel}
              aria-haspopup="dialog"
              aria-controls="accessibility-panel"
              className="rounded-full border border-sand-300 bg-white px-3 py-1 font-semibold text-ink-700 transition hover:border-civic-300 hover:text-ink-900"
            >
              {accessibilityLabel}
            </button>
            <LanguageSwitcher />
            <Link
              href={portalHref}
              className="rounded-full border border-sand-300 bg-white px-3 py-1 font-semibold text-ink-700 transition hover:border-civic-300 hover:text-ink-900"
            >
              {portalLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-sand-200 bg-sand-50/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 lg:grid-cols-3">
            <HeaderLogo href={homeHref} brand={brand} tagline={headerTagline} />

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
                {homeLabel}
              </Link>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Link
                href={consultationHref}
                onClick={() => trackCtaClick('header_desktop')}
                className="hidden rounded-full bg-civic-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-civic-800 lg:inline-flex"
              >
                {consultationLabel}
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
          <div ref={desktopMenuRef} className="relative py-2.5">
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
                    aria-haspopup="menu"
                    aria-controls="desktop-mega-menu-panel"
                  >
                    <span>{menu.label}</span>
                    <span className={cn('ml-1 inline-block text-xs transition-transform', isOpen ? 'rotate-180' : '')}>▾</span>
                  </button>
                );
              })}
            </nav>

            <div
              id="desktop-mega-menu-panel"
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
              {homeLabel}
            </Link>
            <Link
              href={consultationHref}
              onClick={() => {
                trackCtaClick('header_mobile');
                setMobileOpen(false);
              }}
              className="block rounded-xl bg-civic-700 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              {consultationLabel}
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
