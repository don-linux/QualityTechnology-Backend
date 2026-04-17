import express from "express";
import CuentaController from "../controllers/cuentaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", CuentaController.getAll);
router.get("/activos", CuentaController.getActivos);
router.post("/", CuentaController.create);
router.put("/:id", CuentaController.update);
router.patch("/:id/activate", CuentaController.activate);
router.patch("/:id/deactivate", CuentaController.deactivate);

export default router;
