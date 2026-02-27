'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-sand-50 text-ink-900">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-5 px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-civic-700">Unexpected Error</p>
          <h1 className="font-display text-4xl">Something went wrong.</h1>
          <p className="max-w-prose text-sm text-ink-700">
            The incident has been logged. Please retry, and if the issue persists, contact support with the time and page you were on.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-sand-50"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

