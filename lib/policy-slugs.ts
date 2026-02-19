export const POLICY_SLUGS = ['privacy', 'terms', 'cookies', 'gdpr', 'refund', 'disclaimers'] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];
