import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

import { discoverRouteFiles, extractPageData } from "./static-site-utils.js";
import { absoluteUrl, localeForRoute } from "./sitemap-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdawygld";
const UNIVERSAL_FORM_RE =
  /\n?\s*<!-- Section: Universal Formspree Consultation -->[\s\S]*?<!-- End Section: Universal Formspree Consultation -->\s*/gi;
const MANAGED_PARTIAL_SECTION_COMMENT_RE = /\n?\s*<!--\s*Section:\s*[\w\s/-]+ Partial\s*-->\s*/gi;
const FORMSPREE_FORM_RE = /<form\b[^>]*\baction=["']https:\/\/formspree\.io\/f\/[^"']+["'][^>]*>/i;
const WHATSAPP_ANCHOR_RE = /<a\b[^>]*\bhref=(["'])([^"']*(?:api\.whatsapp\.com|wa\.me)[^"']*)\1[^>]*>/gi;
const START_CONSULTATION_ANCHOR_RE = /<a\b[^>]*\bhref=(["'])([^"']*\/start-consultation\/[^"']*)\1[^>]*>/gi;
const IMG_RE = /<img\b[^>]*>/gi;
const IMAGE_PRELOAD_RE = /<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])[^>]*>/gi;
const RESPONSIVE_IMAGE_ROOT = "/assets/images/responsive";
const RESPONSIVE_IMAGE_WIDTHS = {
  hero: [480, 640, 960],
  portrait: [360, 540, 720]
};
const FORM_HIDDEN_NAMES = [
  "site_domain",
  "current_url",
  "canonical_url",
  "page_route",
  "page_title",
  "page_language",
  "page_family",
  "referrer_url",
  "referrer_domain",
  "landing_url",
  "landing_route",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "device_type",
  "viewport_width",
  "viewport_height",
  "timezone",
  "submitted_at",
  "form_placement"
];
const SECTION_CLASS_STOPWORDS = new Set([
  "container",
  "content-block",
  "d-none",
  "d-xl-flex",
  "download-gateway",
  "footer-panel",
  "hero-panel",
  "lead-form-block",
  "navbar",
  "navbar-expand-lg",
  "nav-item",
  "section",
  "site-main",
  "visually-hidden"
]);
const PARTIAL_HTML_DIRS = [path.join(ROOT, "partials", "en"), path.join(ROOT, "partials", "pt-br")];

const CRITICAL_CSS_SOURCE = `
:root {
  color-scheme: light;
  --mint-300: #74c69d;
  --mint-400: #52b788;
  --mint-700: #1b4332;
  --carbon-900: #081c15;
  --logo-gold: #c89832;
  --logo-gold-rgb: 200, 152, 50;
  --nav-surface-top: rgba(53, 37, 42, 0.96);
  --nav-surface-bottom: rgba(36, 25, 29, 0.98);
  --surface-base: #fbf3e3;
  --text-main: #10251d;
  --text-muted: rgba(16, 37, 29, 0.74);
  --text-inverse: #f5fff7;
  --heading-color: #0d221b;
  --accent: var(--mint-400);
  --accent-strong: var(--mint-700);
  --hero-top: rgba(4, 14, 10, 0.34);
  --hero-bottom: rgba(4, 14, 10, 0.68);
  --hero-side-left: rgba(4, 14, 10, 0.58);
  --hero-side-right: rgba(4, 14, 10, 0.3);
  --hero-glow: rgba(231, 154, 82, 0.24);
  --radius-xs: 0.95rem;
  --radius-md: 1.55rem;
  --radius-lg: 2rem;
  --container-width: 1880px;
  --construction-status-bar-height: 42px;
  --utility-bar-height: 34px;
  --main-nav-height: 112px;
  --sticky-stack-height: calc(var(--construction-status-bar-height) + var(--utility-bar-height) + var(--main-nav-height));
  --text-scale: 1;
  --font-display: "Iowan Old Style", "Georgia Pro", "Palatino Linotype", "Book Antiqua", serif;
  --font-body: "Avenir Next", "Segoe UI Variable", "Aptos", "Segoe UI", sans-serif;
  --font-label: "Franklin Gothic Medium", "Arial Narrow", "Aptos Narrow", sans-serif;
}
@media (max-width: 767px) {
  :root {
    --construction-status-bar-height: 44px;
    --utility-bar-height: 40px;
    --main-nav-height: 126px;
  }
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-padding-top: calc(var(--sticky-stack-height) + 1rem); font-size: calc(16px * var(--text-scale)); }
body {
  margin: 0;
  overflow-x: hidden;
  color: var(--text-main);
  background: linear-gradient(180deg, #fffdf8 0%, #fbf7ef 46%, #f7f1e8 100%);
  font-family: var(--font-body);
  line-height: 1.75;
}
body.theme-dark, body:not(.theme-light) {
  color-scheme: dark;
  --text-main: #e7f5eb;
  --text-muted: rgba(231, 245, 235, 0.74);
  --heading-color: #f1fbf4;
  --accent: var(--mint-300);
  --accent-strong: #b7e4c7;
  background: linear-gradient(180deg, #06140f 0%, #091b14 42%, #0e261d 100%);
}
[data-partial="utility-bar"] { display: block; min-height: calc(var(--construction-status-bar-height) + var(--utility-bar-height)); }
[data-partial="site-navigation"] { display: block; min-height: var(--main-nav-height); }
[data-partial="breadcrumbs"] { display: block; min-height: 88px; }
[data-partial="accessibility-panel"] { display: block; min-height: 0; }
.accessibility-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  width: min(420px, 100vw);
  max-width: 100vw;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(100%);
}
.accessibility-panel.is-open {
  visibility: visible;
  pointer-events: auto;
  transform: translateX(0);
}
.container, .container-xl, .container-xxl { width: min(var(--container-width), calc(100% - clamp(1.4rem, 2.8vw, 3.4rem))); margin-inline: auto; }
img { max-width: 100%; height: auto; }
a { color: var(--accent-strong); text-decoration-thickness: 0.1em; text-underline-offset: 0.18em; }
button, input, select, textarea { font: inherit; }
h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  color: var(--heading-color);
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.04;
}
h1 { font-size: clamp(3.25rem, 7vw, 5.6rem); }
h2 { font-size: clamp(2rem, 4.4vw, 3.35rem); }
p, li { font-size: 1rem; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 52px;
  padding: 0.88rem 1.42rem;
  border: 1px solid rgba(18, 41, 34, 0.12);
  border-radius: var(--radius-xs);
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
  text-decoration: none;
}
.btn-cta, .btn-cta:visited { color: #221409; background: linear-gradient(135deg, #fff2c7 0%, #f0ca79 30%, #d59a38 67%, #b45c3f 100%); }
.btn-secondary, .btn-secondary:visited { color: #fffaf2; background: linear-gradient(135deg, #2f8a5e 0%, #184c43 46%, #0f2c23 100%); }
.construction-status-bar { position: sticky; top: 0; z-index: 72; display: flex; align-items: center; min-height: var(--construction-status-bar-height); border-bottom: 1px solid rgba(var(--logo-gold-rgb), 0.26); background: linear-gradient(90deg, rgba(200, 152, 50, 0.18), rgba(82, 183, 136, 0.12), rgba(200, 152, 50, 0.18)), linear-gradient(180deg, rgba(45, 32, 36, 0.98), rgba(25, 18, 21, 0.98)); color: #fff8ee; }
.construction-status-bar__inner { display: grid; grid-template-columns: auto minmax(0, auto) auto; align-items: center; justify-content: center; min-height: var(--construction-status-bar-height); gap: 0.6rem; padding-block: 0.32rem; }
.construction-status-bar__signal { width: 0.58rem; height: 0.58rem; border-radius: 999px; background: var(--mint-300); box-shadow: 0 0 0 0.28rem rgba(116, 198, 157, 0.16), 0 0 22px rgba(116, 198, 157, 0.58); }
.construction-status-bar__copy { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; min-width: 0; margin: 0; gap: 0.38rem; color: rgba(255, 248, 238, 0.84); font-size: 0.78rem; line-height: 1.2; text-align: center; }
.construction-status-bar__copy strong { color: #fff0bf; font-family: var(--font-label); font-size: 0.68rem; font-weight: 900; letter-spacing: 0.08em; line-height: 1.1; text-transform: uppercase; }
.construction-status-bar__copy span { color: rgba(255, 248, 238, 0.82); }
.construction-status-bar__link { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 0.3rem 0.74rem; border: 1px solid rgba(255, 236, 178, 0.52); border-radius: 999px; background: linear-gradient(135deg, #fff4cf 0%, #efca75 42%, #c98b2d 100%); color: #211205; font-size: 0.68rem; font-weight: 900; line-height: 1; text-decoration: none; white-space: nowrap; }
.utility-bar, .main-nav { position: sticky; z-index: 60; background: linear-gradient(180deg, var(--nav-surface-top), var(--nav-surface-bottom)); color: var(--text-inverse); }
.utility-bar { top: var(--construction-status-bar-height); z-index: 71; min-height: var(--utility-bar-height); max-height: var(--utility-bar-height); overflow: hidden; }
.main-nav { top: calc(var(--construction-status-bar-height) + var(--utility-bar-height)); min-height: var(--main-nav-height); max-height: none; overflow: visible; }
.utility-inner, .main-nav .container, .main-header__upper, .main-header__actions, .main-header__center { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.main-header { display: grid; gap: 0.75rem; width: 100%; }
.main-header__identity { min-width: 0; }
.main-header__actions { justify-content: flex-end; }
.main-header__consult-prompt {
  display: grid;
  align-content: center;
  min-height: 44px;
  padding: 0.45rem 0.75rem;
  color: var(--text-inverse);
  text-decoration: none;
}
.main-header__consult-prompt span { display: block; line-height: 1.2; }
.navbar-toggler {
  display: inline-grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
}
.navbar-toggler-icon { display: block; width: 1.5rem; height: 1.5rem; }
.breadcrumbs {
  display: flex;
  align-items: center;
  min-height: 88px;
  max-height: 88px;
  overflow: hidden;
  padding: 0.7rem 0;
  color: var(--text-muted);
  background: rgba(255, 253, 248, 0.86);
}
.breadcrumbs ol {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.45rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  white-space: nowrap;
}
.breadcrumbs a { color: #114b39; }
.brand-wordmark, .brand-lockup { display: inline-flex; align-items: center; gap: 0.72rem; color: var(--text-inverse); text-decoration: none; }
.brand-wordmark__mark { width: 56px; height: 56px; object-fit: contain; }
.brand-wordmark__text { display: grid; line-height: 0.92; }
.navbar-nav { display: flex; flex-wrap: wrap; gap: 0.35rem; list-style: none; margin: 0; padding: 0; }
.nav-link, .dropdown-toggle, .main-header__home { color: var(--text-inverse); text-decoration: none; }
.main-nav .container { display: block; }
.main-header--redesign { gap: 0.72rem; padding: 0.74rem 0 0.82rem; }
.main-header--redesign .main-header__upper { display: grid; grid-template-areas: "identity actions"; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.9rem; }
.main-header--redesign .main-header__identity { grid-area: identity; }
.main-header--redesign .main-header__actions { grid-area: actions; display: flex; align-items: center; justify-content: flex-end; gap: 0.65rem; }
.main-header--redesign .main-header__lower { display: none !important; }
.main-header--redesign .desktop-primary-menu { display: flex; align-items: center; justify-content: center; flex-wrap: nowrap; width: 100%; gap: clamp(0.62rem, 1vw, 1.18rem); }
.main-header--redesign .desktop-primary-menu > .nav-item { flex: 0 0 auto; }
.main-header--redesign .main-header__home,
.main-header--redesign .desktop-primary-menu > .nav-item > .nav-link,
.main-header--redesign .desktop-primary-menu > .nav-item > .dropdown-toggle { min-height: 36px; padding: 0.42rem 0.14rem 0.5rem; border: 0; border-bottom: 2px solid transparent; border-radius: 0; background: transparent; color: rgba(255, 248, 238, 0.86); font-size: 0.88rem; font-weight: 700; letter-spacing: 0; line-height: 1; white-space: nowrap; }
.main-header--redesign .dropdown-toggle::after { margin-left: 0.34rem; border-top-color: var(--logo-gold); }
.main-header--redesign .main-header__consult-button { display: grid; align-content: center; justify-items: center; min-height: 46px; min-width: 9.75rem; padding: 0.5rem 0.86rem; border: 1px solid rgba(255, 231, 171, 0.52); border-radius: 8px; background: linear-gradient(135deg, #fff4cf 0%, #efca75 38%, #c98b2d 100%); color: #211205; text-decoration: none; }
.main-header--redesign .main-header__consult-kicker { color: rgba(39, 21, 6, 0.72); font-family: var(--font-label); font-size: 0.56rem; font-weight: 800; line-height: 1.1; text-transform: uppercase; }
.main-header--redesign .main-header__consult-link { color: #211205; font-size: 0.9rem; font-weight: 900; line-height: 1.1; }
.main-header--redesign ~ .navbar-collapse { width: 100%; }
.main-nav .dropdown-menu { display: block; opacity: 0; visibility: hidden; pointer-events: none; }
.main-nav .nav-item.show > .dropdown-menu { opacity: 1; visibility: visible; pointer-events: auto; }
.service-family-dropdown { position: static; }
.main-header--redesign .service-family-menu { position: fixed; top: calc(var(--construction-status-bar-height) + var(--utility-bar-height) + var(--main-nav-height) - 1px); left: 50%; z-index: 70; width: min(1060px, calc(100vw - 2rem)); max-height: min(74vh, 720px); padding: 1.16rem; border: 1px solid rgba(200, 152, 50, 0.22); border-radius: 8px; background: #fffaf2; overflow-y: auto; transform: translate(-50%, 0.45rem); }
.main-header--redesign .service-family-dropdown.show > .service-family-menu { transform: translate(-50%, 0); }
.main-header--redesign .service-family-menu__head { padding-bottom: 0.62rem; margin-bottom: 0.68rem; border-bottom: 1px solid rgba(45, 106, 79, 0.14); }
.main-header--redesign .service-family-menu__head p { display: none; }
.main-header--redesign .service-family-menu__heading h3 { margin: 0; color: #10251d; font-size: 1.18rem; letter-spacing: 0; }
.main-header--redesign .service-family-menu__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.4rem 0.9rem; }
.main-header--redesign .service-family-menu--compact .service-family-menu__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.main-header--redesign .service-family-menu__column { display: grid; gap: 0.18rem; }
.main-header--redesign .service-family-menu__link { display: flex; align-items: center; min-height: 2rem; padding: 0.32rem 0.46rem; border-radius: 6px; color: rgba(16, 37, 29, 0.82); font-size: 0.86rem; line-height: 1.25; text-decoration: none; }
.main-header--redesign ~ .navbar-collapse .mobile-nav-shell { border: 1px solid rgba(var(--logo-gold-rgb), 0.16); border-radius: 8px; background: linear-gradient(180deg, rgba(50, 35, 40, 0.98), rgba(33, 23, 27, 0.98)), rgba(40, 28, 33, 0.98); }
.mobile-nav-quicklinks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.42rem; margin-bottom: 0.72rem; }
.mobile-nav-home { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0.55rem 0.65rem; border: 1px solid rgba(var(--logo-gold-rgb), 0.18); border-radius: 8px; background: rgba(255, 248, 238, 0.06); color: rgba(255, 248, 238, 0.88); font-weight: 600; text-decoration: none; }
.mobile-nav-group { border-top: 1px solid rgba(var(--logo-gold-rgb), 0.14); }
.mobile-nav-group:last-of-type { border-bottom: 1px solid rgba(var(--logo-gold-rgb), 0.14); }
.mobile-nav-group summary { color: #fff8ee; }
.mobile-nav-group__intro { color: rgba(255, 248, 238, 0.72); }
.mobile-nav-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.42rem; }
.mobile-nav-links a { color: rgba(255, 248, 238, 0.88); }
@media (min-width: 1200px) {
  .main-header--redesign .main-header__lower { display: flex !important; justify-content: center; width: 100%; padding-top: 0.68rem; border-top: 1px solid rgba(var(--logo-gold-rgb), 0.18); }
  .main-header--redesign .navbar-toggler { display: none !important; }
}
@media (max-width: 1199px) {
  .main-header--redesign { padding: 0.54rem 0; }
  .main-header--redesign .main-header__lower { display: none !important; }
  .main-header--redesign .navbar-toggler { display: inline-flex; align-items: center; justify-content: center; width: 44px; min-width: 44px; height: 44px; min-height: 44px; padding: 0; border-radius: 8px; }
  .main-header--redesign ~ .navbar-collapse.show,
  .main-header--redesign ~ .navbar-collapse.collapsing { padding-top: 0.66rem; padding-bottom: 0.82rem; max-height: calc(100dvh - var(--construction-status-bar-height) - var(--utility-bar-height) - 0.5rem); overflow-y: auto; overscroll-behavior: contain; }
  .main-header--redesign ~ .navbar-collapse .mobile-nav-shell { padding: 0.82rem; }
}
@media (max-width: 767px) {
  .construction-status-bar__inner { gap: 0.42rem; }
  .construction-status-bar__copy { justify-content: flex-start; text-align: left; }
  .construction-status-bar__copy strong { font-size: 0.62rem; }
  .construction-status-bar__copy span { display: none; }
  .construction-status-bar__link { min-height: 26px; padding: 0.28rem 0.58rem; font-size: 0.62rem; }
  .main-header--redesign .main-header__consult-button { min-width: 7.25rem; min-height: 42px; padding: 0.42rem 0.58rem; }
  .main-header--redesign .main-header__consult-kicker { display: none; }
  .main-header--redesign .main-header__consult-link { font-size: 0.76rem; }
  .main-header--redesign .brand-lockup__image .brand-wordmark__mark { width: 42px; height: 42px; }
  .main-header--redesign ~ .navbar-collapse .mobile-nav-links { grid-template-columns: 1fr; }
}
.hero {
  position: relative;
  overflow: hidden;
  padding: clamp(2.9rem, 5vw, 4.4rem) 0 clamp(3.1rem, 6vw, 5rem);
  color: var(--text-inverse);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01)), linear-gradient(135deg, var(--accent-strong), #d9c1a2);
}
.hero-media { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: 0; }
.hero-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, var(--hero-top) 0%, rgba(4, 14, 10, 0.18) 26%, var(--hero-bottom) 100%), linear-gradient(104deg, var(--hero-side-left) 0%, rgba(4, 14, 10, 0.3) 42%, rgba(4, 14, 10, 0.08) 62%, var(--hero-side-right) 100%); }
.hero-inner { position: relative; z-index: 2; display: grid; grid-template-columns: minmax(0, 1fr); align-items: stretch; gap: clamp(1.25rem, 2vw, 2.1rem); }
.hero-copy {
  max-width: none;
  min-height: 100%;
  padding: clamp(1.15rem, 1.8vw, 1.55rem);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: calc(var(--radius-lg) - 0.15rem);
  background: rgba(4, 14, 10, 0.74);
}
.hero h1, .hero h2, .hero h3, .hero .eyebrow, .hero-kicker { color: var(--text-inverse); }
.hero-summary { max-width: 43rem; margin-bottom: 0.9rem; color: rgba(245, 255, 247, 0.9); }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 0.1rem; }
.hero-meta { display: none; width: min(390px, 100%); min-width: 0; gap: 0.82rem; align-content: start; justify-self: end; }
.hero-panel { padding: 1rem 1.05rem; border-radius: var(--radius-md); background: rgba(4, 14, 10, 0.6); color: var(--text-inverse); }
body.site-root .home-hero { padding-bottom: 4.8rem; }
body.site-root .home-hero .hero-copy { max-width: 40rem; background: rgb(9 27 23 / 96%); }
body.site-root .home-hero h1 { max-width: 10.5ch; font-size: clamp(3.2rem, 5.6vw, 5.2rem); line-height: 0.94; }
body.site-root .home-hero-tagline, body.site-root .home-hero .hero-summary { color: rgba(248, 244, 236, 0.92); }
body.site-root .home-signal-list { display: grid; gap: 0.72rem; max-width: 38rem; margin: 1.15rem 0 0.1rem; padding: 0; list-style: none; }
body.site-root .home-hero-portrait { display: grid; align-items: end; justify-items: center; overflow: hidden; padding: 1rem 1rem 0; background: #111a28; }
body.site-root .home-hero-portrait img { display: block; width: min(100%, 24rem); height: clamp(20rem, 33vw, 28rem); object-fit: contain; object-position: center bottom; }
body.site-root .home-hero-portrait figcaption { display: grid; gap: 0.3rem; padding: 0.95rem 1rem 1.1rem; justify-items: center; text-align: center; }
.main-shell, .content-column, .content-block, .lead-form-block, .universal-consultation-form, .site-disclaimer, .topic-section { position: relative; }
.content-block, .lead-form-block, .universal-consultation-form, .site-disclaimer {
  padding: clamp(1.15rem, 2.4vw, 1.6rem);
  border: 1px solid rgba(27, 67, 50, 0.12);
  border-radius: var(--radius-md);
  background: rgba(255, 253, 248, 0.96);
  color: var(--text-main);
}
.lead-form, .lead-form-compact { display: grid; width: min(100%, 46rem); margin-inline: auto; gap: 0.9rem; }
.lead-form-block:has(.lead-form) { width: min(100%, 58rem); margin-inline: auto; }
.lead-form-block:has(.lead-form) .section-head { max-width: 44rem; margin-inline: auto; text-align: center; }
.lead-form label { display: grid; gap: 0.35rem; color: var(--text-main); }
.lead-form input, .lead-form textarea, .lead-form select {
  width: 100%;
  min-height: 48px;
  padding: 0.78rem 0.85rem;
  border: 1px solid rgba(27, 67, 50, 0.18);
  border-radius: 0.75rem;
  color: #10251d;
  -webkit-text-fill-color: #10251d;
  background: #fff;
}
.lead-form textarea { min-height: 9rem; }
.lead-form button { width: auto; min-width: min(100%, 14rem); justify-self: start; }
.form-honeypot { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.form-consent { grid-template-columns: auto 1fr; align-items: start; }
.home-link-group a, .footer-link-list a, .footer-panel a {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  color: #114b39;
}
.home-route-options { display: flex; flex-wrap: wrap; gap: 0.85rem; }
.home-route-option {
  display: grid;
  align-content: center;
  min-height: 72px;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(27, 67, 50, 0.12);
  border-radius: var(--radius-xs);
  color: #10251d;
  background: rgba(255, 253, 248, 0.94);
  text-decoration: none;
}
.cta-pair { display: flex; flex-wrap: wrap; gap: 0.9rem; align-items: center; }
.cta-pair .btn { min-width: 12rem; }
.site-footer {
  position: relative;
  padding: 2rem 0 1.2rem;
  color: #f5ecdb;
  background: linear-gradient(180deg, #123627, #081c15);
}
.site-footer a, .site-footer h2, .site-footer h3, .site-footer strong { color: #fff8ee; }
.footer-grid, .footer-grid--directory, .footer-grid--simple { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); }
.footer-link-list { list-style: none; display: grid; gap: 0.25rem; margin: 0; padding: 0; }
.footer-panel a { color: #fff8ee; text-decoration: none; }
.floating-whatsapp {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 1000;
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  background: #1f8f5f;
}
.floating-whatsapp img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
@media (max-width: 991px) {
  .hero-inner, body.site-root .hero-inner { grid-template-columns: 1fr; gap: 1rem; }
  .hero-meta, body.site-root .hero-meta { width: 100%; justify-self: stretch; }
}
@media (max-width: 767px) {
  .container, .container-xl, .container-xxl { width: min(var(--container-width), calc(100% - 1.4rem)); }
  .lead-form, .lead-form button { width: 100%; }
  .lead-form button { justify-self: stretch; }
  .navbar-nav { display: none; }
  .hero, body.site-root .hero { padding: 2.35rem 0 2.8rem; }
  .hero-copy, body.site-root .hero-copy, .hero-panel, body.site-root .hero-panel { padding: 1rem; }
  .hero h1, body.site-root .hero h1 { font-size: clamp(2.5rem, 12vw, 3.4rem); line-height: 0.96; }
  .hero-actions, .hero-actions .btn { width: 100%; }
  .cta-pair, .cta-pair .btn { width: 100%; }
}
`;

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function decodeAttribute(value = "") {
  let decoded = String(value);
  for (let index = 0; index < 3; index += 1) {
    const next = decoded
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function normalizeSpace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function slugify(value = "") {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "page"
  );
}

function routeSegments(route) {
  return route.replace(/^\/pt-br\//, "/").replace(/^\/|\/$/g, "").split("/").filter(Boolean);
}

function isPtRoute(route) {
  return route === "/pt-br/" || route.startsWith("/pt-br/");
}

function routeLanguage(route) {
  return isPtRoute(route) ? "pt-BR" : "en";
}

function readRuntimeConfig(html) {
  const match = html.match(/window\.ITB_SITE\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch {
    return {};
  }
}

function readCanonical(html, route) {
  const match = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i);
  return match?.[1] || absoluteUrl(route);
}

function shouldReceiveUniversalForm(pageData) {
  return !pageData.noindex;
}

function cleanStrayAttributeSlash(tag) {
  return tag.replace(/\/\s+(?=[\w:-]+=(["']))/g, " ");
}

function appendAttribute(tag, name, value) {
  const cleanTag = cleanStrayAttributeSlash(tag);
  const selfClosing = /\s*\/>$/.test(cleanTag);
  const closing = selfClosing ? " />" : ">";
  return cleanTag.replace(/\s*\/?>$/, ` ${name}="${escapeAttribute(value)}"${closing}`);
}

function withAttribute(tag, name, value = "true") {
  const cleanTag = cleanStrayAttributeSlash(tag);
  const pattern = new RegExp(`\\s${name}(?:=(["'])[\\s\\S]*?\\1)?`, "i");
  if (pattern.test(cleanTag)) {
    return cleanTag.replace(pattern, ` ${name}="${escapeAttribute(value)}"`);
  }
  return appendAttribute(cleanTag, name, value);
}

function upsertAttribute(tag, name, value) {
  const cleanTag = cleanStrayAttributeSlash(tag);
  const pattern = new RegExp(`\\s${name}=(["'])[\\s\\S]*?\\1`, "i");
  if (pattern.test(cleanTag)) {
    return cleanTag.replace(pattern, ` ${name}="${escapeAttribute(value)}"`);
  }
  return appendAttribute(cleanTag, name, value);
}

function removeAttribute(tag, name) {
  return cleanStrayAttributeSlash(tag).replace(new RegExp(`\\s${name}(?:=(["'])[\\s\\S]*?\\1)?`, "i"), "");
}

function getAttributeValue(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=(["'])([\\s\\S]*?)\\1`, "i"));
  return match ? match[2] : "";
}

function getAnchorHref(tag) {
  const match = tag.match(/\bhref=(["'])([\s\S]*?)\1/i);
  return match ? match[2] : "";
}

function humanizeSectionLabel(value = "") {
  const normalized = normalizeSpace(
    decodeAttribute(value)
      .replace(/^section-\d+-/i, "")
      .replace(/^section-\d+/i, "section")
      .replace(/\b(?:true|false)\b/gi, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
  );
  if (!normalized) return "Content Section";
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (["ai", "cpf", "cta", "faq", "gdpr", "gtm", "lgpd", "pt", "seo"].includes(lower)) return lower.toUpperCase();
      if (lower === "whatsapp") return "WhatsApp";
      if (lower === "brazil") return "Brazil";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function classLabelForTag(tag) {
  const classes = decodeAttribute(getAttributeValue(tag, "class"))
    .split(/\s+/)
    .map((className) => className.replace(/__.*/, "").replace(/--.*/, ""))
    .filter(Boolean);
  const preferred = classes.find((className) => !SECTION_CLASS_STOPWORDS.has(className)) || classes[0] || "";
  return preferred ? humanizeSectionLabel(preferred) : "";
}

function sectionLabelForTag(tag, fallback = "Content Section") {
  const ariaLabel = getAttributeValue(tag, "aria-label");
  if (ariaLabel) return humanizeSectionLabel(ariaLabel);

  const id = getAttributeValue(tag, "id");
  if (id) return humanizeSectionLabel(id);

  return classLabelForTag(tag) || fallback;
}

function sectionLabelForPartial(tag) {
  const partialName = getAttributeValue(tag, "data-partial");
  return partialName ? `${humanizeSectionLabel(partialName)} Partial` : "Shared Partial";
}

function sectionLabelForHeader(tag) {
  const className = decodeAttribute(getAttributeValue(tag, "class"));
  if (/\bhero\b/i.test(className)) return "Page Hero";
  return sectionLabelForTag(tag, "Header");
}

function sectionLabelForFooter(tag) {
  const id = getAttributeValue(tag, "id");
  if (id) return humanizeSectionLabel(id);
  return sectionLabelForTag(tag, "Footer");
}

function alreadyHasSectionComment(sourceBeforeMatch) {
  return /<!--\s*Section:\s*[^>]+-->\s*$/i.test(sourceBeforeMatch.slice(-320));
}

function annotateOpeningTags(html, pattern, labelForTag) {
  let output = "";
  let lastIndex = 0;

  for (const match of html.matchAll(pattern)) {
    const tag = match[0];
    const index = match.index || 0;
    output += html.slice(lastIndex, index);
    if (!alreadyHasSectionComment(output)) {
      output += `\n<!-- Section: ${labelForTag(tag)} -->\n`;
    }
    output += tag;
    lastIndex = index + tag.length;
  }

  return `${output}${html.slice(lastIndex)}`;
}

function annotateHtmlSections(html) {
  let next = html.replace(MANAGED_PARTIAL_SECTION_COMMENT_RE, "\n");
  next = annotateOpeningTags(next, /<div\b(?=[^>]*\bdata-partial=(["'])[^"']+\1)[^>]*>\s*<\/div>/gi, sectionLabelForPartial);
  next = annotateOpeningTags(next, /<main\b[^>]*>/gi, () => "Main Content");
  next = annotateOpeningTags(next, /<header\b[^>]*>/gi, sectionLabelForHeader);
  next = annotateOpeningTags(next, /<footer\b(?=[^>]*(?:\bid=["'][^"']+["']|\bclass=["'][^"']*\bsite-footer\b[^"']*["']))[^>]*>/gi, sectionLabelForFooter);
  next = annotateOpeningTags(next, /<aside\b[^>]*>/gi, (tag) => sectionLabelForTag(tag, "Sidebar"));
  next = annotateOpeningTags(next, /<nav\b[^>]*>/gi, (tag) => sectionLabelForTag(tag, "Navigation"));
  next = annotateOpeningTags(next, /<section\b[^>]*>/gi, (tag) => sectionLabelForTag(tag));
  return next;
}

function setAnchorHref(tag, href) {
  return tag.replace(/\bhref=(["'])([\s\S]*?)\1/i, `href="${escapeAttribute(href)}"`);
}

function buildWhatsAppMessage(route, pageTitle, isPt) {
  if (isPt) {
    return `Ola, vim da pagina ${pageTitle} (${route}) em immigratetobrazil.com e gostaria de falar com a advogada Monique.`;
  }
  return `Hello, I came from ${pageTitle} (${route}) on immigratetobrazil.com and would like to talk to attorney Monique.`;
}

function rewriteWhatsAppHref(rawHref, route, pageTitle, isPt) {
  const decoded = decodeAttribute(rawHref);
  try {
    const url = new URL(decoded);
    if (!/(\b|\.)(api\.whatsapp\.com|wa\.me)$/i.test(url.hostname)) return rawHref;
    for (const key of [...url.searchParams.keys()]) {
      if (/^amp;/i.test(key)) {
        const cleanKey = key.replace(/^amp;/i, "");
        if (cleanKey && !url.searchParams.has(cleanKey)) url.searchParams.set(cleanKey, url.searchParams.get(key) || "");
        url.searchParams.delete(key);
      }
    }
    url.searchParams.set("text", buildWhatsAppMessage(route, pageTitle, isPt));
    return url.toString();
  } catch {
    return rawHref;
  }
}

function normalizeContactAnchors(html, route, pageTitle) {
  const isPt = isPtRoute(route);
  let next = html.replace(WHATSAPP_ANCHOR_RE, (tag) => {
    let updated = tag;
    const href = getAnchorHref(updated);
    if (href) updated = setAnchorHref(updated, rewriteWhatsAppHref(href, route, pageTitle, isPt));
    updated = withAttribute(updated, "data-whatsapp-click", "true");
    if (!/\brel=/i.test(updated)) updated = withAttribute(updated, "rel", "noopener noreferrer");
    return updated;
  });

  next = next.replace(START_CONSULTATION_ANCHOR_RE, (tag) => withAttribute(tag, "data-cta-click", "true"));
  return next;
}

function escapeStyleContent(value = "") {
  return String(value).replace(/<\/style/gi, "<\\/style");
}

function buildManagedCssBlock(criticalCss) {
  return `<style data-itb-critical-css>${escapeStyleContent(criticalCss)}</style>
<link rel="stylesheet" href="/css/site.min.css" data-itb-full-css>
<noscript><link rel="stylesheet" href="/css/site.min.css"></noscript>`;
}

function normalizeStylesheets(html, criticalCss) {
  let next = html
    .replace(/href=(["'])\/assets\/vendor\/bootstrap\/bootstrap\.min\.css\1/gi, 'href="/css/bootstrap-lite.css"')
    .replace(/href=(["'])\/css\/site\.css\1/gi, 'href="/css/site.min.css"');

  next = next
    .replace(/\s*<style\b[^>]*\bdata-itb-critical-css\b[^>]*>[\s\S]*?<\/style>\s*/gi, "\n")
    .replace(/\s*<script\b[^>]*\bdata-itb-deferred-css\b[^>]*>[\s\S]*?<\/script>\s*/gi, "\n")
    .replace(/\s*<noscript>\s*<link\b(?=[^>]*\bhref=["']\/css\/site\.min\.css["'])[^>]*>\s*<\/noscript>\s*/gi, "\n")
    .replace(/\s*<link\b(?=[^>]*\bhref=["']\/css\/site\.min\.css["'])[^>]*>\s*/gi, "\n")
    .replace(/\s*<noscript>\s*<\/noscript>\s*/gi, "\n");

  const block = buildManagedCssBlock(criticalCss);
  const bootstrapLinkRe = /<link\b(?=[^>]*\bhref=["']\/css\/bootstrap-lite\.css["'])[^>]*>/i;
  if (bootstrapLinkRe.test(next)) {
    return next.replace(bootstrapLinkRe, (match) => `${match}\n${block}`);
  }
  return next.replace(/<\/head>/i, `${block}\n</head>`);
}

function srcFromImageTag(tag) {
  return decodeAttribute(getAttributeValue(tag, "src")).split(/[?#]/)[0];
}

function isManagedImageSource(src) {
  return src.startsWith("/assets/images/") && !src.startsWith(`${RESPONSIVE_IMAGE_ROOT}/`) && !/\.svg$/i.test(src);
}

function isResponsiveImageSource(src) {
  return src.startsWith(`${RESPONSIVE_IMAGE_ROOT}/`) && /-\d+\.webp$/i.test(src);
}

function originalCandidatesForResponsiveImage(src) {
  if (!isResponsiveImageSource(src)) return [src];
  const relative = src.replace(`${RESPONSIVE_IMAGE_ROOT}/`, "").replace(/-\d+\.webp$/i, "");
  return [".png", ".webp", ".jpg", ".jpeg"].map((extension) => `/assets/images/${relative}${extension}`);
}

async function resolveOriginalImageSource(src) {
  for (const candidate of originalCandidatesForResponsiveImage(src)) {
    if (!isManagedImageSource(candidate)) continue;
    try {
      await fs.access(sourcePathForImage(candidate));
      return candidate;
    } catch {
      // Try the next source extension.
    }
  }
  return src;
}

function sourcePathForImage(src) {
  if (!isManagedImageSource(src)) return null;
  return path.join(ROOT, src.replace(/^\//, ""));
}

function responsiveBaseForImage(src) {
  const relative = src.replace(/^\/assets\/images\//, "");
  const parsed = path.posix.parse(relative);
  return path.posix.join(RESPONSIVE_IMAGE_ROOT, parsed.dir, parsed.name);
}

function responsiveUrl(src, width) {
  return `${responsiveBaseForImage(src)}-${width}.webp`;
}

function responsiveFilePath(src, width) {
  return path.join(ROOT, responsiveUrl(src, width).replace(/^\//, ""));
}

function imageKindForTag(tag, src) {
  if (/\bclass=(["'])[\s\S]*?\bhero-media\b[\s\S]*?\1/i.test(tag)) return "hero";
  if (/portrait|monique-fernandes|pages\/about|pages\/process\/shared/i.test(src)) return "portrait";
  return null;
}

function imageSizesForKind(kind) {
  if (kind === "hero") return "(max-width: 767px) 60vw, 960px";
  if (kind === "portrait") return "(max-width: 767px) 88vw, 24rem";
  return "(max-width: 767px) 92vw, 40vw";
}

function srcsetForRecord(record) {
  return record.variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ");
}

function normalizeImagePreloads(html, responsiveImages) {
  return html.replace(IMAGE_PRELOAD_RE, (tag) => {
    const href = decodeAttribute(getAttributeValue(tag, "href")).split(/[?#]/)[0];
    const record = responsiveImages.get(href);
    if (!record || !record.variants.length) return tag;
    let updated = tag;
    updated = upsertAttribute(updated, "href", record.variants[record.variants.length - 1].url);
    updated = upsertAttribute(updated, "imagesrcset", srcsetForRecord(record));
    updated = upsertAttribute(updated, "imagesizes", imageSizesForKind(record.kind));
    return updated;
  });
}

function normalizeImages(html, responsiveImages) {
  let heroMediaSeen = false;
  return html.replace(IMG_RE, (tag) => {
    const isHeroMedia = /\bclass=(["'])[\s\S]*?\bhero-media\b[\s\S]*?\1/i.test(tag);
    const src = srcFromImageTag(tag);
    const record = responsiveImages.get(src);
    let updated = cleanStrayAttributeSlash(tag);

    if (record?.variants?.length) {
      if (record.originalSrc && src !== record.originalSrc) {
        updated = upsertAttribute(updated, "src", record.originalSrc);
      }
      updated = upsertAttribute(updated, "srcset", srcsetForRecord(record));
      updated = upsertAttribute(updated, "sizes", imageSizesForKind(record.kind));
    }

    if (isHeroMedia && !heroMediaSeen) {
      heroMediaSeen = true;
      updated = upsertAttribute(updated, "loading", "eager");
      updated = upsertAttribute(updated, "fetchpriority", "high");
      updated = upsertAttribute(updated, "decoding", "async");
      return updated;
    }

    updated = upsertAttribute(updated, "loading", "lazy");
    updated = upsertAttribute(updated, "decoding", "async");
    if (/\sfetchpriority=/i.test(updated)) updated = upsertAttribute(updated, "fetchpriority", "low");
    return updated;
  });
}

function buildHiddenInput(name, value = "", dynamic = true) {
  const dynamicAttr = dynamic ? ` data-itb-attribution="${escapeAttribute(name)}"` : "";
  return `<input type="hidden" name="${escapeAttribute(name)}" value="${escapeAttribute(value)}"${dynamicAttr} />`;
}

function buildUniversalForm({ route, title, family, canonical, isPt }) {
  const subject = isPt
    ? `Consulta pelo site | ${title} | PT`
    : `Website consultation request | ${title} | EN`;
  const formName = `page-consultation-${isPt ? "pt" : "en"}-${slugify(route)}`;
  const serviceDefault = routeSegments(route).slice(0, 3).join(" / ") || "general";
  const hiddenFields = [
    buildHiddenInput("_subject", subject, false),
    buildHiddenInput("form_name", formName, false),
    buildHiddenInput("lead_source", "page-consultation-form", false),
    buildHiddenInput("site_domain", "immigratetobrazil.com"),
    buildHiddenInput("current_url"),
    buildHiddenInput("canonical_url", canonical),
    buildHiddenInput("page_route", route),
    buildHiddenInput("page_title", title),
    buildHiddenInput("page_language", isPt ? "pt-BR" : "en"),
    buildHiddenInput("page_family", family || ""),
    buildHiddenInput("referrer_url"),
    buildHiddenInput("referrer_domain"),
    buildHiddenInput("landing_url"),
    buildHiddenInput("landing_route"),
    buildHiddenInput("utm_source"),
    buildHiddenInput("utm_medium"),
    buildHiddenInput("utm_campaign"),
    buildHiddenInput("utm_term"),
    buildHiddenInput("utm_content"),
    buildHiddenInput("utm_id"),
    buildHiddenInput("gclid"),
    buildHiddenInput("fbclid"),
    buildHiddenInput("msclkid"),
    buildHiddenInput("device_type"),
    buildHiddenInput("viewport_width"),
    buildHiddenInput("viewport_height"),
    buildHiddenInput("timezone"),
    buildHiddenInput("submitted_at"),
    buildHiddenInput("form_placement", "universal-page-form")
  ].join("\n      ");

  const copy = isPt
    ? {
        kicker: "Fale com Monique",
        title: "Solicite uma consulta sobre esta pagina",
        summary:
          "Envie um resumo curto para que Monique Fernandes entenda de onde voce esta vindo, qual pagina orientou sua pergunta e qual proximo passo pode fazer sentido.",
        name: "Nome completo",
        email: "E-mail",
        phone: "Telefone / WhatsApp",
        country: "Pais atual",
        service: "Assunto principal",
        message: "Mensagem",
        consent:
          "Autorizo o envio destas informacoes para analise inicial. Entendo que a consulta ou representacao depende de confirmacao escrita.",
        button: "Enviar para Monique",
        note:
          "O formulario registra automaticamente a pagina, idioma, origem e parametros de campanha para que a resposta seja mais precisa."
      }
    : {
        kicker: "Contact Monique",
        title: "Request a consultation with Monique Fernandes",
        summary:
          "Share a short summary so Monique Fernandes can understand your situation and identify the most appropriate next step for review.",
        name: "Full name",
        email: "Email",
        phone: "Phone / WhatsApp",
        country: "Current country",
        service: "Main topic",
        message: "Message",
        consent:
          "I authorize this information to be sent for initial review. I understand consultation or representation depends on written confirmation.",
        button: "Send to Monique",
        note:
          "This form records basic page and referral context so the reply can be more precise."
      };

  return `
<!-- Section: Universal Formspree Consultation -->
<section class="lead-form-block universal-consultation-form" id="page-consultation-form" data-universal-formspree="true">
  <div class="section-head">
    <p class="section-kicker">${escapeHtml(copy.kicker)}</p>
    <h2 class="section-title"><span>${escapeHtml(copy.title)}</span></h2>
    <p>${escapeHtml(copy.summary)}</p>
  </div>
  <form action="${FORMSPREE_ENDPOINT}" method="POST" class="lead-form lead-form-compact universal-consultation-form__form" data-formspree-group="${escapeAttribute(formName)}" data-itb-contact-form="true">
      ${hiddenFields}
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="form-honeypot" aria-hidden="true" />
      <label>${escapeHtml(copy.name)}<input type="text" name="full_name" autocomplete="name" required /></label>
      <label>${escapeHtml(copy.email)}<input type="email" name="email" autocomplete="email" required /></label>
      <label>${escapeHtml(copy.phone)}<input type="tel" name="phone_whatsapp" autocomplete="tel" required /></label>
      <label>${escapeHtml(copy.country)}<input type="text" name="country" autocomplete="country-name" /></label>
      <label>${escapeHtml(copy.service)}<input type="text" name="service_interest" value="${escapeAttribute(serviceDefault)}" /></label>
      <label>${escapeHtml(copy.message)}<textarea name="message" rows="5" required></textarea></label>
      <label class="form-consent"><input type="checkbox" name="contact_consent" value="yes" required /> <span>${escapeHtml(copy.consent)}</span></label>
      <p class="form-note">${escapeHtml(copy.note)}</p>
      <button type="submit" class="btn btn-cta" data-cta-click="true">${escapeHtml(copy.button)}</button>
    </form>
</section>
<!-- End Section: Universal Formspree Consultation -->
`;
}

function insertUniversalForm(html, formHtml) {
  const clean = html.replace(UNIVERSAL_FORM_RE, "\n");
  if (FORMSPREE_FORM_RE.test(clean)) return clean;

  if (/<div\s+data-partial=["']disclaimer["']\s*>\s*<\/div>/i.test(clean)) {
    return clean.replace(/<div\s+data-partial=["']disclaimer["']\s*>\s*<\/div>/i, `${formHtml}\n        <div data-partial="disclaimer"></div>`);
  }

  if (/<\/article>\s*<aside\b/i.test(clean)) {
    return clean.replace(/<\/article>\s*<aside\b/i, `${formHtml}\n        </article>\n<aside`);
  }

  if (/<\/main>/i.test(clean)) {
    return clean.replace(/<\/main>/i, `${formHtml}\n  </main>`);
  }

  return clean;
}

function ensureFormFields(html, route, pageTitle, family, canonical) {
  const isPt = isPtRoute(route);
  const formDefaults = {
    site_domain: "immigratetobrazil.com",
    canonical_url: canonical,
    page_route: route,
    page_title: pageTitle,
    page_language: isPt ? "pt-BR" : "en",
    page_family: family || ""
  };

  return html.replace(/(<form\b[^>]*\baction=["']https:\/\/formspree\.io\/f\/[^"']+["'][^>]*>)([\s\S]*?)(<\/form>)/gi, (match, open, body, close) => {
    let nextBody = body;
    for (const name of FORM_HIDDEN_NAMES) {
      if (new RegExp(`\\bname=["']${name}["']`, "i").test(nextBody)) continue;
      nextBody = `\n      ${buildHiddenInput(name, formDefaults[name] || "")}${nextBody}`;
    }
    if (!/\bname=["']_gotcha["']/i.test(nextBody)) {
      nextBody = `\n      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="form-honeypot" aria-hidden="true" />${nextBody}`;
    }
    const nextOpen = /\bdata-itb-contact-form=/i.test(open)
      ? open
      : open.replace(/>$/, ' data-itb-contact-form="true">');
    return `${nextOpen}${nextBody}${close}`;
  });
}

function addFormIfNeeded(html, pageData, route, runtime) {
  const canonical = readCanonical(html, route);
  const title = normalizeSpace(runtime.pageTitle || pageData.title || "Immigrate to Brazil");
  const family = runtime.pageFamily || pageData.family || "";
  let next = html;

  if (shouldReceiveUniversalForm(pageData)) {
    next = insertUniversalForm(
      next,
      buildUniversalForm({
        route,
        title,
        family,
        canonical,
        isPt: isPtRoute(route)
      })
    );
  } else {
    next = next.replace(UNIVERSAL_FORM_RE, "\n");
  }

  return ensureFormFields(next, route, title, family, canonical);
}

async function collectResponsiveImageCandidates(routeFiles) {
  const candidates = new Map();

  for (const entry of routeFiles) {
    const html = await fs.readFile(entry.filePath, "utf8");
    for (const tag of html.match(IMG_RE) || []) {
      const src = await resolveOriginalImageSource(srcFromImageTag(tag));
      if (!isManagedImageSource(src)) continue;
      const kind = imageKindForTag(tag, src);
      if (!kind) continue;
      const sourcePath = sourcePathForImage(src);
      try {
        await fs.access(sourcePath);
      } catch {
        continue;
      }
      const record = candidates.get(src) || {
        src,
        sourcePath,
        kind,
        widths: new Set(),
        variants: []
      };
      record.kind = record.kind === "hero" ? "hero" : kind;
      for (const width of RESPONSIVE_IMAGE_WIDTHS[kind] || []) {
        record.widths.add(width);
      }
      candidates.set(src, record);
    }
  }

  return candidates;
}

function canRunMagick() {
  const result = spawnSync("magick", ["-version"], { encoding: "utf8" });
  return result.status === 0;
}

async function syncResponsiveImages(routeFiles) {
  const candidates = await collectResponsiveImageCandidates(routeFiles);
  if (!candidates.size) return { responsiveImages: new Map(), generated: 0, skipped: 0 };

  const magickAvailable = canRunMagick();
  let generated = 0;
  let skipped = 0;
  const responsiveImages = new Map();

  for (const record of candidates.values()) {
    const sourceStat = await fs.stat(record.sourcePath);
    const variants = [];
    for (const width of [...record.widths].sort((left, right) => left - right)) {
      const outputPath = responsiveFilePath(record.src, width);
      const outputUrl = responsiveUrl(record.src, width);
      let shouldGenerate = magickAvailable;
      try {
        const outputStat = await fs.stat(outputPath);
        shouldGenerate = magickAvailable && outputStat.mtimeMs < sourceStat.mtimeMs;
      } catch {
        shouldGenerate = magickAvailable;
      }

      if (shouldGenerate) {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        const quality = record.kind === "hero" ? "72" : "76";
        const result = spawnSync(
          "magick",
          [record.sourcePath, "-auto-orient", "-resize", `${width}x`, "-strip", "-quality", quality, outputPath],
          { encoding: "utf8" }
        );
        if (result.status === 0) generated += 1;
        else skipped += 1;
      }

      try {
        await fs.access(outputPath);
        variants.push({ width, url: outputUrl });
      } catch {
        skipped += 1;
      }
    }

    if (variants.length) {
      const finalRecord = {
        originalSrc: record.src,
        kind: record.kind,
        variants
      };
      responsiveImages.set(record.src, finalRecord);
      for (const variant of variants) {
        responsiveImages.set(variant.url, finalRecord);
      }
    }
  }

  return { responsiveImages, generated, skipped };
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

async function writeIfChanged(filePath, content) {
  let current = "";
  try {
    current = await fs.readFile(filePath, "utf8");
  } catch {
    // New file.
  }
  if (current === content) return false;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
  return true;
}

async function syncMinifiedCss() {
  const source = await fs.readFile(path.join(ROOT, "css", "site.css"), "utf8");
  const minified = `${minifyCss(source)}\n`;
  return writeIfChanged(path.join(ROOT, "css", "site.min.css"), minified);
}

async function syncCriticalCss() {
  return writeIfChanged(path.join(ROOT, "css", "critical.css"), `${minifyCss(CRITICAL_CSS_SOURCE)}\n`);
}

async function discoverPartialHtmlFiles() {
  const files = [];
  for (const dir of PARTIAL_HTML_DIRS) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".html")) files.push(path.join(dir, entry.name));
    }
  }
  return files.sort();
}

async function syncAnnotatedPartials() {
  const files = await discoverPartialHtmlFiles();
  let updated = 0;

  for (const filePath of files) {
    const current = await fs.readFile(filePath, "utf8");
    const next = annotateHtmlSections(current);
    if (next === current) continue;
    await fs.writeFile(filePath, next, "utf8");
    updated += 1;
  }

  return updated;
}

function buildLlmsTxt() {
  return `# Immigrate to Brazil

Immigrate to Brazil is the Brazil immigration guidance site led by attorney Monique Fernandes.

Primary entity:
- Monique Fernandes: Brazilian immigration attorney, OAB/BAR registered, supporting clients in English and Portuguese.
- Site: https://immigratetobrazil.com/
- Main lawyer page: https://immigratetobrazil.com/about/lawyer/
- About hub: https://immigratetobrazil.com/about/
- Services hub: https://immigratetobrazil.com/services/
- Consultation: https://immigratetobrazil.com/start-consultation/
- Portuguese home: https://immigratetobrazil.com/pt-br/
- Portuguese consultation: https://immigratetobrazil.com/pt-br/start-consultation/

Core topics:
- Brazil visas
- Brazil residency
- Brazilian naturalisation and citizenship
- Immigration defense, regularization, compliance, and planning
- Relocation and life in Brazil

Preferred discovery files:
- XML sitemap index: https://immigratetobrazil.com/sitemap.xml
- Human sitemap: https://immigratetobrazil.com/sitemap.html
- AI route manifest: https://immigratetobrazil.com/data/ai-route-manifest.json

Contact:
- Formspree consultation forms are embedded on indexable client-facing pages.
- WhatsApp contact is available from page CTAs and includes page context.
`;
}

function buildAiRouteManifest(routeFiles, pageDataByRoute) {
  const keyRoutes = [
    "/",
    "/about/",
    "/about/lawyer/",
    "/about/about/",
    "/about/profile/",
    "/services/",
    "/services/visas/",
    "/services/residencies/",
    "/services/naturalisation/",
    "/services/defense/",
    "/process/",
    "/brazil/",
    "/countries/",
    "/insights/",
    "/start-consultation/",
    "/pt-br/",
    "/pt-br/about/",
    "/pt-br/about/lawyer/",
    "/pt-br/services/",
    "/pt-br/start-consultation/"
  ];
  const routes = keyRoutes
    .filter((route) => pageDataByRoute.has(route))
    .map((route) => {
      const data = pageDataByRoute.get(route);
      return {
        route,
        url: absoluteUrl(route),
        title: data.title,
        description: data.summary,
        language: routeLanguage(route),
        indexable: !data.noindex
      };
    });

  const indexableCounts = routeFiles.reduce(
    (counts, entry) => {
      const data = pageDataByRoute.get(entry.route);
      if (!data || data.noindex) return counts;
      const locale = localeForRoute(entry.route);
      counts[locale] = (counts[locale] || 0) + 1;
      return counts;
    },
    { en: 0, "pt-br": 0 }
  );

  return {
    generatedAt: "2026-06-11",
    site: {
      name: "Immigrate to Brazil",
      url: "https://immigratetobrazil.com",
      languages: ["en", "pt-BR"],
      sitemap: "https://immigratetobrazil.com/sitemap.xml"
    },
    primaryEntity: {
      name: "Monique Fernandes",
      type: "Brazil immigration attorney",
      url: "https://immigratetobrazil.com/about/lawyer/",
      knowsAbout: [
        "Brazil immigration law",
        "Brazil visas",
        "Brazil residency",
        "Brazilian naturalisation",
        "Brazil immigration compliance",
        "Brazil immigration defense"
      ]
    },
    indexableCounts,
    keyRoutes: routes
  };
}

function buildHtmlSitemap(routeFiles, pageDataByRoute) {
  const groups = new Map();
  for (const entry of routeFiles) {
    const data = pageDataByRoute.get(entry.route);
    if (!data || data.noindex) continue;
    const section = routeSegments(entry.route)[0] || "home";
    const group = groups.get(section) || [];
    group.push({ route: entry.route, title: data.title || entry.route, summary: data.summary || "" });
    groups.set(section, group);
  }

  const orderedGroups = [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
  const groupHtml = orderedGroups
    .map(([section, entries]) => {
      const links = entries
        .sort((a, b) => a.route.localeCompare(b.route))
        .map(
          (entry) => `<li><a href="${escapeAttribute(entry.route)}">${escapeHtml(entry.title)}</a><span>${escapeHtml(entry.route)}</span></li>`
        )
        .join("\n");
      return `<section><h2>${escapeHtml(section)}</h2><ul>${links}</ul></section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index,follow" />
  <title>Immigrate to Brazil HTML Sitemap</title>
  <link rel="canonical" href="https://immigratetobrazil.com/sitemap.html" />
  <style>
    body{margin:0;font-family:Arial,sans-serif;color:#172523;background:#f7f3ea}
    main{width:min(1120px,calc(100% - 2rem));margin:0 auto;padding:2rem 0}
    h1{font-size:clamp(2rem,4vw,3rem);margin:0 0 .5rem}
    section{margin:1.5rem 0;padding:1rem;border:1px solid rgba(23,37,35,.12);background:#fff;border-radius:.5rem}
    ul{list-style:none;margin:0;padding:0;display:grid;gap:.55rem}
    li{display:grid;gap:.15rem;padding:.55rem 0;border-bottom:1px solid rgba(23,37,35,.08)}
    li:last-child{border-bottom:0}
    a{color:#075f54;font-weight:700;text-decoration:none}
    span{color:#5c6b66;font-size:.9rem;word-break:break-word}
  </style>
</head>
<body>
  <main>
    <h1>Immigrate to Brazil Sitemap</h1>
    <p>Indexable English and Portuguese pages for search engines, clients, and AI discovery.</p>
    ${groupHtml}
  </main>
</body>
</html>
`;
}

async function main() {
  const cssChanged = await syncMinifiedCss();
  const criticalCss = minifyCss(CRITICAL_CSS_SOURCE);
  const criticalCssChanged = await syncCriticalCss();
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const responsiveResult = await syncResponsiveImages(routeFiles);
  const { responsiveImages } = responsiveResult;
  const pageDataByRoute = new Map();
  let updatedRoutes = 0;

  for (const entry of routeFiles) {
    let html = await fs.readFile(entry.filePath, "utf8");
    const runtime = readRuntimeConfig(html);
    const pageData = extractPageData(entry.route, html);
    pageDataByRoute.set(entry.route, pageData);
    const pageTitle = normalizeSpace(runtime.pageTitle || pageData.title || "Immigrate to Brazil");
    let next = html;

    next = normalizeStylesheets(next, criticalCss);
    next = normalizeImagePreloads(next, responsiveImages);
    next = normalizeContactAnchors(next, entry.route, pageTitle);
    next = normalizeImages(next, responsiveImages);
    next = addFormIfNeeded(next, pageData, entry.route, runtime);
    next = annotateHtmlSections(next);

    if (next !== html) {
      await fs.writeFile(entry.filePath, next, "utf8");
      updatedRoutes += 1;
    }
  }

  const llmsChanged = await writeIfChanged(path.join(ROOT, "llms.txt"), buildLlmsTxt());
  const manifestChanged = await writeIfChanged(
    path.join(ROOT, "data", "ai-route-manifest.json"),
    `${JSON.stringify(buildAiRouteManifest(routeFiles, pageDataByRoute), null, 2)}\n`
  );
  const sitemapHtmlChanged = await writeIfChanged(path.join(ROOT, "sitemap.html"), buildHtmlSitemap(routeFiles, pageDataByRoute));
  const annotatedPartials = await syncAnnotatedPartials();

  console.log(
    `Optimized ${updatedRoutes} route files. CSS minified: ${cssChanged ? "yes" : "no"}; critical CSS: ${criticalCssChanged ? "yes" : "no"}; responsive images generated: ${responsiveResult.generated}; responsive images skipped: ${responsiveResult.skipped}; llms: ${llmsChanged ? "yes" : "no"}; AI manifest: ${manifestChanged ? "yes" : "no"}; HTML sitemap: ${sitemapHtmlChanged ? "yes" : "no"}; annotated partials: ${annotatedPartials}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
