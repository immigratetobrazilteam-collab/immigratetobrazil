import Image from 'next/image';
import Link from 'next/link';

import type { RouteLink } from '@/lib/route-index';
import { localizedPath } from '@/lib/routes';
import type { LegacyDocument, Locale } from '@/lib/types';

type AboutLegacyRedesignProps = {
  locale: Locale;
  document: LegacyDocument;
  eyebrow: string;
  hubHref: string;
  hubLabel: string;
  relatedLinks: RouteLink[];
};

function pageCopy(locale: Locale) {
  if (locale === 'es') {
    return {
      keyPoints: 'Puntos clave',
      sourceTitle: 'Fuente original',
      relatedTitle: 'Paginas relacionadas',
      primaryCta: 'Agendar consulta',
      secondaryCta: 'Volver al centro',
      strategicWrapTitle: 'Ejecucion migratoria con estructura',
      strategicWrapBody:
        'Alineamos estrategia, documentacion y seguimiento para reducir riesgos y mantener el proceso bajo control.',
    };
  }

  if (locale === 'pt') {
    return {
      keyPoints: 'Pontos-chave',
      sourceTitle: 'Fonte original',
      relatedTitle: 'Paginas relacionadas',
      primaryCta: 'Agendar consulta',
      secondaryCta: 'Voltar ao hub',
      strategicWrapTitle: 'Execucao migratoria com estrutura',
      strategicWrapBody:
        'Alinhamos estrategia, documentacao e acompanhamento para reduzir riscos e manter o processo sob controle.',
    };
  }

  if (locale === 'fr') {
    return {
      keyPoints: 'Points cles',
      sourceTitle: 'Source originale',
      relatedTitle: 'Pages associees',
      primaryCta: 'Reserver une consultation',
      secondaryCta: 'Retour au hub',
      strategicWrapTitle: 'Execution migratoire structuree',
      strategicWrapBody:
        "Nous alignons strategie, documents et suivi pour reduire les risques et garder l'ensemble du processus sous controle.",
    };
  }

  return {
    keyPoints: 'Key points',
    sourceTitle: 'Original source',
    relatedTitle: 'Related pages',
    primaryCta: 'Book consultation',
    secondaryCta: 'Back to hub',
    strategicWrapTitle: 'Migration execution with structure',
    strategicWrapBody:
      'We align strategy, documentation, and follow-through so your immigration process stays controlled and low-risk.',
  };
}

export function AboutLegacyRedesign({ locale, document, eyebrow, hubHref, hubLabel, relatedLinks }: AboutLegacyRedesignProps) {
  const t = pageCopy(locale);

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand-200 bg-gradient-to-br from-[#f7f6ef] via-white to-[#dff3eb]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-8 h-52 w-52 rounded-full bg-civic-200/35 blur-2xl" />
          <div className="absolute -left-20 bottom-6 h-44 w-44 rounded-full bg-civic-300/30 blur-2xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink-900 sm:text-5xl">{document.heading}</h1>
            <p className="mt-5 max-w-2xl text-lg text-ink-700">{document.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={localizedPath(locale, '/contact')}
                className="inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-sand-50"
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

            {document.bullets.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {document.bullets.slice(0, 7).map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-civic-200 bg-civic-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-civic-800"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {document.heroImage ? (
              <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
                <Image
                  src={document.heroImage}
                  alt={document.heroImageAlt || document.heading}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 36vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <article className="rounded-3xl border border-ink-900/10 bg-ink-900 p-6 text-sand-100 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sand-300">{t.sourceTitle}</p>
              <p className="mt-2 break-all text-sm text-sand-50">{document.sourcePath}</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-sand-300">{t.strategicWrapTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-sand-100/90">{t.strategicWrapBody}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <div className="grid gap-5 md:grid-cols-2">
              {document.sections.map((section, index) => (
                <article key={`${section.title}-${index}`} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
                  <h2 className="font-display text-2xl text-ink-900">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {document.bullets.length ? (
              <aside className="mt-6 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-2xl text-ink-900">{t.keyPoints}</h3>
                <ul className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
                  {document.bullets.map((bullet) => (
                    <li key={bullet}>- {bullet}</li>
                  ))}
                </ul>
              </aside>
            ) : null}
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

            <article className="rounded-2xl border border-civic-300 bg-civic-50 p-5">
              <p className="text-sm text-ink-800">{t.strategicWrapBody}</p>
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
