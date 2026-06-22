import prisma from "../prisma.js";
import { serializeEvidenciaFauna } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}

class EvidenciaFaunaController {
  static async getAll(req, res) {
    try {
      const items = await prisma.evidenciaFauna.findMany({
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeEvidenciaFauna));
    } catch (err) {
      console.error("Error al obtener evidencias de fauna:", err);
      res.status(500).json({ error: "Error al obtener evidencias de fauna" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.evidenciaFauna.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeEvidenciaFauna));
    } catch (err) {
      console.error("Error al obtener evidencias de fauna activas:", err);
      res.status(500).json({ error: "Error al obtener evidencias de fauna activas" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.evidenciaFauna.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Evidencia de fauna creada correctamente",
        evidencia_fauna: serializeEvidenciaFauna(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una evidencia de fauna con ese nombre" });
      }
      console.error("Error al crear evidencia de fauna:", err);
      res.status(500).json({ error: "Error al crear evidencia de fauna" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.evidenciaFauna.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Evidencia de fauna actualizada correctamente",
        evidencia_fauna: serializeEvidenciaFauna(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Evidencia de fauna no encontrada" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una evidencia de fauna con ese nombre" });
      }
      console.error("Error al actualizar evidencia de fauna:", err);
      res.status(500).json({ error: "Error al actualizar evidencia de fauna" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.evidenciaFauna.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Evidencia de fauna activada correctamente",
        evidencia_fauna: serializeEvidenciaFauna(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Evidencia de fauna no encontrada" });
      }
      console.error("Error al activar evidencia de fauna:", err);
      res.status(500).json({ error: "Error al activar evidencia de fauna" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.evidenciaFauna.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Evidencia de fauna desactivada correctamente",
        evidencia_fauna: serializeEvidenciaFauna(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Evidencia de fauna no encontrada" });
      }
      console.error("Error al desactivar evidencia de fauna:", err);
      res.status(500).json({ error: "Error al desactivar evidencia de fauna" });
    }
  }
}

export default EvidenciaFaunaController;
