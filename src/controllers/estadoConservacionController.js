import prisma from "../prisma.js";
import { serializeEstadoConservacion } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}

class EstadoConservacionController {
  static async getAll(req, res) {
    try {
      const items = await prisma.estadoConservacion.findMany({
        orderBy: { id: "asc" },
      });
      res.json(items.map(serializeEstadoConservacion));
    } catch (err) {
      console.error("Error al obtener estados de conservacion:", err);
      res.status(500).json({ error: "Error al obtener estados de conservacion" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.estadoConservacion.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeEstadoConservacion));
    } catch (err) {
      console.error("Error al obtener estados de conservacion activos:", err);
      res.status(500).json({ error: "Error al obtener estados de conservacion activos" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.estadoConservacion.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Estado de conservacion creado correctamente",
        estado_conservacion: serializeEstadoConservacion(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un estado de conservacion con ese nombre" });
      }
      console.error("Error al crear estado de conservacion:", err);
      res.status(500).json({ error: "Error al crear estado de conservacion" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.estadoConservacion.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Estado de conservacion actualizado correctamente",
        estado_conservacion: serializeEstadoConservacion(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Estado de conservacion no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un estado de conservacion con ese nombre" });
      }
      console.error("Error al actualizar estado de conservacion:", err);
      res.status(500).json({ error: "Error al actualizar estado de conservacion" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.estadoConservacion.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Estado de conservacion activado correctamente",
        estado_conservacion: serializeEstadoConservacion(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Estado de conservacion no encontrado" });
      }
      console.error("Error al activar estado de conservacion:", err);
      res.status(500).json({ error: "Error al activar estado de conservacion" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.estadoConservacion.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Estado de conservacion desactivado correctamente",
        estado_conservacion: serializeEstadoConservacion(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Estado de conservacion no encontrado" });
      }
      console.error("Error al desactivar estado de conservacion:", err);
      res.status(500).json({ error: "Error al desactivar estado de conservacion" });
    }
  }
}

export default EstadoConservacionController;
