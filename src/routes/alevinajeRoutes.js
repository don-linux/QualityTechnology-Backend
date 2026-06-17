import express from "express";
import alevinajeController from "../controllers/alevinajeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/piletas/:piletaId/alimentacion-interna", alevinajeController.getAlimentacionInterna);
router.get("/", alevinajeController.getAll);
router.get("/:id", alevinajeController.getById);
router.post("/", alevinajeController.create);
router.put("/:id", alevinajeController.update);
router.delete("/:id", alevinajeController.delete);

export default router;
