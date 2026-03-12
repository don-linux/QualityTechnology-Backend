import express from "express";
import expedienteController from "../controllers/expedienteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE EXPEDIENTES
========================================================= */
router.get("/", expedienteController.getAll);
router.post("/", expedienteController.create);
router.put("/:id", expedienteController.update);
router.delete("/:id", expedienteController.delete);
router.delete("/", expedienteController.deleteAll);

export default router;
