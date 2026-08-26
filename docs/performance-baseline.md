# Performance baseline and regression record

Measurements were taken on 2026-08-26 with Lighthouse 13 against a local
production-static build, using Chromium's default mobile simulation. The local
Python server does not serve Brotli or Cloudflare edge caching, so these are
conservative development measurements rather than production field data.

| Page | Profile | Performance | LCP | CLS | Accessibility | SEO |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `/` before deferred lower-page partials | Mobile | 0.68 | 7.3 s | 0.083 | 1.00 | 1.00 |
| `/` after deferred lower-page partials | Mobile | 0.68 | 6.9 s | 0.083 | 1.00 | 1.00 |
| `/services/visas/work/` | Mobile | 0.72 | 5.5 s | 0.074 | 1.00 | 1.00 |
| `/start-consultation/` | Mobile | 0.73 | 4.9 s | 0.074 | 1.00 | 1.00 |
| `/` | Desktop | 0.93 | 1.6 s | 0.076 | 1.00 | 1.00 |

## Changes measured

- Hero images use WebP responsive `srcset`, explicit intrinsic dimensions,
  `sizes`, eager loading, and `fetchpriority="high"`; their responsive source
  is preloaded only for the page hero.
- The shared header reserves its mobile and desktop dimensions in critical CSS,
  and image dimensions reserve visual space, protecting CLS.
- Shared lower-page partials now hydrate after the first render during idle
  time. Navigation, breadcrumbs, and accessibility controls remain eager.
- All local scripts are deferred. The assistant/chat script is loaded only
  after a user opens its launcher.
- Fonts use local/system fallback stacks, so no remote font request can delay
  text rendering.

## Remaining performance work

The largest local mobile opportunity is the 367 KB global stylesheet; Lighthouse
reports about 258 KB as unused on the home page. It remains render-blocking
because making it asynchronous caused a CLS regression to 0.261. The safe next
phase is route-family CSS extraction with the required first-viewport rules
promoted into the critical stylesheet, then remeasure production through
PageSpeed Insights and Search Console Core Web Vitals.
