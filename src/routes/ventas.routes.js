import express from "express";
import { ventasController } from "../controllers/ventas.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, ventasController.getAll);
router.get("/concentrado", authenticateToken, ventasController.getConcentrado);
router.post("/", authenticateToken, ventasController.create);
router.put("/:id", authenticateToken, ventasController.update);

export default router;
