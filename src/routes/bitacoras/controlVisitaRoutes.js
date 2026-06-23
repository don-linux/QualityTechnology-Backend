import express from "express";
import controlVisitaController from "../../controllers/controlVisitaController.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

// Configuración de Multer (almacenamiento de imágenes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // La carpeta donde guardamos las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Asignamos un nombre único a la imagen
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// APLICAR PROTECCIÓN GLOBAL A ESTE MÓDULO (excepto tal vez GET si es público, pero aquí parece interno)
router.use(authMiddleware);

/* =========================================================
    RUTAS DE CONTROL DE VISITAS
========================================================= */
router.get("/", controlVisitaController.getAll);
router.post("/", upload.single('fc_foto_identificacion'), controlVisitaController.create);
router.put("/:id", upload.single('fc_foto_identificacion'), controlVisitaController.update);

export default router;
