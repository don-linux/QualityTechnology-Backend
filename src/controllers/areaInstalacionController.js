import prisma from "../prisma.js";
import { serializeAreaInstalacion } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}

class AreaInstalacionController {
  static async getAll(req, res) {
    try {
      const items = await prisma.areaInstalacion.findMany({
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeAreaInstalacion));
    } catch (err) {
      console.error("Error al obtener áreas de instalación:", err);
      res.status(500).json({ error: "Error al obtener áreas de instalación" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.areaInstalacion.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeAreaInstalacion));
    } catch (err) {
      console.error("Error al obtener áreas de instalación activas:", err);
      res.status(500).json({ error: "Error al obtener áreas de instalación activas" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.areaInstalacion.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Área de instalación creada correctamente",
        area_instalacion: serializeAreaInstalacion(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un área de instalación con ese nombre" });
      }
      console.error("Error al crear área de instalación:", err);
      res.status(500).json({ error: "Error al crear área de instalación" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.areaInstalacion.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Área de instalación actualizada correctamente",
        area_instalacion: serializeAreaInstalacion(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Área de instalación no encontrada" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un área de instalación con ese nombre" });
      }
      console.error("Error al actualizar área de instalación:", err);
      res.status(500).json({ error: "Error al actualizar área de instalación" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.areaInstalacion.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Área de instalación activada correctamente",
        area_instalacion: serializeAreaInstalacion(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Área de instalación no encontrada" });
      }
      console.error("Error al activar área de instalación:", err);
      res.status(500).json({ error: "Error al activar área de instalación" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.areaInstalacion.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Área de instalación desactivada correctamente",
        area_instalacion: serializeAreaInstalacion(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Área de instalación no encontrada" });
      }
      console.error("Error al desactivar área de instalación:", err);
      res.status(500).json({ error: "Error al desactivar área de instalación" });
    }
  }
}

export default AreaInstalacionController;
