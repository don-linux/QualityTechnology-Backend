import express from "express";
import cicloEngordaController from "../controllers/cicloEngordaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", cicloEngordaController.getAll);
router.get("/:id/dashboard", cicloEngordaController.getDashboard);
router.get("/:id", cicloEngordaController.getById);

export default router;
