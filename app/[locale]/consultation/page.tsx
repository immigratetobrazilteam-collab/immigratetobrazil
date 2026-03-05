import type { Metadata } from 'next';

import { CalendlyEmbed } from '@/components/calendly-embed';
import { CtaCard } from '@/components/cta-card';
import { FormspreeDynamicForm, type FormField } from '@/components/formspree-dynamic-form';
import { PaymentMethods } from '@/components/payment-methods';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || 'https://calendly.com/immigratetobrazilteam/strategy-consultation';
const PAYMENT_RECEIVER = 'immigratetobrazilteam@gmail.com';
const CONSULTATION_ENDPOINT = 'https://formspree.io/f/mbdzroab';
const DOCUMENTS_ENDPOINT = 'https://formspree.io/f/xdawngpq';

const copy = {
  en: {
    metadataTitle: 'Brazil Immigration Strategy Consultation',
    metadataDescription:
      'Book a paid Brazil immigration strategy consultation and receive a personalized roadmap for visas, residency, compliance, and next steps.',
    heroTitle: 'Brazil Immigration Strategy Consultation',
    heroSubtitle:
      'Receive a personalized roadmap for your move to Brazil based on your goals, background, and legal options.',
    heroCta: 'Start Consultation Form',
    includesTitle: 'What the consultation includes',
    includesItems: [
      'Eligibility evaluation for Brazilian visas and residency pathways.',
      'Custom immigration strategy for your profile and timeline.',
      'Document preparation guidance and evidence planning.',
      'Expected timelines, procedural milestones, and filing order.',
      'Legal considerations, risk points, and compliance safeguards.',
    ],
    whoTitle: 'Who this consultation is for',
    whoItems: [
      'People planning to move to Brazil soon or in the next 12 months.',
      'Investors exploring residency routes linked to investment activity.',
      'Families relocating and planning school, housing, and legal status.',
      'Digital nomads and remote professionals seeking compliant status.',
      'Retirees and professionals who want legal certainty before moving.',
    ],
    whyTitle: 'Why book this consultation',
    whyItems: [
      'Avoid costly mistakes before filing or booking travel.',
      'Understand the strongest visa or residency options for your case.',
      'Receive personalized legal guidance instead of generic information.',
      'Prepare your documents correctly from the beginning.',
    ],
    formTitle: 'Main consultation form',
    formIntro: 'Complete this form so we can prepare your strategy session efficiently.',
    formFields: {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone / WhatsApp',
      country: 'Country of residence',
      nationality: 'Nationality',
      goal: 'Immigration goal',
      visaInterest: 'Visa or residency interest',
      situation: 'Description of situation',
      documents: 'Optional document upload',
      selectPlaceholder: 'Select visa or residency interest',
    },
    visaOptions: [
      { value: 'digital_nomad', label: 'Digital Nomad' },
      { value: 'work_visa', label: 'Work Visa' },
      { value: 'investor', label: 'Investor Residency' },
      { value: 'family_reunion', label: 'Family Reunion' },
      { value: 'retirement', label: 'Retirement Route' },
      { value: 'not_sure', label: 'Not Sure Yet' },
    ],
    submitLabel: 'Submit Consultation Request',
    submittingLabel: 'Submitting...',
    successMessage: 'Consultation request submitted successfully. We will contact you shortly with next steps.',
    errorMessage: 'We could not submit your request right now. Please try again shortly.',
    spamMessage: 'Submission blocked by anti-spam protection.',
    paymentGateTitle: 'Payment required before booking',
    paymentGateBody: 'Consultation payment is required before selecting an appointment slot in Calendly.',
    bookingFlowTitle: 'Consultation flow',
    bookingFlowSteps: [
      'Client submits consultation request.',
      'Client pays the consultation fee.',
      'Client books appointment through Calendly.',
      'After booking, the client receives an email confirmation automatically from Calendly.',
    ],
    calendlyTitle: 'Book your paid consultation in Calendly',
    calendlyBody: 'Appointments must be booked at least 36 hours after payment confirmation.',
    docReminderTitle: 'Document submission reminder',
    docReminderBody:
      'Please submit any relevant documents before your consultation if you want the consultation to be effective and personalized.',
    docReminderExtra:
      'Documents submitted after the consultation may limit our ability to provide detailed guidance.',
    docFormTitle: 'Submit documents before consultation',
    docFormSubtitle: 'Upload documents in advance so we can review your case before your appointment.',
    docFormFields: {
      name: 'Full Name',
      email: 'Email',
      file: 'Documents',
      notes: 'Notes (optional)',
    },
    whatsappTitle: 'WhatsApp support',
    whatsappBody: 'If you have questions about the consultation or payment process, please contact us directly via WhatsApp.',
    whatsappButton: 'Contact via WhatsApp',
  },
  pt: {
    metadataTitle: 'Consultoria Estrategica de Imigracao para o Brasil',
    metadataDescription:
      'Agende uma consultoria estrategica paga de imigracao para o Brasil e receba um roteiro personalizado para visto, residencia e conformidade.',
    heroTitle: 'Consultoria Estrategica de Imigracao para o Brasil',
    heroSubtitle:
      'Receba um roteiro personalizado para sua mudanca para o Brasil com base em seus objetivos, perfil e opcoes legais.',
    heroCta: 'Iniciar Formulario de Consulta',
    includesTitle: 'O que a consultoria inclui',
    includesItems: [
      'Avaliacao de elegibilidade para vistos e residencias no Brasil.',
      'Estrategia migratoria personalizada para seu perfil e prazo.',
      'Orientacao para preparo documental e evidencias.',
      'Previsao de prazos, marcos do processo e ordem de protocolo.',
      'Consideracoes legais, riscos e medidas de conformidade.',
    ],
    whoTitle: 'Para quem esta consultoria e indicada',
    whoItems: [
      'Pessoas planejando mudar para o Brasil em breve ou nos proximos 12 meses.',
      'Investidores analisando caminhos de residencia ligados a investimento.',
      'Familias em processo de mudanca com planejamento escolar, moradia e status legal.',
      'Nomades digitais e profissionais remotos buscando status regular.',
      'Aposentados e profissionais que precisam de seguranca juridica antes da mudanca.',
    ],
    whyTitle: 'Por que agendar esta consultoria',
    whyItems: [
      'Evitar erros caros antes de protocolar ou comprar passagens.',
      'Entender as opcoes de visto ou residencia mais fortes para o seu caso.',
      'Receber orientacao juridica personalizada em vez de informacoes genericas.',
      'Preparar documentos corretamente desde o inicio.',
    ],
    formTitle: 'Formulario principal da consultoria',
    formIntro: 'Preencha este formulario para prepararmos sua sessao estrategica de forma eficiente.',
    formFields: {
      fullName: 'Nome Completo',
      email: 'E-mail',
      phone: 'Telefone / WhatsApp',
      country: 'Pais de residencia',
      nationality: 'Nacionalidade',
      goal: 'Objetivo migratorio',
      visaInterest: 'Interesse em visto ou residencia',
      situation: 'Descricao da situacao',
      documents: 'Upload opcional de documentos',
      selectPlaceholder: 'Selecione o interesse de visto ou residencia',
    },
    visaOptions: [
      { value: 'digital_nomad', label: 'Nomade Digital' },
      { value: 'work_visa', label: 'Visto de Trabalho' },
      { value: 'investor', label: 'Residencia para Investidor' },
      { value: 'family_reunion', label: 'Reuniao Familiar' },
      { value: 'retirement', label: 'Aposentadoria' },
      { value: 'not_sure', label: 'Ainda nao tenho certeza' },
    ],
    submitLabel: 'Enviar Solicitação de Consultoria',
    submittingLabel: 'Enviando...',
    successMessage: 'Solicitacao enviada com sucesso. Entraremos em contato com os proximos passos.',
    errorMessage: 'Nao foi possivel enviar agora. Tente novamente em instantes.',
    spamMessage: 'Envio bloqueado pela protecao anti-spam.',
    paymentGateTitle: 'Pagamento obrigatorio antes do agendamento',
    paymentGateBody: 'O pagamento da consultoria e obrigatorio antes da escolha de horario no Calendly.',
    bookingFlowTitle: 'Fluxo da consultoria',
    bookingFlowSteps: [
      'Cliente envia a solicitacao de consultoria.',
      'Cliente realiza o pagamento da taxa de consultoria.',
      'Cliente agenda o horario pelo Calendly.',
      'Apos o agendamento, o cliente recebe e-mail de confirmacao automaticamente pelo Calendly.',
    ],
    calendlyTitle: 'Agende sua consultoria paga no Calendly',
    calendlyBody: 'Os horarios devem ser agendados com pelo menos 36 horas apos a confirmacao do pagamento.',
    docReminderTitle: 'Lembrete de envio de documentos',
    docReminderBody:
      'Por favor, envie quaisquer documentos relevantes antes da sua consultoria para que ela seja efetiva e personalizada.',
    docReminderExtra: 'Documentos enviados apos a consultoria podem limitar nossa capacidade de orientar com detalhes.',
    docFormTitle: 'Envie documentos antes da consultoria',
    docFormSubtitle: 'Envie os documentos com antecedencia para avaliarmos seu caso antes do atendimento.',
    docFormFields: {
      name: 'Nome Completo',
      email: 'E-mail',
      file: 'Documentos',
      notes: 'Observacoes (opcional)',
    },
    whatsappTitle: 'Suporte no WhatsApp',
    whatsappBody: 'Se voce tiver duvidas sobre a consultoria ou o processo de pagamento, fale conosco diretamente no WhatsApp.',
    whatsappButton: 'Falar via WhatsApp',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}/consultation`,
    title: t.metadataTitle,
    description: t.metadataDescription,
  });
}

export default async function ConsultationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  const consultationFields: FormField[] = [
    { name: 'full_name', label: t.formFields.fullName, type: 'text', autoComplete: 'name', required: true },
    { name: 'email', label: t.formFields.email, type: 'email', autoComplete: 'email', required: true },
    { name: 'phone_whatsapp', label: t.formFields.phone, type: 'tel', autoComplete: 'tel', required: true },
    { name: 'country_residence', label: t.formFields.country, type: 'text', required: true },
    { name: 'nationality', label: t.formFields.nationality, type: 'text', required: true },
    { name: 'immigration_goal', label: t.formFields.goal, type: 'textarea', required: true, minLength: 20, rows: 4 },
    {
      name: 'visa_interest',
      label: t.formFields.visaInterest,
      type: 'select',
      required: true,
      placeholder: t.formFields.selectPlaceholder,
      options: t.visaOptions,
    },
    { name: 'situation_description', label: t.formFields.situation, type: 'textarea', required: true, minLength: 30, rows: 6 },
    {
      name: 'document_upload',
      label: t.formFields.documents,
      type: 'file',
      accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
    },
  ];

  const documentFields: FormField[] = [
    { name: 'name', label: t.docFormFields.name, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: t.docFormFields.email, type: 'email', required: true, autoComplete: 'email' },
    {
      name: 'documents',
      label: t.docFormFields.file,
      type: 'file',
      required: true,
      accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip',
      multiple: true,
    },
    { name: 'notes', label: t.docFormFields.notes, type: 'textarea', rows: 4 },
  ];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{t.heroTitle}</h1>
          <p className="mt-5 max-w-3xl text-lg text-ink-700">{t.heroSubtitle}</p>
          <a
            href="#consultation-form"
            className="mt-7 inline-flex rounded-full bg-civic-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-civic-800"
          >
            {t.heroCta}
          </a>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.includesTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {t.includesItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.whoTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {t.whoItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.whyTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {t.whyItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="consultation-form" className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-sand-200 bg-sand-50 p-6 sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.formTitle}</h2>
            <p className="mt-3 text-sm text-ink-700">{t.formIntro}</p>
            <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-5">
              <FormspreeDynamicForm
                locale={locale}
                endpoint={CONSULTATION_ENDPOINT}
                context={`consultation-${locale}`}
                fields={consultationFields}
                submitLabel={t.submitLabel}
                submittingLabel={t.submittingLabel}
                successMessage={t.successMessage}
                errorMessage={t.errorMessage}
                spamMessage={t.spamMessage}
                subject={`${t.heroTitle} - ${locale.toUpperCase()}`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <PaymentMethods locale={locale} receiverEmail={PAYMENT_RECEIVER} />

          <article className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.paymentGateTitle}</h2>
            <p className="mt-3 text-sm text-ink-700">{t.paymentGateBody}</p>
            <h3 className="mt-6 text-lg font-semibold text-ink-900">{t.bookingFlowTitle}</h3>
            <ol className="mt-3 space-y-2 text-sm text-ink-700">
              {t.bookingFlowSteps.map((step, index) => (
                <li key={step}>
                  <span className="font-semibold text-ink-900">{index + 1}. </span>
                  {step}
                </li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <CalendlyEmbed locale={locale} calendlyUrl={CALENDLY_URL} title={t.calendlyTitle} description={t.calendlyBody} />
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <h2 className="font-display text-2xl text-amber-900">{t.docReminderTitle}</h2>
            <p className="mt-2 text-sm text-amber-900">{t.docReminderBody}</p>
            <p className="mt-2 text-sm font-semibold text-amber-900">{t.docReminderExtra}</p>
          </div>

          <div className="mt-6 rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-display text-3xl text-ink-900">{t.docFormTitle}</h3>
            <p className="mt-3 text-sm text-ink-700">{t.docFormSubtitle}</p>
            <div className="mt-5">
              <FormspreeDynamicForm
                locale={locale}
                endpoint={DOCUMENTS_ENDPOINT}
                context={`consultation-documents-${locale}`}
                fields={documentFields}
                submitLabel={locale === 'pt' ? 'Enviar documentos' : 'Submit documents'}
                submittingLabel={locale === 'pt' ? 'Enviando...' : 'Submitting...'}
                successMessage={
                  locale === 'pt'
                    ? 'Documentos enviados com sucesso. Obrigado pelo envio antecipado.'
                    : 'Documents submitted successfully. Thank you for sending them in advance.'
                }
                errorMessage={
                  locale === 'pt'
                    ? 'Nao foi possivel enviar os documentos agora. Tente novamente em instantes.'
                    : 'We could not submit your documents right now. Please try again shortly.'
                }
                spamMessage={locale === 'pt' ? 'Envio bloqueado pela protecao anti-spam.' : 'Submission blocked by anti-spam protection.'}
                subject={`${t.docFormTitle} - ${locale.toUpperCase()}`}
              />
            </div>
          </div>

          <article className="mt-6 rounded-2xl border border-civic-200 bg-civic-50 p-5 text-civic-900">
            <h3 className="font-display text-2xl">{t.whatsappTitle}</h3>
            <p className="mt-2 text-sm">{t.whatsappBody}</p>
            <a
              href={siteConfig.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-[#32df75]"
            >
              {t.whatsappButton}
            </a>
          </article>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
