# Architecture

## Overview
- Node.js REST backend built with Express 5 and ES modules.
- `index.mjs` is the verified application entry point.
- PostgreSQL access uses Prisma (`src/prisma.js`, `prisma/schema.prisma`) in newer modules and legacy `pg` access through a shared pool in `src/db.js` where routes still rely on SQL models under `src/models/**`.
- `swagger.yaml` is loaded at startup and served through Swagger UI at `/api-docs` when `NODE_ENV !== "production"`.

## Runtime flow
1. `index.mjs` loads and parses `swagger.yaml`. Startup fails if the file is missing or invalid.
2. The app applies `helmet`, `cors`, and `express.json()`.
3. Routers from `src/routes/**` are mounted on top-level API paths.
4. Protected routers call `authMiddleware` to verify JWT bearer tokens. Some routes also use `rbacMiddleware` for module-level authorization.
5. Controllers in `src/controllers/**` validate input, orchestrate model calls, and send JSON responses.
6. Data access flows through either Prisma in `src/prisma.js` or models in `src/models/**` that execute SQL via `src/db.js`, often with transactions (`pool.connect()` or Prisma transactions).
7. The app listens on `PORT` or defaults to `5000`.

## Main boundaries

### HTTP layer
- `index.mjs` mounts the API and exposes a JSON response at `/`.
- Swagger UI is mounted at `/api-docs` outside production.
- Static files under `uploads/` are served from `/uploads` behind `authStaticMiddleware`.

### Security
- JWT verification lives in `src/middleware/authMiddleware.js`.
- Refresh tokens are stored in `seguridad.refresh_tokens` and managed by `src/models/refreshTokenModel.js`.
- Module-based authorization lives in `src/middleware/rbacMiddleware.js`, which caches role-module lookups for 2 minutes.
- Login is rate-limited in `src/routes/usuarioRoutes.js`.

### Data access
- `src/prisma.js` configures a singleton `PrismaClient` backed by PostgreSQL (`DATABASE_URL`; see Prisma tooling in `docs/COMMANDS.md`).
- `src/db.js` creates a shared legacy `pg.Pool` from `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, and `PGDATABASE`.
- `prisma/schema.prisma` and `prisma/migrations/**` are the authoritative schema for new environments.
- The database defines the `public`, `catalogos`, `rrhh`, and `seguridad` schemas.
- In `docker/dev/compose.yaml`, the Postgres service starts empty; the Express service runs `prisma migrate deploy` and `prisma db seed` on startup.

## Domain areas mounted in `index.mjs`
- Security and access: `/usuarios`, `/roles`, `/modulos`, `/roles-modulos`
- Operations and production: `/piletas`, `/instalaciones`, `/lotes`, `/reproductores`, `/engorda`, `/equipos`, `/lista-espera`
- Sales and finance: `/clientes`, `/ventas`, `/proveedores`, `/tesoreria`, `/cuentas`, `/flujo-caja`
- HR and catalogs: `/empleados`, `/departamentos`, `/vacaciones`, `/expedientes`, `/nomina`, `/caja-ahorro`, `/estados`
- Field logs / bitacoras: `/biometrias`, `/plagas`, `/ceiba/alimentacion`, `/ceiba/insumos`, `/recepcion_insumos`, `/visitas`, `/medellin/banos`, `/medellin/parametros`, `/medellin/medicamentos`, `/medellin/recambios`, `/medellin/inventario`

## File upload paths
- `src/routes/flujoCajaRoutes.js` only serves previously uploaded invoice files from `uploads/facturas/` (the module is now read-only; movements are created automatically by other modules such as sale payments in `ventaController`).
- `src/routes/bitacoras/bitacoraVisitaRoutes.js` stores uploaded images in `uploads/`.

## Verified gaps and legacy notes
- Inventario de alevines en bitacoras uses `GET/POST /api/inventario` (not `/api/alevines`, removed).
- No background worker, queue, scheduler, or separate build step was verified.
- No automated test runner or CI workflow was verified in the repository.
- `swagger.yaml` remains in Spanish even though the main repository documentation is now in English.

## Live exploration hints
- Start with `index.mjs` to see mounted routers.
- Then inspect matching files under `src/routes/**`, `src/controllers/**`, and `src/models/**`.
- Use `swagger.yaml` for the API surface and `prisma/schema.prisma` for the schema.
