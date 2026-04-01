import express from "express";
import PuestoController from "../controllers/puestoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", PuestoController.getAll);
router.get("/activos", PuestoController.getActivos);
router.post("/", PuestoController.create);
router.put("/:id", PuestoController.update);
router.patch("/:id/deactivate", PuestoController.deactivate);

export default router;
