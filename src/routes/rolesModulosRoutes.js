import express from "express";
import RolesModulosController from "./../controllers/rolesModulosController.js";

const router = express.Router();

// =============================
// Obtener módulos por rol
// GET /api/roles/:rolId/modulos
// =============================
router.get("/:rolId/modulos", RolesModulosController.getModulosByRol);


// =============================
// Asignar módulo a rol
// POST /api/roles/:rolId/modulos
// Body: { moduloId }
// =============================
router.post("/:rolId/modulos", RolesModulosController.assignModulo);


// =============================
// Reemplazar todos los módulos del rol
// PUT /api/roles/:rolId/modulos
// Body: { modulosIds: [] }
// =============================
router.put("/:rolId/modulos", RolesModulosController.replaceModulos);


// =============================
// Quitar módulo de rol
// DELETE /api/roles/:rolId/modulos/:moduloId
// =============================
router.delete(
  "/:rolId/modulos/:moduloId",
  RolesModulosController.removeModulo
);

export default router;