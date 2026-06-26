import prisma from "../prisma.js";
import { serializeTipoPileta } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre;
}

class TipoPiletaController {
  static async getAll(req, res) {
    try {
      const items = await prisma.tipoPileta.findMany({
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeTipoPileta));
    } catch (err) {
      console.error("Error al obtener tipos de pileta:", err);
      res.status(500).json({ error: "Error al obtener tipos de pileta" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.tipoPileta.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeTipoPileta));
    } catch (err) {
      console.error("Error al obtener tipos de pileta activos:", err);
      res.status(500).json({ error: "Error al obtener tipos de pileta activos" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.tipoPileta.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Tipo de pileta creado correctamente",
        tipo_pileta: serializeTipoPileta(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de pileta con ese nombre" });
      }
      console.error("Error al crear tipo de pileta:", err);
      res.status(500).json({ error: "Error al crear tipo de pileta" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.tipoPileta.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Tipo de pileta actualizado correctamente",
        tipo_pileta: serializeTipoPileta(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Tipo de pileta no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de pileta con ese nombre" });
      }
      console.error("Error al actualizar tipo de pileta:", err);
      res.status(500).json({ error: "Error al actualizar tipo de pileta" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.tipoPileta.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Tipo de pileta activado correctamente",
        tipo_pileta: serializeTipoPileta(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Tipo de pileta no encontrado" });
      }
      console.error("Error al activar tipo de pileta:", err);
      res.status(500).json({ error: "Error al activar tipo de pileta" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.tipoPileta.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Tipo de pileta desactivado correctamente",
        tipo_pileta: serializeTipoPileta(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Tipo de pileta no encontrado" });
      }
      console.error("Error al desactivar tipo de pileta:", err);
      res.status(500).json({ error: "Error al desactivar tipo de pileta" });
    }
  }
}

export default TipoPiletaController;
