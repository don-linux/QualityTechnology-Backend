import prisma from "../prisma.js";
import { serializeInstalacion } from "../utils/serializers.js";
import { instalacionWhereFromRequest, resolverUbicacionFlexible } from "../utils/granjaUbicacion.js";

/** instalaciones: nombre, tipo, granja (texto), opcional FK `ubicacion`. */

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function parseUbicacionIdFromBody(body) {
  if (!body || typeof body !== "object") return undefined;
  if ("ubicacion_id" in body) {
    const v = body.ubicacion_id;
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  if ("ubicacionId" in body) {
    const v = body.ubicacionId;
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  return undefined;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const incUbicacion = { ubicacion: true };

class InstalacionController {
  static async getAll(req, res) {
    try {
      const instalaciones = await prisma.instalacion.findMany({
        orderBy: { nombre: "asc" },
        include: incUbicacion,
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones:", err);
      res.status(500).json({ error: "Error al obtener instalaciones" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const granjaPath = req.params.granja ?? "";
      const where = instalacionWhereFromRequest(req, granjaPath);

      if (!where) return res.json([]);

      const instalaciones = await prisma.instalacion.findMany({
        where,
        include: incUbicacion,
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
      const ubic = instalacionWhereFromRequest(req, granja ?? "");
      const filtros = [];

      if (ubic) filtros.push(ubic);
      if (tipo) {
        filtros.push({ tipo: { contains: String(tipo), mode: "insensitive" } });
      }

      const where = filtros.length === 0 ? {} : filtros.length === 1 ? filtros[0] : { AND: filtros };

      const instalaciones = await prisma.instalacion.findMany({
        where,
        include: incUbicacion,
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
      const capacidad = toDecimal(pick(req.body, "capacidad"));
      const observaciones = pick(req.body, "observaciones");

      const granjaIn = pick(req.body, "granja", "fc_granja");
      let granjaStr = granjaIn !== undefined ? String(granjaIn).trim() : "";

      const ubicParsed = parseUbicacionIdFromBody(req.body);
      let ubicacionId = null;

      if (ubicParsed) {
        const u = await prisma.ubicacion.findUnique({ where: { id: ubicParsed } });
        if (!u) return res.status(400).json({ error: "ubicacion no encontrada" });
        ubicacionId = u.id;
        if (!granjaStr) granjaStr = u.nombre;
      } else if (granjaStr) {
        const flex = await resolverUbicacionFlexible(granjaStr);
        if (flex?.ubicacionId) ubicacionId = flex.ubicacionId;
      }

      if (!nombre || !granjaStr) {
        return res.status(400).json({
          error: "nombre y granja (o ubicacion_id válido) son obligatorios",
        });
      }

      const creada = await prisma.instalacion.create({
        data: {
          nombre: String(nombre),
          tipo: tipo ? String(tipo) : null,
          granja: granjaStr,
          ...(ubicacionId != null ? { ubicacionId } : {}),
          ...(capacidad !== null ? { capacidad } : {}),
          ...(observaciones ? { observaciones: String(observaciones) } : {}),
        },
        include: incUbicacion,
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

      const ubParsed = parseUbicacionIdFromBody(req.body);
      const granja = pick(req.body, "granja", "fc_granja");

      if (ubParsed !== undefined) {
        if (ubParsed === null) updateData.ubicacionId = null;
        else {
          const u = await prisma.ubicacion.findUnique({ where: { id: ubParsed } });
          if (!u) {
            return res.status(400).json({ error: "ubicacion no encontrada" });
          }
          updateData.ubicacionId = ubParsed;
          if (granja === undefined || !String(granja).trim()) {
            updateData.granja = u.nombre;
          }
        }
      }

      if (granja !== undefined) updateData.granja = String(granja).trim();

      const capacidadIn = req.body.capacidad;
      if (capacidadIn !== undefined) updateData.capacidad = toDecimal(capacidadIn);

      const observaciones = pick(req.body, "observaciones");
      if (observaciones !== undefined) updateData.observaciones = observaciones ? String(observaciones) : null;

      const actualizada = await prisma.instalacion.update({
        where: { id },
        data: updateData,
        include: incUbicacion,
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
