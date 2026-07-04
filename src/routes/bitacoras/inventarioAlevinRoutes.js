import express from "express";
import inventarioAlevinController from "../../controllers/inventarioAlevinController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", inventarioAlevinController.getAll);
router.post("/", inventarioAlevinController.create);
router.put("/:id", inventarioAlevinController.update);

export default router;
