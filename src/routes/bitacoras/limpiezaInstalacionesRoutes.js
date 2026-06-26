import express from "express";
import limpiezaInstalacionesController from "../../controllers/limpiezaInstalacionesController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/empleados", limpiezaInstalacionesController.getEmpleados);
router.get("/", limpiezaInstalacionesController.getAll);
router.post("/", limpiezaInstalacionesController.create);
router.put("/:id", limpiezaInstalacionesController.update);

export default router;
