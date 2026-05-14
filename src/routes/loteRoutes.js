import express from "express";
import loteController from "../controllers/loteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   PROTECCIÓN GLOBAL
===================================================== */

router.use(authMiddleware);

/* =====================================================
   ORIGEN CONTROL REPRODUCTIVO — piletas físicas etapa reproductores (ruta legacy)
===================================================== */

router.get(
    "/instalaciones/:granja",
    loteController.getInstalacionesReproductores
);

router.get(
    "/familia-por-instalacion/:instalacionId",
    loteController.getFamiliaPorInstalacion
);

/* =====================================================
   LOTES
===================================================== */

router.get(
    "/granja/:granja",
    loteController.getByGranja
);

router.get(
    "/instalacion/:id",
    loteController.getByInstalacion
);

router.post(
    "/",
    loteController.create
);

router.put(
    "/:id",
    loteController.update
);

router.delete(
    "/:id",
    loteController.delete
);

export default router;