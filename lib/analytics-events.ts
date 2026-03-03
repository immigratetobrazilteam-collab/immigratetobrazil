type AnalyticsParam = string | number | boolean;

export type AnalyticsEventParams = Record<string, AnalyticsParam | null | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, eventParams?: Record<string, AnalyticsParam>) => void;
  }
}

function sanitizeParams(params?: AnalyticsEventParams): Record<string, AnalyticsParam> {
  if (!params) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, AnalyticsParam] => {
      const value = entry[1];
      return value !== undefined && value !== null && value !== '';
    }),
  );
}

export function trackAnalyticsEvent(eventName: string, params?: AnalyticsEventParams) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, sanitizeParams(params));
}
