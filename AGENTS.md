# AGENTS.md

Guidance for agentic coding tools operating in this repository.

## Scope
- This project is a Node.js + Express backend using ES modules.
- Entry point: `index.mjs`.
- Database access uses `pg` through `src/db.js`.
- API docs are served from `swagger.yaml` at `/api-docs`.

## Cursor / Copilot rule files
- `.cursorrules`: not found.
- `.cursor/rules/`: not found.
- `.github/copilot-instructions.md`: not found.
- This `AGENTS.md` is the active instruction source for coding agents.

## Build and run commands
```bash
npm install
npm run dev
npm start
```
- `npm run dev` uses nodemon for hot reload.
- `npm start` runs `node index.mjs`.
- There is no dedicated build/transpile step.

## Docker commands
```bash
docker compose -f docker/dev/compose.yaml up --build
docker compose -f docker/prod/compose.yaml up --build
```
- Dev compose includes Postgres and mounts local source.
- Container startup command installs deps then starts app.

## Lint, format, and test status
- No ESLint config or `lint` script exists.
- No Prettier/Biome config exists.
- `npm test` is currently a placeholder that exits with error.
- No committed `*.test.*` or `*.spec.*` files were found.

## Test commands (especially single test)
Current repo state:
```bash
npm test
```
Future-ready patterns (use once a framework is added):
```bash
# Node built-in test runner
node --test path/to/file.test.mjs
node --test --test-name-pattern="case name" path/to/file.test.mjs

# Jest with ESM
node --experimental-vm-modules node_modules/jest/bin/jest.js path/to/file.test.js
node --experimental-vm-modules node_modules/jest/bin/jest.js path/to/file.test.js -t "case name"
```
- Prefer running a single file/test name during iteration.
- Run full suite before PR merge when tests exist.

## Environment variables
Expected values from `.env.example` and runtime usage:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
PGUSER=postgres
PGPASSWORD=12345
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=quality
JWT_SECRET=replace_me
```
- Never commit real credentials or secrets.
- `JWT_SECRET` must be set in non-dev environments.

## Repository structure
- `index.mjs`: app bootstrap, middleware, and route mounting.
- `src/routes/**`: HTTP route definitions by domain.
- `src/controllers/**`: validation, orchestration, and API responses.
- `src/models/**`: SQL/data access logic.
- `src/middleware/authMiddleware.js`: bearer token verification.
- `docker/dev` and `docker/prod`: container setups.

## Architecture guidelines
- Keep routes thin; call controller methods.
- Keep business logic in controllers/models, not route files.
- Prefer controller + model layering over inline SQL in routes.
- Mount each new router in `index.mjs` using `app.use(...)`.
- Place public endpoints before `router.use(authMiddleware)` in mixed routers.
- Keep `swagger.yaml` aligned with every API change.

## Code style: imports and modules
- Use ESM only (`import`, `export default`).
- Put third-party imports before local imports.
- Use explicit `.js` extension for local imports.
- Keep imports stable and readable; one import per line preferred.

## Code style: formatting
- Use 2-space indentation.
- Use semicolons consistently.
- Prefer double quotes.
- Keep trailing commas in multiline literals/calls.
- Preserve existing section-header comment style where present.
- Avoid adding comments unless logic is non-obvious.

## Code style: types and contracts
- Codebase is JavaScript (no TypeScript setup).
- Do not introduce `.ts/.tsx` unless explicitly requested.
- Validate required body/params/query fields in controllers.
- Normalize IDs, numbers, and dates before model calls.
- Preserve existing response shapes unless change is intentional.

## Code style: naming
- Classes: PascalCase.
- Functions/variables/methods: camelCase.
- Route files: `*Routes.js`.
- Controller files: `*Controller.js`.
- Model files: `*Model.js` (legacy exceptions exist).
- Route paths generally use plural resources.
- DB naming commonly uses prefixes: `fi_`, `fc_`, `fd_`, `fn_`, `fb_`.
- Keep API/user-facing text in Spanish for consistency.
- Prefer success response key `mensaje` in new/updated code.

## Error handling conventions
- Wrap async controller/model operations in `try/catch`.
- Log contextual failures with `console.error(...)`.
- Use `400` for validation errors.
- Use `401` for missing token/invalid credentials.
- Use `403` for invalid or expired token/forbidden access.
- Use `500` for unexpected errors.
- Add `detalle: err.message` only when safe and useful.

## SQL and transaction conventions
- Always parameterize SQL (`$1`, `$2`, ...).
- Never interpolate user input into SQL strings.
- Return `rows` for lists and `rows[0]` for single-item fetches.
- Use `RETURNING *` when caller needs written row data.
- Use transactions for multi-step writes.
- If using `pool.connect()`, always `release()` in `finally`.

## Git and PR workflow
- Contribution flow targets branch `dev` (see `CONTRIBUTING.md`).
- Branch naming: `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`.
- Keep changes scoped to requested work.
- Update docs/Swagger when behavior or contracts change.

## Known legacy inconsistencies
- `src/models/RolesModulosModel.js` uses PascalCase filename.
- `src/routes/catalogos/estado.js` lacks `Routes` suffix.
- Some route files still contain inline SQL.
- Some modules still return `message` instead of `mensaje`.

## Agent pre-merge checklist
- New routes are mounted in `index.mjs`.
- Protected routes apply `authMiddleware`.
- SQL changes are parameterized and safe.
- API changes are documented in `swagger.yaml`.
- No secrets were introduced in tracked files.
- Tooling limitations (lint/test) were clearly reported.
