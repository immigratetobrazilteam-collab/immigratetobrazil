# Website Maintenance Scripts

Run these commands from the repository root.

## Weekly Flow

```bash
python3 scripts/maintenance.py --fix
```

Add `--publish` only when you want the script to commit and push at the end.
Add `--submit-indexnow` only when `INDEXNOW_KEY` is configured and you want URL
updates sent immediately.

## Setup

```bash
python3 scripts/bootstrap_dependencies.py
```

This checks Python packages used by the maintenance scripts and attempts to
install optional translation/image packages. Argos Translate model installation
is attempted when the package is available.

## Core Commands

- `python3 scripts/generate_portuguese.py`: updates `/pt-br/` pages from English source pages.
- `python3 scripts/generate_discovery.py`: rebuilds sitemap, robots, llms, AI manifest, search indexes, and IndexNow state.
- `python3 scripts/audit_site.py`: creates the read-only site audit in `reports/`.
- `python3 scripts/fix_site.py`: applies deterministic safe fixes and documents skips.
- `python3 scripts/validate_site.py`: final validation gate.
- `python3 scripts/check_links.py`: dedicated internal-link validation.
- `python3 scripts/optimize_images.py --audit-only`: image audit without changes.
- `python3 scripts/git_save.py`: timestamped add/commit/push with empty commits allowed.
- `python3 scripts/health_summary.py`: dashboard-style read-only health summary.

## State And Reports

- Runtime state: `.maintenance/`
- Reports: `reports/`
- Translation cache: `.maintenance/pt-br-translation-cache.json`
- IndexNow state: `.maintenance/indexnow-state.json`

The scripts do not automatically delete HTML files. Generated sitemap XML files
may be pruned when they no longer correspond to an indexable route group.
