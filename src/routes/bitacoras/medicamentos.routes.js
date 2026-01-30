import { Router } from "express";
import { medicamentosController } from "../../controllers/bitacoras/medicamentos.controller.js";

const router = Router();

router.get("/", medicamentosController.getAll);
router.get("/:id", medicamentosController.getById);
router.post("/", medicamentosController.create);
router.put("/:id", medicamentosController.update);
router.delete("/:id", medicamentosController.delete);
router.delete("/", medicamentosController.deleteAll);

export default router;
