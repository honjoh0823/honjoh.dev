---
description: Rules for managing the Astro dev server during file operations
---

# Dev Server Management

## Critical Rule

**Astro dev server crashes when directories are renamed, moved, or deleted.**
File content edits are safe — directory-level filesystem operations are not.

## When Directory Operations Are Needed (rename, move, delete)

1. **Before** the operation, stop the running dev server (Ctrl+C or terminate the process)
2. Perform all directory operations and file edits
3. **After** all changes are complete, restart the dev server:
// turbo
```
npm run dev
```

## Safe Operations (no restart needed)

- Editing file contents (replace, multi_replace, write_to_file with Overwrite)
- Creating new files or directories
- Deleting individual files (not directories)

## Verification

- Confirm `http://localhost:4321/` responds after restart
