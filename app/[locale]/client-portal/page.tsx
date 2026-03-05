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
const DOCUMENT_UPLOAD_ENDPOINT = 'https://formspree.io/f/xojkaddn';
const CLIENT_FORMS_ENDPOINT = 'https://formspree.io/f/mnjgadgy';
const REMINDER_DOCUMENTS_ENDPOINT = 'https://formspree.io/f/xdawngpq';

const copy = {
  en: {
    metadataTitle: 'Client Portal',
    metadataDescription:
      'Client portal for document upload, intake forms, payment instructions, scheduling, and emergency support channels.',
    heroTitle: 'Client Portal',
    heroSubtitle:
      'Use this secure portal to upload documents, submit intake information, complete payment, and book your consultation.',
    uploadTitle: 'Document Upload',
    uploadSubtitle: 'Upload your documents clearly and securely so our team can prepare your case file before consultation.',
    uploadFields: {
      name: 'Full Name',
      email: 'Email',
      caseRef: 'Case reference (optional)',
      documents: 'Upload documents',
      notes: 'Notes (optional)',
    },
    uploadSubmit: 'Submit Documents',
    uploadSuccess: 'Documents uploaded successfully. Thank you.',
    formsTitle: 'Client Forms',
    formsSubtitle: 'Fill out your intake details and required information related to your immigration process.',
    formsFields: {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone / WhatsApp',
      country: 'Current country',
      processStage: 'Current immigration stage',
      info: 'Required process information',
    },
    formsSubmit: 'Submit Client Form',
    formsSuccess: 'Client form submitted successfully. We will review it shortly.',
    bookingTitle: 'Booking rules and consultation flow',
    bookingIntro: 'Clients can book only after payment. Appointments must be at least 36 hours after payment confirmation.',
    bookingSteps: [
      'Client submits consultation request.',
      'Client pays consultation fee.',
      'Client books appointment through Calendly.',
      'After booking, client receives an appointment confirmation email.',
    ],
    whatsappHelp:
      'If anything is unclear or you need assistance booking your consultation, please contact us directly on WhatsApp.',
    whatsappButton: 'WhatsApp Support',
    reminderTitle: 'Document submission reminder',
    reminderWarning:
      'Please submit any relevant documents before your consultation if you want the consultation to be effective and personalized. Documents submitted after the consultation may limit our ability to provide detailed guidance.',
    reminderFormTitle: 'Submit additional documents before consultation',
    reminderFormFields: {
      name: 'Full Name',
      email: 'Email',
      file: 'Documents',
      notes: 'Notes (optional)',
    },
    reminderSubmit: 'Send Reminder Documents',
    reminderSuccess: 'Documents sent successfully before consultation.',
    emergencyTitle: 'Emergency Contact',
    emergencyLabelEmail: 'Email',
    emergencyLabelPhone: 'Phone',
    emergencyMessage:
      'In case of emergency please contact us via WhatsApp and clearly state the nature of your emergency. For regular clients, you already have an assigned attorney or consultant. Please contact them directly.',
    spam: 'Submission blocked by anti-spam protection.',
    error: 'We could not submit your request right now. Please try again shortly.',
  },
  pt: {
    metadataTitle: 'Portal do Cliente',
    metadataDescription:
      'Portal do cliente para upload de documentos, formularios de intake, instrucoes de pagamento, agendamento e suporte emergencial.',
    heroTitle: 'Portal do Cliente',
    heroSubtitle:
      'Use este portal seguro para enviar documentos, preencher informacoes, concluir pagamento e agendar sua consultoria.',
    uploadTitle: 'Envio de Documentos',
    uploadSubtitle: 'Envie seus documentos de forma clara e segura para prepararmos seu dossie antes da consultoria.',
    uploadFields: {
      name: 'Nome Completo',
      email: 'E-mail',
      caseRef: 'Referencia do caso (opcional)',
      documents: 'Enviar documentos',
      notes: 'Observacoes (opcional)',
    },
    uploadSubmit: 'Enviar Documentos',
    uploadSuccess: 'Documentos enviados com sucesso. Obrigado.',
    formsTitle: 'Formularios do Cliente',
    formsSubtitle: 'Preencha os dados de intake e as informacoes obrigatorias do seu processo migratorio.',
    formsFields: {
      name: 'Nome Completo',
      email: 'E-mail',
      phone: 'Telefone / WhatsApp',
      country: 'Pais atual',
      processStage: 'Etapa atual do processo migratorio',
      info: 'Informacoes necessarias do processo',
    },
    formsSubmit: 'Enviar Formulario do Cliente',
    formsSuccess: 'Formulario enviado com sucesso. Em breve nossa equipe analisara.',
    bookingTitle: 'Regras de agendamento e fluxo da consultoria',
    bookingIntro:
      'Clientes so podem agendar apos o pagamento. Os horarios devem ser marcados com pelo menos 36 horas apos a confirmacao do pagamento.',
    bookingSteps: [
      'Cliente envia solicitacao de consultoria.',
      'Cliente paga a taxa da consultoria.',
      'Cliente agenda o horario pelo Calendly.',
      'Apos agendar, o cliente recebe e-mail de confirmacao da consulta.',
    ],
    whatsappHelp:
      'Se algo nao estiver claro ou voce precisar de ajuda para agendar sua consulta, entre em contato conosco diretamente pelo WhatsApp.',
    whatsappButton: 'Suporte via WhatsApp',
    reminderTitle: 'Lembrete de envio de documentos',
    reminderWarning:
      'Por favor, envie quaisquer documentos relevantes antes da sua consultoria se quiser que a consulta seja efetiva e personalizada. Documentos enviados apos a consulta podem limitar nossa capacidade de oferecer orientacoes detalhadas.',
    reminderFormTitle: 'Enviar documentos adicionais antes da consultoria',
    reminderFormFields: {
      name: 'Nome Completo',
      email: 'E-mail',
      file: 'Documentos',
      notes: 'Observacoes (opcional)',
    },
    reminderSubmit: 'Enviar Documentos de Apoio',
    reminderSuccess: 'Documentos enviados com sucesso antes da consultoria.',
    emergencyTitle: 'Contato de Emergencia',
    emergencyLabelEmail: 'E-mail',
    emergencyLabelPhone: 'Telefone',
    emergencyMessage:
      'Em caso de emergencia, entre em contato pelo WhatsApp e informe claramente a natureza da emergencia. Para clientes regulares, voce ja possui advogado ou consultor designado. Entre em contato diretamente com ele.',
    spam: 'Envio bloqueado pela protecao anti-spam.',
    error: 'Nao foi possivel enviar sua solicitacao agora. Tente novamente em instantes.',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}/client-portal`,
    title: t.metadataTitle,
    description: t.metadataDescription,
  });
}

export default async function ClientPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  const uploadFields: FormField[] = [
    { name: 'name', label: t.uploadFields.name, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: t.uploadFields.email, type: 'email', required: true, autoComplete: 'email' },
    { name: 'case_reference', label: t.uploadFields.caseRef, type: 'text' },
    {
      name: 'documents',
      label: t.uploadFields.documents,
      type: 'file',
      required: true,
      multiple: true,
      accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip',
    },
    { name: 'notes', label: t.uploadFields.notes, type: 'textarea', rows: 4 },
  ];

  const clientFormFields: FormField[] = [
    { name: 'name', label: t.formsFields.name, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: t.formsFields.email, type: 'email', required: true, autoComplete: 'email' },
    { name: 'phone', label: t.formsFields.phone, type: 'tel', required: true, autoComplete: 'tel' },
    { name: 'country', label: t.formsFields.country, type: 'text', required: true },
    { name: 'process_stage', label: t.formsFields.processStage, type: 'text', required: true },
    { name: 'required_info', label: t.formsFields.info, type: 'textarea', required: true, minLength: 25, rows: 5 },
  ];

  const reminderFields: FormField[] = [
    { name: 'name', label: t.reminderFormFields.name, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: t.reminderFormFields.email, type: 'email', required: true, autoComplete: 'email' },
    {
      name: 'documents',
      label: t.reminderFormFields.file,
      type: 'file',
      required: true,
      multiple: true,
      accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip',
    },
    { name: 'notes', label: t.reminderFormFields.notes, type: 'textarea', rows: 4 },
  ];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-5xl text-ink-900">{t.heroTitle}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.heroSubtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.uploadTitle}</h2>
            <p className="mt-3 text-sm text-ink-700">{t.uploadSubtitle}</p>
            <div className="mt-5">
              <FormspreeDynamicForm
                locale={locale}
                endpoint={DOCUMENT_UPLOAD_ENDPOINT}
                context={`portal-doc-upload-${locale}`}
                fields={uploadFields}
                submitLabel={t.uploadSubmit}
                submittingLabel={locale === 'pt' ? 'Enviando...' : 'Submitting...'}
                successMessage={t.uploadSuccess}
                errorMessage={t.error}
                spamMessage={t.spam}
                subject={`${t.uploadTitle} - ${locale.toUpperCase()}`}
              />
            </div>
          </article>

          <article className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.formsTitle}</h2>
            <p className="mt-3 text-sm text-ink-700">{t.formsSubtitle}</p>
            <div className="mt-5">
              <FormspreeDynamicForm
                locale={locale}
                endpoint={CLIENT_FORMS_ENDPOINT}
                context={`portal-client-forms-${locale}`}
                fields={clientFormFields}
                submitLabel={t.formsSubmit}
                submittingLabel={locale === 'pt' ? 'Enviando...' : 'Submitting...'}
                successMessage={t.formsSuccess}
                errorMessage={t.error}
                spamMessage={t.spam}
                subject={`${t.formsTitle} - ${locale.toUpperCase()}`}
              />
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <PaymentMethods locale={locale} receiverEmail={PAYMENT_RECEIVER} />
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <CalendlyEmbed locale={locale} calendlyUrl={CALENDLY_URL} />

          <article className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.bookingTitle}</h2>
            <p className="mt-3 text-sm text-ink-700">{t.bookingIntro}</p>
            <ol className="mt-4 space-y-2 text-sm text-ink-700">
              {t.bookingSteps.map((step, index) => (
                <li key={step}>
                  <span className="font-semibold text-ink-900">{index + 1}. </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-5 rounded-2xl border border-civic-200 bg-civic-50 p-4 text-sm text-civic-900">
              <p>{t.whatsappHelp}</p>
              <a
                href={siteConfig.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-[#32df75]"
              >
                {t.whatsappButton}
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <h2 className="font-display text-2xl text-amber-900">{t.reminderTitle}</h2>
            <p className="mt-2 text-sm font-semibold text-amber-900">{t.reminderWarning}</p>
          </div>

          <div className="mt-6 rounded-3xl border border-sand-200 bg-sand-50 p-6 sm:p-8">
            <h3 className="font-display text-3xl text-ink-900">{t.reminderFormTitle}</h3>
            <div className="mt-5 rounded-2xl border border-sand-200 bg-white p-5">
              <FormspreeDynamicForm
                locale={locale}
                endpoint={REMINDER_DOCUMENTS_ENDPOINT}
                context={`portal-reminder-documents-${locale}`}
                fields={reminderFields}
                submitLabel={t.reminderSubmit}
                submittingLabel={locale === 'pt' ? 'Enviando...' : 'Submitting...'}
                successMessage={t.reminderSuccess}
                errorMessage={t.error}
                spamMessage={t.spam}
                subject={`${t.reminderFormTitle} - ${locale.toUpperCase()}`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
          <article className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-3xl text-ink-900">{t.emergencyTitle}</h2>
            <p className="mt-4 text-sm text-ink-700">
              <span className="font-semibold text-ink-900">{t.emergencyLabelEmail}:</span> {PAYMENT_RECEIVER}
            </p>
            <p className="mt-1 text-sm text-ink-700">
              <span className="font-semibold text-ink-900">{t.emergencyLabelPhone}:</span> {siteConfig.contact.whatsappNumber}
            </p>
            <p className="mt-4 text-sm text-ink-700">{t.emergencyMessage}</p>
            <a
              href={siteConfig.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-[#32df75]"
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
