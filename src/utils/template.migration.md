# Template para Migración de Rutas

Este documento sirve como guía para migrar las rutas antiguas a la nueva estructura MVC.

## Paso 1: Crear el Model

Crear `src/models/[entidad].model.js`:

```javascript
import pool from "../config/database.js";

export const [entidad]Model = {
  findAll: async () => {
    const result = await pool.query("SELECT * FROM [tabla] ORDER BY id");
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM [tabla] WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const result = await pool.query(
      "INSERT INTO [tabla] (...) VALUES (...) RETURNING *",
      [...]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const result = await pool.query(
      "UPDATE [tabla] SET ... WHERE id = $1 RETURNING *",
      [..., id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query("DELETE FROM [tabla] WHERE id = $1", [id]);
    return true;
  },
};
```

## Paso 2: Crear el Controller

Crear `src/controllers/[entidad].controller.js`:

```javascript
import { [entidad]Model } from "../models/[entidad].model.js";

export const [entidad]Controller = {
  getAll: async (req, res, next) => {
    try {
      const items = await [entidad]Model.findAll();
      res.json(items);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await [entidad]Model.findById(id);
      
      if (!item) {
        return res.status(404).json({ error: "[Entidad] no encontrado" });
      }
      
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;
      const item = await [entidad]Model.create(data);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const item = await [entidad]Model.update(id, data);
      
      if (!item) {
        return res.status(404).json({ error: "[Entidad] no encontrado" });
      }
      
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await [entidad]Model.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
```

## Paso 3: Crear/Actualizar la Route

Crear `src/routes/[entidad].routes.js`:

```javascript
import express from "express";
import { [entidad]Controller } from "../controllers/[entidad].controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación (ajustar según necesidades)
router.get("/", authenticateToken, [entidad]Controller.getAll);
router.get("/:id", authenticateToken, [entidad]Controller.getById);
router.post("/", authenticateToken, [entidad]Controller.create);
router.put("/:id", authenticateToken, [entidad]Controller.update);
router.delete("/:id", authenticateToken, [entidad]Controller.delete);

export default router;
```

## Paso 4: Actualizar src/index.js

1. Importar la nueva ruta:
```javascript
import [entidad]Routes from "./routes/[entidad].routes.js";
```

2. Registrar la ruta:
```javascript
app.use("/[ruta]", [entidad]Routes);
```

3. Eliminar la importación antigua y su registro.

## Ejemplo Completo: Migración de Roles

Ver los archivos existentes como referencia:
- `src/models/roles.model.js`
- `src/controllers/roles.controller.js`
- `src/routes/roles.routes.js`

## Notas Importantes

1. **Manejo de Errores**: Siempre usar `next(error)` en los controladores para que el errorHandler los procese.

2. **Autenticación**: 
   - Usar `authenticateToken` para rutas protegidas
   - Usar `authorizeRoles("rol1", "rol2")` para restricciones por rol
   - El login de usuarios no requiere autenticación

3. **Validación**: Agregar validaciones en los controladores antes de llamar a los modelos.

4. **Lógica Compleja**: Si hay lógica de negocio compleja, crear un servicio en `src/services/`.
