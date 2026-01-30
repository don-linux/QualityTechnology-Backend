import express from "express";
import { instalacionesController } from "../controllers/instalaciones.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/:usuario_id", authenticateToken, instalacionesController.getByUsuario);
router.get("/granja/:nombre", authenticateToken, instalacionesController.getByGranja);
router.post("/", authenticateToken, instalacionesController.create);
router.put("/:id", authenticateToken, instalacionesController.update);
router.delete("/:id", authenticateToken, instalacionesController.delete);

export default router;
