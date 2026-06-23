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
router.patch("/:id/activate", proveedorController.activate);
router.patch("/:id/deactivate", proveedorController.deactivate);

export default router;
