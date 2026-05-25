import prisma from "../prisma.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import {
  ETAPAS_TRAZABILIDAD,
  serializarMovimientoSiembra,
} from "../utils/siembraMovimiento.js";
import {
  registrarMortalidadTrazabilidad,
  registrarMovimientoTrazabilidad,
  parseFechaMovimiento,
} from "../utils/trazabilidadInventario.js";

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

function normalizarTipoMovimiento(raw) {
  const t = String(raw ?? "TRASLADO")
    .trim()
    .toUpperCase();
  if (t === "INGRESO" || t === "SIEMBRA") return "INGRESO";
  if (t === "MORTALIDAD") return "MORTALIDAD";
  return "TRASLADO";
}

const siembraTrazabilidadInclude = {
  piletas_siembra_pileta_origenTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: { select: { nombre: true } },
    },
  },
  piletas_siembra_pileta_destinoTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: { select: { nombre: true } },
    },
  },
  alevinajes_como_origen: {
    orderBy: { id: "desc" },
    take: 1,
    select: {
      observacion: { select: { comentario: true } },
    },
  },
  engordas_como_origen: {
    orderBy: { id: "desc" },
    take: 1,
    select: {
      observacion: { select: { comentario: true } },
    },
  },
  venta: {
    select: {
      id: true,
      folio: true,
      cliente_nombre: true,
      tipoVenta: true,
    },
  },
};

class TrazabilidadController {
  /** Movimientos `siembra` donde origen o destino es pileta de alevinaje o engorda. */
  static async getMovimientos(req, res) {
    try {
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (!ubicClause) return res.json([]);

      const piletaEnUbic = { ...ubicClause, tipo: { in: ETAPAS_TRAZABILIDAD } };

      const rows = await prisma.siembra.findMany({
        where: {
          OR: [
            { piletas_siembra_pileta_destinoTopiletas: piletaEnUbic },
            { piletas_siembra_pileta_origenTopiletas: piletaEnUbic },
          ],
        },
        include: siembraTrazabilidadInclude,
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
        take: 500,
      });

      res.json(rows.map(serializarMovimientoSiembra));
    } catch (err) {
      console.error("Error movimientos trazabilidad:", err);
      res.status(500).json({ error: "Error al obtener movimientos de trazabilidad" });
    }
  }

  /** Registra traslado, ingreso externo o mortalidad y ajusta inventarios de piletas. */
  static async createMovimiento(req, res) {
    try {
      const usuarioId = req.user.usuario_id;
      const tipoMov = normalizarTipoMovimiento(
        pick(req.body, "tipo_movimiento", "tipo", "fc_tipo_movimiento"),
      );
      const piletaOrigenId = toInt(
        pick(req.body, "pileta_origen_id", "origen_pileta_id", "fi_pileta_origen_id"),
      );
      const piletaDestinoId = toInt(
        pick(req.body, "pileta_destino_id", "pileta_id", "fi_pileta_destino_id"),
      );
      const cantidad = Math.max(
        0,
        toInt(pick(req.body, "cantidad", "cantidad_trasladada", "fn_cantidad"), 0) ?? 0,
      );
      const mortalidad = Math.max(
        0,
        toInt(pick(req.body, "mortalidad", "fn_mortalidad"), 0) ?? 0,
      );
      const observacion = pick(req.body, "observacion", "fc_observacion", "observaciones");
      const fechaMovimiento = parseFechaMovimiento(
        pick(req.body, "fecha_movimiento", "fd_fecha_movimiento", "fecha"),
      );

      const movimientoId = await prisma.$transaction(async (tx) => {
        if (tipoMov === "MORTALIDAD") {
          const piletaId = piletaOrigenId ?? piletaDestinoId;
          return registrarMortalidadTrazabilidad(tx, {
            piletaId,
            cantidad,
            usuarioId,
            observacion,
            fechaMovimiento,
          });
        }

        if (tipoMov === "INGRESO") {
          if (!piletaDestinoId) {
            const err = new Error("pileta_destino_id es obligatorio para ingreso externo");
            err.code = "VALIDACION";
            throw err;
          }
          return registrarMovimientoTrazabilidad(tx, {
            piletaOrigenId: null,
            piletaDestinoId,
            cantidad,
            mortalidad: 0,
            usuarioId,
            observacion,
            fechaMovimiento,
          });
        }

        if (!piletaOrigenId || !piletaDestinoId) {
          const err = new Error("pileta_origen_id y pileta_destino_id son obligatorios para traslado");
          err.code = "VALIDACION";
          throw err;
        }

        return registrarMovimientoTrazabilidad(tx, {
          piletaOrigenId,
          piletaDestinoId,
          cantidad,
          mortalidad,
          usuarioId,
          observacion,
          fechaMovimiento,
        });
      });

      const row = await prisma.siembra.findUnique({
        where: { id: movimientoId },
        include: siembraTrazabilidadInclude,
      });

      res.status(201).json({
        mensaje: "Movimiento de trazabilidad registrado",
        data: serializarMovimientoSiembra(row),
      });
    } catch (err) {
      if (err.code === "VALIDACION" || err.code === "PILETA_TIPO_INVALIDO" || err.code === "PILETA_NOT_FOUND") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "ALEV_CANTIDAD_INSUFICIENTE" || err.code === "ENGORDA_CANTIDAD_INSUFICIENTE") {
        return res.status(400).json({ error: err.message });
      }
      console.error("POST /trazabilidad/movimientos Error:", err);
      res.status(500).json({ error: "Error al registrar movimiento de trazabilidad" });
    }
  }
}

export default TrazabilidadController;
