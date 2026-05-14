import prisma from "../prisma.js";
import { serializeUnidadNegocioFull } from "../utils/serializers.js";

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

const unidadInclude = { ubicacion: { select: { id: true, nombre: true } } };

class UnidadNegocioController {
  static async getAll(req, res) {
    try {
      const unidades = await prisma.unidadNegocio.findMany({
        include: unidadInclude,
        orderBy: { id: "asc" },
      });
      res.json(unidades.map(serializeUnidadNegocioFull));
    } catch (err) {
      console.error("Error al obtener unidades de negocio:", err);
      res.status(500).json({ error: "Error al obtener unidades de negocio" });
    }
  }

  static async getActivos(req, res) {
    try {
      const unidades = await prisma.unidadNegocio.findMany({
        where: { esta_activo: true },
        include: unidadInclude,
        orderBy: { nombre: "asc" },
      });
      res.json(unidades.map(serializeUnidadNegocioFull));
    } catch (err) {
      console.error("Error al obtener unidades de negocio activas:", err);
      res.status(500).json({ error: "Error al obtener unidades de negocio" });
    }
  }

  static async create(req, res) {
    const nombre = pick(req.body, "fc_nombre", "nombre");
    const ubicacionId = toInt(pick(req.body, "ubicacion_id", "ubicacionId", "fi_ubicacion_id"));
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      const unidad = await prisma.unidadNegocio.create({
        data: {
          nombre: String(nombre),
          ...(ubicacionId ? { ubicacionId } : {}),
        },
        include: unidadInclude,
      });
      res.status(201).json({
        mensaje: "Unidad de negocio creada correctamente",
        unidad: serializeUnidadNegocioFull(unidad),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una unidad de negocio con ese nombre" });
      }
      console.error("Error al crear unidad de negocio:", err);
      res.status(500).json({ error: "Error al crear unidad de negocio" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    const nombre = pick(req.body, "fc_nombre", "nombre");
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    const ubicacionIdIn = req.body?.ubicacion_id ?? req.body?.ubicacionId ?? req.body?.fi_ubicacion_id;
    const data = { nombre: String(nombre) };
    if (ubicacionIdIn !== undefined) {
      data.ubicacionId =
        ubicacionIdIn === "" || ubicacionIdIn === null ? null : toInt(ubicacionIdIn);
    }

    try {
      const unidad = await prisma.unidadNegocio.update({
        where: { id },
        data,
        include: unidadInclude,
      });
      res.json({
        mensaje: "Unidad de negocio actualizada correctamente",
        unidad: serializeUnidadNegocioFull(unidad),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Unidad de negocio no encontrada" });
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una unidad de negocio con ese nombre" });
      }
      console.error("Error al actualizar unidad de negocio:", err);
      res.status(500).json({ error: "Error al actualizar unidad de negocio" });
    }
  }

  static async activate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const unidad = await prisma.unidadNegocio.update({
        where: { id },
        data: { esta_activo: true },
        include: unidadInclude,
      });
      res.json({
        mensaje: "Unidad de negocio activada correctamente",
        unidad: serializeUnidadNegocioFull(unidad),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Unidad de negocio no encontrada" });
      console.error("Error al activar unidad de negocio:", err);
      res.status(500).json({ error: "Error al activar unidad de negocio" });
    }
  }

  static async deactivate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const unidad = await prisma.unidadNegocio.update({
        where: { id },
        data: { esta_activo: false },
        include: unidadInclude,
      });
      res.json({
        mensaje: "Unidad de negocio desactivada correctamente",
        unidad: serializeUnidadNegocioFull(unidad),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Unidad de negocio no encontrada" });
      console.error("Error al desactivar unidad de negocio:", err);
      res.status(500).json({ error: "Error al desactivar unidad de negocio" });
    }
  }
}

export default UnidadNegocioController;
