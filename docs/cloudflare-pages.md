# Cloudflare Pages Deployment Notes

This repository is prebuilt as a static site.

- Final HTML is committed in the repository root and route folders.
- Edit the committed HTML files directly. The default workflow no longer regenerates page HTML.
- Cloudflare Pages can deploy the repository with no framework preset.
- If the local release helper is used before pushing, the build command can remain empty.
- If the Pages project requires a build command, use `npm run check` to refresh the search index, form map, and validation outputs.
- The deployment target is the repository root.
- Security headers are provided in [_headers](/home/ash/immigratetobrazil-new/_headers).

Recommended Cloudflare Pages settings:

- Framework preset: `None`
- Build command: blank, or `npm run check`
- Build output directory: `/`
- Production branch: `main`

Recommended local release flow:

1. Edit the HTML, CSS, and JS files directly.
2. `npm run check`
3. `python3 scripts/release_main.py --message "Your release message"`
4. Confirm validation, responsive QA, and Lighthouse checks pass.
5. Let the push to `origin main` trigger the GitHub-connected Pages deployment.
