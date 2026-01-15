import { Router } from "express";
import { banosController } from "../../controllers/bitacoras/banos.controller.js";

const router = Router();

router.get("/", banosController.getAll);
router.get("/:id", banosController.getById);
router.post("/", banosController.create);
router.put("/:id", banosController.update);
router.delete("/:id", banosController.delete);
router.delete("/", banosController.deleteAll);

export default router;
