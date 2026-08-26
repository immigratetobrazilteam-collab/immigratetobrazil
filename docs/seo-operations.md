# SEO operations

## Release gate

Before merging a production change, run:

```sh
npm run sync:data
npm run seo:audit
npm run audit:discovery
node scripts/validate-site.js
```

These checks fail on canonical mismatches, duplicate or missing hreflang,
unexpected `noindex`, broken local references, sitemap drift, inaccessible key
routes, orphaned indexable pages, invalid JSON-LD, and unversioned local CSS or
JavaScript URLs.

## Search-engine submission and monitoring

Submit exactly this sitemap index in both Google Search Console and Bing
Webmaster Tools:

`https://immigratetobrazil.com/sitemap.xml`

Use the URL Inspection tool after material releases for the home page, the
profile page, every top-level service page, and a newly published article. In
Bing, use Site Explorer and URL Inspection for the same sample. Investigate
any URL reported as blocked, redirected, non-canonical, soft-404, or excluded.

## Language policy

The deployed site currently has English and Brazilian Portuguese equivalents.
It intentionally publishes only `en`, `pt-BR`, and `x-default` hreflang values;
adding `es` or `fr` before a complete equivalent exists would be an incorrect
signal.

When Spanish or French is launched, generate a permanent, crawlable equivalent
for every intended public route, add self-referencing `es`/`fr` alternates to
every member of that language group, set the matching HTML `lang`, localize the
canonical URL and structured-data page URL, and regenerate the sitemap. Do not
use IP, browser-language, or automatic redirects that keep crawlers from the
chosen language URL.
