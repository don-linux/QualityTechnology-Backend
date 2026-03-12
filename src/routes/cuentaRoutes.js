import express from "express";
import cuentaController from "../controllers/cuentaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE CUENTAS
========================================================= */
router.get("/", cuentaController.getAll);
router.post("/", cuentaController.create);
router.put("/:id", cuentaController.update);
router.delete("/:id", cuentaController.delete);
router.put("/actualizar-saldo/:id", cuentaController.updateSaldo);

export default router;
