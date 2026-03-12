import express from "express";
import ventaController from "../controllers/ventaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE VENTAS
========================================================= */
router.get("/clientes", ventaController.getClientes);
router.get("/encargados/:empresa", ventaController.getEncargados);
router.get("/", ventaController.getAll);
router.post("/", ventaController.create);
router.put("/:id", ventaController.update);
router.delete("/:id", ventaController.delete);

export default router;
