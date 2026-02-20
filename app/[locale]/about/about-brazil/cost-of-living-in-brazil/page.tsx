import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

type CostCopy = {
  title: string;
  subtitle: string;
  cards: Array<{ title: string; detail: string }>;
};

const content: Record<Locale, CostCopy> = {
  en: {
    title: 'Cost of living planning for Brazilian relocation',
    subtitle:
      'This migrated route provides a concise budgeting model for housing, transport, healthcare, and integration expenses.',
    cards: [
      { title: 'Housing baseline', detail: 'Model city-by-city rent ranges and include lease setup, deposits, and utility activation.' },
      { title: 'Monthly essentials', detail: 'Track food, transit, communications, and private services with conservative buffers.' },
      { title: 'Compliance costs', detail: 'Reserve budget for translations, certifications, application fees, and renewals.' },
      { title: 'Stabilization reserve', detail: 'Maintain at least 3 to 6 months of liquidity during the first integration cycle.' },
    ],
  },
  es: {
    title: 'Planificación del costo de vida para mudarte a Brasil',
    subtitle:
      'Esta ruta migrada entrega un modelo breve de presupuesto para vivienda, transporte, salud e integración.',
    cards: [
      { title: 'Base de vivienda', detail: 'Modela alquiler por ciudad e incluye depósito, contrato y servicios.' },
      { title: 'Gastos mensuales', detail: 'Controla comida, transporte, comunicaciones y servicios privados con margen.' },
      { title: 'Costos de cumplimiento', detail: 'Reserva para traducciones, certificaciones, tasas y renovaciones.' },
      { title: 'Reserva de estabilización', detail: 'Mantén entre 3 y 6 meses de liquidez durante la fase inicial.' },
    ],
  },
  pt: {
    title: 'Planejamento de custo de vida para mudança ao Brasil',
    subtitle:
      'Esta rota migrada oferece um modelo resumido de orçamento para moradia, transporte, saúde e integração.',
    cards: [
      { title: 'Base de moradia', detail: 'Projete aluguel por cidade incluindo caução, contrato e ativação de serviços.' },
      { title: 'Despesas mensais', detail: 'Monitore alimentação, transporte, comunicação e serviços com margem de segurança.' },
      { title: 'Custos de conformidade', detail: 'Reserve valores para traduções, certidões, taxas e renovações.' },
      { title: 'Reserva de estabilização', detail: 'Mantenha de 3 a 6 meses de liquidez no ciclo inicial.' },
    ],
  },
  fr: {
    title: 'Planification du coût de la vie pour une installation au Brésil',
    subtitle:
      'Cette route migrée fournit un modèle de budget concis pour le logement, le transport, la santé et l’intégration.',
    cards: [
      { title: 'Base logement', detail: 'Modéliser les loyers par ville et inclure dépôt, contrat et activation des services.' },
      { title: 'Dépenses mensuelles', detail: 'Suivre alimentation, transport, communications et services privés avec marge prudente.' },
      { title: 'Coûts de conformité', detail: 'Prévoir budget pour traductions, certifications, frais de dossier et renouvellements.' },
      { title: 'Réserve de stabilisation', detail: 'Maintenir 3 à 6 mois de liquidité pendant la première phase d’intégration.' },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = content[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-brazil/cost-of-living-in-brazil`,
    title: `Cost of Living Brazil | ${t.title}`,
    description: t.subtitle,
  });
}

export default async function CostOfLivingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = content[locale];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Cost of living</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          {t.cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{card.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
