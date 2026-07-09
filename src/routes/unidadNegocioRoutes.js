import express from "express";
import UnidadNegocioController from "../controllers/unidadNegocioController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", UnidadNegocioController.getAll);
router.get("/activos", UnidadNegocioController.getActivos);
router.post("/", UnidadNegocioController.create);
router.put("/:id", UnidadNegocioController.update);
router.patch("/:id/activate", UnidadNegocioController.activate);
router.patch("/:id/deactivate", UnidadNegocioController.deactivate);

export default router;
