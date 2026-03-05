import type { Locale } from '@/lib/types';

type PaymentMethod = {
  id: 'paypal' | 'wise' | 'pix' | 'payoneer';
  label: string;
  instructions: string;
  iconLabel: string;
};

interface PaymentMethodsProps {
  locale: Locale;
  receiverEmail: string;
  title?: string;
  subtitle?: string;
}

const copy: Record<Locale, { title: string; subtitle: string; receiver: string; methods: PaymentMethod[] }> = {
  en: {
    title: 'Payments',
    subtitle: 'Pay your consultation fee using any method below. Send confirmation to our WhatsApp or email after payment.',
    receiver: 'Payment receiver email',
    methods: [
      {
        id: 'paypal',
        label: 'PayPal',
        instructions: 'Use PayPal transfer and set the receiver email below in the payment form.',
        iconLabel: 'PP',
      },
      {
        id: 'wise',
        label: 'Wise',
        instructions: 'Send through Wise to the same receiver email. Add your full name in the transfer note.',
        iconLabel: 'W',
      },
      {
        id: 'pix',
        label: 'PIX',
        instructions: 'Use PIX transfer with the receiver email key and keep your receipt for booking confirmation.',
        iconLabel: 'PX',
      },
      {
        id: 'payoneer',
        label: 'Payoneer',
        instructions: 'Use Payoneer transfer to the receiver email and share proof of payment with our team.',
        iconLabel: 'PO',
      },
    ],
  },
  pt: {
    title: 'Pagamentos',
    subtitle: 'Pague a taxa da consulta usando um dos metodos abaixo. Envie o comprovante pelo WhatsApp ou e-mail apos o pagamento.',
    receiver: 'E-mail recebedor para pagamento',
    methods: [
      {
        id: 'paypal',
        label: 'PayPal',
        instructions: 'Use transferencia pelo PayPal e informe o e-mail recebedor abaixo no formulario de pagamento.',
        iconLabel: 'PP',
      },
      {
        id: 'wise',
        label: 'Wise',
        instructions: 'Envie pela Wise para o mesmo e-mail recebedor. Inclua seu nome completo na observacao.',
        iconLabel: 'W',
      },
      {
        id: 'pix',
        label: 'PIX',
        instructions: 'Use transferencia PIX com a chave de e-mail e guarde o comprovante para confirmar o agendamento.',
        iconLabel: 'PX',
      },
      {
        id: 'payoneer',
        label: 'Payoneer',
        instructions: 'Use transferencia Payoneer para o e-mail recebedor e compartilhe o comprovante com nossa equipe.',
        iconLabel: 'PO',
      },
    ],
  },
};

const iconClassByMethod: Record<PaymentMethod['id'], string> = {
  paypal: 'bg-[#003087] text-white',
  wise: 'bg-[#9fe870] text-ink-900',
  pix: 'bg-[#32bcad] text-white',
  payoneer: 'bg-[#ff5f00] text-white',
};

export function PaymentMethods({ locale, receiverEmail, title, subtitle }: PaymentMethodsProps) {
  const t = copy[locale];

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
