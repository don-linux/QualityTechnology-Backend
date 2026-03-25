---
description: "This container does NOT have Node or npm installed. Always use bun and bunx to run scripts, install dependencies, and execute commands."
alwaysApply: true
---

# Bun Environment

This project runs in a container where **only Bun is installed**. The `node`, `npm`, `npx`, and `yarn` binaries **do not exist** and any command using them will fail.

## Main rule

NEVER run `npm`, `npx`, `node`, or `yarn` in the terminal. Always use the Bun equivalent.

## Substitution table

| Forbidden                | Use instead                |
|--------------------------|----------------------------|
| `npm install`            | `bun install`              |
| `npm ci`                 | `bun install --frozen-lockfile` |
| `npm run <script>`       | `bun run <script>`         |
| `npm test`               | `bun test`                 |
| `npx <package>`          | `bunx <package>`           |
| `node <file>`            | `bun <file>`               |
| `yarn add <package>`     | `bun add <package>`        |

## Notes

- `package.json` and its scripts remain valid; only the executable that invokes them changes.
- To add dependencies: `bun add <package>` (dev: `bun add -d <package>`).
- To remove dependencies: `bun remove <package>`.
- The project lockfile is `bun.lock`; do not generate `package-lock.json` or `yarn.lock`.
