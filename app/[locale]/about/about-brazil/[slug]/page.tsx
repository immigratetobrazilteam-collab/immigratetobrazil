import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AboutLegacyRedesign } from '@/components/about-legacy-redesign';
import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks, getRouteLinksByPrefix } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export const revalidate = 3600;

type CategorySlug = 'festivals' | 'food';

function segmentLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isCategorySlug(value: string): value is CategorySlug {
  return value === 'festivals' || value === 'food';
}

function routeCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      aboutBrazilLabel: 'Sobre Brasil',
      hubLabel: 'Centro About Brazil',
      backLabel: 'Volver a About Brazil',
      browseLabel: 'Explora por estado',
      category: {
        festivals: {
          title: 'Festivales de Brasil por estado',
          subtitle: 'Version modernizada de todas las guias regionales de festivales.',
        },
        food: {
          title: 'Gastronomia de Brasil por estado',
          subtitle: 'Version modernizada de todas las guias regionales de comida y platos locales.',
        },
      },
    };
  }

  if (locale === 'pt') {
    return {
      aboutBrazilLabel: 'Sobre o Brasil',
      hubLabel: 'Hub About Brazil',
      backLabel: 'Voltar para About Brazil',
      browseLabel: 'Explore por estado',
      category: {
        festivals: {
          title: 'Festivais do Brasil por estado',
          subtitle: 'Versao modernizada de todos os guias regionais de festivais.',
        },
        food: {
          title: 'Gastronomia do Brasil por estado',
          subtitle: 'Versao modernizada de todos os guias regionais de pratos e culinaria local.',
        },
      },
    };
  }

  if (locale === 'fr') {
    return {
      aboutBrazilLabel: 'A propos du Bresil',
      hubLabel: 'Hub About Brazil',
      backLabel: 'Retour a About Brazil',
      browseLabel: 'Explorer par Etat',
      category: {
        festivals: {
          title: 'Festivals du Bresil par Etat',
          subtitle: 'Version modernisee de tous les guides regionaux des festivals.',
        },
        food: {
          title: 'Cuisine du Bresil par Etat',
          subtitle: 'Version modernisee de tous les guides regionaux de gastronomie locale.',
        },
      },
    };
  }

  return {
    aboutBrazilLabel: 'About Brazil',
    hubLabel: 'About Brazil hub',
    backLabel: 'Back to About Brazil',
    browseLabel: 'Browse by state',
    category: {
      festivals: {
        title: 'Brazil festivals by state',
        subtitle: 'Modernized versions of every regional festival guide from the legacy architecture.',
      },
      food: {
        title: 'Brazil food by state',
        subtitle: 'Modernized versions of every regional food and cuisine guide from the legacy architecture.',
      },
    },
  };
}

async function metadataForContent(locale: Locale, slug: string) {
  if (isCategorySlug(slug)) {
    const t = routeCopy(locale).category[slug];
    return createMetadata({
      locale,
      pathname: `/${locale}/about/about-brazil/${slug}`,
      title: `${t.title} | ${copy[locale].brand}`,
      description: t.subtitle,
    });
  }

  const document = await getLegacyDocument(locale, ['about', 'about-brazil', slug]);
  const title = document?.title || segmentLabel(slug);
  const description = document?.description || 'Brazil relocation guidance and regional planning context.';

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-brazil/${slug}`,
    title: `${title} | ${copy[locale].brand}`,
    description,
  });
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  return metadataForContent(locale, slug);
}

async function CategoryHub({ locale, slug }: { locale: Locale; slug: CategorySlug }) {
  const t = routeCopy(locale);
  const category = t.category[slug];
  const links = await getRouteLinksByPrefix(locale, `about/about-brazil/${slug}`, { includePrefixEntry: false, limit: 120 });

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.aboutBrazilLabel}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{category.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{category.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {links.length} pages
            </span>
            <Link
              href={`/${locale}/about/about-brazil`}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              {t.backLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.browseLabel}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {links.map((link) => (
              <Link
                key={link.slug}
                href={link.href}
                className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}

export default async function AboutBrazilSubPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);

  if (isCategorySlug(slug)) {
    return <CategoryHub locale={locale} slug={slug} />;
  }

  const path = `about/about-brazil/${slug}`;
  const document = await getLegacyDocument(locale, ['about', 'about-brazil', slug]);

  if (!document) {
    notFound();
  }

  const localized = routeCopy(locale);
  const relatedLinks = (await getRelatedRouteLinks(locale, path, 24)).filter((link) => link.slug.startsWith('about/about-brazil/'));

  return (
    <>
      <AboutLegacyRedesign
        locale={locale}
        document={document}
        eyebrow={`${localized.aboutBrazilLabel} / ${segmentLabel(slug)}`}
        hubHref={`/${locale}/about/about-brazil`}
        hubLabel={localized.hubLabel}
        relatedLinks={relatedLinks}
      />
      <CtaCard locale={locale} />
    </>
  );
}
