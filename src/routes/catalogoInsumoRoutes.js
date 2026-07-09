import express from "express";
import CatalogoInsumoController from "../controllers/catalogoInsumoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", CatalogoInsumoController.getAll);
router.get("/activos", CatalogoInsumoController.getActivos);
router.post("/", CatalogoInsumoController.create);
router.put("/:id", CatalogoInsumoController.update);
router.patch("/:id/activate", CatalogoInsumoController.activate);
router.patch("/:id/deactivate", CatalogoInsumoController.deactivate);

export default router;
