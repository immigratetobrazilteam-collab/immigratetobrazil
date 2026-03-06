import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { FormspreeDynamicForm, type FormField } from '@/components/formspree-dynamic-form';
import { getCodeManagedPagesCopy } from '@/lib/code-managed-pages-content';
import { getFormsCmsCopy } from '@/lib/forms-cms-content';
import { resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getCodeManagedPagesCopy(locale).bookStrategyConsultationPage;

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
  const t = getCodeManagedPagesCopy(locale).bookStrategyConsultationPage;
  const formsCopy = getFormsCmsCopy(locale);

  const fields: FormField[] = [
    { name: 'name', label: t.fields.name, type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: t.fields.email, type: 'email', required: true, autoComplete: 'email' },
    { name: 'phone', label: t.fields.phone, type: 'tel', required: true, autoComplete: 'tel' },
    { name: 'country', label: t.fields.country, type: 'text', required: true },
    {
      name: 'service_interest',
      label: formsCopy.serviceSelect.label,
      type: 'select',
      required: true,
      placeholder: formsCopy.serviceSelect.placeholder,
      options: formsCopy.serviceSelect.options,
    },
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
                endpoint={formsCopy.endpoints.strategyConsultation}
                context={`book-strategy-${locale}`}
                fields={fields}
                submitLabel={t.submit}
                submittingLabel={t.submitting}
                successMessage={t.success}
                errorMessage={t.error}
                spamMessage={t.spam}
                uploadNotPermittedMessage={formsCopy.uploadFallback.blockedMessage}
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
