import express from "express";
import { proveedoresController } from "../controllers/proveedores.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, proveedoresController.getAll);
router.post("/", authenticateToken, proveedoresController.create);
router.put("/:id", authenticateToken, proveedoresController.update);
router.delete("/:id", authenticateToken, proveedoresController.delete);

export default router;
