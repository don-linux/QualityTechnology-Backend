import { Router } from "express";
import { parametrosController } from "../../controllers/bitacoras/parametros.controller.js";

const router = Router();

router.get("/", parametrosController.getAll);
router.get("/:id", parametrosController.getById);
router.post("/", parametrosController.create);
router.put("/:id", parametrosController.update);
router.delete("/:id", parametrosController.delete);
router.delete("/", parametrosController.deleteAll);

export default router;
