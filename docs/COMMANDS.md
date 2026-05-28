# Commands

Only commands verified from repository files are listed here. Use Node.js (`node`) for entrypoints and npm for installs and scripts from `package.json`.

## Prerequisites
- Node.js must be available locally (use a recent LTS that supports `node --watch`; the dev container image targets Node 24).
- PostgreSQL connection variables are read from `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, and `PGDATABASE`.
- Prisma reads `DATABASE_URL` (see `.env.example`).
- The app also reads `PORT`, `FRONTEND_URL`, and `JWT_SECRET`.
- `BACKEND_URL` exists in `.env.example`, but its runtime usage was not verified in the JavaScript source.
- Dependencies are pinned with `package-lock.json`; use reproducible installs with `npm ci` when installing from scratch for CI/production-style flows.

## Local development

### Install dependencies
```bash
npm install
```
Verified against `docker/dev/compose.yaml` (`npm install` before `npm run dev`).

After schema changes involving Prisma, regenerate the client:

```bash
npm run prisma:generate
```

### Start in watch mode
```bash
npm run dev
```
Source: `package.json` -> `dev` -> `node --watch index.mjs`

### Start without watch mode
```bash
npm run start
```
Source: `package.json` -> `start` -> `node index.mjs`

## Docker

### Development compose
```bash
docker compose -f docker/dev/compose.yaml up --build
```
- Starts the Express app and a Postgres 18 container.
- The Express service runs `npm install`, `prisma generate`, `prisma migrate deploy`, `prisma db seed`, then `npm run dev`.
- The Postgres volume is not initialized from `db.sql`; schema comes from Prisma migrations.
- The compose file references variables shown in `docker/dev/.env.example`.

### Dev container (Cursor / VS Code)

Opening `.devcontainer/devcontainer.json` overrides the Express service command (`sleep infinity`) and runs database bootstrap via lifecycle hooks instead of `docker/dev/compose.yaml` command:

- `postCreateCommand`: `npm install`, `prisma generate`
- `postStartCommand`: `prisma migrate deploy`, `prisma db seed`, `npm run dev`

Rebuild or run **Dev Containers: Rebuild Container** after changing hooks or migrations.

### Production compose
```bash
docker compose -f docker/prod/compose.yaml up --build
```
- Starts the Express container only.
- The Docker image installs with `npm ci`, runs `npx prisma generate`, prunes dev dependencies, and starts via `CMD ["node", "index.mjs"]`; see `docker/prod/Dockerfile`.
- The compose file references variables shown in `docker/prod/.env.example`.

## Database bootstrap

### Initial catalog and admin user (Prisma seed)

After migrations, dev Docker runs `prisma db seed` automatically. Locally:

```bash
npm run prisma:seed
```

Requires `DATABASE_URL` and a database that already has migrations applied (for example `npm run prisma:deploy`).

## Prisma CLI (from package.json)

- `npm run prisma:generate` — generate Prisma Client after schema changes (`prisma/schema.prisma`).
- `npm run prisma:migrate` — development migrations.
- `npm run prisma:deploy` — deploy migrations (typical CI/production migrations).
- `npm run prisma:studio` — open Prisma Studio.
- `npm run prisma:format` — format schema file.
- `npm run prisma:seed` — run `prisma/seed.mjs` (idempotent baseline data).

## Notes about environment files
- `.env.example` currently documents the main local runtime variables.
- `docker/dev/.env.example` documents the development compose variables.
- `docker/prod/.env.example` documents the production compose variables.
- `NODE_ENV` is checked by `index.mjs` to disable `/api-docs` in production, but it is not declared in the root `.env.example`.

## Commands not verified
- No `npm test` script was found in `package.json`.
- No lint, format, or build script was found in `package.json` beyond Prisma tooling.
- No CI workflow command set was found under `.github/workflows/`.
