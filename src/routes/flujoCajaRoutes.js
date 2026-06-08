import express from "express";
import multer from "multer";
import fs from "fs";
import flujoCajaController from "../controllers/flujoCajaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// APLICAR PROTECCION GLOBAL A ESTE MODULO
router.use(authMiddleware);

/* =========================================================
   Configuracion de subida de archivos (facturas)
========================================================= */
const uploadDir = "./uploads/facturas";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/* =========================================================
   RUTAS DE FLUJO DE CAJA
========================================================= */
router.get("/", flujoCajaController.getAll);
router.get("/clientes", flujoCajaController.getClientes);
router.get("/proveedores", flujoCajaController.getProveedores);
router.get("/tesoreria/:granja", flujoCajaController.getTesoreriaByGranja);
router.get("/:granja", flujoCajaController.getByGranja);
router.post("/", upload.single("facturaFile"), flujoCajaController.create);
router.put("/:id", flujoCajaController.update);
router.delete("/:id", flujoCajaController.delete);

/* =========================================================
   Servir archivos estaticos de facturas
========================================================= */
router.use("/uploads/facturas", express.static("uploads/facturas"));

export default router;
