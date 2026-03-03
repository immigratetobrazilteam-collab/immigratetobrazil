#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { buildContentSources, buildEditorial, buildFactuality } from './rewrite-sources-en.mjs';

const root = process.cwd();
const managedLegacyRoot = path.join(root, 'content', 'cms', 'managed-legacy', 'en');
const discoverRoot = path.join(root, 'content', 'cms', 'discover-pages', 'en');
const siteCopyPath = path.join(root, 'content', 'cms', 'site-copy', 'en.json');
const artifactsRoot = path.join(root, 'artifacts', 'content-rewrite');

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');

const GENERIC_MARKERS = [
  'Eligibility check',
  'This page outlines key checkpoints',
  'Visa, residency, housing, and daily-life guidance tailored for',
  'Legacy discover source migrated to managed content',
];

function listJsonFiles(dir, out = []) {
  return fs.readdir(dir, { withFileTypes: true }).then(async (entries) => {
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await listJsonFiles(full, out);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        out.push(full);
      }
    }
    return out;
  });
}

function cleanToken(value) {
  return value
    .replace(/\b(move|to|services|service|visas|visa|residencies|residency|about|blog|faq|contact|brazil|state|region)\b/gi, ' ')
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleize(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function extractPlaceFromSlug(slug) {
  const parts = slug.split('/').filter(Boolean);
  const tail = parts[parts.length - 1] || slug;
  const cleaned = cleanToken(tail);
  return titleize(cleaned || parts[parts.length - 1] || 'Brazil');
}

function textHasGenericMarker(text) {
  const normalized = String(text || '').toLowerCase();
  return GENERIC_MARKERS.some((marker) => normalized.includes(marker.toLowerCase()));
}

function shouldRewriteManagedLegacy(page) {
  const text = [page.title, page.description, ...(page.sections || []).flatMap((s) => [s.title, ...(s.paragraphs || [])])].join(' ');
  return textHasGenericMarker(text);
}

function buildServiceSections(page) {
  const place = extractPlaceFromSlug(page.slug || page.pathname || page.title || 'Brazil');
  const serviceName = (page.heading || page.title || 'Immigration service').replace(/\s*[-|].*$/, '').trim();
  return [
    {
      title: 'Eligibility and scope',
      paragraphs: [
        `${serviceName} in ${place} is suitable for applicants whose objective matches the legal pathway described by Brazilian immigration authorities.`,
        'This guidance is informational and should be confirmed against your nationality, travel history, and supporting records before filing.',
      ],
    },
    {
      title: 'Required documents',
      paragraphs: [
        'Core documents usually include a valid passport, civil records, purpose-specific supporting evidence, and certified translations/apostilles when required.',
        'Always validate document validity windows and signature/notarization requirements before scheduling official appointments.',
      ],
    },
    {
      title: 'Document quality controls',
      paragraphs: [
        'Use consistent spellings, dates, and identifiers across all forms and supporting records to reduce mismatch flags.',
        'Prepare scanned copies in a structured evidence packet so supplementary requests can be answered quickly.',
      ],
    },
    {
      title: 'Process roadmap',
      paragraphs: [
        '1) Pre-screen eligibility and evidence quality. 2) Assemble and validate dossier. 3) Submit through consular/federal channel. 4) Track requests and respond quickly. 5) Complete post-approval registration obligations.',
        'Keep scanned copies and a dated checklist for every submission and receipt to reduce rework risk.',
      ],
    },
    {
      title: 'Submission channels',
      paragraphs: [
        'Submission routes can vary between consular intake, in-country filings, and authority-specific digital portals.',
        'Confirm jurisdiction rules before submitting to avoid restarting under the wrong authority.',
      ],
    },
    {
      title: 'Timelines and cost framework',
      paragraphs: [
        'Timelines vary by category, authority workload, and document quality. Plan for procedural delays and avoid fixed travel commitments before approval.',
        'Separate government/consular fees from professional preparation support, translation, legalization, and logistics expenses.',
      ],
    },
    {
      title: 'Budget planning',
      paragraphs: [
        'Budget for preparation, filing, translation, travel, and contingency costs rather than only the headline filing fee.',
        'Track expected vs actual expenses to avoid mid-process funding gaps.',
      ],
    },
    {
      title: 'Post-approval obligations',
      paragraphs: [
        'After approval, complete all registration and compliance steps within legal deadlines to protect status validity.',
        'Store proof of each completed post-arrival action in a dated compliance file.',
      ],
    },
    {
      title: 'Risk controls and legal escalation',
      paragraphs: [
        'Common refusal triggers include incomplete evidence, inconsistent declarations, missed deadlines, and unsupported eligibility assumptions.',
        'Escalate to licensed legal counsel when your case involves prior refusals, compliance concerns, or complex family/employment structures.',
      ],
    },
    {
      title: 'Common refusal triggers',
      paragraphs: [
        'Frequent refusal patterns include unverifiable purpose evidence, incomplete civil records, and filing outside the proper jurisdiction.',
        'Address red flags before submission rather than relying on late corrective filings.',
      ],
    },
    {
      title: 'Escalation checklist',
      paragraphs: [
        'Escalate when deadlines are missed, adverse notices are issued, or your case includes prior immigration complications.',
        'Prepare a chronology, document index, and all authority correspondence before legal escalation.',
      ],
    },
    {
      title: 'Internal links and next routes',
      paragraphs: [
        'Next steps typically include consultation planning, process timeline review, and policy-page checks for terms and privacy obligations.',
      ],
    },
    {
      title: 'Important disclaimer',
      paragraphs: [
        'No advisory service can guarantee approval. Final decisions are made solely by competent Brazilian authorities under current law and policy.',
      ],
    },
  ];
}

function buildGeneralSections(page) {
  const place = extractPlaceFromSlug(page.slug || page.pathname || page.title || 'Brazil');
  const title = page.heading || page.title || place;
  return [
    {
      title: 'Overview',
      paragraphs: [
        `${title} provides structured immigration planning context for ${place}.`,
        'Use this page as a decision aid, then verify time-sensitive requirements with official sources before acting.',
      ],
    },
    {
      title: 'How to use this page',
      paragraphs: [
        'Confirm eligibility assumptions first, then map documentation and timeline dependencies in order of legal priority.',
        'Track each requirement with dated proof to avoid preventable process delays.',
      ],
    },
    {
      title: 'Next actions',
      paragraphs: [
        'Create a route-specific checklist, schedule consultations only after document pre-validation, and keep contingency time for authority responses.',
      ],
    },
  ];
}

function buildDiscoverSeo(page, place) {
  const title = `Move to ${place}: visa, housing, and relocation guide`;
  const description = `Practical relocation guide for ${place} covering visa workflow, documents, housing setup, costs, and first-90-day compliance steps.`;
  return {
    metaTitle: title.slice(0, 65),
    metaDescription: description.slice(0, 160),
    keywords: dedupe([
      `move to ${place.toLowerCase()}`,
      'brazil immigration guide',
      'brazil visa planning',
      `${place.toLowerCase()} housing`,
      'relocation checklist brazil',
    ]).slice(0, 8),
    seoV2: {
      primaryKeyword: `move to ${place.toLowerCase()}`,
      secondaryKeywords: dedupe([
        'brazil relocation',
        'brazil visa process',
        `${place.toLowerCase()} cost of living`,
        `${place.toLowerCase()} neighborhoods`,
      ]).slice(0, 8),
      searchIntent: 'informational-transactional',
      snippetAnswer: `To move to ${place}, start with visa eligibility, document validation, housing due diligence, and a compliance checklist for your first 90 days in Brazil.`,
    },
  };
}

function dedupe(arr) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const key = String(item).trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(String(item).trim());
  }
  return out;
}

function rewriteManagedLegacy(page) {
  const isService = String(page.slug || '').startsWith('services/');
  const place = extractPlaceFromSlug(page.slug || page.pathname || page.title || 'Brazil');
  const sections = isService ? buildServiceSections(page) : buildGeneralSections(page);

  page.sections = sections;
  page.description = isService
    ? `Structured ${page.heading || page.title || 'immigration'} guidance for ${place}, including eligibility, documents, timeline, and compliance checkpoints.`.slice(0, 160)
    : `Practical immigration planning guidance for ${place} with actionable next steps and compliance-aware recommendations.`.slice(0, 160);
  page.bullets = dedupe([
    `Route planning for ${place}`,
    'Document readiness',
    'Timeline and fee structure',
    'Risk and compliance controls',
  ]);

  page.contentSources = buildContentSources({ slug: page.slug || page.pathname || '', family: isService ? 'services' : 'general' });
  page.factuality = buildFactuality();
  page.editorial = buildEditorial({ primaryIntent: isService ? 'service-conversion' : 'education' });
  page.seoV2 = {
    primaryKeyword: `${(page.heading || page.title || 'brazil immigration').toLowerCase()} brazil`,
    secondaryKeywords: dedupe(['brazil immigration support', 'visa checklist', 'residency documents', place.toLowerCase()]).slice(0, 8),
    searchIntent: isService ? 'transactional' : 'informational',
    snippetAnswer: `Use this ${isService ? 'service' : 'guidance'} page to validate eligibility, prepare supporting evidence, and plan your next legal step in Brazil.`,
  };
}

function sectionSummaryForDiscover(heading, place) {
  const h = heading.toLowerCase();
  if (h.includes('quick facts')) return `Core orientation points for settling in ${place} safely and efficiently.`;
  if (h.includes('arrival')) return `Execution checklist for the first weeks after arriving in ${place}.`;
  if (h.includes('housing')) return `How to evaluate rentals, neighborhoods, and budget reliability in ${place}.`;
  if (h.includes('cost')) return `Budget structure for rent, utilities, transport, and recurring setup costs.`;
  if (h.includes('visa') || h.includes('residency')) return `Legal pathway planning for visa and residency compliance tied to ${place}.`;
  return `Operational relocation guidance for ${place} with practical decision points.`;
}

function rewriteDiscoverPage(page) {
  const place = extractPlaceFromSlug(page.slug || page.pathname || page.title || 'Brazil');

  page.heroIntro = `Relocation guide for ${place} with step-by-step visa planning, document preparation, housing due diligence, and first-90-day compliance actions.`;
  page.sourceUpdatedLabel = 'Managed rewrite with mixed-source verification metadata';

  page.sections = (page.sections || []).map((section) => {
    const next = { ...section };
    next.summary = sectionSummaryForDiscover(section.heading || '', place);
    if (!Array.isArray(next.blocks) || next.blocks.length === 0) {
      next.blocks = [{ type: 'paragraph', text: `Use this section to plan and execute relocation tasks for ${place} with documented checkpoints.` }];
    }
    return next;
  });

  if (!Array.isArray(page.faq) || page.faq.length < 3) {
    page.faq = [
      {
        question: `What is the first step to relocate to ${place}?`,
        answer: 'Start by selecting the correct visa route and validating required documents before booking non-refundable travel.',
      },
      {
        question: 'How should I budget my first 90 days?',
        answer: 'Separate one-time setup costs from monthly living costs and hold a contingency buffer for document and housing delays.',
      },
      {
        question: 'When should I use legal support?',
        answer: 'Use licensed legal support for complex cases, prior refusals, or any uncertainty around eligibility and compliance timelines.',
      },
    ];
  }

  const seo = buildDiscoverSeo(page, place);
  page.seo = {
    ...page.seo,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    keywords: seo.keywords,
  };

  page.contentSources = buildContentSources({ slug: page.slug || page.pathname || '', family: 'discover' });
  page.factuality = buildFactuality();
  page.editorial = buildEditorial({ primaryIntent: 'relocation-research' });
  page.seoV2 = seo.seoV2;
}

function rewriteManagedPages(site) {
  const pages = site.managedPages || {};
  const rewriteString = (value, replacement) => (typeof value === 'string' ? replacement : value);

  for (const [key, value] of Object.entries(pages)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

    if ('title' in value) value.title = rewriteString(value.title, String(value.title).replace(/Immigrate to Brazil/gi, 'Immigration Planning for Brazil'));
    if ('subtitle' in value)
      value.subtitle = rewriteString(
        value.subtitle,
        'Actionable, compliance-aware guidance for visas, residency, and relocation execution in Brazil.',
      );

    if ('description' in value && typeof value.description === 'string') {
      value.description = 'Use this page to move from research to execution with legal-risk controls, document strategy, and next-step links.';
    }

    value.contentSources = buildContentSources({ slug: `managedPages/${key}`, family: key.includes('policy') ? 'policy' : 'general' });
    value.factuality = buildFactuality();
    value.editorial = buildEditorial({ primaryIntent: 'navigation-and-conversion' });

    if (!value.seoV2) {
      value.seoV2 = {
        primaryKeyword: `${key.replace(/[A-Z]/g, (m) => ` ${m.toLowerCase()}`).trim()} brazil`,
        secondaryKeywords: ['brazil immigration', 'visa and residency', 'relocation planning'],
        searchIntent: 'informational',
        snippetAnswer: 'This page provides practical and structured immigration planning guidance for Brazil.',
      };
    }
  }

  site.managedPages = pages;
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const artifactDir = path.join(artifactsRoot, timestamp);

  const rewritten = {
    managedLegacy: 0,
    discover: 0,
    siteCopy: 0,
    files: [],
    mode: apply ? 'apply' : 'dry-run',
  };

  const managedFiles = (await listJsonFiles(managedLegacyRoot)).filter((file) => !file.endsWith('_manifest.json'));

  for (const file of managedFiles) {
    const raw = await fs.readFile(file, 'utf8');
    const page = JSON.parse(raw);
    if (shouldRewriteManagedLegacy(page)) {
      rewriteManagedLegacy(page);
      rewritten.managedLegacy += 1;
    } else {
      const isService = String(page.slug || '').startsWith('services/');
      if (!Array.isArray(page.sections) || page.sections.length < (isService ? 11 : 3)) {
        page.sections = isService ? buildServiceSections(page) : buildGeneralSections(page);
      }
      page.contentSources = buildContentSources({ slug: page.slug || page.pathname || '', family: isService ? 'services' : 'general' });
      page.factuality = buildFactuality();
      page.editorial = buildEditorial({ primaryIntent: isService ? 'service-conversion' : 'education' });
      if (!page.seoV2) {
        const place = extractPlaceFromSlug(page.slug || page.pathname || page.title || 'Brazil');
        page.seoV2 = {
          primaryKeyword: `${(page.heading || page.title || 'brazil immigration').toLowerCase()} brazil`,
          secondaryKeywords: dedupe(['brazil immigration support', 'visa checklist', 'residency documents', place.toLowerCase()]).slice(0, 8),
          searchIntent: isService ? 'transactional' : 'informational',
          snippetAnswer: 'Use this page to validate eligibility, prepare evidence, and plan next legal actions in Brazil.',
        };
      }
    }

    rewritten.files.push(path.relative(root, file));
    if (apply) {
      await writeJson(file, page);
    }
  }

  const discoverFiles = (await listJsonFiles(discoverRoot)).filter((file) => {
    const base = path.basename(file);
    return !base.startsWith('_');
  });

  for (const file of discoverFiles) {
    const raw = await fs.readFile(file, 'utf8');
    const page = JSON.parse(raw);
    const needsRewrite = textHasGenericMarker(`${page.heroIntro || ''} ${(page.sourceUpdatedLabel || '')}`);
    if (needsRewrite) {
      rewriteDiscoverPage(page);
      rewritten.discover += 1;
    } else {
      page.contentSources = buildContentSources({ slug: page.slug || page.pathname || '', family: 'discover' });
      page.factuality = buildFactuality();
      page.editorial = buildEditorial({ primaryIntent: 'relocation-research' });
      if (!page.seoV2) {
        const place = extractPlaceFromSlug(page.slug || page.pathname || page.title || 'Brazil');
        page.seoV2 = buildDiscoverSeo(page, place).seoV2;
      }
    }
    rewritten.files.push(path.relative(root, file));
    if (apply) {
      await writeJson(file, page);
    }
  }

  const siteCopyRaw = await fs.readFile(siteCopyPath, 'utf8');
  const siteCopy = JSON.parse(siteCopyRaw);
  rewriteManagedPages(siteCopy);
  rewritten.siteCopy = Object.keys(siteCopy.managedPages || {}).length;
  rewritten.files.push(path.relative(root, siteCopyPath));

  if (apply) {
    await writeJson(siteCopyPath, siteCopy);
  }

  await fs.mkdir(artifactDir, { recursive: true });
  await fs.writeFile(path.join(artifactDir, 'rewrite-summary.json'), `${JSON.stringify(rewritten, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(artifactDir, 'rewritten-files.txt'), `${rewritten.files.join('\n')}\n`, 'utf8');

  console.log(`rewrite-content-en complete (${rewritten.mode})`);
  console.log(`managed-legacy rewritten: ${rewritten.managedLegacy}`);
  console.log(`discover rewritten: ${rewritten.discover}`);
  console.log(`site managedPages touched: ${rewritten.siteCopy}`);
  console.log(`artifact: ${path.relative(root, artifactDir)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
