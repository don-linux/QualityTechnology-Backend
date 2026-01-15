import express from "express";
import { usuariosController } from "../controllers/usuarios.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Ruta pública
router.post("/login", usuariosController.login);

// Rutas protegidas (requieren autenticación)
router.get("/", authenticateToken, usuariosController.getAll);
router.get("/:id", authenticateToken, usuariosController.getById);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("administrador"),
  usuariosController.create
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("administrador"),
  usuariosController.update
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("administrador"),
  usuariosController.delete
);

export default router;
