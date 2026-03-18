import express from "express";
import listaEsperaController from "../controllers/listaEsperaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE LISTA DE ESPERA
========================================================= */
router.get("/", listaEsperaController.getAll);
router.post("/", listaEsperaController.create);
router.put("/:id", listaEsperaController.update);
router.delete("/:id", listaEsperaController.delete);
router.post("/convertir/:id", listaEsperaController.convertir);

export default router;
