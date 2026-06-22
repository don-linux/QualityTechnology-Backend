import express from "express";
import EvidenciaFaunaController from "../controllers/evidenciaFaunaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", EvidenciaFaunaController.getAll);
router.get("/activos", EvidenciaFaunaController.getActivos);
router.post("/", EvidenciaFaunaController.create);
router.put("/:id", EvidenciaFaunaController.update);
router.patch("/:id/activate", EvidenciaFaunaController.activate);
router.patch("/:id/deactivate", EvidenciaFaunaController.deactivate);

export default router;
