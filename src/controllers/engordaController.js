import prisma from "../prisma.js";
import { serializeEngorda } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";

// Engorda es 1-1 con Pileta. La trazabilidad de traslados hacia/desde piletas
// etapa `engorda` se expone vía registros `siembra` (como en reproductores).

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

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const engordaInclude = {
  piletas: { include: { ubicacion: true } },
  observacion: true,
};

class EngordaController {
  static async getAll(req, res) {
    try {
      const engordas = await prisma.engorda.findMany({
        include: engordaInclude,
        orderBy: { id: "desc" },
      });
      res.json(engordas.map(serializeEngorda));
    } catch (err) {
      console.error("Error al obtener engordas:", err);
      res.status(500).json({ error: "Error al obtener engordas" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (!ubicClause) return res.json([]);
      const engordas = await prisma.engorda.findMany({
        where: {
          piletas: ubicClause,
        },
        include: engordaInclude,
        orderBy: { id: "desc" },
      });
      res.json(engordas.map(serializeEngorda));
    } catch (err) {
      console.error("Error al obtener engordas por granja:", err);
      res.status(500).json({ error: "Error al obtener engordas" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id es obligatorio" });
      }
      const cantidad = toInt(pick(req.body, "cantidad"), 0) ?? 0;
      const tallaGr = toDecimal(pick(req.body, "talla_gr", "tallaGr"));
      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion");
      const engordaIdExistente = toInt(pick(req.body, "fi_engorda_id", "engorda_id", "id"));

      const result = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "engorda",
        });

        if (engordaIdExistente) {
          return tx.engorda.update({
            where: { id: engordaIdExistente },
            data: {
              pileta_id: piletaId,
              cantidad,
              ...(tallaGr !== null ? { tallaGr } : {}),
              ...(obsId ? { observacionId: obsId } : {}),
              usuarioId,
            },
            include: engordaInclude,
          });
        }

        return tx.engorda.create({
          data: {
            pileta_id: piletaId,
            cantidad,
            ...(tallaGr !== null ? { tallaGr } : {}),
            ...(obsId ? { observacionId: obsId } : {}),
            usuarioId,
          },
          include: engordaInclude,
        });
      });

      res.status(engordaIdExistente ? 200 : 201).json({
        mensaje: engordaIdExistente
          ? "Engorda actualizada con exito"
          : "Engorda registrada con exito",
        data: serializeEngorda(result),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Esa pileta ya tiene una engorda asociada" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta invalida" });
      }
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Engorda no encontrada" });
      }
      console.error("Error al registrar engorda:", err);
      res.status(500).json({ error: "Error al registrar engorda", detalle: err.message });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};
      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (piletaId !== null) updateData.pileta_id = piletaId;

      if (req.body.cantidad !== undefined) updateData.cantidad = toInt(req.body.cantidad, 0) ?? 0;
      if (req.body.talla_gr !== undefined || req.body.tallaGr !== undefined) {
        updateData.tallaGr = toDecimal(pick(req.body, "talla_gr", "tallaGr"));
      }

      const actualizada = await prisma.engorda.update({
        where: { id },
        data: updateData,
        include: engordaInclude,
      });
      res.json({
        mensaje: "Engorda actualizada correctamente.",
        data: serializeEngorda(actualizada),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Engorda no encontrada" });
      console.error("Error al actualizar engorda:", err);
      res.status(500).json({ error: "Error al actualizar engorda" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.engorda.delete({ where: { id } });
      res.json({ mensaje: "Registro eliminado correctamente." });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado." });
      console.error("Error al eliminar:", err);
      res.status(500).json({ error: "Error eliminando registro de Engorda" });
    }
  }

  // ---------------------------------------------------------------------------
  // Trazabilidad vía `siembra`: movimientos donde origen o destino es pileta
  // tipo `engorda`, filtrados por usuario del token (= parámetro :usuario).
  // ---------------------------------------------------------------------------
  static async getMovimientos(req, res) {
    try {
      const usuarioParam = toInt(req.params.usuario);
      const jwtUid = toInt(req.user.usuario_id);
      if (!usuarioParam) return res.json([]);
      if (!jwtUid || usuarioParam !== jwtUid) {
        return res.status(403).json({ error: "No autorizado" });
      }

      const rows = await prisma.siembra.findMany({
        where: {
          usuario_id: usuarioParam,
          OR: [
            { piletas_siembra_pileta_destinoTopiletas: { tipo: "engorda" } },
            { piletas_siembra_pileta_origenTopiletas: { tipo: "engorda" } },
          ],
        },
        include: {
          piletas_siembra_pileta_origenTopiletas: {
            select: { id: true, nombre: true, tipo: true },
          },
          piletas_siembra_pileta_destinoTopiletas: {
            select: { id: true, nombre: true, tipo: true },
          },
          engorda: {
            take: 1,
            orderBy: { id: "desc" },
            select: {
              observacion: { select: { comentario: true } },
            },
          },
        },
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
        take: 500,
      });

      const payload = rows.map((s) => {
        const pilOr = s.piletas_siembra_pileta_origenTopiletas;
        const pilDest = s.piletas_siembra_pileta_destinoTopiletas;
        const brutas =
          typeof s.cantidad === "bigint" ? Number(s.cantidad) : Number(s.cantidad ?? 0);
        const mortalidad = s.mortalidad ?? 0;
        const netas = Math.max(0, brutas - mortalidad);
        const obsEngorda = s.engorda?.[0]?.observacion?.comentario?.trim();
        const obsParts = [];
        if (obsEngorda) obsParts.push(obsEngorda);
        if (mortalidad > 0) obsParts.push(`Mortalidad: ${mortalidad}`);

        return {
          fi_movimiento_id: s.id,
          origen_nombre: pilOr?.nombre ?? null,
          destino_nombre: pilDest?.nombre ?? "—",
          cantidad_trasladada: netas,
          fecha_movimiento: s.fecha,
          observacion: obsParts.length ? obsParts.join(" · ") : null,
        };
      });

      res.json(payload);
    } catch (err) {
      console.error("Error movimientos engorda:", err);
      res.status(500).json({ error: "Error al obtener movimientos de engorda" });
    }
  }

  static async deleteMovimiento(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    const usuarioId = toInt(req.user.usuario_id);
    if (!usuarioId) return res.status(403).json({ error: "No autorizado" });

    try {
      const row = await prisma.siembra.findUnique({
        where: { id },
        select: {
          usuario_id: true,
          piletas_siembra_pileta_destinoTopiletas: { select: { tipo: true } },
          piletas_siembra_pileta_origenTopiletas: { select: { tipo: true } },
        },
      });
      if (!row) return res.status(404).json({ error: "Movimiento no encontrado" });
      if (row.usuario_id !== usuarioId) {
        return res.status(403).json({ error: "No autorizado" });
      }
      const touchesEngorda =
        row.piletas_siembra_pileta_destinoTopiletas?.tipo === "engorda" ||
        row.piletas_siembra_pileta_origenTopiletas?.tipo === "engorda";
      if (!touchesEngorda) {
        return res.status(400).json({ error: "No es un movimiento asociado a engorda" });
      }

      await prisma.$transaction(async (tx) => {
        await tx.engorda.updateMany({
          where: { siembra_id: id },
          data: { siembra_id: null },
        });
        await tx.siembra.delete({ where: { id } });
      });

      res.json({ mensaje: "Movimiento eliminado correctamente." });
    } catch (err) {
      console.error("Error eliminar movimiento engorda:", err);
      res.status(500).json({ error: "Error al eliminar movimiento" });
    }
  }
}

export default EngordaController;
