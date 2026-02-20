import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { LegacyContent } from '@/components/legacy-content';
import { resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

type ConsultationCopy = {
  title: string;
  subtitle: string;
  blocks: Array<{ title: string; detail: string }>;
};

const content: Record<Locale, ConsultationCopy> = {
  en: {
    title: 'Visa consultation framework',
    subtitle:
      'First-wave migration of legacy consultation content into a clear paid-advisory scope with documented outputs.',
    blocks: [
      { title: 'Session deliverables', detail: 'Eligibility map, risk flags, required documents, and priority timeline.' },
      { title: 'Profile categories', detail: 'Work, digital nomad, investment, retirement, family, and transition scenarios.' },
      { title: 'Commercial scope', detail: 'Advisory session, execution package options, and compliance follow-up.' },
    ],
  },
  es: {
    title: 'Marco de consulta de visa',
    subtitle:
      'Primera migración del contenido legado de consulta hacia un alcance premium con entregables claros.',
    blocks: [
      { title: 'Entregables', detail: 'Mapa de elegibilidad, riesgos, documentos requeridos y cronograma prioritario.' },
      { title: 'Perfiles', detail: 'Trabajo, nómada digital, inversión, jubilación, familia y escenarios de transición.' },
      { title: 'Alcance comercial', detail: 'Sesión estratégica, paquetes de ejecución y seguimiento de cumplimiento.' },
    ],
  },
  pt: {
    title: 'Estrutura de consulta de visto',
    subtitle:
      'Primeira migração do conteúdo legado de consulta para um escopo premium com entregáveis objetivos.',
    blocks: [
      { title: 'Entregáveis', detail: 'Mapa de elegibilidade, riscos, documentos necessários e cronograma prioritário.' },
      { title: 'Perfis atendidos', detail: 'Trabalho, nômade digital, investimento, aposentadoria, família e transição.' },
      { title: 'Escopo comercial', detail: 'Sessão estratégica, pacotes de execução e acompanhamento de conformidade.' },
    ],
  },
  fr: {
    title: 'Cadre de consultation visa',
    subtitle:
      'Première migration du contenu historique de consultation vers un périmètre premium avec livrables clairs.',
    blocks: [
      { title: 'Livrables de session', detail: 'Carte d’éligibilité, risques clés, documents requis et calendrier prioritaire.' },
      { title: 'Profils couverts', detail: 'Travail, nomade digital, investissement, retraite, famille et scénarios de transition.' },
      { title: 'Périmètre commercial', detail: 'Session stratégique, options de package d’exécution et suivi conformité.' },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const legacy = await getLegacyDocument(locale, ['visa-consultation']);

  if (legacy) {
    return createMetadata({
      locale,
      pathname: `/${locale}/visa-consultation`,
      title: legacy.title,
      description: legacy.description,
    });
  }

  const t = content[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}/visa-consultation`,
    title: `Visa Consultation | ${t.title}`,
    description: t.subtitle,
  });
}

export default async function VisaConsultationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const legacy = await getLegacyDocument(locale, ['visa-consultation']);

  if (legacy) {
    const relatedLinks = await getRelatedRouteLinks(locale, 'visa-consultation', 16);
    return <LegacyContent locale={locale} document={legacy} slug="visa-consultation" relatedLinks={relatedLinks} />;
  }

  const t = content[locale];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Visa consultation</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {t.blocks.map((block) => (
            <article key={block.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{block.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{block.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
