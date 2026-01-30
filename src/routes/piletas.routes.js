import express from "express";
import { piletasController } from "../controllers/piletas.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación

// Piletas por granja
router.get("/granja/:nombre", authenticateToken, piletasController.getByGranja);

// Inventario por granja
router.get("/inventario/:granja", authenticateToken, piletasController.getInventario);

// Rastreabilidad
router.get("/movimientos/filtro/:usuario_id/:granja", authenticateToken, piletasController.filtrarRastreabilidad);
router.get("/movimientos/:usuario_id/:granja", authenticateToken, piletasController.getRastreabilidad);
router.delete("/movimientos/eliminar", authenticateToken, piletasController.deleteRastreabilidad);

// CRUD básico
router.get("/:usuario_id", authenticateToken, piletasController.getByUsuario);
router.get("/id/:id", authenticateToken, piletasController.getById);
router.post("/", authenticateToken, piletasController.create);
router.put("/:id", authenticateToken, piletasController.update);
router.delete("/:id", authenticateToken, piletasController.delete);

export default router;
