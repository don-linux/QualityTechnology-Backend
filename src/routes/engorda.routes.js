import express from "express";
import { engordaController } from "../controllers/engorda.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:usuario_id", authenticateToken, engordaController.getByUsuario);
router.post("/", authenticateToken, engordaController.create);
router.put("/:id", authenticateToken, engordaController.update);
router.delete("/:id", authenticateToken, engordaController.delete);

export default router;
