import prisma from "../prisma.js";
import { serializeLote } from "../utils/serializers.js";
import { ubicacionNombreWhereFromGranja } from "../utils/granjaUbicacion.js";

// Lotes pueden enlazarse a `pileta_id` (flujo actual: pileta reproductores) o,
// por compatibilidad, a `instalacion_id` en datos heredados.

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

const loteInclude = {
  instalacion: true,
  pileta: { include: { ubicacion: true } },
};

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
      const piletaId = toInt(
        pick(req.body, "pileta_id", "fi_pileta_id", "fc_pileta_id"),
      );
      const instalacionId = toInt(
        pick(req.body, "instalacion_id", "instalacionId", "fi_instalacion_id", "fc_instalacion_id"),
      );
      const familia = pick(req.body, "familia");
      const fechaIngreso = toDateOrNull(pick(req.body, "fecha_ingreso", "fecha", "fd_fecha"));
      const cantidad = toInt(pick(req.body, "cantidad", "alevines_inicial"));
      const estatus = pick(req.body, "estatus");

      if (!nombre) {
        return res.status(400).json({ error: "nombre (o no_lote) es obligatorio" });
      }
      if (!piletaId && !instalacionId) {
        return res.status(400).json({ error: "pileta_id o instalacion_id es obligatorio" });
      }

      let data = {
        nombre: String(nombre),
        familia: familia ? String(familia) : null,
        ...(fechaIngreso ? { fecha_ingreso: fechaIngreso } : {}),
        ...(cantidad !== null ? { cantidad } : {}),
        ...(estatus ? { estatus: String(estatus) } : {}),
      };

      if (piletaId) {
        const pileta = await prisma.pileta.findFirst({
          where: {
            id: piletaId,
            tipo: "reproductores",
          },
        });
        if (!pileta) {
          return res.status(400).json({
            error: "pileta_id invalida o la pileta no es etapa reproductores",
          });
        }
        data = { ...data, piletaId, instalacionId: null };
      } else {
        data = { ...data, instalacionId, piletaId: null };
      }

      const creado = await prisma.lote.create({
        data,
        include: loteInclude,
      });

      res.status(201).json({
        success: true,
        message: "Lote registrado correctamente",
        data: serializeLote(creado),
      });
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Referencia invalida (pileta o instalacion)" });
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

      const piletaId = toInt(
        pick(req.body, "pileta_id", "fi_pileta_id", "fc_pileta_id"),
      );
      const instalacionId = toInt(
        pick(req.body, "instalacion_id", "instalacionId", "fi_instalacion_id", "fc_instalacion_id"),
      );

      if (piletaId) {
        const pileta = await prisma.pileta.findFirst({
          where: {
            id: piletaId,
            tipo: "reproductores",
          },
        });
        if (!pileta) {
          return res.status(400).json({
            error: "pileta_id invalida o la pileta no es etapa reproductores",
          });
        }
        updateData.piletaId = piletaId;
        updateData.instalacionId = null;
      } else if (instalacionId !== null && instalacionId !== undefined) {
        updateData.instalacionId = instalacionId;
        updateData.piletaId = null;
      }

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
      const id = toInt(req.params.id);
      if (!id) return res.json([]);
      const byPileta = await prisma.lote.findMany({
        where: { piletaId: id },
        orderBy: { id: "desc" },
        select: { id: true, nombre: true },
      });
      if (byPileta.length) {
        return res.json(byPileta.map((l) => ({ fi_lote_id: l.id, no_lote: l.nombre })));
      }
      const lotes = await prisma.lote.findMany({
        where: { instalacionId: id },
        orderBy: { id: "desc" },
        select: { id: true, nombre: true },
      });
      res.json(lotes.map((l) => ({ fi_lote_id: l.id, no_lote: l.nombre })));
    } catch (err) {
      console.error("Error al obtener lotes por instalacion/pileta:", err);
      res.status(500).json({ error: "Error al obtener lotes" });
    }
  }

  /**
   * Familia para el circuito reproductivo: prioriza `reproductor` por pileta_id.
   * El parametro historico se llama `instalacionId`; acepta id de pileta reproductores.
   */
  static async getFamiliaPorInstalacion(req, res) {
    try {
      const id = toInt(req.params.instalacionId);
      if (!id) return res.json(null);

      const rep = await prisma.reproductor.findUnique({
        where: { pileta_id: id },
        select: { familia: true },
      });
      if (rep?.familia != null && rep.familia !== "") {
        return res.json({ familia: rep.familia });
      }

      const lote = await prisma.lote.findFirst({
        where: { OR: [{ instalacionId: id }, { piletaId: id }], familia: { not: null } },
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
  // Endpoints heredados sin uso en el flujo actual
  // ---------------------------------------------------------------------------
  static async getInstalaciones(req, res) {
    res.status(501).json({
      error: "Use /piletas. El modulo instalaciones standalone fue retirado.",
    });
  }

  /**
   * Lista piletas etapa `reproductores` de la sede (granja via ubicacion.nombre).
   * No exige inventario `reproductores`: basta la pileta física en esa etapa.
   * Alias legacy: fi_instalacion_id = fi_pileta_id = id de pileta para compat con formularios viejos.
   */
  static async getInstalacionesReproductores(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) return res.json([]);

      const ubicacionCond = ubicacionNombreWhereFromGranja(granja);
      if (!ubicacionCond) return res.json([]);

      const piletas = await prisma.pileta.findMany({
        where: {
          tipo: "reproductores",
          ubicacion: ubicacionCond,
        },
        include: { ubicacion: true },
        orderBy: { nombre: "asc" },
      });

      const list = piletas.map((p) => ({
        fi_pileta_id: p.id,
        pileta_id: p.id,
        fi_instalacion_id: p.id,
        instalacion_id: p.id,
        nombre_pileta: p.nombre,
        nombre_instalacion: p.nombre,
        fc_granja: p.ubicacion?.nombre ?? null,
      }));
      res.json(list);
    } catch (err) {
      console.error("Error al obtener piletas reproductoras:", err);
      res.status(500).json({ error: "Error al obtener piletas reproductoras" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) return res.json([]);

      const ubicacionCond = ubicacionNombreWhereFromGranja(granja);
      const or = [
        { instalacion: { granja: { equals: granja, mode: "insensitive" } } },
      ];
      if (ubicacionCond) {
        or.push({ pileta: { ubicacion: ubicacionCond } });
      }

      const lotes = await prisma.lote.findMany({
        where: { OR: or },
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
