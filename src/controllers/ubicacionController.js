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
        orderBy: { id: "desc" },
      });
      res.json(ubicaciones.map(serializeUbicacion));
    } catch (err) {
      console.error("Error al obtener ubicaciones:", err);
      res.status(500).json({ error: "Error al obtener ubicaciones" });
    }
  }

  static async getActivos(req, res) {
    try {
      // La tabla `ubicacion` no tiene columna esta_activo en el schema actual,
      // asi que devolvemos todas como "activas" hasta que se introduzca el flag.
      const ubicaciones = await prisma.ubicacion.findMany({
        orderBy: { nombre: "asc" },
        select: { id: true, nombre: true },
      });
      res.json(
        ubicaciones.map((u) => ({ ubicacion_id: u.id, nombre: u.nombre }))
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
      const ubicacion = await prisma.ubicacion.findUnique({ where: { id } });
      if (!ubicacion) return res.status(404).json({ error: "Ubicacion no encontrada" });
      res.json(serializeUbicacion(ubicacion));
    } catch (err) {
      console.error("Error al obtener ubicacion:", err);
      res.status(500).json({ error: "Error al obtener ubicacion" });
    }
  }

  static async create(req, res) {
    const { nombre, direccion } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      const ubicacion = await prisma.ubicacion.create({
        data: {
          nombre: String(nombre).trim(),
          direccion: direccion ?? null,
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
    const { nombre, direccion } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      const ubicacion = await prisma.ubicacion.update({
        where: { id },
        data: {
          nombre: String(nombre).trim(),
          direccion: direccion ?? null,
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
    // La tabla `ubicacion` no tiene flag esta_activo en el schema actual.
    res.status(501).json({
      error:
        "La tabla ubicacion no soporta estado activo/inactivo. Agrega la columna esta_activo en el schema si necesitas esta funcionalidad.",
    });
  }

  static async deactivate(req, res) {
    res.status(501).json({
      error:
        "La tabla ubicacion no soporta estado activo/inactivo. Agrega la columna esta_activo en el schema si necesitas esta funcionalidad.",
    });
  }
}

export default UbicacionController;
