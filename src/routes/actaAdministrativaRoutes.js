import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import ActaAdministrativaController from "../controllers/actaAdministrativaController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const { empleadoId } = req.params;
        const dir = path.resolve(`./uploads/actas-administrativas/${empleadoId}`);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    }
});

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

function uploadErrorHandler(err, _req, res, next) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "El archivo no debe superar 25 MB" });
    }
    if (err) {
        return res.status(400).json({ error: "Error al procesar el archivo" });
    }
    next();
}

const router = express.Router();

router.use(authMiddleware);
router.use(rbacMiddleware("/empleados"));

router.get("/:empleadoId", ActaAdministrativaController.getByEmpleado);
router.post("/:empleadoId/upload", upload.single("archivo"), uploadErrorHandler, ActaAdministrativaController.upload);
router.get("/view/:actaId", ActaAdministrativaController.view);
router.get("/download/:actaId", ActaAdministrativaController.download);
router.delete("/:actaId", ActaAdministrativaController.delete);

export default router;
