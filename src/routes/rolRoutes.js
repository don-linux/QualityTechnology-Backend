import express from "express";
import rolController from "../controllers/rolController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);
router.use(rbacMiddleware("/roles"));

/* =========================================================
   RUTAS DE ROLES
========================================================= */
router.get("/", rolController.getAll);
router.post("/", rolController.create);
router.put("/:id", rolController.update);
router.delete("/:id", rolController.delete);

export default router;
