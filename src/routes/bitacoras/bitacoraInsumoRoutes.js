import express from "express";
import bitacoraInsumoController from "../../controllers/bitacoraInsumoController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE INSUMOS
========================================================= */
router.get("/", bitacoraInsumoController.getAll);
router.post("/", bitacoraInsumoController.create);
router.put("/:id", bitacoraInsumoController.update);
router.delete("/:id", bitacoraInsumoController.delete);
router.delete("/", bitacoraInsumoController.deleteAll);

export default router;
