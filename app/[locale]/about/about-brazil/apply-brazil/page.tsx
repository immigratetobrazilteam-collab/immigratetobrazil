import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import { localizedPath } from '@/lib/routes';
import type { Locale } from '@/lib/types';

type ApplyCopy = {
  title: string;
  subtitle: string;
  steps: Array<{ title: string; detail: string }>;
  checklistTitle: string;
  checklist: string[];
};

const content: Record<Locale, ApplyCopy> = {
  en: {
    title: 'Apply to Brazil with a controlled legal process',
    subtitle:
      'This migrated page replaces the legacy static template with a structured execution flow for visa and residency applications.',
    steps: [
      { title: 'Eligibility mapping', detail: 'Choose the correct immigration basis before collecting records.' },
      { title: 'Document architecture', detail: 'Create source, translation, notarization, and validity matrix.' },
      { title: 'Submission strategy', detail: 'File with quality gates, evidence integrity, and timeline controls.' },
      { title: 'Post-submission tracking', detail: 'Monitor requests, respond to clarifications, and secure final approval.' },
    ],
    checklistTitle: 'Priority pre-application checklist',
    checklist: [
      'Passport and civil records verified for validity windows',
      'Income, employment, or investment proofs aligned with visa category',
      'Sworn translation and legalization requirements mapped',
      'Local onboarding sequence prepared for CPF and immigration registration',
    ],
  },
  es: {
    title: 'Solicita tu proceso migratorio a Brasil con control legal',
    subtitle:
      'Esta versión migrada reemplaza la plantilla estática heredada por un flujo estructurado para visas y residencias.',
    steps: [
      { title: 'Mapa de elegibilidad', detail: 'Define la base migratoria correcta antes de reunir documentos.' },
      { title: 'Arquitectura documental', detail: 'Organiza origen, traducción, legalización y vigencia de cada registro.' },
      { title: 'Estrategia de presentación', detail: 'Presenta con controles de calidad y evidencia consistente.' },
      { title: 'Seguimiento posterior', detail: 'Monitorea requerimientos y asegura cierre del proceso.' },
    ],
    checklistTitle: 'Checklist prioritario antes de aplicar',
    checklist: [
      'Pasaporte y registros civiles verificados por vigencia',
      'Pruebas financieras/laborales alineadas con la categoría',
      'Traducción jurada y legalización definidas por documento',
      'Secuencia local preparada para CPF y registro migratorio',
    ],
  },
  pt: {
    title: 'Aplique para o Brasil com processo jurídico controlado',
    subtitle:
      'Esta página migrada substitui o template estático legado por um fluxo estruturado para vistos e residências.',
    steps: [
      { title: 'Mapeamento de elegibilidade', detail: 'Defina a base migratória correta antes de coletar documentos.' },
      { title: 'Arquitetura documental', detail: 'Organize origem, tradução, legalização e validade de cada registro.' },
      { title: 'Estratégia de protocolo', detail: 'Protocole com controle de qualidade e evidências consistentes.' },
      { title: 'Acompanhamento', detail: 'Monitore exigências e garanta a finalização do processo.' },
    ],
    checklistTitle: 'Checklist prioritário pré-aplicação',
    checklist: [
      'Passaporte e documentos civis validados por prazo de vigência',
      'Comprovantes financeiros/profissionais alinhados à categoria',
      'Tradução juramentada e legalização mapeadas por documento',
      'Sequência local pronta para CPF e registro migratório',
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = content[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-brazil/apply-brazil`,
    title: `Apply Brazil | ${t.title}`,
    description: t.subtitle,
  });
}

export default async function ApplyBrazilPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = content[locale];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Apply Brazil</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          {t.steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Step {index + 1}</p>
              <h2 className="mt-2 font-display text-2xl text-ink-900">{step.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{step.detail}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <aside className="rounded-2xl border border-sand-200 bg-white p-6">
            <h3 className="font-display text-2xl text-ink-900">{t.checklistTitle}</h3>
            <ul className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
              {t.checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <Link
              href={localizedPath(locale, '/contact')}
              className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
            >
              Book consultation
            </Link>
          </aside>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
