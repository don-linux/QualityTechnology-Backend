import express from "express";
import TipoPiletaController from "../controllers/tipoPiletaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", TipoPiletaController.getAll);
router.get("/activos", TipoPiletaController.getActivos);
router.post("/", TipoPiletaController.create);
router.put("/:id", TipoPiletaController.update);
router.patch("/:id/activate", TipoPiletaController.activate);
router.patch("/:id/deactivate", TipoPiletaController.deactivate);

export default router;
