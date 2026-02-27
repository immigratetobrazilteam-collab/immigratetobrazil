import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { brazilianStates } from '@/content/curated/states';
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

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">{title}</p>
      <div className="mt-3 space-y-2 text-sm">
        {links.map((link) => {
          if (isExternalHref(link.href)) {
            return (
              <a key={`${title}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer" className="text-sand-100 hover:text-white">
                {link.label}
              </a>
            );
          }

          return (
            <Link key={`${title}-${link.href}`} href={link.href} className="block text-sand-100 hover:text-white">
              {link.label}
            </Link>
          );
        })}
      </div>
    </article>
  );
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const contact = siteConfig.contact;
  const searchHref = resolveCmsHref(locale, '/search');
  const consultationHref = resolveCmsHref(locale, '/visa-consultation');

  const immigrationLinks: FooterLink[] = [
    { label: 'Visas', href: resolveCmsHref(locale, '/services/visas') },
    { label: 'Residency', href: resolveCmsHref(locale, '/services/residencies') },
    { label: 'Naturalisation', href: resolveCmsHref(locale, '/services/naturalisation') },
    { label: 'Defense', href: resolveCmsHref(locale, '/services/legal') },
    { label: 'Regularization', href: resolveCmsHref(locale, '/services/legal') },
  ];

  const brazilLinks: FooterLink[] = [
    { label: 'States', href: resolveCmsHref(locale, '/discover/brazilian-states') },
    { label: 'Cities', href: resolveCmsHref(locale, '/discover/brazilian-regions') },
    { label: 'Cost', href: resolveCmsHref(locale, '/about/about-brazil/cost-of-living-in-brazil') },
    { label: 'Culture', href: resolveCmsHref(locale, '/about/about-brazil/festivals') },
    { label: 'Investment', href: resolveCmsHref(locale, '/services/immigration-law-services/residencies/investor') },
  ];

  const resourcesLinks: FooterLink[] = [
    { label: 'Guides', href: resolveCmsHref(locale, '/resources-guides-brazil') },
    { label: 'FAQ', href: resolveCmsHref(locale, '/faq') },
    { label: 'Blog', href: resolveCmsHref(locale, '/blog') },
    { label: 'Checklist', href: resolveCmsHref(locale, '/resources-guides-brazil') },
    { label: 'Sitemap', href: '/sitemap.xml' },
  ];

  const firmLinks: FooterLink[] = [
    { label: 'About', href: resolveCmsHref(locale, '/about/about-us') },
    { label: 'Team', href: resolveCmsHref(locale, '/about/about-us/10-experts') },
    { label: 'Awards', href: resolveCmsHref(locale, '/about/about-us/10-awards') },
    { label: 'Results', href: resolveCmsHref(locale, '/about/about-us/10-success-stories') },
  ];

  const legalLinks: FooterLink[] = [
    { label: 'Privacy', href: resolveCmsHref(locale, '/policies/privacy') },
    { label: 'Terms', href: resolveCmsHref(locale, '/policies/terms') },
    { label: 'Refund', href: resolveCmsHref(locale, '/policies/refund') },
    { label: 'GDPR', href: resolveCmsHref(locale, '/policies/gdpr') },
    { label: 'Accessibility', href: resolveCmsHref(locale, '/accessibility') },
    { label: 'Disclaimer', href: resolveCmsHref(locale, '/policies/disclaimers') },
  ];

  const socialLinks: FooterLink[] = [
    { label: 'X', href: 'https://x.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com' },
    { label: 'YouTube', href: 'https://www.youtube.com' },
  ];

  const stateLinks: FooterLink[] = [...brazilianStates]
    .sort((a, b) => a[locale].localeCompare(b[locale]))
    .map((state) => ({
      label: state[locale],
      href: resolveCmsHref(locale, `/discover/brazilian-states/${state.code.toLowerCase()}`),
    }));

  return (
    <footer className="border-t border-sand-200 bg-ink-900 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <BrandLogo variant="mark" className="h-12 w-12" />
              <p className="font-display text-2xl">Immigrate to Brazil</p>
            </div>
            <p className="max-w-3xl text-sm text-sand-200">
              Immigration legal planning and execution for visas, residency, naturalisation, and cross-border relocation to Brazil.
            </p>
            <div className="grid gap-2 text-sm text-sand-200 sm:grid-cols-2">
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

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">Social</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ink-700 bg-ink-800 px-3 py-1.5 text-xs font-semibold text-sand-100 hover:border-sand-400 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          <FooterColumn title="Immigration" links={immigrationLinks} />
          <FooterColumn title="Brazil" links={brazilLinks} />
          <FooterColumn title="Resources" links={resourcesLinks} />
          <FooterColumn title="Firm" links={firmLinks} />
          <FooterColumn title="Legal" links={legalLinks} />

          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">Site Search</p>
            <form action={searchHref} method="get" className="mt-3">
              <input
                type="search"
                name="q"
                placeholder="Search site content"
                className="w-full rounded-xl border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-sand-50 placeholder:text-sand-300/70 focus:border-civic-500 focus:outline-none"
              />
            </form>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-800/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">Full Site Search</p>
          <form action={searchHref} method="get" className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              placeholder="Search visas, residency, states, process, blog, and legal pages"
              className="h-11 w-full rounded-xl border border-ink-700 bg-ink-900 px-4 text-sm text-sand-50 placeholder:text-sand-300/70 focus:border-civic-500 focus:outline-none"
            />
            <button type="submit" className="h-11 rounded-xl bg-civic-700 px-5 text-sm font-semibold text-white hover:bg-civic-600">
              Search
            </button>
          </form>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href={consultationHref}
            className="rounded-full bg-civic-700 px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-civic-600"
          >
            Start Your Consultation Now
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-800/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">Brazil States Directory</p>
          <div className="mt-3 grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 text-xs sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {stateLinks.map((link) => (
              <Link key={link.label} href={link.href} className="rounded-md border border-ink-700 bg-ink-900/70 px-2 py-1.5 text-sand-100 hover:border-sand-500 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
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
