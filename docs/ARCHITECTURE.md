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
- Operations and production: `/infraestructura-fisica`, `/tipos-infraestructura-fisica`, `/reproductores`, `/engorda`, `/equipos`, `/lista-espera`, `/eficiencia-reproductiva`, `/alevinaje`, `/trazabilidad`
- Sales and finance: `/clientes`, `/ventas`, `/proveedores`, `/tesoreria`, `/cuentas`, `/flujo-caja`
- HR and catalogs: `/empleados`, `/departamentos`, `/vacaciones`, `/expedientes`, `/nomina`, `/caja-ahorro`, `/estados`
- Field logs / bitacoras: `/biometrias`, `/control-fauna-nociva`, `/alimentacion`, `/recepcion_insumos`, `/control-visitas`, `/control-limpieza`, `/parametros`, `/medicamentos`, `/limpieza-instalaciones`, `/inventario`

## File upload paths
- `src/routes/flujoCajaRoutes.js` only serves previously uploaded invoice files from `uploads/facturas/` (the module is now read-only; movements are created automatically by other modules such as sale payments in `ventaController`).
- `src/routes/bitacoras/controlVisitaRoutes.js` stores uploaded images in `uploads/`.

## Verified gaps and legacy notes
- Inventario de alevines en bitacoras uses `GET/POST /api/inventario` (not `/api/alevines`, removed).
- No background worker, queue, scheduler, or separate build step was verified.
- No automated test runner or CI workflow was verified in the repository.
- `swagger.yaml` remains in Spanish even though the main repository documentation is now in English.

## HTTP API naming (breaking change)
- The HTTP API contract no longer uses Hungarian-prefixed field names (`fi_`,
  `fc_`, `fd_`, `fn_`, `fb_`). Serializers in `src/utils/serializers.js` and all
  controllers now emit and accept only semantic snake_case names (see the field
  contract in `docs/CONVENTIONS.md`). This is breaking for clients; backend and
  frontend must deploy together.
- Prisma models (`prisma/schema.prisma`) and the active `public` / `catalogos`
  tables were already free of Hungarian prefixes; no schema or data migration was
  needed for this change.
- The baseline migration (`prisma/migrations/20260512120000_baseline/migration.sql`)
  still contains legacy duplicate tables with Hungarian columns under the
  `rrhh`, `seguridad`, and `catalogos.estados` schemas (e.g. `rrhh.empleados`
  with `fi_empleado_id`, `seguridad.modulos` with `fc_nombre`). These are orphan
  tables: the active Prisma models map to the `public.*` equivalents instead, so
  they are not part of the API contract. Dropping them is a separate, optional
  database cleanup and is not required by the naming migration.

## Live exploration hints
- Start with `index.mjs` to see mounted routers.
- Then inspect matching files under `src/routes/**`, `src/controllers/**`, and `src/models/**`.
- Use `swagger.yaml` for the API surface and `prisma/schema.prisma` for the schema.
