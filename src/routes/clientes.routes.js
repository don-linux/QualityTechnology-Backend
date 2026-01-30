import express from "express";
import { clientesController } from "../controllers/clientes.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/", authenticateToken, clientesController.getAll);
router.get("/:id", authenticateToken, clientesController.getById);
router.post("/", authenticateToken, clientesController.create);
router.put("/:id", authenticateToken, clientesController.update);
router.delete("/:id", authenticateToken, clientesController.delete);

export default router;
