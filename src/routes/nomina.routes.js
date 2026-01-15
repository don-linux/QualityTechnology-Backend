import express from "express";
import { nominaController } from "../controllers/nomina.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, nominaController.getAll);
router.post("/", authenticateToken, nominaController.create);
router.put("/:id", authenticateToken, nominaController.update);
router.delete("/:id", authenticateToken, nominaController.delete);

export default router;
