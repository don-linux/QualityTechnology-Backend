import express from "express";
import medicamentoController from "../../controllers/medicamentoController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", medicamentoController.getAll);
router.post("/", medicamentoController.create);
router.put("/:id", medicamentoController.update);

export default router;
