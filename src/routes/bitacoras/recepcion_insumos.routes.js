import { Router } from "express";
import { recepcionInsumosController } from "../../controllers/bitacoras/recepcion_insumos.controller.js";

const router = Router();

router.get("/", recepcionInsumosController.getAll);
router.get("/:id", recepcionInsumosController.getById);
router.post("/", recepcionInsumosController.create);
router.put("/:id", recepcionInsumosController.update);
router.delete("/:id", recepcionInsumosController.delete);
router.delete("/", recepcionInsumosController.deleteAll);

export default router;
