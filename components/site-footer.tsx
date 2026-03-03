import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { getNavigationMap } from '@/lib/navigation-map-content';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

interface SiteFooterProps {
  locale: Locale;
}

type FooterLink = {
  label: string;
  href: string;
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

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">{title}</p>
      <div className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <Link key={`${title}-${link.href}`} href={link.href} className="block text-sand-100 hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </article>
  );
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const navMap = getNavigationMap(locale);
  const registry = new Map(navMap.registry.map((item) => [item.id, item]));
  const contact = siteConfig.contact;
  const searchHref = resolveCmsHref(locale, navMap.footer.search.action_href);

  const footerColumns = navMap.footer.columns.map((column) => ({
    title: column.title,
    links: column.item_ids
      .map((id) => registry.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({ label: item.label, href: resolveCmsHref(locale, item.href) })),
  }));

  return (
    <footer className="border-t border-sand-200 bg-ink-900 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 border-b border-ink-700/70 pb-8">
          <div className="inline-flex items-center gap-3">
            <BrandLogo variant="mark" className="h-12 w-12" />
            <p className="font-display text-2xl">Immigrate to Brazil</p>
          </div>
          <p className="max-w-3xl text-sm text-sand-200">
            Immigration legal planning and execution for visas, residency, naturalisation, and cross-border relocation to Brazil.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-sand-200">
            <p>
              <span className="font-semibold text-sand-100">Email:</span> {contact.clientEmail}
            </p>
            <p>
              <span className="font-semibold text-sand-100">Phone:</span> {contact.whatsappNumber}
            </p>
            <p>
              <span className="font-semibold text-sand-100">Hours:</span> Mon-Fri, 9:00-18:00 BRT
            </p>
            <p>
              <span className="font-semibold text-sand-100">Worldwide:</span> Support across all 27 states
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {footerColumns.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}

          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">Search</p>
            <form action={searchHref} method="get" className="mt-3 space-y-2">
              <input
                type="search"
                name="q"
                placeholder={navMap.footer.search.placeholder}
                className="h-10 w-full rounded-xl border border-ink-700 bg-ink-800 px-3 text-sm text-sand-50 placeholder:text-sand-300/70 focus:border-civic-500 focus:outline-none"
              />
              <button type="submit" className="h-10 w-full rounded-xl bg-civic-700 text-sm font-semibold text-white hover:bg-civic-600">
                {navMap.footer.search.button_label}
              </button>
            </form>
          </article>
        </div>
      </div>

      <div className="border-t border-ink-700/70 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-xs text-sand-300">
          <p>
            © 2019-2026 Immigrate to Brazil. All rights reserved. Information provided is general guidance and not legal representation until engagement is
            confirmed.
          </p>
          <BrandLogo variant="mark" className="h-7 w-7" />
        </div>
      </div>
    </footer>
  );
}
