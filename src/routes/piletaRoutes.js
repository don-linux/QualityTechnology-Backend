import express from "express";
import piletaController from "../controllers/piletaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PROTEGER TODO EL MODULO
router.use(authMiddleware);

/* ============================================================
    RUTAS DE LOTES
============================================================ */

router.get("/lotes/:granja", piletaController.getLotes);
router.get("/lote-por-inst/:inst/:granja", piletaController.getLotePorInst);

/* ============================================================
    INVENTARIO
============================================================ */

router.get("/inventario/:granja", piletaController.getInventario);
router.get("/origen/:granja", piletaController.getOrigen);
router.get("/destino/:granja", piletaController.getDestino);

/* ============================================================
    SIEMBRA
============================================================ */

router.post("/siembra", piletaController.siembra);
router.delete("/:id", piletaController.delete);

/* ============================================================
    TRAZABILIDAD
============================================================ */

// FILTRO PRIMERO (más específico)
router.get("/movimientos/filtro/:usuario/:granja", piletaController.getMovimientosFiltro);

// GENERAL DESPUÉS
router.get("/movimientos/:usuario/:granja", piletaController.getMovimientos);

router.post("/movimientos/registrar", piletaController.registrarMovimiento);
router.delete("/movimientos/eliminar", piletaController.eliminarMovimientos);

export default router;