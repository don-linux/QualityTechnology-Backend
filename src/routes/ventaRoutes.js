import express from "express";
import ventaController from "../controllers/ventaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", ventaController.getAll);

export default router;
