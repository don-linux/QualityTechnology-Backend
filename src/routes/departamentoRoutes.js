import express from "express";
import DepartamentoController from "../controllers/departamentoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", DepartamentoController.getAll);
router.get("/activos", DepartamentoController.getActivos);
router.post("/", DepartamentoController.create);
router.put("/:id", DepartamentoController.update);
router.patch("/:id/deactivate", DepartamentoController.deactivate);

export default router;