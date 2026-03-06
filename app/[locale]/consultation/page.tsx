import type { Metadata } from 'next';

import { CalendlyEmbed } from '@/components/calendly-embed';
import { CtaCard } from '@/components/cta-card';
import { FormspreeDynamicForm, type FormField } from '@/components/formspree-dynamic-form';
import { PaymentMethods } from '@/components/payment-methods';
import { getCodeManagedPagesCopy } from '@/lib/code-managed-pages-content';
import { getFormsCmsCopy } from '@/lib/forms-cms-content';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

// Update scheduling URL via env var first; fallback keeps local/dev stable.
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || 'https://calendly.com/immigratetobrazilteam/strategy-consultation';
// Update receiver in site settings; form endpoints come from CMS forms config.
const PAYMENT_RECEIVER = 'immigratetobrazilteam@gmail.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getCodeManagedPagesCopy(locale).consultationPage;

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
  const t = getCodeManagedPagesCopy(locale).consultationPage;
  const formsCopy = getFormsCmsCopy(locale);

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
      placeholder: formsCopy.serviceSelect.placeholder,
      options: formsCopy.serviceSelect.options,
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
      name: 'service_interest',
      label: formsCopy.serviceSelect.label,
      type: 'select',
      required: true,
      placeholder: formsCopy.serviceSelect.placeholder,
      options: formsCopy.serviceSelect.options,
    },
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
                endpoint={formsCopy.endpoints.consultation}
                context={`consultation-${locale}`}
                fields={consultationFields}
                submitLabel={t.submitLabel}
                submittingLabel={t.submittingLabel}
                successMessage={t.successMessage}
                errorMessage={t.errorMessage}
                spamMessage={t.spamMessage}
                uploadNotPermittedMessage={formsCopy.uploadFallback.blockedMessage}
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
                endpoint={formsCopy.endpoints.consultationDocuments}
                context={`consultation-documents-${locale}`}
                fields={documentFields}
                submitLabel={t.docFormSubmitLabel}
                submittingLabel={t.docFormSubmittingLabel}
                successMessage={t.docFormSuccessMessage}
                errorMessage={t.docFormErrorMessage}
                spamMessage={t.spamMessage}
                uploadNotPermittedMessage={formsCopy.uploadFallback.blockedMessage}
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
