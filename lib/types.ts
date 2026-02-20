export type Locale = 'en' | 'es' | 'pt' | 'fr';

export interface NavLink {
  href: string;
  label: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface ServiceCard {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface BlogHighlight {
  slug: string;
  title: string;
  summary: string;
}

export interface LegacySection {
  title: string;
  paragraphs: string[];
}

export interface LegacyDocument {
  sourcePath: string;
  title: string;
  description: string;
  heading: string;
  heroImage?: string;
  heroImageAlt?: string;
  sections: LegacySection[];
  bullets: string[];
}
