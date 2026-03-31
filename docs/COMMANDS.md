# Commands

Only commands verified from repository files are listed here. Use Bun for project scripts and one-off JavaScript execution.

## Prerequisites
- Bun must be available locally.
- PostgreSQL connection variables are read from `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, and `PGDATABASE`.
- The app also reads `PORT`, `FRONTEND_URL`, and `JWT_SECRET`.
- `BACKEND_URL` exists in `.env.example`, but its runtime usage was not verified in the JavaScript source.

## Local development

### Install dependencies
```bash
bun install
```
Verified from the Docker startup commands, which run Bun installs before starting the app.

### Start in watch mode
```bash
bun run dev
```
Source: `package.json` -> `dev` -> `bun --watch index.mjs`

### Start without watch mode
```bash
bun run start
```
Source: `package.json` -> `start` -> `bun index.mjs`

## Docker

### Development compose
```bash
docker compose -f docker/dev/compose.yaml up --build
```
- Starts the Express app and a Postgres 18 container.
- The Express service runs `bun install && bun run dev`.
- `db.sql` is mounted into Postgres initialization.
- The compose file references variables shown in `docker/dev/.env.example`.

### Production compose
```bash
docker compose -f docker/prod/compose.yaml up --build
```
- Starts the Express container only.
- The container runs `bun install --frozen-lockfile || bun install && bun run start`.
- The compose file references variables shown in `docker/prod/.env.example`.

## Database bootstrap

### Seed security modules and root-role assignments
```bash
bun seed.js
```
- Seeds `seguridad.modulos`.
- Assigns all modules to roles where `fb_es_root = true`.
- Uses the same PostgreSQL environment variables as `src/db.js`.

## Notes about environment files
- `.env.example` currently documents the main local runtime variables.
- `docker/dev/.env.example` documents the development compose variables.
- `docker/prod/.env.example` documents the production compose variables.
- `NODE_ENV` is checked by `index.mjs` to disable `/api-docs` in production, but it is not declared in the root `.env.example`.

## Commands not verified
- No `bun test` command was found in `package.json`.
- No lint, format, build, or migration script was found in `package.json`.
- No CI workflow command set was found under `.github/workflows/`.
