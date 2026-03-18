import express from "express";
import movimientoAController from "../controllers/movimientoAController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE MOVIMIENTO DE ALEVINES
========================================================= */
router.get("/", movimientoAController.getAll);
router.post("/", movimientoAController.create);
router.put("/:id", movimientoAController.update);
router.delete("/:id", movimientoAController.delete);

export default router;
