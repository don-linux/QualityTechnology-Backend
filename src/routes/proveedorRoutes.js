import express from "express";
import proveedorController from "../controllers/proveedorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE PROVEEDORES
========================================================= */
router.get("/", proveedorController.getAll);
router.post("/", proveedorController.create);
router.put("/:id", proveedorController.update);
router.delete("/:id", proveedorController.delete);

export default router;
