import express from "express";
import equipoController from "../controllers/equipoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:usuario_id", equipoController.getByUsuario);
router.post("/", equipoController.create);
router.put("/:id", equipoController.update);

export default router;
