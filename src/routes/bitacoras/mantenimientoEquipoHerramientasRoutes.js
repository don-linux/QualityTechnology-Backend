import express from "express";
import mantenimientoEquipoHerramientasController from "../../controllers/mantenimientoEquipoHerramientasController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", mantenimientoEquipoHerramientasController.getAll);
router.post("/", mantenimientoEquipoHerramientasController.create);
router.put("/:id", mantenimientoEquipoHerramientasController.update);

export default router;
