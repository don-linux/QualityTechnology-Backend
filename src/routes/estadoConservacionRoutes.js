import express from "express";
import EstadoConservacionController from "../controllers/estadoConservacionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", EstadoConservacionController.getAll);
router.get("/activos", EstadoConservacionController.getActivos);
router.post("/", EstadoConservacionController.create);
router.put("/:id", EstadoConservacionController.update);
router.patch("/:id/activate", EstadoConservacionController.activate);
router.patch("/:id/deactivate", EstadoConservacionController.deactivate);

export default router;
