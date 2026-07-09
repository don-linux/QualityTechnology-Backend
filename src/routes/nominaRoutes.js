import express from "express";
import nominaController from "../controllers/nominaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE NOMINA
========================================================= */
router.get("/", nominaController.getAll);
router.post("/", nominaController.create);
router.put("/:id", nominaController.update);

export default router;
