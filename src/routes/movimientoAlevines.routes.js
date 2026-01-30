import express from "express";
import { movimientoAlevinesController } from "../controllers/movimientoAlevines.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/", authenticateToken, movimientoAlevinesController.getAll);
router.post("/", authenticateToken, movimientoAlevinesController.create);
router.put("/:id", authenticateToken, movimientoAlevinesController.update);
router.delete("/:id", authenticateToken, movimientoAlevinesController.delete);

export default router;
