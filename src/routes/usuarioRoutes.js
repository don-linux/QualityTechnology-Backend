import express from "express";
import rateLimit from "express-rate-limit";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos." },
});

const router = express.Router();

/* ======================================================
    RUTAS PÚBLICAS
   ====================================================== */
router.post("/login", loginLimiter, usuarioController.login);
router.post("/refresh", usuarioController.refresh);

/* ======================================================
    RUTAS PROTEGIDAS (Requieren Token)
   ====================================================== */
router.use(authMiddleware);

router.post("/logout", usuarioController.logout);

/* ======================================================
    RUTAS PROTEGIDAS (Requieren Token + Módulo "Usuarios")
   ====================================================== */
router.use(rbacMiddleware("/usuarios"));

router.get("/", usuarioController.getAll);
router.post("/", usuarioController.create);
router.put("/:id", usuarioController.update);
router.delete("/:id", usuarioController.delete);

export default router;
