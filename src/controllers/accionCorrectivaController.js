import prisma from "../prisma.js";
import { serializeAccionCorrectiva } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre;
}

class AccionCorrectivaController {
  static async getAll(req, res) {
    try {
      const items = await prisma.accionCorrectiva.findMany({
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeAccionCorrectiva));
    } catch (err) {
      console.error("Error al obtener acciones correctivas:", err);
      res.status(500).json({ error: "Error al obtener acciones correctivas" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.accionCorrectiva.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeAccionCorrectiva));
    } catch (err) {
      console.error("Error al obtener acciones correctivas activas:", err);
      res.status(500).json({ error: "Error al obtener acciones correctivas activas" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.accionCorrectiva.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Acción correctiva creada correctamente",
        accion_correctiva: serializeAccionCorrectiva(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una acción correctiva con ese nombre" });
      }
      console.error("Error al crear acción correctiva:", err);
      res.status(500).json({ error: "Error al crear acción correctiva" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.accionCorrectiva.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Acción correctiva actualizada correctamente",
        accion_correctiva: serializeAccionCorrectiva(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Acción correctiva no encontrada" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una acción correctiva con ese nombre" });
      }
      console.error("Error al actualizar acción correctiva:", err);
      res.status(500).json({ error: "Error al actualizar acción correctiva" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.accionCorrectiva.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Acción correctiva activada correctamente",
        accion_correctiva: serializeAccionCorrectiva(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Acción correctiva no encontrada" });
      }
      console.error("Error al activar acción correctiva:", err);
      res.status(500).json({ error: "Error al activar acción correctiva" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.accionCorrectiva.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Acción correctiva desactivada correctamente",
        accion_correctiva: serializeAccionCorrectiva(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Acción correctiva no encontrada" });
      }
      console.error("Error al desactivar acción correctiva:", err);
      res.status(500).json({ error: "Error al desactivar acción correctiva" });
    }
  }
}

export default AccionCorrectivaController;
