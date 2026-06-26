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

/** Sin `include: { ubicacion }` por compatibilidad con client/schema que sólo tienen `ubicacionId`. */
async function mapUbicacionesNombres(ubicacionIds) {
  const ids = [...new Set(ubicacionIds.filter((x) => x != null))];
  if (ids.length === 0) return new Map();
  const rows = await prisma.ubicacion.findMany({
    where: { id: { in: ids } },
    select: { id: true, nombre: true },
  });
  return new Map(rows.map((r) => [r.id, r.nombre]));
}

async function serializeUnidadConUbicacion(unidad) {
  let ubicacionNombre = null;
  if (unidad.ubicacionId != null) {
    const row = await prisma.ubicacion.findUnique({
      where: { id: unidad.ubicacionId },
      select: { nombre: true },
    });
    ubicacionNombre = row?.nombre ?? null;
  }
  return serializeUnidadNegocioFull(unidad, { ubicacionNombre });
}

const MIGRATE_HINT =
  "La base de datos no coincide con el esquema del backend (falta tabla/columna o migración pendiente). " +
  'En QualityTechnology-Backend ejecute: npx prisma migrate deploy';

/** Respuesta cuando Prisma detecta tabla/columna inexistentes (BD sin migraciones aplicadas). */
function respondSchemaMismatch(res, err) {
  return res.status(500).json({
    error: MIGRATE_HINT,
    prismaCode: err.code,
    ...(err.meta && typeof err.meta === "object" ? { prismaMeta: err.meta } : {}),
  });
}

/** Errores de listado de unidades (incluye mismatch de esquema P2021/P2022). */
function respondUnidadesListCatch(res, ctx, err) {
  console.error(ctx, err);
  const dev = process.env.NODE_ENV !== "production";
  const knownSchemaMismatch = err?.code === "P2022" || err?.code === "P2021";
  if (knownSchemaMismatch) {
    return respondSchemaMismatch(res, err);
  }
  return res.status(500).json({
    error: "Error al obtener unidades de negocio",
    ...(dev ? { detail: String(err.message), prismaCode: err.code } : {}),
  });
}

function respondPrismaMutationError(res, ctx, err, userMessage) {
  console.error(ctx, err);
  const dev = process.env.NODE_ENV !== "production";
  if (err?.code === "P2022" || err?.code === "P2021") {
    return respondSchemaMismatch(res, err);
  }
  return res.status(500).json({
    error: userMessage,
    ...(dev ? { detail: String(err.message), prismaCode: err.code } : {}),
  });
}

class UnidadNegocioController {
  static async getAll(req, res) {
    try {
      const unidades = await prisma.unidadNegocio.findMany({
        orderBy: { id: "desc" },
      });
      const nombres = await mapUbicacionesNombres(unidades.map((u) => u.ubicacionId));
      res.json(
        unidades.map((u) =>
          serializeUnidadNegocioFull(u, {
            ubicacionNombre:
              u.ubicacionId != null ? (nombres.get(u.ubicacionId) ?? null) : null,
          })
        )
      );
    } catch (err) {
      respondUnidadesListCatch(res, "Error al obtener unidades de negocio:", err);
    }
  }

  static async getActivos(req, res) {
    try {
      const unidades = await prisma.unidadNegocio.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      const nombres = await mapUbicacionesNombres(unidades.map((u) => u.ubicacionId));
      res.json(
        unidades.map((u) =>
          serializeUnidadNegocioFull(u, {
            ubicacionNombre:
              u.ubicacionId != null ? (nombres.get(u.ubicacionId) ?? null) : null,
          })
        )
      );
    } catch (err) {
      respondUnidadesListCatch(res, "Error al obtener unidades de negocio activas:", err);
    }
  }

  static async create(req, res) {
    const nombre = pick(req.body, "nombre");
    const ubicacionId = toInt(pick(req.body, "ubicacion_id", "ubicacionId"));
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      const unidad = await prisma.unidadNegocio.create({
        data: {
          nombre: String(nombre),
          ...(ubicacionId ? { ubicacionId } : {}),
        },
      });
      res.status(201).json({
        mensaje: "Unidad de negocio creada correctamente",
        unidad: await serializeUnidadConUbicacion(unidad),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una unidad de negocio con ese nombre" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({
          error: "La ubicación física no existe o fue eliminada. Verifique el catálogo de ubicaciones.",
        });
      }
      respondPrismaMutationError(res, "Error al crear unidad de negocio:", err, "Error al crear unidad de negocio");
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    const nombre = pick(req.body, "nombre");
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    const ubicacionIdIn = req.body?.ubicacion_id ?? req.body?.ubicacionId;
    const data = { nombre: String(nombre) };
    if (ubicacionIdIn !== undefined) {
      data.ubicacionId =
        ubicacionIdIn === "" || ubicacionIdIn === null ? null : toInt(ubicacionIdIn);
    }

    try {
      const unidad = await prisma.unidadNegocio.update({
        where: { id },
        data,
      });
      res.json({
        mensaje: "Unidad de negocio actualizada correctamente",
        unidad: await serializeUnidadConUbicacion(unidad),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Unidad de negocio no encontrada" });
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una unidad de negocio con ese nombre" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({
          error: "La ubicación física no existe o fue eliminada. Verifique el catálogo de ubicaciones.",
        });
      }
      respondPrismaMutationError(
        res,
        "Error al actualizar unidad de negocio:",
        err,
        "Error al actualizar unidad de negocio"
      );
    }
  }

  static async activate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const unidad = await prisma.unidadNegocio.update({
        where: { id },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Unidad de negocio activada correctamente",
        unidad: await serializeUnidadConUbicacion(unidad),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Unidad de negocio no encontrada" });
      respondPrismaMutationError(
        res,
        "Error al activar unidad de negocio:",
        err,
        "Error al activar unidad de negocio"
      );
    }
  }

  static async deactivate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const unidad = await prisma.unidadNegocio.update({
        where: { id },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Unidad de negocio desactivada correctamente",
        unidad: await serializeUnidadConUbicacion(unidad),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Unidad de negocio no encontrada" });
      respondPrismaMutationError(
        res,
        "Error al desactivar unidad de negocio:",
        err,
        "Error al desactivar unidad de negocio"
      );
    }
  }
}

export default UnidadNegocioController;
