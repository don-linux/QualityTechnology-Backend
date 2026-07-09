import express from "express";
import parametrosFisicoQuimicosController from "../../controllers/parametrosFisicoQuimicosController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/empleados", parametrosFisicoQuimicosController.getEmpleados);
router.get("/", parametrosFisicoQuimicosController.getAll);
router.post("/", parametrosFisicoQuimicosController.create);
router.put("/:id", parametrosFisicoQuimicosController.update);

export default router;
