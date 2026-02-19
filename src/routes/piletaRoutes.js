import express from "express";
import piletaController from "../controllers/piletaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* ============================================================
   📌 RUTAS DE LOTES (En contexto de Piletas)
============================================================ */
router.get("/lotes/:granja", piletaController.getLotes);
router.get("/lote-por-inst/:inst/:granja", piletaController.getLotePorInst);

/* ============================================================
   📌 RUTAS DE INVENTARIO Y SIEMBRA
=========================================================== */
router.get("/inventario/:granja", piletaController.getInventario);
router.get("/origen/:granja", piletaController.getOrigen);

router.post("/siembra", piletaController.siembra);
router.delete("/:id", piletaController.delete);

/* ============================================================
   📌 RUTAS DE TRAZABILIDAD — MOVIMIENTOS ALEVINAJE
============================================================ */
router.get("/movimientos/:usuario/:granja", piletaController.getMovimientos);
router.get("/movimientos/filtro/:usuario/:granja", piletaController.getMovimientosFiltro);

router.post("/movimientos/registrar", piletaController.registrarMovimiento);
router.delete("/movimientos/eliminar", piletaController.eliminarMovimientos);

export default router;
