# AGENTS.md

Guidance for coding agents working in this repository.

## Project summary
- Node.js + Express backend using ES modules.
- Entry point: `index.mjs`.
- PostgreSQL access goes through Prisma (`src/prisma.js`) and `src/db.js` where applicable.
- Swagger UI is served from `swagger.yaml` at `/api-docs` outside production.
- Contribution flow targets the `dev` branch.

## Always-on rules
- Use npm for installs and `npm run` for package scripts; use `node` for one-off JavaScript execution (`node file.mjs`).
- Keep routes thin; put request orchestration in controllers and SQL in models (or Prisma as used in newer modules).
- Mount every new router in `index.mjs`.
- Protect non-public endpoints with `authMiddleware`.
- Keep `swagger.yaml` aligned with API changes.
- Keep `prisma/schema.prisma` and migrations aligned with backend schema changes; keep `db.sql` only as an optional legacy export if the team still maintains it.
- Never commit secrets.

## Read when needed
- Architecture and module boundaries: `docs/ARCHITECTURE.md`
- Coding, SQL, and API conventions: `docs/CONVENTIONS.md`
- Verified local and Docker commands: `docs/COMMANDS.md`
- Legacy database reset notes: `docs/bd_restoration.md`
