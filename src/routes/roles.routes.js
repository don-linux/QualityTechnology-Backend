import express from "express";
import { rolesController } from "../controllers/roles.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/", authenticateToken, rolesController.getAll);
router.get("/:id", authenticateToken, rolesController.getById);
router.post("/", authenticateToken, rolesController.create);
router.put("/:id", authenticateToken, rolesController.update);
router.delete("/:id", authenticateToken, rolesController.delete);

export default router;
