import { Router } from "express";
import multer from "multer";
import path from "path";
import { visitasController } from "../../controllers/bitacoras/visitas.controller.js";

// Configuración de Multer (almacenamiento de imágenes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // La carpeta donde guardamos las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Asignamos un nombre único a la imagen
    },
});

const upload = multer({ storage: storage });

const router = Router();

router.get("/", visitasController.getAll);
router.get("/:id", visitasController.getById);

// Middleware de upload para POST y PUT
router.post(
    "/",
    upload.single("fc_foto_identificacion"),
    visitasController.create
);
router.put(
    "/:id",
    upload.single("fc_foto_identificacion"),
    visitasController.update
);

router.delete("/:id", visitasController.delete);
router.delete("/", visitasController.deleteAll);

export default router;
