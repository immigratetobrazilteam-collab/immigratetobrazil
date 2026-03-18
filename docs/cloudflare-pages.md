# Cloudflare Pages Deployment Notes

This repository is prebuilt as a static site.

- Final HTML is committed in the repository root and route folders.
- Cloudflare Pages can deploy the repository with no framework preset.
- If the local release helper is used before pushing, the build command can remain empty.
- The deployment target is the repository root.
- Security headers are provided in [_headers](/home/ash/immigratetobrazil-new/_headers).

Recommended Cloudflare Pages settings:

- Framework preset: `None`
- Build command: blank
- Build output directory: `/`
- Production branch: `main`

Recommended local release flow:

1. `python3 scripts/release_main.py --message "Your release message"`
2. Confirm validation, responsive QA, and Lighthouse checks pass.
3. Let the push to `origin main` trigger the GitHub-connected Pages deployment.
