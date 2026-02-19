import Link from 'next/link';

import { brazilianStates } from '@/content/curated/states';
import { copy } from '@/lib/i18n';
import { countRoutesByPrefix } from '@/lib/route-index';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

interface SiteFooterProps {
  locale: Locale;
}

function footerCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      categoryMap: 'Mapa por categorías',
      aboutResources: 'Sobre y recursos',
      services: 'Directorio de servicios',
      statePages: 'Páginas por estado',
      legalSupport: 'Legal y soporte',
      stateServices: 'Servicios por estado',
      stateContact: 'Contacto por estado',
      stateBlog: 'Blog por estado',
      stateFaq: 'FAQ por estado',
      allPages: 'Abrir biblioteca completa',
    };
  }

  if (locale === 'pt') {
    return {
      categoryMap: 'Mapa por categorias',
      aboutResources: 'Sobre e recursos',
      services: 'Diretório de serviços',
      statePages: 'Páginas por estado',
      legalSupport: 'Legal e suporte',
      stateServices: 'Serviços por estado',
      stateContact: 'Contato por estado',
      stateBlog: 'Blog por estado',
      stateFaq: 'FAQ por estado',
      allPages: 'Abrir biblioteca completa',
    };
  }

  return {
    categoryMap: 'Category map',
    aboutResources: 'About and resources',
    services: 'Service directory',
    statePages: 'State page directories',
    legalSupport: 'Legal and support',
    stateServices: 'Services by state',
    stateContact: 'Contact by state',
    stateBlog: 'Blog by state',
    stateFaq: 'FAQ by state',
    allPages: 'Open full library',
  };
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

            <Link href={`/${locale}/library`} className="inline-flex rounded-full bg-civic-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-civic-600">
              {labels.allPages}
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.aboutResources}</p>
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
              <Link href={`/${locale}/resources-guides-brazil`} className="hover:text-white">
                {t.nav.resources} ({resourceCount})
              </Link>
              <Link href={`/${locale}/discover/brazilian-states`} className="hover:text-white">
                Discover States
              </Link>
              <Link href={`/${locale}/discover/brazilian-regions`} className="hover:text-white">
                Discover Regions ({discoverCount})
              </Link>
              <Link href={`/${locale}/home`} className="hover:text-white">
                Home archive ({homeCount})
              </Link>
              <Link href={`/${locale}/accessibility`} className="hover:text-white">
                Accessibility
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.services}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/services`} className="hover:text-white">
                {t.nav.services}
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
                Immigration Law Archive
              </Link>
              <Link href={`/${locale}/services/travel-services/guided-trips/north`} className="hover:text-white">
                Travel Services Archive
              </Link>
            </div>

            <details className="rounded-xl border border-ink-700/70 bg-ink-800/40 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-sand-200">
                {labels.stateServices} ({brazilianStates.length})
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {brazilianStates.map((state) => (
                  <Link key={state.slug} href={`/${locale}/services/immigrate-to-${state.slug}`} className="hover:text-white">
                    {state[locale]}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.statePages}</p>
            <div className="text-sm text-sand-200/90">
              {labels.categoryMap}: contact ({contactCount}), blog ({blogCount}), faq ({faqCount})
            </div>

            <details className="rounded-xl border border-ink-700/70 bg-ink-800/40 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-sand-200">
                {labels.stateContact}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {brazilianStates.map((state) => (
                  <Link key={state.slug} href={`/${locale}/contact/contact-${state.slug}`} className="hover:text-white">
                    {state[locale]}
                  </Link>
                ))}
              </div>
            </details>

            <details className="rounded-xl border border-ink-700/70 bg-ink-800/40 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-sand-200">
                {labels.stateBlog}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {brazilianStates.map((state) => (
                  <Link key={state.slug} href={`/${locale}/blog/blog-${state.slug}`} className="hover:text-white">
                    {state[locale]}
                  </Link>
                ))}
              </div>
            </details>

            <details className="rounded-xl border border-ink-700/70 bg-ink-800/40 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-sand-200">
                {labels.stateFaq}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {brazilianStates.map((state) => (
                  <Link key={state.slug} href={`/${locale}/faq/faq-${state.slug}`} className="hover:text-white">
                    {state[locale]}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.legalSupport}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/contact`} className="hover:text-white">
                {t.nav.contact}
              </Link>
              <Link href={`/${locale}/visa-consultation`} className="hover:text-white">
                {t.cta.button}
              </Link>
              <Link href={`/${locale}/policies`} className="hover:text-white">
                Policies ({policyCount})
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
