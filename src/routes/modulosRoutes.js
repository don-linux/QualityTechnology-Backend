import express from "express";
import ModulosController from "./../controllers/modulosController.js";

const router = express.Router();

// =============================
// Obtener todos los módulos
// GET /api/modulos
// =============================
router.get("/", ModulosController.getAll);

// =============================
// Obtener módulo por ID
// GET /api/modulos/:id
// =============================
router.get("/:id", ModulosController.getById);

export default router;