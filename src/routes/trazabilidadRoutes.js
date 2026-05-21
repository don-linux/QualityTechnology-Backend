import express from "express";
import trazabilidadController from "../controllers/trazabilidadController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/movimientos/:granja", trazabilidadController.getMovimientos);

export default router;
