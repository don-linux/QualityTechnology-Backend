import express from "express";
import cajaAhorroController from "../controllers/cajaAhorroController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE CAJA DE AHORRO
========================================================= */
router.get("/:granja", cajaAhorroController.getByGranja);
router.post("/", cajaAhorroController.create);
router.put("/:id", cajaAhorroController.update);
router.delete("/:id", cajaAhorroController.delete);
router.delete("/", cajaAhorroController.deleteByGranja);

export default router;
