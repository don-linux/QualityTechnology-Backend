import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import DocumentoEmpleadoController, { getEmpleadoIdByUsuario } from "../controllers/documentoEmpleadoController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: async (req, _file, cb) => {
        try {
            let empleadoId = req.params.empleadoId;
            if (!empleadoId) {
                empleadoId = await getEmpleadoIdByUsuario(req.user.usuario_id);
            }
            if (!empleadoId) {
                return cb(new Error("Empleado no encontrado"));
            }
            const dir = path.resolve(`./uploads/expedientes/${empleadoId}`);
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        } catch (err) {
            cb(err);
        }
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

// Self-service
router.get("/mis-documentos", DocumentoEmpleadoController.getMisDocumentos);
router.post("/mis-documentos/upload", upload.single("archivo"), uploadErrorHandler, DocumentoEmpleadoController.uploadMiDocumento);
router.get("/mis-documentos/view/:documentoId", DocumentoEmpleadoController.viewMiDocumento);
router.get("/mis-documentos/download/:documentoId", DocumentoEmpleadoController.downloadMiDocumento);
router.delete("/mis-documentos/:documentoId", DocumentoEmpleadoController.deleteMiDocumento);

// Admin
router.get("/:empleadoId", rbacMiddleware("/empleados"), DocumentoEmpleadoController.getByEmpleado);
router.post("/:empleadoId/upload", rbacMiddleware("/empleados"), upload.single("archivo"), uploadErrorHandler, DocumentoEmpleadoController.upload);
router.get("/view/:documentoId", rbacMiddleware("/empleados"), DocumentoEmpleadoController.view);
router.get("/download/:documentoId", rbacMiddleware("/empleados"), DocumentoEmpleadoController.download);
router.delete("/:documentoId", rbacMiddleware("/empleados"), DocumentoEmpleadoController.delete);

export default router;
