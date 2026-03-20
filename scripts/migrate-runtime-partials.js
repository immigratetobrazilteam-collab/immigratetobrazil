import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const partialsRoot = path.join(root, "partials");

const placeholders = {
  gtm: '  <div data-partial="gtm-noscript"></div>\n',
  utility: '  <div data-partial="utility-bar"></div>\n',
  accessibility: '  <div data-partial="accessibility-panel"></div>\n',
  nav: '  <div data-partial="site-navigation"></div>\n',
  breadcrumbs: '  <div data-partial="breadcrumbs"></div>\n',
  sidebar: '        <div data-partial="sidebar-shell"></div>\n',
  resources: '        <div data-partial="official-resources"></div>\n',
  related: '  <div data-partial="related-links"></div>\n',
  disclaimer: '        <div data-partial="disclaimer"></div>\n',
  footer: '    <div data-partial="site-footer"></div>\n',
  whatsapp: '  <div data-partial="floating-whatsapp"></div>\n',
  backToTop: '  <div data-partial="back-to-top"></div>\n',
  cookie: '  <div data-partial="cookie-banner"></div>\n'
};

const markers = {
  en: {
    gtmStart: "<!-- Section: Tag Manager Fallback -->",
    gtmEnd: ["<!-- Section: Utility Bar -->"],
    utilityStart: "<!-- Section: Utility Bar -->",
    utilityEnd: ["<!-- Section: Accessibility Panel -->"],
    accessibilityStart: "<!-- Section: Accessibility Panel -->",
    accessibilityEnd: ["<!-- Section: Site Navigation -->"],
    navStart: "<!-- Section: Site Navigation -->",
    navEnd: ["<!-- Section: Breadcrumb Navigation -->"],
    breadcrumbsStart: "<!-- Section: Breadcrumb Navigation -->",
    breadcrumbsEnd: "\n<header class=\"hero\"",
    sidebarStart: "<!-- Section: Sidebar Column -->",
    sidebarEnd: ["</div>\n<div class=\"container\">", "      </div>\n<div class=\"container\">"],
    resourcesStart: "<!-- Section: Official Resources -->",
    resourcesEnd: ["<!-- Section: Related Links -->"],
    relatedStart: "<!-- Section: Related Links -->",
    relatedEnd: ["<!-- Section: FAQ -->", "<!-- Section: Disclaimer -->"],
    disclaimerStart: "<!-- Section: Disclaimer -->",
    disclaimerEnd: ["</div>\n    </main>", "</div>\n</main>"],
    footerStart: "<!-- Section: Site Footer -->",
    footerEnd: ["<!-- Section: Floating WhatsApp -->"],
    whatsappStart: "<!-- Section: Floating WhatsApp -->",
    whatsappEnd: ["<!-- Section: Back To Top -->"],
    backStart: "<!-- Section: Back To Top -->",
    scriptsStart: "<!-- Section: Site Scripts -->"
  },
  "pt-br": {
    gtmStart: "<!-- Section: Fallback do Tag Manager -->",
    gtmEnd: ["<!-- Section: Barra Utilitaria -->"],
    utilityStart: "<!-- Section: Barra Utilitaria -->",
    utilityEnd: ["<!-- Section: Painel de Acessibilidade -->"],
    accessibilityStart: "<!-- Section: Painel de Acessibilidade -->",
    accessibilityEnd: ["<!-- Section: Navegacao do Site -->"],
    navStart: "<!-- Section: Navegacao do Site -->",
    navEnd: ["<!-- Section: Navegacao de Breadcrumb -->"],
    breadcrumbsStart: "<!-- Section: Navegacao de Breadcrumb -->",
    breadcrumbsEnd: "\n<header class=\"hero\"",
    sidebarStart: "<!-- Section: Coluna Lateral -->",
    sidebarEnd: ["</div>\n<div class=\"container\">", "      </div>\n<div class=\"container\">"],
    resourcesStart: "<!-- Section: Recursos Oficiais -->",
    resourcesEnd: ["<!-- Section: Links Relacionados -->"],
    relatedStart: "<!-- Section: Links Relacionados -->",
    relatedEnd: ["<!-- Section: FAQ -->", "<!-- Section: Aviso Legal -->"],
    disclaimerStart: "<!-- Section: Aviso Legal -->",
    disclaimerEnd: ["</div>\n</main>", "</div>\n    </main>"],
    footerStart: "<!-- Section: Rodape do Site -->",
    footerEnd: ["<!-- Section: WhatsApp Flutuante -->"],
    whatsappStart: "<!-- Section: WhatsApp Flutuante -->",
    whatsappEnd: ["<!-- Section: Voltar ao Topo -->"],
    backStart: "<!-- Section: Voltar ao Topo -->",
    scriptsStart: "<!-- Section: Scripts do Site -->"
  }
};

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "assets" || entry.name === "partials") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.isFile() && (entry.name === "index.html" || entry.name === "404.html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function localeForFile(filePath) {
  const rel = path.relative(root, filePath).split(path.sep).join("/");
  return rel.startsWith("pt-br/") ? "pt-br" : "en";
}

function findEarliest(text, startsAt, patterns) {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  let winner = -1;
  for (const pattern of list) {
    const index = text.indexOf(pattern, startsAt);
    if (index !== -1 && (winner === -1 || index < winner)) winner = index;
  }
  return winner;
}

function extract(text, start, end) {
  const s = text.indexOf(start);
  if (s === -1) return null;
  const e = findEarliest(text, s + start.length, end);
  if (e === -1) return null;
  return text.slice(s, e);
}

function replaceSection(text, start, end, replacement) {
  const s = text.indexOf(start);
  if (s === -1) return text;
  const e = findEarliest(text, s + start.length, end);
  if (e === -1) return text;
  return text.slice(0, s) + replacement + text.slice(e);
}

function stripHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseBreadcrumbs(block) {
  if (!block) return [];
  return [...block.matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)].map((match) => {
    const attrs = match[1];
    const body = match[2];
    const link = body.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    return link
      ? { label: stripHtml(link[2]), href: link[1] }
      : { label: stripHtml(body), current: /aria-current="page"/.test(attrs) };
  });
}

function parseSidebar(block) {
  if (!block) return { enabled: false };
  const pageMapRoot = block.match(/<section class="page-map[\s\S]*?<\/section>\s*<\/section>/);
  const pageMapTitle = pageMapRoot?.[0].match(/<h2 class="section-title page-map__title">[\s\S]*?<span>([\s\S]*?)<\/span><\/h2>/);
  const pageMapIntro = pageMapRoot?.[0].match(/<div class="page-map__head">[\s\S]*?<p>([\s\S]*?)<\/p>/);
  const pageMapLinks = [...(pageMapRoot?.[0].matchAll(/<a class="page-map__link" href="([^"]+)">[\s\S]*?<span>([\s\S]*?)<\/span><\/a>/g) || [])].map((m) => ({
    href: m[1],
    label: stripHtml(m[2])
  }));
  const atAGlance = [...block.matchAll(/<li><strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span><\/li>/g)].map((m) => ({
    label: stripHtml(m[1]),
    value: stripHtml(m[2])
  }));
  const brand = block.match(/<section class="sidebar-card sidebar-card--brand">[\s\S]*?<p class="sidebar-note">([\s\S]*?)<\/p>/);
  const action = block.match(
    /<section class="sidebar-card sidebar-card--action">[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<div class="sidebar-actions">([\s\S]*?)<\/div>[\s\S]*?<p class="sidebar-note">([\s\S]*?)<\/p>/
  );
  const actions = [...(action?.[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g) || [])].map((m) => {
    const attrs = m[1];
    const className = attrs.match(/\bclass="([^"]+)"/)?.[1] || "btn btn-secondary btn-sm";
    const href = attrs.match(/\bhref="([^"]+)"/)?.[1] || "#";
    return {
      className,
      href,
      label: stripHtml(m[2]),
      track: /data-cta-click/.test(attrs) ? "cta" : /data-whatsapp-click/.test(attrs) ? "whatsapp" : null
    };
  });
  return {
    enabled: true,
    pageMap: {
      title: stripHtml(pageMapTitle?.[1] || ""),
      intro: stripHtml(pageMapIntro?.[1] || ""),
      links: pageMapLinks
    },
    atAGlance,
    brand: {
      note: stripHtml(brand?.[1] || "")
    },
    recommendedNextStep: action
      ? {
          lead: stripHtml(action[1]),
          actions,
          note: stripHtml(action[3])
        }
      : { lead: "", actions: [], note: "" }
  };
}

function parseCards(block, type) {
  if (!block) return [];
  if (type === "resources") {
    return [...block.matchAll(/<article class="resource-card">[\s\S]*?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/article>/g)].map(
      (m) => ({ href: m[1], title: stripHtml(m[2]), description: stripHtml(m[3]) })
    );
  }
  return [...block.matchAll(/<a class="related-card" href="([^"]+)">[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<\/a>/g)].map(
    (m) => ({ href: m[1], title: stripHtml(m[2]), description: stripHtml(m[3]) })
  );
}

function parseDisclaimer(block) {
  const match = block?.match(/<p>([\s\S]*?)<\/p>/);
  return stripHtml(match?.[1] || "");
}

function ensureShellConfig(html, shell) {
  const serialized = JSON.stringify(shell).replace(/</g, "\\u003c");
  if (html.includes("window.ITB_SITE.shell =")) {
    return html.replace(/window\.ITB_SITE\.shell = [\s\S]*?;\n/, `window.ITB_SITE.shell = ${serialized};\n`);
  }
  return html.replace(/window\.ITB_SITE = [\s\S]*?;\n/, (match) => `${match}      window.ITB_SITE.shell = ${serialized};\n`);
}

async function writeGenericPartials() {
  await fs.mkdir(path.join(partialsRoot, "en"), { recursive: true });
  await fs.mkdir(path.join(partialsRoot, "pt-br"), { recursive: true });

  const localeCopy = {
    en: {
      resourcesTitle: "Official resources",
      resourcesLead: "Government or institutional sources that help anchor this topic in the real rules and public guidance.",
      relatedTitle: "See also",
      relatedLead: "Related pages that usually answer the next client question."
    },
    "pt-br": {
      resourcesTitle: "Recursos oficiais",
      resourcesLead: "Governo ou fontes institucionais que ajudam a ancorar este tema nas regras reais e orientacoes publicas.",
      relatedTitle: "Veja tambem",
      relatedLead: "Paginas relacionadas que normalmente respondem a proxima pergunta do cliente."
    }
  };

  const globalSamples = {
    en: await fs.readFile(path.join(root, "services/index.html"), "utf8"),
    "pt-br": await fs.readFile(path.join(root, "pt-br/services/index.html"), "utf8")
  };

  for (const [locale, html] of Object.entries(globalSamples)) {
    const m = markers[locale];
    const globals = {
      "gtm-noscript": extract(html, m.gtmStart, m.gtmEnd)?.trim() || "",
      "utility-bar": extract(html, m.utilityStart, m.utilityEnd)?.trim() || "",
      "accessibility-panel": extract(html, m.accessibilityStart, m.accessibilityEnd)?.trim() || "",
      "site-navigation": extract(html, m.navStart, m.navEnd)?.trim() || "",
      "site-footer": extract(html, m.footerStart, m.footerEnd)?.trim() || "",
      "floating-whatsapp": extract(html, m.whatsappStart, m.whatsappEnd)?.trim() || "",
      "back-to-top": extract(html, m.backStart, ['<div class="cookie-banner"', "<div class='cookie-banner'"])?.trim() || "",
      "cookie-banner": extract(html, '<div class="cookie-banner"', m.scriptsStart)?.trim() || ""
    };

    for (const [name, content] of Object.entries(globals)) {
      await fs.writeFile(path.join(partialsRoot, locale, `${name}.html`), `${content}\n`);
    }

    const isPt = locale === "pt-br";
    const breadcrumbLabel = isPt ? "Trigo de pao" : "Breadcrumb";
    const sidebarFactsTitle = isPt ? "De relance" : "At a glance";
    const actionTitle = isPt ? "Proxima etapa recomendada" : "Recommended next step";
    const brandAlt = isPt ? "Logotipo circular Immigrate to Brazil" : "Immigrate to Brazil circular logo";
    const brandTag = isPt ? "Apoiando imigrantes — promovendo o Brasil" : "Supporting Immigrants — Promoting Brazil";

    const sidebarTemplate = isPt
      ? `<!-- Section: Coluna Lateral -->
<aside class="sidebar-column">
<section class="sidebar-card sidebar-card--map">
<section class="page-map page-map--compact" id="page-map">
<div class="page-map__head">
<h2 class="section-title page-map__title"><span aria-hidden="true" class="section-title__icon"><svg aria-hidden="true" viewbox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-6.2 2.5-2.5 6.2 6.2-2.5 2.5-6.2Zm-4.05 4.05 1 1-2.3.92.92-2.3.38.38Z" fill="currentColor"></path></svg></span><span></span></h2>
<p></p>
</div>
<div class="page-map__links"></div>
</section>
</section>
<section class="sidebar-card sidebar-card--facts">
<h2 class="section-title"><span aria-hidden="true" class="section-title__icon"><svg aria-hidden="true" viewbox="0 0 24 24"><path d="M4 4h4v2H6v2H4V4Zm12 0h4v4h-2V6h-2V4ZM4 16h2v2h2v2H4v-4Zm14 0h2v4h-4v-2h2v-2ZM8 7h8v2H8V7Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z" fill="currentColor"></path></svg></span><span>${sidebarFactsTitle}</span></h2>
<ul class="sidebar-list"></ul>
</section>
<section class="sidebar-card sidebar-card--brand">
<div class="sidebar-brand">
<img alt="${brandAlt}" class="sidebar-brand__mark" height="68" src="/assets/logo/immigrate-to-brazil-logo-transparent.png" width="68"/>
<div class="sidebar-brand__copy">
<strong>Immigrate to Brazil</strong>
<span>${brandTag}</span>
</div>
</div>
<p class="sidebar-note"></p>
</section>
<section class="sidebar-card sidebar-card--action">
<h2 class="section-title"><span aria-hidden="true" class="section-title__icon"><svg aria-hidden="true" viewbox="0 0 24 24"><path d="m13.2 5.3 6 6-6 6-1.4-1.4 3.6-3.6H4v-2h11.4l-3.6-3.6 1.4-1.4Z" fill="currentColor"></path></svg></span><span>${actionTitle}</span></h2>
<p></p>
<div class="sidebar-actions"></div>
<p class="sidebar-note"></p>
</section>
</aside>`
      : `<!-- Section: Sidebar Column -->
<aside class="sidebar-column">
    <section class="sidebar-card sidebar-card--map">
      <section class="page-map page-map--compact" id="page-map">
        <div class="page-map__head">
          <h2 class="section-title page-map__title"><span class="section-title__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-6.2 2.5-2.5 6.2 6.2-2.5 2.5-6.2Zm-4.05 4.05 1 1-2.3.92.92-2.3.38.38Z" fill="currentColor"/></svg></span><span></span></h2>
          <p></p>
        </div>
        <div class="page-map__links"></div>
      </section>
    </section>
    <section class="sidebar-card sidebar-card--facts">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4v2H6v2H4V4Zm12 0h4v4h-2V6h-2V4ZM4 16h2v2h2v2H4v-4Zm14 0h2v4h-4v-2h2v-2ZM8 7h8v2H8V7Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z" fill="currentColor"/></svg></span><span>${sidebarFactsTitle}</span></h2>
      <ul class="sidebar-list"></ul>
    </section>
    <section class="sidebar-card sidebar-card--brand">
      <div class="sidebar-brand">
        <img class="sidebar-brand__mark" src="/assets/logo/immigrate-to-brazil-logo-transparent.png" alt="${brandAlt}" width="68" height="68" />
        <div class="sidebar-brand__copy">
          <strong>Immigrate to Brazil</strong>
          <span>${brandTag}</span>
        </div>
      </div>
      <p class="sidebar-note"></p>
    </section>
    <section class="sidebar-card sidebar-card--action">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.2 5.3 6 6-6 6-1.4-1.4 3.6-3.6H4v-2h11.4l-3.6-3.6 1.4-1.4Z" fill="currentColor"/></svg></span><span>${actionTitle}</span></h2>
      <p></p>
      <div class="sidebar-actions"></div>
      <p class="sidebar-note"></p>
    </section>
  </aside>`;

    await fs.writeFile(path.join(partialsRoot, locale, "breadcrumbs.html"), `${extract(html, m.breadcrumbsStart, m.breadcrumbsEnd)?.replace(/<li[\s\S]*<\/li>/, "<ol></ol>").replace(/<ol><\/ol><\/ol>/, "<ol></ol>") || ""}\n`);
    await fs.writeFile(path.join(partialsRoot, locale, "sidebar-shell.html"), `${sidebarTemplate}\n`);
    await fs.writeFile(
      path.join(partialsRoot, locale, "official-resources.html"),
      `${isPt ? "<!-- Section: Recursos Oficiais -->" : "        <!-- Section: Official Resources -->"}\n<section class="official-resources" data-official-resources="true">
${isPt ? `<div class="section-head">
<h2 class="section-title"><span aria-hidden="true" class="section-title__icon"><svg aria-hidden="true" viewbox="0 0 24 24"><path d="M7 3h7l5 5v13H7V3Zm2 2v14h8V9h-4V5H9Zm2 7h4v2h-4v-2Zm0 4h4v2h-4v-2Zm0-8h1v2h-1V8Z" fill="currentColor"></path></svg></span><span>${localeCopy[locale].resourcesTitle}</span></h2>
<p>${localeCopy[locale].resourcesLead}</p>
</div>
<div class="resource-grid"></div>` : `    <div class="section-head">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7V3Zm2 2v14h8V9h-4V5H9Zm2 7h4v2h-4v-2Zm0 4h4v2h-4v-2Zm0-8h1v2h-1V8Z" fill="currentColor"/></svg></span><span>${localeCopy[locale].resourcesTitle}</span></h2>
      <p>${localeCopy[locale].resourcesLead}</p>
    </div>
<div class="resource-grid"></div>`}
</section>\n`
    );
    await fs.writeFile(
      path.join(partialsRoot, locale, "related-links.html"),
      `${isPt ? "<!-- Section: Links Relacionados -->" : "  <!-- Section: Related Links -->"}\n<section class="related-block" data-related-links="true">
${isPt ? `<div class="section-head">
<h2 class="section-title"><span aria-hidden="true" class="section-title__icon"><svg aria-hidden="true" viewbox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-2.1 2.1-1.4-1.4 2.1-2.1a1 1 0 1 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l2.1-2.1 1.4 1.4-2.1 2.1a1 1 0 0 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0Z" fill="currentColor"></path></svg></span><span>${localeCopy[locale].relatedTitle}</span></h2>
<p>${localeCopy[locale].relatedLead}</p>
</div>
<div class="related-grid"></div>` : `    <div class="section-head">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-2.1 2.1-1.4-1.4 2.1-2.1a1 1 0 1 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l2.1-2.1 1.4 1.4-2.1 2.1a1 1 0 0 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0Z" fill="currentColor"/></svg></span><span>${localeCopy[locale].relatedTitle}</span></h2>
      <p>${localeCopy[locale].relatedLead}</p>
    </div>
<div class="related-grid"></div>`}
</section>\n`
    );
    await fs.writeFile(
      path.join(partialsRoot, locale, "disclaimer.html"),
      `${isPt ? "<!-- Section: Aviso Legal -->" : "        <!-- Section: Disclaimer -->"}\n${isPt ? "<section class=\"site-disclaimer visible-disclaimer\">\n<p></p>\n</section>" : "<section class=\"site-disclaimer visible-disclaimer\">\n          <p></p>\n        </section>"}\n`
    );
  }
}

function migrateHtml(html, locale) {
  const m = markers[locale];

  let next = html;
  next = replaceSection(next, m.gtmStart, m.gtmEnd, `${placeholders.gtm}\n`);
  next = replaceSection(next, m.utilityStart, m.utilityEnd, `${placeholders.utility}\n`);
  next = replaceSection(next, m.accessibilityStart, m.accessibilityEnd, `${placeholders.accessibility}\n`);
  next = replaceSection(next, m.navStart, m.navEnd, `${placeholders.nav}\n`);
  next = replaceSection(next, m.footerStart, m.footerEnd, `${placeholders.footer}\n`);
  next = replaceSection(next, m.whatsappStart, m.whatsappEnd, `${placeholders.whatsapp}\n`);
  next = replaceSection(next, m.backStart, m.scriptsStart, `${placeholders.backToTop}${placeholders.cookie}\n`);
  next = next.replace(/<!-- Section: Site Footer -->[\s\S]*?(?=<div data-partial="floating-whatsapp">)/, `${placeholders.footer}\n`);
  next = next.replace(/<!-- Section: Rodape do Site -->[\s\S]*?(?=<div data-partial="floating-whatsapp">)/, `${placeholders.footer}\n`);
  next = next.replace(/<!-- Section: Floating WhatsApp -->[\s\S]*?(?=<div data-partial="back-to-top">)/, `${placeholders.whatsapp}\n`);
  next = next.replace(/<!-- Section: WhatsApp Flutuante -->[\s\S]*?(?=<div data-partial="back-to-top">)/, `${placeholders.whatsapp}\n`);

  next = next.replace(
    /<script defer(?:="")? src="\/js\/search\.js"><\/script>\s*<script defer(?:="")? src="\/js\/accessibility\.js"><\/script>\s*<script defer(?:="")? src="\/js\/site\.js"><\/script>/,
    '<script defer src="/js/partials.js"></script>\n<script defer src="/js/search.js"></script>\n<script defer src="/js/accessibility.js"></script>\n<script defer src="/js/site.js"></script>'
  );

  next = next.replace(/window\.ITB_SITE\.shell = [\s\S]*?;\n/g, "");

  return next;
}

async function main() {
  await writeGenericPartials();
  const files = await walk(root);
  for (const file of files) {
    const html = await fs.readFile(file, "utf8");
    const migrated = migrateHtml(html, localeForFile(file));
    await fs.writeFile(file, migrated);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
