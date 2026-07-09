import express from "express";
import ventaController from "../controllers/ventaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", ventaController.getAll);
router.get("/:id/pagos", ventaController.getPagos);
router.post("/:id/pagos", ventaController.registrarPago);
router.delete("/:id/pagos/:movId", ventaController.anularPago);

export default router;
