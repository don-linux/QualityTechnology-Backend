import express from "express";
import {
  equiposController,
  mantenimientosController,
} from "../controllers/equipos.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Rutas de equipos
router.get(
  "/:usuario_id",
  authenticateToken,
  equiposController.getByUsuario
);
router.post("/", authenticateToken, equiposController.create);
router.put("/:id", authenticateToken, equiposController.update);
router.delete("/:id", authenticateToken, equiposController.delete);

// Rutas de mantenimientos (anidadas)
router.get(
  "/:equipo_id/mantenimientos",
  authenticateToken,
  mantenimientosController.getByEquipo
);
router.post(
  "/:equipo_id/mantenimientos",
  authenticateToken,
  mantenimientosController.create
);
router.put(
  "/mantenimientos/:mantenimiento_id",
  authenticateToken,
  mantenimientosController.update
);
router.delete(
  "/mantenimientos/:mantenimiento_id",
  authenticateToken,
  mantenimientosController.delete
);

export default router;
