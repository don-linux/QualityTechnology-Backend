# AGENTS.md

Guidelines for AI agents working in the QualityTechnology-Backend repository.

## Build / Development Commands

```bash
npm install          # Install dependencies
npm start            # Production: node index.mjs
npm run dev          # Development: nodemon index.mjs (auto-reload)
```

### Docker

```bash
docker compose -f docker/dev/compose.yaml up --build   # dev (hot-reload)
docker compose -f docker/prod/compose.yaml up --build  # prod
```

## Testing

No test framework is configured. The `npm test` script exits with an error stub.
To add Jest with ESM support:

```bash
npm install --save-dev jest
# package.json scripts: "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"

npx jest test/lote.test.js          # Single file
npx jest --testPathPattern=lote     # Pattern match
```

## API Documentation

Swagger UI: `http://localhost:5000/api-docs`
Schema: `swagger.yaml` (OpenAPI 3.0, 3477 lines) -- keep in sync when adding routes.

## Technology Stack

- **Runtime:** Node.js, ES Modules (`"type": "module"`, entry point `index.mjs`)
- **Framework:** Express.js v5.x
- **Database:** PostgreSQL via `pg` Pool (`src/db.js`)
- **Auth:** JWT (`jsonwebtoken`, 8h expiry) + bcrypt (10 rounds)
- **File uploads:** multer (`uploads/` served as static)
- **CORS:** `http://localhost:3000`, methods GET/POST/PUT/DELETE, credentials: true

## Environment Variables

Required in `.env` (see `.env.example`; note: `.env.example` is missing `JWT_SECRET`):

```
PORT=5000
PGUSER=postgres
PGPASSWORD=12345
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=quality
JWT_SECRET=your_secret_key
```

## Project Structure

```
src/
  controllers/       # 21 files — class-based, static async methods
  models/            # 22 files — class-based, raw SQL via pg pool
  middleware/        # authMiddleware.js (JWT Bearer validation)
  routes/
    bitacoras/       # 11 bitacora/log routes (all with controllers + auth)
    catalogos/       # 1 file: estado.js (catalog routes)
    *.routes.js      # 26 domain route files
  db.js              # pg Pool singleton
index.mjs            # App entry: loads env, swagger, mounts all routes
swagger.yaml         # OpenAPI 3.0 spec (3477 lines)
docker/
  dev/               # compose.yaml + Dockerfile + .env
  prod/              # compose.yaml + Dockerfile + .env.example
uploads/             # Static file storage (served at /uploads)
```

## Registered Routes (index.mjs)

### Core domain
| Mount path         | Route file                  |
|--------------------|-----------------------------|
| `/roles`           | `rolRoutes.js`              |
| `/usuarios`        | `usuarioRoutes.js`          |
| `/piletas`         | `piletaRoutes.js`           |
| `/instalaciones`   | `instalacionRoutes.js`      |
| `/lotes`           | `loteRoutes.js`             |
| `/reproductores`   | `reproductorRoutes.js`      |
| `/engorda`         | `engordaRoutes.js`          |
| `/clientes`        | `clienteRoutes.js`          |
| `/ventas`          | `ventaRoutes.js`            |
| `/alimentos`       | `alimentoRoutes.js`         |
| `/lista-espera`    | `listaEsperaRoutes.js`      |
| `/equipos`         | `equipoRoutes.js`           |
| `/expedientes`     | `expedienteRoutes.js`       |
| `/nomina`          | `nominaRoutes.js`           |
| `/vacaciones`      | `vacacionRoutes.js`         |
| `/caja-ahorro`     | `cajaAhorroRoutes.js`       |
| `/proveedores`     | `proveedorRoutes.js`        |
| `/flujo-caja`      | `flujoCajaRoutes.js`        |
| `/tesoreria`       | `tesoreriaRoutes.js`        |
| `/cuentas`         | `cuentaRoutes.js`           |

### Bitacoras
| Mount path                  | Route file                          |
|-----------------------------|-------------------------------------|
| `/biometrias`               | `bitacoraBiometriaRoutes.js`        |
| `/plagas`                   | `bitacoraPlagaRoutes.js`            |
| `/ceiba/alimentacion`       | `bitacoraAlimentacionRoutes.js`     |
| `/ceiba/insumos`            | `bitacoraInsumoRoutes.js`           |
| `/recepcion_insumos`        | `recepcionInsumoRoutes.js`          |
| `/visitas`                  | `bitacoraVisitaRoutes.js`           |
| `/medellin/banos`           | `bitacoraBanoRoutes.js`             |
| `/medellin/parametros`      | `bitacoraParametroRoutes.js`        |
| `/medellin/medicamentos`    | `bitacoraMedicamentoRoutes.js`      |
| `/medellin/recambios`       | `bitacoraRecambioRoutes.js`         |
| `/medellin/inventario`      | `bitacoraInventarioRoutes.js`       |

### RRHH
| Mount path         | Route file                  |
|--------------------|-----------------------------|
| `/estados`         | `catalogos/estado.js`       |
| `/empleados`       | `empleadoRoutes.js`         |
| `/departamentos`   | `departamentoRoutes.js`     |

### Seguridad
| Mount path         | Route file                  |
|--------------------|-----------------------------|
| `/modulos`         | `modulosRoutes.js`          |
| `/roles-modulos`   | `rolesModulosRoutes.js`     |

## Code Style

### Imports & Modules
- ES module syntax throughout: `import`/`export default`
- Explicit `.js` extensions required on all local imports
- Import order: 1) npm packages, 2) local modules
- Double quotes for all strings

### Formatting
- 2-space indentation; semicolons required
- Trailing commas in multi-line objects/arrays
- No eslint or prettier config -- style is prose-enforced only
- No emojis in code, comments, or user-facing messages

### Naming
- **Files:** `camelCaseRoutes.js`, `camelCaseController.js`, `camelCaseModel.js`
- **Variables/functions:** camelCase; **Classes:** PascalCase
- **Route paths:** plural nouns (`/usuarios`, `/lotes`, `/piletas`)
- **DB fields:** Hungarian notation -- `fc_` (text), `fi_` (integer/ID), `fd_` (date), `fn_` (numeric), `fb_` (boolean)
- **Comments:** Spanish for all comments and user-facing messages

### Section Headers
Use block comments for section headers:

```javascript
/* =========================================================
   SECTION TITLE
========================================================= */
```

## Architecture Patterns

### Route Files
Thin -- delegate to a controller. Apply `router.use(authMiddleware)` at the top for protected resources (before any route declarations). Register in `index.mjs` with `app.use("/path", routeModule)`. For mixed public/protected routes (e.g., `usuarioRoutes.js`), place public routes before `router.use(authMiddleware)`.

### Controller Pattern
```javascript
class LoteController {
    static async create(req, res) {
        const { fi_granja_id, fc_nombre } = req.body;
        if (!fi_granja_id || !fc_nombre)
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        try {
            const lote = await loteModel.create({ fi_granja_id, fc_nombre });
            res.status(201).json({ mensaje: "Lote creado exitosamente", lote });
        } catch (err) {
            console.error("Error al crear lote:", err);
            res.status(500).json({ error: "Error al crear lote" });
        }
    }
}
export default LoteController;
```

### Model Pattern
Models contain raw SQL via the `pool` singleton. Return `result.rows` for lists, `result.rows[0]` for single records. Always use positional placeholders (`$1`, `$2`, ...) and `RETURNING *` when you need the saved row back.

```javascript
import pool from "../db.js";

class LoteModel {
    static async getById(id) {
        const result = await pool.query(
            "SELECT * FROM lotes WHERE fi_lote_id = $1", [id]
        );
        return result.rows[0];
    }
}
export default LoteModel;
```

For multi-statement operations use `pool.connect()` with explicit `BEGIN/COMMIT/ROLLBACK` and `client.release()` in a `finally` block.

### Auth Middleware
JWT is extracted from `Authorization: Bearer <token>`. The verified payload (`{ usuario_id, rol_id, rol, nombre }`) is attached as `req.user`. Access it in controllers as `req.user.usuario_id`.

## Error Handling

- Always `try/catch` async operations
- Log: `console.error("Error al [accion]:", err)`
- Error response: `res.status(500).json({ error: "Message in Spanish" })`
- Extended error: `{ error: "Message", detalle: err.message }`
- Input validation: `res.status(400).json({ error: "Faltan datos obligatorios" })`
- **Use `{ mensaje: "..." }` (Spanish) for success messages** -- avoid mixing with `message`

## Known Inconsistencies (normalize when touching these files)

### Naming
- `src/models/RolesModulosModel.js` -- PascalCase filename; should be `rolesModulosModel.js`
- `src/routes/catalogos/estado.js` -- missing `Routes` suffix; should be `estadoRoutes.js`

### Unregistered routes
- `alevinRoutes.js`, `movimientoARoutes.js` -- exist in `src/routes/` but are NOT registered in `index.mjs`

### Missing controller layer (inline `pool.query` in route files)
- `rolRoutes.js`, `catalogos/estado.js`, `cajaAhorroRoutes.js`, `clienteRoutes.js`, `cuentaRoutes.js`, `engordaRoutes.js`, `equipoRoutes.js`, `expedienteRoutes.js`, `flujoCajaRoutes.js`, `listaEsperaRoutes.js`, `nominaRoutes.js`, `proveedorRoutes.js`, `reproductorRoutes.js`, `tesoreriaRoutes.js`, `vacacionRoutes.js`, `ventaRoutes.js`, `alevinRoutes.js`, `movimientoARoutes.js`
- Note: `catalogoEstadoController.js` exists but is NOT used by `catalogos/estado.js`

### Missing auth middleware
- `rolRoutes.js`, `modulosRoutes.js`, `rolesModulosRoutes.js`, `catalogos/estado.js`
- All inline `pool.query` route files listed above also lack auth middleware

### Response key inconsistency
- 18 controllers use English `{ message: "..." }`; only 3 (`usuarioController`, `departamentoController`, `empleadoController`) use the correct Spanish `{ mensaje: "..." }`

## Security Checklist

- Never commit `.env` (in `.gitignore`)
- Use `process.env` for all secrets
- Fallback `process.env.JWT_SECRET || "clave_secreta_dev"` is dev-only; ensure JWT_SECRET is set in production
- All protected routes must apply `authMiddleware` (see inconsistencies above)
