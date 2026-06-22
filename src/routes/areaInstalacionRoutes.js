import express from "express";
import AreaInstalacionController from "../controllers/areaInstalacionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", AreaInstalacionController.getAll);
router.get("/activos", AreaInstalacionController.getActivos);
router.post("/", AreaInstalacionController.create);
router.put("/:id", AreaInstalacionController.update);
router.patch("/:id/activate", AreaInstalacionController.activate);
router.patch("/:id/deactivate", AreaInstalacionController.deactivate);

export default router;
