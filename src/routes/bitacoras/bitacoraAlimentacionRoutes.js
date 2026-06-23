import express from "express";
import bitacoraAlimentacionController from "../../controllers/bitacoraAlimentacionController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE ALIMENTACIÓN
========================================================= */
router.get("/", bitacoraAlimentacionController.getAll);
router.post("/", bitacoraAlimentacionController.create);
router.put("/:id", bitacoraAlimentacionController.update);

export default router;
