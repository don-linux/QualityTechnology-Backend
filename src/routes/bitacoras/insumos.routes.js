import { Router } from "express";
import { insumosController } from "../../controllers/bitacoras/insumos.controller.js";

const router = Router();

router.get("/", insumosController.getAll);
router.get("/:id", insumosController.getById);
router.post("/", insumosController.create);
router.put("/:id", insumosController.update);
router.delete("/:id", insumosController.delete);
router.delete("/", insumosController.deleteAll);

export default router;
