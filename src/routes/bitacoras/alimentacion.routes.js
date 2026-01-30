import { Router } from "express";
import { alimentacionController } from "../../controllers/bitacoras/alimentacion.controller.js";

const router = Router();

router.get("/", alimentacionController.getAll);
router.get("/:id", alimentacionController.getById);
router.post("/", alimentacionController.create);
router.put("/:id", alimentacionController.update);
router.delete("/:id", alimentacionController.delete);
router.delete("/", alimentacionController.deleteAll);

export default router;
