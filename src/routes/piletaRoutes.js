import express from "express";
import piletaController from "../controllers/piletaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PROTEGER TODO EL MODULO
router.use(authMiddleware);

/* ============================================================
    CRUD PILETA (rutas fijas antes de /:param genéricos)
============================================================ */

router.get("/", piletaController.getAll);
router.post("/", piletaController.create);
router.put("/:id", piletaController.update);

router.delete("/:id", piletaController.delete);

export default router;
