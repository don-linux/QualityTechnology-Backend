import express from "express";
import bitacoraBanoController from "../../controllers/bitacoraBanoController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO
router.use(authMiddleware);

/* =========================================================
   📌 RUTAS DE BITÁCORA DE BAÑOS
========================================================= */
router.get("/", bitacoraBanoController.getAll);
router.post("/", bitacoraBanoController.create);
router.put("/:id", bitacoraBanoController.update);
router.delete("/:id", bitacoraBanoController.delete);
router.delete("/", bitacoraBanoController.deleteAll);

export default router;
