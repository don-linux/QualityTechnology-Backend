# AGENTS.md

Guidelines for AI agents working in the QualityTechnology-Backend repository.

## Build/Development Commands

```bash
# Start the development server
npm start

# Or use nodemon directly
npx nodemon index.mjs

# Install dependencies
npm install
```

**Note:** No test framework or linting is currently configured. Tests can be added using Jest: `npm install --save-dev jest`.

## Technology Stack

- **Runtime:** Node.js with ES Modules (`"type": "module"`)
- **Framework:** Express.js v5.x
- **Database:** PostgreSQL (via `pg` pool)
- **Auth:** JWT (`jsonwebtoken`) + bcrypt for passwords
- **CORS:** Enabled for frontend at `http://localhost:3000`

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
```javascript
import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM table");
    res.json(result.rows);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create
router.post("/", async (req, res) => {
  const { field1, field2 } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO table (field1, field2) VALUES ($1, $2) RETURNING *",
      [field1, field2]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
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
routes/
  ├── *.routes.js          # Main API routes
  └── bitacoras/           # Log/registry routes
index.mjs                  # Entry point (Express app)
db.js                      # PostgreSQL pool configuration
```

## Conventions to Follow

1. Keep route handlers thin - business logic in separate functions if complex
2. Always export `router` as default from route files
3. Register routes in `index.mjs` with `app.use("/path", importedRoutes)`
4. Use Spanish for user-facing messages and comments
5. Use consistent error response format: `{ error: "message" }` or `{ error: "message", detalle: err.message }`
6. Dates: Use JavaScript `Date` objects or ISO strings, store in PostgreSQL timestamp fields
