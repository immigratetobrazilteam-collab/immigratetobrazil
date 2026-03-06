import type { Metadata } from 'next';

import { CalendlyEmbed } from '@/components/calendly-embed';
import { CtaCard } from '@/components/cta-card';
import { FormspreeDynamicForm, type FormField } from '@/components/formspree-dynamic-form';
import { PaymentMethods } from '@/components/payment-methods';
import { getCodeManagedPagesCopy } from '@/lib/code-managed-pages-content';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

// Update scheduling URL via env var first; fallback keeps local/dev stable.
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || 'https://calendly.com/immigratetobrazilteam/strategy-consultation';
// Update receiver and form endpoints here when payment/forms providers change.
const PAYMENT_RECEIVER = 'immigratetobrazilteam@gmail.com';
const DOCUMENT_UPLOAD_ENDPOINT = 'https://formspree.io/f/xojkaddn';
const CLIENT_FORMS_ENDPOINT = 'https://formspree.io/f/mnjgadgy';
const REMINDER_DOCUMENTS_ENDPOINT = 'https://formspree.io/f/xdawngpq';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getCodeManagedPagesCopy(locale).clientPortalPage;

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
  const t = getCodeManagedPagesCopy(locale).clientPortalPage;

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
                submittingLabel={t.submittingLabel}
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
                submittingLabel={t.submittingLabel}
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
                submittingLabel={t.submittingLabel}
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
