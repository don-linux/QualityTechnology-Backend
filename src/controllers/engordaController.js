import prisma from "../prisma.js";
import { serializeEngorda } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import {
  aplicarEstadoPiletaPorCantidad,
  descontarReproductorPorEgresoHaciaAlevinaje,
} from "../utils/reproductorInventario.js";
import { descontarAlevinajePorEgresoHaciaEngorda } from "../utils/alevinajeInventario.js";
import { descontarEngordaPorEgresoHaciaEngorda } from "../utils/engordaInventario.js";

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
  siembra: {
    select: {
      pileta_origen: true,
      piletas_siembra_pileta_origenTopiletas: { select: { id: true, nombre: true } },
    },
  },
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

      const machosIn = Math.max(0, toInt(pick(req.body, "machos"), 0) ?? 0);
      const hembrasIn = Math.max(0, toInt(pick(req.body, "hembras"), 0) ?? 0);
      const cantidad = machosIn + hembrasIn;
      const cantidadBody = pick(req.body, "cantidad");
      if (cantidad <= 0) {
        return res.status(400).json({ error: "machos + hembras debe ser mayor a cero" });
      }
      if (
        cantidadBody !== undefined &&
        cantidadBody !== null &&
        cantidadBody !== ""
      ) {
        const cDeclared = toInt(cantidadBody, null);
        if (cDeclared !== null && cDeclared !== cantidad) {
          return res.status(400).json({ error: "cantidad total debe coincidir con machos + hembras" });
        }
      }

      const tallaGr = toDecimal(pick(req.body, "talla_gr", "tallaGr"));
      const usuarioId = toInt(req.user.usuario_id);
      if (!usuarioId) {
        return res.status(403).json({ error: "No autorizado" });
      }
      const obsTexto = pick(req.body, "observacion", "fc_observacion");
      const engordaIdExistente = toInt(pick(req.body, "fi_engorda_id", "engorda_id", "id"));
      const origenPiletaId = toInt(
        pick(req.body, "origen_pileta_id", "origenPiletaId", "fi_pileta_origen_id"),
      );

      const result = await prisma.$transaction(async (tx) => {
        if (!engordaIdExistente && origenPiletaId && origenPiletaId !== piletaId) {
          const pilOrigen = await tx.pileta.findUnique({
            where: { id: origenPiletaId },
            select: { id: true, tipo: true, estado: true },
          });
          if (!pilOrigen) {
            const err = new Error("Pileta de origen no encontrada");
            err.code = "ORIGEN_INVALIDO";
            throw err;
          }
          if (pilOrigen.estado !== "ocupada") {
            const err = new Error("La pileta de origen debe estar ocupada");
            err.code = "ORIGEN_NO_OCUPADA";
            throw err;
          }

          switch (pilOrigen.tipo) {
            case "alevinaje":
              await descontarAlevinajePorEgresoHaciaEngorda(tx, origenPiletaId, {
                piletaDestinoId: piletaId,
                machosDeducir: machosIn,
                hembrasDeducir: hembrasIn,
              });
              break;
            case "reproductores": {
              const tieneRep = await tx.reproductor.findUnique({
                where: { pileta_id: origenPiletaId },
                select: { id: true },
              });
              if (!tieneRep) {
                const err = new Error(
                  "La pileta de origen es reproductores pero no tiene inventario registrado (tabla reproductores).",
                );
                err.code = "REPRO_ORIGEN_VACIO";
                throw err;
              }
              await descontarReproductorPorEgresoHaciaAlevinaje(tx, origenPiletaId, {
                piletaDestinoId: piletaId,
                machosDeducir: machosIn,
                hembrasDeducir: hembrasIn,
                cantidadTotalSinSexo: 0,
              });
              break;
            }
            case "engorda":
              await descontarEngordaPorEgresoHaciaEngorda(tx, origenPiletaId, {
                piletaDestinoId: piletaId,
                machosDeducir: machosIn,
                hembrasDeducir: hembrasIn,
              });
              break;
            default: {
              const err = new Error("Tipo de pileta de origen no admite traslado a engorda");
              err.code = "ORIGEN_TIPO_INVALIDO";
              throw err;
            }
          }
        }

        let siembraId = null;
        if (!engordaIdExistente && origenPiletaId && origenPiletaId !== piletaId) {
          const s = await tx.siembra.create({
            data: {
              pileta_origen: origenPiletaId,
              pileta_destino: piletaId,
              cantidad: BigInt(cantidad),
              mortalidad: 0,
              usuario_id: usuarioId,
            },
          });
          siembraId = s.id;
        }

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "engorda",
        });

        let row;
        if (engordaIdExistente) {
          row = await tx.engorda.update({
            where: { id: engordaIdExistente },
            data: {
              pileta_id: piletaId,
              cantidad,
              machos: machosIn,
              hembras: hembrasIn,
              ...(tallaGr !== null ? { tallaGr } : {}),
              ...(obsId ? { observacionId: obsId } : {}),
              usuarioId,
            },
            include: engordaInclude,
          });
        } else {
          row = await tx.engorda.create({
            data: {
              pileta_id: piletaId,
              cantidad,
              machos: machosIn,
              hembras: hembrasIn,
              ...(tallaGr !== null ? { tallaGr } : {}),
              ...(obsId ? { observacionId: obsId } : {}),
              ...(siembraId ? { siembra_id: siembraId } : {}),
              usuarioId,
            },
            include: engordaInclude,
          });
        }

        await aplicarEstadoPiletaPorCantidad(tx, piletaId, row.cantidad);

        return row;
      });

      res.status(engordaIdExistente ? 200 : 201).json({
        mensaje: engordaIdExistente
          ? "Engorda actualizada con exito"
          : "Engorda registrada con exito",
        data: serializeEngorda(result),
      });
    } catch (err) {
      const biz = err.code;
      if (
        biz === "ALEV_CANTIDAD_INSUFICIENTE" ||
        biz === "REPRO_CANTIDAD_INSUFICIENTE" ||
        biz === "REPRO_ORIGEN_VACIO" ||
        biz === "ENGORDA_CANTIDAD_INSUFICIENTE" ||
        biz === "ENGORDA_ORIGEN_VACIA"
      ) {
        return res.status(400).json({ error: err.message });
      }
      if (
        biz === "ORIGEN_INVALIDO" ||
        biz === "ORIGEN_NO_OCUPADA" ||
        biz === "ORIGEN_TIPO_INVALIDO"
      ) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Esa pileta ya tiene una engorda asociada" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta invalida" });
      }
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Engorda no encontrada" });
      }
      /** Columna o tabla ausente (suele ser migración Prisma no aplicada). */
      if (err.code === "P2022") {
        return res.status(503).json({
          error:
            "Base de datos desincronizada con el código (columna o campo ausente). Ejecute `npx prisma migrate deploy` en el backend.",
          detalle: err.message,
        });
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
      await prisma.$transaction(async (tx) => {
        const prev = await tx.engorda.findUnique({
          where: { id },
          select: { pileta_id: true },
        });
        await tx.engorda.delete({ where: { id } });
        if (prev?.pileta_id) {
          await aplicarEstadoPiletaPorCantidad(tx, prev.pileta_id, 0);
        }
      });
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
