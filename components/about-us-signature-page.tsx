import Link from 'next/link';

import { getAboutUsSignatureTheme } from '@/lib/about-us-signature';
import type { RouteLink } from '@/lib/route-index';
import { localizedPath } from '@/lib/routes';
import type { LegacyDocument, Locale } from '@/lib/types';

type AboutUsSignaturePageProps = {
  locale: Locale;
  slug: string;
  document: LegacyDocument;
  eyebrow: string;
  hubHref: string;
  hubLabel: string;
  relatedLinks: RouteLink[];
};

function pageCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      pillarsTitle: 'Marco estrategico',
      sectionsTitle: 'Contenido y detalles',
      keyPoints: 'Puntos clave',
      relatedTitle: 'Paginas relacionadas',
      primaryCta: 'Agendar consulta',
      secondaryCta: 'Volver al hub',
      frameworkText: 'Estandar premium con control legal y comunicacion clara.',
    };
  }

  if (locale === 'pt') {
    return {
      pillarsTitle: 'Framework estrategico',
      sectionsTitle: 'Conteudo e detalhes',
      keyPoints: 'Pontos-chave',
      relatedTitle: 'Paginas relacionadas',
      primaryCta: 'Agendar consulta',
      secondaryCta: 'Voltar ao hub',
      frameworkText: 'Padrao premium com controle juridico e comunicacao clara.',
    };
  }

  if (locale === 'fr') {
    return {
      pillarsTitle: 'Cadre strategique',
      sectionsTitle: 'Contenu et details',
      keyPoints: 'Points cles',
      relatedTitle: 'Pages associees',
      primaryCta: 'Reserver une consultation',
      secondaryCta: 'Retour au hub',
      frameworkText: 'Standard premium avec controle juridique et communication claire.',
    };
  }

  return {
    pillarsTitle: 'Strategic framework',
    sectionsTitle: 'Content and details',
    keyPoints: 'Key points',
    relatedTitle: 'Related pages',
    primaryCta: 'Book consultation',
    secondaryCta: 'Back to hub',
    frameworkText: 'Premium standard with legal control and clear communication.',
  };
}

function variantClasses(variant: 'prestige' | 'advisory' | 'clarity' | 'support') {
  switch (variant) {
    case 'prestige':
      return {
        hero: 'bg-gradient-to-br from-sand-100 via-white to-civic-100',
        haloA: 'bg-sand-300/35',
        haloB: 'bg-civic-300/30',
        badge: 'border-sand-300/70 bg-white/85 text-civic-800',
        stat: 'border-sand-200 bg-white/90',
        pillar: 'border-sand-200 bg-white',
      };
    case 'support':
      return {
        hero: 'bg-gradient-to-br from-civic-50 via-sand-50 to-white',
        haloA: 'bg-civic-300/30',
        haloB: 'bg-sand-300/30',
        badge: 'border-civic-300/60 bg-white/85 text-civic-800',
        stat: 'border-civic-200/80 bg-civic-50/65',
        pillar: 'border-civic-200 bg-white',
      };
    case 'clarity':
      return {
        hero: 'bg-gradient-to-br from-white via-sand-50 to-ink-100/40',
        haloA: 'bg-ink-300/20',
        haloB: 'bg-civic-300/25',
        badge: 'border-ink-300/60 bg-white/90 text-ink-800',
        stat: 'border-ink-200 bg-white',
        pillar: 'border-ink-200 bg-white',
      };
    case 'advisory':
    default:
      return {
        hero: 'bg-gradient-to-br from-civic-100 via-white to-sand-100',
        haloA: 'bg-civic-300/30',
        haloB: 'bg-sand-300/35',
        badge: 'border-civic-300/60 bg-white/85 text-civic-900',
        stat: 'border-civic-200 bg-white',
        pillar: 'border-civic-200 bg-white',
      };
  }
}

export function AboutUsSignaturePage({ locale, slug, document, eyebrow, hubHref, hubLabel, relatedLinks }: AboutUsSignaturePageProps) {
  const t = pageCopy(locale);
  const theme = getAboutUsSignatureTheme(slug);
  const styles = variantClasses(theme.variant);

  return (
    <>
      <section className={`relative overflow-hidden border-b border-sand-200 ${styles.hero}`}>
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -left-20 top-12 h-56 w-56 rounded-full blur-3xl ${styles.haloA}`} />
          <div className={`absolute -right-20 bottom-8 h-56 w-56 rounded-full blur-3xl ${styles.haloB}`} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className={`inline-flex rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles.badge}`}>
              {theme.badge}
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink-900 sm:text-5xl">{document.heading}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-700">{theme.heroLead}</p>
            <p className="mt-3 max-w-3xl text-base text-ink-700">{document.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={localizedPath(locale, '/contact')}
                className="inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-sand-50 shadow-card"
              >
                {t.primaryCta}
              </Link>
              <Link
                href={hubHref}
                className="inline-flex rounded-full border border-sand-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-900"
              >
                {hubLabel || t.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {theme.stats.map((stat) => (
              <article key={`${stat.value}-${stat.label}`} className={`rounded-2xl border p-5 shadow-sm ${styles.stat}`}>
                <p className="text-2xl font-semibold text-ink-900">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-6">
            <article className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.pillarsTitle}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {theme.pillars.map((pillar) => (
                  <div key={pillar.title} className={`rounded-xl border p-4 ${styles.pillar}`}>
                    <h2 className="font-display text-2xl text-ink-900">{pillar.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">{pillar.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.sectionsTitle}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {document.sections.map((section, index) => (
                  <div key={`${section.title}-${index}`} className="rounded-xl border border-sand-200 bg-sand-50/65 p-4">
                    <h3 className="font-display text-2xl text-ink-900">{section.title}</h3>
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-700">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <article className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.relatedTitle}</p>
              <div className="mt-4 space-y-2">
                {relatedLinks.slice(0, 14).map((link) => (
                  <Link
                    key={link.slug}
                    href={link.href}
                    className="block rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-ink-800 transition hover:border-civic-300 hover:bg-white"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </article>

            {document.bullets.length ? (
              <article className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.keyPoints}</p>
                <ul className="mt-3 space-y-2 text-sm text-ink-700">
                  {document.bullets.map((bullet) => (
                    <li key={bullet}>- {bullet}</li>
                  ))}
                </ul>
              </article>
            ) : null}

            <article className="rounded-2xl border border-civic-300 bg-civic-50 p-5">
              <p className="text-sm text-ink-800">{t.frameworkText}</p>
              <Link
                href={localizedPath(locale, '/contact')}
                className="mt-4 inline-flex rounded-full bg-ink-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
              >
                {t.primaryCta}
              </Link>
            </article>
          </aside>
        </div>
      </section>
    </>
  );
}
