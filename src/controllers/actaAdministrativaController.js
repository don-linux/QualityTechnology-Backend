import path from "node:path";
import fs from "node:fs";
import prisma from "../prisma.js";
import { serializeActaAdministrativa } from "../utils/serializers.js";

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getFilePath(acta) {
  return path.resolve("." + acta.rutaArchivo);
}

function sendInlineFile(res, acta) {
  const filePath = getFilePath(acta);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado en disco" });
  }
  const safeName = encodeURIComponent(acta.nombreOriginal);
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
        orderBy: [{ fecha: "desc" }, { actaId: "desc" }],
      });
      res.json(actas.map(serializeActaAdministrativa));
    } catch (err) {
      console.error("Error al obtener actas administrativas:", err);
      res.status(500).json({ error: "Error al obtener actas administrativas" });
    }
  }

  static async upload(req, res) {
    const { empleadoId } = req.params;
    const motivo = req.body.motivo ?? req.body.fc_motivo;
    const fecha = req.body.fecha ?? req.body.fd_fecha;

    if (!motivo || !String(motivo).trim()) {
      return res.status(400).json({ error: "El motivo es obligatorio" });
    }
    if (!fecha || !isValidDate(fecha)) {
      return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se proporciono archivo" });
    }

    try {
      const rutaArchivo = `/uploads/actas-administrativas/${empleadoId}/${req.file.filename}`;
      const acta = await prisma.actaAdministrativa.create({
        data: {
          empleadoId: Number(empleadoId),
          motivo: String(motivo).trim(),
          fecha: new Date(`${fecha}T00:00:00Z`),
          rutaArchivo,
          nombreOriginal: req.file.originalname,
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
        where: { actaId: Number(actaId) },
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
        where: { actaId: Number(actaId) },
      });
      if (!acta) return res.status(404).json({ error: "Acta administrativa no encontrada" });

      const filePath = getFilePath(acta);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado en disco" });
      }
      res.download(filePath, acta.nombreOriginal);
    } catch (err) {
      console.error("Error al descargar acta administrativa:", err);
      res.status(500).json({ error: "Error al descargar acta administrativa" });
    }
  }

  static async delete(req, res) {
    const { actaId } = req.params;
    try {
      const acta = await prisma.actaAdministrativa.delete({
        where: { actaId: Number(actaId) },
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
