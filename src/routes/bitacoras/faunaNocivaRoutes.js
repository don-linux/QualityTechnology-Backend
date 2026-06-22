import express from "express";
import faunaNocivaController from "../../controllers/faunaNocivaController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

/* =========================================================
    RUTAS DE BITÁCORA DE FAUNA NOCIVA
========================================================= */
router.get("/empleados", faunaNocivaController.getEmpleados);
router.get("/", faunaNocivaController.getAll);
router.post("/", faunaNocivaController.create);
router.put("/:id", faunaNocivaController.update);
router.delete("/:id", faunaNocivaController.delete);
router.delete("/", faunaNocivaController.deleteAll);

export default router;
