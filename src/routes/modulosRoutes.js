import express from "express";
import ModulosController from "./../controllers/modulosController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE MODULOS
========================================================= */
router.get("/", ModulosController.getAll);
router.get("/:id", ModulosController.getById);

export default router;
