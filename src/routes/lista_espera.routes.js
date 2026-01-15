import express from "express";
import { listaEsperaController } from "../controllers/lista_espera.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, listaEsperaController.getAll);
router.post("/", authenticateToken, listaEsperaController.create);
router.put("/:id", authenticateToken, listaEsperaController.update);
router.delete("/:id", authenticateToken, listaEsperaController.delete);
router.post(
  "/convertir/:id",
  authenticateToken,
  listaEsperaController.convertirAVenta
);

export default router;
