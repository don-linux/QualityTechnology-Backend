import { Router } from "express";
import EstadoController from "./../../controllers/catalogoEstadoController.js";
import authMiddleware from "./../../middleware/authMiddleware.js";

const router = Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE CATALOGO DE ESTADOS
========================================================= */
router.get("/", EstadoController.getAll);
router.get("/:id", EstadoController.getById);
router.post("/", EstadoController.create);
router.put("/:id", EstadoController.update);
router.delete("/:id", EstadoController.delete);

export default router;
