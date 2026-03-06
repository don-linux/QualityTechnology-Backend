import express from "express";
import recepcionInsumoController from "../../controllers/recepcionInsumoController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE RECEPCIÓN DE INSUMOS
========================================================= */
router.get("/", recepcionInsumoController.getAll);
router.post("/", recepcionInsumoController.create);
router.put("/:id", recepcionInsumoController.update);
router.delete("/:id", recepcionInsumoController.delete);
router.delete("/", recepcionInsumoController.deleteAll);

export default router;
