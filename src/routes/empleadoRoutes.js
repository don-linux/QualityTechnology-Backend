import express from "express";
import EmpleadoController from "../controllers/empleadoController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Self-service (cualquier usuario logueado)
router.get("/mi-perfil", EmpleadoController.getMiPerfil);
router.put("/mi-perfil", EmpleadoController.updateMiPerfil);

// Admin (requiere modulo Empleados)
router.get("/", rbacMiddleware("/empleados"), EmpleadoController.getAll);
router.get("/:id", rbacMiddleware("/empleados"), EmpleadoController.getById);
router.post("/", rbacMiddleware("/empleados"), EmpleadoController.create);
router.put("/:id", rbacMiddleware("/empleados"), EmpleadoController.update);
router.delete("/:id", rbacMiddleware("/empleados"), EmpleadoController.delete);
router.patch("/:id/deactivate", rbacMiddleware("/empleados"), EmpleadoController.deactivate);
router.patch("/:id/activate", rbacMiddleware("/empleados"), EmpleadoController.activate);

export default router;
