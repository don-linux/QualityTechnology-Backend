import express from "express";
import loteController from "../controllers/loteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* --------------------------------------------------------
   📌 RUTAS DE INSTALACIONES (En contexto de Lotes)
-------------------------------------------------------- */
router.get("/instalaciones/:granja", loteController.getInstalaciones);
router.get("/familia/:instalacion", loteController.getFamilia);

/* --------------------------------------------------------
   📌 RUTAS DE LOTES
-------------------------------------------------------- */
router.get("/granja/:granja", loteController.getByGranja);
router.get("/instalacion/:id", loteController.getByInstalacion);

router.post("/", loteController.create);
router.put("/:id", loteController.update);
router.delete("/:id", loteController.delete);

export default router;
