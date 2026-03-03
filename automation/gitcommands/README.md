# Git + Deployment Helper Scripts

These scripts provide guided non-interactive git/release flows.

## Run
From repo root:
```bash
python3 automation/gitcommands/run.py
```

## Menu summary
1. Start live dev server
2. Commit current branch
3. Push current branch
4. Sync main and create branch
5. Push main (deploy trigger flow)
6. Merge branch into main and push
7. End-to-end release flow for current branch
8. Verify production brand/assets

## Safety notes
- Review changed files before using merge/release options.
- Ensure validation/build/tests pass before release options.
- Use these scripts as helpers, not a replacement for release checklist discipline.
