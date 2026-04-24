import DocumentoEmpleadoModel from "../models/documentoEmpleadoModel.js";
import path from "node:path";
import fs from "node:fs";

function getFilePath(doc) {
    return path.resolve("." + doc.fc_ruta_archivo);
}

function sendInlineFile(res, doc) {
    const filePath = getFilePath(doc);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado en disco" });
    }
    const safeName = encodeURIComponent(doc.fc_nombre_original);
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${safeName}`);
    return res.sendFile(filePath);
}

function deletePhysicalFile(doc) {
    const filePath = getFilePath(doc);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

class DocumentoEmpleadoController {

    // Admin: obtener documentos de un empleado
    static async getByEmpleado(req, res) {
        const { empleadoId } = req.params;
        try {
            const documentos = await DocumentoEmpleadoModel.getByEmpleado(empleadoId);
            res.json(documentos);
        } catch (err) {
            console.error("Error al obtener documentos:", err);
            res.status(500).json({ error: "Error al obtener documentos" });
        }
    }

    // Admin: subir documento para un empleado
    static async upload(req, res) {
        const { empleadoId } = req.params;
        const { fi_tipo_documento_id } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No se proporcionó archivo" });
        }
        if (!fi_tipo_documento_id) {
            return res.status(400).json({ error: "fi_tipo_documento_id es obligatorio" });
        }

        try {
            const fc_ruta_archivo = `/uploads/expedientes/${empleadoId}/${req.file.filename}`;
            const documento = await DocumentoEmpleadoModel.upsert({
                fi_empleado_id: empleadoId,
                fi_tipo_documento_id,
                fc_ruta_archivo,
                fc_nombre_original: req.file.originalname
            });
            res.status(201).json({ mensaje: "Documento subido correctamente", documento });
        } catch (err) {
            console.error("Error al subir documento:", err);
            res.status(500).json({ error: "Error al subir documento" });
        }
    }

    // Admin: descargar documento
    static async download(req, res) {
        const { documentoId } = req.params;
        try {
            const doc = await DocumentoEmpleadoModel.getById(documentoId);
            if (!doc) {
                return res.status(404).json({ error: "Documento no encontrado" });
            }
            const filePath = getFilePath(doc);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "Archivo no encontrado en disco" });
            }
            res.download(filePath, doc.fc_nombre_original);
        } catch (err) {
            console.error("Error al descargar documento:", err);
            res.status(500).json({ error: "Error al descargar documento" });
        }
    }

    // Admin: visualizar documento en navegador
    static async view(req, res) {
        const { documentoId } = req.params;
        try {
            const doc = await DocumentoEmpleadoModel.getById(documentoId);
            if (!doc) {
                return res.status(404).json({ error: "Documento no encontrado" });
            }
            return sendInlineFile(res, doc);
        } catch (err) {
            console.error("Error al visualizar documento:", err);
            res.status(500).json({ error: "Error al visualizar documento" });
        }
    }

    // Admin: eliminar documento
    static async delete(req, res) {
        const { documentoId } = req.params;
        try {
            const doc = await DocumentoEmpleadoModel.delete(documentoId);
            if (!doc) {
                return res.status(404).json({ error: "Documento no encontrado" });
            }
            deletePhysicalFile(doc);
            res.json({ mensaje: "Documento eliminado correctamente" });
        } catch (err) {
            console.error("Error al eliminar documento:", err);
            res.status(500).json({ error: "Error al eliminar documento" });
        }
    }

    // Self-service: mis documentos
    static async getMisDocumentos(req, res) {
        try {
            const empleadoId = await DocumentoEmpleadoModel.getEmpleadoIdByUsuario(req.user.usuario_id);
            if (!empleadoId) {
                return res.status(404).json({ error: "No se encontró perfil de empleado vinculado" });
            }
            const documentos = await DocumentoEmpleadoModel.getByEmpleado(empleadoId);
            res.json(documentos);
        } catch (err) {
            console.error("Error al obtener mis documentos:", err);
            res.status(500).json({ error: "Error al obtener documentos" });
        }
    }

    // Self-service: subir mi documento
    static async uploadMiDocumento(req, res) {
        const { fi_tipo_documento_id } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No se proporcionó archivo" });
        }
        if (!fi_tipo_documento_id) {
            return res.status(400).json({ error: "fi_tipo_documento_id es obligatorio" });
        }

        try {
            const empleadoId = await DocumentoEmpleadoModel.getEmpleadoIdByUsuario(req.user.usuario_id);
            if (!empleadoId) {
                return res.status(404).json({ error: "No se encontró perfil de empleado vinculado" });
            }

            const fc_ruta_archivo = `/uploads/expedientes/${empleadoId}/${req.file.filename}`;
            const documento = await DocumentoEmpleadoModel.upsert({
                fi_empleado_id: empleadoId,
                fi_tipo_documento_id,
                fc_ruta_archivo,
                fc_nombre_original: req.file.originalname
            });
            res.status(201).json({ mensaje: "Documento subido correctamente", documento });
        } catch (err) {
            console.error("Error al subir mi documento:", err);
            res.status(500).json({ error: "Error al subir documento" });
        }
    }

    // Self-service: visualizar mi documento
    static async viewMiDocumento(req, res) {
        const { documentoId } = req.params;
        try {
            const doc = await DocumentoEmpleadoModel.getByIdForUsuario(documentoId, req.user.usuario_id);
            if (!doc) {
                return res.status(404).json({ error: "Documento no encontrado" });
            }
            return sendInlineFile(res, doc);
        } catch (err) {
            console.error("Error al visualizar mi documento:", err);
            res.status(500).json({ error: "Error al visualizar documento" });
        }
    }

    // Self-service: descargar mi documento
    static async downloadMiDocumento(req, res) {
        const { documentoId } = req.params;
        try {
            const doc = await DocumentoEmpleadoModel.getByIdForUsuario(documentoId, req.user.usuario_id);
            if (!doc) {
                return res.status(404).json({ error: "Documento no encontrado" });
            }
            const filePath = getFilePath(doc);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "Archivo no encontrado en disco" });
            }
            res.download(filePath, doc.fc_nombre_original);
        } catch (err) {
            console.error("Error al descargar mi documento:", err);
            res.status(500).json({ error: "Error al descargar documento" });
        }
    }

    // Self-service: eliminar mi documento
    static async deleteMiDocumento(req, res) {
        const { documentoId } = req.params;
        try {
            const doc = await DocumentoEmpleadoModel.getByIdForUsuario(documentoId, req.user.usuario_id);
            if (!doc) {
                return res.status(404).json({ error: "Documento no encontrado" });
            }
            const deleted = await DocumentoEmpleadoModel.delete(documentoId);
            deletePhysicalFile(deleted);
            res.json({ mensaje: "Documento eliminado correctamente" });
        } catch (err) {
            console.error("Error al eliminar mi documento:", err);
            res.status(500).json({ error: "Error al eliminar documento" });
        }
    }
}

export default DocumentoEmpleadoController;
