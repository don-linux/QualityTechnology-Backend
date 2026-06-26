import express from "express";
import TipoInfraestructuraFisicaController from "../controllers/tipoInfraestructuraFisicaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", TipoInfraestructuraFisicaController.getAll);
router.get("/activos", TipoInfraestructuraFisicaController.getActivos);
router.post("/", TipoInfraestructuraFisicaController.create);
router.put("/:id", TipoInfraestructuraFisicaController.update);
router.patch("/:id/activate", TipoInfraestructuraFisicaController.activate);
router.patch("/:id/deactivate", TipoInfraestructuraFisicaController.deactivate);

export default router;
