import { Router } from "express";
import { biometriaController } from "../../controllers/bitacoras/biometria.controller.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
// router.use(authenticateToken); // Descomentar si se requiere autenticación

router.get("/", biometriaController.getAll);
router.get("/:id", biometriaController.getById);
router.post("/", biometriaController.create);
router.put("/:id", biometriaController.update);
router.delete("/:id", biometriaController.delete);
router.delete("/", biometriaController.deleteAll);

export default router;
