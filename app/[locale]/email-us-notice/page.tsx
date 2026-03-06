import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { FormspreeDynamicForm, type FormField } from '@/components/formspree-dynamic-form';
import { getCodeManagedPagesCopy } from '@/lib/code-managed-pages-content';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

// Update this endpoint if the Formspree form changes.
const NOTICE_ENDPOINT = 'https://formspree.io/f/mnjgadzy';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getCodeManagedPagesCopy(locale).emailUsNoticePage;

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
  const t = getCodeManagedPagesCopy(locale).emailUsNoticePage;

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
