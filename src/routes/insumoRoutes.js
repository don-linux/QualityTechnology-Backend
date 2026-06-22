import express from "express";
import InsumoController from "../controllers/insumoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", InsumoController.getAll);
router.get("/activos", InsumoController.getActivos);
router.post("/", InsumoController.create);
router.put("/:id", InsumoController.update);
router.patch("/:id/activate", InsumoController.activate);
router.patch("/:id/deactivate", InsumoController.deactivate);

export default router;
