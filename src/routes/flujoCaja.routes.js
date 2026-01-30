import express from "express";
import { flujoCajaController } from "../controllers/flujoCaja.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/tesoreria/:granja", authenticateToken, flujoCajaController.getTesoreria);
router.get("/:granja", authenticateToken, flujoCajaController.getByGranja);
router.post("/", authenticateToken, flujoCajaController.create);
router.put("/:id", authenticateToken, flujoCajaController.update);
router.delete("/:id", authenticateToken, flujoCajaController.delete);

export default router;
