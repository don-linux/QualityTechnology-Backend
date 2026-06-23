import express from "express";
import eficienciaReproductivaController from "../controllers/eficienciaReproductivaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", eficienciaReproductivaController.getAll);
router.get("/:id", eficienciaReproductivaController.getById);
router.post("/", eficienciaReproductivaController.create);
router.put("/:id", eficienciaReproductivaController.update);

export default router;
