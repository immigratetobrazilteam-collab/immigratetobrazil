'use client';

import { FormEvent, useRef, useState } from 'react';

import { trackAnalyticsEvent } from '@/lib/analytics-events';
import type { Locale } from '@/lib/types';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file';
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  options?: ReadonlyArray<{ label: string; value: string }>;
  description?: string;
  minLength?: number;
};

interface FormspreeDynamicFormProps {
  locale: Locale;
  endpoint: string;
  context: string;
  fields: FormField[];
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
  spamMessage: string;
  uploadNotPermittedMessage?: string;
  subject?: string;
  className?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function normalizeFieldValue(value: FormDataEntryValue | null) {
  if (value instanceof File) {
    return value.name ? value : null;
  }
  return String(value || '').trim();
}

export function FormspreeDynamicForm({
  locale,
  endpoint,
  context,
  fields,
  submitLabel,
  submittingLabel,
  successMessage,
  errorMessage,
  spamMessage,
  uploadNotPermittedMessage,
  subject,
  className,
}: FormspreeDynamicFormProps) {
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorBanner, setErrorBanner] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get('_gotcha') || '').trim();
    const websiteTrap = String(formData.get('website') || '').trim();

    // Basic anti-bot checks: hidden fields + minimum fill time.
    if (honeypot || websiteTrap || Date.now() - startedAt.current < 1800) {
      setStatus('error');
      setErrorBanner(spamMessage);
      trackAnalyticsEvent('form_spam_blocked', { form_context: context, locale });
      return;
    }

    const nextErrors: Record<string, string> = {};

    // Field-level validation driven by the schema passed to this component.
    for (const field of fields) {
      const value = normalizeFieldValue(formData.get(field.name));

      if (field.required) {
        const hasValue = value instanceof File ? true : typeof value === 'string' ? value.length > 0 : false;
        if (!hasValue) {
          nextErrors[field.name] = locale === 'pt' ? 'Este campo e obrigatorio.' : 'This field is required.';
          continue;
        }
      }

      if (field.type === 'email' && typeof value === 'string' && value && !EMAIL_REGEX.test(value)) {
        nextErrors[field.name] = locale === 'pt' ? 'Informe um e-mail valido.' : 'Please enter a valid email.';
      }

      if (field.minLength && typeof value === 'string' && value.length > 0 && value.length < field.minLength) {
        nextErrors[field.name] =
          locale === 'pt'
            ? `Use pelo menos ${field.minLength} caracteres.`
            : `Please use at least ${field.minLength} characters.`;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus('error');
      setErrorBanner(errorMessage);
      trackAnalyticsEvent('form_validation_error', {
        form_context: context,
        locale,
        error_count: Object.keys(nextErrors).length,
      });
      return;
    }

    setErrors({});
    setErrorBanner('');
    setStatus('submitting');

    formData.set('locale', locale);
    if (subject) {
      formData.set('_subject', subject);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        let fallback = errorMessage;
        try {
          const payload = await response.json();
          const providerError = String(payload?.error || '').toLowerCase();
          if (providerError.includes('file uploads not permitted') && uploadNotPermittedMessage) {
            fallback = uploadNotPermittedMessage;
          }
        } catch {
          // Keep generic fallback when provider response is not JSON.
        }
        throw new Error(fallback);
      }

      form.reset();
      startedAt.current = Date.now();
      setStatus('success');
      trackAnalyticsEvent('generate_lead', {
        form_context: context,
        locale,
        method: 'form',
      });
    } catch (error) {
      setStatus('error');
      setErrorBanner(error instanceof Error ? error.message : errorMessage);
      trackAnalyticsEvent('form_submit_error', {
        form_context: context,
        locale,
      });
    }
  }

  const isSubmitting = status === 'submitting';

  return (
    <div className={className || ''}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        {fields.map((field) => {
          const id = `${context}-${field.name}`;
          const hasError = Boolean(errors[field.name]);
          const isTextarea = field.type === 'textarea';
          const isFile = field.type === 'file';
          const isSelect = field.type === 'select';
          const colClass = isTextarea || isFile || isSelect ? 'sm:col-span-2' : '';

          return (
            <div key={field.name} className={colClass}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-700" htmlFor={id}>
                {field.label}
              </label>

              {field.description ? <p className="mb-1.5 text-xs text-ink-600">{field.description}</p> : null}

              {isTextarea ? (
                <textarea
                  id={id}
                  name={field.name}
                  rows={field.rows || 5}
                  required={field.required}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${id}-error` : undefined}
                  className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
                />
              ) : null}

              {isSelect ? (
                <select
                  id={id}
                  name={field.name}
                  required={field.required}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${id}-error` : undefined}
                  defaultValue=""
                  className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
                >
                  <option value="" disabled>
                    {field.placeholder || (locale === 'pt' ? 'Selecione' : 'Select')}
                  </option>
                  {(field.options || []).map((option) => (
                    <option key={`${field.name}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}

              {isFile ? (
                <input
                  id={id}
                  name={field.name}
                  type="file"
                  accept={field.accept}
                  multiple={field.multiple}
                  required={field.required}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${id}-error` : undefined}
                  className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 file:mr-3 file:rounded-lg file:border-0 file:bg-civic-700 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-civic-800"
                />
              ) : null}

              {!isTextarea && !isSelect && !isFile ? (
                <input
                  id={id}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${id}-error` : undefined}
                  className="w-full rounded-xl border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-civic-500 focus:bg-white"
                />
              ) : null}

              {hasError ? (
                <p id={`${id}-error`} className="mt-1 text-xs text-rose-700">
                  {errors[field.name]}
                </p>
              ) : null}
            </div>
          );
        })}

        <input type="hidden" name="_gotcha" tabIndex={-1} autoComplete="off" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-full bg-civic-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-civic-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="mt-4 min-h-[24px]">
        {status === 'success' ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{successMessage}</p>
        ) : null}
        {status === 'error' && errorBanner ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{errorBanner}</p>
        ) : null}
      </div>
    </div>
  );
}

export type { FormField };
