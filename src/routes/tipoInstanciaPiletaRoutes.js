import express from "express";
import TipoInstanciaPiletaController from "../controllers/tipoInstanciaPiletaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", TipoInstanciaPiletaController.getAll);
router.get("/activos", TipoInstanciaPiletaController.getActivos);
router.post("/", TipoInstanciaPiletaController.create);
router.put("/:id", TipoInstanciaPiletaController.update);
router.patch("/:id/activate", TipoInstanciaPiletaController.activate);
router.patch("/:id/deactivate", TipoInstanciaPiletaController.deactivate);

export default router;
