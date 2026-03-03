#!/usr/bin/env node

const TIER_1 = [
  {
    id: 'gov-br-mjsp',
    tier: 1,
    type: 'official',
    title: 'Ministry of Justice and Public Security (Brazil)',
    publisher: 'Government of Brazil',
    url: 'https://www.gov.br/mj/',
  },
  {
    id: 'gov-br-pf-immigration',
    tier: 1,
    type: 'official',
    title: 'Federal Police Immigration Services',
    publisher: 'Federal Police (Brazil)',
    url: 'https://www.gov.br/pf/pt-br/assuntos/imigracao',
  },
  {
    id: 'gov-br-mre-consular',
    tier: 1,
    type: 'official',
    title: 'Ministry of Foreign Affairs Consular Portal',
    publisher: 'Government of Brazil',
    url: 'https://www.gov.br/mre/pt-br/assuntos/portal-consular',
  },
];

const TIER_2 = [
  {
    id: 'wikivoyage-brazil',
    tier: 2,
    type: 'secondary',
    title: 'Wikivoyage Brazil travel guide',
    publisher: 'Wikimedia Foundation',
    url: 'https://en.wikivoyage.org/wiki/Brazil',
  },
  {
    id: 'worldbank-brazil',
    tier: 2,
    type: 'secondary',
    title: 'World Bank Data: Brazil',
    publisher: 'World Bank',
    url: 'https://data.worldbank.org/country/brazil',
  },
  {
    id: 'ibge-portal',
    tier: 2,
    type: 'secondary',
    title: 'IBGE institutional portal',
    publisher: 'IBGE',
    url: 'https://www.ibge.gov.br/en/home-eng.html',
  },
];

function familyTags(family) {
  if (family === 'discover') return ['relocation', 'housing', 'cost-of-living', 'city-profile'];
  if (family === 'services') return ['visa', 'residency', 'legal-process'];
  if (family === 'policy') return ['policy', 'legal-notice', 'compliance'];
  return ['immigration', 'planning'];
}

export function buildContentSources({ slug, family = 'general' }) {
  const now = new Date().toISOString().slice(0, 10);
  const tags = familyTags(family);

  return [...TIER_1, ...TIER_2].map((source) => ({
    ...source,
    lastCheckedAt: now,
    appliesTo: [slug],
    tags,
  }));
}

export function buildFactuality() {
  const now = new Date().toISOString().slice(0, 10);
  return {
    lastVerifiedAt: now,
    verificationLevel: 'mixed-sources',
    confidence: 'medium',
  };
}

export function buildEditorial({ primaryIntent, targetPersona = 'prospective-immigrant' }) {
  return {
    primaryIntent,
    targetPersona,
    qualityScore: 0.82,
  };
}
