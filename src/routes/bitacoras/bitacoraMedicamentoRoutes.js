import express from "express";
import bitacoraMedicamentoController from "../../controllers/bitacoraMedicamentoController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE MEDICAMENTOS
========================================================= */
router.get("/empleados", bitacoraMedicamentoController.getEmpleados);
router.get("/", bitacoraMedicamentoController.getAll);
router.post("/", bitacoraMedicamentoController.create);
router.put("/:id", bitacoraMedicamentoController.update);

export default router;
