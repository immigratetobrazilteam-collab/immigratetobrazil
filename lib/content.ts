import type { BlogHighlight, Locale, ProcessStep, ServiceCard, StatItem } from '@/lib/types';

import { getSiteCmsCopy } from './site-cms-content';

export function getTrustStats(locale: Locale): StatItem[] {
  return getSiteCmsCopy(locale).trustStats;
}

export function getServiceCards(locale: Locale): ServiceCard[] {
  return getSiteCmsCopy(locale).serviceCards;
}

export function getProcessSteps(locale: Locale): ProcessStep[] {
  return getSiteCmsCopy(locale).processSteps;
}

export function getBlogHighlights(locale: Locale): BlogHighlight[] {
  return getSiteCmsCopy(locale).blogHighlights;
}
