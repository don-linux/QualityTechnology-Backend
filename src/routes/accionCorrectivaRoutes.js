import express from "express";
import AccionCorrectivaController from "../controllers/accionCorrectivaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", AccionCorrectivaController.getAll);
router.get("/activos", AccionCorrectivaController.getActivos);
router.post("/", AccionCorrectivaController.create);
router.put("/:id", AccionCorrectivaController.update);
router.patch("/:id/activate", AccionCorrectivaController.activate);
router.patch("/:id/deactivate", AccionCorrectivaController.deactivate);

export default router;
