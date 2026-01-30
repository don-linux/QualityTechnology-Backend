import { Router } from "express";
import { plagasController } from "../../controllers/bitacoras/plagas.controller.js";

const router = Router();

router.get("/", plagasController.getAll);
router.get("/:id", plagasController.getById);
router.post("/", plagasController.create);
router.put("/:id", plagasController.update);
router.delete("/:id", plagasController.delete);
router.delete("/", plagasController.deleteAll);

export default router;
