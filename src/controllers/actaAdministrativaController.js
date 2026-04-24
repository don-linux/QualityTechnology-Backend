import ActaAdministrativaModel from "../models/actaAdministrativaModel.js";
import path from "node:path";
import fs from "node:fs";

function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getFilePath(acta) {
    return path.resolve("." + acta.fc_ruta_archivo);
}

function sendInlineFile(res, acta) {
    const filePath = getFilePath(acta);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado en disco" });
    }
    const safeName = encodeURIComponent(acta.fc_nombre_original);
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${safeName}`);
    return res.sendFile(filePath);
}

function deletePhysicalFile(acta) {
    const filePath = getFilePath(acta);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

class ActaAdministrativaController {
    static async getByEmpleado(req, res) {
        const { empleadoId } = req.params;
        try {
            const actas = await ActaAdministrativaModel.getByEmpleado(empleadoId);
            res.json(actas);
        } catch (err) {
            console.error("Error al obtener actas administrativas:", err);
            res.status(500).json({ error: "Error al obtener actas administrativas" });
        }
    }

    static async upload(req, res) {
        const { empleadoId } = req.params;
        const { fc_motivo, fd_fecha } = req.body;

        if (!fc_motivo || !fc_motivo.trim()) {
            return res.status(400).json({ error: "El motivo es obligatorio" });
        }
        if (!fd_fecha || !isValidDate(fd_fecha)) {
            return res.status(400).json({ error: "fd_fecha debe tener formato YYYY-MM-DD" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No se proporcionó archivo" });
        }

        try {
            const fc_ruta_archivo = `/uploads/actas-administrativas/${empleadoId}/${req.file.filename}`;
            const acta = await ActaAdministrativaModel.create({
                fi_empleado_id: empleadoId,
                fc_motivo: fc_motivo.trim(),
                fd_fecha,
                fc_ruta_archivo,
                fc_nombre_original: req.file.originalname
            });
            res.status(201).json({ mensaje: "Acta administrativa guardada correctamente", acta });
        } catch (err) {
            console.error("Error al guardar acta administrativa:", err);
            res.status(500).json({ error: "Error al guardar acta administrativa" });
        }
    }

    static async view(req, res) {
        const { actaId } = req.params;
        try {
            const acta = await ActaAdministrativaModel.getById(actaId);
            if (!acta) {
                return res.status(404).json({ error: "Acta administrativa no encontrada" });
            }
            return sendInlineFile(res, acta);
        } catch (err) {
            console.error("Error al visualizar acta administrativa:", err);
            res.status(500).json({ error: "Error al visualizar acta administrativa" });
        }
    }

    static async download(req, res) {
        const { actaId } = req.params;
        try {
            const acta = await ActaAdministrativaModel.getById(actaId);
            if (!acta) {
                return res.status(404).json({ error: "Acta administrativa no encontrada" });
            }
            const filePath = getFilePath(acta);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "Archivo no encontrado en disco" });
            }
            res.download(filePath, acta.fc_nombre_original);
        } catch (err) {
            console.error("Error al descargar acta administrativa:", err);
            res.status(500).json({ error: "Error al descargar acta administrativa" });
        }
    }

    static async delete(req, res) {
        const { actaId } = req.params;
        try {
            const acta = await ActaAdministrativaModel.delete(actaId);
            if (!acta) {
                return res.status(404).json({ error: "Acta administrativa no encontrada" });
            }
            deletePhysicalFile(acta);
            res.json({ mensaje: "Acta administrativa eliminada correctamente" });
        } catch (err) {
            console.error("Error al eliminar acta administrativa:", err);
            res.status(500).json({ error: "Error al eliminar acta administrativa" });
        }
    }
}

export default ActaAdministrativaController;
