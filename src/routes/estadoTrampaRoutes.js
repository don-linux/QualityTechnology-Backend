import express from "express";
import EstadoTrampaController from "../controllers/estadoTrampaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", EstadoTrampaController.getAll);
router.get("/activos", EstadoTrampaController.getActivos);
router.post("/", EstadoTrampaController.create);
router.put("/:id", EstadoTrampaController.update);
router.patch("/:id/activate", EstadoTrampaController.activate);
router.patch("/:id/deactivate", EstadoTrampaController.deactivate);

export default router;
