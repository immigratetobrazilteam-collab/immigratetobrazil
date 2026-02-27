const PLACEHOLDER_DSN_PATTERNS = [/^your[_-]/i, /^replace-with/i, /^https?:\/\/example\./i];

export function resolveSentryDsn(...candidates: Array<string | undefined>): string | undefined {
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (!value) continue;
    if (PLACEHOLDER_DSN_PATTERNS.some((pattern) => pattern.test(value))) continue;

    try {
      const parsed = new URL(value);
      const host = parsed.hostname.toLowerCase();
      const looksLikeSentryHost = host.endsWith('sentry.io') || host.includes('.ingest.sentry.io');
      if (!looksLikeSentryHost) continue;
      return value;
    } catch {
      continue;
    }
  }

  return undefined;
}

export function resolveSentrySampleRate(value: string | undefined, fallback = 0.1): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) return fallback;
  return parsed;
}
