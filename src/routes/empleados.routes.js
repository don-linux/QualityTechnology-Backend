import express from "express";
import { empleadosController } from "../controllers/empleados.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, empleadosController.getAll);
router.post("/", authenticateToken, empleadosController.create);
router.put("/:id", authenticateToken, empleadosController.update);
router.delete("/:id", authenticateToken, empleadosController.delete);

export default router;
