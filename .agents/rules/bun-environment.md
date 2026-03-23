# BUN ENVIRONMENT.md

---
description: "Use bun and bunx for the execution environment, and ensure all commands are compatible with bun's ecosystem."

alwaysApply: true
---

## Guidelines for using bun as the primary runtime environment for JavaScript and TypeScript projects:

- Use `bun` as the primary runtime for executing JavaScript and TypeScript code.

- Avoid the use of `node` for running scripts and commands like as it may not be fully compatible with bun's environment and features

## Good examples of bun commands

bun run start
bun run dev
bun run build
bunx some-node-specific-command

## Bad examples (Running commands that are not compatible with bun)

npm start
npm run dev
npm run build
node some-node-specific-command
yarn start
yarn run dev
yarn run build

## Additional guidelines

- Stay updated with bun's documentation and community resources to keep up with any changes or updates to the bun environment and ecosystem for that you can use Context7 MCP (See the rule context7.md)

- Avoid using npm or yarn for package management, and instead use bun's built-in package manager for installing 
dependencies and managing packages.

- Use `bunx` for running scripts and commands that are not natively supported by bun, such as those that require node-specific features or dependencies.

- Ensure that all commands and scripts are compatible with bun's ecosystem, and avoid using features or dependencies that are not supported by bun.

- When writing scripts, prefer using bun's built-in features and APIs to ensure optimal performance and compatibility.

- If you need to use a package that is not available in bun's ecosystem, consider finding an alternative package that is compatible with bun, or contribute to the bun ecosystem by creating a compatible version of the package.

- Regularly test your code and scripts in the bun environment to ensure they work as expected and are compatible with bun's features and limitations.