import prisma from "../prisma.js";
import {
  serializePileta,
  serializeTrazaAlevinaje,
} from "../utils/serializers.js";
import { resolverUbicacion, resolverOCrearUbicacion } from "../utils/ubicacion.js";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const REGEX_ENTERO = /^\d+$/;
const REGEX_DECIMAL = /^\d+(\.\d+)?$/;

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toBigIntSafe(value) {
  if (value === undefined || value === null || value === "") return 0n;
  if (typeof value === "bigint") return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return 0n;
  return BigInt(Math.trunc(n));
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

function validarCamposAlevinaje({ cantidad, talla_gr, observacion } = {}) {
  if (cantidad !== undefined && cantidad !== null && cantidad !== "") {
    const str = String(cantidad);
    if (str.length > MAX_NUMERICO) {
      return `La cantidad no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_ENTERO.test(str)) {
      return "La cantidad debe ser un numero entero sin decimales.";
    }
  }
  if (talla_gr !== undefined && talla_gr !== null && talla_gr !== "") {
    const str = String(talla_gr);
    if (str.length > MAX_NUMERICO) {
      return `La talla no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_DECIMAL.test(str)) {
      return "La talla debe ser un numero valido (permite decimales).";
    }
  }
  if (observacion && String(observacion).length > MAX_OBSERVACION) {
    return `La observacion no puede superar los ${MAX_OBSERVACION} caracteres.`;
  }
  return null;
}

/**
 * Persiste la observacion (texto libre) como registro en `observaciones`
 * y regresa su id. Mantiene compatibilidad con la API previa que enviaba
 * `observacion` como texto plano.
 */
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

class PiletaController {
  static async getOrigen(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const lotes = await prisma.lote.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { instalacion: true },
        orderBy: { instalacion: { nombreInstalacion: "asc" } },
      });
      const result = lotes
        .filter((l) => l.instalacion)
        .map((l) => ({
          fi_instalacion_id: l.instalacionId,
          nombre_instalacion: l.instalacion.nombreInstalacion,
          fi_lote_id: l.loteId,
          no_lote: l.noLote,
          alevines_inicial: l.alevinesInicial,
        }));
      res.json(result);
    } catch (err) {
      console.error("Error origen instalaciones:", err);
      res.status(500).json({ error: "Error obteniendo instalaciones" });
    }
  }

  static async getDestino(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const instalaciones = await prisma.instalacion.findMany({
        where: {
          ubicacionId: ubicacion.ubicacionId,
          estado: { equals: "vacia", mode: "insensitive" },
        },
        orderBy: { nombreInstalacion: "asc" },
      });
      res.json(
        instalaciones.map((i) => ({
          fi_instalacion_id: i.instalacionId,
          nombre_instalacion: i.nombreInstalacion,
        }))
      );
    } catch (err) {
      console.error("Error destino instalaciones:", err);
      res.status(500).json({ error: "Error obteniendo destino" });
    }
  }

  static async getLotes(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const lotes = await prisma.lote.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { instalacion: true },
        orderBy: { noLote: "asc" },
      });
      const ahora = Date.now();
      res.json(
        lotes.map((l) => {
          const fecha = l.fecha ? new Date(l.fecha) : null;
          const diasEnLote = fecha
            ? Math.floor((ahora - fecha.getTime()) / (1000 * 60 * 60 * 24))
            : null;
          return {
            fi_lote_id: l.loteId,
            no_lote: l.noLote,
            alevines_inicial: l.alevinesInicial,
            fecha: l.fecha,
            fi_instalacion_id: l.instalacionId,
            origen_instalacion: l.instalacion?.nombreInstalacion ?? null,
            dias_en_lote: diasEnLote,
          };
        })
      );
    } catch (err) {
      console.error("Error lotes:", err);
      res.status(500).json({ error: "Error cargando lotes" });
    }
  }

  static async getInventario(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const piletas = await prisma.pileta.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { instalacion: true, lote: true, observacion: true, ubicacion: true },
        orderBy: { piletaId: "desc" },
      });

      const ahora = Date.now();
      const dia = 1000 * 60 * 60 * 24;
      const result = piletas.map((p) => {
        const fSiembra = p.fechaSiembra ? new Date(p.fechaSiembra) : null;
        const fBio = p.fechaUltimaBiometria ? new Date(p.fechaUltimaBiometria) : null;
        const diasEnPila = fSiembra ? Math.floor((ahora - fSiembra.getTime()) / dia) : null;
        const diasTranscurridos = fBio ? Math.floor((ahora - fBio.getTime()) / dia) : null;

        let etapaHormonal = p.observacion?.observacion ?? null;
        if (diasEnPila !== null) {
          if (diasEnPila >= 1 && diasEnPila <= 10) etapaHormonal = "Hormonado etapa 1";
          else if (diasEnPila >= 11 && diasEnPila <= 20) etapaHormonal = "Hormonado etapa 2";
        }

        return {
          fi_pileta_id: p.piletaId,
          cantidad: Number(p.cantidad),
          talla_gr: p.tallaGr,
          fi_lote_id: p.loteId,
          no_lote: p.lote?.noLote ?? null,
          fecha_siembra: p.fechaSiembra,
          fecha_ultima_biometria: p.fechaUltimaBiometria,
          dias_en_pila: diasEnPila,
          dias_transcurridos: diasTranscurridos,
          nombre_instalacion: p.instalacion?.nombreInstalacion ?? "-",
          etapa_hormonal: etapaHormonal,
        };
      });
      res.json(result);
    } catch (err) {
      console.error("Error inventario:", err);
      res.status(500).json({ error: "Error cargando inventario" });
    }
  }

  static async getLotePorInst(req, res) {
    try {
      const instalacionId = toInt(req.params.inst);
      if (!instalacionId) return res.json(null);
      const lote = await prisma.lote.findFirst({
        where: { instalacionId },
        orderBy: { loteId: "desc" },
        select: { loteId: true, noLote: true, alevinesInicial: true },
      });
      if (!lote) return res.json(null);
      res.json({
        fi_lote_id: lote.loteId,
        no_lote: lote.noLote,
        alevines_inicial: lote.alevinesInicial,
      });
    } catch (err) {
      console.error("Error lote segun instalacion:", err);
      res.status(500).json({ error: "Error obteniendo lote" });
    }
  }

  static async siembra(req, res) {
    try {
      const error = validarCamposAlevinaje(req.body);
      if (error) return res.status(400).json({ error });

      const usuarioId = req.user.usuario_id;
      const piletaId = toInt(pick(req.body, "fi_pileta_id", "pileta_id"));
      const instalacionId = toInt(pick(req.body, "fi_instalacion_id", "instalacion_id"));
      const loteId = toInt(pick(req.body, "fi_lote_id", "lote_id"));
      const cantidad = toBigIntSafe(req.body.cantidad);
      const tallaGr = toDecimal(req.body.talla_gr);
      const fechaSiembra = toDateOrNull(pick(req.body, "fecha_siembra", "fd_fecha_siembra"));
      const fechaUltimaBiometria = toDateOrNull(
        pick(req.body, "fecha_ultima_biometria", "fd_fecha_ultima_biometria")
      );
      const observacionTexto = pick(req.body, "observacion");
      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");

      if (piletaId) {
        const updated = await prisma.$transaction(async (tx) => {
          const updateData = {};
          if (instalacionId !== null) updateData.instalacionId = instalacionId;
          if (loteId !== null) updateData.loteId = loteId;
          if (req.body.cantidad !== undefined) updateData.cantidad = cantidad;
          if (tallaGr !== null) updateData.tallaGr = tallaGr;
          if (fechaSiembra) updateData.fechaSiembra = fechaSiembra;
          if (fechaUltimaBiometria) updateData.fechaUltimaBiometria = fechaUltimaBiometria;
          if (observacionTexto !== undefined) {
            const obsId = await crearObservacionSiHay(tx, observacionTexto, usuarioId);
            if (obsId) updateData.observacionId = obsId;
          }
          return tx.pileta.update({
            where: { piletaId },
            data: updateData,
            include: { instalacion: true, lote: true, observacion: true, ubicacion: true },
          });
        });
        return res.json({
          success: true,
          message: "Siembra actualizada correctamente",
          data: serializePileta(updated),
        });
      }

      if (!instalacionId) {
        return res.status(400).json({ error: "fi_instalacion_id es obligatorio" });
      }

      const ubicacion = await resolverOCrearUbicacion(granjaInput);
      if (!ubicacion) {
        return res.status(400).json({ error: "granja/ubicacion invalida" });
      }

      const creada = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, observacionTexto, usuarioId);
        const nueva = await tx.pileta.create({
          data: {
            instalacionId,
            loteId: loteId ?? null,
            cantidad,
            tallaGr,
            fechaSiembra: fechaSiembra ?? new Date(),
            fechaUltimaBiometria: fechaUltimaBiometria ?? new Date(),
            ubicacionId: ubicacion.ubicacionId,
            usuarioId,
            observacionId: obsId,
          },
          include: { instalacion: true, lote: true, observacion: true, ubicacion: true },
        });
        await tx.instalacion.update({
          where: { instalacionId },
          data: { estado: "ocupada" },
        });
        return nueva;
      });

      res.status(201).json({
        success: true,
        message: "Siembra registrada correctamente",
        data: serializePileta(creada),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Esa instalacion ya tiene una pileta asignada" });
      }
      console.error("Error siembra:", err);
      res.status(500).json({ error: "Error registrando siembra" });
    }
  }

  static async delete(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.pileta.findUnique({
        where: { piletaId: id },
        select: {
          piletaId: true,
          cantidad: true,
          loteId: true,
          instalacionId: true,
        },
      });
      if (!prev) return res.status(404).json({ error: "La pileta no existe" });

      const cantidadDevolver = Number(prev.cantidad);

      await prisma.$transaction(async (tx) => {
        if (prev.loteId && cantidadDevolver > 0) {
          await tx.lote.update({
            where: { loteId: prev.loteId },
            data: { alevinesInicial: { increment: cantidadDevolver } },
          });
        }

        await tx.trazaAlevinaje.deleteMany({
          where: {
            OR: [
              { piletaOrigen: id },
              { piletaDestino: id },
              ...(prev.instalacionId
                ? [
                    { instalacionOrigen: prev.instalacionId },
                    { instalacionDestino: prev.instalacionId },
                  ]
                : []),
            ],
          },
        });

        await tx.pileta.delete({ where: { piletaId: id } });

        if (prev.instalacionId) {
          const restantes = await tx.pileta.aggregate({
            where: { instalacionId: prev.instalacionId },
            _sum: { cantidad: true },
          });
          const total = restantes._sum.cantidad ? Number(restantes._sum.cantidad) : 0;
          if (total === 0) {
            await tx.instalacion.update({
              where: { instalacionId: prev.instalacionId },
              data: { estado: "vacia" },
            });
          }
        }
      });

      res.json({ success: true, message: "Pileta eliminada correctamente" });
    } catch (err) {
      console.error("Error eliminando pileta:", err);
      res.status(500).json({ error: "Error eliminando pileta" });
    }
  }

  static async registrarMovimiento(req, res) {
    try {
      const error = validarCamposAlevinaje(req.body);
      if (error) return res.status(400).json({ error });

      const usuarioId = req.user.usuario_id;
      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      const ubicacion = await resolverOCrearUbicacion(granjaInput);
      if (!ubicacion) {
        return res.status(400).json({ error: "granja/ubicacion invalida" });
      }

      const origenInstalacionId = toInt(req.body.origen_instalacion);
      const origenExterno = req.body.origen_externo ? String(req.body.origen_externo) : null;
      const destinoId = toInt(pick(req.body, "fi_instalacion_id", "instalacion_id"));
      const loteId = toInt(req.body.fi_lote_id);
      const tipoMovimiento = String(req.body.tipo_movimiento || "TRASLADO").toUpperCase();
      const cantidad = toBigIntSafe(req.body.cantidad);
      const cantidadNum = Number(cantidad);
      const tallaGr = toDecimal(req.body.talla_gr);
      const observacionTexto = pick(req.body, "observacion");

      if (origenInstalacionId && origenExterno) {
        return res.status(400).json({
          error: "No puede existir origen interno y externo al mismo tiempo.",
        });
      }
      if (!origenInstalacionId && !origenExterno && tipoMovimiento !== "MORTALIDAD") {
        return res.status(400).json({ error: "Debe existir un origen valido." });
      }
      if (origenInstalacionId && destinoId && origenInstalacionId === destinoId) {
        return res.status(400).json({
          error: "Origen y destino no pueden ser la misma instalacion.",
        });
      }

      const movimientoId = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, observacionTexto, usuarioId);

        let piletaOrigenId = null;
        let piletaDestinoId = null;

        if (origenInstalacionId) {
          const origen = await tx.pileta.findFirst({
            where: { instalacionId: origenInstalacionId },
            select: { piletaId: true },
          });
          if (origen) piletaOrigenId = origen.piletaId;
        }

        if (destinoId) {
          const destino = await tx.pileta.findFirst({
            where: { instalacionId: destinoId },
            select: { piletaId: true },
          });

          if (destino) {
            piletaDestinoId = destino.piletaId;
            if (tipoMovimiento === "TRASLADO") {
              await tx.pileta.update({
                where: { piletaId: destino.piletaId },
                data: { cantidad: { increment: cantidad } },
              });
            }
          } else if (tipoMovimiento === "TRASLADO" || tipoMovimiento === "SIEMBRA") {
            const nueva = await tx.pileta.create({
              data: {
                instalacionId: destinoId,
                loteId: loteId ?? null,
                cantidad,
                tallaGr: tallaGr ?? 0,
                fechaSiembra:
                  toDateOrNull(pick(req.body, "fecha_siembra", "fd_fecha_siembra")) ?? new Date(),
                fechaUltimaBiometria:
                  toDateOrNull(
                    pick(req.body, "fecha_ultima_biometria", "fd_fecha_ultima_biometria")
                  ) ?? new Date(),
                ubicacionId: ubicacion.ubicacionId,
                usuarioId,
                observacionId: obsId,
              },
            });
            piletaDestinoId = nueva.piletaId;
          }

          if (tipoMovimiento === "TRASLADO" || tipoMovimiento === "SIEMBRA") {
            await tx.instalacion.update({
              where: { instalacionId: destinoId },
              data: { estado: "ocupada" },
            });
          }
        }

        if (piletaOrigenId && cantidadNum > 0) {
          await tx.pileta.update({
            where: { piletaId: piletaOrigenId },
            data: { cantidad: { decrement: cantidad } },
          });
        }

        const traza = await tx.trazaAlevinaje.create({
          data: {
            piletaOrigen: piletaOrigenId,
            piletaDestino: piletaDestinoId,
            instalacionOrigen: origenInstalacionId ?? null,
            instalacionDestino: destinoId ?? null,
            origenExterno,
            tipoMovimiento,
            cantidad,
            ubicacionId: ubicacion.ubicacionId,
            usuarioId,
            loteId: loteId ?? null,
            observacionId: obsId,
            fechaMovimiento: new Date(),
          },
        });

        if (loteId && cantidadNum > 0 && tipoMovimiento !== "MORTALIDAD") {
          // Mantiene el comportamiento previo: el lote queda con el remanente
          // tras la siembra reciente.
          await tx.lote.update({
            where: { loteId },
            data: { alevinesInicial: cantidadNum },
          });
        }

        return traza.movimientoId;
      });

      res.json({
        success: true,
        movimiento_id: movimientoId,
        message: "Movimiento registrado correctamente",
      });
    } catch (err) {
      console.error("Error registrando movimiento:", err);
      res.status(400).json({ error: err.message });
    }
  }

  static async getMovimientos(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      const usuarioId = toInt(req.params.usuario);
      if (!ubicacion || !usuarioId) return res.json([]);

      const movimientos = await prisma.trazaAlevinaje.findMany({
        where: {
          ubicacionId: ubicacion.ubicacionId,
          usuarioId,
        },
        include: {
          instalacionOrig: true,
          instalacionDest: true,
          observacion: true,
        },
        orderBy: { fechaMovimiento: "desc" },
      });
      res.json(movimientos.map(serializeTrazaAlevinaje));
    } catch (err) {
      console.error("Error obteniendo movimientos:", err);
      res.status(500).json({ error: "Error obteniendo movimientos" });
    }
  }

  static async getMovimientosFiltro(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      const usuarioId = toInt(req.params.usuario);
      if (!ubicacion || !usuarioId) return res.json([]);

      const { buscar = "", fecha_inicio = "", fecha_fin = "" } = req.query;
      const where = {
        ubicacionId: ubicacion.ubicacionId,
        usuarioId,
      };
      if (buscar) {
        where.OR = [
          { instalacionOrig: { nombreInstalacion: { contains: buscar, mode: "insensitive" } } },
          { instalacionDest: { nombreInstalacion: { contains: buscar, mode: "insensitive" } } },
          { observacion: { observacion: { contains: buscar, mode: "insensitive" } } },
          { origenExterno: { contains: buscar, mode: "insensitive" } },
        ];
      }
      const inicio = toDateOrNull(fecha_inicio);
      const fin = toDateOrNull(fecha_fin);
      if (inicio || fin) {
        where.fechaMovimiento = {};
        if (inicio) where.fechaMovimiento.gte = inicio;
        if (fin) where.fechaMovimiento.lte = fin;
      }

      const movimientos = await prisma.trazaAlevinaje.findMany({
        where,
        include: { instalacionOrig: true, instalacionDest: true, observacion: true },
        orderBy: { fechaMovimiento: "desc" },
      });
      res.json(movimientos.map(serializeTrazaAlevinaje));
    } catch (err) {
      console.error("Error filtrando movimientos:", err);
      res.status(500).json({ error: "Error en filtrado" });
    }
  }

  static async eliminarMovimientos(req, res) {
    try {
      const { movimiento_id, eliminar_todos } = req.body;
      const granjaInput = pick(req.body, "granja", "fc_granja", "ubicacion_id", "ubicacionId");

      if (eliminar_todos && granjaInput) {
        const ubicacion = await resolverUbicacion(granjaInput);
        if (!ubicacion) return res.status(400).json({ error: "granja/ubicacion invalida" });
        const result = await prisma.trazaAlevinaje.deleteMany({
          where: { ubicacionId: ubicacion.ubicacionId },
        });
        return res.json({ success: true, eliminados: result.count });
      }

      const movId = toInt(movimiento_id);
      if (movId) {
        await prisma.trazaAlevinaje.delete({ where: { movimientoId: movId } });
        return res.json({ success: true });
      }

      res.status(400).json({ error: "Solicitud invalida" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }
      console.error("Error eliminando movimiento:", err);
      res.status(500).json({ error: "Error eliminando movimiento" });
    }
  }
}

export default PiletaController;
