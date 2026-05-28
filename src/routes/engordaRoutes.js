import express from "express";
import engordaController from "../controllers/engordaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE ENGORDA
========================================================= */
router.get("/", engordaController.getAll);
router.get("/granja/:granja", engordaController.getByGranja);
router.get("/:id", engordaController.getById);
router.post("/", engordaController.create);
router.put("/:id", engordaController.update);
router.delete("/:id", engordaController.delete);

export default router;
