import express from "express";
import { cajaAhorroController } from "../controllers/cajaAhorro.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:granja", authenticateToken, cajaAhorroController.getByGranja);
router.post("/", authenticateToken, cajaAhorroController.create);
router.put("/:id", authenticateToken, cajaAhorroController.update);
router.delete("/:id", authenticateToken, cajaAhorroController.delete);
router.delete("/", authenticateToken, cajaAhorroController.deleteByGranja);

export default router;
