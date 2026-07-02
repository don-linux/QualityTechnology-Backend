import express from "express";
import flujoInsumoController from "../../controllers/flujoInsumoController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE FLUJO DE INSUMOS
========================================================= */
router.get("/empleados", flujoInsumoController.getEmpleados);
router.get("/", flujoInsumoController.getAll);
router.post("/", flujoInsumoController.create);
router.put("/:id", flujoInsumoController.update);

export default router;
