import express from "express";
import bitacoraVisitaController from "../../controllers/bitacoraVisitaController.js";
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
    RUTAS DE BITÁCORA DE VISITAS
========================================================= */
router.get("/", bitacoraVisitaController.getAll);
router.post("/", upload.single('fc_foto_identificacion'), bitacoraVisitaController.create);
router.put("/:id", upload.single('fc_foto_identificacion'), bitacoraVisitaController.update);
router.delete("/:id", bitacoraVisitaController.delete);
router.delete("/", bitacoraVisitaController.deleteAll);

export default router;
