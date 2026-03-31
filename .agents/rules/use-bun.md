---
description: "Use bun and bunx to run scripts, install dependencies, and execute commands"
alwaysApply: true
---

# Use Bun

This project needs the bun runtime to run the project, install dependencies, and execute commands

You may find yourself in a local folder or inside a container, but you always need to use bun to run scripts, install dependencies, and execute commands.

## Main rule

NEVER run `npm`, `npx`, `node`, or `yarn` in the terminal, this commands **are prohibited**. because they are not compatible with the bun runtime

Always use the Bun equivalent.

## Substitution table

| Forbidden            | Use instead                       |
|----------------------|-----------------------------------|
| `npm install`        | `bun install`                     |
| `npm ci`             | `bun install --frozen-lockfile`   |
| `npm run <script>`   | `bun run <script>`                |
| `npm test`           | `bun test`                        |
| `npx <package>`      | `bunx <package>`                  |
| `node <file>`        | `bun <file>`                      |
| `yarn add <package>` | `bun add <package>`               |

## Notes

- `package.json` and its scripts remain valid; only the executable that invokes them changes.
- To add dependencies: `bun add <package>` (dev: `bun add -d <package>`).
- To remove dependencies: `bun remove <package>`.
- The project lockfile is `bun.lock`; do not generate `package-lock.json` or `yarn.lock`.

If you find a package-lock.json or yarn.lock file, you should ask to remove them (for double check and security reasons) and generate by using bun install the bun.lock file
