import express from "express";
import controlFaunaNocivaController from "../../controllers/controlFaunaNocivaController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

/* =========================================================
    RUTAS DE CONTROL DE FAUNA NOCIVA
========================================================= */
router.get("/empleados", controlFaunaNocivaController.getEmpleados);
router.get("/", controlFaunaNocivaController.getAll);
router.post("/", controlFaunaNocivaController.create);
router.put("/:id", controlFaunaNocivaController.update);

export default router;
