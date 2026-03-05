import express from "express";
import DepartamentoController from "../controllers/DepartamentoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Lista completa
router.get("/", DepartamentoController.getAll);

// Solo activos (para selects)
router.get("/activos", DepartamentoController.getActivos);

// Crear
router.post("/", DepartamentoController.create);

export default router;