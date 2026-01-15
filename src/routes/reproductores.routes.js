import express from "express";
import { reproductoresController } from "../controllers/reproductores.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/inventario",
  authenticateToken,
  reproductoresController.getInventario
);
router.get(
  "/:usuario_id",
  authenticateToken,
  reproductoresController.getByUsuario
);
router.post("/", authenticateToken, reproductoresController.create);
router.put("/:id", authenticateToken, reproductoresController.update);
router.delete("/:id", authenticateToken, reproductoresController.delete);

export default router;
