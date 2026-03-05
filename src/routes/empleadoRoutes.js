import express from "express";
import EmpleadoController from "../controllers/empleadoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   RUTAS PÚBLICAS
   ====================================================== */
/* (Por ahora ninguna pública, todo RRHH debería ser protegido) */


/* ======================================================
   RUTAS PROTEGIDAS (Requieren Token)
   ====================================================== */

router.use(authMiddleware);

// Obtener todos
router.get("/", EmpleadoController.getAll);

// Obtener por ID
router.get("/:id", EmpleadoController.getById);

// Crear empleado
router.post("/", EmpleadoController.create);

// Actualizar empleado
router.put("/:id", EmpleadoController.update);

// Eliminar físico
router.delete("/:id", EmpleadoController.delete);

// Baja lógica
router.patch("/:id/deactivate", EmpleadoController.deactivate);

export default router;