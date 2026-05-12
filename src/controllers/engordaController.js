import prisma from "../prisma.js";
import {
  serializeEngorda,
  serializeTrazaEngorda,
} from "../utils/serializers.js";
import { resolverUbicacion, resolverOCrearUbicacion } from "../utils/ubicacion.js";

const MAX_OBSERVACION = 500;

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

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function crearObservacionSiHay(tx, texto, usuarioId) {
  if (texto === undefined || texto === null || String(texto).trim() === "") return null;
  const obs = await tx.observacion.create({
    data: {
      observacion: String(texto).slice(0, 500),
      usuarioId: usuarioId ?? null,
    },
  });
  return obs.observacionId;
}

class EngordaController {
  static async getByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);

      const engordas = await prisma.engorda.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { instalacion: true, lote: true, ubicacion: true, observacion: true },
        orderBy: { engordaId: "desc" },
      });

      const ahora = Date.now();
      const dia = 1000 * 60 * 60 * 24;
      const result = engordas.map((e) => {
        const data = serializeEngorda(e);
        const fS = e.fechaSiembra ? new Date(e.fechaSiembra) : null;
        const fB = e.fechaBiometria ? new Date(e.fechaBiometria) : null;
        data.dias_en_pila = fS ? Math.floor((ahora - fS.getTime()) / dia) : null;
        data.dias_transcurridos = fB ? Math.floor((ahora - fB.getTime()) / dia) : null;
        return data;
      });
      res.json(result);
    } catch (err) {
      console.error("Error al obtener inventario de Engorda:", err);
      res.status(500).json({ error: "Error al obtener inventario de Engorda" });
    }
  }

  static async create(req, res) {
    try {
      const observacionTexto = pick(req.body, "observacion");
      if (observacionTexto && String(observacionTexto).length > MAX_OBSERVACION) {
        return res.status(400).json({
          error: `La observacion no puede superar los ${MAX_OBSERVACION} caracteres.`,
        });
      }

      const usuarioId = req.user.usuario_id;
      const engordaIdExistente = toInt(req.body.fi_engorda_id);
      const cantidad = toInt(req.body.cantidad, 0) ?? 0;
      const tallaGr = toDecimal(req.body.talla_gr);
      const fechaSiembra = toDateOrNull(pick(req.body, "fecha_siembra", "fd_fecha_siembra"));
      const fechaBiometria = toDateOrNull(pick(req.body, "fecha_biometria", "fd_fecha_biometria"));

      if (engordaIdExistente) {
        const actualizado = await prisma.$transaction(async (tx) => {
          const updateData = {};
          if (req.body.cantidad !== undefined) updateData.cantidad = cantidad;
          if (req.body.talla_gr !== undefined) updateData.tallaGr = tallaGr;
          if (fechaSiembra) updateData.fechaSiembra = fechaSiembra;
          if (fechaBiometria) updateData.fechaBiometria = fechaBiometria;
          if (observacionTexto !== undefined) {
            const obsId = await crearObservacionSiHay(tx, observacionTexto, usuarioId);
            if (obsId) updateData.observacionId = obsId;
          }
          return tx.engorda.update({
            where: { engordaId: engordaIdExistente },
            data: updateData,
            include: { instalacion: true, lote: true, ubicacion: true, observacion: true },
          });
        });
        return res.json({
          mensaje: "Engorda actualizada correctamente.",
          data: serializeEngorda(actualizado),
        });
      }

      const instalacionId = toInt(pick(req.body, "fi_instalacion_id", "instalacion_id"));
      const origenInstalacion = toInt(req.body.origen_instalacion);
      if (!instalacionId) {
        return res.status(400).json({ error: "fi_instalacion_id es obligatorio" });
      }
      if (!origenInstalacion) {
        return res.status(400).json({ error: "origen_instalacion es obligatorio" });
      }

      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      const ubicacion = await resolverOCrearUbicacion(granjaInput);
      if (!ubicacion) return res.status(400).json({ error: "granja/ubicacion invalida" });

      const lote = await prisma.lote.findUnique({
        where: { loteId: origenInstalacion },
        select: { loteId: true, alevinesInicial: true },
      });

      let loteFinal = null;
      let stockDisponible = 0;
      let esLote = false;
      let engordaOrigenSource = null;

      if (lote) {
        esLote = true;
        loteFinal = lote.loteId;
        stockDisponible = Number(lote.alevinesInicial || 0);
      } else {
        const engordaOrigen = await prisma.engorda.findUnique({
          where: { engordaId: origenInstalacion },
          select: { engordaId: true, loteId: true, cantidad: true },
        });
        if (!engordaOrigen) {
          return res.status(400).json({
            error: "El origen no corresponde a un lote ni a una engorda existente.",
          });
        }
        loteFinal = engordaOrigen.loteId;
        stockDisponible = Number(engordaOrigen.cantidad || 0);
        engordaOrigenSource = engordaOrigen.engordaId;
      }

      if (cantidad > stockDisponible) {
        return res.status(400).json({
          error: esLote
            ? `El lote solo tiene ${stockDisponible} alevines disponibles. No se pueden trasladar ${cantidad}.`
            : `La engorda origen solo tiene ${stockDisponible} organismos. No se pueden trasladar ${cantidad}.`,
        });
      }

      if (!loteFinal) {
        return res.status(400).json({
          error: "No se pudo determinar el lote para la engorda destino.",
        });
      }

      const creada = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, observacionTexto, usuarioId);
        const engorda = await tx.engorda.create({
          data: {
            instalacionId,
            loteId: loteFinal,
            cantidad,
            tallaGr,
            fechaSiembra,
            fechaBiometria,
            ubicacionId: ubicacion.ubicacionId,
            usuarioId,
            observacionId: obsId,
          },
          include: { instalacion: true, lote: true, ubicacion: true, observacion: true },
        });

        if (esLote) {
          await tx.lote.update({
            where: { loteId: origenInstalacion },
            data: { alevinesInicial: { decrement: cantidad } },
          });
          await tx.trazaEngorda.create({
            data: {
              engordaOrigen: null,
              engordaDestino: engorda.engordaId,
              cantidadTrasladada: cantidad,
              fechaMovimiento: new Date(),
              usuarioId,
              observacionId: obsId,
            },
          });
        } else {
          await tx.engorda.update({
            where: { engordaId: origenInstalacion },
            data: { cantidad: { decrement: cantidad } },
          });
          await tx.trazaEngorda.create({
            data: {
              engordaOrigen: engordaOrigenSource,
              engordaDestino: engorda.engordaId,
              cantidadTrasladada: cantidad,
              fechaMovimiento: new Date(),
              usuarioId,
              observacionId: obsId,
            },
          });
        }

        return engorda;
      });

      res.status(201).json({
        mensaje: "Engorda registrada con exito",
        data: serializeEngorda(creada),
      });
    } catch (err) {
      console.error("Error al registrar engorda:", err);
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.$transaction(async (tx) => {
        await tx.trazaEngorda.deleteMany({
          where: { OR: [{ engordaOrigen: id }, { engordaDestino: id }] },
        });
        await tx.engorda.delete({ where: { engordaId: id } });
      });
      res.json({ mensaje: "Registro eliminado correctamente." });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado." });
      console.error("Error al eliminar:", err);
      res.status(500).json({ error: "Error eliminando registro de Engorda" });
    }
  }

  static async getMovimientos(req, res) {
    try {
      const usuarioId = toInt(req.params.usuario);
      if (!usuarioId) return res.json([]);

      const movimientos = await prisma.trazaEngorda.findMany({
        where: { usuarioId },
        include: {
          origen: { include: { instalacion: true } },
          destino: { include: { instalacion: true } },
          observacion: true,
        },
        orderBy: { movimientoId: "desc" },
      });
      res.json(movimientos.map(serializeTrazaEngorda));
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos de Engorda" });
    }
  }

  static async deleteMovimiento(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.trazaEngorda.delete({ where: { movimientoId: id } });
      res.json({ mensaje: "Movimiento eliminado correctamente." });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Movimiento no encontrado." });
      console.error("Error al eliminar movimiento:", err);
      res.status(500).json({ error: "Error eliminando movimiento de Engorda" });
    }
  }
}

export default EngordaController;
