import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { brazilianStates, type BrazilianState } from '@/content/curated/states';
import { copy } from '@/lib/i18n';
import { buildFaqStateSlug } from '@/lib/phase2-routes';
import { getRouteLinksByPrefix, type RouteLink } from '@/lib/route-index';
import { siteConfig } from '@/lib/site-config';
import { stateGuidePathByState } from '@/lib/state-guides-content';
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

function regionLabel(labels: Record<'north' | 'northeast' | 'centralWest' | 'southeast' | 'south', string>, region: BrazilianState['region']) {
  switch (region) {
    case 'north':
      return labels.north;
    case 'northeast':
      return labels.northeast;
    case 'central-west':
      return labels.centralWest;
    case 'southeast':
      return labels.southeast;
    case 'south':
      return labels.south;
    default:
      return region;
  }
}

function buildRegionalStateLinks(
  locale: Locale,
  labels: Record<'north' | 'northeast' | 'centralWest' | 'southeast' | 'south', string>,
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

function mapRouteLinks(routeLinks: RouteLink[]): FooterLink[] {
  return routeLinks.map((link) => ({
    href: link.href,
    label: link.title.replace(/\s*\(\d+\)\s*$/u, '').trim(),
  }));
}

function dedupeLinks(links: FooterLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function splitAboutBrazilLinks(routeLinks: RouteLink[]) {
  const core: FooterLink[] = [];
  const festivals: FooterLink[] = [];
  const food: FooterLink[] = [];

  for (const link of routeLinks) {
    if (link.slug.startsWith('about/about-brazil/festivals/')) {
      festivals.push({ href: link.href, label: link.title });
      continue;
    }

    if (link.slug.startsWith('about/about-brazil/food/')) {
      food.push({ href: link.href, label: link.title });
      continue;
    }

    core.push({ href: link.href, label: link.title });
  }

  return { core, festivals, food };
}

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1 text-sm">
      {links.map((link) => (
        <Link key={`${link.href}-${link.label}`} href={link.href} className="block rounded-lg border border-ink-700/70 bg-ink-800/50 px-3 py-2 text-sand-100 hover:bg-ink-700/70">
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function FooterLinkSection({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <details className="rounded-xl border border-ink-700/70 bg-ink-800/40 px-3 py-2" open>
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-sand-200">{title}</summary>
      <div className="mt-2 max-h-52 space-y-1.5 overflow-y-auto pr-1 text-sm">
        {links.map((link) => (
          <Link key={`${title}-${link.href}`} href={link.href} className="block text-sand-200 hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export async function SiteFooter({ locale }: SiteFooterProps) {
  const t = copy[locale];
  const labels = t.footerNavigation;
  const headerLabels = t.headerNavigation;
  const contact = siteConfig.contact;

  const [aboutUsRouteLinks, aboutBrazilRouteLinks] = await Promise.all([
    getRouteLinksByPrefix(locale, 'about/about-us', { includePrefixEntry: false, limit: 120 }),
    getRouteLinksByPrefix(locale, 'about/about-brazil', { includePrefixEntry: false, limit: 220 }),
  ]);

  const aboutStateGroups = buildRegionalStateLinks(locale, headerLabels.regionLabels, (state) => resolveCmsHref(locale, `/about/about-states/about-${state.slug}`));
  const serviceStateGroups = buildRegionalStateLinks(locale, headerLabels.regionLabels, (state) => resolveCmsHref(locale, `/services/immigrate-to-${state.slug}`));
  const contactStateGroups = buildRegionalStateLinks(locale, headerLabels.regionLabels, (state) => resolveCmsHref(locale, `/contact/contact-${state.slug}`));
  const blogStateGroups = buildRegionalStateLinks(locale, headerLabels.regionLabels, (state) => resolveCmsHref(locale, stateGuidePathByState(state.slug)));
  const faqStateGroups = buildRegionalStateLinks(locale, headerLabels.regionLabels, (state) =>
    resolveCmsHref(locale, `/faq/${buildFaqStateSlug(state.slug)}`),
  );

  const aboutUsLinks = dedupeLinks([
    { href: resolveCmsHref(locale, '/about/about-us'), label: labels.aboutUsHub },
    ...mapRouteLinks(aboutUsRouteLinks),
  ]);

  const splitBrazilLinks = splitAboutBrazilLinks(aboutBrazilRouteLinks);
  const aboutBrazilCoreLinks = dedupeLinks([
    { href: resolveCmsHref(locale, '/about/about-brazil'), label: labels.aboutBrazilHub },
    ...splitBrazilLinks.core,
  ]);

  const aboutBrazilFestivalLinks = dedupeLinks([
    { href: resolveCmsHref(locale, '/about/about-brazil/festivals'), label: labels.festivalsHub },
    ...splitBrazilLinks.festivals,
  ]);

  const aboutBrazilFoodLinks = dedupeLinks([
    { href: resolveCmsHref(locale, '/about/about-brazil/food'), label: labels.foodHub },
    ...splitBrazilLinks.food,
  ]);

  const dropdownMenuGroups: { title: string; links: FooterLink[] }[] = [
    {
      title: labels.menuAboutBrazil,
      links: [
        { href: resolveCmsHref(locale, '/about/about-brazil'), label: headerLabels.links.aboutBrazilHub },
        { href: resolveCmsHref(locale, '/about/about-brazil/apply-brazil'), label: headerLabels.links.applyBrazil },
        { href: resolveCmsHref(locale, '/about/about-brazil/cost-of-living-in-brazil'), label: headerLabels.links.costOfLiving },
        { href: resolveCmsHref(locale, '/about/about-brazil/festivals'), label: labels.festivalsHub },
        { href: resolveCmsHref(locale, '/about/about-brazil/food'), label: labels.foodHub },
      ],
    },
    {
      title: labels.menuAboutStates,
      links: [
        { href: resolveCmsHref(locale, '/about/about-states'), label: headerLabels.links.aboutStatesHub },
        { href: resolveCmsHref(locale, '/about/about-us'), label: headerLabels.links.aboutUs },
        { href: resolveCmsHref(locale, '/about/values'), label: headerLabels.links.values },
        { href: resolveCmsHref(locale, '/about/mission'), label: headerLabels.links.mission },
        { href: resolveCmsHref(locale, '/about/story'), label: headerLabels.links.story },
      ],
    },
    {
      title: labels.menuServices,
      links: [
        { href: resolveCmsHref(locale, '/services'), label: t.nav.services },
        { href: resolveCmsHref(locale, '/visa-consultation'), label: t.cta.button },
        { href: resolveCmsHref(locale, '/services/visa'), label: headerLabels.links.visaServices },
        { href: resolveCmsHref(locale, '/services/visas'), label: headerLabels.links.visaCategories },
        { href: resolveCmsHref(locale, '/services/residencies'), label: headerLabels.links.residencyServices },
        { href: resolveCmsHref(locale, '/services/naturalisation'), label: headerLabels.links.naturalisationServices },
        { href: resolveCmsHref(locale, '/services/legal'), label: headerLabels.links.legalServices },
      ],
    },
    {
      title: labels.menuResources,
      links: [
        { href: resolveCmsHref(locale, '/resources-guides-brazil'), label: t.nav.resources },
        { href: resolveCmsHref(locale, '/library'), label: headerLabels.allPagesButton },
        { href: resolveCmsHref(locale, '/home'), label: headerLabels.links.homeArchive },
        { href: resolveCmsHref(locale, '/policies'), label: headerLabels.links.policies },
        { href: '/sitemap.xml', label: headerLabels.links.xmlSitemap },
      ],
    },
    {
      title: labels.menuDiscover,
      links: [
        { href: resolveCmsHref(locale, '/discover/brazilian-regions'), label: headerLabels.links.discoverRegionsHub },
        { href: resolveCmsHref(locale, '/discover/brazilian-states'), label: headerLabels.links.discoverStatesHub },
      ],
    },
    {
      title: labels.menuBlog,
      links: [{ href: resolveCmsHref(locale, '/state-guides'), label: headerLabels.links.blogByStateHub }],
    },
    {
      title: labels.menuFaq,
      links: [{ href: resolveCmsHref(locale, '/faq'), label: headerLabels.links.faqByStateHub }],
    },
    {
      title: labels.menuContact,
      links: [
        { href: resolveCmsHref(locale, '/contact'), label: headerLabels.links.contactByStateHub },
        { href: `mailto:${contact.clientEmail}`, label: contact.clientEmail },
        { href: contact.whatsappLink, label: contact.whatsappNumber },
      ],
    },
  ];

  return (
    <footer className="border-t border-sand-200 bg-ink-900 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-5">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <BrandLogo variant="mark" className="h-12 w-12" />
              <p className="font-display text-2xl">{t.brand}</p>
            </div>
            <p className="text-sm text-sand-200/90">{t.footer.tagline}</p>
            <a href={`mailto:${contact.clientEmail}`} className="block text-sm text-sand-100 hover:text-white">
              {contact.clientEmail}
            </a>

            <Link
              href={resolveCmsHref(locale, '/library')}
              className="inline-flex rounded-full bg-civic-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-civic-600"
            >
              {labels.allPages}
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.dropdownTitle}</p>
            <div className="space-y-2">
              {dropdownMenuGroups.map((group) => (
                <article key={group.title} className="rounded-xl border border-ink-700/70 bg-ink-800/40 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sand-200">{group.title}</p>
                  <div className="mt-2 space-y-1.5 text-sm text-sand-200">
                    {group.links.map((link) => (
                      <Link key={`${group.title}-${link.href}`} href={link.href} className="block hover:text-white">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.aboutUsPagesTitle}</p>
            <FooterLinkList links={aboutUsLinks} />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.aboutBrazilPagesTitle}</p>
            <div className="space-y-2">
              <FooterLinkSection title={labels.aboutBrazilCoreTitle} links={aboutBrazilCoreLinks} />
              <FooterLinkSection title={labels.aboutBrazilFestivalsTitle} links={aboutBrazilFestivalLinks} />
              <FooterLinkSection title={labels.aboutBrazilFoodTitle} links={aboutBrazilFoodLinks} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{labels.supportTitle}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={resolveCmsHref(locale, '/contact')} className="hover:text-white">
                {headerLabels.links.contactByStateHub}
              </Link>
              <Link href={resolveCmsHref(locale, '/policies/cookies')} className="hover:text-white">
                {headerLabels.links.cookies}
              </Link>
              <Link href={resolveCmsHref(locale, '/policies/disclaimers')} className="hover:text-white">
                {headerLabels.links.disclaimers}
              </Link>
              <Link href={resolveCmsHref(locale, '/policies/gdpr')} className="hover:text-white">
                {headerLabels.links.gdpr}
              </Link>
              <Link href={resolveCmsHref(locale, '/policies/privacy')} className="hover:text-white">
                {headerLabels.links.privacy}
              </Link>
              <Link href={resolveCmsHref(locale, '/policies/refund')} className="hover:text-white">
                {headerLabels.links.refund}
              </Link>
              <Link href={resolveCmsHref(locale, '/policies/terms')} className="hover:text-white">
                {headerLabels.links.terms}
              </Link>
            </div>

            <RegionalDirectory title={labels.stateAbout} groups={aboutStateGroups} />
            <RegionalDirectory title={labels.stateServices} groups={serviceStateGroups} />
            <RegionalDirectory title={labels.stateBlog} groups={blogStateGroups} />
            <RegionalDirectory title={labels.stateFaq} groups={faqStateGroups} />
            <RegionalDirectory title={labels.stateContact} groups={contactStateGroups} />

            <div className="rounded-xl border border-ink-700/70 bg-ink-800/40 p-3 text-xs text-sand-200">
              <p className="font-semibold uppercase tracking-[0.1em]">{labels.contactBoxTitle}</p>
              <a href={`mailto:${contact.clientEmail}`} className="mt-2 block hover:text-white">
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
        © {new Date().getFullYear()} {t.brand}. {labels.rightsReserved} {t.footer.legal}
      </div>
    </footer>
  );
}
