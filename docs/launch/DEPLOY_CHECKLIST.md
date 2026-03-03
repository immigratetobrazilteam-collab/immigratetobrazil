# Deploy Checklist

## Pre-merge / pre-release
- [ ] Content changes are in correct CMS source files
- [ ] Navigation map updated if links changed
- [ ] `npm run migrate:routes`
- [ ] `npm run cms:validate`
- [ ] `npm run cms:sync-locales:check`
- [ ] `npm run rewrite:validate`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build:static`

## Pre-deploy manual review
- [ ] Header links work in all locales
- [ ] Footer links work in all locales
- [ ] Discover and Services hubs load
- [ ] Contact and consultation flows render

## Deploy and verify
- [ ] Deploy generated output (`out/`) using release workflow
- [ ] Verify production URLs and health endpoints
- [ ] Purge cache if stale assets or old content persist
