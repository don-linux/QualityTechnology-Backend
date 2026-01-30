import { Router } from "express";
import { recambiosController } from "../../controllers/bitacoras/recambios.controller.js";

const router = Router();

router.get("/", recambiosController.getAll);
router.get("/:id", recambiosController.getById);
router.post("/", recambiosController.create);
router.put("/:id", recambiosController.update);
router.delete("/:id", recambiosController.delete);
router.delete("/", recambiosController.deleteAll);

export default router;
