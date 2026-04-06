# AGENTS.md

Guidance for coding agents working in this repository.

## Project summary
- Bun-based Node.js + Express backend using ES modules.
- Entry point: `index.mjs`.
- PostgreSQL access goes through `src/db.js`.
- Swagger UI is served from `swagger.yaml` at `/api-docs` outside production.
- Contribution flow targets the `dev` branch.

## Always-on rules
- Use Bun for installs, scripts, and one-off JavaScript execution.
- Keep routes thin; put request orchestration in controllers and SQL in models.
- Mount every new router in `index.mjs`.
- Protect non-public endpoints with `authMiddleware`.
- Keep `swagger.yaml` aligned with API changes.
- Keep `db.sql` aligned with backend schema changes.
- Never commit secrets.

## Read when needed
- Architecture and module boundaries: `docs/ARCHITECTURE.md`
- Coding, SQL, and API conventions: `docs/CONVENTIONS.md`
- Verified local and Docker commands: `docs/COMMANDS.md`
- Legacy database reset notes: `docs/bd_restoration.md`
