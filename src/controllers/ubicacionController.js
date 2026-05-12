import prisma from "../prisma.js";
import { serializeUbicacion } from "../utils/serializers.js";

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

class UbicacionController {
  static async getAll(req, res) {
    try {
      const ubicaciones = await prisma.ubicacion.findMany({
        orderBy: { ubicacionId: "asc" },
      });
      res.json(ubicaciones.map(serializeUbicacion));
    } catch (err) {
      console.error("Error al obtener ubicaciones:", err);
      res.status(500).json({ error: "Error al obtener ubicaciones" });
    }
  }

  static async getActivos(req, res) {
    try {
      const ubicaciones = await prisma.ubicacion.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
        select: { ubicacionId: true, nombre: true },
      });
      res.json(
        ubicaciones.map((u) => ({ ubicacion_id: u.ubicacionId, nombre: u.nombre }))
      );
    } catch (err) {
      console.error("Error al obtener ubicaciones activas:", err);
      res.status(500).json({ error: "Error al obtener ubicaciones activas" });
    }
  }

  static async getById(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      const ubicacion = await prisma.ubicacion.findUnique({ where: { ubicacionId: id } });
      if (!ubicacion) return res.status(404).json({ error: "Ubicacion no encontrada" });
      res.json(serializeUbicacion(ubicacion));
    } catch (err) {
      console.error("Error al obtener ubicacion:", err);
      res.status(500).json({ error: "Error al obtener ubicacion" });
    }
  }

  static async create(req, res) {
    const { nombre, direccion, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      const ubicacion = await prisma.ubicacion.create({
        data: {
          nombre: String(nombre).trim(),
          direccion: direccion ?? null,
          descripcion: descripcion ?? null,
        },
      });
      res.status(201).json({
        mensaje: "Ubicacion creada correctamente",
        ubicacion: serializeUbicacion(ubicacion),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una ubicacion con ese nombre" });
      }
      console.error("Error al crear ubicacion:", err);
      res.status(500).json({ error: "Error al crear ubicacion" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    const { nombre, direccion, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      const ubicacion = await prisma.ubicacion.update({
        where: { ubicacionId: id },
        data: {
          nombre: String(nombre).trim(),
          direccion: direccion ?? null,
          descripcion: descripcion ?? null,
        },
      });
      res.json({
        mensaje: "Ubicacion actualizada correctamente",
        ubicacion: serializeUbicacion(ubicacion),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Ubicacion no encontrada" });
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una ubicacion con ese nombre" });
      }
      console.error("Error al actualizar ubicacion:", err);
      res.status(500).json({ error: "Error al actualizar ubicacion" });
    }
  }

  static async activate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      const ubicacion = await prisma.ubicacion.update({
        where: { ubicacionId: id },
        data: { activo: true },
      });
      res.json({
        mensaje: "Ubicacion activada correctamente",
        ubicacion: serializeUbicacion(ubicacion),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Ubicacion no encontrada" });
      console.error("Error al activar ubicacion:", err);
      res.status(500).json({ error: "Error al activar ubicacion" });
    }
  }

  static async deactivate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      const ubicacion = await prisma.ubicacion.update({
        where: { ubicacionId: id },
        data: { activo: false },
      });
      res.json({
        mensaje: "Ubicacion desactivada correctamente",
        ubicacion: serializeUbicacion(ubicacion),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Ubicacion no encontrada" });
      console.error("Error al desactivar ubicacion:", err);
      res.status(500).json({ error: "Error al desactivar ubicacion" });
    }
  }
}

export default UbicacionController;
