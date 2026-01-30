import express from "express";
import { vacacionesController } from "../controllers/vacaciones.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, vacacionesController.getAll);
router.post("/", authenticateToken, vacacionesController.create);
router.put("/:id", authenticateToken, vacacionesController.update);
router.delete("/:id", authenticateToken, vacacionesController.delete);
router.delete("/", authenticateToken, vacacionesController.deleteAll);

export default router;
