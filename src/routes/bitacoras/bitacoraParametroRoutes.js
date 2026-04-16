import express from "express";
import bitacoraParametroController from "../../controllers/bitacoraParametroController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE PARÁMETROS
========================================================= */
router.get("/empleados", bitacoraParametroController.getEmpleados);
router.get("/", bitacoraParametroController.getAll);
router.post("/", bitacoraParametroController.create);
router.put("/:id", bitacoraParametroController.update);
router.delete("/:id", bitacoraParametroController.delete);
router.delete("/", bitacoraParametroController.deleteAll);

export default router;
