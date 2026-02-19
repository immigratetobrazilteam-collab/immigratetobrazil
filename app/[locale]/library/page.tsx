import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { RouteGroupCards } from '@/components/legacy-route-cards';
import { copy, resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix, getPrefixGroups, getRouteLinksByPrefix } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';

const librarySections = [
  {
    id: 'about-brazil',
    title: 'About Brazil',
    description: 'Brazil-wide educational content (culture, food, festivals, and relocation basics).',
    prefix: 'about/about-brazil',
    hrefPath: '/about/about-brazil',
  },
  {
    id: 'about-states',
    title: 'About States',
    description: 'State-level context pages migrated from the legacy site.',
    prefix: 'about/about-states',
    hrefPath: '/about/about-states',
  },
  {
    id: 'about-us',
    title: 'About Us',
    description: 'Brand trust, experience, and methodology pages.',
    prefix: 'about/about-us',
    hrefPath: '/about/about-us',
  },
  {
    id: 'home',
    title: 'Home Archive',
    description: 'Legacy home page family including state variants.',
    prefix: 'home',
    hrefPath: '/home',
  },
  {
    id: 'services',
    title: 'Services',
    description: 'Service pages, legal categories, and state-specific subfolders.',
    prefix: 'services',
    hrefPath: '/services',
  },
  {
    id: 'contact',
    title: 'Contact by State',
    description: 'State contact pages and regional consultation points.',
    prefix: 'contact',
    hrefPath: '/contact',
  },
  {
    id: 'blog',
    title: 'Blog by State',
    description: 'State-level blog guidance migrated to modern routing.',
    prefix: 'blog',
    hrefPath: '/blog',
  },
  {
    id: 'faq',
    title: 'FAQ by State',
    description: 'Frequently asked migration questions by state.',
    prefix: 'faq',
    hrefPath: '/faq',
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Resources and guides for migration operations in Brazil.',
    prefix: 'resources-guides-brazil',
    hrefPath: '/resources-guides-brazil',
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description: 'Accessibility and compliance documentation.',
    prefix: 'accessibility',
    hrefPath: '/accessibility',
  },
  {
    id: 'discover',
    title: 'Discover Archive',
    description: 'Large long-tail location library from the legacy site.',
    prefix: 'discover',
    hrefPath: '/discover/brazilian-states',
  },
  {
    id: 'policies',
    title: 'Policies',
    description: 'Legal and compliance policy center pages.',
    prefix: 'policies',
    hrefPath: '/policies',
  },
  {
    id: 'visa-consultation',
    title: 'Visa Consultation',
    description: 'Consultation entry points and intake pages.',
    prefix: 'visa-consultation',
    hrefPath: '/visa-consultation',
  },
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/library`,
    title: `All Pages Library | ${copy[locale].brand}`,
    description: 'Unified inventory of legacy and modernized content sections in the new architecture.',
  });
}

export default async function LibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const [totalRoutes, serviceGroups, discoverGroups, sectionData] = await Promise.all([
    countRoutesByPrefix(locale, '', true),
    getPrefixGroups(locale, 'services', { maxGroups: 60, sampleSize: 3 }),
    getPrefixGroups(locale, 'discover', { maxGroups: 6, sampleSize: 3 }),
    Promise.all(
      librarySections.map(async (section) => {
        const [count, links] = await Promise.all([
          countRoutesByPrefix(locale, section.prefix, true),
          getRouteLinksByPrefix(locale, section.prefix, { includePrefixEntry: true, limit: 6 }),
        ]);

        return {
          ...section,
          count,
          links,
        };
      }),
    ),
  ]);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Content Library</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">All legacy and modern pages in one place</h1>
          <p className="mt-6 max-w-4xl text-lg text-ink-700">
            This library is designed to make your old site material discoverable inside the new architecture. Use it as the master directory for migration, redesign, and internal linking.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {totalRoutes} indexed routes
            </span>
            <Link
              href="/sitemap.xml"
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              Open sitemap
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">Largest archives</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">
            These are the largest folders from the legacy website. They need deliberate internal-link strategy so they can contribute SEO and user discovery.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-sand-200 bg-white p-5">
              <h3 className="font-display text-2xl text-ink-900">Services families</h3>
              <div className="mt-4">
                <RouteGroupCards groups={serviceGroups} />
              </div>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white p-5">
              <h3 className="font-display text-2xl text-ink-900">Discover families</h3>
              <div className="mt-4">
                <RouteGroupCards groups={discoverGroups} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">Section map</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {sectionData.map((section) => (
              <article key={section.id} className="rounded-2xl border border-sand-200 bg-sand-50 p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-2xl text-ink-900">{section.title}</h3>
                  <span className="rounded-full border border-civic-200 bg-civic-50 px-2.5 py-1 text-xs font-semibold text-civic-800">
                    {section.count}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-700">{section.description}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {section.links.slice(0, 4).map((link) => (
                    <Link
                      key={link.slug}
                      href={link.href}
                      className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-ink-800 transition hover:border-civic-300"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/${locale}${section.hrefPath}`}
                  className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700 hover:text-civic-800"
                >
                  Open section hub
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
