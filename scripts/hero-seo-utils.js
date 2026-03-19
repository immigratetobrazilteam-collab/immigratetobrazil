const SITE_DOMAIN = "https://immigratetobrazil.com";

export const HERO_POLICY_MARKDOWN = `# Hero Image Policy

Each page is assigned its own hero asset path under \`assets/images/heroes/<family>/<slug>.webp\`.

Fallback order:

1. Use a curated library of verified Brazil-only images drawn from real places, landmarks, cityscapes, and nature destinations.
2. Match pages to region-aware tags so North, Northeast, Central-West, Southeast, and South routes pull from relevant Brazil imagery.
3. Generate descriptive local filenames that combine the Brazil location, the page topic, and the hero folder.
4. Store page-specific alt text, description, and keyword metadata for each hero image in the manifest and page markup.
5. Only generate a branded scenic fallback if a curated source cannot be downloaded.

This keeps every hero grounded in Brazil while preserving manual override room for later swaps.
`;

export const CURATED_BRAZIL_HERO_SOURCES = [
  {
    id: "rio-sugarloaf",
    slug: "rio-de-janeiro-sugarloaf-mountain",
    url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Rio_de_Janeiro_from_Sugarloaf_mountain%2C_May_2004.jpg",
    name: "Rio de Janeiro skyline from Sugarloaf Mountain",
    scene: "Rio de Janeiro, Sugarloaf Mountain, and Guanabara Bay",
    regionLabel: "southeast Brazil",
    tags: ["general", "southeast", "city", "coast", "landmark", "nature", "tourism"],
    keywords: ["Rio de Janeiro", "Sugarloaf Mountain", "Guanabara Bay", "Brazil skyline", "southeast Brazil"]
  },
  {
    id: "brasilia-congress",
    slug: "brasilia-national-congress",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Brazilian_National_Congress.jpg/1920px-Brazilian_National_Congress.jpg",
    name: "National Congress in Brasilia",
    scene: "the National Congress complex in Brasilia",
    regionLabel: "central-west Brazil",
    tags: ["general", "central-west", "capital", "city", "civic", "government", "architecture"],
    keywords: ["Brasilia", "National Congress", "Brazil capital", "Monumental Axis", "central-west Brazil"]
  },
  {
    id: "saopaulo-skyline",
    slug: "sao-paulo-skyline",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Sao_Paulo_Brazil_Skyline_Aerial%2C_December_2024.jpg/1920px-Sao_Paulo_Brazil_Skyline_Aerial%2C_December_2024.jpg",
    name: "Sao Paulo skyline",
    scene: "the Sao Paulo skyline",
    regionLabel: "southeast Brazil",
    tags: ["general", "southeast", "capital", "city", "civic", "skyline", "tourism"],
    keywords: ["Sao Paulo", "Brazil skyline", "Avenida Paulista", "urban Brazil", "southeast Brazil"]
  },
  {
    id: "salvador-pelourinho",
    slug: "salvador-pelourinho-bahia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Largo_do_Pelourinho_Salvador_2019-9754_%28cropped%29.jpg/1920px-Largo_do_Pelourinho_Salvador_2019-9754_%28cropped%29.jpg",
    name: "Pelourinho in Salvador",
    scene: "Pelourinho in Salvador, Bahia",
    regionLabel: "northeast Brazil",
    tags: ["general", "northeast", "city", "heritage", "culture", "tourism"],
    keywords: ["Salvador", "Pelourinho", "Bahia", "historic center", "northeast Brazil"]
  },
  {
    id: "iguazu-falls",
    slug: "iguazu-falls-brazil",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Iguazu_Falls_Brazilian_Side_2019.jpg/1920px-Iguazu_Falls_Brazilian_Side_2019.jpg",
    name: "Iguazu Falls on the Brazilian side",
    scene: "Iguazu Falls on the Brazilian side",
    regionLabel: "southern Brazil",
    tags: ["general", "south", "nature", "tourism", "landmark"],
    keywords: ["Iguazu Falls", "Foz do Iguacu", "waterfalls", "southern Brazil", "Brazil nature"]
  },
  {
    id: "lencois-maranhenses",
    slug: "lencois-maranhenses",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Len%C3%A7%C3%B3is_Maranhenses_2018.jpg/1920px-Len%C3%A7%C3%B3is_Maranhenses_2018.jpg",
    name: "Lençois Maranhenses dunes and lagoons",
    scene: "Lençois Maranhenses dunes and lagoons",
    regionLabel: "northeast Brazil",
    tags: ["general", "northeast", "nature", "tourism"],
    keywords: ["Lençois Maranhenses", "Maranhao", "sand dunes", "lagoons", "northeast Brazil"]
  },
  {
    id: "amazon-river",
    slug: "amazon-river-basin",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Juru%C3%A1_River_in_Brazil.jpg/1920px-Juru%C3%A1_River_in_Brazil.jpg",
    name: "Amazon river basin",
    scene: "an aerial view of the Amazon river basin",
    regionLabel: "northern Brazil",
    tags: ["general", "north", "nature", "tourism"],
    keywords: ["Amazon river", "Amazon basin", "Brazil rainforest", "northern Brazil", "Brazil nature"]
  },
  {
    id: "manaus-theater",
    slug: "manaus-teatro-amazonas",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Noite_no_Teatro_Amazonas_%28cropped%29.jpg/1920px-Noite_no_Teatro_Amazonas_%28cropped%29.jpg",
    name: "Teatro Amazonas in Manaus",
    scene: "Teatro Amazonas in Manaus",
    regionLabel: "northern Brazil",
    tags: ["north", "city", "heritage", "culture", "architecture", "tourism"],
    keywords: ["Manaus", "Teatro Amazonas", "Amazonas", "historic theater", "northern Brazil"]
  },
  {
    id: "curitiba-skyline",
    slug: "curitiba-skyline",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Curitiba_Skyline%2C_Parana.jpg/1920px-Curitiba_Skyline%2C_Parana.jpg",
    name: "Curitiba skyline",
    scene: "the Curitiba skyline",
    regionLabel: "southern Brazil",
    tags: ["south", "city", "capital", "civic", "skyline", "tourism"],
    keywords: ["Curitiba", "Parana", "Brazil skyline", "southern Brazil", "urban Brazil"]
  },
  {
    id: "florianopolis-beach",
    slug: "florianopolis-praia-brava",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Panorama_Praia_Brava_12_2014_Florianopolis_986.JPG/1920px-Panorama_Praia_Brava_12_2014_Florianopolis_986.JPG",
    name: "Florianopolis coastline",
    scene: "Florianopolis and Praia Brava on the Atlantic coast",
    regionLabel: "southern Brazil",
    tags: ["south", "nature", "coast", "city", "tourism"],
    keywords: ["Florianopolis", "Praia Brava", "Brazil beach", "Atlantic coast", "southern Brazil"]
  },
  {
    id: "ouro-preto",
    slug: "ouro-preto-historic-center",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Ouro_Preto_November_2009-13.jpg/1920px-Ouro_Preto_November_2009-13.jpg",
    name: "Historic center of Ouro Preto",
    scene: "the historic hillside architecture of Ouro Preto",
    regionLabel: "southeast Brazil",
    tags: ["southeast", "heritage", "culture", "city", "tourism"],
    keywords: ["Ouro Preto", "Minas Gerais", "historic center", "colonial Brazil", "southeast Brazil"]
  },
  {
    id: "paraty",
    slug: "paraty-historic-waterfront",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/At_Paraty_2023_080_-_High_tide_at_Rua_da_Praia.jpg/1920px-At_Paraty_2023_080_-_High_tide_at_Rua_da_Praia.jpg",
    name: "Historic waterfront of Paraty",
    scene: "Paraty's colonial waterfront",
    regionLabel: "southeast Brazil",
    tags: ["southeast", "heritage", "culture", "coast", "city", "tourism"],
    keywords: ["Paraty", "Rio de Janeiro state", "colonial waterfront", "Brazil heritage", "southeast Brazil"]
  },
  {
    id: "bonito-rio-formoso",
    slug: "bonito-rio-formoso",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Rio_Formoso_em_Bonito_no_Mato_Grosso_do_Sul%2C_Serra_da_Bodoquena.jpg/1920px-Rio_Formoso_em_Bonito_no_Mato_Grosso_do_Sul%2C_Serra_da_Bodoquena.jpg",
    name: "Rio Formoso in Bonito",
    scene: "the Rio Formoso in Bonito",
    regionLabel: "central-west Brazil",
    tags: ["central-west", "nature", "tourism"],
    keywords: ["Bonito", "Rio Formoso", "Mato Grosso do Sul", "ecotourism", "central-west Brazil"]
  },
  {
    id: "chapada-veadeiros",
    slug: "chapada-dos-veadeiros",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Chapada_dos_Veadeiros_18.jpg/1920px-Chapada_dos_Veadeiros_18.jpg",
    name: "Chapada dos Veadeiros",
    scene: "Chapada dos Veadeiros National Park",
    regionLabel: "central-west Brazil",
    tags: ["central-west", "nature", "tourism"],
    keywords: ["Chapada dos Veadeiros", "Goias", "Brazil national park", "cerrado", "central-west Brazil"]
  },
  {
    id: "porto-alegre",
    slug: "porto-alegre-skyline",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Porto_Alegre_Skyline.jpg/1920px-Porto_Alegre_Skyline.jpg",
    name: "Porto Alegre skyline",
    scene: "the Porto Alegre skyline",
    regionLabel: "southern Brazil",
    tags: ["south", "city", "capital", "civic", "skyline", "tourism"],
    keywords: ["Porto Alegre", "Rio Grande do Sul", "Brazil skyline", "southern Brazil", "urban Brazil"]
  },
  {
    id: "pantanal",
    slug: "pantanal-wetlands",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Renaissance_of_the_Pantanal_wetlands%2C_Brazil.jpg/1920px-Renaissance_of_the_Pantanal_wetlands%2C_Brazil.jpg",
    name: "Pantanal wetlands",
    scene: "the Pantanal wetlands",
    regionLabel: "central-west Brazil",
    tags: ["central-west", "nature", "tourism"],
    keywords: ["Pantanal", "wetlands", "Mato Grosso do Sul", "Brazil nature", "central-west Brazil"]
  }
];

const HERO_SOURCE_PT_COPY = {
  "rio-sugarloaf": {
    name: "Horizonte do Rio de Janeiro visto do Pão de Açúcar",
    scene: "o Rio de Janeiro, o Pão de Açúcar e a Baía de Guanabara",
    regionLabel: "sudeste do Brasil",
    keywords: ["Rio de Janeiro", "Pão de Açúcar", "Baía de Guanabara", "horizonte do Brasil", "sudeste do Brasil"]
  },
  "brasilia-congress": {
    name: "Congresso Nacional em Brasília",
    scene: "o complexo do Congresso Nacional em Brasília",
    regionLabel: "centro-oeste do Brasil",
    keywords: ["Brasília", "Congresso Nacional", "capital do Brasil", "Eixo Monumental", "centro-oeste do Brasil"]
  },
  "saopaulo-skyline": {
    name: "Horizonte de São Paulo",
    scene: "o horizonte de São Paulo",
    regionLabel: "sudeste do Brasil",
    keywords: ["São Paulo", "horizonte do Brasil", "Avenida Paulista", "Brasil urbano", "sudeste do Brasil"]
  },
  "salvador-pelourinho": {
    name: "Pelourinho em Salvador",
    scene: "o Pelourinho em Salvador, Bahia",
    regionLabel: "nordeste do Brasil",
    keywords: ["Salvador", "Pelourinho", "Bahia", "centro histórico", "nordeste do Brasil"]
  },
  "iguazu-falls": {
    name: "Cataratas do Iguaçu no lado brasileiro",
    scene: "as Cataratas do Iguaçu no lado brasileiro",
    regionLabel: "sul do Brasil",
    keywords: ["Cataratas do Iguaçu", "Foz do Iguaçu", "cachoeiras", "sul do Brasil", "natureza do Brasil"]
  },
  "lencois-maranhenses": {
    name: "Dunas e lagoas dos Lençóis Maranhenses",
    scene: "as dunas e lagoas dos Lençóis Maranhenses",
    regionLabel: "nordeste do Brasil",
    keywords: ["Lençóis Maranhenses", "Maranhão", "dunas", "lagoas", "nordeste do Brasil"]
  },
  "amazon-river": {
    name: "Bacia do rio Amazonas",
    scene: "uma vista aérea da bacia do rio Amazonas",
    regionLabel: "norte do Brasil",
    keywords: ["rio Amazonas", "bacia Amazônica", "floresta brasileira", "norte do Brasil", "natureza do Brasil"]
  },
  "manaus-theater": {
    name: "Teatro Amazonas em Manaus",
    scene: "o Teatro Amazonas em Manaus",
    regionLabel: "norte do Brasil",
    keywords: ["Manaus", "Teatro Amazonas", "Amazonas", "teatro histórico", "norte do Brasil"]
  },
  "curitiba-skyline": {
    name: "Horizonte de Curitiba",
    scene: "o horizonte de Curitiba",
    regionLabel: "sul do Brasil",
    keywords: ["Curitiba", "Paraná", "horizonte do Brasil", "sul do Brasil", "Brasil urbano"]
  },
  "florianopolis-beach": {
    name: "Litoral de Florianópolis",
    scene: "Florianópolis e a Praia Brava no litoral atlântico",
    regionLabel: "sul do Brasil",
    keywords: ["Florianópolis", "Praia Brava", "praia do Brasil", "litoral atlântico", "sul do Brasil"]
  },
  "ouro-preto": {
    name: "Centro histórico de Ouro Preto",
    scene: "a arquitetura histórica nas encostas de Ouro Preto",
    regionLabel: "sudeste do Brasil",
    keywords: ["Ouro Preto", "Minas Gerais", "centro histórico", "Brasil colonial", "sudeste do Brasil"]
  },
  "paraty": {
    name: "Orla histórica de Paraty",
    scene: "a orla colonial de Paraty",
    regionLabel: "sudeste do Brasil",
    keywords: ["Paraty", "estado do Rio de Janeiro", "orla colonial", "patrimônio do Brasil", "sudeste do Brasil"]
  },
  "bonito-rio-formoso": {
    name: "Rio Formoso em Bonito",
    scene: "o Rio Formoso em Bonito",
    regionLabel: "centro-oeste do Brasil",
    keywords: ["Bonito", "Rio Formoso", "Mato Grosso do Sul", "ecoturismo", "centro-oeste do Brasil"]
  },
  "chapada-veadeiros": {
    name: "Chapada dos Veadeiros",
    scene: "o Parque Nacional da Chapada dos Veadeiros",
    regionLabel: "centro-oeste do Brasil",
    keywords: ["Chapada dos Veadeiros", "Goiás", "parque nacional do Brasil", "cerrado", "centro-oeste do Brasil"]
  },
  "porto-alegre": {
    name: "Horizonte de Porto Alegre",
    scene: "o horizonte de Porto Alegre",
    regionLabel: "sul do Brasil",
    keywords: ["Porto Alegre", "Rio Grande do Sul", "horizonte do Brasil", "sul do Brasil", "Brasil urbano"]
  },
  pantanal: {
    name: "Pantanal",
    scene: "as áreas alagadas do Pantanal",
    regionLabel: "centro-oeste do Brasil",
    keywords: ["Pantanal", "áreas alagadas", "Mato Grosso do Sul", "natureza do Brasil", "centro-oeste do Brasil"]
  }
};

const FAMILY_IMAGE_CONTEXT = {
  foundation: "Brazil immigration and relocation planning",
  about: "a Brazil immigration law practice",
  brazil: "relocation guidance about life in Brazil",
  process: "the Brazil immigration process",
  services: "Brazil immigration services",
  insights: "Brazil immigration insights",
  legal: "Brazil legal information"
};

const FAMILY_IMAGE_CONTEXT_PT = {
  foundation: "planejamento de imigração e mudança para o Brasil",
  about: "um escritório de imigração para o Brasil",
  brazil: "orientação sobre viver no Brasil",
  process: "o processo de imigração para o Brasil",
  services: "serviços de imigração para o Brasil",
  insights: "conteúdo sobre imigração para o Brasil",
  legal: "informações legais no Brasil"
};

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function isPtLocale(locale = "en") {
  return String(locale).toLowerCase().startsWith("pt");
}

export function slugify(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function baseRouteFor(route = "/") {
  return route.startsWith("/pt-br/") ? route.replace(/^\/pt-br/, "") || "/" : route;
}

function stableHash(value) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function rotate(values, seed) {
  if (!values.length) return [];
  const offset = seed % values.length;
  return values.slice(offset).concat(values.slice(0, offset));
}

function includesAny(value, terms) {
  return terms.some((term) => value.includes(term));
}

export function heroFolder(item) {
  return item.family === "foundation" ? "foundation" : item.family;
}

export function routeRegion(item) {
  const key = String(item.key || "").toLowerCase();
  const route = baseRouteFor(item.route || "/").toLowerCase();
  if (key === "brazil-northeast" || route.includes("/northeast/")) return "northeast";
  if (key === "brazil-central-west" || route.includes("/central-west/")) return "central-west";
  if (key === "brazil-southeast" || route.includes("/southeast/")) return "southeast";
  if (key === "brazil-south" || route.includes("/south/")) return "south";
  if (key === "brazil-north" || route.includes("/north/")) return "north";
  return null;
}

function tagsForItem(item) {
  const key = String(item.key || "").toLowerCase();
  const family = String(item.family || "").toLowerCase();
  const tags = ["general", family];
  const region = routeRegion(item);

  if (region) tags.push(region);

  if (["about", "legal", "process", "services", "insights"].includes(family)) {
    tags.push("city", "civic", "tourism");
  }

  if (
    includesAny(key, [
      "culture",
      "festivals",
      "cuisine",
      "events",
      "story",
      "stories",
      "mission",
      "values",
      "clients",
      "testimonials",
      "blog",
      "guides"
    ])
  ) {
    tags.push("heritage", "culture", "tourism");
  }

  if (
    includesAny(key, [
      "home",
      "consultation",
      "brazil",
      "living",
      "quality",
      "cost",
      "housing",
      "healthcare",
      "education",
      "safety",
      "faqs",
      "investment",
      "economy"
    ])
  ) {
    tags.push("nature", "city", "tourism");
  }

  if (
    includesAny(key, [
      "states",
      "cities",
      "municipalities",
      "directory",
      "search",
      "profile",
      "governance",
      "compliance",
      "standards",
      "regulatory",
      "payment",
      "privacy",
      "cookies",
      "terms",
      "gdpr",
      "lgpd",
      "accessibility",
      "disclaimer",
      "404"
    ])
  ) {
    tags.push("capital", "city", "civic", "tourism");
  }

  return unique(tags);
}

function scoredCandidates(item) {
  const tags = tagsForItem(item);
  const scored = CURATED_BRAZIL_HERO_SOURCES.map((source) => ({
    source,
    score: source.tags.reduce((total, tag) => total + (tags.includes(tag) ? 1 : 0), 0)
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.source.id.localeCompare(b.source.id));

  if (!scored.length) return [];

  const cutoff = Math.max(1, scored[0].score - 1);
  const shortlist = scored.filter((entry) => entry.score >= cutoff).map((entry) => entry.source);
  return rotate(shortlist, stableHash(String(item.key || item.route || "")));
}

function selectSource(item, usageMap) {
  let candidates = scoredCandidates(item);
  const region = routeRegion(item);
  if (region) {
    const regional = candidates.filter((source) => source.tags.includes(region));
    if (regional.length) candidates = regional;
  }
  if (!candidates.length) return null;

  const ranked = candidates
    .map((source, index) => ({
      source,
      index,
      uses: usageMap.get(source.id) || 0
    }))
    .sort((a, b) => a.uses - b.uses || a.index - b.index);

  return ranked[0].source;
}

function pageSlug(item) {
  const route = baseRouteFor(item.route || "/");
  if (route === "/") return "home";

  const segments = route.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || slugify(item.title || "page");
  const previous = segments[segments.length - 2] || "";

  if (last === previous) return `${last}-overview`;
  return last;
}

function localizedSource(source, locale = "en") {
  if (!source) return null;
  if (!isPtLocale(locale)) {
    return {
      name: source.name,
      scene: source.scene,
      regionLabel: source.regionLabel,
      keywords: source.keywords
    };
  }

  const copy = HERO_SOURCE_PT_COPY[source.id] || {};
  return {
    name: copy.name || source.name,
    scene: copy.scene || source.scene,
    regionLabel: copy.regionLabel || source.regionLabel,
    regionPhrase: copy.regionPhrase || `no ${copy.regionLabel || source.regionLabel}`,
    keywords: unique([...(copy.keywords || []), ...source.keywords])
  };
}

function imageContext(item, locale = "en") {
  if (isPtLocale(locale)) {
    return FAMILY_IMAGE_CONTEXT_PT[item.family] || "conteúdo sobre o Brasil";
  }
  return FAMILY_IMAGE_CONTEXT[item.family] || "Brazil guidance content";
}

function buildHeroPath(item, source) {
  const folder = heroFolder(item);
  return `/assets/images/heroes/${folder}/brazil-${source.slug}-${pageSlug(item)}.webp`;
}

function buildAlt(item, source, options = {}) {
  const locale = options.locale || "en";
  const title = options.title || item.title;
  const copy = localizedSource(source, locale);
  if (isPtLocale(locale)) {
    return `Imagem principal da página ${title} mostrando ${copy.scene} ${copy.regionPhrase}.`;
  }
  return `Hero image for the ${title} page showing ${copy.scene} in ${copy.regionLabel}.`;
}

function buildDescription(item, source, options = {}) {
  const locale = options.locale || "en";
  const title = options.title || item.title;
  const copy = localizedSource(source, locale);
  if (isPtLocale(locale)) {
    return `Imagem principal SEO da página ${title} na Immigrate to Brazil, com ${copy.scene} e contexto sobre ${imageContext(item, locale)}.`;
  }
  return `SEO hero image for the ${title} page on Immigrate to Brazil, showing ${copy.scene} and supporting content about ${imageContext(item, locale)}.`;
}

function buildKeywords(item, source, options = {}) {
  const locale = options.locale || "en";
  const title = options.title || item.title;
  const copy = localizedSource(source, locale);
  if (isPtLocale(locale)) {
    return unique([
      ...copy.keywords,
      copy.scene,
      copy.regionLabel,
      title,
      imageContext(item, locale),
      "Brasil",
      "imigração para o Brasil",
      "Immigrate to Brazil"
    ]);
  }
  return unique([
    ...copy.keywords,
    copy.scene,
    copy.regionLabel,
    title,
    imageContext(item, locale),
    "Brazil",
    "Immigrate to Brazil"
  ]);
}

export function buildHeroMetadata(item, options = {}) {
  const source = options.source || findHeroSourceById(item.sourceId) || null;
  if (!source) {
    return {
      path: item.path,
      alt: item.alt,
      description: item.description || item.alt,
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      sourceId: item.sourceId || null,
      sourceName: item.sourceName || null,
      imageTitle: item.imageTitle || `${options.title || item.title} hero image`
    };
  }

  const locale = options.locale || "en";
  const title = options.title || item.title;
  const copy = localizedSource(source, locale);
  return {
    path: buildHeroPath(item, source),
    alt: buildAlt(item, source, { locale, title }),
    description: buildDescription(item, source, { locale, title }),
    keywords: buildKeywords(item, source, { locale, title }),
    sourceId: source.id,
    sourceName: source.name,
    imageTitle: isPtLocale(locale)
      ? `Imagem principal de ${title} com ${copy.name}`
      : `${title} hero image featuring ${copy.name}`
  };
}

export function buildHeroAssignments(items) {
  const usageMap = new Map();

  return items.map((item) => {
    const source = selectSource(item, usageMap);
    if (source) {
      usageMap.set(source.id, (usageMap.get(source.id) || 0) + 1);
    }

    const heroMeta = source ? buildHeroMetadata(item, { source }) : buildHeroMetadata(item);

    return {
      ...item,
      folder: heroFolder(item),
      ...heroMeta
    };
  });
}

export function findHeroSourceById(id) {
  return CURATED_BRAZIL_HERO_SOURCES.find((source) => source.id === id) || null;
}

export function absoluteHeroUrl(heroPath) {
  return `${SITE_DOMAIN}${heroPath}`;
}
