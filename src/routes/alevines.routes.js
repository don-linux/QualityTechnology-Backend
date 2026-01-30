import express from "express";
import { alevinesController } from "../controllers/alevines.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/", authenticateToken, alevinesController.getAll);
router.post("/", authenticateToken, alevinesController.create);
router.put("/:id", authenticateToken, alevinesController.update);
router.delete("/:id", authenticateToken, alevinesController.delete);

export default router;
