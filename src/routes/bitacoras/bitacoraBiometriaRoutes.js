import express from "express";
import bitacoraBiometriaController from "../../controllers/bitacoraBiometriaController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE BIOMETRÍA
========================================================= */
router.get("/", bitacoraBiometriaController.getAll);
router.get("/empleados", bitacoraBiometriaController.getEmpleados);
router.get("/info/:granja/:instalacion", bitacoraBiometriaController.getInfo);
router.get("/:granja", bitacoraBiometriaController.getByGranja);
router.post("/", bitacoraBiometriaController.create);
router.put("/:id", bitacoraBiometriaController.update);

export default router;
