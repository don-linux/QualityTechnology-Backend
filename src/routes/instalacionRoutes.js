import express from "express";
import instalacionController from "../controllers/instalacionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE INSTALACIONES
========================================================= */
router.get("/", instalacionController.getAll);
router.get("/granja/:granja", instalacionController.getByGranja);
router.get("/tipo/:tipo/:granja", instalacionController.getByTipo);

router.post("/", instalacionController.create);
router.put("/:id", instalacionController.update);
router.delete("/:id", instalacionController.delete);

export default router;
