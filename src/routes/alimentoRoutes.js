import express from "express";
import alimentoController from "../controllers/alimentoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
    RUTAS DE ALIMENTOS
========================================================= */
router.get("/", alimentoController.getAll); // Ahora usa el token para saber el usuario y rol
router.post("/", alimentoController.create);
router.delete("/:id", alimentoController.delete);

export default router;
