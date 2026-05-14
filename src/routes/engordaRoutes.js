import express from "express";
import engordaController from "../controllers/engordaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE ENGORDA
========================================================= */
router.get("/granja/:granja", engordaController.getByGranja);
router.post("/", engordaController.create);
router.get("/movimientos/:usuario", engordaController.getMovimientos);
router.delete("/movimientos/:id", engordaController.deleteMovimiento);
router.delete("/:id", engordaController.delete);

export default router;
