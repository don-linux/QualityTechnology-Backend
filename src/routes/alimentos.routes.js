import express from "express";
import { alimentosController } from "../controllers/alimentos.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:usuario_id", authenticateToken, alimentosController.getByUsuario);
router.post("/", authenticateToken, alimentosController.create);
router.delete("/:id", authenticateToken, alimentosController.delete);

export default router;
