import express from "express";
import infraestructuraFisicaController from "../controllers/infraestructuraFisicaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PROTEGER TODO EL MODULO
router.use(authMiddleware);

/* ============================================================
    CRUD INFRAESTRUCTURA FÍSICA (rutas fijas antes de /:param genéricos)
============================================================ */

router.get("/", infraestructuraFisicaController.getAll);
router.get("/:id/observaciones", infraestructuraFisicaController.getObservacionesHistorial);
router.post("/", infraestructuraFisicaController.create);
router.put("/:id", infraestructuraFisicaController.update);

export default router;
