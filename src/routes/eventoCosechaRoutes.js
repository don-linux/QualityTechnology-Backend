import express from "express";
import EventoCosechaController from "../controllers/eventoCosechaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", EventoCosechaController.getAll);
router.get("/:id", EventoCosechaController.getById);
router.post("/", EventoCosechaController.create);
router.put("/:id", EventoCosechaController.update);
router.delete("/:id", EventoCosechaController.delete);

export default router;
