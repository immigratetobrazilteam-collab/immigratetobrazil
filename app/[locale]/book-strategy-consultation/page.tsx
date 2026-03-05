import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { FormspreeDynamicForm, type FormField } from '@/components/formspree-dynamic-form';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

const STRATEGY_ENDPOINT = 'https://formspree.io/f/maqpwodw';

const copy = {
  en: {
    metadataTitle: 'Book Strategy Consultation',
    metadataDescription:
      'Book a paid strategy consultation for your Brazil immigration plan and receive clear next steps based on your profile and timeline.',
    eyebrow: 'Strategy Session',
    title: 'Book Strategy Consultation',
    subtitle:
      'This paid consultation gives you a concrete legal strategy for moving to Brazil with confidence and reduced risk.',
    benefitsTitle: 'Benefits of the consultation',
    benefits: [
      'Profile-based visa and residency pathway analysis.',
      'Priority action plan for documents and legal steps.',
      'Timeline guidance with risk and compliance checkpoints.',
      'Clear recommendation on what to do first and what to avoid.',
    ],
    deliverablesTitle: 'What you receive',
    deliverables: [
      'A practical roadmap tailored to your immigration objective.',
      'Guidance on required documents and evidence quality.',
      'A realistic sequence for filings, travel, and deadlines.',
      'Follow-up direction for execution after the strategy call.',
    ],
    formTitle: 'Submit your strategy consultation request',
    formSubtitle: 'Complete the form below and our team will follow up with payment and scheduling instructions.',
    fields: {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone / WhatsApp',
      country: 'Country of residence',
      goal: 'Primary immigration goal',
      details: 'Tell us about your case',
    },
    submit: 'Submit Request',
    submitting: 'Submitting...',
    success: 'Request sent successfully. We will contact you with next steps shortly.',
    error: 'We could not submit your request right now. Please try again shortly.',
    spam: 'Submission blocked by anti-spam protection.',
  },
  pt: {
    metadataTitle: 'Agendar Consulta Estrategica',
    metadataDescription:
      'Agende uma consulta estrategica paga para o seu plano migratorio para o Brasil e receba orientacoes objetivas para o seu perfil.',
    eyebrow: 'Sessao Estrategica',
    title: 'Agendar Consulta Estrategica',
    subtitle:
      'Esta consultoria paga entrega uma estrategia juridica concreta para sua mudanca ao Brasil com seguranca e menor risco.',
    benefitsTitle: 'Beneficios da consultoria',
    benefits: [
      'Analise de caminhos de visto e residencia conforme o seu perfil.',
      'Plano de acao prioritario para documentos e etapas legais.',
      'Orientacao de prazo com pontos de risco e conformidade.',
      'Recomendacao clara sobre o que fazer primeiro e o que evitar.',
    ],
    deliverablesTitle: 'O que voce recebe',
    deliverables: [
      'Um roteiro pratico adaptado ao seu objetivo migratorio.',
      'Orientacao sobre documentos exigidos e qualidade das evidencias.',
      'Sequencia realista para protocolos, viagem e prazos.',
      'Direcionamento para execucao apos a chamada estrategica.',
    ],
    formTitle: 'Envie sua solicitacao de consulta estrategica',
    formSubtitle: 'Preencha o formulario e nossa equipe enviara instrucoes de pagamento e agendamento.',
    fields: {
      name: 'Nome Completo',
      email: 'E-mail',
      phone: 'Telefone / WhatsApp',
      country: 'Pais de residencia',
      goal: 'Objetivo migratorio principal',
      details: 'Conte mais sobre o seu caso',
    },
    submit: 'Enviar solicitacao',
    submitting: 'Enviando...',
    success: 'Solicitacao enviada com sucesso. Em breve enviaremos os proximos passos.',
    error: 'Nao foi possivel enviar agora. Tente novamente em instantes.',
    spam: 'Envio bloqueado pela protecao anti-spam.',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}/book-strategy-consultation`,
    title: t.metadataTitle,
    description: t.metadataDescription,
  });
}

export default async function BookStrategyConsultationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  const fields: FormField[] = [
    { name: 'name', label: t.fields.name, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: t.fields.email, type: 'email', required: true, autoComplete: 'email' },
    { name: 'phone', label: t.fields.phone, type: 'tel', required: true, autoComplete: 'tel' },
    { name: 'country', label: t.fields.country, type: 'text', required: true },
    { name: 'goal', label: t.fields.goal, type: 'text', required: true },
    { name: 'details', label: t.fields.details, type: 'textarea', required: true, minLength: 20, rows: 5 },
  ];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.benefitsTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {t.benefits.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.deliverablesTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {t.deliverables.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-sand-200 bg-sand-50 p-6 sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.formTitle}</h2>
            <p className="mt-3 text-sm text-ink-700">{t.formSubtitle}</p>
            <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-5">
              <FormspreeDynamicForm
                locale={locale}
                endpoint={STRATEGY_ENDPOINT}
                context={`book-strategy-${locale}`}
                fields={fields}
                submitLabel={t.submit}
                submittingLabel={t.submitting}
                successMessage={t.success}
                errorMessage={t.error}
                spamMessage={t.spam}
                subject={`${t.title} - ${locale.toUpperCase()}`}
              />
            </div>
          </div>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
