---
description: Auto commit and push changes to GitHub for Lovable sync
---

# Auto Commit Workflow

After making any code changes, run this workflow to sync with Lovable.

## Steps

// turbo-all

1. Stage all changes:
```bash
git add -A
```

2. Commit with auto-generated message:
```bash
git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
```

3. Push to GitHub:
```bash
git push origin main
```

## Notes
- Lovable will automatically detect changes pushed to GitHub
- Changes should appear in Lovable within a few seconds after push
