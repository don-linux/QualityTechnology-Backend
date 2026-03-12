import express from "express";
import alevinController from "../controllers/alevinController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   RUTAS DE ALEVINES
========================================================= */
router.get("/", alevinController.getAll);
router.post("/", alevinController.create);
router.put("/:id", alevinController.update);
router.delete("/:id", alevinController.delete);

export default router;
