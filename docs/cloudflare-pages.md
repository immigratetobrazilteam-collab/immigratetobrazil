# Cloudflare Pages Deployment Notes

This repository is prebuilt as a static site.

- Final HTML is committed in the repository root and route folders.
- Edit the committed HTML files directly. The default workflow no longer regenerates page HTML.
- If `/pt-br/` is in use, regenerate Portuguese pages before deploy with `npm run translate:pt`.
- Cloudflare Pages can deploy the repository with no framework preset.
- If the local release helper is used before pushing, the build command can remain empty.
- If the Pages project requires a build command, use `npm run check` to refresh the search index, form map, and validation outputs.
- The deployment target is the repository root.
- Security and cache headers are provided in [_headers](../_headers).

Recommended Cloudflare Pages settings:

- Framework preset: `None`
- Build command: blank, or `npm run check`
- Build output directory: `/`
- Production branch: `main`

## Required production-domain settings

The repository controls canonical URLs and browser cache behaviour. These two
domain-level controls must be set once in the Cloudflare dashboard because
Cloudflare Pages' static `_redirects` file cannot reliably enforce a hostname
or HTTP-to-HTTPS redirect before Pages receives the request.

1. Make `immigratetobrazil.com` the primary domain. Add a **Single Redirect**
   rule that permanently redirects `www.immigratetobrazil.com/*` to
   `https://immigratetobrazil.com/${1}` and preserves the path and query
   string. Use status **301**.
2. Set SSL/TLS encryption mode to **Full (strict)** and enable **Always Use
   HTTPS**. Confirm HTTP requests permanently redirect to the HTTPS canonical
   host.
3. Do not apply a Cache Everything rule to HTML. If a Pages Cache Rule exists,
   either bypass it for HTML or respect origin `Cache-Control`. HTML is served
   with `max-age=0, must-revalidate`, so a browser always checks the current
   deployment. CSS and JavaScript have deployment version query strings and
   can remain immutable for a year. Unversioned images must revalidate.
4. Enable Brotli and leave Cloudflare Auto Minify off when the repository's
   already-minified CSS is deployed; do not minify HTML in a way that rewrites
   canonical, JSON-LD, or hreflang markup.

After each production deployment, verify these requests return a single 301
and then a 200, with no redirect chain:

```sh
curl -I http://immigratetobrazil.com/about/profile/
curl -I https://www.immigratetobrazil.com/about/profile/
curl -I https://immigratetobrazil.com/about/profile/
```

The final response must be `https://immigratetobrazil.com/about/profile/`.
Cloudflare Pages serves each new deployment atomically. Respecting the origin
cache headers above means HTML is fresh immediately while versioned CSS and JS
continue to benefit from long-lived caches.

Recommended local release flow:

1. Edit the HTML, CSS, and JS files directly.
2. If PT needs updating, run `npm run translate:pt`
3. `npm run check`
4. `python3 scripts/release_main.py --translate-pt --message "Your release message"` or skip `--translate-pt` if PT is already current
5. Confirm validation, responsive QA, and Lighthouse checks pass.
6. Let the push to `origin main` trigger the GitHub-connected Pages deployment.
