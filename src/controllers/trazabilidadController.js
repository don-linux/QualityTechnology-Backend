import prisma from "../prisma.js";
import {
  piletaWhereUbicacionFromRequest,
  primerUbicacionIdValido,
  resolverUbicacionFlexible,
} from "../utils/granjaUbicacion.js";
import {
  ETAPAS_PILETA_MOVIMIENTOS,
  ETAPAS_TRAZABILIDAD,
  serializarMovimientoSiembra,
} from "../utils/siembraMovimiento.js";
import {
  registrarMortalidadTrazabilidad,
  registrarMovimientoTrazabilidad,
  registrarMovimientoEficienciaReproductivaAAlevinaje,
  registrarVentaDesdeListaEspera,
  parseFechaMovimiento,
  etapaRequeridaParaTipoVenta,
} from "../utils/trazabilidadInventario.js";
import {
  resolverSubtipoMovimiento,
  validarPiletasSegunSubtipo,
} from "../utils/trazabilidadSubtipos.js";
import { resolverHistorialPesoId } from "./historialPesoController.js";

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

function modoDesdeSubtipo(resuelto) {
  if (!resuelto) return null;
  if (resuelto.config) return resuelto.config.modo;
  return resuelto.modo;
}

const siembraTrazabilidadInclude = {
  piletas_siembra_pileta_origenTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: { select: { id: true, nombre: true } },
    },
  },
  piletas_siembra_pileta_destinoTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: { select: { id: true, nombre: true } },
    },
  },
  engordas_como_origen: {
    orderBy: { id: "desc" },
    take: 1,
    select: {
      observacion: { select: { comentario: true } },
    },
  },
  eficiencias_reproductivas_como_origen: {
    orderBy: { id: "desc" },
    take: 1,
    select: {
      lote: true,
      codigo: true,
      evento_cosecha: { select: { codigo: true } },
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
  usuarios: {
    select: {
      id: true,
      nombre: true,
      rol: { select: { nombre: true } },
    },
  },
};

class TrazabilidadController {
  /** Movimientos `siembra` donde origen o destino es pileta de inventario trazable. */
  static async getMovimientos(req, res) {
    try {
      let ubicClause = piletaWhereUbicacionFromRequest(req);
      const ubicIdQ = primerUbicacionIdValido(req.query?.ubicacion_id, req.query?.ubicacionId);
      const granjaQ =
        typeof req.query?.granja === "string"
          ? req.query.granja.trim()
          : typeof req.params?.granja === "string"
            ? req.params.granja.trim()
            : "";

      if (!ubicIdQ && granjaQ) {
        const flex = await resolverUbicacionFlexible(granjaQ);
        if (flex?.ubicacionId != null) {
          ubicClause = { ubicacionId: flex.ubicacionId };
        }
      }

      if (!ubicClause) return res.json([]);

      const piletaEnUbic = { ...ubicClause, tipo: { in: ETAPAS_TRAZABILIDAD } };
      const piletaOrigenEnUbic = { ...ubicClause, tipo: { in: ETAPAS_PILETA_MOVIMIENTOS } };

      const rows = await prisma.siembra.findMany({
        where: {
          OR: [
            { piletas_siembra_pileta_destinoTopiletas: piletaOrigenEnUbic },
            { piletas_siembra_pileta_origenTopiletas: piletaOrigenEnUbic },
            {
              venta_id: { not: null },
              piletas_siembra_pileta_origenTopiletas: piletaEnUbic,
            },
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
      const rawTipo = pick(req.body, "tipo_movimiento", "tipo");
      const resuelto = resolverSubtipoMovimiento(rawTipo);
      const tipoMov = modoDesdeSubtipo(resuelto);
      if (!tipoMov) {
        return res.status(400).json({
          error:
            "tipo_movimiento inválido. Use: INCUBACION_A_ALEVINAJE, ALEVINAJE_A_ALEVINAJE, ALEVINAJE_A_ENGORDA, ALEVINAJE_A_VENTA, ENGORDA_A_ENGORDA, ENGORDA_A_VENTA, MORTALIDAD_ALEVINAJE o MORTALIDAD_ENGORDA",
        });
      }
      const piletaOrigenId = toInt(
        pick(req.body, "pileta_origen_id", "origen_pileta_id"),
      );
      const piletaDestinoId = toInt(
        pick(req.body, "pileta_destino_id", "pileta_id"),
      );
      const cantidad = Math.max(
        0,
        toInt(pick(req.body, "cantidad", "cantidad_trasladada"), 0) ?? 0,
      );
      const mortalidad = Math.max(
        0,
        toInt(pick(req.body, "mortalidad"), 0) ?? 0,
      );
      const observacion = pick(req.body, "observacion", "observaciones");
      const fechaMovimiento = parseFechaMovimiento(
        pick(req.body, "fecha_movimiento", "fecha"),
      );

      const movimientoId = await prisma.$transaction(async (tx) => {
        if (resuelto?.config) {
          await validarPiletasSegunSubtipo(tx, {
            subtipoConfig: resuelto.config,
            piletaOrigenId,
            piletaDestinoId,
          });
        }

        if (resuelto?.subtipo === "INCUBACION_A_ALEVINAJE") {
          const pesoHistorialId = await resolverHistorialPesoId(tx, {
            peso_gramos: pick(req.body, "peso_gramos", "peso_valor"),
            fecha_peso:
              pick(req.body, "fecha_peso") ??
              pick(req.body, "fecha_movimiento", "fecha"),
          });
          return registrarMovimientoEficienciaReproductivaAAlevinaje(tx, {
            piletaOrigenId,
            piletaDestinoId,
            cantidad,
            usuarioId,
            observacion,
            fechaMovimiento,
            pesoHistorialId,
          });
        }

        if (tipoMov === "VENTA") {
          const listaEsperaId = toInt(
            pick(req.body, "lista_espera_id"),
          );
          if (!listaEsperaId) {
            const err = new Error("lista_espera_id es obligatorio para venta");
            err.code = "VALIDACION";
            throw err;
          }
          if (resuelto?.config?.etapaOrigen) {
            const lista = await tx.listaEspera.findUnique({
              where: { id: listaEsperaId },
              select: { tipo_venta: true },
            });
            const etapaPedido = etapaRequeridaParaTipoVenta(lista?.tipo_venta);
            if (etapaPedido && etapaPedido !== resuelto.config.etapaOrigen) {
              const err = new Error(
                `El pedido no corresponde a movimiento '${rawTipo}' (etapa esperada: ${resuelto.config.etapaOrigen})`,
              );
              err.code = "VALIDACION";
              throw err;
            }
          }
          const { siembraId } = await registrarVentaDesdeListaEspera(tx, {
            listaEsperaId,
            piletaOrigenId,
            usuarioId,
            observacion,
            fechaMovimiento,
          });
          return siembraId;
        }

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
