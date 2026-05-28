import express from "express";
import reproductorController from "../controllers/reproductorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE REPRODUCTORES
========================================================= */
router.get("/granja/:granja", reproductorController.getByGranja);
router.post("/", reproductorController.create);
router.put("/:id", reproductorController.update);
router.delete("/:id", reproductorController.delete);

export default router;
