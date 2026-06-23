import express from "express";
import controlLimpiezaController from "../../controllers/controlLimpiezaController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// =====================================================
// RUTAS DE CONTROL DE LIMPIEZA
// =====================================================

router.get("/empleados", controlLimpiezaController.getEmpleados);
router.get("/", controlLimpiezaController.getAll);
router.post("/", controlLimpiezaController.create);
router.put("/:id", controlLimpiezaController.update);
router.delete("/:id", controlLimpiezaController.delete);
router.delete("/", controlLimpiezaController.deleteAll);

export default router;
