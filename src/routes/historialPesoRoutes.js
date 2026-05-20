import express from "express";
import historialPesoController from "../controllers/historialPesoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", historialPesoController.getAll);
router.post("/", historialPesoController.create);

export default router;
