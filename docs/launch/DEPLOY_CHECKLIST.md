# Production Deploy Checklist

## 1) Hard blockers to clear before deploy
- [ ] Set `ADMIN_BASIC_AUTH_PASS` to a non-placeholder secure value.
- [ ] Set `DECAP_GITHUB_OAUTH_CLIENT_ID`.
- [ ] Set `DECAP_GITHUB_OAUTH_CLIENT_SECRET`.
- [ ] Set `SENTRY_DSN` (or `NEXT_PUBLIC_SENTRY_DSN`) to a valid Sentry DSN.
- [ ] Fix IndexNow key file mismatch so `https://immigratetobrazil.com/<INDEXNOW_API_KEY>.txt` returns exact key content.
- [ ] Provide a valid `CLOUDFLARE_API_TOKEN` with token verify permissions.

## 2) Required command gates
Run from repo root.

```bash
npm run env:validate
npm run cms:validate
npm run typecheck
npm run lint
npm test
npm run build
npm run editorial:check:strict
```

## 3) Known current status (latest run)
- `env:validate`: FAIL (secrets/integration config)
- `cms:validate`: PASS
- `typecheck`: PASS
- `lint`: PASS
- `test`: PASS
- `build`: PASS
- `editorial:check:strict`: PASS
- `perf:budget`: FAIL (JS bundle limits exceeded)

## 4) Performance action items (from latest perf budget)
- [ ] Reduce total client JS from `1,421,035` bytes to <= `1,200,000`.
- [ ] Reduce largest client chunk from `403,771` bytes to <= `350,000`.
- [ ] Prioritize splitting heavy route-level components and JSON consumers.

## 5) Post-deploy verification (must run on live domain)
- [ ] `npm run seo:final`
- [ ] `VISUAL_SMOKE_BASE_URL=https://immigratetobrazil.com npm run visual:smoke`
- [ ] Verify no widespread `503` on discover/services deep routes.
- [ ] Verify canonical + structured data on top revenue and top traffic pages.

## 6) Content migration integrity checks
- [ ] Review [artifacts/content-retention/retention-report.md](/home/ash/immigratetobrazil-repo/artifacts/content-retention/retention-report.md) (`Below threshold: 0`).
- [ ] Review [artifacts/content-coverage/content-coverage.md](/home/ash/immigratetobrazil-repo/artifacts/content-coverage/content-coverage.md) (8128 mapped pages).
- [ ] Only after live verification, delete obsolete legacy HTML folders.

## 7) Release execution order
1. Fill missing env/secrets.
2. Re-run command gates.
3. Deploy `main`.
4. Run post-deploy verification.
5. Approve legacy folder deletion.
