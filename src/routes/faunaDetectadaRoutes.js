import express from "express";
import FaunaDetectadaController from "../controllers/faunaDetectadaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", FaunaDetectadaController.getAll);
router.get("/activos", FaunaDetectadaController.getActivos);
router.post("/", FaunaDetectadaController.create);
router.put("/:id", FaunaDetectadaController.update);
router.patch("/:id/activate", FaunaDetectadaController.activate);
router.patch("/:id/deactivate", FaunaDetectadaController.deactivate);

export default router;
