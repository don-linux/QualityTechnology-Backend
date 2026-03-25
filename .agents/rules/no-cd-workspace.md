---
description: Avoid unnecessary cd to workspace root before shell commands
alwaysApply: true
---

# No redundant cd to workspace root

The shell already starts in the workspace root (`/workspaces/QualityTechnology-Frontend`). Do NOT prepend `cd /workspaces/QualityTechnology-Frontend &&` before commands.

Use the `working_directory` parameter of the Shell tool instead of `cd` when you need to run a command in a specific directory.

```bash
# BAD
cd /workspaces/QualityTechnology-Frontend && bun run build
cd /workspaces/QualityTechnology-Frontend && bun test
cd /workspaces/QualityTechnology-Frontend/src && ls

# GOOD
bun run build
bun test
# (use working_directory: "src" for subdirectories)
```
