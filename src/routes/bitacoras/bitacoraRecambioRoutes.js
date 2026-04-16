import express from "express";
import bitacoraRecambioController from "../../controllers/bitacoraRecambioController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE RECAMBIOS
========================================================= */
router.get("/empleados", bitacoraRecambioController.getEmpleados);
router.get("/", bitacoraRecambioController.getAll);
router.post("/", bitacoraRecambioController.create);
router.put("/:id", bitacoraRecambioController.update);
router.delete("/:id", bitacoraRecambioController.delete);
router.delete("/", bitacoraRecambioController.deleteAll);

export default router;
