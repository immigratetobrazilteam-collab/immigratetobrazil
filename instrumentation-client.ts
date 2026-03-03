import * as Sentry from '@sentry/nextjs';
import { resolveSentryDsn, resolveSentrySampleRate } from '@/lib/sentry-runtime-config';

const dsn = resolveSentryDsn(process.env.NEXT_PUBLIC_SENTRY_DSN, process.env.SENTRY_DSN);
const tracesSampleRate = resolveSentrySampleRate(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || process.env.SENTRY_TRACES_SAMPLE_RATE,
);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate,
    enabled: true,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production',
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
