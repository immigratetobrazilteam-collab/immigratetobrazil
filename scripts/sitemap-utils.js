export const SITE_DOMAIN = "https://immigratetobrazil.com";

export function localeForRoute(route) {
  return route.startsWith("/pt-br/") ? "pt-br" : "en";
}

export function absoluteUrl(route) {
  return route === "/" ? SITE_DOMAIN : `${SITE_DOMAIN}${route}`;
}

export function baseRouteFor(route) {
  return route.startsWith("/pt-br/") ? route.replace(/^\/pt-br/, "") || "/" : route;
}

function changeFreq(route) {
  return route === "/" || route === "/pt-br/" ? "weekly" : "weekly";
}

function priority(route) {
  if (route === "/") return "1.0";
  if (route === "/pt-br/") return "0.9";
  return "0.8";
}

export function buildSitemap(routeEntries) {
  const routeGroups = new Map();
  for (const entry of routeEntries) {
    if (entry.noindex) continue;
    const baseRoute = baseRouteFor(entry.route);
    const group = routeGroups.get(baseRoute) || {};
    group[localeForRoute(entry.route)] = entry.route;
    routeGroups.set(baseRoute, group);
  }

  const urls = routeEntries
    .filter((entry) => !entry.noindex)
    .map((entry) => {
      const group = routeGroups.get(baseRouteFor(entry.route)) || {};
      const enRoute = group.en || baseRouteFor(entry.route);
      const ptRoute = group["pt-br"];
      const alternates = [
        `<xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(enRoute)}" />`,
        ptRoute ? `<xhtml:link rel="alternate" hreflang="pt-BR" href="${absoluteUrl(ptRoute)}" />` : "",
        `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(enRoute)}" />`
      ]
        .filter(Boolean)
        .join("");

      return `<url><loc>${absoluteUrl(entry.route)}</loc>${alternates}<changefreq>${changeFreq(entry.route)}</changefreq><priority>${priority(entry.route)}</priority></url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>\n`;
}

export function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_DOMAIN}/sitemap.xml\n`;
}
