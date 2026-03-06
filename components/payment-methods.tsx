import type { Locale } from '@/lib/types';
import { getCodeManagedPagesCopy } from '@/lib/code-managed-pages-content';

interface PaymentMethodsProps {
  locale: Locale;
  receiverEmail: string;
  title?: string;
  subtitle?: string;
}

const iconClassByMethod: Record<'paypal' | 'wise' | 'pix' | 'payoneer', string> = {
  paypal: 'bg-[#003087] text-white',
  wise: 'bg-[#9fe870] text-ink-900',
  pix: 'bg-[#32bcad] text-white',
  payoneer: 'bg-[#ff5f00] text-white',
};

export function PaymentMethods({ locale, receiverEmail, title, subtitle }: PaymentMethodsProps) {
  const t = getCodeManagedPagesCopy(locale).paymentMethods;

  return (
    <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
      <h2 className="font-display text-3xl text-ink-900">{title || t.title}</h2>
      <p className="mt-3 text-sm text-ink-700">{subtitle || t.subtitle}</p>

      <div className="mt-4 rounded-xl border border-civic-200 bg-civic-50 px-4 py-3 text-sm text-civic-900">
        <span className="font-semibold">{t.receiver}:</span> {receiverEmail}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {t.methods.map((method) => (
          <article key={method.id} className="rounded-xl border border-sand-200 bg-sand-50 p-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${iconClassByMethod[method.id]}`} aria-hidden="true">
                {method.iconLabel}
              </span>
              <h3 className="text-sm font-semibold text-ink-900">{method.label}</h3>
            </div>
            <p className="mt-2 text-xs text-ink-700">{method.instructions}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
