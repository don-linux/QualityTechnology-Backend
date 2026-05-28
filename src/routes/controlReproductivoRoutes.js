import express from "express";
import controlReproductivoController from "../controllers/controlReproductivoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/reproductores/:granja",
  controlReproductivoController.getReproductoresOcupadas,
);
router.get(
  "/familia-por-pileta/:piletaId",
  controlReproductivoController.getFamiliaPorPileta,
);

router.get("/", controlReproductivoController.getAll);
router.get("/:id", controlReproductivoController.getById);
router.post("/", controlReproductivoController.create);
router.put("/:id", controlReproductivoController.update);
router.delete("/:id", controlReproductivoController.delete);

export default router;
