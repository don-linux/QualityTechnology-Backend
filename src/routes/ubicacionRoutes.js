import express from "express";
import UbicacionController from "../controllers/ubicacionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/",           UbicacionController.getAll);
router.get("/activos",    UbicacionController.getActivos);
router.get("/:id",        UbicacionController.getById);
router.post("/",          UbicacionController.create);
router.put("/:id",        UbicacionController.update);
router.patch("/:id/activate",   UbicacionController.activate);
router.patch("/:id/deactivate", UbicacionController.deactivate);

export default router;
