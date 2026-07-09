import express from "express";
import vacacionController from "../controllers/vacacionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE VACACIONES
========================================================= */
router.get("/", vacacionController.getAll);
router.post("/", vacacionController.create);
router.put("/:id", vacacionController.update);

export default router;
