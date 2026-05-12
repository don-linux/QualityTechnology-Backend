import path from "node:path";
import fs from "node:fs";
import prisma from "../prisma.js";
import { serializeActaAdministrativa } from "../utils/serializers.js";

// El schema actual de ActaAdministrativa solo conserva descripcion, ruta y
// nombre del archivo. El campo "fecha" se sustituye por created_at y "motivo"
// se mapea a "descripcion". Aceptamos ambos alias en el body para no romper
// el frontend existente.

function getFilePath(acta) {
  return path.resolve("." + acta.rutaArchivo);
}

function sendInlineFile(res, acta) {
  const filePath = getFilePath(acta);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado en disco" });
  }
  const safeName = encodeURIComponent(acta.nombre_archivo);
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
      const actas = await prisma.actaAdministrativa.findMany({
        where: { empleadoId: Number(empleadoId) },
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
      });
      res.json(actas.map(serializeActaAdministrativa));
    } catch (err) {
      console.error("Error al obtener actas administrativas:", err);
      res.status(500).json({ error: "Error al obtener actas administrativas" });
    }
  }

  static async upload(req, res) {
    const { empleadoId } = req.params;
    const descripcion = req.body.descripcion ?? req.body.motivo ?? req.body.fc_motivo;

    if (!descripcion || !String(descripcion).trim()) {
      return res.status(400).json({ error: "La descripcion (motivo) es obligatoria" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se proporciono archivo" });
    }

    try {
      const rutaArchivo = `/uploads/actas-administrativas/${empleadoId}/${req.file.filename}`;
      const acta = await prisma.actaAdministrativa.create({
        data: {
          empleadoId: Number(empleadoId),
          descripcion: String(descripcion).trim(),
          rutaArchivo,
          nombre_archivo: req.file.originalname,
        },
      });
      res.status(201).json({
        mensaje: "Acta administrativa guardada correctamente",
        acta: serializeActaAdministrativa(acta),
      });
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Empleado invalido" });
      }
      console.error("Error al guardar acta administrativa:", err);
      res.status(500).json({ error: "Error al guardar acta administrativa" });
    }
  }

  static async view(req, res) {
    const { actaId } = req.params;
    try {
      const acta = await prisma.actaAdministrativa.findUnique({
        where: { id: Number(actaId) },
      });
      if (!acta) return res.status(404).json({ error: "Acta administrativa no encontrada" });
      return sendInlineFile(res, acta);
    } catch (err) {
      console.error("Error al visualizar acta administrativa:", err);
      res.status(500).json({ error: "Error al visualizar acta administrativa" });
    }
  }

  static async download(req, res) {
    const { actaId } = req.params;
    try {
      const acta = await prisma.actaAdministrativa.findUnique({
        where: { id: Number(actaId) },
      });
      if (!acta) return res.status(404).json({ error: "Acta administrativa no encontrada" });

      const filePath = getFilePath(acta);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado en disco" });
      }
      res.download(filePath, acta.nombre_archivo);
    } catch (err) {
      console.error("Error al descargar acta administrativa:", err);
      res.status(500).json({ error: "Error al descargar acta administrativa" });
    }
  }

  static async delete(req, res) {
    const { actaId } = req.params;
    try {
      const acta = await prisma.actaAdministrativa.delete({
        where: { id: Number(actaId) },
      });
      deletePhysicalFile(acta);
      res.json({ mensaje: "Acta administrativa eliminada correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Acta administrativa no encontrada" });
      }
      console.error("Error al eliminar acta administrativa:", err);
      res.status(500).json({ error: "Error al eliminar acta administrativa" });
    }
  }
}

export default ActaAdministrativaController;
