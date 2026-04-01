import express from "express";
import TipoDocumentoController from "../controllers/tipoDocumentoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", TipoDocumentoController.getAll);
router.get("/activos", TipoDocumentoController.getActivos);
router.post("/", TipoDocumentoController.create);
router.put("/:id", TipoDocumentoController.update);

export default router;
