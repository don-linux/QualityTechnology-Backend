import { Router } from "express";
import { inventarioController } from "../../controllers/bitacoras/inventario.controller.js";

const router = Router();

router.get("/", inventarioController.getAll);
router.get("/:id", inventarioController.getById);
router.post("/", inventarioController.create);
router.put("/:id", inventarioController.update);
router.delete("/:id", inventarioController.delete);
router.delete("/", inventarioController.deleteAll);

export default router;
