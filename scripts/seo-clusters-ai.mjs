import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const locales = ['en', 'es', 'pt', 'fr'];

const defaultStateSlugs = [
  'sao-paulo',
  'rio-de-janeiro',
  'minas-gerais',
  'bahia',
  'parana',
  'santa-catarina',
  'rio-grande-do-sul',
  'distrito-federal',
  'goias',
  'pernambuco',
  'ceara',
  'espirito-santo',
];

const localeLabels = {
  en: {
    region: {
      north: 'North Region',
      northeast: 'Northeast Region',
      'central-west': 'Central-West Region',
      southeast: 'Southeast Region',
      south: 'South Region',
    },
    keywordPrefix: 'immigrate to',
    titleSuffix: 'immigration and relocation guide',
    subtitlePrefix: 'Practical relocation strategy for',
    subtitleSuffix: 'with focus on legal setup, costs, and first 90 days.',
    secondaryKeywordPhrases: ['residency', 'visa process', 'cost of living'],
    contextTitle: 'Local context',
    riskTitle: 'Risk and opportunity map',
    executionTitle: 'Execution sequence',
    contextDetail: 'How housing, services, and onboarding work in {{state}}.',
    riskDetail: 'What to validate before signing contracts or committing capital in {{state}}.',
    executionDetail: 'Step-by-step plan for arrival, legal setup, and first 90 days in {{state}}.',
    summaryHeading: 'SEO cluster plan',
  },
  es: {
    region: {
      north: 'Region Norte',
      northeast: 'Region Nordeste',
      'central-west': 'Region Centro-Oeste',
      southeast: 'Region Sudeste',
      south: 'Region Sur',
    },
    keywordPrefix: 'inmigrar a',
    titleSuffix: 'guia de inmigracion y reubicacion',
    subtitlePrefix: 'Estrategia practica de reubicacion para',
    subtitleSuffix: 'con foco en regularizacion legal, costos y primeros 90 dias.',
    secondaryKeywordPhrases: ['residencia', 'proceso de visa', 'costo de vida'],
    contextTitle: 'Contexto local',
    riskTitle: 'Riesgos y oportunidades',
    executionTitle: 'Secuencia de ejecucion',
    contextDetail: 'Como funcionan vivienda, servicios e instalacion en {{state}}.',
    riskDetail: 'Que validar antes de firmar contratos o comprometer capital en {{state}}.',
    executionDetail: 'Plan por etapas para llegada, regularizacion y primeros 90 dias en {{state}}.',
    summaryHeading: 'Plan SEO por clusters',
  },
  pt: {
    region: {
      north: 'Regiao Norte',
      northeast: 'Regiao Nordeste',
      'central-west': 'Regiao Centro-Oeste',
      southeast: 'Regiao Sudeste',
      south: 'Regiao Sul',
    },
    keywordPrefix: 'imigrar para',
    titleSuffix: 'guia de imigracao e mudanca',
    subtitlePrefix: 'Estrategia pratica de mudanca para',
    subtitleSuffix: 'com foco em regularizacao legal, custos e primeiros 90 dias.',
    secondaryKeywordPhrases: ['residencia', 'processo de visto', 'custo de vida'],
    contextTitle: 'Contexto local',
    riskTitle: 'Riscos e oportunidades',
    executionTitle: 'Sequencia de execucao',
    contextDetail: 'Como moradia, servicos e adaptacao funcionam em {{state}}.',
    riskDetail: 'O que validar antes de assinar contratos ou comprometer capital em {{state}}.',
    executionDetail: 'Plano em etapas para chegada, regularizacao e primeiros 90 dias em {{state}}.',
    summaryHeading: 'Plano SEO por clusters',
  },
  fr: {
    region: {
      north: 'Region Nord',
      northeast: 'Region Nord-Est',
      'central-west': 'Region Centre-Ouest',
      southeast: 'Region Sud-Est',
      south: 'Region Sud',
    },
    keywordPrefix: 'immigrer au',
    titleSuffix: 'guide immigration et relocalisation',
    subtitlePrefix: 'Strategie pratique de relocalisation pour',
    subtitleSuffix: 'avec focus sur regularisation legale, couts et 90 premiers jours.',
    secondaryKeywordPhrases: ['residence', 'processus visa', 'cout de la vie'],
    contextTitle: 'Contexte local',
    riskTitle: 'Risques et opportunites',
    executionTitle: "Sequence d'execution",
    contextDetail: "Comment logement, services et integration fonctionnent a {{state}}.",
    riskDetail: 'Que verifier avant de signer des contrats ou engager du capital a {{state}}.',
    executionDetail: 'Plan par etapes pour arrivee, regularisation et 90 premiers jours a {{state}}.',
    summaryHeading: 'Plan SEO par clusters',
  },
};

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

function timestampFolder(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function normalizeHost(host) {
  return host.replace(/\/$/, '');
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function hashSeed(input) {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

function renderTemplate(input, state, locale) {
  const labels = localeLabels[locale];
  const tokens = {
    state: state[locale],
    region: labels.region[state.region],
    capital: state.capital,
  };

  return input.replace(/{{\s*(state|region|capital)\s*}}/g, (_match, key) => tokens[key] || '');
}

function parseArgs(argv) {
  const options = {
    apply: false,
    days: Number(process.env.SEO_CLUSTER_DAYS || 90),
    limitStates: Number(process.env.SEO_CLUSTER_LIMIT_STATES || 12),
    model: cleanText(process.env.OLLAMA_MODEL) || 'llama3.1:8b',
    ollamaHost: normalizeHost(cleanText(process.env.OLLAMA_HOST) || 'http://127.0.0.1:11434'),
    useOllama: process.env.SEO_CLUSTER_USE_OLLAMA !== 'false',
    localeList: locales.slice(),
    stateSlugs: cleanText(process.env.SEO_CLUSTER_STATE_SLUGS)
      ? cleanText(process.env.SEO_CLUSTER_STATE_SLUGS)
          .split(',')
          .map((slug) => slug.trim())
          .filter(Boolean)
      : [],
    outDir: '',
  };

  for (let idx = 0; idx < argv.length; idx += 1) {
    const arg = argv[idx];

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }
    if (arg === '--no-ollama') {
      options.useOllama = false;
      continue;
    }
    if (arg === '--days' && argv[idx + 1]) {
      options.days = Number(argv[idx + 1]);
      idx += 1;
      continue;
    }
    if (arg === '--limit-states' && argv[idx + 1]) {
      options.limitStates = Number(argv[idx + 1]);
      idx += 1;
      continue;
    }
    if (arg === '--model' && argv[idx + 1]) {
      options.model = cleanText(argv[idx + 1]) || options.model;
      idx += 1;
      continue;
    }
    if (arg === '--ollama-host' && argv[idx + 1]) {
      options.ollamaHost = normalizeHost(cleanText(argv[idx + 1]) || options.ollamaHost);
      idx += 1;
      continue;
    }
    if (arg === '--locale' && argv[idx + 1]) {
      const value = cleanText(argv[idx + 1]);
      options.localeList = value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
      idx += 1;
      continue;
    }
    if (arg === '--states' && argv[idx + 1]) {
      const value = cleanText(argv[idx + 1]);
      options.stateSlugs = value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
      idx += 1;
      continue;
    }
    if (arg === '--out-dir' && argv[idx + 1]) {
      options.outDir = cleanText(argv[idx + 1]);
      idx += 1;
    }
  }

  if (!Number.isFinite(options.days) || options.days < 14) {
    throw new Error('--days must be a number >= 14');
  }
  if (!Number.isFinite(options.limitStates) || options.limitStates < 1) {
    throw new Error('--limit-states must be a number >= 1');
  }

  for (const locale of options.localeList) {
    if (!locales.includes(locale)) {
      throw new Error(`Unsupported locale '${locale}'. Allowed: ${locales.join(', ')}`);
    }
  }

  return options;
}

async function readJson(relativePath) {
  const full = path.join(root, relativePath);
  const raw = await readFile(full, 'utf8');
  return JSON.parse(raw);
}

async function writeJsonIfChanged(relativePath, data) {
  const full = path.join(root, relativePath);
  const next = `${JSON.stringify(data, null, 2)}\n`;
  let current = '';
  try {
    current = await readFile(full, 'utf8');
  } catch {
    current = '';
  }

  if (current === next) {
    return false;
  }

  await writeFile(full, next, 'utf8');
  return true;
}

async function loadStates() {
  const raw = await readFile(path.join(root, 'content/curated/states.ts'), 'utf8');
  const regex =
    /\{\s*slug:\s*'([^']+)',\s*code:\s*'([^']+)',\s*en:\s*'([^']+)',\s*fr:\s*'([^']+)',\s*es:\s*'([^']+)',\s*pt:\s*'([^']+)',\s*capital:\s*'([^']+)',\s*region:\s*'([^']+)'\s*\}/g;

  const states = [];
  let match;
  while ((match = regex.exec(raw)) !== null) {
    states.push({
      slug: match[1],
      code: match[2],
      en: match[3],
      fr: match[4],
      es: match[5],
      pt: match[6],
      capital: match[7],
      region: match[8],
    });
  }

  if (states.length < 27) {
    throw new Error('Failed to parse states from content/curated/states.ts');
  }

  return states;
}

async function ollamaIsAvailable(host) {
  try {
    const response = await fetchWithTimeout(`${host}/api/tags`, { method: 'GET' }, 5000);
    return response.ok;
  } catch {
    return false;
  }
}

function fallbackGeneration(locale, state) {
  const labels = localeLabels[locale];
  const stateName = state[locale];
  const keyword = `${labels.keywordPrefix} ${stateName}`.toLowerCase();
  const title = `${stateName}: ${labels.titleSuffix}`;
  const subtitle = `${labels.subtitlePrefix} ${stateName}, ${labels.subtitleSuffix}`;
  const sections = [
    {
      title: labels.contextTitle,
      detail: renderTemplate(labels.contextDetail, state, locale),
    },
    {
      title: labels.riskTitle,
      detail: renderTemplate(labels.riskDetail, state, locale),
    },
    {
      title: labels.executionTitle,
      detail: renderTemplate(labels.executionDetail, state, locale),
    },
  ];

  return {
    blog: {
      title,
      subtitle,
      sections,
    },
    primaryKeyword: keyword,
    secondaryKeywords: [
      `${stateName.toLowerCase()} ${labels.secondaryKeywordPhrases[0]}`,
      `${stateName.toLowerCase()} ${labels.secondaryKeywordPhrases[1]}`,
      `${stateName.toLowerCase()} ${labels.secondaryKeywordPhrases[2]}`,
    ],
    searchIntent: 'informational',
    publishAngle: `Relocation strategy for ${stateName}`,
  };
}

function safeJsonExtract(raw) {
  if (typeof raw !== 'string') return null;

  try {
    return JSON.parse(raw);
  } catch {
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

    const sliced = raw.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(sliced);
    } catch {
      return null;
    }
  }
}

async function generateWithOllama({ host, model, locale, state, timeoutMs }) {
  const labels = localeLabels[locale];
  const stateName = state[locale];
  const prompt = [
    'You are an SEO strategist for an immigration advisory website.',
    'Return one compact JSON object only, no markdown.',
    `Locale: ${locale}. Write in that locale.`,
    `State: ${stateName} (${state.code}), capital: ${state.capital}, region: ${labels.region[state.region]}.`,
    'No legal guarantees. Keep copy practical and specific.',
    'Max title 72 chars. Max subtitle 160 chars.',
    'Need exactly 3 sections with title + detail.',
    'Keys required:',
    'blog.title, blog.subtitle, blog.sections[3].title, blog.sections[3].detail,',
    'primaryKeyword, secondaryKeywords[3], searchIntent, publishAngle',
  ].join('\n');

  const response = await fetchWithTimeout(
    `${host}/api/generate`,
    {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.2,
        top_p: 0.9,
        num_ctx: Number(process.env.OLLAMA_NUM_CTX || 1024),
        num_predict: Number(process.env.OLLAMA_NUM_PREDICT || 320),
        seed: hashSeed(`${locale}:${state.slug}`),
      },
    }),
    },
    timeoutMs,
  );

  if (!response.ok) {
    throw new Error(`Ollama request failed (${response.status})`);
  }

  const payload = await response.json();
  const parsed = safeJsonExtract(payload.response);
  if (!parsed) {
    throw new Error('Ollama returned non-JSON response');
  }

  return parsed;
}

function normalizeGeneration(candidate, fallback) {
  const out = {
    blog: {
      title: cleanText(candidate?.blog?.title) || fallback.blog.title,
      subtitle: cleanText(candidate?.blog?.subtitle) || fallback.blog.subtitle,
      sections: [],
    },
    primaryKeyword: cleanText(candidate?.primaryKeyword) || fallback.primaryKeyword,
    secondaryKeywords: [],
    searchIntent: cleanText(candidate?.searchIntent) || fallback.searchIntent,
    publishAngle: cleanText(candidate?.publishAngle) || fallback.publishAngle,
  };

  const sectionCandidates = Array.isArray(candidate?.blog?.sections) ? candidate.blog.sections : [];
  for (const section of sectionCandidates) {
    if (!section || typeof section !== 'object') continue;
    const title = cleanText(section.title);
    const detail = cleanText(section.detail);
    if (!title || !detail) continue;
    out.blog.sections.push({ title, detail });
  }
  if (out.blog.sections.length < 3) {
    out.blog.sections = fallback.blog.sections;
  } else {
    out.blog.sections = out.blog.sections.slice(0, 3);
  }

  const secondaryCandidates = Array.isArray(candidate?.secondaryKeywords) ? candidate.secondaryKeywords : [];
  out.secondaryKeywords = secondaryCandidates
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, 3);
  if (out.secondaryKeywords.length < 3) {
    out.secondaryKeywords = fallback.secondaryKeywords;
  }

  out.searchIntent = ['informational', 'commercial'].includes(out.searchIntent) ? out.searchIntent : fallback.searchIntent;

  return out;
}

function ensureStateSelection(states, options) {
  const bySlug = new Map(states.map((state) => [state.slug, state]));
  const requested = options.stateSlugs.length ? options.stateSlugs : defaultStateSlugs;
  const selected = [];

  for (const slug of requested) {
    const state = bySlug.get(slug);
    if (state) selected.push(state);
    if (selected.length >= options.limitStates) break;
  }

  if (!selected.length) {
    throw new Error('No valid state slugs selected');
  }

  return selected;
}

function nextMonday(date) {
  const out = new Date(date);
  out.setUTCHours(0, 0, 0, 0);
  const day = out.getUTCDay();
  const delta = (8 - day) % 7 || 7;
  out.setUTCDate(out.getUTCDate() + delta);
  return out;
}

function buildCalendar({ days, stateResults, locale }) {
  const weeks = Math.max(1, Math.ceil(days / 7));
  const start = nextMonday(new Date());
  const rows = [];

  for (let idx = 0; idx < weeks; idx += 1) {
    const item = stateResults[idx % stateResults.length];
    const publishDate = new Date(start);
    publishDate.setUTCDate(start.getUTCDate() + idx * 7);

    rows.push({
      week: idx + 1,
      publishDate: ymd(publishDate),
      locale,
      stateSlug: item.state.slug,
      stateName: item.state[locale],
      urlPath: `/${locale}/blog/blog-${item.state.slug}`,
      workingTitle: item.generated.blog.title,
      primaryKeyword: item.generated.primaryKeyword,
      secondaryKeywords: item.generated.secondaryKeywords,
      searchIntent: item.generated.searchIntent,
      publishAngle: item.generated.publishAngle,
    });
  }

  return rows;
}

function markdownReport({ locale, rows }) {
  const heading = localeLabels[locale].summaryHeading;
  const lines = [`# ${heading} (${locale})`, '', `Rows: ${rows.length}`, ''];

  for (const row of rows) {
    lines.push(`## Week ${row.week} - ${row.publishDate}`);
    lines.push(`- State: ${row.stateName} (${row.stateSlug})`);
    lines.push(`- URL: \`${row.urlPath}\``);
    lines.push(`- Title: ${row.workingTitle}`);
    lines.push(`- Primary keyword: ${row.primaryKeyword}`);
    lines.push(`- Secondary keywords: ${row.secondaryKeywords.join(', ')}`);
    lines.push(`- Intent: ${row.searchIntent}`);
    lines.push(`- Angle: ${row.publishAngle}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function applyCmsUpdates({ locale, stateResults }) {
  const statePath = `content/cms/state-copy/${locale}.json`;
  const sitePath = `content/cms/site-copy/${locale}.json`;
  const stateCopy = await readJson(statePath);
  const siteCopy = await readJson(sitePath);

  const overrides = Array.isArray(stateCopy.overrides) ? stateCopy.overrides : [];
  const bySlug = new Map(overrides.map((item) => [item.slug, item]));

  for (const result of stateResults) {
    const slug = result.state.slug;
    const existing = bySlug.get(slug) || { slug };
    existing.blog = result.generated.blog;
    bySlug.set(slug, existing);
  }

  stateCopy.overrides = Array.from(bySlug.values()).sort((a, b) => a.slug.localeCompare(b.slug));

  const desiredCount = Math.max(Array.isArray(siteCopy.blogHighlights) ? siteCopy.blogHighlights.length : 0, 3);
  const fresh = stateResults.slice(0, desiredCount).map((result) => ({
    slug: `blog-${result.state.slug}`,
    title: result.generated.blog.title,
    summary: result.generated.blog.subtitle,
  }));
  const freshSlugs = new Set(fresh.map((entry) => entry.slug));
  const keepExisting = (Array.isArray(siteCopy.blogHighlights) ? siteCopy.blogHighlights : [])
    .filter((entry) => !freshSlugs.has(entry.slug))
    .slice(0, Math.max(desiredCount - fresh.length, 0));

  siteCopy.blogHighlights = [...fresh, ...keepExisting].slice(0, desiredCount);

  const stateChanged = await writeJsonIfChanged(statePath, stateCopy);
  const siteChanged = await writeJsonIfChanged(sitePath, siteCopy);
  return stateChanged || siteChanged;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const states = await loadStates();
  const selectedStates = ensureStateSelection(states, options);

  let ollamaAvailable = false;
  if (options.useOllama) {
    ollamaAvailable = await ollamaIsAvailable(options.ollamaHost);
    if (!ollamaAvailable) {
      console.warn(`Ollama was not reachable at ${options.ollamaHost}. Falling back to deterministic templates.`);
    }
  }

  const generatedByLocale = {};
  let aiSuccessCount = 0;
  let fallbackCount = 0;

  for (const locale of options.localeList) {
    generatedByLocale[locale] = [];

    for (const state of selectedStates) {
      console.log(`Generating ${locale}/${state.slug}...`);
      const fallback = fallbackGeneration(locale, state);
      let generated = fallback;
      let usedAiForState = false;

      if (options.useOllama && ollamaAvailable) {
        try {
          const ai = await generateWithOllama({
            host: options.ollamaHost,
            model: options.model,
            locale,
            state,
            timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 45000),
          });
          generated = normalizeGeneration(ai, fallback);
          usedAiForState = true;
        } catch (firstError) {
          try {
            const aiRetry = await generateWithOllama({
              host: options.ollamaHost,
              model: options.model,
              locale,
              state,
              timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 45000),
            });
            generated = normalizeGeneration(aiRetry, fallback);
            usedAiForState = true;
          } catch (secondError) {
            const first = firstError instanceof Error ? firstError.message : String(firstError);
            const second = secondError instanceof Error ? secondError.message : String(secondError);
            console.warn(`Ollama fallback for ${locale}/${state.slug}: ${first}; retry: ${second}`);
          }
        }
      }

      if (usedAiForState) {
        aiSuccessCount += 1;
      } else if (options.useOllama && ollamaAvailable) {
        fallbackCount += 1;
      }

      generatedByLocale[locale].push({ state, generated });
    }
  }

  let appliedChanges = false;
  if (options.apply) {
    for (const locale of options.localeList) {
      const changed = await applyCmsUpdates({
        locale,
        stateResults: generatedByLocale[locale],
      });
      if (changed) appliedChanges = true;
    }
  }

  const outDir = options.outDir
    ? path.join(root, options.outDir)
    : path.join(root, 'artifacts', 'seo-clusters', timestampFolder(new Date()));

  await mkdir(outDir, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    applyMode: options.apply,
    usedOllama: aiSuccessCount > 0,
    ollamaHost: options.ollamaHost,
    ollamaModel: options.model,
    aiSuccessCount,
    fallbackCount,
    locales: options.localeList,
    stateSlugs: selectedStates.map((state) => state.slug),
    days: options.days,
    changedCmsFiles: appliedChanges,
  };

  await writeFile(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  for (const locale of options.localeList) {
    const calendar = buildCalendar({
      days: options.days,
      locale,
      stateResults: generatedByLocale[locale],
    });

    await writeFile(path.join(outDir, `clusters-${locale}.json`), `${JSON.stringify(calendar, null, 2)}\n`, 'utf8');
    await writeFile(path.join(outDir, `clusters-${locale}.md`), markdownReport({ locale, rows: calendar }), 'utf8');
  }

  console.log(`SEO AI clusters generated at ${path.relative(root, outDir)}`);
  console.log(`- Apply mode: ${options.apply ? 'on' : 'off'}`);
  console.log(`- Ollama used: ${aiSuccessCount > 0 ? 'yes' : 'no'}`);
  if (options.useOllama && ollamaAvailable) {
    console.log(`- AI successes: ${aiSuccessCount}`);
    console.log(`- AI fallbacks: ${fallbackCount}`);
  }
  console.log(`- Locales: ${options.localeList.join(', ')}`);
  console.log(`- States: ${selectedStates.map((state) => state.slug).join(', ')}`);
  if (options.apply) {
    console.log(`- CMS files updated: ${appliedChanges ? 'yes' : 'no changes'}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
