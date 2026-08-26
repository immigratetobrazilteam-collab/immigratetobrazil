# Cloudflare Pages: static GitHub deployment

This repository is the published site. Every HTML, CSS, JavaScript, image,
`_headers`, `robots.txt`, and sitemap file is ready to serve as-is. Do not add a
framework preset, a package manager, or a build command.

## Required Pages settings

In **Cloudflare Dashboard → Workers & Pages → [this project] → Settings →
Builds**, use these settings for the production environment:

| Setting | Value |
| --- | --- |
| Git repository | `immigratetobrazilteam-collab/immigratetobrazil` |
| Production branch | `main` |
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `/` |
| Root directory | *(empty; repository root)* |
| Build watch paths | Include all paths / no exclusions |
| Automatic production branch deployments | Enabled |

Cloudflare Pages starts in the linked repository root when no root directory is
set. Leaving the build command blank makes it upload the committed static files
without running npm, Node, or any other build tool.

## Restore GitHub-triggered deploys

This repository has no GitHub Actions workflow because Cloudflare Pages' GitHub
App creates deployments itself. If pushes to `main` do not create a deployment,
the GitHub App connection is disconnected or no longer has access to this
repository.

1. In the Pages project, open **Settings → Builds** and check that the
   repository and production branch above are selected. Enable automatic
   production deployments.
2. Select **Manage** beside **Git Repository**. In the Cloudflare Workers &
   Pages GitHub App installation, grant it access to
   `immigratetobrazilteam-collab/immigratetobrazil`.
3. If Cloudflare reports that the project is disconnected, uninstall the
   **Cloudflare Workers and Pages** GitHub App from the
   `immigratetobrazilteam-collab` organization, then return to Cloudflare and
   reconnect it through **Create application → Pages → Connect to Git**.
   Re-select this repository and apply the static settings above. Keep the same
   Pages project if Cloudflare allows you to reconnect it, so the existing
   custom domain remains attached.
4. Push any small change to `main` and confirm a new production deployment
   appears in the Pages Deployments tab.

If Cloudflare says the repository is already used by a Pages project in a
different Cloudflare account, that existing project must be reconnected there
or removed before another account can connect the same repository.

## Editing and publishing

Edit a committed static file, commit it, and push it to `main`. Cloudflare Pages
then deploys that commit directly; no local or cloud build is required.
