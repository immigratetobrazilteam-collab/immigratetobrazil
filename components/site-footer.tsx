import Link from 'next/link';

import { brazilianStates, type BrazilianState } from '@/content/curated/states';
import { copy } from '@/lib/i18n';
import { countRoutesByPrefix } from '@/lib/route-index';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

interface SiteFooterProps {
  locale: Locale;
}

type FooterLink = {
  href: string;
  label: string;
};

type RegionalLinkGroup = {
  region: string;
  links: FooterLink[];
};

const REGION_ORDER: BrazilianState['region'][] = ['north', 'northeast', 'central-west', 'southeast', 'south'];

function footerCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      aboutTitle: 'Fundacion y contexto',
      servicesTitle: 'Servicios y ejecucion',
      resourcesTitle: 'Recursos e insights',
      supportTitle: 'Contacto y legal',
      stateAbout: 'Sobre estados por region',
      stateServices: 'Servicios por estado',
      stateContact: 'Contacto por estado',
      stateBlog: 'Blog por estado',
      stateFaq: 'FAQ por estado',
      allPages: 'Abrir biblioteca completa',
      regionNorth: 'Norte',
      regionNortheast: 'Nordeste',
      regionCentralWest: 'Centro-Oeste',
      regionSoutheast: 'Sudeste',
      regionSouth: 'Sur',
    };
  }

  if (locale === 'pt') {
    return {
      aboutTitle: 'Fundacao e contexto',
      servicesTitle: 'Servicos e execucao',
      resourcesTitle: 'Recursos e insights',
      supportTitle: 'Contato e legal',
      stateAbout: 'Sobre estados por regiao',
      stateServices: 'Servicos por estado',
      stateContact: 'Contato por estado',
      stateBlog: 'Blog por estado',
      stateFaq: 'FAQ por estado',
      allPages: 'Abrir biblioteca completa',
      regionNorth: 'Norte',
      regionNortheast: 'Nordeste',
      regionCentralWest: 'Centro-Oeste',
      regionSoutheast: 'Sudeste',
      regionSouth: 'Sul',
    };
  }

  if (locale === 'fr') {
    return {
      aboutTitle: 'Fondations et contexte',
      servicesTitle: 'Services et exécution',
      resourcesTitle: 'Ressources et insights',
      supportTitle: 'Contact et juridique',
      stateAbout: 'À propos des États par région',
      stateServices: 'Services par État',
      stateContact: 'Contact par État',
      stateBlog: 'Blog par État',
      stateFaq: 'FAQ par État',
      allPages: 'Ouvrir la bibliothèque complète',
      regionNorth: 'Nord',
      regionNortheast: 'Nord-Est',
      regionCentralWest: 'Centre-Ouest',
      regionSoutheast: 'Sud-Est',
      regionSouth: 'Sud',
    };
  }

  return {
    aboutTitle: 'Foundation and context',
    servicesTitle: 'Services and execution',
    resourcesTitle: 'Resources and insights',
    supportTitle: 'Contact and legal',
    stateAbout: 'About states by region',
    stateServices: 'Services by state',
    stateContact: 'Contact by state',
    stateBlog: 'Blog by state',
    stateFaq: 'FAQ by state',
    allPages: 'Open full library',
    regionNorth: 'North',
    regionNortheast: 'Northeast',
    regionCentralWest: 'Central-West',
    regionSoutheast: 'Southeast',
    regionSouth: 'South',
  };
}

function regionLabel(labels: ReturnType<typeof footerCopy>, region: BrazilianState['region']) {
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

function buildRegionalStateLinks(
  locale: Locale,
  labels: ReturnType<typeof footerCopy>,
  hrefBuilder: (state: BrazilianState) => string,
): RegionalLinkGroup[] {
  return REGION_ORDER.map((region) => ({
    region: regionLabel(labels, region),
    links: brazilianStates
      .filter((state) => state.region === region)
      .map((state) => ({
        href: hrefBuilder(state),
        label: state[locale],
      })),
  }));
}

function RegionalDirectory({ title, groups }: { title: string; groups: RegionalLinkGroup[] }) {
  return (
    <details className="rounded-xl border border-ink-700/70 bg-ink-800/40 px-3 py-2">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-sand-200">{title}</summary>
      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={`${title}-${group.region}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-300">{group.region}</p>
            <div className="mt-1 grid max-h-28 grid-cols-2 gap-2 overflow-y-auto pr-1 text-xs">
              {group.links.map((link) => (
                <Link key={`${group.region}-${link.href}`} href={link.href} className="text-sand-200 hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

export async function SiteFooter({ locale }: SiteFooterProps) {
  const t = copy[locale];
  const labels = footerCopy(locale);
  const contact = siteConfig.contact;

  const [
    aboutCount,
    serviceCount,
    resourceCount,
    discoverCount,
    homeCount,
    contactCount,
    blogCount,
    faqCount,
    policyCount,
  ] = await Promise.all([
    countRoutesByPrefix(locale, 'about', true),
    countRoutesByPrefix(locale, 'services', true),
    countRoutesByPrefix(locale, 'resources-guides-brazil', true),
    countRoutesByPrefix(locale, 'discover', true),
    countRoutesByPrefix(locale, 'home', true),
    countRoutesByPrefix(locale, 'contact', true),
    countRoutesByPrefix(locale, 'blog', true),
    countRoutesByPrefix(locale, 'faq', true),
    countRoutesByPrefix(locale, 'policies', true),
  ]);

  const aboutStateGroups = buildRegionalStateLinks(locale, labels, (state) => `/${locale}/about/about-states/about-${state.slug}`);
  const serviceStateGroups = buildRegionalStateLinks(locale, labels, (state) => `/${locale}/services/immigrate-to-${state.slug}`);
  const contactStateGroups = buildRegionalStateLinks(locale, labels, (state) => `/${locale}/contact/contact-${state.slug}`);
  const blogStateGroups = buildRegionalStateLinks(locale, labels, (state) => `/${locale}/blog/blog-${state.slug}`);
  const faqStateGroups = buildRegionalStateLinks(locale, labels, (state) => `/${locale}/faq/faq-${state.slug}`);

  return (
    <footer className="border-t border-sand-200 bg-ink-900 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-5">
          <div className="space-y-4">
            <p className="font-display text-2xl">{t.brand}</p>
            <p className="text-sm text-sand-200/90">{t.footer.tagline}</p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-civic-300/40 bg-civic-800/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-sand-100">
                {aboutCount} about
              </span>
              <span className="rounded-full border border-civic-300/40 bg-civic-800/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-sand-100">
                {serviceCount} services
              </span>
              <span className="rounded-full border border-civic-300/40 bg-civic-800/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-sand-100">
                {discoverCount} discover
              </span>
            </div>

            <Link
              href={`/${locale}/library`}
              className="inline-flex rounded-full bg-civic-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-civic-600"
            >
              {labels.allPages}
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.aboutTitle}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/about`} className="hover:text-white">
                {t.nav.about}
              </Link>
              <Link href={`/${locale}/about/about-brazil`} className="hover:text-white">
                About Brazil
              </Link>
              <Link href={`/${locale}/about/about-states`} className="hover:text-white">
                About States
              </Link>
              <Link href={`/${locale}/about/about-us`} className="hover:text-white">
                About Us
              </Link>
              <Link href={`/${locale}/accessibility`} className="hover:text-white">
                Accessibility
              </Link>
              <Link href={`/${locale}/resources-guides-brazil`} className="hover:text-white">
                {t.nav.resources} ({resourceCount})
              </Link>
              <Link href={`/${locale}/process`} className="hover:text-white">
                {t.nav.process}
              </Link>
              <Link href={`/${locale}/home`} className="hover:text-white">
                Home archive ({homeCount})
              </Link>
            </div>

            <RegionalDirectory title={labels.stateAbout} groups={aboutStateGroups} />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.servicesTitle}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/services`} className="hover:text-white">
                {t.nav.services}
              </Link>
              <Link href={`/${locale}/visa-consultation`} className="hover:text-white">
                {t.cta.button}
              </Link>
              <Link href={`/${locale}/services/visa`} className="hover:text-white">
                Visa Services
              </Link>
              <Link href={`/${locale}/services/visas`} className="hover:text-white">
                Visa Categories
              </Link>
              <Link href={`/${locale}/services/residencies`} className="hover:text-white">
                Residency Services
              </Link>
              <Link href={`/${locale}/services/naturalisation`} className="hover:text-white">
                Naturalisation Services
              </Link>
              <Link href={`/${locale}/services/legal`} className="hover:text-white">
                Legal Services
              </Link>
              <Link href={`/${locale}/services/immigration-law-services/visas/work`} className="hover:text-white">
                Immigration Law: Work Visa
              </Link>
              <Link href={`/${locale}/services/immigration-law-services/residencies/permanent`} className="hover:text-white">
                Immigration Law: Permanent Residency
              </Link>
              <Link href={`/${locale}/services/travel-services/guided-trips/north`} className="hover:text-white">
                Travel Services: Guided Trips
              </Link>
            </div>

            <RegionalDirectory title={labels.stateServices} groups={serviceStateGroups} />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.resourcesTitle}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/library`} className="hover:text-white">
                {t.nav.library}
              </Link>
              <Link href={`/${locale}/discover/brazilian-states`} className="hover:text-white">
                Discover States
              </Link>
              <Link href={`/${locale}/discover/brazilian-regions`} className="hover:text-white">
                Discover Regions ({discoverCount})
              </Link>
              <Link href={`/${locale}/blog`} className="hover:text-white">
                {t.nav.blog} ({blogCount})
              </Link>
              <Link href={`/${locale}/faq`} className="hover:text-white">
                {t.nav.faq} ({faqCount})
              </Link>
              <Link href={`/${locale}/policies`} className="hover:text-white">
                Policies ({policyCount})
              </Link>
              <Link href="/sitemap.xml" className="hover:text-white">
                XML Sitemap
              </Link>
            </div>

            <RegionalDirectory title={labels.stateBlog} groups={blogStateGroups} />
            <RegionalDirectory title={labels.stateFaq} groups={faqStateGroups} />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.supportTitle}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/contact`} className="hover:text-white">
                {t.nav.contact} ({contactCount})
              </Link>
              <Link href={`/${locale}/policies/privacy`} className="hover:text-white">
                Privacy
              </Link>
              <Link href={`/${locale}/policies/terms`} className="hover:text-white">
                Terms
              </Link>
              <Link href={`/${locale}/policies/cookies`} className="hover:text-white">
                Cookies
              </Link>
            </div>

            <RegionalDirectory title={labels.stateContact} groups={contactStateGroups} />

            <div className="rounded-xl border border-ink-700/70 bg-ink-800/40 p-3 text-xs text-sand-200">
              <p className="font-semibold uppercase tracking-[0.1em]">Contact</p>
              <a href={`mailto:${contact.consultationEmail}`} className="mt-2 block hover:text-white">
                {contact.consultationEmail}
              </a>
              <a href={`mailto:${contact.clientEmail}`} className="mt-1 block hover:text-white">
                {contact.clientEmail}
              </a>
              <a href={contact.whatsappLink} className="mt-1 block hover:text-white">
                {contact.whatsappNumber}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-700/60 px-4 py-4 text-center text-xs text-sand-300">
        © {new Date().getFullYear()} Immigrate to Brazil. All rights reserved. {t.footer.legal}
      </div>
    </footer>
  );
}
