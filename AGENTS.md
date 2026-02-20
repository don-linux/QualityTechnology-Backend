# AGENTS.md

Guidelines for AI agents working in the QualityTechnology-Backend repository.

## Build/Development Commands

```bash
# Start the production server
npm start

# Development mode with auto-reload
npm run dev

# Or use nodemon directly
npx nodemon index.mjs

# Install dependencies
npm install
```

## Testing

**Note:** No test framework is currently configured. To add tests:

```bash
# Install Jest
npm install --save-dev jest

# Add to package.json scripts:
# "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
# "test:watch": "jest --watch"
# "test:coverage": "jest --coverage"

# Run all tests
npm test

# Run a single test file
npx jest test/usuario.test.js

# Run tests matching a pattern
npx jest --testPathPattern=usuario
```

## API Documentation

Swagger UI is available at: `http://localhost:5000/api-docs`

API schema is defined in `swagger.yaml` in the project root.

## Technology Stack

- **Runtime:** Node.js with ES Modules (`"type": "module"`)
- **Framework:** Express.js v5.x
- **Database:** PostgreSQL (via `pg` pool)
- **Auth:** JWT (`jsonwebtoken`) + bcrypt for passwords
- **CORS:** Enabled for frontend at `http://localhost:3000`
- **API Docs:** Swagger UI at `/api-docs`

## Code Style Guidelines

### Imports & Modules
- Use ES module syntax: `import/export`
- Entry point is `index.mjs` (ESM extension)
- Import order: 1) npm packages, 2) local modules (alphabetical)
- Use double quotes for strings consistently

### Formatting
- 2-space indentation
- Semicolons required
- No trailing spaces
- Use trailing commas in multi-line arrays/objects

### Naming Conventions
- **Files:** camelCase with `.routes.js` suffix for routes
- **Variables:** camelCase
- **Database fields:** Hungarian notation prefix:
  - `fc_` = character/text fields
  - `fi_` = integer/ID fields  
  - `fd_` = date/datetime fields
  - `fn_` = numeric/float fields
- **Routes:** Plural nouns (e.g., `/usuarios`, `/clientes`)

### Comments & Documentation
- Use Spanish for all comments (project convention)
- Section headers with block style and emoji:
  ```javascript
  /* =====================================================
     🔹 Section Title
  ===================================================== */
  ```
- Common emojis: 🔹 (sections), 🛡️ (CORS/config), 🔗 (routes), 🚀 (server), ❌ (errors), 🔐 (auth)

### Error Handling
- Always use `try/catch` for async operations
- Log errors: `console.error("❌ Context:", err)`
- Return JSON error responses: `res.status(500).json({ error: "Message" })`
- Validate input with 400 status for bad requests

### Database Patterns
- Use parameterized queries: `pool.query("SELECT * FROM table WHERE id = $1", [id])`
- Import pool from: `import pool from "../db.js"`
- Return `result.rows` for queries, `result.rows[0]` for single results
- Use `RETURNING *` for INSERT/UPDATE when needed

### Route Structure
Routes delegate to controllers. Use class-based controllers:

```javascript
// src/routes/usuarioRoutes.js
import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no auth required)
router.post("/login", usuarioController.login);

// Protected routes (require JWT token)
router.use(authMiddleware);

router.get("/", usuarioController.getAll);
router.post("/", usuarioController.create);
router.put("/:id", usuarioController.update);
router.delete("/:id", usuarioController.delete);

export default router;
```

### Controller Pattern
Controllers are classes with static methods:

```javascript
// src/controllers/usuarioController.js
import usuarioModel from "../models/usuarioModel.js";

class UsuarioController {
    static async getAll(req, res) {
        try {
            const usuarios = await usuarioModel.getAll();
            res.json(usuarios);
        } catch (err) {
            console.error("❌ Error al obtener usuarios:", err);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    }

    static async create(req, res) {
        const { field1, field2 } = req.body;
        if (!field1 || !field2) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }
        try {
            await usuarioModel.create({ field1, field2 });
            res.status(201).json({ mensaje: "Creado exitosamente" });
        } catch (err) {
            console.error("❌ Error al crear:", err);
            res.status(500).json({ error: "Error al crear" });
        }
    }
}

export default UsuarioController;
```

### Model Pattern
Models contain database queries:

```javascript
// src/models/usuarioModel.js
import pool from "../db.js";

class UsuarioModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM usuarios");
        return result.rows;
    }

    static async create(data) {
        const { field1, field2 } = data;
        await pool.query(
            "INSERT INTO tabla (field1, field2) VALUES ($1, $2)",
            [field1, field2]
        );
    }
}

export default UsuarioModel;
```

### Security
- Never commit `.env` files (already in `.gitignore`)
- Use `process.env` for secrets (JWT_SECRET, DB credentials)
- Hash passwords with bcrypt (10 salt rounds)
- Validate JWT tokens for protected routes

### Environment Variables
Required in `.env`:
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
  ├── controllers/           # Route handlers (class-based)
  ├── models/               # Database query functions
  ├── middleware/           # Express middleware (auth, etc.)
  ├── routes/               # API route definitions
  │   └── bitacoras/        # Log/registry routes
  └── db.js                 # PostgreSQL pool configuration
index.mjs                   # Entry point (Express app)
swagger.yaml                # API documentation
```

## Conventions to Follow

1. Keep route handlers thin - business logic in separate functions if complex
2. Always export `router` as default from route files
3. Register routes in `index.mjs` with `app.use("/path", importedRoutes)`
4. Use Spanish for user-facing messages and comments
5. Use consistent error response format: `{ error: "message" }` or `{ error: "message", detalle: err.message }`
6. Dates: Use JavaScript `Date` objects or ISO strings, store in PostgreSQL timestamp fields
