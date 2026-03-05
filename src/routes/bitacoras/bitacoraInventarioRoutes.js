import express from "express";
import bitacoraInventarioController from "../../controllers/bitacoraInventarioController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE INVENTARIO
========================================================= */
router.get("/", bitacoraInventarioController.getAll);
router.post("/", bitacoraInventarioController.create);
router.put("/:id", bitacoraInventarioController.update);
router.delete("/:id", bitacoraInventarioController.delete);
router.delete("/", bitacoraInventarioController.deleteAll);

export default router;
