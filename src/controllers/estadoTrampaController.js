import prisma from "../prisma.js";
import { serializeEstadoTrampa } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}

class EstadoTrampaController {
  static async getAll(req, res) {
    try {
      const items = await prisma.estadoTrampa.findMany({
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeEstadoTrampa));
    } catch (err) {
      console.error("Error al obtener estados de trampa:", err);
      res.status(500).json({ error: "Error al obtener estados de trampa" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.estadoTrampa.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeEstadoTrampa));
    } catch (err) {
      console.error("Error al obtener estados de trampa activos:", err);
      res.status(500).json({ error: "Error al obtener estados de trampa activos" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.estadoTrampa.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Estado de trampa creado correctamente",
        estado_trampa: serializeEstadoTrampa(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un estado de trampa con ese nombre" });
      }
      console.error("Error al crear estado de trampa:", err);
      res.status(500).json({ error: "Error al crear estado de trampa" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.estadoTrampa.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Estado de trampa actualizado correctamente",
        estado_trampa: serializeEstadoTrampa(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Estado de trampa no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un estado de trampa con ese nombre" });
      }
      console.error("Error al actualizar estado de trampa:", err);
      res.status(500).json({ error: "Error al actualizar estado de trampa" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.estadoTrampa.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Estado de trampa activado correctamente",
        estado_trampa: serializeEstadoTrampa(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Estado de trampa no encontrado" });
      }
      console.error("Error al activar estado de trampa:", err);
      res.status(500).json({ error: "Error al activar estado de trampa" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.estadoTrampa.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Estado de trampa desactivado correctamente",
        estado_trampa: serializeEstadoTrampa(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Estado de trampa no encontrado" });
      }
      console.error("Error al desactivar estado de trampa:", err);
      res.status(500).json({ error: "Error al desactivar estado de trampa" });
    }
  }
}

export default EstadoTrampaController;
