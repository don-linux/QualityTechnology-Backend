import prisma from "../prisma.js";
import { serializeInstalacion } from "../utils/serializers.js";

// El modelo Instalacion del schema actual conserva: nombre, tipo, granja,
// capacidad, observaciones. Las dimensiones fisicas (largo, ancho, alto,
// material, metros_cubicos) y el estado se movieron al modelo Pileta. La
// relacion con ubicacion se reemplazo por el string `granja`.

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

class InstalacionController {
  static async getAll(req, res) {
    try {
      const instalaciones = await prisma.instalacion.findMany({
        orderBy: { nombre: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones:", err);
      res.status(500).json({ error: "Error al obtener instalaciones" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) return res.json([]);
      const instalaciones = await prisma.instalacion.findMany({
        where: { granja: { equals: granja, mode: "insensitive" } },
        orderBy: { nombre: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones por granja:", err);
      res.status(500).json({ error: "Error al obtener instalaciones" });
    }
  }

  static async getByTipo(req, res) {
    try {
      const { tipo, granja } = req.params;
      const where = {};
      if (granja) where.granja = { equals: String(granja), mode: "insensitive" };
      if (tipo) where.tipo = { contains: String(tipo), mode: "insensitive" };
      const instalaciones = await prisma.instalacion.findMany({
        where,
        orderBy: { nombre: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones por tipo:", err);
      res.status(500).json({ error: "Error al obtener instalaciones por tipo" });
    }
  }

  static async create(req, res) {
    try {
      const nombre = pick(req.body, "nombre", "nombre_instalacion", "nombreInstalacion");
      const tipo = pick(req.body, "tipo", "tipo_instalacion", "tipoInstalacion");
      const granja = pick(req.body, "granja", "fc_granja");
      const capacidad = toDecimal(pick(req.body, "capacidad"));
      const observaciones = pick(req.body, "observaciones");

      if (!nombre || !granja) {
        return res.status(400).json({
          error: "nombre y granja son obligatorios",
        });
      }

      const creada = await prisma.instalacion.create({
        data: {
          nombre: String(nombre),
          tipo: tipo ? String(tipo) : null,
          granja: String(granja),
          ...(capacidad !== null ? { capacidad } : {}),
          ...(observaciones ? { observaciones: String(observaciones) } : {}),
        },
      });

      res.status(201).json({
        message: "Instalación registrada correctamente.",
        data: serializeInstalacion(creada),
      });
    } catch (err) {
      console.error("Error al registrar instalación:", err);
      res.status(500).json({ error: "Error al registrar instalación" });
    }
  }

  static async update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id invalido" });
    }

    try {
      const updateData = {};

      const nombre = pick(req.body, "nombre", "nombre_instalacion", "nombreInstalacion");
      if (nombre !== undefined) updateData.nombre = String(nombre);

      const tipo = pick(req.body, "tipo", "tipo_instalacion", "tipoInstalacion");
      if (tipo !== undefined) updateData.tipo = tipo ? String(tipo) : null;

      const granja = pick(req.body, "granja", "fc_granja");
      if (granja !== undefined) updateData.granja = String(granja);

      const capacidadIn = req.body.capacidad;
      if (capacidadIn !== undefined) updateData.capacidad = toDecimal(capacidadIn);

      const observaciones = pick(req.body, "observaciones");
      if (observaciones !== undefined) updateData.observaciones = observaciones ? String(observaciones) : null;

      const actualizada = await prisma.instalacion.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Instalación actualizada correctamente.",
        data: serializeInstalacion(actualizada),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Instalación no encontrada." });
      }
      console.error("Error al actualizar instalación:", err);
      res.status(500).json({ error: "Error al actualizar instalación" });
    }
  }

  static async delete(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id invalido" });
    }

    try {
      const lotesAsociados = await prisma.lote.count({ where: { instalacionId: id } });
      if (lotesAsociados > 0) {
        return res.status(409).json({
          message: "No se puede eliminar: la instalación tiene lotes asociados.",
        });
      }

      await prisma.instalacion.delete({ where: { id } });
      res.json({ message: "Instalación eliminada correctamente." });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Instalación no encontrada." });
      }
      if (err.code === "P2003") {
        return res.status(409).json({
          message: "No se puede eliminar: la instalación tiene registros relacionados.",
        });
      }
      console.error("Error al eliminar instalación:", err);
      res.status(500).json({ error: "Error al eliminar instalación" });
    }
  }
}

export default InstalacionController;
