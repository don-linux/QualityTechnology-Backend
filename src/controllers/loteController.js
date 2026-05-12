import prisma from "../prisma.js";
import { serializeLote } from "../utils/serializers.js";

// El modelo Lote del schema actual solo conserva: nombre, instalacionId,
// familia, fecha_ingreso, cantidad, estatus. Los campos antiguos
// (no_lote, huevos_ml, ovadas, alevines_inicial, mortalidad, ubicacionId,
// usuarioId, observacionId) ya no existen. Tampoco existen los modelos
// `LoteMovimiento`, `TrazaAlevinaje`, `TrazaEngorda`. Los endpoints que
// dependen de esos modelos viejos devuelven 501.

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const loteInclude = { instalacion: true };

class LoteController {
  static async getAll(req, res) {
    try {
      const lotes = await prisma.lote.findMany({
        include: loteInclude,
        orderBy: { id: "desc" },
      });
      res.json(lotes.map(serializeLote));
    } catch (err) {
      console.error("Error al obtener lotes:", err);
      res.status(500).json({ error: "Error al obtener lotes" });
    }
  }

  static async create(req, res) {
    try {
      const nombre = pick(req.body, "nombre", "no_lote", "noLote");
      const instalacionId = toInt(pick(req.body, "instalacion_id", "instalacionId", "fi_instalacion_id"));
      const familia = pick(req.body, "familia");
      const fechaIngreso = toDateOrNull(pick(req.body, "fecha_ingreso", "fecha", "fd_fecha"));
      const cantidad = toInt(pick(req.body, "cantidad", "alevines_inicial"));
      const estatus = pick(req.body, "estatus");

      if (!nombre) {
        return res.status(400).json({ error: "nombre (o no_lote) es obligatorio" });
      }
      if (!instalacionId) {
        return res.status(400).json({ error: "instalacion_id es obligatorio" });
      }

      const creado = await prisma.lote.create({
        data: {
          nombre: String(nombre),
          instalacionId,
          familia: familia ? String(familia) : null,
          ...(fechaIngreso ? { fecha_ingreso: fechaIngreso } : {}),
          ...(cantidad !== null ? { cantidad } : {}),
          ...(estatus ? { estatus: String(estatus) } : {}),
        },
        include: loteInclude,
      });

      res.status(201).json({
        success: true,
        message: "Lote registrado correctamente",
        data: serializeLote(creado),
      });
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Instalacion invalida" });
      }
      console.error("Error al registrar lote:", err);
      res.status(500).json({ error: "Error al registrar lote" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};
      const nombre = pick(req.body, "nombre", "no_lote", "noLote");
      if (nombre !== undefined) updateData.nombre = String(nombre);

      const instalacionId = toInt(pick(req.body, "instalacion_id", "instalacionId", "fi_instalacion_id"));
      if (instalacionId !== null) updateData.instalacionId = instalacionId;

      const familia = pick(req.body, "familia");
      if (familia !== undefined) updateData.familia = familia ? String(familia) : null;

      const fechaIngreso = toDateOrNull(pick(req.body, "fecha_ingreso", "fecha", "fd_fecha"));
      if (fechaIngreso) updateData.fecha_ingreso = fechaIngreso;

      const cantidadIn = pick(req.body, "cantidad", "alevines_inicial");
      if (cantidadIn !== undefined) updateData.cantidad = toInt(cantidadIn);

      const estatus = pick(req.body, "estatus");
      if (estatus !== undefined) updateData.estatus = estatus ? String(estatus) : null;

      const lote = await prisma.lote.update({
        where: { id },
        data: updateData,
        include: loteInclude,
      });

      res.json({
        success: true,
        message: "Lote actualizado correctamente",
        data: serializeLote(lote),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Lote no encontrado" });
      console.error("Error al actualizar lote:", err);
      res.status(500).json({ error: "Error al actualizar lote" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.lote.delete({ where: { id } });
      res.json({ success: true, message: "Lote eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Lote no encontrado" });
      if (err.code === "P2003") {
        return res.status(409).json({
          error: "No se puede eliminar el lote porque tiene registros asociados.",
        });
      }
      console.error("Error al eliminar lote:", err);
      res.status(500).json({ error: "Error al eliminar lote" });
    }
  }

  static async getByInstalacion(req, res) {
    try {
      const instalacionId = toInt(req.params.id);
      if (!instalacionId) return res.json([]);
      const lotes = await prisma.lote.findMany({
        where: { instalacionId },
        orderBy: { id: "desc" },
        select: { id: true, nombre: true },
      });
      res.json(lotes.map((l) => ({ fi_lote_id: l.id, no_lote: l.nombre })));
    } catch (err) {
      console.error("Error al obtener lotes por instalacion:", err);
      res.status(500).json({ error: "Error al obtener lotes por instalacion" });
    }
  }

  static async getFamiliaPorInstalacion(req, res) {
    try {
      const instalacionId = toInt(req.params.instalacionId);
      if (!instalacionId) return res.json(null);
      const lote = await prisma.lote.findFirst({
        where: { instalacionId, familia: { not: null } },
        select: { familia: true },
      });
      if (!lote) return res.json(null);
      res.json({ familia: lote.familia });
    } catch (error) {
      console.error("Error cargando familia:", error);
      res.status(500).json({ error: "Error cargando familia" });
    }
  }

  // ---------------------------------------------------------------------------
  // Endpoints heredados que requieren rediseno
  // ---------------------------------------------------------------------------
  static async getInstalaciones(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno: instalacion ya no tiene ubicacion_id como FK.",
    });
  }

  static async getInstalacionesReproductores(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno: instalacion ya no tiene relacion directa con reproductores.",
    });
  }

  static async getByGranja(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) return res.json([]);
      const lotes = await prisma.lote.findMany({
        where: {
          instalacion: { granja: { equals: granja, mode: "insensitive" } },
        },
        include: loteInclude,
        orderBy: { id: "desc" },
      });
      res.json(lotes.map(serializeLote));
    } catch (err) {
      console.error("Error al obtener lotes por granja:", err);
      res.status(500).json({ error: "Error obteniendo lotes por granja" });
    }
  }
}

export default LoteController;
