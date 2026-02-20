# Git + Cloudflare One-Click Scripts

From repo root:

```bash
python3 automation/gitcommands/run.py
```

## Menu

1. Start live dev server (`localhost:3000`)
2. Commit current branch (auto date/time message)
3. Push current branch
4. Create new branch from latest main
5. Push main (triggers Cloudflare auto deploy)
6. Merge a branch into main + push
7. One-click release current branch -> main (auto commit + merge + push)

## Important

- Option 7 is the easiest full flow.
- If SSH asks for key passphrase, enter it.
- Safety checks stop accidental giant commits.
