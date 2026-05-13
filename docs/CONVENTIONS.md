# Conventions

## Technology baseline
- Runtime: Node.js
- Language and module system: JavaScript with ES modules
- Web framework: Express 5
- Data access: Prisma (`src/prisma.js`) for newer modules and `pg` (via `src/db.js` / `src/models/**`) where legacy SQL access remains.
- API documentation source: `swagger.yaml`

## Project structure
- `index.mjs` bootstraps middleware and mounts every router.
- `src/routes/**` defines HTTP routes.
- `src/controllers/**` handles validation, orchestration, and response shaping.
- `src/models/**` owns SQL and data access.
- Add new routers to `index.mjs`; a route file alone is not enough.

## Routing and authorization
- Keep routes thin and delegate work to controllers.
- In mixed routers, register public endpoints before `router.use(authMiddleware)`. `src/routes/usuarioRoutes.js` is the reference pattern.
- Apply `rbacMiddleware()` when a module requires role-based module access control.
- Keep `swagger.yaml` aligned with path, request, and response contract changes.

## Code style
- Use ESM imports and exports.
- Keep explicit `.js` extensions for local imports.
- Repository guidance prefers 2-space indentation, semicolons, and double quotes.
- The current codebase has legacy formatting inconsistencies, so avoid unrelated reformatting.
- JavaScript is the only verified application language. No TypeScript setup was found.

## Naming
- Classes use PascalCase.
- Functions, variables, and methods use camelCase.
- Common file patterns are `*Routes.js`, `*Controller.js`, and `*Model.js`.
- Verified legacy exceptions:
  - `src/models/RolesModulosModel.js`
  - `src/routes/catalogos/estado.js`
- Database naming commonly uses Hungarian-style prefixes such as `fi_`, `fc_`, `fd_`, `fn_`, and `fb_`.

## API and response conventions
- The public API and most user-facing response text are Spanish.
- `mensaje` is the preferred success key in current repository guidance, but some legacy endpoints still use `message`.
- Preserve existing response shapes unless the change is intentional and documented in `swagger.yaml`.
- Validate required body, params, and query values in controllers before calling models.

## Error handling
- Wrap async controller and model logic in `try/catch`.
- Use `console.error(...)` or targeted warning logs for operational failures.
- Current usage in the codebase aligns with:
  - `400` for validation errors
  - `401` for missing tokens or invalid credentials
  - `403` for invalid, expired, or unauthorized tokens
  - `500` for unexpected server errors

## SQL and transactions
- Parameterize SQL with `$1`, `$2`, and so on.
- Avoid interpolating user input into SQL strings.
- Return `result.rows` for list queries and `result.rows[0]` for single-record reads.
- Use `RETURNING *` when the caller needs the written row back.
- Use transactions for multi-step writes.
- When using `pool.connect()`, always release the client in `finally`.

## Database and docs maintenance
- `prisma/schema.prisma` and `prisma/migrations/**` should stay aligned with backend schema changes; `db.sql` is optional legacy snapshot only if still maintained.
- `swagger.yaml` should stay aligned with API changes.
- `docs/` holds the durable project documentation; context files should stay short and point here.

## Workflow
- The contribution target branch is `dev`.
- Verified branch prefixes in `CONTRIBUTING.md` are `feature/`, `fix/`, `chore/`, `docs/`, and `refactor/`.

## Unverified areas
- No linting or formatting tool configuration was found.
- No automated test framework or CI workflow was found.
