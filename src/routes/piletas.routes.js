import express from "express";
import { piletasController } from "../controllers/piletas.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/:usuario_id", authenticateToken, piletasController.getByUsuario);
router.get("/id/:id", authenticateToken, piletasController.getById);
router.post("/", authenticateToken, piletasController.create);
router.put("/:id", authenticateToken, piletasController.update);
router.delete("/:id", authenticateToken, piletasController.delete);

export default router;
