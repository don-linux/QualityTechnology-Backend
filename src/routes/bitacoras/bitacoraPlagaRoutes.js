import express from "express";
import bitacoraPlagaController from "../../controllers/bitacoraPlagaController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE PLAGAS
========================================================= */
router.get("/empleados", bitacoraPlagaController.getEmpleados);
router.get("/", bitacoraPlagaController.getAll);
router.post("/", bitacoraPlagaController.create);
router.put("/:id", bitacoraPlagaController.update);
router.delete("/:id", bitacoraPlagaController.delete);
router.delete("/", bitacoraPlagaController.deleteAll);

export default router;
