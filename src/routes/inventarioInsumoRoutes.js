import express from "express";
import inventarioInsumoController from "../controllers/inventarioInsumoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE INVENTARIO DE INSUMOS
========================================================= */
router.get("/empleados", inventarioInsumoController.getEmpleados);
router.get("/", inventarioInsumoController.getAll);
router.post("/", inventarioInsumoController.create);
router.put("/:id", inventarioInsumoController.update);

export default router;
