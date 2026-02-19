import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   🔹 RUTAS PÚBLICAS
   ====================================================== */
router.post("/login", usuarioController.login);

/* ======================================================
   🔹 RUTAS PROTEGIDAS (Requieren Token)
   ====================================================== */
router.use(authMiddleware);

router.get("/", usuarioController.getAll);
router.post("/", usuarioController.create);
router.put("/:id", usuarioController.update);
router.delete("/:id", usuarioController.delete);

export default router;
