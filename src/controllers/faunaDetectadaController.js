import prisma from "../prisma.js";
import { serializeFaunaDetectada } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre;
}

class FaunaDetectadaController {
  static async getAll(req, res) {
    try {
      const items = await prisma.faunaDetectada.findMany({
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeFaunaDetectada));
    } catch (err) {
      console.error("Error al obtener faunas detectadas:", err);
      res.status(500).json({ error: "Error al obtener faunas detectadas" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.faunaDetectada.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeFaunaDetectada));
    } catch (err) {
      console.error("Error al obtener faunas detectadas activas:", err);
      res.status(500).json({ error: "Error al obtener faunas detectadas activas" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.faunaDetectada.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Fauna detectada creada correctamente",
        fauna_detectada: serializeFaunaDetectada(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una fauna detectada con ese nombre" });
      }
      console.error("Error al crear fauna detectada:", err);
      res.status(500).json({ error: "Error al crear fauna detectada" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.faunaDetectada.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Fauna detectada actualizada correctamente",
        fauna_detectada: serializeFaunaDetectada(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Fauna detectada no encontrada" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una fauna detectada con ese nombre" });
      }
      console.error("Error al actualizar fauna detectada:", err);
      res.status(500).json({ error: "Error al actualizar fauna detectada" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.faunaDetectada.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Fauna detectada activada correctamente",
        fauna_detectada: serializeFaunaDetectada(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Fauna detectada no encontrada" });
      }
      console.error("Error al activar fauna detectada:", err);
      res.status(500).json({ error: "Error al activar fauna detectada" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.faunaDetectada.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Fauna detectada desactivada correctamente",
        fauna_detectada: serializeFaunaDetectada(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Fauna detectada no encontrada" });
      }
      console.error("Error al desactivar fauna detectada:", err);
      res.status(500).json({ error: "Error al desactivar fauna detectada" });
    }
  }
}

export default FaunaDetectadaController;
