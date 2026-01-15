import express from "express";
import { expedientesController } from "../controllers/expedientes.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, expedientesController.getAll);
router.post("/", authenticateToken, expedientesController.create);
router.put("/:id", authenticateToken, expedientesController.update);
router.delete("/:id", authenticateToken, expedientesController.delete);
router.delete("/", authenticateToken, expedientesController.deleteAll);

export default router;
