import express from "express";
import tesoreriaController from "../controllers/tesoreriaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE TESORERIA
========================================================= */
router.get("/", tesoreriaController.getOverview);

export default router;
