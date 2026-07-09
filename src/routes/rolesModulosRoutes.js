import express from "express";
import RolesModulosController from "./../controllers/rolesModulosController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);
router.use(rbacMiddleware("/seguridad"));

/* =========================================================
   RUTAS DE ROLES-MODULOS
========================================================= */
router.get("/:rolId/modulos", RolesModulosController.getModulosByRol);
router.post("/:rolId/modulos", RolesModulosController.assignModulo);
router.put("/:rolId/modulos", RolesModulosController.replaceModulos);
router.delete("/:rolId/modulos/:moduloId", RolesModulosController.removeModulo);

export default router;
