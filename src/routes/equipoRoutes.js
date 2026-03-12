import express from "express";
import equipoController from "../controllers/equipoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE EQUIPOS
========================================================= */
router.get("/:usuario_id", equipoController.getByUsuario);
router.post("/", equipoController.create);
router.put("/:id", equipoController.update);
router.delete("/:id", equipoController.delete);

/* =========================================================
   RUTAS DE MANTENIMIENTOS
========================================================= */
router.get("/:equipo_id/mantenimientos", equipoController.getMantenimientos);
router.post("/:equipo_id/mantenimientos", equipoController.createMantenimiento);
router.put("/mantenimientos/:mantenimiento_id", equipoController.updateMantenimiento);
router.delete("/mantenimientos/:mantenimiento_id", equipoController.deleteMantenimiento);

export default router;
