import express from "express";
import biometriaController from "../../controllers/biometriaController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", biometriaController.getAll);
router.get("/empleados", biometriaController.getEmpleados);
router.get("/info/:granja/:instalacion", biometriaController.getInfo);
router.get("/:granja", biometriaController.getByGranja);
router.post("/", biometriaController.create);
router.put("/:id", biometriaController.update);

export default router;
