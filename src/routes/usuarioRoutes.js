import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

/* ======================================================
    RUTAS PÚBLICAS
   ====================================================== */
router.post("/login", usuarioController.login);

/* ======================================================
    RUTAS PROTEGIDAS (Requieren Token + Módulo "Usuarios")
   ====================================================== */
router.use(authMiddleware);
router.use(rbacMiddleware("/usuarios"));

router.get("/", usuarioController.getAll);
router.post("/", usuarioController.create);
router.put("/:id", usuarioController.update);
router.delete("/:id", usuarioController.delete);

export default router;
