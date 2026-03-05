import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { getNavigationMap } from '@/lib/navigation-map-content';
import { getSiteCmsCopy } from '@/lib/site-cms-content';
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
    <article className="text-center">
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
  const siteCopy = getSiteCmsCopy(locale);
  const registry = new Map(navMap.registry.map((item) => [item.id, item]));
  const contact = siteConfig.contact;
  const searchHref = resolveCmsHref(locale, navMap.footer.search.action_href);

  const searchPlaceholder =
    navMap.footer.search.placeholder === 'Whole site'
      ? locale === 'pt'
        ? 'Pesquisar em nosso site'
        : 'Search our website'
      : navMap.footer.search.placeholder;

  const searchButtonLabel = locale === 'pt' ? 'Pesquisar' : navMap.footer.search.button_label;

  const contactLabels =
    locale === 'pt'
      ? {
          email: 'E-mail',
          phone: 'Telefone',
          hours: 'Horario',
          worldwide: 'Cobertura',
          hoursValue: 'Seg-Sex, 9:00-18:00 BRT',
          worldwideValue: 'Atendimento em todos os 27 estados',
          rightsReserved: `© 2019-2026 ${siteCopy.brand}. Todos os direitos reservados.`,
        }
      : {
          email: 'Email',
          phone: 'Phone',
          hours: 'Hours',
          worldwide: 'Worldwide',
          hoursValue: 'Mon-Fri, 9:00-18:00 BRT',
          worldwideValue: 'Support across all 27 states',
          rightsReserved: `© 2019-2026 ${siteCopy.brand}. All rights reserved.`,
        };

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
        <div className="space-y-4 border-b border-ink-700/70 pb-8 text-center">
          <div className="inline-flex w-full items-center justify-center gap-3">
            <BrandLogo variant="mark" className="h-12 w-12" />
            <p className="font-display text-2xl">{siteCopy.brand}</p>
          </div>
          <p className="mx-auto max-w-3xl text-sm text-sand-200">{siteCopy.footer.tagline}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-sand-200">
            <p>
              <span className="font-semibold text-sand-100">{contactLabels.email}:</span> {contact.clientEmail}
            </p>
            <p>
              <span className="font-semibold text-sand-100">{contactLabels.phone}:</span> {contact.whatsappNumber}
            </p>
            <p>
              <span className="font-semibold text-sand-100">{contactLabels.hours}:</span> {contactLabels.hoursValue}
            </p>
            <p>
              <span className="font-semibold text-sand-100">{contactLabels.worldwide}:</span> {contactLabels.worldwideValue}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {footerColumns.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}

          <article className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">{locale === 'pt' ? 'Pesquisar' : 'Search'}</p>
            <form action={searchHref} method="get" className="mt-3 space-y-2">
              <input
                type="search"
                name="q"
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-xl border border-ink-700 bg-ink-800 px-3 text-sm text-sand-100 placeholder:text-sand-200/70 focus:border-civic-500 focus:outline-none"
              />
              <button type="submit" className="h-10 w-full rounded-xl bg-civic-700 text-sm font-semibold text-white hover:bg-civic-600">
                {searchButtonLabel}
              </button>
            </form>
          </article>
        </div>
      </div>

      <div className="border-t border-ink-700/70 px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center text-xs text-sand-300">
          <BrandLogo variant="mark" className="h-9 w-9" />
          <p>{contactLabels.rightsReserved}</p>
          <p>{siteCopy.footer.legal}</p>
        </div>
      </div>
    </footer>
  );
}
