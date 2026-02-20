# Non-Developer Content Editing Guide

## What `/admin` is
`/admin` is your **content editor** (Decap CMS). It is not a CRM.

- CRM = client records, leads, case pipeline.
- `/admin` = website text/content editor connected to your GitHub repo.

When you edit and publish in `/admin`, it commits JSON content files in `content/cms/*`.

## What you can edit now without coding

### `Site Copy`
Controls high-visibility global text:
- Brand name
- Main navigation labels
- Hero section text (home page)
- CTA text
- Footer tagline/legal line
- Upgrade notice banner text
- Home trust stats, service cards, process steps, blog highlights

### `Page Copy`
Controls these key pages:
- `/about/about-brazil/apply-brazil`
- `/about/about-brazil/cost-of-living-in-brazil`
- `/resources-guides-brazil`
- `/visa-consultation` (when legacy fallback is not used)

### `State Copy`
Controls state-level template blocks and per-state overrides for:
- Contact by state
- FAQ by state
- Services by state
- Blog by state

### `Policy Copy`
Controls policy pages:
- Privacy, Terms, Cookies, GDPR, Refund, Disclaimers

### `Legacy Rewrite Bank`
Use this as your writing workspace to rewrite old legacy material before publishing:
- Store cleaned drafts
- Keep source path references
- Mark entries ready when final

## Fast workflow (recommended)
1. Open `https://immigratetobrazil.com/admin`.
2. Select the right collection (`Site Copy`, `Page Copy`, etc.).
3. Edit text.
4. Click **Publish**.
5. Wait for GitHub + Cloudflare auto-deploy.
6. Refresh live site and verify.

## Legacy-content rewrite workflow (simple)
1. Open the old legacy page in another tab.
2. Copy the useful text only.
3. Rewrite it cleaner inside `/admin` in the best matching collection:
   - Global/home text -> `Site Copy`
   - Apply/Cost/Resources/Consultation pages -> `Page Copy`
   - State-specific blocks -> `State Copy`
4. Publish.

## Local preview before publishing
Use your menu script:
```bash
python3 automation/gitcommands/run.py
```
Then choose:
- `1` Start live dev server

Open locally:
- Site: `http://localhost:3000/en`
- Admin: `http://localhost:3000/admin`

## If you feel stuck
Edit only these first:
1. `Site Copy -> hero + cta + upgradeNotice`
2. `Page Copy -> applyBrazil + resourcesGuidesBrazil`
3. `State Copy -> one test state override`

That gives fast visible improvement with minimal risk.
