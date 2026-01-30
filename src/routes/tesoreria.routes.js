import express from "express";
import { tesoreriaController } from "../controllers/tesoreria.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/", authenticateToken, tesoreriaController.getOverview);

export default router;
