import express from "express";
import fs from "fs";
import flujoCajaController from "../controllers/flujoCajaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   Flujo de caja: solo lectura (bitacora de movimientos).
   Los movimientos se generan automaticamente (p. ej. pagos de
   ventas desde ventaController); ya no se crean/editan a mano.
========================================================= */
router.get("/", flujoCajaController.getAll);
router.get("/:granja", flujoCajaController.getByGranja);

/* =========================================================
   Servir archivos estaticos de facturas ya cargadas
========================================================= */
const uploadDir = "./uploads/facturas";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
router.use("/uploads/facturas", express.static("uploads/facturas"));

export default router;
