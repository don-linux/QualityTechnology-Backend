import express from "express";
import siembraController from "../controllers/siembraController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", siembraController.getAll);
router.get("/:id", siembraController.getById);

export default router;
