'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

import { trackAnalyticsEvent } from '@/lib/analytics-events';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

type FormspreeContactFormProps = {
  locale: Locale;
  context?: string;
  title?: string;
  subtitle?: string;
};

type FormCopy = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  send: string;
  sending: string;
  success: string;
  failure: string;
  spam: string;
  fieldErrors: {
    name: string;
    email: string;
    message: string;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const fallbackCopy: FormCopy = {
    name: 'Full name',
    email: 'Email address',
    phone: 'WhatsApp / Phone',
    service: 'Service of interest',
    message: 'Tell us your goal and timeline',
    send: 'Send request',
    sending: 'Sending...',
    success: 'Request sent successfully. We will get back to you shortly.',
    failure: 'We could not submit the form right now. Please try again in a few minutes.',
    spam: 'Submission blocked by anti-spam protection.',
    fieldErrors: {
      name: 'Please enter your full name.',
      email: 'Please enter a valid email address.',
      message: 'Please write a message with at least 20 characters.',
    },
};

function validate(fields: { name: string; email: string; message: string }, copy: FormCopy): FieldErrors {
  const errors: FieldErrors = {};

  if (fields.name.trim().length < 2) {
    errors.name = copy.fieldErrors.name;
  }

  if (!EMAIL_REGEX.test(fields.email.trim())) {
    errors.email = copy.fieldErrors.email;
  }

  if (fields.message.trim().length < 20) {
    errors.message = copy.fieldErrors.message;
  }

  return errors;
}

export function FormspreeContactForm({
  locale,
  context = 'general',
  title,
  subtitle,
}: FormspreeContactFormProps) {
  const copy = useMemo(
    () => getManagedPageCopyWithFallback<FormCopy>(locale, 'formspreeForm', fallbackCopy),
    [locale],
  );
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const message = String(formData.get('message') || '');
    const honeypot = String(formData.get('_gotcha') || '').trim();
    const websiteTrap = String(formData.get('website') || '').trim();

    if (honeypot || websiteTrap) {
      setStatus('error');
      setErrorMessage(copy.spam);
      trackAnalyticsEvent('form_spam_blocked', { form_context: context, locale });
      return;
    }

    const elapsedMs = Date.now() - startedAt.current;
    if (elapsedMs < 2500) {
      setStatus('error');
      setErrorMessage(copy.spam);
      trackAnalyticsEvent('form_spam_blocked', { form_context: context, locale });
      return;
    }

    const validationErrors = validate({ name, email, message }, copy);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setStatus('error');
      setErrorMessage(copy.failure);
      trackAnalyticsEvent('form_validation_error', {
        form_context: context,
        locale,
        error_count: Object.keys(validationErrors).length,
      });
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    formData.set('_subject', `Immigrate to Brazil inquiry (${context})`);
    formData.set('locale', locale);

    try {
      const response = await fetch(siteConfig.contact.formspreeEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Formspree request failed');
      }

      form.reset();
      setErrors({});
      setStatus('success');
      startedAt.current = Date.now();
      trackAnalyticsEvent('generate_lead', {
        form_context: context,
        locale,
        method: 'form',
      });
    } catch {
      setStatus('error');
      setErrorMessage(copy.failure);
      trackAnalyticsEvent('form_submit_error', { form_context: context, locale });
    }
  }

  const isSubmitting = status === 'submitting';

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
      {title ? <h2 className="font-display text-3xl text-ink-900">{title}</h2> : null}
      {subtitle ? <p className="mt-2 text-sm text-ink-700">{subtitle}</p> : null}

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-700" htmlFor={`name-${context}`}>
            {copy.name}
          </label>
          <input
            id={`name-${context}`}
            name="name"
            type="text"
            autoComplete="name"
            required
            className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
          />
          {errors.name ? <p className="mt-1 text-xs text-rose-700">{errors.name}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-700" htmlFor={`email-${context}`}>
            {copy.email}
          </label>
          <input
            id={`email-${context}`}
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
          />
          {errors.email ? <p className="mt-1 text-xs text-rose-700">{errors.email}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-700" htmlFor={`phone-${context}`}>
            {copy.phone}
          </label>
          <input
            id={`phone-${context}`}
            name="phone"
            type="text"
            autoComplete="tel"
            className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-700" htmlFor={`service-${context}`}>
            {copy.service}
          </label>
          <input
            id={`service-${context}`}
            name="service"
            type="text"
            className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-700" htmlFor={`message-${context}`}>
            {copy.message}
          </label>
          <textarea
            id={`message-${context}`}
            name="message"
            rows={5}
            required
            className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
          />
          {errors.message ? <p className="mt-1 text-xs text-rose-700">{errors.message}</p> : null}
        </div>

        <input type="hidden" name="_gotcha" tabIndex={-1} autoComplete="off" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-full bg-civic-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-civic-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? copy.sending : copy.send}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="mt-4 min-h-[24px]">
        {status === 'success' ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{copy.success}</p>
        ) : null}
        {status === 'error' && errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
