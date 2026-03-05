import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { FormspreeDynamicForm, type FormField } from '@/components/formspree-dynamic-form';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

const NOTICE_ENDPOINT = 'https://formspree.io/f/mnjgadzy';

const copy = {
  en: {
    metadataTitle: 'Email Us Notice',
    metadataDescription:
      'Submit an official notice request with supporting details so our team can review and respond promptly.',
    eyebrow: 'Notice Process',
    title: 'Email Us Notice',
    subtitle:
      'Use this page to send a formal notice to our team. Include complete details so we can route your request correctly and reply quickly.',
    howItWorksTitle: 'How the notice process works',
    howItWorks: [
      'Submit your notice with complete identifying details.',
      'Our team reviews urgency, scope, and required legal follow-up.',
      'You receive a confirmation response by email.',
    ],
    formTitle: 'Send your notice',
    formSubtitle: 'All fields are accessible and optimized for desktop/mobile.',
    fields: {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone / WhatsApp',
      subject: 'Notice subject',
      message: 'Notice details',
      file: 'Attachment (optional)',
    },
    submit: 'Send Notice',
    submitting: 'Sending...',
    success: 'Notice submitted successfully. We will respond by email soon.',
    error: 'We could not submit your notice right now. Please try again shortly.',
    spam: 'Submission blocked by anti-spam protection.',
  },
  pt: {
    metadataTitle: 'Aviso por E-mail',
    metadataDescription:
      'Envie um aviso oficial com os detalhes relevantes para que nossa equipe possa analisar e responder rapidamente.',
    eyebrow: 'Processo de Aviso',
    title: 'Aviso por E-mail',
    subtitle:
      'Use esta pagina para enviar um aviso formal para nossa equipe. Inclua detalhes completos para encaminhamento correto e resposta rapida.',
    howItWorksTitle: 'Como funciona o processo de aviso',
    howItWorks: [
      'Envie seu aviso com dados completos de identificacao.',
      'Nossa equipe analisa urgencia, escopo e necessidade de acompanhamento juridico.',
      'Voce recebe confirmacao de recebimento por e-mail.',
    ],
    formTitle: 'Envie seu aviso',
    formSubtitle: 'Todos os campos sao acessiveis e otimizados para desktop e mobile.',
    fields: {
      fullName: 'Nome Completo',
      email: 'E-mail',
      phone: 'Telefone / WhatsApp',
      subject: 'Assunto do aviso',
      message: 'Detalhes do aviso',
      file: 'Anexo (opcional)',
    },
    submit: 'Enviar Aviso',
    submitting: 'Enviando...',
    success: 'Aviso enviado com sucesso. Em breve responderemos por e-mail.',
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
    pathname: `/${locale}/email-us-notice`,
    title: t.metadataTitle,
    description: t.metadataDescription,
  });
}

export default async function EmailUsNoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  const fields: FormField[] = [
    { name: 'full_name', label: t.fields.fullName, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: t.fields.email, type: 'email', required: true, autoComplete: 'email' },
    { name: 'phone', label: t.fields.phone, type: 'tel', autoComplete: 'tel' },
    { name: 'notice_subject', label: t.fields.subject, type: 'text', required: true },
    { name: 'notice_details', label: t.fields.message, type: 'textarea', required: true, minLength: 25, rows: 6 },
    {
      name: 'attachment',
      label: t.fields.file,
      type: 'file',
      accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip',
    },
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
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.howItWorksTitle}</h2>
            <ol className="mt-3 space-y-2 text-sm text-ink-700">
              {t.howItWorks.map((step, index) => (
                <li key={step}>
                  <span className="font-semibold text-ink-900">{index + 1}. </span>
                  {step}
                </li>
              ))}
            </ol>
          </article>

          <div className="mt-6 rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.formTitle}</h2>
            <p className="mt-3 text-sm text-ink-700">{t.formSubtitle}</p>
            <div className="mt-5">
              <FormspreeDynamicForm
                locale={locale}
                endpoint={NOTICE_ENDPOINT}
                context={`email-us-notice-${locale}`}
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
