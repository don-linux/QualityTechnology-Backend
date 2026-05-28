import express from "express";
import incubacionController from "../controllers/incubacionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", incubacionController.getAll);
router.get("/:id", incubacionController.getById);
router.post("/", incubacionController.create);
router.put("/:id", incubacionController.update);
router.delete("/:id", incubacionController.delete);

export default router;
